"use client";

import { WalletSection } from "../../components/WalletSection";
import { Composer } from "../../components/Composer";
import { Feed } from "../../components/Feed";
import { OnboardingGate } from "../../components/OnboardingGate";
import { useEffect, useState } from "react";

export default function FeedPage() {
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
      <OnboardingGate>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="flex gap-3 items-center">
              <button
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  tab === "suggested"
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/50"
                    : "glass border border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setTab("suggested")}
              >
                Suggested
              </button>
              <button
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  tab === "following"
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/50"
                    : "glass border border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                }`}
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
                Connect any wallet via RainbowKit. All writes are routed through the PolyX backend relayer, so you never pay gas.
              </p>
              <p className="text-sm text-white/70">
                Media assets upload to Pinata/IPFS; hashes anchor posts on-chain. Profiles are unique per wallet.
              </p>
            </div>
          </div>
        </div>
      </OnboardingGate>
    </main>
  );
}

