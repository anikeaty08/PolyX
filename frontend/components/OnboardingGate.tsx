"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface Props {
  children: React.ReactNode;
}

export function OnboardingGate({ children }: Props) {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarCid, setAvatarCid] = useState("");
  const [headerCid, setHeaderCid] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", address],
    queryFn: () => (address ? api.profileByOwner(address) : Promise.reject("no address")),
    enabled: Boolean(address),
    retry: false,
  });

  useEffect(() => {
    const check = async () => {
      if (!handle) return;
      setChecking(true);
      try {
        const res = await api.handleAvailable(handle);
        setAvailable(res.available);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [handle]);

  const createProfile = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect wallet first");
      return api.profileCreate({ user: address, handle, displayName, bio, avatarCid, headerCid });
    },
  });

  const missingProfile = mounted && isConnected && !loadingProfile && !profile;
  const disableSubmit = !handle || !displayName || createProfile.isLoading || checking || available === false;

  const statusLabel = useMemo(() => {
    if (!handle) return "";
    if (checking) return "Checking...";
    if (available === false) return "Handle taken";
    if (available === true) return "Handle available";
    return "";
  }, [handle, checking, available]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {missingProfile ? (
        <div className="glass rounded-3xl p-6 space-y-4">
          <p className="text-xl font-semibold">Set up your profile</p>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="space-y-1 text-sm">
              <span>Handle (unique)</span>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
                value={handle}
                onChange={(e) => setHandle(e.target.value.trim().toLowerCase())}
                placeholder="yourname"
              />
              <span className="text-xs text-white/60">{statusLabel}</span>
            </label>
            <label className="space-y-1 text-sm">
              <span>Display name</span>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </label>
          </div>
          <label className="space-y-1 text-sm block">
            <span>Bio</span>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
            />
          </label>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <label className="space-y-1">
              <span>Avatar CID (optional)</span>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
                value={avatarCid}
                onChange={(e) => setAvatarCid(e.target.value)}
                placeholder="ipfs:// or CID"
              />
            </label>
            <label className="space-y-1">
              <span>Header CID (optional)</span>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
                value={headerCid}
                onChange={(e) => setHeaderCid(e.target.value)}
                placeholder="ipfs:// or CID"
              />
            </label>
          </div>
          <button className="btn-primary" disabled={disableSubmit} onClick={() => createProfile.mutate()}>
            {createProfile.isLoading ? "Creating..." : "Create profile"}
          </button>
          {createProfile.error ? (
            <p className="text-red-400 text-sm">{(createProfile.error as Error).message}</p>
          ) : null}
        </div>
      ) : (
        children
      )}
    </>
  );
}


