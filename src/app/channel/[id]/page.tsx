'use client'

import '../../../styles/channel.css'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
export const dynamic = 'force-dynamic'

interface Video {
  id: string
  title: string
  thumbnail: string | null
  createdAt: string
}

export default function AuthorChannelPage() {
  const { id } = useParams()
  const [videos, setVideos] = useState<Video[]>([])
  const [authorName, setAuthorName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAuthorVideos = async () => {
      try {
        const res = await fetch(`/api/channel/${id}`)
        const data = await res.json()
        setAuthorName(data.name || '')
        setVideos(Array.isArray(data.videos) ? data.videos : [])
      } catch (err) {
        console.error('Помилка завантаження каналу:', err)
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    fetchAuthorVideos()
  }, [id])

  return (
    <div className="channel-container">
      {loading ? (
        <p className="channel-loading">Завантаження...</p>
      ) : (
        <>
          <div className="channel-meta">
            <h1 className="channel-title">Канал: {authorName}</h1>
            <p>Загальна кількість відео: {Array.isArray(videos) ? videos.length : 0}</p>
          </div>

          {Array.isArray(videos) && videos.length === 0 ? (
            <p className="channel-empty">Автор ще не додав жодного відео.</p>
          ) : (
            <div className="channel-grid">
              {videos.map((video) => {
                // Правильне місце для console.log
                console.log('Канал Thumbnail (перед Image):', video.thumbnail);
                return (
                  <Link key={video.id} href={`/video/${video.id}`} className="channel-card">
                    <div className="channel-thumbnail aspect-video">
                      {video.thumbnail ? (
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          width={640}
                          height={360}
                          className="channel-img"
                        />
                      ) : (
                        <div className="channel-noimg">Немає зображення</div>
                      )}
                    </div>
                    <h2>{video.title}</h2>
                    <p>Додано: {new Date(video.createdAt).toLocaleDateString()}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}