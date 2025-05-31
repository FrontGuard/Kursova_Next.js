'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../../styles/custom.css' // Імпорт кастомних стилів
export const dynamic = 'force-dynamic'

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
<div className="register-page">
<form onSubmit={handleSubmit} className="register-form">
<h1>Реєстрація</h1>


    {error && <p className="error">{error}</p>}
    {success && <p className="success">{success}</p>}

    <input
      type="text"
      placeholder="Імʼя"
      value={name}
      onChange={e => setName(e.target.value)}
    />
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={e => setEmail(e.target.value)}
    />
    <input
      type="password"
      placeholder="Пароль"
      value={password}
      onChange={e => setPassword(e.target.value)}
    />
    <button type="submit">Зареєструватися</button>

    <div className="redirect">
      Вже є акаунт? <a href="/login">Увійти</a>
    </div>
  </form>
</div>
)
}