import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ liked: false });

  const { searchParams } = new URL(req.url, 'http://localhost:3000/');
  const videoId = searchParams.get("videoId");
  if (!videoId) return NextResponse.json({ liked: false });

  // Безпечно отримуємо email користувача з сесії
  const userEmail = session.user.email;
  if (!userEmail) return NextResponse.json({ liked: false });

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });
  if (!user) return NextResponse.json({ liked: false });

  const like = await prisma.like.findUnique({
    where: {
      userId_videoId: {
        userId: user.id,
        videoId,
      },
    },
  });

  return NextResponse.json({ liked: !!like });
}
