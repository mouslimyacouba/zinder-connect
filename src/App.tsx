import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
  Church
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
  map.setView(center, zoom);
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

  const [newLocation, setNewLocation] = useState({
    name: '',
    type: 'Commerce',
    description: '',
    address: '',
    phone: '',
    latitude: 13.805,
    longitude: 8.985
  });

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
          latitude: 13.805,
          longitude: 8.985
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

  return (
    <div className="flex flex-col h-screen bg-stone-50 overflow-hidden">
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
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors shadow-md"
          >
            <Plus size={18} />
            Ajouter un lieu
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
                type="text"
                placeholder="Rechercher un lieu, un service..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
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
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">
              {filteredLocations.length} Lieux trouvés
            </p>
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
          </MapContainer>

          {/* Floating Info Card */}
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
                    <h2 className="text-xl font-bold text-stone-900">Ajouter un nouveau lieu</h2>
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

                    <div className="bg-emerald-50 p-4 rounded-2xl flex items-start gap-3">
                      <Info size={18} className="text-emerald-600 mt-0.5" />
                      <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
                        Pour cette version démo, les coordonnées GPS sont fixées au centre de Zinder. Dans la version finale, vous pourrez cliquer sur la carte pour définir l'emplacement exact.
                      </p>
                    </div>

                    <div className="pt-4 flex gap-3">
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
