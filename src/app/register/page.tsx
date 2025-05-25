'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
const router = useRouter()
const [email, setEmail] = useState('')
const [name, setName] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState('')
const [success, setSuccess] = useState('')

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault()


if (!email || !password || !name) {
  setError('Усі поля обовʼязкові')
  return
}

const res = await fetch('/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password, name }),
})

let data
try {
  data = await res.json()
} catch (error) {
  data = { message: 'Невідома помилка сервера' }
}

if (!res.ok) {
  setError(data.message || 'Помилка при реєстрації')
} else {
  setSuccess('Успішно зареєстровано!')
  router.push('/login')
}
}

return (
<div className="min-h-screen flex items-center justify-center px-4">
<form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-md w-full" >
<h1 className="text-xl font-bold mb-4">Реєстрація</h1>


    {error && <p className="text-red-600 mb-2">{error}</p>}
    {success && <p className="text-green-600 mb-2">{success}</p>}

    <input
      type="text"
      placeholder="Імʼя"
      value={name}
      onChange={e => setName(e.target.value)}
      className="w-full p-2 border rounded mb-3"
    />
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      className="w-full p-2 border rounded mb-3"
    />
    <input
      type="password"
      placeholder="Пароль"
      value={password}
      onChange={e => setPassword(e.target.value)}
      className="w-full p-2 border rounded mb-4"
    />
    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
    >
      Зареєструватися
    </button>
    <div className="mt-4 text-center"> <p> Вже є акаунт?{" "} <a href="/login" className="text-blue-600 hover:underline font-semibold" > Увійти </a> </p> </div>
  </form>
</div>
)
}