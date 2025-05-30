import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../..//lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("Token in /api/admin/videos:", token);

  if (!token || token.role?.toLowerCase() !== "admin") { // Змінено перевірку регістру
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return NextResponse.json(videos);
}