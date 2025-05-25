import { prisma } from "../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
const session = await getServerSession(authOptions)

if (!session || session.user.role !== "ADMIN") {
return new NextResponse("Unauthorized", { status: 401 })
}

const users = await prisma.user.findMany({
select: { id: true, name: true, email: true, role: true }
})

return NextResponse.json(users)
}