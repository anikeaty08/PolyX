import { useQuery } from "@tanstack/react-query";
import { api, Post } from "../lib/api";
import { PostCard } from "./PostCard";

export function Feed() {
  const { data, isLoading, error } = useQuery<Post[]>({
    queryKey: ["feed"],
    queryFn: api.feed,
    refetchInterval: 15_000,
  });

  if (isLoading) return <p className="text-white/70">Loading feed…</p>;
  if (error) return <p className="text-red-400">Failed to load feed: {(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      {data && data.length ? data.map((post) => <PostCard key={post.id} post={post} />) : <p>No posts yet.</p>}
    </div>
  );
}


