import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { z } from "zod";
import { Blob } from "buffer";
import {
  anchorChatMessage,
  createPost,
  createProfile,
  deletePost,
  editPost,
  extractPostIdFromReceipt,
  fetchPostCount,
  getChatMessages,
  getFollowers,
  getFollowing,
  hasLiked,
  hasRetweeted,
  getProfileByHandle,
  getProfileByOwner,
  handleAvailable,
  like,
  readBatch,
  readPost,
  retweet,
  quote,
  comment,
  follow,
  unfollow,
  updateProfile,
  contract,
} from "./contract.js";
import { ApiResponse, Post, Profile, PostTypeEnum } from "./types.js";
import { getConversations, getMessages, sendMessage, deleteMessage, clearChat, blockUser, unblockUser, isBlocked, getBlockedUsers } from "./supabase.js";

const app = express();
const PORT = process.env.PORT || 3001;
const MAX_LEN = 280;

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));

function respond<T>(res: express.Response, payload: ApiResponse<T>) {
  if (payload.success) {
    return res.json(payload);
  }
  return res.status(400).json(payload);
}

const address = z.string().length(42);
const mediaSchema = z.object({
  cid: z.string().optional().default(""),
});

const tweetSchema = z.object({
  text: z.string().min(1).max(MAX_LEN),
  mediaCid: z.string().optional().default(""),
  user: address,
});

const likeSchema = z.object({
  postId: z.number().int().positive(),
  user: address,
});

const referenceSchema = z.object({
  postId: z.number().int().positive(),
  user: address,
  text: z.string().min(1).max(MAX_LEN),
  mediaCid: z.string().optional().default(""),
});

const profileCreateSchema = z.object({
  user: address,
  handle: z.string().min(3).max(30),
  displayName: z.string().min(1).max(60),
  bio: z.string().max(200).optional().default(""),
  avatarCid: z.string().optional().default(""),
  headerCid: z.string().optional().default(""),
});

const profileUpdateSchema = z.object({
  user: address,
  displayName: z.string().min(1).max(60),
  bio: z.string().max(200).optional().default(""),
  avatarCid: z.string().optional().default(""),
  headerCid: z.string().optional().default(""),
});

const followSchema = z.object({
  user: address,
  target: address,
});

const editSchema = z.object({
  user: address,
  postId: z.number().int().positive(),
  text: z.string().min(1).max(MAX_LEN),
  mediaCid: z.string().optional().default(""),
});

const deleteSchema = z.object({
  user: address,
  postId: z.number().int().positive(),
});

const uploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  dataBase64: z.string().min(10),
});

const chatSchema = z.object({
  user: address,
  to: address,
  cid: z.string().min(1),
  cidHash: z.string().min(1),
});

const messageSchema = z.object({
  from: address,
  to: address,
  content: z.string().min(1).max(5000),
});

app.post("/api/profile", async (req, res) => {
  const parsed = profileCreateSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await createProfile(
      parsed.data.user,
      parsed.data.handle,
      parsed.data.displayName,
      parsed.data.bio,
      parsed.data.avatarCid,
      parsed.data.headerCid
    );
    return respond(res, { success: true, data: { txHash: receipt?.hash } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to create profile" });
  }
});

app.patch("/api/profile", async (req, res) => {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await updateProfile(
      parsed.data.user,
      parsed.data.displayName,
      parsed.data.bio,
      parsed.data.avatarCid,
      parsed.data.headerCid
    );
    return respond(res, { success: true, data: { txHash: receipt?.hash } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to update profile" });
  }
});

app.get("/api/profile/handle/:handle", async (req, res) => {
  const handle = req.params.handle;
  try {
    const profile = await getProfileByHandle(handle);
    if (!profile) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }
    return respond<Profile>(res, { success: true, data: profile });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to fetch profile" });
  }
});

app.get("/api/profile/owner/:owner", async (req, res) => {
  const owner = req.params.owner;
  try {
    const profile = await getProfileByOwner(owner);
    if (!profile) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }
    return respond<Profile>(res, { success: true, data: profile });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to fetch profile" });
  }
});

app.get("/api/handle/:handle/available", async (req, res) => {
  const handle = req.params.handle;
  try {
    const available = await handleAvailable(handle);
    return respond(res, { success: true, data: { available } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to check handle" });
  }
});

app.post("/api/follow", async (req, res) => {
  const parsed = followSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await follow(parsed.data.user, parsed.data.target);
    return respond(res, { success: true, data: { txHash: receipt?.hash } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to follow" });
  }
});

app.post("/api/unfollow", async (req, res) => {
  const parsed = followSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await unfollow(parsed.data.user, parsed.data.target);
    return respond(res, { success: true, data: { txHash: receipt?.hash } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to unfollow" });
  }
});

app.get("/api/following/:user", async (req, res) => {
  try {
    const list = await getFollowing(req.params.user);
    return respond(res, { success: true, data: list });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to fetch following" });
  }
});

app.get("/api/followers/:user", async (req, res) => {
  try {
    const list = await getFollowers(req.params.user);
    return respond(res, { success: true, data: list });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to fetch followers" });
  }
});

app.get("/api/post/:id/liked/:user", async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const user = req.params.user;
    if (isNaN(postId) || postId < 1) {
      return respond(res, { success: false, error: "Invalid post ID" });
    }
    const liked = await hasLiked(postId, user);
    return respond(res, { success: true, data: { liked } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to check like status" });
  }
});

app.get("/api/post/:id/retweeted/:user", async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const user = req.params.user;
    if (isNaN(postId) || postId < 1) {
      return respond(res, { success: false, error: "Invalid post ID" });
    }
    const retweeted = await hasRetweeted(postId, user);
    return respond(res, { success: true, data: { retweeted } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to check retweet status" });
  }
});

app.post("/api/tweet", async (req, res) => {
  const parsed = tweetSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await createPost(parsed.data.user, parsed.data.text, parsed.data.mediaCid, PostTypeEnum.Original, 0);
    const postId = extractPostIdFromReceipt(receipt);
    return respond(res, { success: true, data: { txHash: receipt?.hash, postId } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to tweet" });
  }
});

app.post("/api/retweet", async (req, res) => {
  const parsed = likeSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await retweet(parsed.data.user, parsed.data.postId);
    const postId = extractPostIdFromReceipt(receipt);
    return respond(res, { success: true, data: { txHash: receipt?.hash, postId } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to retweet" });
  }
});

app.post("/api/quote", async (req, res) => {
  const parsed = referenceSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await quote(parsed.data.user, parsed.data.postId, parsed.data.text, parsed.data.mediaCid);
    const postId = extractPostIdFromReceipt(receipt);
    return respond(res, { success: true, data: { txHash: receipt?.hash, postId } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to quote" });
  }
});

app.post("/api/comment", async (req, res) => {
  const parsed = referenceSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await comment(parsed.data.user, parsed.data.postId, parsed.data.text, parsed.data.mediaCid);
    const postId = extractPostIdFromReceipt(receipt);
    return respond(res, { success: true, data: { txHash: receipt?.hash, postId } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to comment" });
  }
});

app.post("/api/like", async (req, res) => {
  const parsed = likeSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await like(parsed.data.user, parsed.data.postId);
    return respond(res, { success: true, data: { txHash: receipt?.hash } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to like" });
  }
});

app.post("/api/edit", async (req, res) => {
  const parsed = editSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await editPost(parsed.data.user, parsed.data.postId, parsed.data.text, parsed.data.mediaCid);
    return respond(res, { success: true, data: { txHash: receipt?.hash } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to edit" });
  }
});

app.post("/api/delete", async (req, res) => {
  const parsed = deleteSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await deletePost(parsed.data.user, parsed.data.postId);
    return respond(res, { success: true, data: { txHash: receipt?.hash } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to delete" });
  }
});

app.get("/api/feed", async (_req, res) => {
  try {
    const nextId = await fetchPostCount();
    const allPostIds: number[] = [];
    for (let id = nextId - 1; id > 0; id--) {
      allPostIds.push(id);
    }
    const allPosts = await readBatch(allPostIds);
    const filtered = allPosts.filter((p) => !p.deleted);
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    return respond<Post[]>(res, { success: true, data: filtered });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to fetch feed" });
  }
});

app.get("/api/post/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1) {
      return respond(res, { success: false, error: "Invalid post ID" });
    }
    const post = await readPost(id);
    if (post.deleted) {
      return respond(res, { success: false, error: "Post deleted" });
    }
    return respond<Post>(res, { success: true, data: post });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to fetch post" });
  }
});

app.get("/api/posts/by-author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const nextId = await fetchPostCount();
    const allPostIds: number[] = [];
    for (let id = nextId - 1; id > 0; id--) {
      allPostIds.push(id);
    }
    const allPosts = await readBatch(allPostIds);
    const userPosts = allPosts.filter((post) => post.author.toLowerCase() === author.toLowerCase() && !post.deleted);
    userPosts.sort((a, b) => b.timestamp - a.timestamp);
    return respond<Post[]>(res, { success: true, data: userPosts });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to fetch user posts" });
  }
});

const PINATA_GATEWAY = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud";

app.post("/api/upload", async (req, res) => {
  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const buffer = Buffer.from(parsed.data.dataBase64, "base64");
    const blob = new Blob([buffer], { type: parsed.data.contentType });
    const formData = new FormData();
    formData.append("file", blob, parsed.data.filename);
    const pinataRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: formData,
    });
    if (!pinataRes.ok) {
      throw new Error("Pinata upload failed");
    }
    const pinataData = (await pinataRes.json()) as { IpfsHash: string };
    const cid = pinataData.IpfsHash;
    const url = `${PINATA_GATEWAY}/ipfs/${cid}`;
    return respond(res, { success: true, data: { cid, url } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to upload to Pinata" });
  }
});

// New Supabase-based messaging endpoints
app.post("/api/message/send", async (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const message = await sendMessage(parsed.data.from, parsed.data.to, parsed.data.content);
    return respond(res, { success: true, data: message });
  } catch (err: any) {
    console.error("Send message error:", err);
    return respond(res, { success: false, error: err.message || "Failed to send message" });
  }
});

app.get("/api/conversations/:user", async (req, res) => {
  try {
    const user = req.params.user;
    if (!user || user.length !== 42 || !user.startsWith("0x")) {
      return respond(res, { success: false, error: "Invalid user address" });
    }
    
    const conversations = await getConversations(user);
    
    // Transform to match frontend expectations
    const transformed = conversations.map((conv) => ({
      address: conv.address,
      lastMessage: conv.last_message
        ? {
            from: conv.last_message.from_address,
            to: conv.last_message.to_address,
            content: conv.last_message.content,
            timestamp: new Date(conv.last_message.created_at).getTime(),
            id: conv.last_message.id,
          }
        : undefined,
      unreadCount: conv.unread_count,
    }));
    
    return respond(res, { success: true, data: transformed });
  } catch (err: any) {
    console.error("Conversations error:", err);
    return respond(res, { success: false, error: err.message || "Failed to fetch conversations" });
  }
});

app.get("/api/messages/:user/:other", async (req, res) => {
  try {
    const user = req.params.user;
    const other = req.params.other;
    
    if (!user || user.length !== 42 || !user.startsWith("0x")) {
      return respond(res, { success: false, error: "Invalid user address" });
    }
    if (!other || other.length !== 42 || !other.startsWith("0x")) {
      return respond(res, { success: false, error: "Invalid other address" });
    }
    
    const messages = await getMessages(user, other);
    
    // Transform to match frontend expectations
    const transformed = messages.map((msg) => ({
      from: msg.from_address,
      to: msg.to_address,
      content: msg.content,
      timestamp: new Date(msg.created_at).getTime(),
      id: msg.id,
      deleted: msg.deleted,
      read: msg.read_at ? new Date(msg.read_at).getTime() : null,
    }));
    
    return respond(res, { success: true, data: transformed });
  } catch (err: any) {
    console.error("Messages error:", err);
    return respond(res, { success: false, error: err.message || "Failed to fetch messages" });
  }
});

app.delete("/api/message/:id", async (req, res) => {
  try {
    const messageId = req.params.id;
    const user = req.query.user as string;
    
    if (!user || user.length !== 42 || !user.startsWith("0x")) {
      return respond(res, { success: false, error: "Invalid user address" });
    }
    
    await deleteMessage(messageId, user);
    return respond(res, { success: true, data: { deleted: true } });
  } catch (err: any) {
    console.error("Delete message error:", err);
    return respond(res, { success: false, error: err.message || "Failed to delete message" });
  }
});

app.post("/api/chat/clear", async (req, res) => {
  const parsed = followSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    await clearChat(parsed.data.user, parsed.data.target);
    return respond(res, { success: true, data: { cleared: true } });
  } catch (err: any) {
    console.error("Clear chat error:", err);
    return respond(res, { success: false, error: err.message || "Failed to clear chat" });
  }
});

app.post("/api/block", async (req, res) => {
  const parsed = followSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    await blockUser(parsed.data.user, parsed.data.target);
    return respond(res, { success: true, data: { blocked: true } });
  } catch (err: any) {
    console.error("Block user error:", err);
    return respond(res, { success: false, error: err.message || "Failed to block user" });
  }
});

app.post("/api/unblock", async (req, res) => {
  const parsed = followSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    await unblockUser(parsed.data.user, parsed.data.target);
    return respond(res, { success: true, data: { unblocked: true } });
  } catch (err: any) {
    console.error("Unblock user error:", err);
    return respond(res, { success: false, error: err.message || "Failed to unblock user" });
  }
});

app.get("/api/blocked/:user/:other", async (req, res) => {
  try {
    const user = req.params.user;
    const other = req.params.other;
    
    if (!user || user.length !== 42 || !user.startsWith("0x")) {
      return respond(res, { success: false, error: "Invalid user address" });
    }
    if (!other || other.length !== 42 || !other.startsWith("0x")) {
      return respond(res, { success: false, error: "Invalid other address" });
    }
    
    const blocked = await isBlocked(user, other);
    return respond(res, { success: true, data: { blocked } });
  } catch (err: any) {
    console.error("Check blocked error:", err);
    return respond(res, { success: false, error: err.message || "Failed to check blocked status" });
  }
});

app.get("/api/blocked/:user", async (req, res) => {
  try {
    const user = req.params.user;
    
    if (!user || user.length !== 42 || !user.startsWith("0x")) {
      return respond(res, { success: false, error: "Invalid user address" });
    }
    
    const blocked = await getBlockedUsers(user);
    return respond(res, { success: true, data: blocked });
  } catch (err: any) {
    console.error("Get blocked users error:", err);
    return respond(res, { success: false, error: err.message || "Failed to get blocked users" });
  }
});

// Legacy endpoint for backward compatibility (optional - can be removed)
app.post("/api/chat", async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await anchorChatMessage(parsed.data.user, parsed.data.to, parsed.data.cid, parsed.data.cidHash);
    return respond(res, { success: true, data: { txHash: receipt?.hash } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to anchor chat" });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 2) {
      return respond(res, { success: false, error: "Query must be at least 2 characters" });
    }
    // Simple search - in production, use an indexer
    const results: Profile[] = [];
    // This is a placeholder - implement proper search with indexer
    return respond<Profile[]>(res, { success: true, data: results });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to search" });
  }
});

app.get("/api/notifications/:user", async (req, res) => {
  try {
    const user = req.params.user;
    const fromBlock = 0;
    
    const [likedEvents, quotedEvents, commentedEvents, followedEvents] = await Promise.all([
      contract.queryFilter(contract.filters.Liked(null, user), fromBlock),
      contract.queryFilter(contract.filters.Quoted(null, null, user), fromBlock),
      contract.queryFilter(contract.filters.Commented(null, null, user), fromBlock),
      contract.queryFilter(contract.filters.Followed(null, user), fromBlock),
    ]);
    
    const notifications: Array<{
      type: "like" | "quote" | "comment" | "follow";
      from: string;
      postId?: number;
      timestamp: number;
    }> = [];
    
    for (const event of likedEvents) {
      if (event && "args" in event && event.args) {
        const postId = Number(event.args[0]);
        const from = event.args[1] as string;
        const timestamp = Number(event.args[2]) * 1000;
        try {
          const post = await contract.getPost(postId);
          if (post.author.toLowerCase() === user.toLowerCase() && from.toLowerCase() !== user.toLowerCase()) {
            notifications.push({ type: "like", from, postId, timestamp });
          }
        } catch {}
      }
    }
    
    for (const event of quotedEvents) {
      if (event && "args" in event && event.args) {
        const originalId = Number(event.args[1]);
        const from = event.args[2] as string;
        const timestamp = Number(event.args[5]) * 1000;
        try {
          const post = await contract.getPost(originalId);
          if (post.author.toLowerCase() === user.toLowerCase() && from.toLowerCase() !== user.toLowerCase()) {
            notifications.push({ type: "quote", from, postId: originalId, timestamp });
          }
        } catch {}
      }
    }
    
    for (const event of commentedEvents) {
      if (event && "args" in event && event.args) {
        const originalId = Number(event.args[1]);
        const from = event.args[2] as string;
        const timestamp = Number(event.args[5]) * 1000;
        try {
          const post = await contract.getPost(originalId);
          if (post.author.toLowerCase() === user.toLowerCase() && from.toLowerCase() !== user.toLowerCase()) {
            notifications.push({ type: "comment", from, postId: originalId, timestamp });
          }
        } catch {}
      }
    }
    
    const following = await getFollowing(user);
    const followingLower = following.map(f => f.toLowerCase());
    for (const event of followedEvents) {
      if (event && "args" in event && event.args) {
        const from = event.args[0] as string;
        const timestamp = Date.now();
        if (followingLower.includes(from.toLowerCase())) {
          notifications.push({ type: "follow", from, timestamp });
        }
      }
    }
    
    notifications.sort((a, b) => b.timestamp - a.timestamp);
    
    return respond(res, { success: true, data: notifications });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to fetch notifications" });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`PolyX backend listening on http://localhost:${PORT}`);
});
