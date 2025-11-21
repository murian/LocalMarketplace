'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

function NewMessageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()

  const userId = searchParams.get('userId')
  const itemId = searchParams.get('itemId')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && userId) {
      const url = itemId
        ? `/messages/${userId}?itemId=${itemId}`
        : `/messages/${userId}`
      router.push(url)
    }
  }, [status, userId, itemId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting...</p>
    </div>
  )
}

export default function NewMessagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <NewMessageContent />
    </Suspense>
  )
}
