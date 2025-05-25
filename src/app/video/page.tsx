import Link from "next/link";
import { prisma } from "../../lib/prisma";

export const revalidate = 0;

export default async function VideoListPage() {
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

return (
<div className="min-h-screen p-6 max-w-7xl mx-auto">
<h1 className="text-3xl font-bold mb-6 text-center">Усі відео</h1>

<h1 className="text-3xl text-red-500">Перевірка Tailwind</h1>

  {videos.length === 0 ? (
    <p className="text-center text-gray-500">Немає доступних відео.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/video/${video.id}`}
          className="bg-white rounded-lg shadow hover:shadow-lg transition duration-200"
        >
          {/* Пропорційна заставка */}
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gray-200">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>
          {/* Інформація про відео */}
          <div className="p-3">
            <h2 className="text-lg font-semibold mb-1 truncate">{video.title}</h2>
            <p className="text-sm text-gray-500">
              {new Date(video.createdAt).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )}
</div>
);
}