import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET() {
const session = await getServerSession(authOptions)

if (!session || session.user.role !== 'ADMIN') {
return new Response('Unauthorized', { status: 401 })
}

const videos = await prisma.video.findMany({
orderBy: { createdAt: 'desc' },
select: { id: true, title: true },
})

return Response.json(videos)
}