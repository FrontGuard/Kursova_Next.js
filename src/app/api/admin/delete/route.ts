import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  console.log("Session in /api/admin/delete:", session); // Log session

  if (!session || session?.user?.role?.toLowerCase() !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const { videoId } = await req.json();
    console.log("Attempting to delete video with ID:", videoId); // Log videoId

    if (!videoId || typeof videoId !== 'string') {
      return new NextResponse('Invalid videoId in request body', { status: 400 });
    }

    const deletedVideo = await prisma.video.delete({
      where: { id: videoId },
    });

    console.log("Successfully deleted video:", deletedVideo); // Log successful deletion

    return new NextResponse('Deleted', { status: 200 });
  } catch (error) {
    console.error('Delete error:', error);
    return new NextResponse('Failed to delete video', { status: 500 });
  }
}