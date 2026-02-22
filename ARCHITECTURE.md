# 🏗️ RAKSH - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         RAKSH SYSTEM                             │
│              Emergency Response Coordination Platform            │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │   End Users      │
                    │  (Web Browser)   │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Ambulance   │    │   Hospital   │    │Traffic Police│
│  Dashboard   │    │  Dashboard   │    │  Dashboard   │
│   (React)    │    │   (React)    │    │   (React)    │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
                           ▼
                ┌──────────────────┐
                │   API Layer      │
                │  (/src/app/lib)  │
                └────────┬─────────┘
                         │
                         ▼
          ┌──────────────────────────┐
          │    Supabase Backend      │
          │                          │
          │  ┌────────────────────┐  │
          │  │  Edge Functions    │  │
          │  │  (Hono Server)     │  │
          │  └──────────┬─────────┘  │
          │             │             │
          │             ▼             │
          │  ┌────────────────────┐  │
          │  │   Authentication   │  │
          │  │    (Auth API)      │  │
          │  └────────────────────┘  │
          │             │             │
          │             ▼             │
          │  ┌────────────────────┐  │
          │  │   KV Store DB      │  │
          │  │  (PostgreSQL)      │  │
          │  └────────────────────┘  │
          │                          │
          └──────────────────────────┘
                         │
                         ▼
                ┌────────────────┐
                │  External APIs │
                │ - Geolocation  │
                │ - OpenStreetMap│
                └────────────────┘
```

---

## Data Flow

### 1. Emergency Creation Flow

```
┌─────────────┐
│  Ambulance  │  1. Driver fills emergency form
│   Driver    │     - Severity, Hospital, Patient Info
└──────┬──────┘
       │
       │ 2. Submit Emergency
       ▼
┌─────────────┐
│   Browser   │  3. Get GPS location
│ Geolocation │     navigator.geolocation.getCurrentPosition()
└──────┬──────┘
       │
       │ 4. POST /incidents
       ▼
┌─────────────┐
│  API Layer  │  5. Call createIncident()
│             │     - Serialize data
│             │     - Add auth token
└──────┬──────┘
       │
       │ 6. HTTP POST Request
       ▼
┌─────────────────┐
│  Hono Server    │  7. Verify authentication
│  /incidents     │     - Check JWT token
│                 │     - Verify role = 'ambulance'
└──────┬──────────┘
       │
       │ 8. Generate incident_id
       │    Create incident object
       ▼
┌──────────────────┐
│  KV Store        │  9. Store incident
│                  │     - kv.set('incident:{id}', data)
│  incident:uuid   │     - Add to active list
└──────┬───────────┘
       │
       │ 10. Return incident data
       ▼
┌─────────────┐
│  Ambulance  │  11. Show success
│  Dashboard  │      Update UI
│             │      Start location tracking
└─────────────┘
```

### 2. Real-time Location Update Flow

```
┌──────────────┐
│  Ambulance   │  Every 5 seconds:
│  Browser     │  1. Get current GPS location
└──────┬───────┘
       │
       │ 2. PUT /incidents/:id/location
       ▼
┌──────────────┐
│  API Layer   │  3. Call updateIncidentLocation()
└──────┬───────┘
       │
       │ 4. HTTP PUT Request
       ▼
┌──────────────┐
│ Hono Server  │  5. Verify auth
│              │  6. Update incident.current_location
└──────┬───────┘
       │
       │ 7. Update KV Store
       ▼
┌──────────────┐
│  KV Store    │  8. incident:{id}.current_location = {lat, lng}
│              │     incident:{id}.last_updated = timestamp
└──────────────┘

        ┌──────────────────────┐
        │  Meanwhile...        │
        │  Hospital & Traffic  │
        │  Polling every 5s:   │
        └──────────┬───────────┘
                   │
                   │ GET /incidents
                   ▼
        ┌──────────────────┐
        │  Hono Server     │  Fetch all active incidents
        └──────┬───────────┘
               │
               │ Read from KV Store
               ▼
        ┌──────────────────┐
        │  KV Store        │  Return latest location data
        └──────┬───────────┘
               │
               │ Return JSON
               ▼
        ┌──────────────────┐
        │  Hospital/       │  Update UI
        │  Traffic UI      │  Update map markers
        └──────────────────┘
```

### 3. Multi-Dashboard Synchronization

```
Time: T+0s
┌──────────────┐
│  Ambulance   │  Create Emergency
│  @ Location  │  Lat: 12.9716, Lng: 77.5946
└──────────────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│  Hospital    │  No data yet     │   Traffic    │  No data yet
└──────────────┘                  └──────────────┘


Time: T+5s (Auto-refresh triggers)
       │                                 │
       │  GET /incidents                 │  GET /incidents
       ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│  Hospital    │  ✓ Alert shown   │   Traffic    │  ✓ Alert shown
│              │  ✓ Location      │              │  ✓ Location
└──────────────┘  ✓ Map updated   └──────────────┘  ✓ Map updated


Time: T+10s (Location changes)
┌──────────────┐
│  Ambulance   │  Moved to new location
│              │  Lat: 12.9750, Lng: 77.5950
└──────────────┘
       │
       │  PUT /incidents/:id/location
       ▼
   [KV Store Updated]


Time: T+15s (Next auto-refresh)
       │                                 │
       │  GET /incidents                 │  GET /incidents
       ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│  Hospital    │  ✓ Updated loc   │   Traffic    │  ✓ Updated loc
│              │  ✓ Map moved     │              │  ✓ Map moved
└──────────────┘                  └──────────────┘
```

---

## Component Architecture

### Frontend Components

```
src/app/
│
├── App.tsx                      # Main app with RouterProvider
│
├── routes.tsx                   # Route configuration
│
├── lib/
│   ├── supabase.ts             # Supabase client initialization
│   └── api.ts                  # API wrapper functions
│
├── components/
│   ├── ProtectedRoute.tsx      # Authentication guard
│   ├── MapView.tsx             # Reusable map component
│   └── ui/                     # Shadcn UI components
│
└── pages/
    ├── LoginPage.tsx           # Login form
    ├── SignupPage.tsx          # Registration with role
    ├── AmbulanceDashboard.tsx  # Ambulance driver interface
    ├── HospitalDashboard.tsx   # Hospital staff interface
    └── TrafficDashboard.tsx    # Traffic police interface
```

### Backend Structure

```
supabase/functions/server/
│
├── index.tsx                   # Main Hono server
│                               # Routes:
│                               #   - POST /signup
│                               #   - POST /login
│                               #   - GET  /me
│                               #   - GET  /hospitals
│                               #   - POST /incidents
│                               #   - GET  /incidents
│                               #   - GET  /incidents/:id
│                               #   - PUT  /incidents/:id/location
│                               #   - PUT  /incidents/:id/status
│
└── kv_store.tsx               # Database utilities (protected)
```

---

## Database Schema (KV Store)

### User Profile
```typescript
Key: "user:{userId}"

Value: {
  id: string;              // Supabase auth user ID
  email: string;           // user@example.com
  name: string;            // "John Doe"
  role: string;            // "ambulance" | "hospital" | "traffic"
  badge_number?: string;   // "AMB-001" or "TP-12345"
  created_at: string;      // ISO timestamp
}
```

### Incident
```typescript
Key: "incident:{incidentId}"

Value: {
  id: string;                      // UUID
  ambulance_driver_id: string;     // User ID
  ambulance_driver_name: string;   // "John Doe"
  severity: string;                // "critical" | "severe" | "moderate" | "minor"
  hospital_id: string;             // "h1", "h2", etc.
  patient_info: string;            // "Head injury, unconscious"
  accident_location: {             // Initial accident site
    lat: number;
    lng: number;
  };
  current_location: {              // Real-time position
    lat: number;
    lng: number;
  };
  status: string;                  // "active" | "completed" | "cancelled"
  created_at: string;              // ISO timestamp
  last_updated?: string;           // ISO timestamp
}
```

### Active Incidents List
```typescript
Key: "incidents:active"

Value: string[]  // Array of incident IDs
// Example: ["uuid-1", "uuid-2", "uuid-3"]
```

### Hospitals
```typescript
Key: "hospitals"

Value: Array<{
  id: string;         // "h1", "h2", etc.
  name: string;       // "Victoria Hospital"
  lat: number;        // 12.9716
  lng: number;        // 77.5946
  contact: string;    // "+91-80-2670-1150"
}>
```

---

## Authentication Flow

```
┌──────────────┐
│   Browser    │
│  (New User)  │
└──────┬───────┘
       │
       │ 1. Fill signup form
       ▼
┌──────────────┐
│ POST /signup │
└──────┬───────┘
       │
       │ 2. Validate data
       ▼
┌─────────────────────┐
│ Supabase Auth       │
│ .admin.createUser() │  3. Create auth user
│                     │     - email
│                     │     - password
│                     │     - user_metadata: { name, role }
└──────┬──────────────┘
       │
       │ 4. Get user.id
       ▼
┌──────────────────┐
│  KV Store        │  5. Store profile
│  user:{id}       │     - name, role, badge_number
└──────┬───────────┘
       │
       │ 6. Return success
       ▼
┌──────────────┐
│   Browser    │  7. Redirect to login
└──────────────┘


Login Flow:
┌──────────────┐
│   Browser    │
│  POST /login │
└──────┬───────┘
       │
       │ email, password
       ▼
┌─────────────────────┐
│ Supabase Auth       │
│ .signInWithPassword │
└──────┬──────────────┘
       │
       │ Returns: access_token, user
       ▼
┌──────────────┐
│  Server      │  Get user profile from KV
│  GET user:{id}│
└──────┬───────┘
       │
       │ Return: { access_token, user: {...} }
       ▼
┌──────────────┐
│   Browser    │  Store in localStorage:
│              │  - access_token
│              │  - user (profile)
│              │
│              │  Redirect based on role:
│              │  - ambulance → /ambulance
│              │  - hospital  → /hospital
│              │  - traffic   → /traffic
└──────────────┘
```

---

## Map Integration Architecture

### Leaflet.js Setup

```typescript
// Map Initialization
const map = L.map('container').setView([lat, lng], zoom);

// Tile Layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
  .addTo(map);

// Custom Markers
const ambulanceIcon = L.divIcon({ html: '🚑', ... });
const hospitalIcon = L.divIcon({ html: '🏥', ... });
const accidentIcon = L.divIcon({ html: '🚨', ... });

// Add Markers
L.marker([lat, lng], { icon: ambulanceIcon })
  .bindPopup('Ambulance Location')
  .addTo(map);

// Draw Route
const route = L.polyline([[lat1, lng1], [lat2, lng2]], {
  color: '#ef4444',
  weight: 4
}).addTo(map);
```

### Marker Updates

```
Component Mount:
1. Create map instance
2. Initialize layers

Location Update:
1. Clear old markers
2. Create new markers with updated positions
3. Add to layer group

Route Update:
1. Remove old route polyline
2. Calculate new route points
3. Draw new polyline
4. Fit map bounds to show entire route
```

---

## Real-time Update Mechanism

### Polling Strategy (Current Implementation)

```typescript
// In each dashboard component
useEffect(() => {
  loadData();  // Initial load
  
  const interval = setInterval(() => {
    loadData();  // Refresh every 5 seconds
  }, 5000);
  
  return () => clearInterval(interval);  // Cleanup
}, []);

async function loadData() {
  const incidents = await getActiveIncidents();
  setIncidents(incidents);
  // UI automatically re-renders with new data
}
```

### Location Tracking (Ambulance)

```typescript
// Start tracking on incident creation
useEffect(() => {
  if (!activeIncident) return;
  
  const interval = setInterval(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      setCurrentLocation(location);
      
      // Auto-update server
      updateIncidentLocation(activeIncident.id, location);
    });
  }, 5000);
  
  return () => clearInterval(interval);
}, [activeIncident]);
```

---

## Security Architecture

### Authentication Tokens

```
Request Flow with Auth:

┌──────────┐
│ Browser  │  localStorage.getItem('access_token')
└────┬─────┘
     │
     │ Add to headers:
     │ Authorization: Bearer {token}
     ▼
┌──────────┐
│ API Call │  fetch(url, { headers: { Authorization: ... } })
└────┬─────┘
     │
     ▼
┌──────────┐
│  Server  │  Extract token from header
│          │  const token = header.split(' ')[1]
└────┬─────┘
     │
     │ Verify with Supabase
     ▼
┌──────────────────┐
│ Supabase Auth    │  supabase.auth.getUser(token)
│                  │  Returns: { user } or { error }
└────┬─────────────┘
     │
     │ If valid: process request
     │ If invalid: return 401 Unauthorized
     ▼
┌──────────┐
│ Response │
└──────────┘
```

### Role-Based Access Control

```typescript
// Frontend - Protected Routes
<ProtectedRoute allowedRoles={['ambulance']}>
  <AmbulanceDashboard />
</ProtectedRoute>

// Backend - Endpoint Protection
async function createIncident(c) {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  
  const profile = await getUserProfile(user.id);
  if (profile.role !== 'ambulance') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  // Process incident creation...
}
```

---

## Performance Optimizations

### 1. Efficient Polling
- Only poll when component is mounted
- Clear intervals on unmount
- Batch multiple API calls

### 2. Map Optimization
- Reuse map instance (don't recreate)
- Use layer groups for markers
- Only update changed markers

### 3. Data Caching
- Store user profile in localStorage
- Reuse hospital list
- Minimize KV store reads

### 4. Conditional Updates
```typescript
// Only update if data changed
useEffect(() => {
  if (JSON.stringify(newIncidents) !== JSON.stringify(oldIncidents)) {
    setIncidents(newIncidents);
  }
}, [newIncidents]);
```

---

## Scalability Considerations

### Current Capacity
- **Users**: Hundreds (single Supabase project)
- **Incidents**: Dozens concurrent
- **Updates**: 5-second polling

### Production Scaling

```
┌─────────────────────────────────────────┐
│        Production Architecture          │
└─────────────────────────────────────────┘

1. Replace Polling with WebSockets
   - Supabase Realtime subscriptions
   - Instant updates (<100ms)
   - Reduced server load

2. Add Caching Layer
   - Redis for active incidents
   - CDN for static assets
   - Edge caching for API responses

3. Database Optimization
   - Move from KV to relational tables
   - Add indexes on frequently queried fields
   - Implement pagination

4. Load Balancing
   - Multiple Edge Function instances
   - Geographic distribution
   - Auto-scaling based on load

5. Monitoring & Analytics
   - Real-time dashboard
   - Error tracking (Sentry)
   - Performance monitoring (New Relic)
```

---

## Deployment Architecture

```
Development:
┌────────────────┐
│  Local Dev     │
│  vite dev      │  localhost:5173
└────────────────┘

Production:
┌────────────────┐
│  Figma Make    │
│  Static Host   │  *.figma.com
└────────┬───────┘
         │
         ▼
┌────────────────┐
│  Supabase      │  *.supabase.co
│  - Auth        │
│  - Functions   │
│  - Database    │
└────────────────┘
         │
         ▼
┌────────────────┐
│  External      │
│  - OpenStreetMap
│  - Geolocation API
└────────────────┘
```

---

## Error Handling Strategy

### Frontend
```typescript
try {
  const result = await apiCall();
  toast.success('Success!');
} catch (error) {
  console.error('Detailed error:', error);
  toast.error(error.message || 'Something went wrong');
  // Fallback behavior
}
```

### Backend
```typescript
try {
  // Process request
  return c.json({ success: true, data });
} catch (error) {
  console.log('Server error:', error);  // Logs to Supabase
  return c.json({ 
    error: 'Failed to process: ' + String(error) 
  }, 500);
}
```

---

## Future Architecture Enhancements

### 1. WebSocket Integration
```
Current: HTTP Polling (5s)
Future:  WebSocket (Real-time)

Benefits:
- Instant updates
- Lower bandwidth
- Better battery life
```

### 2. Microservices
```
Current: Monolithic Edge Function
Future:  Service-oriented

Services:
- Auth Service
- Incident Service
- Location Service
- Notification Service
- Analytics Service
```

### 3. Event-Driven Architecture
```
Event Bus:
- IncidentCreated
- LocationUpdated
- IncidentCompleted

Handlers:
- NotifyHospital
- NotifyTraffic
- UpdateAnalytics
- SendPushNotification
```

---

**This architecture is designed for hackathon demo but ready for production scaling! 🚀**
