"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, Profile } from "../../lib/api";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const viewUser = searchParams.get("user");
  const isOwnProfile = !viewUser || viewUser.toLowerCase() === address?.toLowerCase();
  const profileAddress = viewUser || address || "";

  const [blocked, setBlocked] = useState<string[]>([]);
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", profileAddress],
    queryFn: () => {
      if (viewUser) {
        return api.profileByOwner(viewUser);
      }
      return address ? api.profileByOwner(address) : Promise.reject("no address");
    },
    enabled: Boolean(profileAddress),
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
    onSuccess: () => {
      window.location.reload();
    },
  });

  function block(addr: string) {
    const next = [...blocked, addr];
    setBlocked(next);
    localStorage.setItem("polyx-blocked", JSON.stringify(next));
    window.dispatchEvent(new Event("polyx-block-updated"));
  }

  function unblock(addr: string) {
    const next = blocked.filter((b) => b.toLowerCase() !== addr.toLowerCase());
    setBlocked(next);
    localStorage.setItem("polyx-blocked", JSON.stringify(next));
    window.dispatchEvent(new Event("polyx-block-updated"));
  }

  const isBlocked = profileAddress && blocked.map((b) => b.toLowerCase()).includes(profileAddress.toLowerCase());

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="glass rounded-3xl p-6">
          <p className="text-white/70">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!profile && profileAddress) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="glass rounded-3xl p-6 text-center space-y-4">
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p className="text-white/70">This user hasn&apos;t created a profile yet.</p>
          {isOwnProfile && (
            <Link href="/" className="btn-primary inline-block">
              Create your profile
            </Link>
          )}
        </div>
      </main>
    );
  }

  const avatarUrl = profile?.avatarCid
    ? `${process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud"}/ipfs/${profile.avatarCid}`
    : null;
  const headerUrl = profile?.headerCid
    ? `${process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud"}/ipfs/${profile.headerCid}`
    : null;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      {/* Profile Header */}
      <div className="glass rounded-3xl overflow-hidden">
        {headerUrl ? (
          <img src={headerUrl} alt="Header" className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-indigo-500/20 to-purple-500/20" />
        )}
        <div className="p-6 -mt-16 relative">
          <div className="flex items-end gap-4 mb-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile.displayName}
                className="w-24 h-24 rounded-full border-4 border-black object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-black bg-indigo-500/20 flex items-center justify-center text-3xl font-bold">
                {profile?.displayName.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            {!isOwnProfile && address && (
              <div className="flex gap-2 ml-auto">
                <Link href={`/messages?chat=${profileAddress}`} className="btn-secondary text-sm">
                  Message
                </Link>
                {isBlocked ? (
                  <button className="btn-secondary text-sm bg-red-500/20" onClick={() => unblock(profileAddress)}>
                    Unblock
                  </button>
                ) : (
                  <button className="btn-secondary text-sm" onClick={() => block(profileAddress)}>
                    Block
                  </button>
                )}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold">{profile?.displayName}</h1>
          <p className="text-white/70">@{profile?.handle}</p>
          {profile?.bio && <p className="mt-2 text-white/80">{profile.bio}</p>}
          <p className="mt-2 text-xs text-white/50 font-mono">{profile?.owner}</p>
        </div>
      </div>

      {/* Edit Profile (Own Profile Only) */}
      {isOwnProfile && profile && (
        <div className="glass p-6 rounded-3xl space-y-4">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
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
                placeholder="ipfs:// or CID"
              />
            </label>
            <label className="text-sm space-y-1">
              <span>Header CID</span>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
                value={headerCid}
                onChange={(e) => setHeaderCid(e.target.value)}
                placeholder="ipfs:// or CID"
              />
            </label>
          </div>
          <button className="btn-primary" disabled={update.isLoading} onClick={() => update.mutate()}>
            {update.isLoading ? "Saving..." : "Save profile"}
          </button>
          {update.error ? <p className="text-red-400 text-sm">{(update.error as Error).message}</p> : null}
        </div>
      )}

      {/* Blocked Users (Own Profile Only) */}
      {isOwnProfile && (
        <div className="glass p-6 rounded-3xl space-y-3">
          <h2 className="text-xl font-semibold">Blocked users</h2>
          {blocked.length === 0 ? (
            <p className="text-white/70 text-sm">No one blocked.</p>
          ) : (
            <div className="space-y-2">
              {blocked.map((b) => (
                <div key={b} className="flex items-center justify-between text-sm">
                  <Link href={`/profile?user=${b}`} className="hover:text-indigo-400">
                    {b}
                  </Link>
                  <button className="btn-secondary" onClick={() => unblock(b)}>
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
