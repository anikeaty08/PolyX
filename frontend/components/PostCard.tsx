"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Post, Profile } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Composer } from "./Composer";
import classNames from "classnames";

function formatTime(ts: number) {
  return new Date(ts).toLocaleString();
}

function typeLabel(post: Post) {
  if (post.postType === 1) return "Retweet";
  if (post.postType === 2) return "Quote";
  if (post.postType === 3) return "Comment";
  return "Post";
}

export function PostCard({ post }: { post: Post }) {
  const { address } = useAccount();
  const [showQuote, setShowQuote] = useState(false);
  const [authorProfile, setAuthorProfile] = useState<Profile | null>(null);
  const queryClient = useQueryClient();
  const isDeleted = post.deleted;

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect wallet first");
      return api.like(address, post.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });

  useEffect(() => {
    let active = true;
    api
      .profileByOwner(post.author)
      .then((p) => {
        if (active) setAuthorProfile(p);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [post.author]);

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
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">
            {authorProfile?.displayName || post.author.slice(0, 6) + "..." + post.author.slice(-4)}
          </span>
          {authorProfile?.handle ? <span className="text-white/50">@{authorProfile.handle}</span> : null}
        </div>
        <span>{formatTime(post.timestamp)}</span>
      </div>
      <p className={classNames("leading-relaxed", { "text-white/80 italic": post.postType !== 0 })}>
        {post.content || (post.postType === 1 ? "retweeted" : "quoted")}
      </p>
      {post.mediaCid ? (
        <div className="overflow-hidden rounded-xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://gateway.pinata.cloud/ipfs/${post.mediaCid}`} alt="media" className="w-full object-cover" />
        </div>
      ) : null}
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
    <button
      className="btn-secondary"
      onClick={() => {
        const blocked = JSON.parse(localStorage.getItem("polyx-blocked") || "[]") as string[];
        if (!blocked.includes(post.author)) {
          blocked.push(post.author);
          localStorage.setItem("polyx-blocked", JSON.stringify(blocked));
          queryClient.invalidateQueries({ queryKey: ["feed"] });
          window.dispatchEvent(new Event("polyx-block-updated"));
        }
      }}
    >
      🚫 Block
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
    {isDeleted ? <p className="text-xs text-white/60">This post was deleted.</p> : null}
    </div>
  );
}


