/**
 * Calculate distance between two GPS coordinates using the Haversine formula (in meters)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // meters
}

/**
 * Format distance in meters or kilometers
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Calculate travel time in minutes based on transport mode
 */
export function calculateTravelTime(
  meters: number,
  mode: 'walk' | 'moto' | 'car'
): { minutes: number; label: string } {
  let speedKmh = 5; // walk
  if (mode === 'moto') speedKmh = 25; // Kabou-Kabou in town
  if (mode === 'car') speedKmh = 35; // car / taxi

  const km = meters / 1000;
  const hours = km / speedKmh;
  const minutes = Math.max(1, Math.round(hours * 60));

  let label = `${minutes} min`;
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    label = `${h}h${m > 0 ? ` ${m}m` : ''}`;
  }

  return { minutes, label };
}

/**
 * Estimate local price for a Kabou-Kabou (moto-taxi) or taxi in Zinder in FCFA
 */
export function estimateFareFCFA(meters: number, mode: 'moto' | 'car'): number {
  const km = meters / 1000;
  if (mode === 'moto') {
    // Base fare 200 FCFA for < 2km, + 100 FCFA / km extra
    if (km <= 2) return 200;
    return Math.min(1000, 200 + Math.round((km - 2) * 100));
  } else {
    // Taxi course: base 500 FCFA
    if (km <= 3) return 500;
    return Math.min(2500, 500 + Math.round((km - 3) * 200));
  }
}

/**
 * Generate intermediate points for smooth animation between two coordinates
 */
export function interpolatePoints(
  start: [number, number],
  end: [number, number],
  steps: number = 30
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = start[0] + (end[0] - start[0]) * t;
    const lon = start[1] + (end[1] - start[1]) * t;
    points.push([lat, lon]);
  }
  return points;
}
