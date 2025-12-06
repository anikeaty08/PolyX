"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

export function WalletSection() {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="glass rounded-2xl p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-white/70">Identity</p>
        <p className="font-semibold">{mounted && address ? address : "Not connected"}</p>
      </div>
      <ConnectButton showBalance={false} />
    </div>
  );
}


