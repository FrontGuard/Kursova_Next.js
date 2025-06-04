export const runtime = 'nodejs';  // Потрібно для використання Node API
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import { IncomingMessage } from 'http';

// Потрібно для обробки форм з файлами
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Неавторизовано' }, { status: 401 });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.promises.mkdir(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 200 * 1024 * 1024, // 200MB
    filename: (name, ext, part) => `${Date.now()}-${part.originalFilename}`,
  });

  const parsed = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
    form.parse(req as unknown as IncomingMessage, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  const { title, description } = parsed.fields;
  const videoFile = parsed.files.video?.[0];
  const thumbnailFile = parsed.files.thumbnail?.[0];

  if (!title || !videoFile || !thumbnailFile) {
    return NextResponse.json({ message: 'Обовʼязкові поля відсутні' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ message: 'Користувач не знайдений' }, { status: 404 });
  }

  const video = await prisma.video.create({
    data: {
      title: String(title),
      description: String(description),
      url: `/uploads/${path.basename(videoFile.filepath)}`,
      thumbnail: `/uploads/${path.basename(thumbnailFile.filepath)}`,
      userId: user.id,
    },
  });

  return NextResponse.json(video, { status: 201 });
}