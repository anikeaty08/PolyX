"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Profile } from "../../lib/api";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function SearchPage() {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: results, isLoading, refetch } = useQuery<Profile[]>({
    queryKey: ["search", query],
    queryFn: () => api.search(query),
    enabled: Boolean(query && query.length >= 2 && mounted),
    retry: false,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim().length >= 2) {
      setQuery(searchInput.trim());
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  }

  if (!mounted) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="glass rounded-3xl p-6">
          <p className="text-white/70">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="glass rounded-3xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Search Users</h1>
          <p className="text-white/70 text-sm">Search by username (handle) or wallet address</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter username or wallet address (0x...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Search
            </button>
          </div>
        </form>

        {query && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-white/70">Searching...</div>
            ) : results && results.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-white/70">
                  Found {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
                {results.map((profile) => (
                  <UserResultCard key={profile.owner} profile={profile} currentUser={address || ""} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/70">
                <p>No users found for &quot;{query}&quot;</p>
                <p className="text-sm mt-2">Try searching by handle or wallet address</p>
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="text-center py-8 text-white/70">
            <p>Enter a username or wallet address to search</p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-semibold">Examples:</p>
              <p className="text-white/60">• Search by handle: &quot;alice&quot;</p>
              <p className="text-white/60">• Search by wallet: &quot;0x1234...5678&quot;</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function UserResultCard({ profile, currentUser }: { profile: Profile; currentUser: string }) {
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckingFollow, setIsCheckingFollow] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setIsCheckingFollow(false);
      return;
    }
    api
      .following(currentUser)
      .then((following) => {
        setIsFollowing(following.map((f) => f.toLowerCase()).includes(profile.owner.toLowerCase()));
      })
      .catch(() => {})
      .finally(() => setIsCheckingFollow(false));
  }, [currentUser, profile.owner]);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("Connect wallet first");
      if (isFollowing) {
        await api.unfollow(currentUser, profile.owner);
      } else {
        await api.follow(currentUser, profile.owner);
      }
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      queryClient.invalidateQueries({ queryKey: ["following", currentUser] });
    },
  });

  const avatarUrl = profile.avatarCid
    ? `${process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud"}/ipfs/${profile.avatarCid}`
    : null;

  return (
    <div className="glass border border-white/5 rounded-2xl p-4 hover:border-indigo-500/50 transition-colors">
      <div className="flex items-start gap-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt={profile.displayName} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-2xl font-bold">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/profile?user=${profile.owner}`} className="font-semibold hover:text-indigo-400">
              {profile.displayName}
            </Link>
            <span className="text-sm text-white/60">@{profile.handle}</span>
          </div>
          {profile.bio && <p className="text-sm text-white/70 mb-2">{profile.bio}</p>}
          <p className="text-xs text-white/50 font-mono">{profile.owner}</p>
          <div className="flex gap-2 mt-3">
            <Link
              href={`/messages?chat=${profile.owner}`}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Message
            </Link>
            <Link
              href={`/profile?user=${profile.owner}`}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              View Profile
            </Link>
            {currentUser && currentUser.toLowerCase() !== profile.owner.toLowerCase() && (
              <button
                className={`btn-secondary text-xs px-3 py-1.5 ${
                  isFollowing ? "bg-red-500/20 hover:bg-red-500/30" : ""
                }`}
                disabled={isCheckingFollow || followMutation.isLoading}
                onClick={() => followMutation.mutate()}
              >
                {isCheckingFollow
                  ? "Checking..."
                  : followMutation.isLoading
                    ? "..."
                    : isFollowing
                      ? "Unfollow"
                      : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



