import { Location } from './api';

/**
 * OSRM (Open Source Routing Machine) integration for real road routing
 * OSRM uses Dijkstra's algorithm internally for optimal pathfinding
 */

export interface RouteSegment {
  lat: number;
  lng: number;
}

export interface RouteResult {
  coordinates: RouteSegment[];
  distance: number; // in meters
  duration: number; // in seconds
}

/**
 * Get real road route between two points using OSRM
 * OSRM uses Dijkstra's algorithm for finding the shortest path
 */
export async function getRoute(
  start: Location,
  end: Location
): Promise<RouteResult | null> {
  try {
    // OSRM public API endpoint
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    console.log('Fetching route from OSRM:', {
      start,
      end,
      url: url.substring(0, 100) + '...'
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('OSRM request failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('OSRM returned no routes:', data);
      return null;
    }

    const route = data.routes[0];
    
    // Convert GeoJSON coordinates to our format
    // OSRM returns [lng, lat], we need {lat, lng}
    const coordinates: RouteSegment[] = route.geometry.coordinates.map(
      (coord: [number, number]) => ({
        lng: coord[0],
        lat: coord[1]
      })
    );

    const result: RouteResult = {
      coordinates,
      distance: route.distance, // meters
      duration: route.duration  // seconds
    };

    console.log('Route calculated successfully:', {
      points: coordinates.length,
      distance: `${(result.distance / 1000).toFixed(2)} km`,
      duration: `${Math.round(result.duration / 60)} min`
    });

    return result;

  } catch (error) {
    console.error('Error fetching route:', error);
    return null;
  }
}

/**
 * Get route with multiple waypoints
 * Useful for complex routing scenarios
 */
export async function getRouteWithWaypoints(
  points: Location[]
): Promise<RouteResult | null> {
  if (points.length < 2) {
    console.error('Need at least 2 points for routing');
    return null;
  }

  try {
    // Build coordinates string for OSRM
    const coords = points.map(p => `${p.lng},${p.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('OSRM request failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    
    const coordinates: RouteSegment[] = route.geometry.coordinates.map(
      (coord: [number, number]) => ({
        lng: coord[0],
        lat: coord[1]
      })
    );

    return {
      coordinates,
      distance: route.distance,
      duration: route.duration
    };

  } catch (error) {
    console.error('Error fetching route with waypoints:', error);
    return null;
  }
}

/**
 * Calculate ETA based on real route duration
 */
export function formatETA(durationSeconds: number): string {
  const minutes = Math.round(durationSeconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Format distance in human-readable format
 */
export function formatDistance(distanceMeters: number): string {
  const km = distanceMeters / 1000;
  if (km < 1) {
    return `${Math.round(distanceMeters)} m`;
  }
  return `${km.toFixed(2)} km`;
}
