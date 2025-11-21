import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        createdAt: true,
        receivedReviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            reviewer: {
              select: {
                id: true,
                name: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate average rating
    const avgRating = user.receivedReviews.length > 0
      ? user.receivedReviews.reduce((sum, review) => sum + review.rating, 0) / user.receivedReviews.length
      : 0

    return NextResponse.json({
      ...user,
      avgRating,
      reviewCount: user.receivedReviews.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
