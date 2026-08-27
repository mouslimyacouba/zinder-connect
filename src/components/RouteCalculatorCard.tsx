import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Bike, 
  Footprints, 
  Car, 
  Clock, 
  Coins, 
  X, 
  Share2, 
  Phone,
  Compass,
  ArrowRight
} from 'lucide-react';
import { calculateDistance, formatDistance, calculateTravelTime, estimateFareFCFA } from '../utils/geoUtils';

interface Location {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  description: string;
  address: string;
  phone: string;
  neighborhood?: string;
  is_on_duty?: number;
  opening_hours?: string;
}

interface RouteCalculatorCardProps {
  origin: { latitude: number; longitude: number; label: string };
  destination: Location;
  onClose: () => void;
  onStartSimulationToDestination?: () => void;
}

export const RouteCalculatorCard: React.FC<RouteCalculatorCardProps> = ({
  origin,
  destination,
  onClose,
  onStartSimulationToDestination
}) => {
  const [selectedMode, setSelectedMode] = useState<'moto' | 'walk' | 'car'>('moto');

  const distanceMeters = calculateDistance(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );

  const formattedDist = formatDistance(distanceMeters);
  const timeEstimate = calculateTravelTime(distanceMeters, selectedMode);
  const motoFare = estimateFareFCFA(distanceMeters, 'moto');
  const carFare = estimateFareFCFA(distanceMeters, 'car');

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl p-5 w-full max-w-md text-stone-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Navigation size={17} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900">Itinéraire dans Zinder</h3>
            <p className="text-[10px] text-stone-500 font-mono">Calcul temps & tarif de course</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Origin -> Destination points */}
      <div className="space-y-2 mb-4 bg-stone-50 p-3 rounded-2xl border border-stone-200">
        <div className="flex items-center gap-2.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 flex-shrink-0 ml-1" />
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-bold text-stone-400 block">Départ</span>
            <span className="font-medium text-stone-800 truncate block">{origin.label}</span>
          </div>
        </div>
        
        <div className="w-0.5 h-3 bg-stone-300 ml-2" />

        <div className="flex items-center gap-2.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100 flex-shrink-0 ml-1" />
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-bold text-stone-400 block">Arrivée</span>
            <span className="font-bold text-emerald-900 truncate block">{destination.name}</span>
          </div>
        </div>
      </div>

      {/* Mode selection tabs */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => setSelectedMode('moto')}
          className={`p-2.5 rounded-2xl border text-center transition-all ${
            selectedMode === 'moto'
              ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-sm'
              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Bike size={18} className="mx-auto mb-1 text-amber-600" />
          <div className="text-xs">Kabou-Kabou</div>
          <div className="text-[10px] text-amber-700 font-bold">{calculateTravelTime(distanceMeters, 'moto').label}</div>
        </button>

        <button
          onClick={() => setSelectedMode('walk')}
          className={`p-2.5 rounded-2xl border text-center transition-all ${
            selectedMode === 'walk'
              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-sm'
              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Footprints size={18} className="mx-auto mb-1 text-emerald-600" />
          <div className="text-xs">À pied</div>
          <div className="text-[10px] text-emerald-700 font-bold">{calculateTravelTime(distanceMeters, 'walk').label}</div>
        </button>

        <button
          onClick={() => setSelectedMode('car')}
          className={`p-2.5 rounded-2xl border text-center transition-all ${
            selectedMode === 'car'
              ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold shadow-sm'
              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Car size={18} className="mx-auto mb-1 text-blue-600" />
          <div className="text-xs">Taxi / Auto</div>
          <div className="text-[10px] text-blue-700 font-bold">{calculateTravelTime(distanceMeters, 'car').label}</div>
        </button>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-3 gap-2 bg-stone-100 p-3 rounded-2xl mb-4 text-center">
        <div>
          <span className="text-[9px] uppercase font-bold text-stone-500 block">Distance</span>
          <span className="text-sm font-bold text-stone-900">{formattedDist}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-stone-500 block">Durée</span>
          <span className="text-sm font-bold text-stone-900">{timeEstimate.label}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-stone-500 block">Prix Estimé</span>
          <span className="text-sm font-bold text-emerald-700">
            {selectedMode === 'walk' ? 'Gratuit' : `${selectedMode === 'moto' ? motoFare : carFare} FCFA`}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {onStartSimulationToDestination && (
          <button
            onClick={onStartSimulationToDestination}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Compass size={15} />
            <span>Simuler le trajet</span>
          </button>
        )}
        {destination.phone && (
          <a
            href={`tel:${destination.phone}`}
            className="px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone size={15} />
            <span>Contacter</span>
          </a>
        )}
      </div>
    </div>
  );
};
