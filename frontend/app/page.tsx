"use client";
import { WalletSection } from "../components/WalletSection";
import { Composer } from "../components/Composer";
import { Feed } from "../components/Feed";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <header className="text-center space-y-3">
        <motion.h1
          className="text-4xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          PolyX
        </motion.h1>
        <p className="text-white/70">
          Gasless, on-chain social built for Polygon Amoy. Post, like, retweet, and quote with the backend sponsoring
          gas.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Composer />
          <Feed />
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
              The UI uses a 3D-inspired glass morph design with gradients for a modern feel.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


