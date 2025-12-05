import { useState } from "react";
import { useAccount } from "wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Post } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Composer } from "./Composer";
import classNames from "classnames";

function formatTime(ts: number) {
  return new Date(ts).toLocaleString();
}

function typeLabel(post: Post) {
  if (post.postType === 1) return "Retweet";
  if (post.postType === 2) return "Quote";
  return "Post";
}

export function PostCard({ post }: { post: Post }) {
  const { address } = useAccount();
  const [showQuote, setShowQuote] = useState(false);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect wallet first");
      return api.like(address, post.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });

  const retweetMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect wallet first");
      return api.retweet(address, post.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span className="font-semibold text-white">{post.author}</span>
        <span>{formatTime(post.timestamp)}</span>
      </div>
      <p className={classNames("leading-relaxed", { "text-white/80 italic": post.postType !== 0 })}>
        {post.content || (post.postType === 1 ? "retweeted" : "quoted")}
      </p>
      <div className="flex items-center gap-3 text-xs text-white/60">
        <span className="px-2 py-1 bg-white/5 rounded-full">{typeLabel(post)}</span>
        {post.referenceId ? <span>ref #{post.referenceId}</span> : null}
      </div>
      <div className="flex gap-3">
        <button
          className="btn-secondary"
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isLoading}
        >
          ❤️ {post.likeCount}
        </button>
        <button
          className="btn-secondary"
          onClick={() => retweetMutation.mutate()}
          disabled={retweetMutation.isLoading}
        >
          🔁 {post.retweetCount}
        </button>
        <button className="btn-secondary" onClick={() => setShowQuote((v) => !v)}>
          💬 {post.quoteCount}
        </button>
      </div>
      <AnimatePresence>
        {showQuote ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <Composer mode="quote" referenceId={post.id} onDone={() => setShowQuote(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
      {likeMutation.error ? <p className="text-red-400 text-sm">{(likeMutation.error as Error).message}</p> : null}
      {retweetMutation.error ? (
        <p className="text-red-400 text-sm">{(retweetMutation.error as Error).message}</p>
      ) : null}
    </div>
  );
}


