import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { NextRequest } from 'next/server'

export async function DELETE(
req: NextRequest,
{ params }: { params: { id: string } }
) {
const session = await getServerSession(authOptions)

if (!session || session.user.role !== 'ADMIN') {
return new Response('Unauthorized', { status: 401 })
}

try {
await prisma.video.delete({
where: { id: params.id },
})
return new Response('Deleted', { status: 200 })
} catch (error) {
console.error('Delete error:', error)
return new Response('Failed to delete video', { status: 500 })
}
}