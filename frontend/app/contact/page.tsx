"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 md:p-12 space-y-6"
      >
        <div className="space-y-2">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium inline-flex items-center gap-2">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold">Connect With Us</h1>
          <p className="text-white/70 text-lg">
            Have questions, suggestions, or want to collaborate? We'd love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-6">
          <div className="glass border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Email</h3>
            <p className="text-white/70">Reach out via email for inquiries</p>
            <a href="mailto:contact@polyx.app" className="text-indigo-400 hover:text-indigo-300 font-medium">
              contact@polyx.app
            </a>
          </div>

          <div className="glass border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">GitHub</h3>
            <p className="text-white/70">Check out our code and contribute</p>
            <a href="https://github.com/polyx" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 font-medium">
              github.com/polyx
            </a>
          </div>

          <div className="glass border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Twitter</h3>
            <p className="text-white/70">Follow us for updates</p>
            <a href="https://twitter.com/polyx" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium">
              @polyx
            </a>
          </div>

          <div className="glass border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.305-2.185 4.343-.577.463-1.081.812-1.511 1.047-.43.234-.893.351-1.389.351-.643 0-1.135-.22-1.476-.66-.341-.44-.512-1.1-.512-1.98V8.16h2.56v1.28c0 .512.085.896.256 1.152.171.256.448.384.832.384.341 0 .661-.128.96-.384.299-.256.555-.597.768-1.024.213-.427.341-.896.384-1.408h2.304zm-8.96 0v6.72H6.304V8.16h2.304z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Discord</h3>
            <p className="text-white/70">Join our community</p>
            <a href="https://discord.gg/polyx" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 font-medium">
              discord.gg/polyx
            </a>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

