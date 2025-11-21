import Link from 'next/link'
import Image from 'next/image'
import { formatDistance } from '@/lib/geolocation'

interface ItemCardProps {
  item: {
    id: string
    title: string
    description: string
    price: number | null
    condition: string
    category: string
    images: string[]
    user: {
      name: string
    }
    distance?: number
  }
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/items/${item.id}`} className="block">
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
        <div className="aspect-square relative bg-gray-200">
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
            {item.title}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {item.description}
          </p>
          <div className="flex items-center justify-between mb-2">
            {item.price === null ? (
              <span className="text-lg font-bold text-green-600">FREE</span>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ${item.price.toFixed(2)}
              </span>
            )}
            <span className="text-sm text-gray-500 capitalize">{item.condition}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{item.user.name}</span>
            {item.distance !== undefined && (
              <span className="font-medium text-primary-600">
                {formatDistance(item.distance)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
