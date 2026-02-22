import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../lib/api';
import { getRoute, RouteResult } from '../lib/routing';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  center?: Location;
  markers?: Array<{
    position: Location;
    popup?: string;
    icon?: 'ambulance' | 'hospital' | 'accident' | 'default';
  }>;
  route?: Location[];
  className?: string;
  zoom?: number;
  routeColor?: string;
}

export default function MapView({ 
  center = { lat: 12.9716, lng: 77.5946 }, 
  markers = [],
  route = [],
  className = '',
  zoom = 13,
  routeColor = '#3b82f6'
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const [routeData, setRouteData] = useState<RouteResult | null>(null);

  // Custom icons
  const getIcon = (type: string) => {
    const iconSize: [number, number] = [32, 32];
    
    const icons = {
      ambulance: L.divIcon({
        html: '🚑',
        className: 'text-2xl',
        iconSize,
      }),
      hospital: L.divIcon({
        html: '🏥',
        className: 'text-2xl',
        iconSize,
      }),
      accident: L.divIcon({
        html: '🚨',
        className: 'text-2xl',
        iconSize,
      }),
    };

    return icons[type as keyof typeof icons] || new L.Icon.Default();
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([center.lat, center.lng], zoom);

    // Use light theme for map tiles (CartoDB Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CARTO',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, zoom]);

  // Update markers
  useEffect(() => {
    if (!markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    markers.forEach((marker) => {
      const leafletMarker = L.marker([marker.position.lat, marker.position.lng], {
        icon: marker.icon ? getIcon(marker.icon) : new L.Icon.Default(),
      });

      if (marker.popup) {
        leafletMarker.bindPopup(marker.popup);
      }

      leafletMarker.addTo(markersLayerRef.current!);
    });
  }, [markers]);

  // Fetch real road route using OSRM when route changes
  useEffect(() => {
    if (route.length === 2) {
      // Fetch route using OSRM (uses Dijkstra's algorithm internally)
      getRoute(route[0], route[1]).then(data => {
        setRouteData(data);
      });
    } else {
      setRouteData(null);
    }
  }, [route]);

  // Update route on map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove old route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    // Add new route from OSRM
    if (routeData && routeData.coordinates.length > 0) {
      const latLngs: [number, number][] = routeData.coordinates.map(loc => [loc.lat, loc.lng]);
      routeLayerRef.current = L.polyline(latLngs, {
        color: routeColor,
        weight: 5,
        opacity: 0.8,
        className: 'route-line'
      }).addTo(mapInstanceRef.current);

      // Fit bounds to show entire route
      mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), {
        padding: [50, 50],
      });

      console.log('Real road route rendered:', {
        points: routeData.coordinates.length,
        distance: `${(routeData.distance / 1000).toFixed(2)} km`,
        duration: `${Math.round(routeData.duration / 60)} min`,
        color: routeColor
      });
    }
  }, [routeData, routeColor]);

  return <div ref={mapRef} className={`w-full h-full ${className}`} />;
}