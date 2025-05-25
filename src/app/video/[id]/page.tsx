import { prisma } from '../../../lib/prisma'
import RecordViewClient from '../../../components/RecordViewClient'
import LikeButton from '../../../components/LikeButton'
import CommentsSection from '../../../components/CommentsSection'

interface VideoPageProps {
params: { id: string }
}

export const revalidate = 0 // не кешувати

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
user: { select: { name: true } },
_count: {
select: {
views: true,
likes: true,
comments: true,
},
},
},
})

if (!video) {
return <div className="p-6 text-center">Відео не знайдено</div>
}

return (
<div className="max-w-4xl mx-auto p-6 space-y-6">
<h1 className="text-3xl font-bold">{video.title}</h1>
<div className="flex space-x-4 mb-6"> <a href="/video" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" > Перейти до відео </a> <a href="/profile" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" > Мій профіль </a> </div>

<p className="text-sm text-gray-500">
Додано: {new Date(video.createdAt).toLocaleString()} | Автор: {video.user.name}
</p>


<div className="w-full aspect-video max-w-4xl mx-auto bg-black rounded-xl overflow-hidden"> <div className="relative w-full h-full"> <video src={video.url} controls poster={video.thumbnail || undefined} className="absolute top-0 left-0 w-full h-full object-contain" /> </div> </div>
  <p className="whitespace-pre-wrap">{video.description}</p>
  <div className="flex items-center space-x-6">
    <div>{video._count.views} переглядів</div>
    <RecordViewClient videoId={video.id} />
    <LikeButton videoId={video.id} initialCount={video._count.likes} />
    <div>{video._count.comments} коментарів</div>
  </div>

  <CommentsSection videoId={video.id} />
</div>
)
}