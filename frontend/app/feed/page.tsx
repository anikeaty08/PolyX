"use client";

import { WalletSection } from "../../components/WalletSection";
import { Composer } from "../../components/Composer";
import { Feed } from "../../components/Feed";
import { OnboardingGate } from "../../components/OnboardingGate";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export default function FeedPage() {
  const [tab, setTab] = useState<"suggested" | "following">("suggested");
  const { address } = useAccount();

  const { data: blocked = [] } = useQuery<string[]>({
    queryKey: ["blocked", address],
    queryFn: () => (address ? api.getBlockedUsers(address) : Promise.resolve([])),
    enabled: !!address,
    refetchInterval: 30_000,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <OnboardingGate>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="card-3d p-2 flex gap-2">
              <button
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  tab === "suggested"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setTab("suggested")}
              >
                Suggested
              </button>
              <button
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  tab === "following"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
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
            <div className="card-3d p-6 space-y-3">
              <p className="font-bold text-lg gradient-text">How it works</p>
              <p className="text-sm text-gray-400">
                Connect any wallet via RainbowKit. All writes are routed through the PolyX backend relayer, so you never pay gas.
              </p>
              <p className="text-sm text-gray-400">
                Media assets upload to Pinata/IPFS; hashes anchor posts on-chain. Profiles are unique per wallet.
              </p>
            </div>
          </div>
        </div>
      </OnboardingGate>
    </div>
  );
}
