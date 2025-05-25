import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
const session = await getServerSession(authOptions)
if (!session?.user?.email)
return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

const { videoId } = await req.json()
const user = await prisma.user.findUnique({
where: { email: session.user.email },
})

if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

// Перевірити, чи користувач вже переглядав
const existing = await prisma.view.findFirst({
where: { userId: user.id, videoId },
})

if (existing) return NextResponse.json({ message: "Already viewed" })

await prisma.view.create({  
data: { videoId, userId: user.id },
})

return NextResponse.json({ success: true })
}