import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
const videoId = req.nextUrl.searchParams.get("videoId");
if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 });

const comments = await prisma.comment.findMany({
where: { videoId },
orderBy: { createdAt: "desc" },
include: { user: { select: { name: true } } },
});

return NextResponse.json(comments);
}

// POST новий коментар
export async function POST(req: NextRequest) {
const session = await getServerSession(authOptions);
if (!session?.user?.email)
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const { text, videoId } = await req.json();
if (!text || !videoId)
return NextResponse.json({ error: "Missing fields" }, { status: 400 });

const user = await prisma.user.findUnique({ where: { email: session.user.email } });
if (!user)
return NextResponse.json({ error: "User not found" }, { status: 404 });

const comment = await prisma.comment.create({
data: {
text,
videoId,
userId: user.id,
},
include: {
user: { select: { name: true } },
},
});

return NextResponse.json(comment);
}