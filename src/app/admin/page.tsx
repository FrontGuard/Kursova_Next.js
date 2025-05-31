"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from '../../styles/AdminPage.module.css';
export const dynamic = 'force-dynamic'

interface Video {
  id: string;
  title: string;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    console.log("Session in AdminPage:", session);
    if (!session?.user?.role || session.user.role.toLowerCase() !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchData = async () => {
      try {
        const [videosRes, usersRes] = await Promise.all([
          fetch("/api/admin/videos", { credentials: "include" }),
          fetch("/api/admin/users", { credentials: "include" }),
        ]);

        if (!videosRes.ok || !usersRes.ok) throw new Error("Помилка завантаження даних");

        const videosData = await videosRes.json();
        const usersData = await usersRes.json();
        setVideos(videosData);
        setUsers(usersData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status]);

  const handleDeleteVideo = async (id: string) => {
    const confirmed = confirm("Точно видалити відео?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId: id }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Не вдалося видалити відео");
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
      alert("Помилка під час видалення відео");
    }
  };

  const handleDeleteUser = async (id: string) => {
    const confirmed = confirm("Видалити користувача?");
    if (!confirmed) return;
    if (session?.user?.id === id) {
      return alert("Не можна видалити себе");
    }

    try {
      const res = await fetch(`/api/admin/deleteUser/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Не вдалося видалити користувача");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("Помилка при видаленні користувача");
    }
  };

  if (loading) return <p className={styles.loading}>Завантаження...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Адмін-панель</h1>

      <h2 className={styles.sectionHeading}>Відео</h2>
      {videos.length === 0 ? (
        <p className={styles.noData}>Немає відео</p>
      ) : (
        <ul className={styles.list}>
          {videos.map((video) => (
            <li key={video.id} className={styles.listItem}>
              <h2 className={styles.videoTitle}>{video.title}</h2>
              <button
                onClick={() => handleDeleteVideo(video.id)}
                className={styles.deleteButton}
              >
                Видалити
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className={styles.sectionHeading}>Користувачі</h2>
      {users.length === 0 ? (
        <p className={styles.noData}>Немає користувачів</p>
      ) : (
        <ul className={styles.list}>
          {users.map((user) => (
            <li key={user.id} className={styles.userItem}>
              <p>
                <strong>{user.name}</strong> ({user.email}) – {user.role}
              </p>
              {user.role !== "admin" && (
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className={styles.deleteButton}
                >
                  Видалити
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}