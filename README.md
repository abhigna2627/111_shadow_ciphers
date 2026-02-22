# 🚑 RAKSH - Emergency Response Coordination System

<div align="center">

**Connecting Ambulances, Hospitals, and Traffic Police in Real-Time**

*Saving Lives Through Technology*


## 🎯 What is RAKSH?

RAKSH is a comprehensive emergency response coordination system that integrates three critical stakeholders during medical emergencies:

1. **🚑 Ambulance Drivers** - Report emergencies and navigate to hospitals
2. **🏥 Hospitals** - Receive alerts and prepare for incoming patients
3. **👮 Traffic Police** - Clear routes and coordinate traffic flow

### The Problem We Solve

- **350+ people die daily** in India due to delayed emergency response
- **60% of emergency delays** are caused by traffic
- **Lack of coordination** between ambulances, hospitals, and traffic police
- **Reactive instead of proactive** emergency response

### Our Solution

A single integrated platform where:
- ✅ Ambulances report emergencies with **one click**
- ✅ Hospitals receive **instant alerts** with patient severity
- ✅ Traffic police see **live routes** to clear
- ✅ Everyone has **real-time location** updates
- ✅ All stakeholders see **the same information simultaneously**

---

## ✨ Key Features

### For Ambulance Drivers
- 📝 Quick emergency reporting form
- 🏥 Hospital selection with contact info
- 🗺️ Live navigation with route display
- 📍 Automatic GPS location tracking
- ✅ Easy incident completion

### For Hospitals
- 🚨 Real-time incoming ambulance alerts
- 📊 Patient severity and information
- 🗺️ Live ambulance tracking on map
- ✅ Preparation checklist
- 🔄 Auto-refresh every 5 seconds

### For Traffic Police
- 🚦 Active emergency notifications
- 🗺️ Route visualization
- 📍 Live ambulance locations
- ✅ Traffic control checklist
- 👥 Multi-incident coordination

---

## 🚀 Quick Start

### 1. Access the Application

The application is live and ready to use!

### 2. Create Your Account

Click **Sign Up** and choose your role:
- Ambulance Driver
- Hospital Staff
- Traffic Police

### 3. Start Using

**Ambulance:** Report emergencies → Get route → Update location → Complete

**Hospital:** View alerts → Track ambulances → Prepare resources → Receive patients

**Traffic:** See emergencies → View routes → Clear intersections → Monitor progress

---



## 🎬 Demo Flow (5 Minutes)

### Setup
```bash
# Create 3 accounts with different roles
# Open 3 browser windows
# Arrange side-by-side
```

### Live Demo
1. **Ambulance Driver** creates emergency (Critical severity)
2. **Hospital** receives instant alert with patient info
3. **Traffic Police** sees route and ambulance location
4. Watch **real-time sync** across all three dashboards (5-second updates)
5. **Complete** the incident

### Impact
> "What used to take 5 phone calls and 10 minutes now happens in 5 seconds."

---

## 🏗️ Technology Stack

### Frontend
- **React** 18.3.1 with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Leaflet.js** for maps
- **Shadcn UI** components

### Backend
- **Supabase** Auth & Database
- **Hono** Edge Functions
- **PostgreSQL** Key-Value Store

### Maps
- **Leaflet.js** map library
- **OpenStreetMap** tile provider
- **Browser Geolocation API**

---

## 📊 System Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Ambulance  │────▶│    Server    │◀────│  Hospital   │
│  Dashboard  │     │  (Supabase)  │     │  Dashboard  │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Database   │
                    │  (KV Store)  │
                    └──────────────┘
                           ▲
                           │
                    ┌──────┴───────┐
                    │   Traffic    │
                    │  Dashboard   │
                    └──────────────┘
```

**Real-time Updates:** All dashboards poll server every 5 seconds for live data.

---

## 🔐 Security Features

- ✅ **Authentication Required** - All endpoints protected
- ✅ **Role-Based Access** - Each dashboard role-specific
- ✅ **Protected Routes** - Frontend route guards
- ✅ **Secure Storage** - Service keys server-side only
- ✅ **JWT Tokens** - Stateless authentication

---

## 🎨 Three Unique Interfaces

### 🚑 Ambulance Dashboard (Red Theme)
- Emergency incident creation
- Live location tracking
- Route to hospital
- Incident management

### 🏥 Hospital Dashboard (Blue Theme)
- Incoming ambulance list
- Patient information display
- Live tracking map
- Preparation checklist

### 👮 Traffic Police Dashboard (Green Theme)
- Active emergencies list
- Route visualization
- Location tracking
- Traffic control actions

---

## 📱 Mobile Responsive

All three dashboards are fully responsive and work on:
- 📱 Mobile phones
- 💻 Tablets
- 🖥️ Desktop computers

---

## 🧪 Testing Guide

### Create Test Accounts

```javascript
// Ambulance
Email: driver@test.com
Password: test123
Role: Ambulance Driver

// Hospital
Email: hospital@test.com
Password: test123
Role: Hospital Staff

// Traffic
Email: traffic@test.com
Password: test123
Role: Traffic Police
```

### Test Flow

1. Login as ambulance driver
2. Create emergency incident
3. Login as hospital (new tab)
4. See incoming alert
5. Login as traffic police (new tab)
6. View active emergency
7. Watch all three dashboards sync

---



## 🚀 Future Enhancements

### Phase 2 (Production Ready)
- [ ] WebSocket real-time updates
- [ ] Push notifications
- [ ] Mobile native apps
- [ ] Integration with 108/911

### Phase 3 (Advanced Features)
- [ ] AI route optimization
- [ ] Voice commands
- [ ] IoT traffic signal control
- [ ] Patient vital signs monitoring

### Phase 4 (Scale)
- [ ] Multi-city deployment
- [ ] Historical analytics
- [ ] Predictive modeling
- [ ] API for third-party integration

---

## 📂 Project Structure

```
raksh/
├── src/app/
│   ├── App.tsx                    # Main app component
│   ├── routes.tsx                 # Route configuration
│   ├── pages/
│   │   ├── LoginPage.tsx          # Login interface
│   │   ├── SignupPage.tsx         # Registration
│   │   ├── AmbulanceDashboard.tsx # Ambulance UI
│   │   ├── HospitalDashboard.tsx  # Hospital UI
│   │   └── TrafficDashboard.tsx   # Traffic UI
│   ├── components/
│   │   ├── MapView.tsx            # Leaflet map
│   │   ├── ProtectedRoute.tsx     # Auth guard
│   │   └── ui/                    # UI components
│   └── lib/
│       ├── api.ts                 # API client
│       └── supabase.ts            # Supabase client
├── supabase/functions/server/
│   └── index.tsx                  # Backend server
├── QUICK_START.md                 # Quick start guide
├── DEMO_ACCOUNTS.md               # Demo setup
├── RAKSH_DOCUMENTATION.md         # Full docs
├── ARCHITECTURE.md                # Technical details
└── README.md                      # This file
```

---



### Live Demo Highlights

- ✅ Real-time synchronization across three dashboards
- ✅ Live GPS tracking and map integration
- ✅ Role-based authentication and access control
- ✅ Professional UI/UX with distinct themes
- ✅ Production-ready backend architecture
- ✅ Mobile-responsive design

---

## 💡 Unique Value Propositions

### For Government/Municipal Bodies
- Reduce emergency response times city-wide
- Better resource allocation
- Data-driven decision making
- Improved public safety metrics

### For Hospitals
- Better patient outcomes
- Reduced preparation time
- Efficient resource usage
- Improved emergency department workflow

### For Citizens
- Faster emergency response
- Better survival rates
- Less traffic chaos during emergencies
- Peace of mind

---


## 📈 Success Metrics

### Development Metrics
- ✅ 3 complete user interfaces
- ✅ 10+ API endpoints
- ✅ Real-time location tracking
- ✅ Authentication & authorization
- ✅ Map integration with routing
- ✅ Auto-refresh mechanism
- ✅ Responsive design

### Potential Impact
- 🎯 40-60% faster emergency response
- 🎯 100% coordination (vs fragmented)
- 🎯 Thousands of lives saved annually
- 🎯 Millions in healthcare cost savings

---

## 🌟 Team & Acknowledgments

Built with ❤️ for saving lives and making the world a better place.

**Technologies Used:**
- React & TypeScript
- Supabase (Auth, Functions, Database)
- Leaflet.js & OpenStreetMap
- Tailwind CSS & Shadcn UI
- Hono (Edge Functions)




<div align="center">

**RAKSH - Because Every Second Counts** ⏱️

*Connecting Ambulances • Hospitals • Traffic Police*

*Real-time • Integrated • Life-Saving*

---

**Built for Hackathon • Ready for Production • Designed to Save Lives**

🚑 💨 🏥 👮 🗺️ ⚡

</div>


