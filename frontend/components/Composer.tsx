"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAccount } from "wagmi";
import { api } from "../lib/api";

interface Props {
  mode?: "tweet" | "quote";
  referenceId?: number;
  onDone?: () => void;
}

export function Composer({ mode = "tweet", referenceId, onDone }: Props) {
  const [text, setText] = useState("");
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect wallet first");
      if (mode === "tweet") {
        return api.tweet(address, text);
      }
      if (!referenceId) throw new Error("Missing referenceId");
      return api.quote(address, referenceId, text);
    },
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      onDone?.();
    },
  });

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{mode === "tweet" ? "Compose" : "Quote tweet"}</p>
        <span className="text-xs text-white/60">{text.length}/280</span>
      </div>
      <textarea
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder={mode === "tweet" ? "What's happening?" : "Add a comment..."}
        rows={mode === "tweet" ? 3 : 4}
        maxLength={280}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          className="btn-primary"
          disabled={!text || mutation.isLoading}
          onClick={() => mutation.mutate()}
        >
          {mutation.isLoading ? "Sending..." : mode === "tweet" ? "Tweet" : "Quote"}
        </button>
      </div>
      {mutation.error ? <p className="text-red-400 text-sm">{(mutation.error as Error).message}</p> : null}
    </div>
  );
}


