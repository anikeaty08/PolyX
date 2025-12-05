"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export function WalletSection() {
  const { address } = useAccount();
  return (
    <div className="glass rounded-2xl p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-white/70">Identity</p>
        <p className="font-semibold">{address ? address : "Not connected"}</p>
      </div>
      <ConnectButton showBalance={false} />
    </div>
  );
}


