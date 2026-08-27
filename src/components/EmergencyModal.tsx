import React from 'react';
import { 
  X, 
  PhoneCall, 
  AlertCircle, 
  ShieldAlert, 
  Flame, 
  HeartPulse, 
  Pill, 
  Zap, 
  Droplets,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';

interface EmergencyService {
  id: string;
  name: string;
  category: string;
  phone: string;
  displayPhone: string;
  description: string;
  hours: string;
  icon: React.ElementType;
  color: string;
  latitude?: number;
  longitude?: number;
}

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation?: (lat: number, lng: number) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ 
  isOpen, 
  onClose,
  onSelectLocation 
}) => {
  if (!isOpen) return null;

  const emergencyServices: EmergencyService[] = [
    {
      id: 'hnz',
      name: 'Hôpital National de Zinder (Urgences 24/7)',
      category: 'Santé & Samu',
      phone: '+22720510101',
      displayPhone: '+227 20 51 01 01',
      description: 'Service des urgences médicales et chirurgicales, banque de sang et maternité.',
      hours: '24h/24 & 7j/7',
      icon: HeartPulse,
      color: 'bg-red-50 text-red-600 border-red-200',
      latitude: 13.8100,
      longitude: 8.9900
    },
    {
      id: 'pompiers',
      name: 'Sapeurs-Pompiers Zinder',
      category: 'Secours & Incendie',
      phone: '18',
      displayPhone: '18 / +227 20 51 01 18',
      description: 'Accidents de la circulation, incendies, inondations et secours à personnes.',
      hours: '24h/24 & 7j/7',
      icon: Flame,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
      latitude: 13.8115,
      longitude: 8.9880
    },
    {
      id: 'police',
      name: 'Commissariat Central de Police',
      category: 'Sécurité Publique',
      phone: '17',
      displayPhone: '17 / +227 20 51 02 17',
      description: 'Intervention d\'urgence, brigade de patrouille et signalement d\'agression/vol.',
      hours: '24h/24 & 7j/7',
      icon: ShieldAlert,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      latitude: 13.8060,
      longitude: 8.9830
    },
    {
      id: 'pharmacie-garde',
      name: 'Pharmacie de Garde (Grand Marché)',
      category: 'Pharmacie de Garde',
      phone: '+22720510234',
      displayPhone: '+227 20 51 02 34',
      description: 'Officine de garde ouverte jour et nuit cette semaine. Médicaments d\'urgence.',
      hours: 'De garde 24h/24',
      icon: Pill,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      latitude: 13.8045,
      longitude: 8.9875
    },
    {
      id: 'nigelec',
      name: 'NIGELEC Zinder (Dépannage Électricité)',
      category: 'Énergie & Réseau',
      phone: '+22720510022',
      displayPhone: '+227 20 51 00 22',
      description: 'Poteau tombé, câble haute tension rompu ou coupure générale de quartier.',
      hours: 'Service d\'astreinte',
      icon: Zap,
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      id: 'seen',
      name: 'SEEN Zinder (Urgences Eau)',
      category: 'Eau Potable',
      phone: '+22720510333',
      displayPhone: '+227 20 51 03 33',
      description: 'Fuite majeure de conduite publique ou interruption de distribution d\'eau.',
      hours: 'Service d\'astreinte',
      icon: Droplets,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200'
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-stone-200 relative z-[10000]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-red-100 flex items-center justify-between bg-red-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-red-600 rounded-xl flex items-center justify-center font-bold shadow-md">
              <AlertCircle size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Numéros d'Urgence & Garde • Zinder</h2>
              <p className="text-xs text-red-100">Services vitaux disponibles 24h/24 dans la région de Zinder</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-red-700 rounded-xl text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3.5">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 text-xs text-red-900 flex items-center gap-2.5">
            <PhoneCall size={16} className="text-red-600 flex-shrink-0 animate-bounce" />
            <span>En cas de danger immédiat, contactez les numéros courts <strong>18 (Pompiers)</strong> ou <strong>17 (Police)</strong>.</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {emergencyServices.map((service) => (
              <div 
                key={service.id}
                className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${service.color}`}>
                    <service.icon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h4 className="font-bold text-stone-900 text-sm">{service.name}</h4>
                      <span className="text-[10px] bg-stone-100 text-stone-600 font-semibold px-2 py-0.5 rounded-full">
                        {service.hours}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 leading-tight mb-1">
                      {service.description}
                    </p>
                    <p className="text-xs font-mono font-bold text-stone-800">
                      {service.displayPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {service.latitude && service.longitude && onSelectLocation && (
                    <button
                      onClick={() => {
                        onSelectLocation(service.latitude!, service.longitude!);
                        onClose();
                      }}
                      className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Voir sur la carte"
                    >
                      <MapPin size={15} />
                      <span className="hidden sm:inline">Carte</span>
                    </button>
                  )}
                  <a
                    href={`tel:${service.phone}`}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <PhoneCall size={14} />
                    <span>Appeler</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          <span className="text-xs text-stone-500">Mise à jour hebdomadaire des gardes</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};
