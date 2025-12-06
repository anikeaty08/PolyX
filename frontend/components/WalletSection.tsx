"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletSection() {
  return (
    <div className="card-3d p-5">
      <ConnectButton chainStatus="icon" showBalance={false} />
    </div>
  );
}
