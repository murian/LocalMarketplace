import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getBoundingBox, filterItemsByDistance } from '@/lib/geolocation'

const createItemSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().nullable(),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
  category: z.string().min(2),
  images: z.array(z.string()).min(1),
  latitude: z.number(),
  longitude: z.number(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = createItemSchema.parse(body)

    const item = await prisma.item.create({
      data: {
        ...data,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(item, { status: 201 })
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const latitude = parseFloat(searchParams.get('latitude') || '')
    const longitude = parseFloat(searchParams.get('longitude') || '')
    const category = searchParams.get('category')
    const maxPrice = searchParams.get('maxPrice')
    const condition = searchParams.get('condition')
    const search = searchParams.get('search')

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Valid latitude and longitude required' },
        { status: 400 }
      )
    }

    // Get bounding box for efficient database query
    const bbox = getBoundingBox(latitude, longitude, 500)

    // Build where clause
    const where: any = {
      status: 'available',
      latitude: {
        gte: bbox.minLat,
        lte: bbox.maxLat,
      },
      longitude: {
        gte: bbox.minLon,
        lte: bbox.maxLon,
      },
    }

    if (category) {
      where.category = category
    }

    if (maxPrice) {
      where.price = {
        lte: parseFloat(maxPrice),
      }
    }

    if (condition) {
      where.condition = condition
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Filter items within 500m radius and add distance
    const nearbyItems = filterItemsByDistance(items, latitude, longitude, 500)

    return NextResponse.json(nearbyItems)
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
