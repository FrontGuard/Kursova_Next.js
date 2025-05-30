import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Не авторизовано" }, { status: 401 });
  }

  const video = await prisma.video.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });

  if (!video) {
    return NextResponse.json({ message: "Відео не знайдено" }, { status: 404 });
  }

  const isAdmin = session.user?.role === "admin";
  const isOwner = session.user?.id === video.userId;

  if (isAdmin || isOwner) {
    await prisma.video.delete({ where: { id: params.id } });

    return NextResponse.json({
      message: isAdmin
        ? "Відео видалено (адміністратором)."
        : "Відео видалено.",
    });
  }

  return NextResponse.json(
    { message: "Ви не можете видалити це відео, оскільки не є його власником." },
    { status: 403 }
  );
}
