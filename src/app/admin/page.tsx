'use client'


import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Video {
id: string
title: string
}

interface User {
id: string
name: string
email: string
role: string
}

export default function AdminPage() {
const { data: session, status } = useSession()
const router = useRouter()
const [videos, setVideos] = useState<Video[]>([])
const [users, setUsers] = useState<User[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
if (status === 'loading') return
if (!session || session.user.role !== 'ADMIN') {
router.push('/')
}
}, [session, status, router])

useEffect(() => {
const fetchData = async () => {
try {
const [videosRes, usersRes] = await Promise.all([
fetch('/api/admin/videos'),
fetch('/api/admin/users'),
])
if (!videosRes.ok || !usersRes.ok) throw new Error('Помилка завантаження даних')


    const videosData = await videosRes.json()
    const usersData = await usersRes.json()
    setVideos(videosData)
    setUsers(usersData)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

fetchData()
}, [])

const handleDeleteVideo = async (id: string) => {
const confirmed = confirm('Точно видалити відео?')
if (!confirmed) return


try {
  const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Не вдалося видалити відео')
  setVideos((prev) => prev.filter((v) => v.id !== id))
} catch (err) {
  console.error(err)
  alert('Помилка під час видалення відео')
}
}

const handleDeleteUser = async (id: string) => {
const confirmed = confirm('Видалити користувача?')
if (!confirmed) return
if (id === session?.user.id) {
return alert('Не можна видалити себе')
}


try {
  const res = await fetch(`/api/admin/deleteUser/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Не вдалося видалити користувача')
  setUsers((prev) => prev.filter((u) => u.id !== id))
} catch (err) {
  console.error(err)
  alert('Помилка при видаленні користувача')
}
}

if (loading) return <p className="p-6 text-center">Завантаження...</p>

return (
<div className="p-6">
<h1 className="text-2xl font-bold mb-4">Адмін-панель</h1>


  <h2 className="text-xl font-semibold mb-2">Відео</h2>
  {videos.length === 0 ? (
    <p>Немає відео</p>
  ) : (
    <ul className="space-y-4 mb-10">
      {videos.map((video) => (
        <li key={video.id} className="border p-4 rounded">
          <h2 className="text-lg font-semibold">{video.title}</h2>
          <button
            onClick={() => handleDeleteVideo(video.id)}
            className="mt-2 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Видалити
          </button>
        </li>
      ))}
    </ul>
  )}

  <h2 className="text-xl font-semibold mb-2">Користувачі</h2>
  {users.length === 0 ? (
    <p>Немає користувачів</p>
  ) : (
    <ul className="space-y-4">

      {users.map((user) => (

<li key={user.id} className="border p-4 rounded"> <p> <strong>{user.name}</strong> ({user.email}) – {user.role} </p> {user.role !== "ADMIN" && ( <button onClick={() => handleDeleteUser(user.id)} className="mt-2 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" > Видалити </button> )} </li>))}
    </ul>
  )}
</div>
)
}