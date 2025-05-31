import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      where: { isBlocked: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    console.log('✅ API /api/video → Знайдено відео:', videos.length);
    // Додаємо console.log перед відправкою відповіді
    console.log('API /api/video → Список відео:', videos);

    return NextResponse.json(videos);
  } catch (error) {
    console.error('❌ API /api/video → Помилка:', error);
    return NextResponse.json({ message: 'Помилка сервера' }, { status: 500 });
  }
}