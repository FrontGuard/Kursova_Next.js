import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma'; // або '../../../../lib/prisma' залежно від вашої структури

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        videos: {
          where: { isBlocked: false },
          select: {
            id: true,
            title: true,
            thumbnail: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Користувача не знайдено' },
        { status: 404 }
      );
    }

    // Додаємо console.log перед відправкою відповіді
    console.log('API /api/channel/[id] → Відео автора:', user.videos);

    return NextResponse.json({
      name: user.name,
      videos: user.videos,
    });
  } catch (error) {
    console.error('Channel API error:', error);
    return NextResponse.json(
      { message: 'Серверна помилка' },
      { status: 500 }
    );
  }
}