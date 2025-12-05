export type PostType = 0 | 1 | 2; // Original, Retweet, Quote

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

