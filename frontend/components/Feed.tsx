"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, Post } from "../lib/api";
import { PostCard } from "./PostCard";
import { useAccount } from "wagmi";

interface Props {
  mode?: "all" | "following";
  blocked?: string[];
}

export function Feed({ mode = "all", blocked = [] }: Props) {
  const { address } = useAccount();
  const { data, isLoading, error } = useQuery<Post[]>({
    queryKey: ["feed"],
    queryFn: api.feed,
    refetchInterval: 15_000,
  });

  const { data: following } = useQuery<string[]>({
    queryKey: ["following", address],
    queryFn: () => (address ? api.following(address) : Promise.resolve([])),
    enabled: Boolean(address),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const blockedSet = new Set(blocked.map((b) => b.toLowerCase()));
    const followSet = new Set((following || []).map((f) => f.toLowerCase()));
    return data.filter((post) => {
      if (blockedSet.has(post.author.toLowerCase())) return false;
      if (mode === "following" && !followSet.has(post.author.toLowerCase())) return false;
      return true;
    });
  }, [data, following, mode, blocked]);

  if (isLoading) return <p className="text-white/70">Loading feed…</p>;
  if (error) return <p className="text-red-400">Failed to load feed: {(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      {filtered && filtered.length ? (
        filtered.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <p>{mode === "following" ? "No posts from following yet." : "No posts yet."}</p>
      )}
    </div>
  );
}

