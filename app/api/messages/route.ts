import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const sendMessageSchema = z.object({
  content: z.string().min(1).max(1000),
  receiverId: z.string(),
  itemId: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = sendMessageSchema.parse(body)

    if (data.receiverId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        content: data.content,
        senderId: session.user.id,
        receiverId: data.receiverId,
        itemId: data.itemId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
        item: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json(message, { status: 201 })
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const otherUserId = searchParams.get('userId')

    if (otherUserId) {
      // Get conversation with specific user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: session.user.id,
              receiverId: otherUserId,
            },
            {
              senderId: otherUserId,
              receiverId: session.user.id,
            },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
            },
          },
          item: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: session.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      })

      return NextResponse.json(messages)
    }

    // Get all conversations
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
        item: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Group by conversation (other user)
    const conversations = new Map()

    messages.forEach((message) => {
      const otherUser =
        message.senderId === session.user.id
          ? message.receiver
          : message.sender

      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
        })
      }

      // Count unread messages from other user
      if (
        message.receiverId === session.user.id &&
        !message.read
      ) {
        const conv = conversations.get(otherUser.id)
        conv.unreadCount++
      }
    })

    return NextResponse.json(Array.from(conversations.values()))
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
