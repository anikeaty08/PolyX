import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, Post, Profile } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Composer } from "./Composer";
import classNames from "classnames";
import Link from "next/link";

function formatTime(ts: number) {
  const date = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

function typeLabel(post: Post) {
  if (post.postType === 1) return "Retweet";
  if (post.postType === 2) return "Quote";
  if (post.postType === 3) return "Comment";
  return "Post";
}

export function PostCard({ post }: { post: Post }) {
  const { address } = useAccount();
  const [showComment, setShowComment] = useState(false);
  const queryClient = useQueryClient();

  // Fetch profile for the post author
  const { data: authorProfile } = useQuery<Profile>({
    queryKey: ["profile", post.author],
    queryFn: () => api.profileByOwner(post.author),
    enabled: !!post.author,
    retry: false,
  });

  // Check if current user is following the author
  const { data: following } = useQuery<string[]>({
    queryKey: ["following", address],
    queryFn: () => (address ? api.following(address) : Promise.resolve([])),
    enabled: !!address,
    retry: false,
  });

  const isFollowing = following?.map((f) => f.toLowerCase()).includes(post.author.toLowerCase()) || false;

  const displayName = authorProfile?.displayName || authorProfile?.handle || `${post.author.slice(0, 6)}...${post.author.slice(-4)}`;
  const avatarUrl = authorProfile?.avatarCid
    ? `${process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud"}/ipfs/${authorProfile.avatarCid}`
    : null;
  const mediaUrl = post.mediaCid
    ? `${process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud"}/ipfs/${post.mediaCid}`
    : null;

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect wallet first");
      return api.like(address, post.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
    },
  });

  const retweetMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect wallet first");
      return api.retweet(address, post.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect wallet first");
      if (isFollowing) {
        return api.unfollow(address, post.author);
      } else {
        return api.follow(address, post.author);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following", address] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  return (
    <div className="glass rounded-2xl p-5 space-y-4 hover:border-indigo-500/30 border border-transparent transition-all">
      <div className="flex items-start gap-4">
        <Link href={`/profile?user=${post.author}`} className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/50"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile?user=${post.author}`}
                className="font-semibold text-white hover:text-indigo-300 transition-colors"
              >
                {displayName}
              </Link>
              {authorProfile?.handle && (
                <span className="text-white/60 text-sm">@{authorProfile.handle}</span>
              )}
              <span className="text-white/40 text-sm">·</span>
              <span className="text-white/60 text-sm">{formatTime(post.timestamp)}</span>
            </div>
            {address && address.toLowerCase() !== post.author.toLowerCase() && (
              <button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isLoading}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isFollowing
                    ? "bg-white/10 text-white/70 hover:bg-white/20"
                    : "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                }`}
              >
                {followMutation.isLoading ? "..." : isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
          {post.postType !== 0 && (
            <div className="mb-2">
              <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">
                {typeLabel(post)}
              </span>
            </div>
          )}
        </div>
      </div>

      {post.content && (
        <p
          className={classNames("leading-relaxed text-white/90 whitespace-pre-wrap break-words", {
            "text-white/80 italic": post.postType === 1,
          })}
        >
          {post.content}
        </p>
      )}

      {mediaUrl && (
        <div className="rounded-xl overflow-hidden border border-white/10">
          <img src={mediaUrl} alt="Post media" className="w-full h-auto max-h-96 object-cover" />
        </div>
      )}

      <div className="flex items-center gap-6 pt-2 border-t border-white/10">
        <button
          className="flex items-center gap-2 text-white/70 hover:text-red-400 transition-colors group"
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isLoading || !address}
        >
          <span className="text-xl group-hover:scale-110 transition-transform">
            {likeMutation.isLoading ? "❤️" : "🤍"}
          </span>
          <span className="text-sm font-medium">{post.likeCount || 0}</span>
        </button>
        <button
          className="flex items-center gap-2 text-white/70 hover:text-green-400 transition-colors group"
          onClick={() => retweetMutation.mutate()}
          disabled={retweetMutation.isLoading || !address}
        >
          <span className="text-xl group-hover:scale-110 transition-transform">🔁</span>
          <span className="text-sm font-medium">{post.retweetCount || 0}</span>
        </button>
        <button
          className="flex items-center gap-2 text-white/70 hover:text-indigo-400 transition-colors group"
          onClick={() => setShowComment(!showComment)}
        >
          <span className="text-xl group-hover:scale-110 transition-transform">💬</span>
          <span className="text-sm font-medium">{post.commentCount || 0}</span>
        </button>
        {post.referenceId && (
          <Link
            href={`/post/${post.referenceId}`}
            className="text-white/60 hover:text-white/80 text-sm transition-colors"
          >
            View original
          </Link>
        )}
      </div>

      <AnimatePresence>
        {showComment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-white/10"
          >
            <Composer mode="comment" referenceId={post.id} onDone={() => setShowComment(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {likeMutation.error && (
        <p className="text-red-400 text-sm">{(likeMutation.error as Error).message}</p>
      )}
      {retweetMutation.error && (
        <p className="text-red-400 text-sm">{(retweetMutation.error as Error).message}</p>
      )}
      {followMutation.error && (
        <p className="text-red-400 text-sm">{(followMutation.error as Error).message}</p>
      )}
    </div>
  );
}
