import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Безпечно перевіряємо наявність сесії та ролі користувача
  if (!session || session?.user?.role?.toLowerCase() !== "admin") {
  return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
}

  // Безпечно перевіряємо ID поточного користувача
  if (params.id === session?.user?.id) {
    return new NextResponse("You cannot delete yourself", { status: 400 });
  }

  try {
    // Видалення пов'язаних даних користувача
    await prisma.comment.deleteMany({ where: { userId: params.id } });
    await prisma.like.deleteMany({ where: { userId: params.id } });
    await prisma.view.deleteMany({ where: { userId: params.id } });
    await prisma.video.deleteMany({ where: { userId: params.id } });

    // Видалення самого користувача
    await prisma.user.delete({ where: { id: params.id } });

    return new NextResponse("User deleted", { status: 200 });
  } catch (error) {
    console.error("User deletion error:", error);
    return new NextResponse("Error deleting user", { status: 500 });
  }
}
