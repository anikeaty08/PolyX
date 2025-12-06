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
  follow,
  getFollowing,
  getProfileByHandle,
  getProfileByOwner,
  handleAvailable,
  like,
  readBatch,
  readPost,
  unfollow,
  updateProfile,
} from "./contract";
import { ApiResponse, Post, Profile, PostTypeEnum } from "./types";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const MAX_LEN = 280;
const PINATA_JWT = process.env.PINATA_JWT || "";
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

function respond<T>(res: express.Response, payload: ApiResponse<T>) {
  return res.status(payload.success ? 200 : 400).json(payload);
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
  try {
    const available = await handleAvailable(req.params.handle);
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

app.post("/api/comment", async (req, res) => {
  const parsed = referenceSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await createPost(
      parsed.data.user,
      parsed.data.text,
      parsed.data.mediaCid,
      PostTypeEnum.Comment,
      parsed.data.postId
    );
    const postId = extractPostIdFromReceipt(receipt);
    return respond(res, { success: true, data: { txHash: receipt?.hash, postId } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to comment" });
  }
});

app.post("/api/retweet", async (req, res) => {
  const parsed = likeSchema.safeParse(req.body); // same shape: postId, user
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await createPost(parsed.data.user, "", "", PostTypeEnum.Retweet, parsed.data.postId);
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
    const receipt = await createPost(
      parsed.data.user,
      parsed.data.text,
      parsed.data.mediaCid,
      PostTypeEnum.Quote,
      parsed.data.postId
    );
    const postId = extractPostIdFromReceipt(receipt);
    return respond(res, { success: true, data: { txHash: receipt?.hash, postId } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to quote" });
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
    return respond(res, { success: false, error: err.message || "Failed to edit post" });
  }
});

app.post("/api/delete", async (req, res) => {
  const parsed = deleteSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await deletePost(parsed.data.user, parsed.data.postId);
    return respond(res, { success: true, data: { txHash: receipt?.hash } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to delete post" });
  }
});

app.get("/api/post/:id", async (req, res) => {
  const postId = Number(req.params.id);
  if (!Number.isInteger(postId) || postId <= 0) {
    return respond(res, { success: false, error: "Invalid post id" });
  }
  try {
    const post = await readPost(postId);
    return respond<Post>(res, { success: true, data: post });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to fetch post" });
  }
});

app.get("/api/feed", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  try {
    const nextId = await fetchPostCount();
    const ids: number[] = [];
    for (let id = nextId - 1; id > 0 && ids.length < limit; id--) {
      ids.push(id);
    }
    const posts = await readBatch(ids);
    posts.sort((a, b) => b.id - a.id);
    return respond<Post[]>(res, { success: true, data: posts });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to fetch feed" });
  }
});

app.post("/api/upload", async (req, res) => {
  if (!PINATA_JWT) return respond(res, { success: false, error: "Pinata JWT missing on server" });
  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const buffer = Buffer.from(parsed.data.dataBase64, "base64");
    const form = new FormData();
    form.append("file", new Blob([buffer], { type: parsed.data.contentType }), parsed.data.filename);
    const resp = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: form,
    });
    const json = (await resp.json()) as any;
    if (!resp.ok) {
      throw new Error(json?.error || "Pinata upload failed");
    }
    const cid = json.IpfsHash as string;
    const url = `${PINATA_GATEWAY}/ipfs/${cid}`;
    return respond(res, { success: true, data: { cid, url } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to upload to Pinata" });
  }
});

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

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`PolyX backend listening on http://localhost:${PORT}`);
});


