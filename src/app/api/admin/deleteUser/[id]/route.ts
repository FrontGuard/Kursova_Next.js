import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { NextRequest } from "next/server"

export async function DELETE(
req: NextRequest,
{ params }: { params: { id: string } }
) {
const session = await getServerSession(authOptions)

if (!session || session.user.role !== "ADMIN") {
return new Response("Unauthorized", { status: 401 })
}

if (params.id === session.user.id) {
return new Response("You cannot delete yourself", { status: 400 })
}

try {
await prisma.comment.deleteMany({ where: { userId: params.id } })
await prisma.like.deleteMany({ where: { userId: params.id } })
await prisma.view.deleteMany({ where: { userId: params.id } })
await prisma.video.deleteMany({ where: { userId: params.id } })


await prisma.user.delete({ where: { id: params.id } })

return new Response("User deleted", { status: 200 })
} catch (error) {
console.error("User deletion error:", error)
return new Response("Error deleting user", { status: 500 })
}
}