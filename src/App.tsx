import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import { 
  MapPin, 
  Search, 
  Plus, 
  Navigation, 
  Info, 
  Phone, 
  ChevronRight, 
  X, 
  Filter, 
  Building2, 
  Hospital, 
  GraduationCap, 
  ShoppingBag, 
  Fuel, 
  Church, 
  LocateFixed, 
  Loader2, 
  AlertCircle,
  Compass,
  HeartPulse,
  Sparkles,
  Bike,
  Footprints,
  Car,
  Utensils,
  Bus,
  Shield,
  Star,
  CheckCircle,
  BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';

import { SIMULATION_CIRCUITS, SimulationCircuit } from './data/simulationCircuits';
import { INITIAL_ZINDER_LOCATIONS } from './data/initialLocations';
import { calculateDistance, formatDistance, interpolatePoints } from './utils/geoUtils';
import { SimulationController } from './components/SimulationController';
import { EmergencyModal } from './components/EmergencyModal';
import { RoadmapModal } from './components/RoadmapModal';
import { RouteCalculatorCard } from './components/RouteCalculatorCard';

// Fix Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom distinctive marker icon for user's current GPS location
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-pin',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(37, 99, 235, 0.35); border-radius: 50%; animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;"></div>
        <div style="width: 18px; height: 18px; background-color: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 2;"></div>
      </div>
      <style>
        @keyframes pulse-ring {
          0% { transform: scale(0.5); opacity: 0.9; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      </style>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Custom simulated moving vehicle/pedestrian icon
const createSimulatedLocationIcon = (mode: 'walk' | 'moto' | 'car') => {
  const iconEmoji = mode === 'walk' ? '🚶' : mode === 'moto' ? '🛵' : '🚗';
  const bgColor = mode === 'walk' ? '#059669' : mode === 'moto' ? '#d97706' : '#2563eb';

  return L.divIcon({
    className: 'custom-sim-pin',
    html: `
      <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 42px; height: 42px; background-color: ${bgColor}40; border-radius: 50%; animation: sim-pulse 1.5s ease-out infinite;"></div>
        <div style="width: 32px; height: 32px; background-color: ${bgColor}; border: 2.5px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.35); z-index: 3;">
          ${iconEmoji}
        </div>
      </div>
      <style>
        @keyframes sim-pulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -21],
  });
};

// Category icon creator
const createCategoryIcon = (type: string, isDuty?: number) => {
  let color = '#4b5563';
  let symbol = '📍';

  if (type === 'Santé') {
    color = isDuty ? '#dc2626' : '#ea580c';
    symbol = '🏥';
  } else if (type === 'Culture') {
    color = '#059669';
    symbol = '🏛️';
  } else if (type === 'Religion') {
    color = '#047857';
    symbol = '🕌';
  } else if (type === 'Commerce') {
    color = '#d97706';
    symbol = '🛍️';
  } else if (type === 'Éducation') {
    color = '#2563eb';
    symbol = '🎓';
  } else if (type === 'Transport') {
    color = '#7c3aed';
    symbol = '🚌';
  } else if (type === 'Service') {
    color = '#0284c7';
    symbol = '⚡';
  } else if (type === 'Restauration') {
    color = '#e11d48';
    symbol = '🍲';
  }

  return L.divIcon({
    className: 'category-poi-pin',
    html: `
      <div style="width: 30px; height: 30px; background-color: ${color}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 3px 8px rgba(0,0,0,0.25); cursor: pointer;">
        ${symbol}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

interface Location {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  description: string;
  address: string;
  neighborhood?: string;
  phone: string;
  is_on_duty?: number;
  opening_hours?: string;
  rating?: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

const CATEGORIES = [
  { name: 'Tous', icon: Filter },
  { name: 'Santé', icon: Hospital },
  { name: 'Culture', icon: Building2 },
  { name: 'Commerce', icon: ShoppingBag },
  { name: 'Transport', icon: Bus },
  { name: 'Éducation', icon: GraduationCap },
  { name: 'Service', icon: Fuel },
  { name: 'Religion', icon: Church },
  { name: 'Restauration', icon: Utensils },
];

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function App() {
  const [locations, setLocations] = useState<Location[]>(INITIAL_ZINDER_LOCATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Tous');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  // Navigation & Itinerary state
  const [routeTargetLocation, setRouteTargetLocation] = useState<Location | null>(null);

  // Map Camera state
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.805, 8.985]);
  const [mapZoom, setMapZoom] = useState(14);

  // Modals state
  const [isAdding, setIsAdding] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(true);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // SIMULATION ENGINE STATE
  const [activeCircuit, setActiveCircuit] = useState<SimulationCircuit>(SIMULATION_CIRCUITS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [transportMode, setTransportMode] = useState<'walk' | 'moto' | 'car'>('moto');
  const [speedMultiplier, setSpeedMultiplier] = useState(2);
  const [proximityAlert, setProximityAlert] = useState<{ location: Location; distance: number } | null>(null);

  // Add form state
  const [newLocation, setNewLocation] = useState({
    name: '',
    type: 'Commerce',
    description: '',
    address: '',
    neighborhood: 'Centre-ville',
    phone: '',
    is_on_duty: 0,
    opening_hours: '08h00 - 18h00',
    latitude: 13.805,
    longitude: 8.985
  });

  const userIcon = useMemo(() => createUserLocationIcon(), []);
  const simIcon = useMemo(() => createSimulatedLocationIcon(transportMode), [transportMode]);

  // Interpolated smooth path for the active simulation circuit
  const interpolatedCircuitPath = useMemo(() => {
    if (!activeCircuit || activeCircuit.points.length < 2) return [];
    const fullPath: [number, number][] = [];
    for (let i = 0; i < activeCircuit.points.length - 1; i++) {
      const p1: [number, number] = [activeCircuit.points[i].latitude, activeCircuit.points[i].longitude];
      const p2: [number, number] = [activeCircuit.points[i + 1].latitude, activeCircuit.points[i + 1].longitude];
      const segment = interpolatePoints(p1, p2, 25);
      fullPath.push(...segment);
    }
    return fullPath;
  }, [activeCircuit]);

  const totalSimSteps = Math.max(1, interpolatedCircuitPath.length);

  // Current simulated position coordinates
  const simulatedPosition: [number, number] | null = useMemo(() => {
    if (interpolatedCircuitPath.length === 0) return null;
    const clamped = Math.min(simStep, interpolatedCircuitPath.length - 1);
    return interpolatedCircuitPath[clamped] || null;
  }, [interpolatedCircuitPath, simStep]);

  // Fetch registered locations from Express/SQLite backend
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error('Failed to fetch locations', err);
    }
  };

  // Simulation Loop Timer
  useEffect(() => {
    if (!isSimulating) return;

    let baseInterval = 600; // ms per step
    if (transportMode === 'walk') baseInterval = 700;
    if (transportMode === 'moto') baseInterval = 400;
    if (transportMode === 'car') baseInterval = 250;

    const intervalTime = Math.max(80, Math.round(baseInterval / speedMultiplier));

    const interval = setInterval(() => {
      setSimStep((prev) => {
        if (prev >= totalSimSteps - 1) {
          setIsSimulating(false);
          return totalSimSteps - 1;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isSimulating, totalSimSteps, transportMode, speedMultiplier]);

  // Sync map center with simulated movement if enabled
  useEffect(() => {
    if (isSimulating && simulatedPosition) {
      setMapCenter(simulatedPosition);
    }
  }, [isSimulating, simStep, simulatedPosition]);

  // Proximity Detection Engine: Check if current position is close to any landmark in Zinder (< 220m)
  useEffect(() => {
    const currentCoords = simulatedPosition || (userLocation ? [userLocation.latitude, userLocation.longitude] : null);
    if (!currentCoords || locations.length === 0) return;

    let closest: { location: Location; distance: number } | null = null;

    for (const loc of locations) {
      const dist = calculateDistance(currentCoords[0], currentCoords[1], loc.latitude, loc.longitude);
      if (dist < 220) {
        if (!closest || dist < closest.distance) {
          closest = { location: loc, distance: dist };
        }
      }
    }

    if (closest) {
      setProximityAlert(closest);
    } else {
      setProximityAlert(null);
    }
  }, [simulatedPosition, userLocation, locations]);

  // Browser Geolocation
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas prise en charge par votre navigateur.");
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const coords: UserLocation = {
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp
        };
        setUserLocation(coords);
        setMapCenter([latitude, longitude]);
        setMapZoom(16);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Autorisation d'accès à la position GPS refusée.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Signal GPS momentanément indisponible.");
            break;
          case error.TIMEOUT:
            setGeoError("Délai de géolocalisation dépassé.");
            break;
          default:
            setGeoError("Impossible d'obtenir la position.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocation)
      });
      if (res.ok) {
        setIsAdding(false);
        fetchLocations();
        setNewLocation({
          name: '',
          type: 'Commerce',
          description: '',
          address: '',
          neighborhood: 'Centre-ville',
          phone: '',
          is_on_duty: 0,
          opening_hours: '08h00 - 18h00',
          latitude: userLocation ? userLocation.latitude : 13.805,
          longitude: userLocation ? userLocation.longitude : 8.985
        });
      }
    } catch (err) {
      console.error('Failed to add location', err);
    }
  };

  const neighborhoods = useMemo(() => {
    const set = new Set<string>();
    locations.forEach(l => {
      if (l.neighborhood) set.add(l.neighborhood);
    });
    return ['Tous', ...Array.from(set)];
  }, [locations]);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesSearch = 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.address && loc.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (loc.neighborhood && loc.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'Tous' || loc.type === selectedCategory;
      const matchesNeighborhood = selectedNeighborhood === 'Tous' || loc.neighborhood === selectedNeighborhood;

      return matchesSearch && matchesCategory && matchesNeighborhood;
    });
  }, [locations, searchQuery, selectedCategory, selectedNeighborhood]);

  const selectLocation = (loc: Location) => {
    setSelectedLocation(loc);
    setMapCenter([loc.latitude, loc.longitude]);
    setMapZoom(16);
  };

  // Active Origin for Itinerary (Simulated or GPS)
  const currentOrigin = useMemo(() => {
    if (simulatedPosition) {
      return {
        latitude: simulatedPosition[0],
        longitude: simulatedPosition[1],
        label: `Position Simulée (${activeCircuit.title.replace('Circuit ', '')})`
      };
    }
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        label: 'Ma position GPS actuelle'
      };
    }
    return {
      latitude: 13.805,
      longitude: 8.985,
      label: 'Centre-ville Zinder'
    };
  }, [simulatedPosition, userLocation, activeCircuit]);

  return (
    <div className="flex flex-col h-screen bg-stone-50 overflow-hidden font-sans text-stone-900">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3.5 flex items-center justify-between z-20 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 flex-shrink-0">
            <Navigation size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-stone-900">Zinder Connect</h1>
              <span className="hidden md:inline text-[10px] bg-stone-100 text-stone-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Damagaram
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium hidden sm:block">Guide interactif, cartographie & services essentiels</p>
          </div>
        </div>
        
        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency button */}
          <button
            id="btn-emergency-header"
            onClick={() => setIsEmergencyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors shadow-sm"
            title="Numéros d'urgence et pharmacies de garde"
          >
            <HeartPulse size={16} className="text-red-600 animate-pulse" />
            <span className="hidden lg:inline">Urgences & Garde</span>
            <span className="lg:hidden">Urgences</span>
          </button>

          {/* Simulation Toggle */}
          <button
            id="btn-simulation-toggle"
            onClick={() => setIsSimulationOpen(!isSimulationOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              isSimulationOpen
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
            }`}
            title="Activer le mode simulation de trajet"
          >
            <Compass size={16} className={isSimulating ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Simulateur</span>
          </button>

          {/* Roadmap & AI Specifications */}
          <button
            id="btn-roadmap-guide"
            onClick={() => setIsRoadmapOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
            title="Fonctionnalités & Prompts Antigravity"
          >
            <Sparkles size={16} className="text-purple-600" />
            <span className="hidden xl:inline">Roadmap & IA</span>
          </button>

          {/* Add location */}
          <button 
            id="btn-add-location"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 bg-stone-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors shadow-md flex-shrink-0"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Directory */}
        <aside className="w-80 sm:w-96 bg-white border-r border-stone-200 flex flex-col z-10 shadow-xl flex-shrink-0">
          {/* Search and Filters */}
          <div className="p-4 space-y-3 border-b border-stone-100">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
              <input 
                id="search-locations-input"
                type="text"
                placeholder="Rechercher pharmacie, sultan, marché..."
                className="w-full pl-9 pr-4 py-2.5 bg-stone-100 border-none rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 transition-all placeholder-stone-400 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Categories Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.name 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <cat.icon size={13} />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Neighborhood Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Quartier:</span>
              <select
                value={selectedNeighborhood}
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                className="bg-stone-100 border-none text-stone-700 font-medium rounded-lg text-xs py-1 px-2 focus:ring-1 focus:ring-emerald-500"
              >
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Locations List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
            <div className="flex items-center justify-between px-1 mb-1">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                {filteredLocations.length} Lieux répertoriés
              </p>
              {userLocation && (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                  GPS Actif
                </span>
              )}
            </div>

            {filteredLocations.map((loc) => (
              <motion.div
                layout
                key={loc.id}
                onClick={() => selectLocation(loc)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all group ${
                  selectedLocation?.id === loc.id
                  ? 'bg-emerald-50/70 border-emerald-400 shadow-sm ring-1 ring-emerald-400'
                  : 'bg-white border-stone-200/80 hover:border-stone-300 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <h3 className="font-bold text-sm text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {loc.name}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {loc.is_on_duty === 1 && (
                      <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        De Garde
                      </span>
                    )}
                    <span className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {loc.type}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-500 line-clamp-2 mb-2 leading-relaxed">
                  {loc.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-medium text-stone-400 pt-1 border-t border-stone-100">
                  <div className="flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin size={12} className="text-stone-400 flex-shrink-0" />
                    <span className="truncate">{loc.neighborhood ? `${loc.neighborhood} • ` : ''}{loc.address || 'Zinder'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRouteTargetLocation(loc);
                      }}
                      className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold flex items-center gap-1"
                      title="Calculer l'itinéraire"
                    >
                      <Navigation size={10} />
                      <span>Trajet</span>
                    </button>
                    <ChevronRight size={14} className="text-stone-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredLocations.length === 0 && (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-2">
                  <Search size={22} />
                </div>
                <h4 className="text-sm font-bold text-stone-800">Aucun résultat trouvé</h4>
                <p className="text-xs text-stone-500 mt-1">Essayez un autre mot-clé ou ajoutez ce lieu à la communauté.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Map Stage Area */}
        <main className="flex-1 relative h-full">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={mapCenter} zoom={mapZoom} />

            {/* Simulation Path Polyline */}
            {isSimulationOpen && activeCircuit && (
              <>
                <Polyline
                  positions={activeCircuit.points.map(p => [p.latitude, p.longitude])}
                  pathOptions={{
                    color: activeCircuit.color,
                    weight: 5,
                    opacity: 0.7,
                    dashArray: '8, 8'
                  }}
                />
                {/* Checkpoint markers of circuit */}
                {activeCircuit.points.map((pt, idx) => (
                  <Circle
                    key={idx}
                    center={[pt.latitude, pt.longitude]}
                    radius={30}
                    pathOptions={{
                      color: activeCircuit.color,
                      fillColor: activeCircuit.color,
                      fillOpacity: 0.9,
                      weight: 2
                    }}
                  />
                ))}
              </>
            )}

            {/* Direct route polyline when route target is selected */}
            {routeTargetLocation && (
              <Polyline
                positions={[
                  [currentOrigin.latitude, currentOrigin.longitude],
                  [routeTargetLocation.latitude, routeTargetLocation.longitude]
                ]}
                pathOptions={{
                  color: '#2563eb',
                  weight: 4,
                  opacity: 0.85
                }}
              />
            )}
            
            {/* Registered POIs Markers */}
            {filteredLocations.map((loc) => (
              <Marker 
                key={loc.id} 
                position={[loc.latitude, loc.longitude]}
                icon={createCategoryIcon(loc.type, loc.is_on_duty)}
                eventHandlers={{
                  click: () => selectLocation(loc)
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[170px]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] bg-stone-100 text-stone-700 font-bold px-1.5 py-0.5 rounded uppercase">
                        {loc.type}
                      </span>
                      {loc.is_on_duty === 1 && (
                        <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded uppercase">
                          Garde
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-stone-900 text-sm">{loc.name}</h4>
                    <p className="text-xs text-stone-600 line-clamp-2 my-1">{loc.description}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px]">
                      <button 
                        onClick={() => selectLocation(loc)}
                        className="font-bold text-emerald-600 uppercase tracking-wider hover:underline"
                      >
                        Détails
                      </button>
                      <button 
                        onClick={() => setRouteTargetLocation(loc)}
                        className="font-bold text-blue-600 uppercase tracking-wider hover:underline"
                      >
                        Itinéraire
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Simulated moving vehicle marker */}
            {simulatedPosition && isSimulationOpen && (
              <Marker
                position={simulatedPosition}
                icon={simIcon}
                zIndexOffset={1000}
              >
                <Popup>
                  <div className="p-1 text-xs">
                    <div className="font-bold text-stone-900">Simulateur en direct</div>
                    <div className="text-stone-500">Mode: {transportMode} ({speedMultiplier}x)</div>
                    <div className="text-[10px] font-mono text-stone-400 mt-1">
                      {simulatedPosition[0].toFixed(5)}, {simulatedPosition[1].toFixed(5)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Real User GPS Marker */}
            {userLocation && (
              <>
                {userLocation.accuracy && (
                  <Circle
                    center={[userLocation.latitude, userLocation.longitude]}
                    radius={Math.min(userLocation.accuracy, 250)}
                    pathOptions={{
                      color: '#2563eb',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.15,
                      weight: 1,
                      dashArray: '4, 4'
                    }}
                  />
                )}
                <Marker
                  position={[userLocation.latitude, userLocation.longitude]}
                  icon={userIcon}
                  zIndexOffset={900}
                >
                  <Popup>
                    <div className="p-1 min-w-[170px]">
                      <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs mb-1">
                        <LocateFixed size={14} />
                        <span>Vous êtes ici</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Signal GPS actif (~{Math.round(userLocation.accuracy || 10)}m de précision)
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>

          {/* Floating On-Map Tools Bar (Top Right) */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            {/* GPS Locate Button */}
            <button
              id="map-geolocation-button"
              onClick={handleGeolocate}
              disabled={isLocating}
              className={`w-11 h-11 rounded-2xl shadow-xl flex items-center justify-center transition-all transform active:scale-95 border ${
                userLocation 
                  ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700 shadow-blue-500/30' 
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-blue-600 shadow-stone-900/10'
              }`}
              title="Centrer sur ma position GPS réelle"
            >
              {isLocating ? (
                <Loader2 size={20} className="animate-spin text-blue-500" />
              ) : (
                <LocateFixed size={20} className={userLocation ? "text-white" : "text-stone-700"} />
              )}
            </button>

            {/* Quick Center Zinder */}
            <button
              onClick={() => {
                setMapCenter([13.805, 8.985]);
                setMapZoom(14);
              }}
              className="w-11 h-11 rounded-2xl shadow-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-emerald-600 flex items-center justify-center transition-all"
              title="Recadrer sur le centre de Zinder"
            >
              <Building2 size={20} />
            </button>
          </div>

          {/* Proximity Alert Floating Pill */}
          <AnimatePresence>
            {proximityAlert && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] max-w-md w-full px-4"
              >
                <div 
                  onClick={() => selectLocation(proximityAlert.location)}
                  className="bg-emerald-900/90 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center justify-between cursor-pointer hover:bg-emerald-900 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center flex-shrink-0 font-bold">
                      <BellRing size={16} className="animate-bounce" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                        Lieu à proximité ({formatDistance(proximityAlert.distance)})
                      </div>
                      <div className="text-xs font-bold truncate">
                        {proximityAlert.location.name}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-1 rounded-lg font-bold flex-shrink-0 ml-2">
                    Voir
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Simulation Controller Panel (Bottom Center) */}
          <AnimatePresence>
            {isSimulationOpen && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xl px-4"
              >
                <SimulationController
                  activeCircuit={activeCircuit}
                  onSelectCircuit={(circuit) => {
                    setActiveCircuit(circuit);
                    setSimStep(0);
                    setIsSimulating(false);
                    if (circuit.points.length > 0) {
                      setMapCenter([circuit.points[0].latitude, circuit.points[0].longitude]);
                    }
                  }}
                  isPlaying={isSimulating}
                  onTogglePlay={() => setIsSimulating(!isSimulating)}
                  onReset={() => {
                    setSimStep(0);
                    setIsSimulating(false);
                  }}
                  onStepForward={() => {
                    setSimStep(prev => Math.min(prev + 5, totalSimSteps - 1));
                  }}
                  progressPercent={(simStep / Math.max(1, totalSimSteps - 1)) * 100}
                  currentStepIndex={simStep}
                  totalSteps={totalSimSteps}
                  transportMode={transportMode}
                  onChangeTransportMode={(mode) => setTransportMode(mode)}
                  speedMultiplier={speedMultiplier}
                  onChangeSpeed={(mult) => setSpeedMultiplier(mult)}
                  onClose={() => setIsSimulationOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Route Calculator Card (if user clicked 'Trajet') */}
          <AnimatePresence>
            {routeTargetLocation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="absolute top-4 left-4 z-[1050] max-w-md w-full"
              >
                <RouteCalculatorCard
                  origin={currentOrigin}
                  destination={routeTargetLocation}
                  onClose={() => setRouteTargetLocation(null)}
                  onStartSimulationToDestination={() => {
                    // Create a dynamic on-the-fly circuit towards this destination
                    const customCircuit: SimulationCircuit = {
                      id: `custom-route-${routeTargetLocation.id}`,
                      title: `Trajet vers ${routeTargetLocation.name}`,
                      subtitle: `Depuis ${currentOrigin.label}`,
                      category: 'Itinéraire',
                      icon: 'Navigation',
                      color: '#2563eb',
                      points: [
                        { latitude: currentOrigin.latitude, longitude: currentOrigin.longitude, name: currentOrigin.label, description: 'Départ' },
                        { latitude: routeTargetLocation.latitude, longitude: routeTargetLocation.longitude, name: routeTargetLocation.name, description: routeTargetLocation.description }
                      ]
                    };
                    setActiveCircuit(customCircuit);
                    setSimStep(0);
                    setIsSimulationOpen(true);
                    setIsSimulating(true);
                    setRouteTargetLocation(null);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Detail Card for Selected Location */}
          <AnimatePresence>
            {selectedLocation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[1000]"
              >
                <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 p-5 relative overflow-hidden">
                  <button 
                    onClick={() => setSelectedLocation(null)}
                    className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-700"
                  >
                    <X size={18} />
                  </button>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {selectedLocation.type}
                    </span>
                    {selectedLocation.is_on_duty === 1 && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        De Garde 24/7
                      </span>
                    )}
                    {selectedLocation.rating && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                        <Star size={13} fill="currentColor" />
                        <span>{selectedLocation.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold text-stone-900 mb-1.5">{selectedLocation.name}</h2>
                  <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                    {selectedLocation.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 border-t border-stone-100 pt-3 mb-4 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-stone-100 rounded-lg flex items-center justify-center text-stone-500">
                        <MapPin size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-stone-400 uppercase">Adresse</p>
                        <p className="text-stone-900 font-medium truncate">{selectedLocation.address || 'Zinder'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-stone-100 rounded-lg flex items-center justify-center text-stone-500">
                        <Phone size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-stone-400 uppercase">Téléphone</p>
                        <p className="text-stone-900 font-medium truncate">{selectedLocation.phone || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this POI */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setRouteTargetLocation(selectedLocation);
                        setSelectedLocation(null);
                      }}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                    >
                      <Navigation size={14} />
                      <span>Calculer le trajet</span>
                    </button>

                    {selectedLocation.phone && (
                      <a
                        href={`tel:${selectedLocation.phone}`}
                        className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone size={14} />
                        <span>Appeler</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast / Error Banner */}
          <AnimatePresence>
            {geoError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] max-w-md w-full px-4"
              >
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                    <span>{geoError}</span>
                  </div>
                  <button 
                    onClick={() => setGeoError(null)}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors ml-2"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Location Modal */}
          <AnimatePresence>
            {isAdding && (
              <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto border border-stone-200"
                >
                  <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                    <div>
                      <h2 className="text-lg font-bold text-stone-900">Ajouter un lieu à Zinder</h2>
                      <p className="text-xs text-stone-500">Contribuez à la cartographie locale de Zinder Connect</p>
                    </div>
                    <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-stone-200 rounded-xl transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddLocation} className="p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Nom du lieu</label>
                        <input 
                          required
                          type="text"
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-stone-800"
                          placeholder="Ex: Pharmacie du Sultan"
                          value={newLocation.name}
                          onChange={e => setNewLocation({...newLocation, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Catégorie</label>
                        <select 
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-stone-800 font-medium"
                          value={newLocation.type}
                          onChange={e => setNewLocation({...newLocation, type: e.target.value})}
                        >
                          {CATEGORIES.filter(c => c.name !== 'Tous').map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Description</label>
                      <textarea 
                        rows={2}
                        className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-stone-800"
                        placeholder="Description des services proposés, spécialités..."
                        value={newLocation.description}
                        onChange={e => setNewLocation({...newLocation, description: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Quartier</label>
                        <input 
                          type="text"
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 transition-all text-stone-800"
                          placeholder="Ex: Birni, Sabon Gari"
                          value={newLocation.neighborhood}
                          onChange={e => setNewLocation({...newLocation, neighborhood: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Téléphone</label>
                        <input 
                          type="text"
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 transition-all text-stone-800"
                          placeholder="Ex: +227 90 00 00 00"
                          value={newLocation.phone}
                          onChange={e => setNewLocation({...newLocation, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Geolocation Autofill */}
                    <div className="bg-stone-50 border border-stone-200 p-3 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-stone-800 text-[11px]">Coordonnées GPS</p>
                        <p className="font-mono text-stone-500 text-[10px]">
                          {newLocation.latitude.toFixed(4)}, {newLocation.longitude.toFixed(4)}
                        </p>
                      </div>
                      {userLocation && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewLocation(prev => ({
                              ...prev,
                              latitude: parseFloat(userLocation.latitude.toFixed(6)),
                              longitude: parseFloat(userLocation.longitude.toFixed(6))
                            }));
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <LocateFixed size={12} />
                          <span>Ma position GPS</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-all"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Emergency Modal */}
          <EmergencyModal
            isOpen={isEmergencyOpen}
            onClose={() => setIsEmergencyOpen(false)}
            onSelectLocation={(lat, lng) => {
              setMapCenter([lat, lng]);
              setMapZoom(16);
            }}
          />

          {/* Roadmap & Antigravity Guide Modal */}
          <RoadmapModal
            isOpen={isRoadmapOpen}
            onClose={() => setIsRoadmapOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}
