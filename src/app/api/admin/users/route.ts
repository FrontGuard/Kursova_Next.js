import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log("Session in /api/admin/users:", session); // Додано console.log

  if (!session || session?.user?.role?.toLowerCase() !== "admin") {
  return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
}

  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Помилка при отриманні користувачів:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}