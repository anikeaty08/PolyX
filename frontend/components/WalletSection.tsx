"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Link from "next/link";

export function WalletSection() {
  const { address } = useAccount();
  return (
    <div className="glass rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70">Identity</p>
          <p className="font-semibold">{address ? address : "Not connected"}</p>
        </div>
        <ConnectButton showBalance={false} />
      </div>
      <div className="flex gap-2 text-xs">
        <Link href="/profile" className="underline text-white/70">
          Profile & settings
        </Link>
        <Link href="/messages" className="underline text-white/70">
          Messages
        </Link>
      </div>
    </div>
  );
}


