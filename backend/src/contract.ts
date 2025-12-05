import { ethers } from "ethers";
import { z } from "zod";
import { Post } from "./types";

const polyxAbi = [
  "function nextPostId() view returns (uint256)",
  "function getPost(uint256 postId) view returns (tuple(uint256 id,address author,string content,uint256 timestamp,uint8 postType,uint256 referenceId,uint256 likeCount,uint256 retweetCount,uint256 quoteCount))",
  "function batchGetPosts(uint256[] ids) view returns (tuple(uint256 id,address author,string content,uint256 timestamp,uint8 postType,uint256 referenceId,uint256 likeCount,uint256 retweetCount,uint256 quoteCount)[])",
  "function createPost(address logicalUser,string content) returns (uint256)",
  "function like(address logicalUser,uint256 postId)",
  "function retweet(address logicalUser,uint256 originalId) returns (uint256)",
  "function quote(address logicalUser,uint256 originalId,string content) returns (uint256)",
  "event PostCreated(uint256 indexed id,address indexed author,uint8 indexed postType,uint256 referenceId,string content,uint256 timestamp)"
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

export async function createPost(logicalUser: string, content: string) {
  const tx = await contract.createPost(logicalUser, content);
  return tx.wait();
}

export async function like(logicalUser: string, postId: number) {
  const tx = await contract.like(logicalUser, postId);
  return tx.wait();
}

export async function retweet(logicalUser: string, postId: number) {
  const tx = await contract.retweet(logicalUser, postId);
  return tx.wait();
}

export async function quote(logicalUser: string, postId: number, content: string) {
  const tx = await contract.quote(logicalUser, postId, content);
  return tx.wait();
}

function mapPost(raw: any): Post {
  return {
    id: Number(raw.id),
    author: raw.author,
    content: raw.content,
    timestamp: Number(raw.timestamp) * 1000,
    postType: raw.postType,
    referenceId: Number(raw.referenceId),
    likeCount: Number(raw.likeCount),
    retweetCount: Number(raw.retweetCount),
    quoteCount: Number(raw.quoteCount),
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

