import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getCurrentUser, logout, getHospitals, createIncident, updateIncidentLocation, updateIncidentStatus, deleteIncident, Hospital, Location, Incident, addHospital, calculateDistance, calculateETA } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { Ambulance, LogOut, MapPin, AlertCircle, Navigation, CheckCircle, Plus, Clock, Info, Trash2, Radio, Activity } from 'lucide-react';
import MapView from '../components/MapView';
import HospitalSearch from '../components/HospitalSearch';

export default function AmbulanceDashboard() {
  const [user] = useState(getCurrentUser());
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  
  // Form state
  const [severity, setSeverity] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [patientInfo, setPatientInfo] = useState('');
  // Initialize with Bangalore fallback coordinates immediately
  const [currentLocation, setCurrentLocation] = useState<Location | null>({ lat: 12.9716, lng: 77.5946 });
  const [accidentLocation, setAccidentLocation] = useState<Location | null>({ lat: 12.9716, lng: 77.5946 });

  const navigate = useNavigate();

  useEffect(() => {
    // Debug: Check auth token on mount
    const token = localStorage.getItem('access_token');
    console.log('AmbulanceDashboard mounted:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
      user: user
    });
    
    loadHospitals();
    getCurrentPosition();
  }, []);

  // Update location every 5 seconds if incident is active
  useEffect(() => {
    if (!activeIncident) return;

    const interval = setInterval(() => {
      getCurrentPosition();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIncident]);

  // Update incident location when current location changes
  useEffect(() => {
    if (activeIncident && currentLocation) {
      updateIncidentLocation(activeIncident.id, currentLocation).catch(err => {
        console.error('Failed to update location:', err);
      });
    }
  }, [currentLocation, activeIncident]);

  const loadHospitals = async () => {
    try {
      console.log('Loading hospitals...');
      const data = await getHospitals();
      console.log('Hospitals loaded successfully:', data);
      setHospitals(data);
    } catch (error) {
      console.error('Failed to load hospitals:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to load hospitals: ${errorMessage}`);
    }
  };

  const getCurrentPosition = () => {
    // Try to get real GPS location (fallback already set in state initialization)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          setAccidentLocation(location);
        },
        (error) => {
          // GPS failed, but we already have fallback in state
          console.log('GPS unavailable (using fallback location):', {
            code: error.code,
            message: error.message
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Creating incident with data:', {
      severity,
      hospitalId,
      patientInfo,
      accidentLocation
    });
    
    // Validate required fields
    if (!severity) {
      toast.error('Please select patient severity level');
      return;
    }
    
    if (!hospitalId) {
      toast.error('Please select destination hospital');
      return;
    }
    
    if (!accidentLocation) {
      toast.error('Unable to determine accident location. Please wait for GPS...');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending incident data to API:', {
        severity,
        hospital_id: hospitalId,
        patient_info: patientInfo,
        accident_location: accidentLocation,
      });
      
      const { incident } = await createIncident({
        severity,
        hospital_id: hospitalId,
        patient_info: patientInfo,
        accident_location: accidentLocation,
      });

      console.log('Incident created successfully:', incident);
      setActiveIncident(incident);
      toast.success('🚨 Emergency alert sent! Hospital and Traffic Police notified.');
    } catch (error) {
      console.error('Failed to create incident:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteIncident = async () => {
    if (!activeIncident) return;

    try {
      await updateIncidentStatus(activeIncident.id, 'completed');
      toast.success('✅ Incident marked as completed');
      setActiveIncident(null);
      // Reset form (keep location for next incident)
      setSeverity('');
      setHospitalId('');
      setPatientInfo('');
    } catch (error) {
      console.error('Failed to complete incident:', error);
      toast.error('Failed to complete incident');
    }
  };

  const handleDeleteIncident = async () => {
    if (!activeIncident) return;

    try {
      await deleteIncident(activeIncident.id);
      toast.success('🗑️ Incident deleted successfully');
      setActiveIncident(null);
      // Reset form (keep location for next incident)
      setSeverity('');
      setHospitalId('');
      setPatientInfo('');
    } catch (error) {
      console.error('Failed to delete incident:', error);
      toast.error('Failed to delete incident');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const selectedHospital = hospitals.find(h => h.id === hospitalId);

  const mapMarkers = [];
  const mapRoute: Location[] = [];

  if (currentLocation) {
    mapMarkers.push({
      position: currentLocation,
      popup: '🚑 Your Location',
      icon: 'ambulance' as const,
    });
  }

  if (accidentLocation && activeIncident) {
    mapMarkers.push({
      position: accidentLocation,
      popup: '🚨 Accident Location',
      icon: 'accident' as const,
    });
  }

  if (selectedHospital) {
    mapMarkers.push({
      position: { lat: selectedHospital.lat, lng: selectedHospital.lng },
      popup: `🏥 ${selectedHospital.name}`,
      icon: 'hospital' as const,
    });

    // Create route if incident is active
    if (activeIncident && currentLocation) {
      mapRoute.push(currentLocation);
      mapRoute.push({ lat: selectedHospital.lat, lng: selectedHospital.lng });
    }
  }

  return (
    <div className="min-h-screen bg-background ambulance-theme">
      {/* Ambulance Header - Light Pink and White Theme */}
      <header className="bg-gradient-to-r from-pink-300 via-pink-200 to-rose-200 text-rose-900 shadow-lg border-b-2 border-pink-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Ambulance className="w-10 h-10 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-wider text-rose-900">
                  RAKSH
                </h1>
                <p className="text-sm opacity-90 flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  Ambulance Control • {user?.name}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="border-rose-800/30 hover:bg-rose-100 text-rose-900 hover:text-rose-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Form or Active Incident */}
        <div className="space-y-6">
          {!activeIncident ? (
            <Card className="border-primary/20 bg-card/50 backdrop-blur-lg shadow-2xl">
              <CardHeader className="border-b border-primary/10">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  Report Emergency
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Fill in the details to dispatch emergency response
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleCreateIncident} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="severity" className="text-foreground">Patient Severity *</Label>
                    <Select value={severity} onValueChange={setSeverity} required>
                      <SelectTrigger className="bg-input-background border-primary/20">
                        <SelectValue placeholder="Select severity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">🔴 Critical - Immediate attention required</SelectItem>
                        <SelectItem value="severe">🟠 Severe - Serious injuries</SelectItem>
                        <SelectItem value="moderate">🟡 Moderate - Stable condition</SelectItem>
                        <SelectItem value="minor">🟢 Minor - Non-life threatening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospital" className="text-foreground">Destination Hospital *</Label>
                    <Select value={hospitalId} onValueChange={setHospitalId} required>
                      <SelectTrigger className="bg-input-background border-primary/20">
                        <SelectValue placeholder="Select hospital" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitals.map((hospital) => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            🏥 {hospital.name} - {hospital.contact}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2 border-primary/30 hover:bg-primary/10"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Hospital
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-card border-primary/20">
                        <DialogHeader>
                          <DialogTitle>Search and Add Hospital</DialogTitle>
                          <DialogDescription>
                            Search for hospitals by name or location to add them to the system
                          </DialogDescription>
                        </DialogHeader>
                        <div className="overflow-y-auto max-h-[65vh]">
                          <HospitalSearch 
                            onHospitalAdded={() => {
                              loadHospitals();
                              setSearchDialogOpen(false);
                            }}
                            onClose={() => setSearchDialogOpen(false)}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient" className="text-foreground">Patient Information</Label>
                    <Textarea
                      id="patient"
                      placeholder="E.g., Head injury, severe blood loss, unconscious..."
                      value={patientInfo}
                      onChange={(e) => setPatientInfo(e.target.value)}
                      rows={4}
                      className="bg-input-background border-primary/20"
                    />
                  </div>

                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 animate-pulse" />
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">Current Location</p>
                        {currentLocation ? (
                          <p className="text-muted-foreground font-mono">
                            {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                          </p>
                        ) : (
                          <p className="text-muted-foreground">Detecting location...</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg shadow-red-500/50" 
                    size="lg" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Radio className="w-4 h-4 mr-2 animate-spin" />
                        Sending Alert...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        🚨 Send Emergency Alert
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-destructive shadow-2xl shadow-destructive/20 bg-card/50 backdrop-blur-lg">
              <CardHeader className="bg-gradient-to-r from-destructive/20 to-destructive/10 border-b border-destructive/30">
                <CardTitle className="flex items-center gap-3 text-destructive">
                  <Navigation className="w-6 h-6 animate-pulse" />
                  Active Emergency
                  <Badge variant="destructive" className="ml-auto animate-pulse">LIVE</Badge>
                </CardTitle>
                <CardDescription>En route to hospital</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <Badge variant="destructive" className="animate-pulse">
                      <Radio className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <span className="text-sm font-medium text-muted-foreground">Severity:</span>
                    <Badge className="bg-orange-500">{severity.toUpperCase()}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <span className="text-sm font-medium text-muted-foreground">Destination:</span>
                    <span className="text-sm font-semibold text-foreground">🏥 {selectedHospital?.name}</span>
                  </div>
                  {selectedHospital && currentLocation && (
                    <>
                      <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <span className="text-sm font-medium text-muted-foreground">Distance:</span>
                        <span className="text-sm font-bold text-primary">
                          {calculateDistance(
                            currentLocation.lat,
                            currentLocation.lng,
                            selectedHospital.lat,
                            selectedHospital.lng
                          ).toFixed(2)} km
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <span className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          ETA:
                        </span>
                        <span className="text-sm font-bold text-orange-500">
                          ~{calculateETA(
                            calculateDistance(
                              currentLocation.lat,
                              currentLocation.lng,
                              selectedHospital.lat,
                              selectedHospital.lng
                            )
                          )} min
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Hospital notified and preparing
                  </p>
                  <p className="text-sm text-green-400 flex items-center gap-2 mt-2">
                    <CheckCircle className="w-4 h-4" />
                    Traffic police clearing route
                  </p>
                </div>

                {currentLocation && (
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-sm">
                    <p className="text-xs text-primary mb-1 flex items-center gap-2">
                      <Radio className="w-3 h-3 animate-pulse" />
                      Live Location Tracking Active
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-destructive/30">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Incident?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the incident from all dashboards.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteIncident}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button 
                    onClick={handleCompleteIncident} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
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
              Live Navigation Map
            </CardTitle>
            <CardDescription>
              {activeIncident ? '🚑 Real-time route using Dijkstra\'s algorithm' : 'Your current location'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[600px] p-0">
            <MapView
              center={currentLocation || undefined}
              markers={mapMarkers}
              route={mapRoute}
              zoom={13}
              routeColor="#f472b6"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}