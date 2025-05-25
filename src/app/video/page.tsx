
import Link from "next/link";
import { prisma } from "../../lib/prisma";

export const revalidate = 0; // без кешу, щоб завжди свіжі дані

export default async function VideoListPage() {
  // 1. Дістаємо всі відео з БД
  const videos = await prisma.video.findMany({
    where: { isBlocked: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      thumbnail: true,
      createdAt: true,
    },
  });

  // 2. Рендеримо список
  return (
    <div className="min-h-screen bg-gray-5 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Усі відео</h1>
      {videos.length === 0 ? (
        <p className="text-center text-gray-500">Немає доступних відео.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Link
              key={video.id}
              href={`/video/${video.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition p-4"
            >
              <div className="w-full h-48 mb-2 overflow-hidden rounded-md bg-gray-200">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-lg font-semibold mb-1">{video.title}</h2>
              <p className="text-sm text-gray-500">
                {new Date(video.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
