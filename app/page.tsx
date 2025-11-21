'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import ItemCard from '@/components/ItemCard'

const CATEGORIES = [
  'All',
  'Electronics',
  'Furniture',
  'Clothing',
  'Books',
  'Sports',
  'Home & Garden',
  'Toys',
  'Other',
]

export default function Home() {
  const { data: session } = useSession()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  // Filters
  const [category, setCategory] = useState('All')
  const [maxPrice, setMaxPrice] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          setError('Unable to get your location. Please enable location services.')
          setLoading(false)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser.')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!location) return

    async function fetchItems() {
      if (!location) return // Additional null check for TypeScript

      setLoading(true)
      try {
        const params = new URLSearchParams({
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
        })

        if (category !== 'All') {
          params.append('category', category)
        }

        if (maxPrice) {
          params.append('maxPrice', maxPrice)
        }

        if (search) {
          params.append('search', search)
        }

        const response = await fetch(`/api/items?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch items')
        }

        const data = await response.json()
        setItems(data)
        setError('')
      } catch (error: any) {
        setError(error.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [location, category, maxPrice, search])

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Local Marketplace</h1>
              <p className="text-sm text-gray-600">Items within 500m of you</p>
            </div>
            <div className="flex gap-4">
              {session ? (
                <>
                  <Link
                    href="/items/new"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                  >
                    List Item
                  </Link>
                  <Link
                    href="/messages"
                    className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Messages
                  </Link>
                  <Link
                    href="/profile"
                    className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search items..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                id="maxPrice"
                placeholder="Any price"
                min="0"
                step="1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading items near you...</p>
          </div>
        )}

        {/* No Location */}
        {!loading && !location && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">
              Please enable location services to see items near you.
            </p>
          </div>
        )}

        {/* Items Grid */}
        {!loading && location && items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No items found within 500m of your location.</p>
            {session && (
              <Link
                href="/items/new"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
              >
                Be the first to list an item!
              </Link>
            )}
          </div>
        )}

        {!loading && location && items.length > 0 && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Found {items.length} {items.length === 1 ? 'item' : 'items'} near you
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
