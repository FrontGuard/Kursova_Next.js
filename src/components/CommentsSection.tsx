// src/components/CommentsSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: { name: string };
}

interface CommentsSectionProps {
  videoId: string;
}

export default function CommentsSection({ videoId }: CommentsSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(`/api/comments?videoId=${videoId}`)
      .then((r) => r.json())
      .then(setComments);
  }, [videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return alert("Увійдіть, щоб коментувати");
    if (!text.trim()) return;

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, text }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments((c) => [newComment, ...c]);
      setText("");
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-xl font-semibold">Коментарі</h2>

      {session && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded"
            placeholder="Напишіть коментар..."
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Відправити
          </button>
        </form>
      )}

      <ul className="space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="border-b pb-2">
            <p className="text-sm text-gray-500">
              {c.user.name} | {new Date(c.createdAt).toLocaleString()}
            </p>
            <p>{c.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
