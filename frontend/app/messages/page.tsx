"use client";

import { useState } from "react";
import { Buffer } from "buffer";
import { useAccount } from "wagmi";
import { api } from "../../lib/api";

export default function Messages() {
  const { address } = useAccount();
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!address) {
      setStatus("Connect wallet first");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const payload = { from: address, to, text, createdAt: Date.now() };
      const base64 = Buffer.from(JSON.stringify(payload)).toString("base64");
      const upload = await api.uploadToPinata("message.json", "application/json", base64);
      const cidHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(upload.cid));
      const hexHash = Array.from(new Uint8Array(cidHash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      await api.anchorChat(address, to, upload.cid, `0x${hexHash}`);
      setStatus("Message anchored on-chain");
      setText("");
    } catch (err: any) {
      setStatus(err.message || "Failed to send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="glass p-6 rounded-3xl space-y-3">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-white/70 text-sm">
          Messages are uploaded to Pinata/IPFS and anchored on-chain (public). Add encryption if you need privacy.
        </p>
        <div className="space-y-2">
          <label className="text-sm space-y-1 block">
            <span>Recipient address</span>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
            />
          </label>
          <label className="text-sm space-y-1 block">
            <span>Message</span>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
        </div>
        <button className="btn-primary" disabled={!text || !to || loading} onClick={send}>
          {loading ? "Sending..." : "Send & anchor"}
        </button>
        {status ? <p className="text-sm text-white/70">{status}</p> : null}
      </div>
    </main>
  );
}


