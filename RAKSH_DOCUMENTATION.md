# 🚑 RAKSH - Emergency Response Coordination System

## Overview

RAKSH is a comprehensive emergency response system that coordinates ambulances, hospitals, and traffic police during medical emergencies. The system provides real-time location tracking, route optimization, and instant communication between all stakeholders.

---

## 🎯 System Architecture

### Three-Tier Architecture

```
Frontend (React + React Router) 
    ↓
Server (Hono on Supabase Edge Functions)
    ↓
Database (Supabase Key-Value Store)
```

### Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, React Router
- **Maps**: Leaflet.js with OpenStreetMap
- **Backend**: Hono (Edge Functions)
- **Database**: Supabase (Auth + KV Store)
- **Real-time**: Polling (5-second intervals)

---

## 📱 Three User Interfaces

### 1. **Ambulance Driver Dashboard** (`/ambulance`)

**Purpose**: Report emergencies and navigate to hospitals

**Features**:
- Emergency incident creation form
- Patient severity selection (Critical, Severe, Moderate, Minor)
- Hospital selection from dropdown
- Patient information textarea
- Live GPS location tracking
- Route visualization on map
- Real-time location updates every 5 seconds
- Incident completion marking

**Workflow**:
1. Driver fills out emergency form:
   - Select severity level
   - Choose destination hospital
   - Add patient details
   - System auto-detects accident location
2. Click "Send Emergency Alert"
3. System notifies hospital and traffic police
4. Map shows route to hospital
5. Location updates automatically every 5 seconds
6. Mark as completed upon arrival

---

### 2. **Hospital Dashboard** (`/hospital`)

**Purpose**: Monitor incoming ambulances and prepare emergency resources

**Features**:
- List of all incoming ambulances
- Real-time location tracking
- Severity-based color coding
- Patient information preview
- Preparation checklist
- Live map with all ambulance locations
- Auto-refresh every 5 seconds

**Workflow**:
1. Hospital staff see incoming ambulance alerts
2. View patient severity and information
3. Track ambulance location on map
4. Use checklist to prepare:
   - Emergency room
   - Medical team
   - Equipment
   - Blood bank
5. Receive patient upon arrival

---

### 3. **Traffic Police Dashboard** (`/traffic`)

**Purpose**: Clear routes for ambulances and coordinate traffic control

**Features**:
- Active emergency list
- Ambulance location tracking
- Route visualization
- Traffic control checklist
- Real-time updates every 5 seconds
- Priority-based alerts

**Workflow**:
1. Receive emergency notification
2. View ambulance route and current location
3. Coordinate traffic control:
   - Set signals to green
   - Clear intersections
   - Position officers
   - Radio coordination
4. Monitor progress on live map

---

## 🔐 Authentication System

### User Roles

1. **ambulance** - Ambulance drivers
2. **hospital** - Hospital staff
3. **traffic** - Traffic police officers

### Sign Up Process

Users must sign up with:
- Email
- Password (minimum 6 characters)
- Full name
- Role selection
- Badge/Vehicle number (optional for traffic/ambulance)

### Login Process

After login, users are redirected to their role-specific dashboard:
- Ambulance → `/ambulance`
- Hospital → `/hospital`
- Traffic → `/traffic`

### Protected Routes

Each dashboard is protected and only accessible to users with the correct role.

---

## 🗺️ Map Integration

### Leaflet.js Features

- **OpenStreetMap** tiles for base map
- **Custom markers** for ambulances, hospitals, accidents
- **Route polylines** showing ambulance path
- **Auto-centering** on selected incidents
- **Responsive** zoom and pan

### Marker Types

- 🚑 Ambulance - Shows current ambulance location
- 🏥 Hospital - Shows hospital locations
- 🚨 Accident - Shows accident site

### Real-time Tracking

- Ambulance location updates every 5 seconds
- Uses browser Geolocation API
- Fallback to Bangalore coordinates if GPS unavailable
- Hospital and Traffic dashboards auto-refresh every 5 seconds

---

## 🔧 Backend API Endpoints

### Base URL
```
https://{projectId}.supabase.co/functions/v1/make-server-f1f6071c
```

### Authentication Endpoints

#### POST `/signup`
Create new user account
```json
{
  "email": "driver@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "ambulance",
  "badge_number": "AMB-001"
}
```

#### POST `/login`
Sign in user
```json
{
  "email": "driver@example.com",
  "password": "password123"
}
```

#### GET `/me`
Get current user profile (requires auth)

---

### Hospital Endpoints

#### GET `/hospitals`
Get list of all hospitals

Returns:
```json
[
  {
    "id": "h1",
    "name": "Victoria Hospital",
    "lat": 12.9716,
    "lng": 77.5946,
    "contact": "+91-80-2670-1150"
  }
]
```

---

### Incident Endpoints

#### POST `/incidents`
Create new emergency incident (Ambulance only)
```json
{
  "severity": "critical",
  "hospital_id": "h1",
  "patient_info": "Head injury, unconscious",
  "accident_location": {
    "lat": 12.9716,
    "lng": 77.5946
  }
}
```

#### GET `/incidents`
Get all active incidents

#### GET `/incidents/:id`
Get specific incident details

#### PUT `/incidents/:id/location`
Update ambulance location
```json
{
  "lat": 12.9750,
  "lng": 77.5950
}
```

#### PUT `/incidents/:id/status`
Update incident status
```json
{
  "status": "completed"
}
```

---

## 📊 Database Structure (Key-Value Store)

### Keys and Values

```
user:{userId} → {
  id, email, name, role, badge_number, created_at
}

incident:{incidentId} → {
  id, ambulance_driver_id, ambulance_driver_name,
  severity, hospital_id, patient_info,
  accident_location, current_location, status,
  created_at, last_updated
}

incidents:active → [incident_id1, incident_id2, ...]

hospitals → [{id, name, lat, lng, contact}, ...]
```

---

## 🚀 Phase-by-Phase Implementation

### ✅ Phase 1: Authentication & Role Management
- User signup with role selection
- Login system
- Protected routes
- Role-based redirects

### ✅ Phase 2: Dashboard Layouts
- Three distinct UI designs
- Role-specific navigation
- Header with logout

### ✅ Phase 3: Ambulance Driver Features
- Emergency form
- Hospital selection
- GPS location detection
- Incident creation
- Live tracking

### ✅ Phase 4: Real-time Location Tracking
- Geolocation API integration
- 5-second location updates
- Map visualization
- Route display

### ✅ Phase 5: Hospital & Traffic Police Dashboards
- Incoming ambulance list
- Live map tracking
- Preparation checklists
- Auto-refresh data

---

## 🎨 UI/UX Design Highlights

### Color Coding

- **Ambulance**: Red theme (#EF4444)
- **Hospital**: Blue theme (#2563EB)
- **Traffic Police**: Green theme (#15803D)

### Severity Badges

- 🔴 Critical - Red
- 🟠 Severe - Orange
- 🟡 Moderate - Yellow
- 🟢 Minor - Green

### Responsive Design

- Mobile-first approach
- Grid layout for desktop (2 columns)
- Stack layout for mobile
- Touch-friendly buttons

---

## 🧪 Testing the System

### Step 1: Create Test Accounts

Create three accounts with different roles:

1. **Ambulance Driver**
   - Email: driver@test.com
   - Password: test123
   - Role: Ambulance

2. **Hospital Staff**
   - Email: hospital@test.com
   - Password: test123
   - Role: Hospital

3. **Traffic Police**
   - Email: traffic@test.com
   - Password: test123
   - Role: Traffic

### Step 2: Test Emergency Flow

1. **Login as Ambulance Driver** (`driver@test.com`)
   - Fill emergency form
   - Select severity: Critical
   - Choose hospital: Victoria Hospital
   - Add patient info: "Severe head injury"
   - Click "Send Emergency Alert"
   - Observe location tracking on map

2. **Login as Hospital Staff** (in new tab: `hospital@test.com`)
   - See incoming ambulance alert
   - View patient severity and info
   - Track ambulance on map
   - Use preparation checklist

3. **Login as Traffic Police** (in new tab: `traffic@test.com`)
   - See active emergency
   - View ambulance route
   - Track live location
   - Use traffic control checklist

### Step 3: Test Real-time Updates

- Keep all three dashboards open
- Observe auto-refresh every 5 seconds
- Watch location updates
- Test incident completion

---

## 🔒 Security Features

1. **Authentication Required**: All endpoints except signup/login require auth
2. **Role-Based Access**: Each dashboard only accessible to authorized roles
3. **Protected Routes**: Frontend route guards
4. **Email Confirmation**: Auto-confirmed (email server not configured)
5. **Service Role Key**: Kept server-side only, never exposed to frontend

---

## 📈 Future Enhancements

### Potential Features (Not Yet Implemented)

1. **WebSocket Integration** - Real-time updates instead of polling
2. **Push Notifications** - Browser notifications for alerts
3. **Voice Commands** - Hands-free operation for drivers
4. **Route Optimization** - AI-powered fastest route calculation
5. **Historical Analytics** - Dashboard for past incidents
6. **Multi-language Support** - Regional language options
7. **Offline Mode** - Works without internet (with limitations)
8. **Integration with Emergency Services** - Connect to 108/911
9. **Patient Vital Signs** - Real-time health monitoring
10. **Automated Traffic Signals** - Direct signal control API

---

## 🐛 Known Limitations

1. **GPS Accuracy**: Depends on device GPS capability
2. **Polling Overhead**: 5-second polling may cause data usage
3. **No Route Optimization**: Uses straight-line routes, not actual roads
4. **Browser-Based**: Requires active browser tab
5. **No Offline Support**: Requires internet connection
6. **Demo Environment**: Not HIPAA-compliant for production use

---

## 💡 Hackathon Tips

### Presentation Points

1. **Problem Statement**: 
   - Ambulances stuck in traffic during emergencies
   - Hospitals unprepared for incoming patients
   - Lack of coordination between stakeholders

2. **Solution**:
   - Real-time location tracking
   - Instant multi-stakeholder coordination
   - Route visualization
   - Preparation checklists

3. **Impact**:
   - Faster emergency response
   - Saved lives
   - Better resource utilization
   - Reduced chaos during emergencies

4. **Technology**:
   - Modern web stack
   - Real-time updates
   - Role-based access
   - Scalable architecture

### Demo Script

1. **Introduction** (1 min)
   - Introduce RAKSH concept
   - Explain three user roles

2. **Ambulance Demo** (2 min)
   - Create emergency incident
   - Show form and location detection
   - Display route on map

3. **Hospital Demo** (1 min)
   - Show incoming alert
   - Display preparation checklist
   - Show live tracking

4. **Traffic Police Demo** (1 min)
   - Show emergency notification
   - Display route clearing checklist
   - Show coordination features

5. **Real-time Demo** (1 min)
   - Show all three screens simultaneously
   - Demonstrate auto-refresh
   - Show location updates

6. **Conclusion** (1 min)
   - Summarize benefits
   - Discuss future enhancements
   - Q&A

---

## 🔧 Troubleshooting

### Issue: "Unable to determine location"
**Solution**: 
- Allow browser location permissions
- System will fallback to Bangalore coordinates
- Works fine for demo purposes

### Issue: "Login failed"
**Solution**:
- Ensure account was created via signup
- Check email/password spelling
- Clear localStorage and try again

### Issue: "Map not loading"
**Solution**:
- Check internet connection
- Refresh page
- Clear browser cache

### Issue: "Incident not appearing on other dashboards"
**Solution**:
- Wait for auto-refresh (5 seconds)
- Manually refresh page
- Check if logged in with correct role

---

## 📞 Support

For demo purposes, all test data is stored in Supabase KV store. The system automatically creates default hospitals on first run.

---

## 🏆 Winning Strategy

1. **Live Demo**: Always better than slides
2. **Multi-screen**: Show all three interfaces simultaneously
3. **Real-time**: Emphasize live tracking
4. **Impact**: Focus on lives saved
5. **Scalability**: Explain how it can expand to entire city
6. **Future Vision**: Discuss AI, IoT integration

---

**Built with ❤️ for saving lives and winning hackathons!**

Good luck! 🚀
