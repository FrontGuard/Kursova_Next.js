'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  router.push('/profile') // або інша захищена сторінка
}
}

return (
<div className="min-h-screen flex flex-col items-center justify-center p-4">
<form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
<h1 className="text-xl font-bold mb-4">Вхід</h1>




    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      className="w-full p-2 border mb-3 rounded"
    />
    <input
      type="password"
      placeholder="Пароль"
      value={password}
      onChange={e => setPassword(e.target.value)}
      className="w-full p-2 border mb-4 rounded"
    />

    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
    >
      Увійти
    </button>
  </form>
</div>
)
}