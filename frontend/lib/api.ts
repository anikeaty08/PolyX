export type PostType = 0 | 1 | 2;

export interface Post {
  id: number;
  author: string;
  content: string;
  timestamp: number;
  postType: PostType;
  referenceId: number;
  likeCount: number;
  retweetCount: number;
  quoteCount: number;
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Request failed");
  }
  return json.data as T;
}

export const api = {
  feed: () => request<Post[]>("/api/feed"),
  post: (id: number) => request<Post>(`/api/post/${id}`),
  tweet: (user: string, text: string) =>
    request<{ txHash: string; postId?: number }>("/api/tweet", {
      method: "POST",
      body: JSON.stringify({ user, text }),
    }),
  like: (user: string, postId: number) =>
    request<{ txHash: string }>("/api/like", {
      method: "POST",
      body: JSON.stringify({ user, postId }),
    }),
  retweet: (user: string, postId: number) =>
    request<{ txHash: string; postId?: number }>("/api/retweet", {
      method: "POST",
      body: JSON.stringify({ user, postId }),
    }),
  quote: (user: string, postId: number, text: string) =>
    request<{ txHash: string; postId?: number }>("/api/quote", {
      method: "POST",
      body: JSON.stringify({ user, postId, text }),
    }),
};

