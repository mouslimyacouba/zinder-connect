import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';

// Fix Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom distinctive marker icon for user's current location
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

interface Location {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  description: string;
  address: string;
  phone: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

const CATEGORIES = [
  { name: 'Tous', icon: Filter },
  { name: 'Culture', icon: Building2 },
  { name: 'Santé', icon: Hospital },
  { name: 'Éducation', icon: GraduationCap },
  { name: 'Commerce', icon: ShoppingBag },
  { name: 'Service', icon: Fuel },
  { name: 'Religion', icon: Church },
];

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.805, 8.985]);
  const [mapZoom, setMapZoom] = useState(14);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [newLocation, setNewLocation] = useState({
    name: '',
    type: 'Commerce',
    description: '',
    address: '',
    phone: '',
    latitude: 13.805,
    longitude: 8.985
  });

  const userIcon = useMemo(() => createUserLocationIcon(), []);

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
            setGeoError("Autorisation d'accès à la position refusée.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Signal de localisation indisponible.");
            break;
          case error.TIMEOUT:
            setGeoError("Délai de localisation dépassé.");
            break;
          default:
            setGeoError("Impossible de récupérer votre position.");
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
          phone: '',
          latitude: userLocation ? userLocation.latitude : 13.805,
          longitude: userLocation ? userLocation.longitude : 8.985
        });
      }
    } catch (err) {
      console.error('Failed to add location', err);
    }
  };

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Tous' || loc.type === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [locations, searchQuery, selectedCategory]);

  const selectLocation = (loc: Location) => {
    setSelectedLocation(loc);
    setMapCenter([loc.latitude, loc.longitude]);
    setMapZoom(16);
  };

  const setLocationFromUserGPS = () => {
    if (userLocation) {
      setNewLocation(prev => ({
        ...prev,
        latitude: parseFloat(userLocation.latitude.toFixed(6)),
        longitude: parseFloat(userLocation.longitude.toFixed(6))
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Navigation size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">Zinder Connect</h1>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-widest">Guide Local & Cartographie</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            id="btn-geolocate-header"
            onClick={handleGeolocate}
            disabled={isLocating}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all border ${
              userLocation 
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm' 
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
            title="Centrer sur ma position actuelle"
          >
            {isLocating ? (
              <Loader2 size={17} className="animate-spin text-blue-600" />
            ) : (
              <LocateFixed size={17} className={userLocation ? "text-blue-600" : "text-stone-600"} />
            )}
            <span className="hidden sm:inline">
              {isLocating ? "Localisation..." : userLocation ? "Position active" : "Ma position"}
            </span>
          </button>

          <button 
            id="btn-add-location"
            onClick={() => {
              if (userLocation) {
                setNewLocation(prev => ({
                  ...prev,
                  latitude: parseFloat(userLocation.latitude.toFixed(6)),
                  longitude: parseFloat(userLocation.longitude.toFixed(6))
                }));
              }
              setIsAdding(true);
            }}
            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors shadow-md"
          >
            <Plus size={18} />
            <span>Ajouter un lieu</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 md:w-96 bg-white border-r border-stone-200 flex flex-col z-10 shadow-xl">
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                id="search-locations"
                type="text"
                placeholder="Rechercher un lieu, un service..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all text-stone-800 placeholder-stone-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.name 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <cat.icon size={14} />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                {filteredLocations.length} Lieux trouvés
              </p>
              {userLocation && (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                  GPS connecté
                </span>
              )}
            </div>

            {filteredLocations.map((loc) => (
              <motion.div
                layout
                key={loc.id}
                onClick={() => selectLocation(loc)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all group ${
                  selectedLocation?.id === loc.id
                  ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                  : 'bg-white border-stone-100 hover:border-stone-300 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-stone-900 group-hover:text-emerald-700 transition-colors">
                    {loc.name}
                  </h3>
                  <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {loc.type}
                  </span>
                </div>
                <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                  {loc.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-medium text-stone-400">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    {loc.address || 'Zinder'}
                  </div>
                  <ChevronRight size={14} className="text-stone-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 relative">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={mapCenter} zoom={mapZoom} />
            
            {/* Registered POIs */}
            {filteredLocations.map((loc) => (
              <Marker 
                key={loc.id} 
                position={[loc.latitude, loc.longitude]}
                eventHandlers={{
                  click: () => selectLocation(loc)
                }}
              >
                <Popup>
                  <div className="p-1">
                    <h4 className="font-bold text-stone-900">{loc.name}</h4>
                    <p className="text-xs text-stone-600 mb-2">{loc.type}</p>
                    <button 
                      onClick={() => selectLocation(loc)}
                      className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider"
                    >
                      Voir détails
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Distinctive User Current Location Marker */}
            {userLocation && (
              <>
                {userLocation.accuracy && (
                  <Circle
                    center={[userLocation.latitude, userLocation.longitude]}
                    radius={Math.min(userLocation.accuracy, 300)}
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
                >
                  <Popup>
                    <div className="p-2 min-w-[180px]">
                      <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs mb-1">
                        <LocateFixed size={14} />
                        <span>Vous êtes ici</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-tight">
                        Position GPS actuelle (Précision : ~{Math.round(userLocation.accuracy || 15)}m)
                      </p>
                      <div className="mt-2 text-[10px] font-mono text-stone-400 bg-stone-100 p-1 rounded">
                        {userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>

          {/* Floating On-Map Geolocation Button */}
          <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
            <button
              id="map-geolocation-button"
              onClick={handleGeolocate}
              disabled={isLocating}
              className={`w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center transition-all transform active:scale-95 border ${
                userLocation 
                  ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700 shadow-blue-500/30' 
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-blue-600 shadow-stone-900/10'
              }`}
              title="Centrer sur ma position GPS"
            >
              {isLocating ? (
                <Loader2 size={22} className="animate-spin text-blue-500" />
              ) : (
                <LocateFixed size={22} className={userLocation ? "text-white" : "text-stone-700"} />
              )}
            </button>
          </div>

          {/* Toast / Error Banner */}
          <AnimatePresence>
            {geoError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] max-w-md w-full px-4"
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

          {/* Floating Info Card for Selected POI */}
          <AnimatePresence>
            {selectedLocation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[1000]"
              >
                <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 relative overflow-hidden">
                  <button 
                    onClick={() => setSelectedLocation(null)}
                    className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-stone-400" />
                  </button>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {selectedLocation.type}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-stone-900 mb-2">{selectedLocation.name}</h2>
                  <p className="text-sm text-stone-600 mb-6 leading-relaxed">
                    {selectedLocation.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-stone-500">
                        <MapPin size={16} />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-stone-400 uppercase tracking-widest text-[8px]">Adresse</p>
                        <p className="text-stone-900 font-medium">{selectedLocation.address || 'Zinder, Niger'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-stone-500">
                        <Phone size={16} />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-stone-400 uppercase tracking-widest text-[8px]">Contact</p>
                        <p className="text-stone-900 font-medium">{selectedLocation.phone || 'Non disponible'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Location Modal */}
          <AnimatePresence>
            {isAdding && (
              <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                >
                  <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                    <div>
                      <h2 className="text-xl font-bold text-stone-900">Ajouter un nouveau lieu</h2>
                      <p className="text-xs text-stone-500">Enrichissez la carte de Zinder avec un nouveau point d'intérêt</p>
                    </div>
                    <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddLocation} className="p-8 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Nom du lieu</label>
                        <input 
                          required
                          type="text"
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder="Ex: Pharmacie du Sultan"
                          value={newLocation.name}
                          onChange={e => setNewLocation({...newLocation, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Catégorie</label>
                        <select 
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          value={newLocation.type}
                          onChange={e => setNewLocation({...newLocation, type: e.target.value})}
                        >
                          {CATEGORIES.filter(c => c.name !== 'Tous').map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Description</label>
                      <textarea 
                        rows={3}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                        placeholder="Décrivez brièvement ce lieu..."
                        value={newLocation.description}
                        onChange={e => setNewLocation({...newLocation, description: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Adresse / Quartier</label>
                        <input 
                          type="text"
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder="Ex: Quartier Birni"
                          value={newLocation.address}
                          onChange={e => setNewLocation({...newLocation, address: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Téléphone</label>
                        <input 
                          type="text"
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder="Ex: +227 90 00 00 00"
                          value={newLocation.phone}
                          onChange={e => setNewLocation({...newLocation, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Geolocation autofill feature in form */}
                    <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-2xl flex items-center justify-between">
                      <div className="text-xs">
                        <p className="font-semibold text-stone-800">Coordonnées GPS</p>
                        <p className="text-[11px] font-mono text-stone-500">
                          {newLocation.latitude.toFixed(4)}, {newLocation.longitude.toFixed(4)}
                        </p>
                      </div>
                      {userLocation && (
                        <button
                          type="button"
                          onClick={setLocationFromUserGPS}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <LocateFixed size={13} />
                          <span>Utiliser ma position</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="flex-1 px-6 py-3 bg-stone-100 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-200 transition-all"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
                      >
                        Enregistrer le lieu
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
