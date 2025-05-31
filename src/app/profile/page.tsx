'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
export const dynamic = 'force-dynamic'

interface Video {
  id: string;
  title: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    } else {
      setNewName(session?.user?.name || '');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('/api/profile/videos', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error('Помилка завантаження відео');
        const data = await res.json();
        setVideos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleDeleteVideo = async (id: string) => {
    const confirmed = confirm('Ви дійсно хочете видалити це відео?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Не вдалося видалити відео');
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
      alert('Помилка під час видалення відео');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm('Ви дійсно хочете видалити свій акаунт? Це дію неможливо скасувати.');
    if (!confirmed) return;

    try {
      const res = await fetch('/api/profile/deleteAccount', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Не вдалося видалити акаунт');
      router.push('/login');
    } catch (err) {
      console.error(err);
      alert('Помилка при видаленні акаунта');
    }
  };

  const handleUpdate = async () => {
    setUpdateMessage('');
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUpdateMessage('✅ Дані успішно оновлено. Увійдіть знову.');
    } catch (err: any) {
      setUpdateMessage(err.message || '❌ Помилка');
    }
  };

  if (loading) return <p className="profile-message">Завантаження...</p>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">Профіль</h1>

      {session?.user && (
        <div className="profile-info">
          <p><strong>Імʼя:</strong> {session.user.name}</p>
          <p><strong>Email:</strong> {session.user.email}</p>

          <div className="profile-button-group">
            <button onClick={handleDeleteAccount} className="profile-button-delete">Видалити акаунт</button>
            <button onClick={() => signOut()} className="profile-button-logout">Вийти з акаунту</button>
          </div>
        </div>
      )}

      <div className="profile-update-section">
        <h3 className="profile-subtitle">Оновити дані</h3>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Нове імʼя"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Новий пароль"
        />
        <button onClick={handleUpdate} className="profile-button-alt">Оновити</button>
        {updateMessage && <p className="profile-message">{updateMessage}</p>}
      </div>

      <div>
        <h2 className="profile-subtitle">Мої відео</h2>
        {videos.length === 0 ? (
          <p className="profile-message">Ви ще не додали жодного відео.</p>
        ) : (
          <ul className="profile-video-list">
            {videos.map((video) => (
              <li key={video.id} className="profile-video-item">
                <span className="profile-video-title">{video.title}</span>
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="profile-button-delete-small"
                >
                  Видалити
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
