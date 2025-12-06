"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const features = [
  {
    icon: "🔐",
    title: "Wallet-First Identity",
    description: "Connect with any Web3 wallet. Your profile is unique per wallet address.",
  },
  {
    icon: "⚡",
    title: "Gasless Transactions",
    description: "All on-chain actions are sponsored. Post, like, and interact without paying gas fees.",
  },
  {
    icon: "🖼️",
    title: "IPFS Media Storage",
    description: "Images and files are stored on IPFS/Pinata with on-chain verification.",
  },
  {
    icon: "🔗",
    title: "On-Chain Social Graph",
    description: "Follow, like, retweet, quote, and comment - all recorded on Polygon Amoy.",
  },
  {
    icon: "✨",
    title: "Modern UI/UX",
    description: "Beautiful, responsive interface with dark mode and smooth animations.",
  },
  {
    icon: "🌐",
    title: "Decentralized & Transparent",
    description: "All actions are verifiable on-chain. No central authority controls your content.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-300/80 font-medium">Polygon Amoy Testnet</p>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                PolyX
              </h1>
              <p className="text-2xl md:text-3xl text-white/90 font-light max-w-3xl mx-auto">
                Gasless, On-Chain Social Network
              </p>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Post, like, retweet, and interact on-chain without paying gas. Your social graph, your data, your control.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/feed"
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-semibold text-white hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/50"
              >
                Get Started
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 glass border border-white/20 rounded-xl font-semibold text-white hover:bg-white/10 transition-all"
              >
                Learn More
              </Link>
            </div>
            <div className="pt-8">
              <ConnectButton chainStatus="icon" showBalance={false} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">Features</h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Everything you need for a decentralized social experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass border border-white/10 rounded-2xl p-6 space-y-4 hover:border-indigo-500/50 transition-all group"
            >
              <div className="text-4xl">{feature.icon}</div>
              <h3 className="text-xl font-semibold group-hover:text-indigo-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass border border-indigo-500/30 rounded-3xl p-12 md:p-16 text-center space-y-8 bg-gradient-to-br from-indigo-900/20 to-purple-900/20"
        >
          <h2 className="text-4xl md:text-5xl font-bold">Ready to Get Started?</h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Connect your wallet and start building your on-chain social presence today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/feed"
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-semibold text-white hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/50"
            >
              Go to Feed
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 glass border border-white/20 rounded-xl font-semibold text-white hover:bg-white/10 transition-all"
            >
              Connect With Us
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
