import { ethers } from "ethers";
import { z } from "zod";
import { Post, PostType, Profile } from "./types";

const polyxAbi = [
  "function nextPostId() view returns (uint256)",
  "function getPost(uint256 postId) view returns (tuple(uint256 id,address author,string content,string mediaCid,uint256 timestamp,uint8 postType,uint256 referenceId,uint256 likeCount,uint256 retweetCount,uint256 quoteCount,uint256 commentCount,uint256 version,bool deleted))",
  "function batchGetPosts(uint256[] ids) view returns (tuple(uint256 id,address author,string content,string mediaCid,uint256 timestamp,uint8 postType,uint256 referenceId,uint256 likeCount,uint256 retweetCount,uint256 quoteCount,uint256 commentCount,uint256 version,bool deleted)[])",
  "function createPost(address logicalUser,string content,string mediaCid,uint8 postType,uint256 referenceId) returns (uint256)",
  "function like(address logicalUser,uint256 postId)",
  "function editPost(address logicalUser,uint256 postId,string content,string mediaCid)",
  "function deletePost(address logicalUser,uint256 postId)",
  "function createProfile(address logicalUser,string handle,string displayName,string bio,string avatarCid,string headerCid)",
  "function updateProfile(address logicalUser,string displayName,string bio,string avatarCid,string headerCid)",
  "function getProfileByOwner(address owner) view returns (tuple(string handle,string displayName,string bio,string avatarCid,string headerCid,address owner,uint256 createdAt))",
  "function getProfileByHandle(string handle) view returns (tuple(string handle,string displayName,string bio,string avatarCid,string headerCid,address owner,uint256 createdAt))",
  "function handleAvailable(string handle) view returns (bool)",
  "function follow(address follower,address target)",
  "function unfollow(address follower,address target)",
  "function getFollowing(address follower) view returns (address[])",
  "function isFollowingAddress(address follower,address target) view returns (bool)",
  "function anchorChatMessage(address logicalUser,address to,string cid,string cidHash)",
  "event PostCreated(uint256 indexed id,address indexed author,uint8 indexed postType,uint256 referenceId,string content,string mediaCid,uint256 timestamp)"
];

export const envSchema = z.object({
  AMOY_RPC_URL: z.string().url(),
  SPONSOR_PRIVATE_KEY: z.string().min(10),
  POLYX_CONTRACT_ADDRESS: z.string().length(42),
});

const parsed = envSchema.parse(process.env);

const provider = new ethers.JsonRpcProvider(parsed.AMOY_RPC_URL);
const signer = new ethers.Wallet(parsed.SPONSOR_PRIVATE_KEY, provider);
const contract = new ethers.Contract(parsed.POLYX_CONTRACT_ADDRESS, polyxAbi, signer);

export async function fetchPostCount(): Promise<number> {
  const next = await contract.nextPostId();
  return Number(next);
}

export async function readPost(id: number): Promise<Post> {
  const raw = await contract.getPost(id);
  return mapPost(raw);
}

export async function readBatch(ids: number[]): Promise<Post[]> {
  if (ids.length === 0) return [];
  const raw = await contract.batchGetPosts(ids);
  return raw.map(mapPost);
}

export async function createPost(logicalUser: string, content: string, mediaCid: string, postType: PostType, referenceId: number) {
  const tx = await contract.createPost(logicalUser, content, mediaCid, postType, referenceId);
  return tx.wait();
}

export async function like(logicalUser: string, postId: number) {
  const tx = await contract.like(logicalUser, postId);
  return tx.wait();
}

export async function editPost(logicalUser: string, postId: number, content: string, mediaCid: string) {
  const tx = await contract.editPost(logicalUser, postId, content, mediaCid);
  return tx.wait();
}

export async function deletePost(logicalUser: string, postId: number) {
  const tx = await contract.deletePost(logicalUser, postId);
  return tx.wait();
}

export async function createProfile(
  logicalUser: string,
  handle: string,
  displayName: string,
  bio: string,
  avatarCid: string,
  headerCid: string
) {
  const tx = await contract.createProfile(logicalUser, handle, displayName, bio, avatarCid, headerCid);
  return tx.wait();
}

export async function updateProfile(
  logicalUser: string,
  displayName: string,
  bio: string,
  avatarCid: string,
  headerCid: string
) {
  const tx = await contract.updateProfile(logicalUser, displayName, bio, avatarCid, headerCid);
  return tx.wait();
}

export async function getProfileByOwner(owner: string): Promise<Profile> {
  const raw = await contract.getProfileByOwner(owner);
  return mapProfile(raw);
}

export async function getProfileByHandle(handle: string): Promise<Profile> {
  const raw = await contract.getProfileByHandle(handle);
  return mapProfile(raw);
}

export async function handleAvailable(handle: string): Promise<boolean> {
  return contract.handleAvailable(handle);
}

export async function follow(follower: string, target: string) {
  const tx = await contract.follow(follower, target);
  return tx.wait();
}

export async function unfollow(follower: string, target: string) {
  const tx = await contract.unfollow(follower, target);
  return tx.wait();
}

export async function getFollowing(follower: string): Promise<string[]> {
  return contract.getFollowing(follower);
}

export async function anchorChatMessage(logicalUser: string, to: string, cid: string, cidHash: string) {
  const tx = await contract.anchorChatMessage(logicalUser, to, cid, cidHash);
  return tx.wait();
}

function mapPost(raw: any): Post {
  return {
    id: Number(raw.id),
    author: raw.author,
    content: raw.content,
    mediaCid: raw.mediaCid,
    timestamp: Number(raw.timestamp) * 1000,
    postType: Number(raw.postType) as PostType,
    referenceId: Number(raw.referenceId),
    likeCount: Number(raw.likeCount),
    retweetCount: Number(raw.retweetCount),
    quoteCount: Number(raw.quoteCount),
    commentCount: Number(raw.commentCount),
    version: Number(raw.version),
    deleted: Boolean(raw.deleted),
  };
}

function mapProfile(raw: any): Profile {
  return {
    handle: raw.handle,
    displayName: raw.displayName,
    bio: raw.bio,
    avatarCid: raw.avatarCid,
    headerCid: raw.headerCid,
    owner: raw.owner,
    createdAt: Number(raw.createdAt) * 1000,
  };
}

export function extractPostIdFromReceipt(receipt: ethers.ContractTransactionReceipt | null): number | undefined {
  if (!receipt) return undefined;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
      if (parsed && parsed.name === "PostCreated") {
        return Number(parsed.args?.id);
      }
    } catch {
      continue;
    }
  }
  return undefined;
}


