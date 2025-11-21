'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MessagesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchConversations()
    }
  }, [status, router])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages')
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      const data = await response.json()
      setConversations(data)
    } catch (error: any) {
      setError(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-800">
            ← Back to home
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No conversations yet</p>
              <Link
                href="/"
                className="mt-4 inline-block text-primary-600 hover:text-primary-800"
              >
                Browse items to start chatting
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conv) => (
                <Link
                  key={conv.user.id}
                  href={`/messages/${conv.user.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {conv.user.name}
                          </h3>
                          {conv.unreadCount > 0 && (
                            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage.item && (
                          <p className="text-sm text-gray-500 mb-1">
                            Re: {conv.lastMessage.item.title}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {conv.lastMessage.content}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 ml-4">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
