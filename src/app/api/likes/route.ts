import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { videoId } = await req.json();
  if (!videoId) return new NextResponse("Missing videoId", { status: 400 });

  // Безпечно отримуємо email користувача з сесії
  const userEmail = session.user.email;
  if (!userEmail) return new NextResponse("User email not found in session", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const existing = await prisma.like.findUnique({
    where: {
      userId_videoId: {
        userId: user.id,
        videoId,
      },
    },
  });

  let liked = false;
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({
      data: { userId: user.id, videoId },
    });
    liked = true;
  }

  const count = await prisma.like.count({ where: { videoId } });

  return NextResponse.json({ liked, count });
}