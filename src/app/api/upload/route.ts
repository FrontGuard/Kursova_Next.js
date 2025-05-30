export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';
import fs from 'fs';
import path from 'path';


export async function POST(request: Request) {
  // 1. Перевірка сесії
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Неавторизовано' }, { status: 401 });
  }

  // 2. Парсимо multipart через Web API
  const formData = await request.formData();
  const title = formData.get('title')?.toString() || '';
  const description = formData.get('description')?.toString() || '';
  const videoFile = formData.get('video') as File | null;
  const thumbFile = formData.get('thumbnail') as File | null;

  if (!title || !videoFile || !thumbFile) {
    return NextResponse.json(
      { message: 'Назва, відео та заставка обовʼязкові' },
      { status: 400 }
    );
  }

  // 3. Створюємо папку public/uploads, якщо нема
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.promises.mkdir(uploadDir, { recursive: true });

  // 4. Генеруємо унікальні назви і записуємо файли
  const saveFile = async (file: File) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  };

  let videoPath: string, thumbPath: string;
  try {
    videoPath = await saveFile(videoFile);
    thumbPath = await saveFile(thumbFile);
  } catch (e) {
    console.error('FS Error:', e);
    return NextResponse.json(
      { message: 'Помилка збереження файлів' },
      { status: 500 }
    );
  }

  // 5. Знаходимо користувача
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json(
      { message: 'Користувач не знайдений' },
      { status: 404 }
    );
  }

  // 6. Запис у БД
  try {
    const video = await prisma.video.create({
      data: {
        title,
        description,
        url: videoPath,
        thumbnail: thumbPath,
        userId: user.id,
      },
    });
    return NextResponse.json(video, { status: 201 });
  } catch (e) {
    console.error('Prisma Error:', e);
    return NextResponse.json(
      { message: 'Серверна помилка при створенні відео' },
      { status: 500 }
    );
  }
}