import { getServerSession } from "next-auth"; // Змінено імпорт
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Видалити всі відео та зв'язані записи користувача
    await prisma.comment.deleteMany({ where: { userId: user.id } });
    await prisma.like.deleteMany({ where: { userId: user.id } });
    await prisma.view.deleteMany({ where: { userId: user.id } });
    await prisma.video.deleteMany({ where: { userId: user.id } });

    // Нарешті — видалення самого користувача
    await prisma.user.delete({ where: { id: user.id } });

    return new NextResponse("Account deleted", { status: 200 });
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);
    return new NextResponse("Error deleting account", { status: 500 });
  }
}