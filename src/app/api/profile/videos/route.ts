import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
const session = await getServerSession(authOptions);

if (!session?.user?.email) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const videos = await prisma.video.findMany({
where: {
user: {
email: session.user.email,
},
},
select: { id: true, title: true },
orderBy: { createdAt: "desc" },
});

return NextResponse.json(videos);
}