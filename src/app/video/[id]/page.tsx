import Link from 'next/link';
import { prisma } from '../../../lib/prisma';
import RecordViewClient from '../../../components/RecordViewClient';
import LikeButton from '../../../components/LikeButton';
import CommentsSection from '../../../components/CommentsSection';
import '../../../styles/custom.css';

interface VideoPageProps {
  params: { id: string };
}

export const revalidate = 0;

export default async function VideoPage({ params }: VideoPageProps) {
  const video = await prisma.video.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      url: true,
      thumbnail: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          id: true, // для посилання на канал
        },
      },
      _count: {
        select: {
          views: true,
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (!video) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        Відео не знайдено
      </div>
    );
  }

  return (
    <div className="video-container">
      <h1 className="video-title">{video.title}</h1>

      <p className="text-sm text-gray-500 mt-2">
        Додано: {new Date(video.createdAt).toLocaleString()} | Автор:{' '}
        <Link href={`/channel/${video.user.id}`} className="text-blue-600 hover:underline">
          {video.user.name}
        </Link>
      </p>

      <div className="video-player-wrapper mt-4">
        <video
          src={video.url}
          controls
          poster={video.thumbnail || undefined}
          className="video-player"
        />
      </div>

      {video.description && (
        <p className="video-description mt-4 text-gray-700 whitespace-pre-line">
          {video.description}
        </p>
      )}

      <div className="video-stats-bar mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <span className="stat-button">
          👁 <strong>{video._count.views}</strong> переглядів
        </span>

        <RecordViewClient videoId={video.id} />

        <LikeButton
          videoId={video.id}
          initialCount={video._count.likes}
          // className="stat-button" // Видалено проп className
        />

        <span className="stat-button">
          💬 <strong>{video._count.comments}</strong> коментарів
        </span>
      </div>

      <div className="mt-6">
        <CommentsSection videoId={video.id} />
      </div>
    </div>
  );
}
