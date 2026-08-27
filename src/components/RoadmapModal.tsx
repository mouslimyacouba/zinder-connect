import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  WifiOff, 
  Bike, 
  CreditCard, 
  AlertTriangle, 
  ShoppingBag, 
  CheckCircle2, 
  Code2, 
  Layers, 
  ArrowRight,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'features' | 'architecture' | 'ai_prompts'>('features');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const features = [
    {
      id: 'ai-assistant',
      title: '1. Assistant IA Local "Dan Damagaram" (Gemini API)',
      category: 'Intelligence Artificielle',
      icon: Sparkles,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      description: 'Intégration du SDK Gemini pour un guide touristique et pratique bilingue Français/Haoussa capable de conseiller sur les boutiques, raconter l\'histoire du Palais du Sultan et calculer les prix du marché.',
      status: 'Prêt à coder',
      priority: 'Très haute'
    },
    {
      id: 'offline-mode',
      title: '2. Mode Hors-Ligne & Cache PWA',
      category: 'Résilience & Réseau',
      icon: WifiOff,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      description: 'Support PWA complet avec stockage IndexedDB et tuiles de cartes vectorielles pré-chargées pour fonctionner sans connexion Internet (zone blanche à Zinder).',
      status: 'Spécifié',
      priority: 'Haute'
    },
    {
      id: 'kabou-kabou',
      title: '3. Module de Moto-Taxi "Kabou-Kabou"',
      category: 'Transport & Mobilité',
      icon: Bike,
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      description: 'Calculateur automatique du prix de la course en FCFA selon les distances à Zinder (Birni, Sabon Gari, Grand Marché) et commande directe par SMS / WhatsApp.',
      status: 'Simulateur inclus',
      priority: 'Haute'
    },
    {
      id: 'mobile-money',
      title: '4. Paiement Mobile (Airtel & Moov Money)',
      category: 'Fintech & Commerce',
      icon: CreditCard,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      description: 'Permettre le paiement sécurisé des réservations de restaurants, ordonnances en pharmacie ou articles d\'artisanat via Airtel Money, Moov Money et Al-Izza.',
      status: 'Roadmap',
      priority: 'Moyenne'
    },
    {
      id: 'citizen-alerts',
      title: '5. Signalement Citoyen & État Urbain',
      category: 'Services Publics',
      icon: AlertTriangle,
      color: 'bg-rose-100 text-rose-700 border-rose-200',
      description: 'Possibilité pour les habitants de signaler une route inondée, un nid-de-poule, une panne d\'éclairage ou une coupure d\'eau NIGELEC/SEEN avec photo et géolocalisation.',
      status: 'En cours',
      priority: 'Haute'
    },
    {
      id: 'artisan-marketplace',
      title: '6. Vitrine des Artisans du Cuir & Tanneurs',
      category: 'E-commerce & Culture',
      icon: ShoppingBag,
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      description: 'Boutique virtuelle des maroquiniers célèbres du Birni (sacs en cuir maroquin rouge, poufs sculptés, sandales royales) avec livraison interurbaine vers Niamey et l\'international.',
      status: 'Spécifié',
      priority: 'Moyenne'
    }
  ];

  const readyPrompts = [
    {
      title: "Implémenter l'Assistant Gemini 'Dan Damagaram'",
      prompt: "Ajoute un chatbot vocal et textuel alimenté par l'API Gemini (@google/genai) qui répond en français et en haoussa aux questions sur les commerces, les horaires de bus, les pharmacies et l'histoire du sultanat de Zinder."
    },
    {
      title: "Ajouter la commande rapide de Moto-Taxi (Kabou-Kabou)",
      prompt: "Crée une vue de réservation de Kabou-Kabou à Zinder avec estimation automatique du tarif en FCFA, sélection du lieu de prise en charge et de destination, et génération d'un message WhatsApp prêt à envoyer au conducteur."
    },
    {
      title: "Système de Signalement Urbain Citoyen",
      prompt: "Ajoute un onglet 'Signalements' avec formulaire géolocalisé pour poster des alertes citoyennes à Zinder (coupure d'eau, route coupée, pharmacie fermée) avec vote communautaire et statut résolu."
    }
  ];

  const handleCopyPrompt = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-stone-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-stone-900 font-bold shadow-lg">
              <Cpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Zinder Connect & Roadmap Antigravity</h2>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                  v1.2 Live
                </span>
              </div>
              <p className="text-xs text-stone-300">Spécifications techniques & prochaines fonctionnalités à développer</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 gap-2">
          <button
            onClick={() => setActiveTab('features')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'features'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers size={14} />
            6 Fonctionnalités Clés
          </button>
          <button
            onClick={() => setActiveTab('ai_prompts')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ai_prompts'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Code2 size={14} />
            Prompts Prêts pour Antigravity
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'architecture'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Cpu size={14} />
            Architecture Technique
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="text-emerald-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <span className="font-bold">Vision de Zinder Connect :</span> Devenir l'application compagnon indispensable de la 2e ville du Niger, alliant cartographie participative, services de santé 24/7, valorisation des artisans et dynamisation du commerce local.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feat) => (
                  <div 
                    key={feat.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${feat.color}`}>
                          {feat.category}
                        </span>
                        <span className="text-[10px] text-stone-400 font-semibold">
                          Priorité: {feat.priority}
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5 mb-2">
                        <feat.icon size={18} className="text-stone-700 flex-shrink-0 mt-0.5" />
                        <h4 className="font-bold text-stone-900 text-sm">{feat.title}</h4>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed mb-3">
                        {feat.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                      <span className="text-stone-500 font-medium">Statut d'implémentation</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        {feat.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai_prompts' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600">
                Vous pouvez copier directement ces demandes à Antigravity pour lui faire coder immédiatement les modules suivants dans l'application :
              </p>
              
              <div className="space-y-3">
                {readyPrompts.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Send size={13} className="text-emerald-600" />
                        {item.title}
                      </h4>
                      <button
                        onClick={() => handleCopyPrompt(item.prompt, idx)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          copiedIndex === idx
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {copiedIndex === idx ? 'Copié !' : 'Copier le prompt'}
                      </button>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs font-mono text-stone-700 select-all">
                      {item.prompt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50">
                  <h4 className="font-bold text-stone-900 mb-2">Stack Frontend</h4>
                  <ul className="space-y-1 text-stone-600">
                    <li>• React 19 + TypeScript</li>
                    <li>• Tailwind CSS v4 pour le styling moderne</li>
                    <li>• Leaflet & React-Leaflet (OpenStreetMap)</li>
                    <li>• Motion/React pour les animations fluides</li>
                    <li>• Lucide-React pour la bibliothèque d'icônes</li>
                  </ul>
                </div>
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50">
                  <h4 className="font-bold text-stone-900 mb-2">Stack Backend & Stockage</h4>
                  <ul className="space-y-1 text-stone-600">
                    <li>• Node.js & Express API RESTful</li>
                    <li>• Base de données SQLite (`better-sqlite3`)</li>
                    <li>• API Endpoints: `/api/locations`, `/api/emergency`</li>
                    <li>• Support SDK @google/genai pour l'IA Gemini</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 bg-emerald-50 text-emerald-900">
                <h4 className="font-bold text-emerald-950 mb-1">Stratégie de Déploiement à Zinder</h4>
                <p className="leading-relaxed text-[11px]">
                  Optimisée pour la faible bande passante réseau mobile (consommation de données &lt; 2 Mo au premier chargement, compression des tuiles, mode PWA installable sur les téléphones Android des conducteurs et commerçants de Zinder).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          <p className="text-xs text-stone-500">
            Zinder Connect • Fait pour le Damagaram
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};
