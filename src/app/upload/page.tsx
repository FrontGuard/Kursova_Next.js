'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!title || !videoFile || !thumbFile) {
      setError('Назва, відео та заставка обов’язкові')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('video', videoFile)
    formData.append('thumbnail', thumbFile)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    let data
    try {
      data = await res.json()
    } catch {
      data = { message: 'Невідома помилка сервера' }
    }

    if (!res.ok) {
      setError(data.message || 'Помилка при завантаженні')
    } else {
      setSuccess('Відео успішно додано')
      router.push('/video')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow max-w-md w-full"
        encType="multipart/form-data"
      >
        <h1 className="text-xl font-bold mb-4">Завантаження відео</h1>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">{success}</p>}

        <input
          type="text"
          placeholder="Назва"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <textarea
          placeholder="Опис (необов’язково)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <label className="block mb-2 font-medium">Відеофайл</label>
        <input
          type="file"
          accept="video/*"
          onChange={e => setVideoFile(e.target.files?.[0] || null)}
          className="w-full mb-4"
        />

        <label className="block mb-2 font-medium">Заставка (thumbnail)</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setThumbFile(e.target.files?.[0] || null)}
          className="w-full mb-4"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Завантажити
        </button>
      </form>
    </div>
  )
}
