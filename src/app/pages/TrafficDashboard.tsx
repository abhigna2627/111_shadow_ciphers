import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getCurrentUser, logout, getActiveIncidents, getHospitals, Incident, Hospital, calculateDistance, calculateETA } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ShieldCheck, LogOut, AlertTriangle, Navigation, MapPin, Clock, Radio, Siren } from 'lucide-react';
import MapView from '../components/MapView';

export default function TrafficDashboard() {
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
      console.log('Loading traffic dashboard data...');
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
      console.error(`Error details: ${errorMessage}`);
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

  const mapMarkers = incidents.map(incident => ({
    position: incident.current_location,
    popup: `🚑 ${incident.ambulance_driver_name}<br/>Severity: ${incident.severity}`,
    icon: 'ambulance' as const,
  }));

  // Add selected incident route
  const mapRoute = selectedIncident && hospitals.find(h => h.id === selectedIncident.hospital_id)
    ? [
        selectedIncident.current_location,
        {
          lat: hospitals.find(h => h.id === selectedIncident.hospital_id)!.lat,
          lng: hospitals.find(h => h.id === selectedIncident.hospital_id)!.lng,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background traffic-theme">
      {/* Traffic Police Header - Light Green and Brown Theme */}
      <header className="bg-gradient-to-r from-lime-400 via-yellow-300 to-amber-200 text-amber-900 shadow-lg border-b-2 border-lime-400">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <ShieldCheck className="w-10 h-10" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-wider text-amber-900">
                  RAKSH
                </h1>
                <p className="text-sm opacity-90 flex items-center gap-2">
                  <Siren className="w-3 h-3" />
                  Traffic Control • {user?.name} {user?.badge_number && `• ${user.badge_number}`}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="border-amber-800/30 hover:bg-amber-100 text-amber-900 hover:text-amber-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Active Emergencies */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-card/50 backdrop-blur-lg shadow-2xl">
            <CardHeader className="border-b border-primary/10">
              <CardTitle className="flex items-center justify-between text-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <Radio className="w-5 h-5 text-destructive animate-pulse" />
                  </div>
                  Active Emergencies
                </div>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  {incidents.length} En Route
                </Badge>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Clear the way for these ambulances
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {incidents.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="p-4 bg-primary/5 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10 opacity-30" />
                  </div>
                  <p className="text-lg font-medium">No active emergencies</p>
                  <p className="text-sm">All routes clear</p>
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
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Navigation className="w-4 h-4 text-primary animate-pulse" />
                                  <span className="font-semibold text-foreground">Ambulance: {incident.ambulance_driver_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  Dispatched {getTimeAgo(incident.created_at)}
                                </div>
                              </div>
                              <Badge className={getSeverityColor(incident.severity)}>
                                {incident.severity.toUpperCase()}
                              </Badge>
                            </div>

                            {hospital && (
                              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Navigation className="w-5 h-5 text-green-500 animate-pulse" />
                                  <div>
                                    <p className="text-sm font-bold text-green-500">ETA: ~{eta} min</p>
                                    <p className="text-xs text-green-400">{distance.toFixed(2)} km to destination</p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs border-green-500/30 text-green-500 animate-pulse">
                                  LIVE
                                </Badge>
                              </div>
                            )}

                            <div className="space-y-2 text-sm bg-primary/5 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">Destination:</span>
                                <span className="text-muted-foreground">{hospital?.name || 'Unknown'}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-muted-foreground font-mono">
                                  Current: {incident.current_location.lat.toFixed(4)}, {incident.current_location.lng.toFixed(4)}
                                </span>
                              </div>
                            </div>

                            {incident.patient_info && (
                              <div className="flex items-start gap-2 text-sm p-2 bg-orange-500/10 rounded border border-orange-500/20">
                                <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-foreground">{incident.patient_info}</span>
                              </div>
                            )}
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
                  <ShieldCheck className="w-5 h-5 animate-pulse" />
                  Traffic Control Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="p-4 bg-destructive/10 border-l-4 border-destructive rounded-r-lg">
                    <p className="font-semibold text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Priority: {selectedIncident.severity.toUpperCase()}
                    </p>
                    <p className="text-sm text-destructive/80 mt-1">Clear all intersections immediately</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors">
                      <input type="checkbox" className="mt-1 accent-primary" />
                      <div>
                        <p className="font-medium text-foreground">All signals set to green</p>
                        <p className="text-sm text-muted-foreground">Along the ambulance route</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors">
                      <input type="checkbox" className="mt-1 accent-primary" />
                      <div>
                        <p className="font-medium text-foreground">Intersections cleared</p>
                        <p className="text-sm text-muted-foreground">Direct traffic to give way</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors">
                      <input type="checkbox" className="mt-1 accent-primary" />
                      <div>
                        <p className="font-medium text-foreground">Officers positioned</p>
                        <p className="text-sm text-muted-foreground">At key junctions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors">
                      <input type="checkbox" className="mt-1 accent-primary" />
                      <div>
                        <p className="font-medium text-foreground">Radio coordination</p>
                        <p className="text-sm text-muted-foreground">All units along route notified</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <p className="text-sm text-blue-400">
                      💡 <strong>Tip:</strong> Monitor the live map to anticipate the ambulance's path and coordinate with nearby units.
                    </p>
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
              Live Tracking Map
            </CardTitle>
            <CardDescription>
              {selectedIncident ? '🚑 Real-time route with Dijkstra\'s algorithm' : 'All active ambulances'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[600px] p-0">
            <MapView
              center={selectedIncident?.current_location}
              markers={mapMarkers}
              route={mapRoute}
              zoom={selectedIncident ? 13 : 12}
              routeColor="#84cc16"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}