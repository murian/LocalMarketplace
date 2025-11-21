/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Filter items that are within the specified radius (default 500m)
 */
export function filterItemsByDistance<T extends { latitude: number; longitude: number }>(
  items: T[],
  userLat: number,
  userLon: number,
  maxDistance: number = 500
): (T & { distance: number })[] {
  return items
    .map(item => ({
      ...item,
      distance: calculateDistance(userLat, userLon, item.latitude, item.longitude)
    }))
    .filter(item => item.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
}

/**
 * Calculate approximate bounding box for database query optimization
 * Returns {minLat, maxLat, minLon, maxLon}
 */
export function getBoundingBox(
  lat: number,
  lon: number,
  radiusInMeters: number = 500
) {
  const latDelta = (radiusInMeters / 111320) // 1 degree latitude ≈ 111.32 km
  const lonDelta = radiusInMeters / (111320 * Math.cos((lat * Math.PI) / 180))

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  }
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1) return 'Less than 1m'
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(2)}km`
}
