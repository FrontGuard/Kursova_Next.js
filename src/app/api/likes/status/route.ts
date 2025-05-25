import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
const session = await getServerSession(authOptions);
if (!session) return Response.json({ liked: false });

const { searchParams } = new URL(req.url);
const videoId = searchParams.get("videoId");
if (!videoId) return Response.json({ liked: false });

const user = await prisma.user.findUnique({
where: { email: session.user.email },
});
if (!user) return Response.json({ liked: false });

const like = await prisma.like.findUnique({
where: {
userId_videoId: {
userId: user.id,
videoId,
},
},
});

return Response.json({ liked: !!like });
}