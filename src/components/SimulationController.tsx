import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Bike, 
  Footprints, 
  Car, 
  Compass, 
  MapPin, 
  Volume2, 
  VolumeX,
  X,
  Gauge
} from 'lucide-react';
import { SIMULATION_CIRCUITS, SimulationCircuit } from '../data/simulationCircuits';

interface SimulationControllerProps {
  activeCircuit: SimulationCircuit;
  onSelectCircuit: (circuit: SimulationCircuit) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onStepForward: () => void;
  progressPercent: number;
  currentStepIndex: number;
  totalSteps: number;
  transportMode: 'walk' | 'moto' | 'car';
  onChangeTransportMode: (mode: 'walk' | 'moto' | 'car') => void;
  speedMultiplier: number;
  onChangeSpeed: (multiplier: number) => void;
  onClose: () => void;
}

export const SimulationController: React.FC<SimulationControllerProps> = ({
  activeCircuit,
  onSelectCircuit,
  isPlaying,
  onTogglePlay,
  onReset,
  onStepForward,
  progressPercent,
  currentStepIndex,
  totalSteps,
  transportMode,
  onChangeTransportMode,
  speedMultiplier,
  onChangeSpeed,
  onClose
}) => {
  const currentWaypoint = activeCircuit.points[
    Math.min(
      Math.floor((currentStepIndex / Math.max(1, totalSteps)) * activeCircuit.points.length),
      activeCircuit.points.length - 1
    )
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-stone-200 shadow-2xl p-4 sm:p-5 w-full max-w-xl text-stone-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
            <Compass size={18} className={isPlaying ? "animate-spin" : ""} style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-stone-900">Simulateur de Trajet • Zinder</h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Actif
              </span>
            </div>
            <p className="text-[11px] text-stone-500">Test de déplacement virtuel en temps réel dans la ville</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
          title="Fermer le simulateur"
        >
          <X size={18} />
        </button>
      </div>

      {/* Circuit Selector */}
      <div className="mb-3.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 block">
          Choisir le circuit de démonstration :
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SIMULATION_CIRCUITS.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCircuit(c)}
              className={`p-2 rounded-xl text-left border transition-all ${
                activeCircuit.id === c.id
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
              }`}
            >
              <div className="text-xs truncate">{c.title.replace('Circuit ', '')}</div>
              <div className="text-[9px] text-stone-500 truncate">{c.category}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Waypoint indicator */}
      {currentWaypoint && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <MapPin size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-stone-900 truncate">
                {currentWaypoint.name}
              </div>
              <div className="text-[11px] text-stone-500 truncate">
                {currentWaypoint.description}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0 pl-2">
            <span className="text-xs font-mono font-bold text-emerald-700">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mb-3.5">
        <div 
          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Controls & Transport Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span>{isPlaying ? 'Pause' : 'Démarrer'}</span>
          </button>

          <button
            onClick={onStepForward}
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs transition-colors"
            title="Avancer d'un pas"
          >
            <SkipForward size={16} />
          </button>

          <button
            onClick={onReset}
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs transition-colors"
            title="Réinitialiser le parcours"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Transport Modes */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => onChangeTransportMode('walk')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              transportMode === 'walk'
                ? 'bg-white text-stone-900 font-bold shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="À pied (~5 km/h)"
          >
            <Footprints size={14} />
            <span className="hidden sm:inline">Pied</span>
          </button>
          
          <button
            onClick={() => onChangeTransportMode('moto')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              transportMode === 'moto'
                ? 'bg-white text-stone-900 font-bold shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Kabou-Kabou / Moto (~25 km/h)"
          >
            <Bike size={14} />
            <span className="hidden sm:inline">Moto</span>
          </button>

          <button
            onClick={() => onChangeTransportMode('car')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              transportMode === 'car'
                ? 'bg-white text-stone-900 font-bold shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Voiture / Taxi (~45 km/h)"
          >
            <Car size={14} />
            <span className="hidden sm:inline">Auto</span>
          </button>
        </div>

        {/* Speed multiplier */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
          <Gauge size={14} />
          <div className="flex gap-1">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSpeed(speed)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  speedMultiplier === speed
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
