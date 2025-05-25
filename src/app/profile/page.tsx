'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Video {
id: string
title: string
}

export default function ProfilePage() {
const { data: session, status } = useSession()
const router = useRouter()
const [videos, setVideos] = useState<Video[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
if (status === 'loading') return
if (!session) {
router.push('/login')
}
}, [session, status, router])

useEffect(() => {
const fetchVideos = async () => {
try {
const res = await fetch('/api/profile/videos', {
credentials: 'include'
})
if (!res.ok) throw new Error('Помилка завантаження відео')
const data = await res.json()
setVideos(data)
} catch (err) {
console.error(err)
} finally {
setLoading(false)
}
}


fetchVideos()
}, [])

const handleDeleteVideo = async (id: string) => {
const confirmed = confirm('Ви дійсно хочете видалити це відео?')
if (!confirmed) return


try {
  const res = await fetch(`/api/videos/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  if (!res.ok) throw new Error('Не вдалося видалити відео')
  setVideos(prev => prev.filter(v => v.id !== id))
} catch (err) {
  console.error(err)
  alert('Помилка під час видалення відео')
}
}

const handleDeleteAccount = async () => {
const confirmed = confirm(
'Ви дійсно хочете видалити свій акаунт? Це дію неможливо скасувати.'
)
if (!confirmed) return


try {
  const res = await fetch('/api/profile/deleteAccount', {
    method: 'DELETE',
    credentials: 'include'
  })
  if (!res.ok) throw new Error('Не вдалося видалити акаунт')
  router.push('/login')
} catch (err) {
  console.error(err)
  alert('Помилка при видаленні акаунта')
}
}

if (loading) return <p className="p-6 text-center">Завантаження...</p>

return (
<div className="p-6">
<h1 className="text-2xl font-bold mb-4">Профіль</h1>


  {session && (
    <div className="mb-6 border p-4 rounded bg-gray-100">
      <p><strong>Імʼя:</strong> {session.user.name}</p>
      <p><strong>Email:</strong> {session.user.email}</p>
      <button
        onClick={handleDeleteAccount}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Видалити акаунт
      </button>
    </div>
  )}
  <h2 className="text-xl font-semibold mb-2">Мої відео</h2>
  {videos.length === 0 ? (
    <p>Ви ще не додали жодного відео</p>
  ) : (
    <ul className="space-y-4">
      {videos.map(video => (
        <li key={video.id} className="border p-4 rounded">
          <h3 className="text-lg font-semibold">{video.title}</h3>
          <button
            onClick={() => handleDeleteVideo(video.id)}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Видалити
          </button>
        </li>
         ))}
    </ul>
     )}
<div className="flex space-x-4 mb-6"> <a href="/video" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" > Перейти до відео </a> <a href="/login" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700" > Змінити акаунт </a> </div>
<div className="mb-6"> <a href="/upload" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" > Завантажити відео </a> </div>
</div>

)
}