import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Supabase clients
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper to verify auth
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    console.log('Auth verification failed: Missing Authorization header');
    return null;
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('Auth verification failed: No token in Authorization header');
    return null;
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error) {
    console.log('Auth verification failed:', error.message);
    return null;
  }
  if (!user) {
    console.log('Auth verification failed: No user found');
    return null;
  }
  return user;
}

// Helper to get user profile
async function getUserProfile(userId: string) {
  const profile = await kv.get(`user:${userId}`);
  return profile;
}

// ============= AUTH ROUTES =============

// Sign up with role
app.post('/make-server-f1f6071c/signup', async (c) => {
  try {
    const { email, password, name, role, badge_number } = await c.req.json();
    
    if (!email || !password || !name || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate role
    if (!['ambulance', 'hospital', 'traffic'].includes(role)) {
      return c.json({ error: 'Invalid role. Must be ambulance, hospital, or traffic' }, 400);
    }

    // Create auth user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server not configured
      user_metadata: { name, role }
    });

    if (error) {
      console.log('Signup auth error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      badge_number: badge_number || null,
      created_at: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      user: { id: data.user.id, email, name, role } 
    });

  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Signup failed: ' + String(error) }, 500);
  }
});

// Sign in
app.post('/make-server-f1f6071c/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('Login error:', error);
      return c.json({ error: error.message }, 401);
    }

    // Get user profile
    const profile = await getUserProfile(data.user.id);

    return c.json({
      access_token: data.session.access_token,
      user: profile
    });

  } catch (error) {
    console.log('Login error:', error);
    return c.json({ error: 'Login failed: ' + String(error) }, 500);
  }
});

// Get current user
app.get('/make-server-f1f6071c/me', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const profile = await getUserProfile(user.id);
  return c.json({ user: profile });
});

// ============= HOSPITAL ROUTES =============

// Get all hospitals
app.get('/make-server-f1f6071c/hospitals', async (c) => {
  try {
    console.log('GET /hospitals - Public endpoint (no auth required)');
    
    const hospitals = await kv.get('hospitals');
    
    // Initialize with default hospitals if none exist
    if (!hospitals) {
      const defaultHospitals = [
        { id: 'h1', name: 'Victoria Hospital', lat: 12.9716, lng: 77.5946, contact: '+91-80-2670-1150', address: 'Fort, Bangalore' },
        { id: 'h2', name: 'Manipal Hospital', lat: 12.9610, lng: 77.5900, contact: '+91-80-2502-4444', address: 'HAL Old Airport Road, Bangalore' },
        { id: 'h3', name: 'Fortis Hospital', lat: 12.9750, lng: 77.5800, contact: '+91-80-6621-4444', address: 'Bannerghatta Road, Bangalore' },
        { id: 'h4', name: 'Apollo Hospital', lat: 12.9816, lng: 77.6046, contact: '+91-80-2630-0330', address: 'Sheshadripuram, Bangalore' },
        { id: 'h5', name: 'St. Johns Hospital', lat: 12.9550, lng: 77.6000, contact: '+91-80-2206-3800', address: 'Koramangala, Bangalore' }
      ];
      await kv.set('hospitals', defaultHospitals);
      console.log('Initialized default hospitals');
      return c.json(defaultHospitals);
    }
    
    console.log(`Returning ${hospitals.length} hospitals`);
    return c.json(hospitals);
  } catch (error) {
    console.log('Get hospitals error:', error);
    return c.json({ error: 'Failed to get hospitals: ' + String(error) }, 500);
  }
});

// Add new hospital
app.post('/make-server-f1f6071c/hospitals', async (c) => {
  // Remove auth requirement for emergency system - anyone can add hospitals
  try {
    const { name, lat, lng, contact, address } = await c.req.json();
    
    if (!name || lat === undefined || lng === undefined) {
      return c.json({ error: 'Missing required fields: name, lat, lng' }, 400);
    }

    const hospitals = await kv.get('hospitals') || [];
    const hospital_id = `h${Date.now()}`;
    
    const newHospital = {
      id: hospital_id,
      name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      contact: contact || 'N/A',
      address: address || 'N/A'
    };

    hospitals.push(newHospital);
    await kv.set('hospitals', hospitals);

    console.log('Hospital added successfully:', newHospital);
    return c.json({ success: true, hospital: newHospital });

  } catch (error) {
    console.log('Add hospital error:', error);
    return c.json({ error: 'Failed to add hospital: ' + String(error) }, 500);
  }
});

// ============= INCIDENT ROUTES =============

// Create new incident (Ambulance only)
app.post('/make-server-f1f6071c/incidents', async (c) => {
  // For emergency scenarios, allow incident creation without strict auth
  // but still track user if logged in
  const authHeader = c.req.header('Authorization');
  const user = await verifyAuth(authHeader);
  
  let driverInfo = {
    id: 'guest',
    name: 'Emergency Responder'
  };
  
  if (user) {
    const profile = await getUserProfile(user.id);
    driverInfo = {
      id: user.id,
      name: profile.name
    };
  }

  try {
    const { severity, hospital_id, patient_info, accident_location } = await c.req.json();
    
    console.log('Received incident creation request:', {
      severity,
      hospital_id,
      patient_info,
      accident_location,
      hasSeverity: !!severity,
      hasHospitalId: !!hospital_id,
      hasAccidentLocation: !!accident_location
    });
    
    if (!severity || !hospital_id || !accident_location) {
      console.log('Validation failed - missing required fields');
      return c.json({ error: 'Missing required fields: severity, hospital_id, accident_location' }, 400);
    }

    const incident_id = crypto.randomUUID();
    const incident = {
      id: incident_id,
      ambulance_driver_id: driverInfo.id,
      ambulance_driver_name: driverInfo.name,
      severity,
      hospital_id,
      patient_info: patient_info || '',
      accident_location, // { lat, lng }
      status: 'active', // active, completed, cancelled
      created_at: new Date().toISOString(),
      current_location: accident_location
    };

    await kv.set(`incident:${incident_id}`, incident);
    
    // Add to active incidents list
    const activeIncidents = await kv.get('incidents:active') || [];
    activeIncidents.push(incident_id);
    await kv.set('incidents:active', activeIncidents);

    console.log('Incident created successfully:', incident);
    return c.json({ success: true, incident });

  } catch (error) {
    console.log('Create incident error:', error);
    return c.json({ error: 'Failed to create incident: ' + String(error) }, 500);
  }
});

// Get incident by ID
app.get('/make-server-f1f6071c/incidents/:id', async (c) => {
  // Allow public access for emergency scenarios
  const incident_id = c.req.param('id');
  const incident = await kv.get(`incident:${incident_id}`);
  
  if (!incident) {
    return c.json({ error: 'Incident not found' }, 404);
  }

  return c.json(incident);
});

// Update ambulance location
app.put('/make-server-f1f6071c/incidents/:id/location', async (c) => {
  // Allow location updates without strict auth for emergency scenarios
  try {
    const incident_id = c.req.param('id');
    const { lat, lng } = await c.req.json();
    
    if (lat === undefined || lng === undefined) {
      return c.json({ error: 'Missing lat or lng' }, 400);
    }

    const incident = await kv.get(`incident:${incident_id}`);
    if (!incident) {
      return c.json({ error: 'Incident not found' }, 404);
    }

    // Update incident location
    incident.current_location = { lat, lng };
    incident.last_updated = new Date().toISOString();
    await kv.set(`incident:${incident_id}`, incident);

    return c.json({ success: true, location: { lat, lng } });

  } catch (error) {
    console.log('Update location error:', error);
    return c.json({ error: 'Failed to update location: ' + String(error) }, 500);
  }
});

// Get all active incidents
app.get('/make-server-f1f6071c/incidents', async (c) => {
  // Allow public access for emergency scenarios - all dashboards need to see incidents
  const activeIncidentIds = await kv.get('incidents:active') || [];
  const incidents = [];

  for (const id of activeIncidentIds) {
    const incident = await kv.get(`incident:${id}`);
    if (incident && incident.status === 'active') {
      incidents.push(incident);
    }
  }

  return c.json(incidents);
});

// Update incident status
app.put('/make-server-f1f6071c/incidents/:id/status', async (c) => {
  // Allow status updates without strict auth for emergency scenarios
  try {
    const incident_id = c.req.param('id');
    const { status } = await c.req.json();
    
    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    const incident = await kv.get(`incident:${incident_id}`);
    if (!incident) {
      return c.json({ error: 'Incident not found' }, 404);
    }

    incident.status = status;
    incident.updated_at = new Date().toISOString();
    await kv.set(`incident:${incident_id}`, incident);

    // Remove from active list if completed or cancelled
    if (status !== 'active') {
      const activeIncidents = await kv.get('incidents:active') || [];
      const filtered = activeIncidents.filter((id: string) => id !== incident_id);
      await kv.set('incidents:active', filtered);
    }

    console.log('Incident status updated:', { incident_id, status });
    return c.json({ success: true, incident });

  } catch (error) {
    console.log('Update status error:', error);
    return c.json({ error: 'Failed to update status: ' + String(error) }, 500);
  }
});

// Delete incident
app.delete('/make-server-f1f6071c/incidents/:id', async (c) => {
  // Allow deletion for emergency scenarios
  try {
    const incident_id = c.req.param('id');

    const incident = await kv.get(`incident:${incident_id}`);
    if (!incident) {
      return c.json({ error: 'Incident not found' }, 404);
    }

    // Delete incident data
    await kv.del(`incident:${incident_id}`);

    // Remove from active list
    const activeIncidents = await kv.get('incidents:active') || [];
    const filtered = activeIncidents.filter((id: string) => id !== incident_id);
    await kv.set('incidents:active', filtered);

    console.log('Incident deleted successfully:', { incident_id });
    return c.json({ success: true, message: 'Incident deleted successfully' });

  } catch (error) {
    console.log('Delete incident error:', error);
    return c.json({ error: 'Failed to delete incident: ' + String(error) }, 500);
  }
});

// Health check
app.get('/make-server-f1f6071c/health', (c) => {
  return c.json({ status: 'ok', service: 'Raksh Emergency Response System' });
});

Deno.serve(app.fetch);