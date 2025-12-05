"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Buffer } from "buffer";
import { useAccount } from "wagmi";
import { api } from "../lib/api";

interface Props {
  mode?: "tweet" | "quote";
  referenceId?: number;
  onDone?: () => void;
}

export function Composer({ mode = "tweet", referenceId, onDone }: Props) {
  const [text, setText] = useState("");
  const [mediaCid, setMediaCid] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect wallet first");
      if (mode === "tweet") {
        return api.tweet(address, text, mediaCid);
      }
      if (!referenceId) throw new Error("Missing referenceId");
      return api.quote(address, referenceId, text, mediaCid);
    },
    onSuccess: () => {
      setText("");
      setMediaCid("");
      setMediaPreview(null);
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      onDone?.();
    },
  });

  async function handleFile(file?: File) {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const base64 = Buffer.from(data).toString("base64");
      const resp = await api.uploadToPinata(file.name, file.type || "application/octet-stream", base64);
      setMediaCid(resp.cid);
      setMediaPreview(URL.createObjectURL(file));
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{mode === "tweet" ? "Compose" : "Quote tweet"}</p>
        <span className="text-xs text-white/60">
          {text.length}/280 {mediaCid ? " • media attached" : ""}
        </span>
      </div>
      <textarea
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder={mode === "tweet" ? "What's happening?" : "Add a comment..."}
        rows={mode === "tweet" ? 3 : 4}
        maxLength={280}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <label className="btn-secondary cursor-pointer">
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={uploading}
          />
          {uploading ? "Uploading..." : mediaCid ? "Replace media" : "Add media"}
        </label>
        {mediaPreview ? <span className="text-xs text-white/60">Attached: {mediaCid.slice(0, 8)}…</span> : null}
      </div>
      {mediaPreview ? (
        <div className="overflow-hidden rounded-xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaPreview} alt="media preview" className="w-full max-h-64 object-cover" />
        </div>
      ) : null}
      {uploadError ? <p className="text-red-400 text-sm">{uploadError}</p> : null}
      <div className="flex justify-end">
        <button
          className="btn-primary"
          disabled={(!text && !mediaCid) || mutation.isLoading || uploading}
          onClick={() => mutation.mutate()}
        >
          {mutation.isLoading ? "Sending..." : mode === "tweet" ? "Tweet" : "Quote"}
        </button>
      </div>
      {mutation.error ? <p className="text-red-400 text-sm">{(mutation.error as Error).message}</p> : null}
    </div>
  );
}


