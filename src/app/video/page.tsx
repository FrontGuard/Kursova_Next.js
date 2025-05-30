'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import '../../styles/custom.css'; // Підключення CSS

interface Video {
  id: string;
  title: string;
  thumbnail: string | null;
  user: { name: string };
  createdAt: string;
  _count?: { likes: number };
}

export default function VideoGalleryPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date-desc');
  const { data: session } = useSession();

  useEffect(() => {
    fetch('/api/video')
      .then((res) => res.json())
      .then(setVideos)
      .catch((err) => {
        console.error('Помилка завантаження відео:', err);
      });
  }, []);

  const filteredVideos = useMemo(() => {
    let filtered = [...videos];

    if (search.trim()) {
      filtered = filtered.filter((video) =>
        video.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sort) {
      case 'date-asc':
        filtered.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'date-desc':
        filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'az':
        filtered.sort((a, b) =>
          a.title.localeCompare(b.title, 'uk', { sensitivity: 'base', numeric: true })
        );
        break;
      case 'za':
        filtered.sort((a, b) =>
          b.title.localeCompare(a.title, 'uk', { sensitivity: 'base', numeric: true })
        );
        break;
    }

    return filtered;
  }, [videos, search, sort]);
useEffect(() => {
console.log("SESSION", session?.user);
}, [session]);
  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1 className="gallery-title">🎬 Усі відео</h1>
        {session?.user && session.user.role?.toLowerCase() === 'admin' && (
          <Link href="/admin" className="admin-button"> Адмін </Link> )}
      </div>

      <div className="gallery-controls">
        <input
          type="text"
          placeholder="🔍 Пошук по назві..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="gallery-search"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="gallery-sort"
        >
          <option value="date-desc">🕒 Нові спочатку</option>
          <option value="date-asc">📆 Старі спочатку</option>
          <option value="az">🔤 A → Я</option>
          <option value="za">🔠 Я → A</option>
        </select>
      </div>

      {filteredVideos.length === 0 ? (
        <p className="no-results">Нічого не знайдено.</p>
      ) : (
        <div className="gallery-grid">
          {filteredVideos.map((video) => (
            <Link
              key={video.id}
              href={`/video/${video.id}`}
              className="gallery-card"
            >
              {video.thumbnail ? (
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  width={320}
                  height={180}
                  className="gallery-thumbnail"
                />
              ) : (
                <div className="gallery-no-thumbnail">
                  Немає зображення
                </div>
              )}
              <div className="gallery-card-content">
                <h2 className="gallery-video-title">{video.title}</h2>
                <p className="gallery-date">
                  {new Date(video.createdAt).toLocaleDateString()}
                </p>
                <p className="gallery-author">👤 {video.user.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}