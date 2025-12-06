import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { api, Post } from "../lib/api";
import { PostCard } from "./PostCard";

interface FeedProps {
  mode?: "all" | "following";
  blocked?: string[];
}

export function Feed({ mode = "all", blocked = [] }: FeedProps) {
  const { address } = useAccount();

  const { data: allPosts, isLoading: isLoadingAll } = useQuery<Post[]>({
    queryKey: ["feed"],
    queryFn: api.feed,
    refetchInterval: 15_000,
  });

  const { data: following, isLoading: isLoadingFollowing } = useQuery<string[]>({
    queryKey: ["following", address],
    queryFn: () => (address ? api.following(address) : Promise.resolve([])),
    enabled: mode === "following" && !!address,
    refetchInterval: 15_000,
  });

  const isLoading = isLoadingAll || (mode === "following" && isLoadingFollowing);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-2xl p-4 space-y-3 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/4" />
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!allPosts || allPosts.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-white/70 text-lg">No posts yet. Be the first to post!</p>
      </div>
    );
  }

  // Filter blocked users
  let filteredPosts = allPosts.filter((post) => !blocked.includes(post.author.toLowerCase()));

  // Filter by following if mode is "following"
  if (mode === "following" && following && following.length > 0) {
    const followingLower = following.map((addr) => addr.toLowerCase());
    filteredPosts = filteredPosts.filter((post) => followingLower.includes(post.author.toLowerCase()));
  } else if (mode === "following" && (!following || following.length === 0)) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-white/70 text-lg">You're not following anyone yet. Follow users to see their posts here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-white/70 text-lg">No posts to display.</p>
        </div>
      )}
    </div>
  );
}
