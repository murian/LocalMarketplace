import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function getItem(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/items/${id}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    return null
  }

  return res.json()
}

export default async function ItemPage({ params }: { params: { id: string } }) {
  const item = await getItem(params.id)
  const session = await getServerSession(authOptions)

  if (!item) {
    notFound()
  }

  const isOwner = session?.user?.id === item.userId

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link href="/" className="text-primary-600 hover:text-primary-800">
            ← Back to listings
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            <div>
              <div className="aspect-square relative bg-gray-200 rounded-lg overflow-hidden mb-4">
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              {item.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {item.images.slice(1).map((image: string, index: number) => (
                    <div key={index} className="aspect-square relative bg-gray-200 rounded overflow-hidden">
                      <Image
                        src={image}
                        alt={`${item.title} ${index + 2}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>

              <div className="mb-6">
                {item.price === null ? (
                  <span className="text-3xl font-bold text-green-600">FREE</span>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">${item.price.toFixed(2)}</span>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Condition</h2>
                  <p className="text-lg text-gray-900 capitalize">{item.condition}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">Category</h2>
                  <p className="text-lg text-gray-900">{item.category}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">Description</h2>
                  <p className="text-gray-900 whitespace-pre-wrap">{item.description}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">Seller</h2>
                  <p className="text-lg text-gray-900">{item.user.name}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">Listed</h2>
                  <p className="text-gray-900">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-2">
                  <Link
                    href={`/items/${item.id}/edit`}
                    className="block w-full bg-primary-600 text-white text-center px-6 py-3 rounded-md hover:bg-primary-700"
                  >
                    Edit Listing
                  </Link>
                  <p className="text-sm text-gray-500 text-center">This is your listing</p>
                </div>
              ) : (
                <Link
                  href={`/messages/new?userId=${item.userId}&itemId=${item.id}`}
                  className="block w-full bg-primary-600 text-white text-center px-6 py-3 rounded-md hover:bg-primary-700"
                >
                  Contact Seller
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
