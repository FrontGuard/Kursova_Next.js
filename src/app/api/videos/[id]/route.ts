import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest } from "next/server";

export async function DELETE(
req: NextRequest,
{ params }: { params: { id: string } }
) {
const session = await getServerSession(authOptions);

if (!session?.user?.id) {
return new Response("Unauthorized", { status: 401 });
}

try {
// Знаходимо відео
const video = await prisma.video.findUnique({
where: { id: params.id },
select: {
id: true,
userId: true,
},
});


if (!video) {
  return new Response("Video not found", { status: 404 });
}

// Якщо не адмін, перевіряємо чи це його відео
const isAdmin = session.user.role === "ADMIN";
const isOwner = session.user.id === video.userId;

if (!isAdmin && !isOwner) {
  return new Response("Forbidden", { status: 403 });
}

// Видаляємо зв’язані дані
await prisma.comment.deleteMany({ where: { videoId: video.id } });
await prisma.like.deleteMany({ where: { videoId: video.id } });
await prisma.view.deleteMany({ where: { videoId: video.id } });

// Видаляємо відео
await prisma.video.delete({ where: { id: video.id } });

return new Response("Deleted", { status: 200 });
} catch (error) {
console.error("DELETE error:", error);
return new Response("Error deleting video", { status: 500 });
}
}