'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../../styles/custom.css' // переконайся, що підключено

export default function LoginPage() {
const router = useRouter()
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState('')

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault()
const res = await signIn('credentials', {
redirect: false,
email,
password,
})


if (res?.error) {
  setError('Невірний email або пароль')
} else {
  router.push('/profile')
}
}

return (
<div className="auth-container">
<form onSubmit={handleSubmit} className="auth-form">
<h1 className="auth-title">Вхід до акаунту</h1>


    {error && <p className="auth-error">{error}</p>}

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      className="auth-input"
    />
    <input
      type="password"
      placeholder="Пароль"
      value={password}
      onChange={e => setPassword(e.target.value)}
      className="auth-input"
    />

    <button type="submit" className="auth-button">
      Увійти
    </button>

    <div className="auth-footer">
      <p>
        Немає акаунта?{' '}
        <a href="/register" className="auth-link">
          Зареєструватись
        </a>
      </p>
    </div>
  </form>
</div>
)
}