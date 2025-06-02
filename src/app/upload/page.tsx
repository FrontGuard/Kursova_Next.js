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
<div className="upload-page-container">
<form onSubmit={handleSubmit} className="upload-form" encType="multipart/form-data" >
<h1 className="upload-title">Завантаження відео</h1>


    {error && <p className="upload-error">{error}</p>}
    {success && <p className="upload-success">{success}</p>}

    <input
      type="text"
      placeholder="Назва"
      value={title}
      onChange={e => setTitle(e.target.value)}
      className="upload-input"
    />

    <textarea
      placeholder="Опис (необов’язково)"
      value={description}
      onChange={e => setDescription(e.target.value)}
      className="upload-textarea"
    />    <label htmlFor="video-file" className="upload-label">Відеофайл</label>
    <input
      id="video-file"
      type="file"
      accept="video/*"
      onChange={e => setVideoFile(e.target.files?.[0] || null)}
      className="upload-file"
    />

    <label htmlFor="thumbnail-file" className="upload-label">Заставка (thumbnail)</label>
    <input
      id="thumbnail-file"
      type="file"
      accept="image/*"
      onChange={e => setThumbFile(e.target.files?.[0] || null)}
      className="upload-file"
    />

    <button type="submit" className="upload-button">
      Завантажити
    </button>
  </form>
</div>
)
}