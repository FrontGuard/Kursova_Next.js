"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface LikeButtonProps {
  videoId: string;
  initialCount: number;
}

export default function LikeButton({ videoId, initialCount }: LikeButtonProps) {
  const { data: session } = useSession();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch(`/api/likes/status?videoId=${videoId}`);
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
      }
    };

    fetchStatus();
  }, [videoId]);

  const handleLike = async () => {
    if (!session) return alert("Увійдіть, щоб лайкати");

    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    });

    if (res.ok) {
      setCount((c) => c + (liked ? -1 : 1));
      setLiked(!liked);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center space-x-1 ${liked ? "text-blue-600" : "text-gray-600"}`}
    >
      <span>👍</span>
      <span>{count}</span>
    </button>
  );
}
