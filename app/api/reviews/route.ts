import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
  reviewedUserId: z.string(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = createReviewSchema.parse(body)

    if (data.reviewedUserId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot review yourself' },
        { status: 400 }
      )
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        reviewerId_reviewedUserId: {
          reviewerId: session.user.id,
          reviewedUserId: data.reviewedUserId,
        },
      },
    })

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: {
          reviewerId_reviewedUserId: {
            reviewerId: session.user.id,
            reviewedUserId: data.reviewedUserId,
          },
        },
        data: {
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
            },
          },
          reviewedUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return NextResponse.json(updatedReview)
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        reviewerId: session.user.id,
        reviewedUserId: data.reviewedUserId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
        reviewedUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
