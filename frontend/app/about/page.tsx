"use client";

import Link from "next/link";

export default function About() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="glass rounded-3xl p-6 md:p-10 space-y-4">
        <p className="text-sm uppercase tracking-[0.25em] text-indigo-300/80">About PolyX</p>
        <h1 className="text-4xl font-bold">Gasless, on-chain social on Polygon Amoy</h1>
        <p className="text-white/70">
          PolyX makes every action verifiable on-chain while keeping the UX smooth with a sponsored relayer. Profiles,
          posts, likes, retweets, quotes, comments, edits, deletes, follows, and media CIDs live on-chain (media bytes
          on IPFS/Pinata). We’re building a transparent social graph with wallet-first identity.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4 space-y-2">
          <p className="font-semibold">Why Polygon Amoy</p>
          <p className="text-white/70 text-sm">Low fees, high throughput, and EVM tooling for rapid social UX.</p>
        </div>
        <div className="glass rounded-2xl p-4 space-y-2">
          <p className="font-semibold">Media on IPFS/Pinata</p>
          <p className="text-white/70 text-sm">Images/videos are stored as CIDs; hashes are referenced on-chain.</p>
        </div>
        <div className="glass rounded-2xl p-4 space-y-2">
          <p className="font-semibold">Roadmap</p>
          <p className="text-white/70 text-sm">
            Profile pages, Following/Suggested feeds, edit/delete, comments, chat anchoring, AI chat entrypoint.
          </p>
        </div>
        <div className="glass rounded-2xl p-4 space-y-2">
          <p className="font-semibold">Transparency</p>
          <p className="text-white/70 text-sm">All critical actions are on-chain; relayer sponsors gas for UX.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/" className="btn-primary px-4 py-2 rounded-xl">
          Back to app
        </Link>
        <Link
          href="https://docs.pinata.cloud/"
          target="_blank"
          className="btn-secondary px-4 py-2 rounded-xl"
          rel="noreferrer"
        >
          Pinata docs
        </Link>
      </div>
    </main>
  );
}


