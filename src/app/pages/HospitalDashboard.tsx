import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getCurrentUser, logout, getActiveIncidents, getHospitals, Incident, Hospital, calculateDistance, calculateETA } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Hospital as HospitalIcon, LogOut, Clock, User, AlertTriangle, MapPin, Navigation, Activity, Radio, HeartPulse } from 'lucide-react';
import MapView from '../components/MapView';

export default function HospitalDashboard() {
  const [user] = useState(getCurrentUser());
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading hospital dashboard data...');
      const [incidentsData, hospitalsData] = await Promise.all([
        getActiveIncidents(),
        getHospitals(),
      ]);
      console.log('Dashboard data loaded successfully:', { incidents: incidentsData, hospitals: hospitalsData });
      setIncidents(incidentsData);
      setHospitals(hospitalsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to load data: ${errorMessage}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-600';
      case 'severe': return 'bg-orange-600';
      case 'moderate': return 'bg-yellow-600';
      case 'minor': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const mapMarkers = incidents.map(incident => {
    const hospital = hospitals.find(h => h.id === incident.hospital_id);
    return {
      position: incident.current_location,
      popup: `🚑 ${incident.ambulance_driver_name}<br/>Severity: ${incident.severity}<br/>To: ${hospital?.name || 'Unknown'}`,
      icon: 'ambulance' as const,
    };
  });

  // Add hospitals to map
  hospitals.forEach(hospital => {
    mapMarkers.push({
      position: { lat: hospital.lat, lng: hospital.lng },
      popup: `🏥 ${hospital.name}`,
      icon: 'hospital' as const,
    });
  });

  return (
    <div className="min-h-screen bg-background hospital-theme">
      {/* Hospital Header - Light Blue Theme */}
      <header className="bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 text-white shadow-lg border-b-2 border-sky-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <HospitalIcon className="w-10 h-10" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">
                  RAKSH
                </h1>
                <p className="text-sm opacity-90 flex items-center gap-2">
                  <HeartPulse className="w-3 h-3" />
                  Hospital Control • {user?.name}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="border-white/30 hover:bg-white/10 text-white hover:text-white backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Incoming Ambulances */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-card/50 backdrop-blur-lg shadow-2xl">
            <CardHeader className="border-b border-primary/10">
              <CardTitle className="flex items-center justify-between text-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Radio className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  Incoming Ambulances
                </div>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  {incidents.length} Active
                </Badge>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Real-time emergency arrivals
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {incidents.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="p-4 bg-primary/5 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <HospitalIcon className="w-10 h-10 opacity-30" />
                  </div>
                  <p className="text-lg font-medium">No active emergencies</p>
                  <p className="text-sm">All clear at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => {
                    const hospital = hospitals.find(h => h.id === incident.hospital_id);
                    const distance = hospital ? calculateDistance(
                      incident.current_location.lat,
                      incident.current_location.lng,
                      hospital.lat,
                      hospital.lng
                    ) : 0;
                    const eta = calculateETA(distance);
                    
                    return (
                      <Card 
                        key={incident.id} 
                        className={`cursor-pointer transition-all border-primary/20 bg-card/80 hover:shadow-lg hover:border-primary/40 ${ 
                          selectedIncident?.id === incident.id ? 'ring-2 ring-primary shadow-xl shadow-primary/20' : ''
                        }`}
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="w-4 h-4 text-primary" />
                                  <span className="font-semibold text-foreground">{incident.ambulance_driver_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {getTimeAgo(incident.created_at)}
                                </div>
                              </div>
                              <Badge className={getSeverityColor(incident.severity)}>
                                {incident.severity.toUpperCase()}
                              </Badge>
                            </div>

                            {hospital && (
                              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Navigation className="w-5 h-5 text-orange-500 animate-pulse" />
                                  <div>
                                    <p className="text-sm font-bold text-orange-500">ETA: ~{eta} min</p>
                                    <p className="text-xs text-orange-400">{distance.toFixed(2)} km away</p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-500 animate-pulse">
                                  LIVE
                                </Badge>
                              </div>
                            )}

                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2 p-2 bg-primary/5 rounded">
                                <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-foreground">
                                  {incident.patient_info || 'No additional information'}
                                </span>
                              </div>
                              <div className="flex items-start gap-2 p-2 bg-primary/5 rounded">
                                <HospitalIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-foreground">
                                  {hospital?.name || 'Unknown Hospital'}
                                </span>
                              </div>
                              <div className="flex items-start gap-2 p-2 bg-primary/5 rounded">
                                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-muted-foreground font-mono">
                                  {incident.current_location.lat.toFixed(4)}, {incident.current_location.lng.toFixed(4)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedIncident && (
            <Card className="border-2 border-primary shadow-2xl shadow-primary/20 bg-card/80 backdrop-blur-lg">
              <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-primary/30">
                <CardTitle className="text-primary flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 animate-pulse" />
                  Preparation Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors">
                    <input type="checkbox" className="mt-1 accent-primary" />
                    <div>
                      <p className="font-medium text-foreground">Emergency Room Ready</p>
                      <p className="text-sm text-muted-foreground">Prepare ER for {selectedIncident.severity} case</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors">
                    <input type="checkbox" className="mt-1 accent-primary" />
                    <div>
                      <p className="font-medium text-foreground">Medical Team Notified</p>
                      <p className="text-sm text-muted-foreground">Alert on-duty doctors and nurses</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors">
                    <input type="checkbox" className="mt-1 accent-primary" />
                    <div>
                      <p className="font-medium text-foreground">Equipment Prepared</p>
                      <p className="text-sm text-muted-foreground">Ready required medical equipment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors">
                    <input type="checkbox" className="mt-1 accent-primary" />
                    <div>
                      <p className="font-medium text-foreground">Blood Bank Alerted</p>
                      <p className="text-sm text-muted-foreground">Check blood availability if needed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Map */}
        <Card className="h-[700px] border-primary/20 bg-card/50 backdrop-blur-lg shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Live Tracking
            </CardTitle>
            <CardDescription>
              Real-time ambulance locations with route tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[600px] p-0">
            <MapView
              center={selectedIncident?.current_location}
              markers={mapMarkers}
              zoom={12}
              routeColor="#0ea5e9"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}