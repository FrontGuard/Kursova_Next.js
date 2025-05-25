import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
const session = await getServerSession(authOptions);
if (!session) return new Response("Unauthorized", { status: 401 });

const { videoId } = await req.json();
const user = await prisma.user.findUnique({
where: { email: session.user.email },
});
if (!user) return new Response("User not found", { status: 404 });

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

return Response.json({ liked, count });
}