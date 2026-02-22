import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f1f6071c`;

console.log('🔧 API Configuration:', {
  projectId,
  baseUrl: BASE_URL,
  hasPublicAnonKey: !!publicAnonKey,
  publicAnonKeyLength: publicAnonKey?.length
});

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ambulance' | 'hospital' | 'traffic';
  badge_number?: string;
}

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  contact: string;
  address?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Incident {
  id: string;
  ambulance_driver_id: string;
  ambulance_driver_name: string;
  severity: string;
  hospital_id: string;
  patient_info: string;
  accident_location: Location;
  current_location: Location;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  last_updated?: string;
}

function getAuthHeader(): string {
  const token = localStorage.getItem('access_token');
  
  // CRITICAL: Ensure publicAnonKey is always available
  if (!publicAnonKey) {
    console.error('CRITICAL ERROR: publicAnonKey is undefined!');
    throw new Error('Public anon key not available');
  }
  
  console.log('getAuthHeader called:', {
    hasToken: !!token,
    publicAnonKeyLength: publicAnonKey.length,
    publicAnonKeyPreview: publicAnonKey.substring(0, 30) + '...'
  });
  
  // For public endpoints (hospitals, incidents), always use anon key
  // Only user-specific endpoints need the user token
  if (token) {
    try {
      // Basic JWT validation - check if it's expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      
      if (Date.now() >= expirationTime) {
        console.log('Token expired, clearing and using public key');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        return `Bearer ${publicAnonKey}`;
      }
      
      console.log('Using user token (valid)');
      return `Bearer ${token}`;
    } catch (error) {
      console.log('Token validation error, clearing and using public key:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      return `Bearer ${publicAnonKey}`;
    }
  }
  
  console.log('No token, using public anon key');
  return `Bearer ${publicAnonKey}`;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  skipAuth: boolean = false
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Only add Authorization header if not explicitly skipped
  if (!skipAuth) {
    const authHeader = getAuthHeader();
    console.log(`Adding Authorization header for ${endpoint}:`, authHeader.substring(0, 30) + '...');
    headers['Authorization'] = authHeader;
  }
  
  Object.assign(headers, options.headers);

  console.log(`Making request to ${endpoint}:`, {
    url,
    method: options.method || 'GET',
    headers
  });

  try {
    const response = await fetch(url, { ...options, headers });
    
    // Log response details for debugging
    console.log(`API ${options.method || 'GET'} ${endpoint}:`, {
      url,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    
    const data = await response.json();

    if (!response.ok) {
      // If we get 401 with "Invalid JWT", clear the stored token
      if (response.status === 401 && data.message === 'Invalid JWT') {
        console.warn('Invalid JWT detected, clearing stored token');
        localStorage.removeItem('access_token');
        // Retry the request without the invalid token
        if (!skipAuth) {
          console.log('Retrying request without authentication');
          return request(endpoint, options, true);
        }
      }
      
      const errorMessage = data.error || data.message || `Request failed with status ${response.status}: ${response.statusText}`;
      console.error(`API Error for ${endpoint}:`, errorMessage, data);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Network error: ${String(error)}`);
  }
}

// Auth
export async function signup(
  email: string,
  password: string,
  name: string,
  role: 'ambulance' | 'hospital' | 'traffic',
  badge_number?: string
): Promise<{ success: boolean; user: User }> {
  return request('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role, badge_number }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<{ access_token: string; user: User }> {
  const data = await request<{ access_token: string; user: User }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Store token
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Hospitals
export async function getHospitals(): Promise<Hospital[]> {
  return request('/hospitals');
}

export async function addHospital(data: {
  name: string;
  lat: number;
  lng: number;
  contact?: string;
  address?: string;
}): Promise<{ success: boolean; hospital: Hospital }> {
  return request('/hospitals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Geocoding - search for hospitals using Nominatim
export async function searchHospital(query: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query + ' hospital')}&format=json&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Geocoding error:', error);
    // Return empty array instead of throwing to allow graceful degradation
    return [];
  }
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Calculate ETA in minutes (assuming average speed of 60 km/h for ambulance)
export function calculateETA(distanceKm: number, speedKmh: number = 60): number {
  return Math.round((distanceKm / speedKmh) * 60); // Convert to minutes
}

// Incidents
export async function createIncident(data: {
  severity: string;
  hospital_id: string;
  patient_info: string;
  accident_location: Location;
}): Promise<{ success: boolean; incident: Incident }> {
  return request('/incidents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getIncident(id: string): Promise<Incident> {
  return request(`/incidents/${id}`);
}

export async function getActiveIncidents(): Promise<Incident[]> {
  return request('/incidents');
}

export async function updateIncidentLocation(
  id: string,
  location: Location
): Promise<{ success: boolean; location: Location }> {
  return request(`/incidents/${id}/location`, {
    method: 'PUT',
    body: JSON.stringify(location),
  });
}

export async function updateIncidentStatus(
  id: string,
  status: 'active' | 'completed' | 'cancelled'
): Promise<{ success: boolean; incident: Incident }> {
  return request(`/incidents/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// Delete incident
export async function deleteIncident(id: string): Promise<{ success: boolean }> {
  return request(`/incidents/${id}`, {
    method: 'DELETE',
  });
}