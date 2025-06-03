import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // Змінено імпорт
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import bcryptjs from 'bcryptjs';

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Не авторизовано' }, { status: 401 });
  }

  const { name, password } = await req.json();

  try {
    const data: any = {};
    if (name) data.name = name;
    if (password) data.password = await bcryptjs.hash(password, 10);

    await prisma.user.update({
      where: { email: session.user.email },
      data,
    });

    return NextResponse.json({ message: 'Дані успішно оновлено' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Помилка оновлення даних' }, { status: 500 });
  }
}