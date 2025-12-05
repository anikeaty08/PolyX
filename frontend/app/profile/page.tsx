"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, Profile } from "../../lib/api";

export default function ProfilePage() {
  const { address } = useAccount();
  const [blocked, setBlocked] = useState<string[]>([]);
  const { data: profile } = useQuery({
    queryKey: ["profile", address],
    queryFn: () => (address ? api.profileByOwner(address) : Promise.reject("no address")),
    enabled: Boolean(address),
    retry: false,
  });

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarCid, setAvatarCid] = useState("");
  const [headerCid, setHeaderCid] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("polyx-blocked") || "[]") as string[];
    setBlocked(stored);
  }, []);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setAvatarCid(profile.avatarCid);
      setHeaderCid(profile.headerCid);
    }
  }, [profile]);

  const update = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect wallet first");
      return api.profileUpdate({ user: address, displayName, bio, avatarCid, headerCid });
    },
  });

  function unblock(addr: string) {
    const next = blocked.filter((b) => b.toLowerCase() !== addr.toLowerCase());
    setBlocked(next);
    localStorage.setItem("polyx-blocked", JSON.stringify(next));
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="glass p-6 rounded-3xl space-y-4">
        <h1 className="text-3xl font-bold">Profile & Settings</h1>
        {profile ? (
          <p className="text-white/70 text-sm">Handle: @{profile.handle}</p>
        ) : (
          <p className="text-white/70 text-sm">Create your profile from the home page.</p>
        )}
        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-sm space-y-1">
            <span>Display name</span>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>
          <label className="text-sm space-y-1">
            <span>Bio</span>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-sm space-y-1">
            <span>Avatar CID</span>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
              value={avatarCid}
              onChange={(e) => setAvatarCid(e.target.value)}
            />
          </label>
          <label className="text-sm space-y-1">
            <span>Header CID</span>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
              value={headerCid}
              onChange={(e) => setHeaderCid(e.target.value)}
            />
          </label>
        </div>
        <button className="btn-primary" disabled={update.isLoading} onClick={() => update.mutate()}>
          {update.isLoading ? "Saving..." : "Save profile"}
        </button>
        {update.error ? <p className="text-red-400 text-sm">{(update.error as Error).message}</p> : null}
      </div>

      <div className="glass p-6 rounded-3xl space-y-3">
        <h2 className="text-xl font-semibold">Blocked users</h2>
        {blocked.length === 0 ? (
          <p className="text-white/70 text-sm">No one blocked.</p>
        ) : (
          <div className="space-y-2">
            {blocked.map((b) => (
              <div key={b} className="flex items-center justify-between text-sm">
                <span>{b}</span>
                <button className="btn-secondary" onClick={() => unblock(b)}>
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}


