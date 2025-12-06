"use client";

import { useAccount } from "wagmi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useState, useEffect } from "react";

export function FollowButton({ currentUser, targetUser }: { currentUser: string; targetUser: string }) {
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!currentUser || !targetUser) {
      setIsChecking(false);
      return;
    }
    api
      .following(currentUser)
      .then((following) => {
        setIsFollowing(following.map((f) => f.toLowerCase()).includes(targetUser.toLowerCase()));
      })
      .catch(() => {})
      .finally(() => setIsChecking(false));
  }, [currentUser, targetUser]);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        return api.unfollow(currentUser, targetUser);
      } else {
        return api.follow(currentUser, targetUser);
      }
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      queryClient.invalidateQueries({ queryKey: ["following", currentUser] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  if (isChecking) {
    return (
      <button className="btn-secondary text-sm" disabled>
        ...
      </button>
    );
  }

  return (
    <button
      className={`btn-secondary text-sm ${
        isFollowing ? "bg-red-500/20 hover:bg-red-500/30" : "bg-indigo-500/20 hover:bg-indigo-500/30"
      }`}
      disabled={followMutation.isLoading}
      onClick={() => followMutation.mutate()}
    >
      {followMutation.isLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}


