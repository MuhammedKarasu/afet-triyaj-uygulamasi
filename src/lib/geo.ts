export type Coordinates = {
  latitude: number | null;
  longitude: number | null;
};

export function hasCoordinates<T extends Coordinates>(value: T): value is T & { latitude: number; longitude: number } {
  return typeof value.latitude === "number" && typeof value.longitude === "number";
}

export function distanceKm(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) {
  const radiusKm = 6371;
  const latDelta = toRadians(to.latitude - from.latitude);
  const lonDelta = toRadians(to.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);

  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lonDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusKm * c;
}

export function formatDistanceKm(value: number) {
  if (value < 1) return `${Math.round(value * 1000)} m`;
  return `${value.toFixed(1)} km`;
}

function toRadians(value: number) {
  return value * Math.PI / 180;
}
