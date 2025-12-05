import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { z } from "zod";
import {
  createPost,
  fetchPostCount,
  like,
  quote,
  readBatch,
  readPost,
  retweet,
  extractPostIdFromReceipt,
} from "./contract";
import { ApiResponse, Post } from "./types";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const MAX_LEN = 280;

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

function respond<T>(res: express.Response, payload: ApiResponse<T>) {
  return res.status(payload.success ? 200 : 400).json(payload);
}

const tweetSchema = z.object({
  text: z.string().min(1).max(MAX_LEN),
  user: z.string().length(42),
});

const likeSchema = z.object({
  postId: z.number().int().positive(),
  user: z.string().length(42),
});

app.post("/api/tweet", async (req, res) => {
  const parsed = tweetSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await createPost(parsed.data.user, parsed.data.text);
    const postId = extractPostIdFromReceipt(receipt);
    return respond(res, {
      success: true,
      data: {
        txHash: receipt?.hash,
        postId,
      },
    });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to tweet" });
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

app.post("/api/retweet", async (req, res) => {
  const parsed = likeSchema.safeParse(req.body); // same shape: postId, user
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await retweet(parsed.data.user, parsed.data.postId);
    const postId = extractPostIdFromReceipt(receipt);
    return respond(res, { success: true, data: { txHash: receipt?.hash, postId } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to retweet" });
  }
});

const quoteSchema = z.object({
  postId: z.number().int().positive(),
  user: z.string().length(42),
  text: z.string().min(1).max(MAX_LEN),
});

app.post("/api/quote", async (req, res) => {
  const parsed = quoteSchema.safeParse(req.body);
  if (!parsed.success) return respond(res, { success: false, error: parsed.error.message });
  try {
    const receipt = await quote(parsed.data.user, parsed.data.postId, parsed.data.text);
    const postId = extractPostIdFromReceipt(receipt);
    return respond(res, { success: true, data: { txHash: receipt?.hash, postId } });
  } catch (err: any) {
    return respond(res, { success: false, error: err.message || "Failed to quote" });
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

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`PolyX backend listening on http://localhost:${PORT}`);
});


