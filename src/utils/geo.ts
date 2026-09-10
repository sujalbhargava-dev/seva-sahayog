import { PLATFORM_DEFAULTS } from './constants';

/**
 * Calculate the Haversine distance between two geographic points.
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = PLATFORM_DEFAULTS.EARTH_RADIUS_KM;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Normalize a distance to a 0-1 score.
 * Closer distance = higher score.
 * @param distance Distance in km
 * @param maxRadius Maximum search radius in km
 */
export function distanceToScore(distance: number, maxRadius: number): number {
  if (distance >= maxRadius) return 0;
  return 1 - distance / maxRadius;
}
