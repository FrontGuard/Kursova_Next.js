import { prisma } from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'

export async function POST(request: Request) {
try {
const { email, password, name } = await request.json()
if (!email || !password || !name) {
  return NextResponse.json({ message: 'Усі поля обовʼязкові' }, { status: 400 })
}

const existingUser = await prisma.user.findUnique({ where: { email } })

if (existingUser) {
  return NextResponse.json({ message: 'Користувач вже існує' }, { status: 400 })
}

const hashedPassword = await bcryptjs.hash(password, 10)

await prisma.user.create({
  data: {
    email,
    name,
    password: hashedPassword,
  },
})

return NextResponse.json({ message: 'Успішно зареєстровано' }, { status: 201 })
} catch (error) {
console.error('Помилка реєстрації:', error)
return NextResponse.json({ message: 'Щось пішло не так' }, { status: 500 })
}

}