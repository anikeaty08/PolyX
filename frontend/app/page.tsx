"use client";
import { WalletSection } from "../components/WalletSection";
import { Composer } from "../components/Composer";
import { Feed } from "../components/Feed";
import { motion } from "framer-motion";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { OnboardingGate } from "../components/OnboardingGate";
import { useEffect, useState } from "react";
import { ThemeToggle } from "../components/ThemeToggle";

export default function Home() {
  const [tab, setTab] = useState<"suggested" | "following">("suggested");
  const [blocked, setBlocked] = useState<string[]>([]);

  useEffect(() => {
    const load = () => {
      if (typeof window === "undefined") return;
      const val = JSON.parse(localStorage.getItem("polyx-blocked") || "[]") as string[];
      setBlocked(val);
    };
    load();
    window.addEventListener("polyx-block-updated", load);
    return () => window.removeEventListener("polyx-block-updated", load);
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <header className="glass rounded-3xl p-6 md:p-10 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.2em] text-indigo-300/80">Polygon Amoy</p>
            <motion.h1
              className="text-4xl md:text-5xl font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              PolyX — On-chain social with gasless UX
            </motion.h1>
          </div>
          <div className="hidden md:block">
            <ConnectButton chainStatus="icon" showBalance={false} />
          </div>
        </div>
        <p className="text-white/70 max-w-3xl">
          Post, like, retweet, quote, and soon edit/delete — all recorded on-chain while a relayer sponsors gas. Media is
          stored on IPFS/Pinata, and profiles are unique per wallet.
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            "Wallet-first onboarding with unique profiles",
            "On-chain actions with sponsored gas",
            "Media-ready posts (IPFS/Pinata)",
            "Following vs Suggested feeds",
            "Retweets, quotes, comments, likes",
            "Profile pages and attribution",
          ].map((feature) => (
            <div key={feature} className="glass border border-white/5 rounded-2xl p-3 text-sm text-white/80">
              {feature}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ConnectButton showBalance={false} />
          <Link
            href="/about"
            className="btn-secondary inline-flex items-center justify-center px-4 py-2 rounded-xl"
          >
            About us
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <OnboardingGate>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="flex gap-3 items-center">
              <button
                className={`btn-secondary ${tab === "suggested" ? "ring-2 ring-indigo-400" : ""}`}
                onClick={() => setTab("suggested")}
              >
                Suggested
              </button>
              <button
                className={`btn-secondary ${tab === "following" ? "ring-2 ring-indigo-400" : ""}`}
                onClick={() => setTab("following")}
              >
                Following
              </button>
            </div>
            <Composer />
            <Feed mode={tab === "following" ? "following" : "all"} blocked={blocked} />
          </div>
          <div className="space-y-4">
            <WalletSection />
            <div className="glass rounded-2xl p-4 space-y-2">
              <p className="font-semibold">How it works</p>
              <p className="text-sm text-white/70">
                Connect any wallet via RainbowKit (MetaMask, Rainbow, WalletConnect, more). All writes are routed through
                the PolyX backend relayer, so you never pay gas.
              </p>
              <p className="text-sm text-white/70">
                Media assets upload to Pinata/IPFS; hashes anchor posts on-chain. Profiles are unique per wallet.
              </p>
              <p className="text-sm text-white/70">Switch to “About us” to see the mission and roadmap.</p>
            </div>
          </div>
        </div>
      </OnboardingGate>
    </main>
  );
}
