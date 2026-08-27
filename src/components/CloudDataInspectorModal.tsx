import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Terminal, 
  Database, 
  Copy, 
  Check, 
  FileJson, 
  Layers, 
  Sparkles, 
  Play, 
  ExternalLink,
  Table,
  Eye
} from 'lucide-react';
import { SIMULATION_CIRCUITS } from '../data/simulationCircuits';
import { INITIAL_ZINDER_LOCATIONS } from '../data/initialLocations';

interface CloudDataInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export const CloudDataInspectorModal: React.FC<CloudDataInspectorModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'collections' | 'schema' | 'snippets' | 'console'>('collections');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<'users' | 'simulations' | 'places'>('simulations');

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const sampleSimulationData = {
    id: "sim_zn_88231",
    userId: currentUser?.uid || "usr_demo_zinder",
    userDisplayName: currentUser?.displayName || "Visiteur Zinder",
    circuitId: "tourisme-birni",
    circuitTitle: "Circuit Historique du Birni & Palais",
    vehicleType: "moto",
    speedKmh: 25,
    distanceKm: 5.4,
    durationSeconds: 780,
    status: "completed",
    createdAt: new Date().toISOString(),
    waypoints: [
      { name: "Palais du Sultan du Damagaram", lat: 13.8025, lng: 8.9833 },
      { name: "Grande Mosquée de Zinder", lat: 13.8017, lng: 8.9817 },
      { name: "Musée Régional de Zinder", lat: 13.8038, lng: 8.9825 },
      { name: "Village des Tanneurs", lat: 13.8005, lng: 8.9790 }
    ]
  };

  const schemaDefinition = {
    collections: {
      users: {
        description: "Profils utilisateurs et statistiques agrégées",
        fields: {
          uid: "string (PK)",
          email: "string",
          displayName: "string",
          role: "'user' | 'admin' | 'contributor'",
          totalSimulations: "number",
          totalDistanceKm: "number",
          createdAt: "ISO8601 string",
          lastActiveAt: "ISO8601 string"
        }
      },
      simulations: {
        description: "Historique des trajets et simulations GPS de Zinder",
        fields: {
          id: "string (Auto ID)",
          userId: "string (ref users)",
          userDisplayName: "string",
          circuitId: "string",
          circuitTitle: "string",
          vehicleType: "'walk' | 'moto' | 'car'",
          speedKmh: "number",
          distanceKm: "number",
          durationSeconds: "number",
          status: "'completed' | 'in_progress'",
          createdAt: "timestamp"
        }
      },
      places: {
        description: "Points d'intérêts et services d'urgence géolocalisés",
        fields: {
          id: "number | string",
          name: "string",
          type: "'Culture' | 'Commerce' | 'Santé' | 'Service' | 'Éducation'",
          latitude: "number",
          longitude: "number",
          neighborhood: "string",
          is_on_duty: "boolean (0 | 1)",
          createdBy: "string (ref users)"
        }
      }
    }
  };

  const codeSnippetTS = `// Exemple d'interaction Firestore / Cloud DB
import { db } from './src/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// 1. Sauvegarder une session de simulation
export async function logSimulation(circuitId, distanceKm, vehicle) {
  const docRef = await addDoc(collection(db, 'simulations'), {
    userId: 'current_user_id',
    circuitId: circuitId,
    distanceKm: distanceKm,
    vehicleType: vehicle,
    status: 'completed',
    createdAt: new Date().toISOString()
  });
  console.log('Simulation enregistrée avec succès ID:', docRef.id);
}

// 2. Récupérer les pharmacies de garde en temps réel
export async function getPharmaciesOnDuty() {
  const q = query(collection(db, 'places'), where('isOnDuty', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data());
}`;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-stone-900 text-stone-100 rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-800 overflow-hidden max-h-[90vh] flex flex-col font-sans relative z-[10000]">
        
        {/* Header (VS Code Style) */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-800 border border-stone-700">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
            <div className="flex items-center gap-2">
              <Code2 size={18} className="text-emerald-400" />
              <span className="font-mono text-xs font-bold text-stone-200">
                zinder-cloud-studio • Firestore & Data Inspector
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 bg-stone-900 border-b border-stone-800 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-3 py-2.5 font-mono font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'collections'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Table size={13} />
            Collections Live ({selectedCollection})
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-2.5 font-mono font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'schema'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers size={13} />
            Schéma de Données
          </button>

          <button
            onClick={() => setActiveTab('snippets')}
            className={`px-3 py-2.5 font-mono font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'snippets'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileJson size={13} />
            Code TypeScript
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-2.5 font-mono font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'console'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Terminal size={13} />
            Console Simulation
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs leading-relaxed">
          {activeTab === 'collections' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
                <span className="text-stone-400">Sélectionner la collection :</span>
                {(['simulations', 'users', 'places'] as const).map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedCollection(col)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                      selectedCollection === col
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>

              {selectedCollection === 'simulations' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-400 font-bold">// Document de simulation actif :</span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(sampleSimulationData, null, 2), 'sim')}
                      className="px-2 py-1 bg-stone-800 hover:bg-stone-700 rounded text-[11px] text-stone-300 flex items-center gap-1"
                    >
                      {copiedSnippet === 'sim' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      Copier JSON
                    </button>
                  </div>
                  <pre className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-emerald-300 overflow-x-auto">
                    {JSON.stringify(sampleSimulationData, null, 2)}
                  </pre>
                </div>
              )}

              {selectedCollection === 'users' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-400 font-bold">// Profil utilisateur connecté :</span>
                  </div>
                  <pre className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-teal-300 overflow-x-auto">
                    {JSON.stringify({
                      uid: currentUser?.uid || "demo_zinder_visitor",
                      email: currentUser?.email || "anonyme@zinder.ne",
                      displayName: currentUser?.displayName || "Visiteur Zinder",
                      role: "user",
                      totalSimulations: 3,
                      totalDistanceKm: 16.2,
                      database: "ai-studio-zinderconnect",
                      cloudSync: "active"
                    }, null, 2)}
                  </pre>
                </div>
              )}

              {selectedCollection === 'places' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-400 font-bold">// Échantillon des lieux de Zinder ({INITIAL_ZINDER_LOCATIONS.length} enregistrés) :</span>
                  </div>
                  <pre className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-amber-300 overflow-x-auto max-h-72">
                    {JSON.stringify(INITIAL_ZINDER_LOCATIONS.slice(0, 3), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-stone-300 font-bold">Schéma de la base de données Firestore :</span>
                <button
                  onClick={() => handleCopy(JSON.stringify(schemaDefinition, null, 2), 'schema')}
                  className="px-2 py-1 bg-stone-800 hover:bg-stone-700 rounded text-[11px] text-stone-300 flex items-center gap-1"
                >
                  {copiedSnippet === 'schema' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  Copier Schéma
                </button>
              </div>
              <pre className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-blue-300 overflow-x-auto">
                {JSON.stringify(schemaDefinition, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'snippets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-stone-300 font-bold">Code Client d'Accès aux Données :</span>
                <button
                  onClick={() => handleCopy(codeSnippetTS, 'ts')}
                  className="px-2 py-1 bg-stone-800 hover:bg-stone-700 rounded text-[11px] text-stone-300 flex items-center gap-1"
                >
                  {copiedSnippet === 'ts' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  Copier Code
                </button>
              </div>
              <pre className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-stone-200 overflow-x-auto text-[11px]">
                {codeSnippetTS}
              </pre>
            </div>
          )}

          {activeTab === 'console' && (
            <div className="space-y-3">
              <div className="text-stone-400 font-bold">Flux télémétrique des circuits de Zinder :</div>
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2 text-stone-300 text-[11px]">
                <div className="text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  [STREAM] Connexion établie avec le simulateur géospatial de Zinder
                </div>
                <div className="text-stone-400">
                  [GPS] Position centrale: Lat 13.8050 N, Lon 8.9880 E (Centre-ville Zinder)
                </div>
                <div className="text-amber-300">
                  [CIRCUIT] {SIMULATION_CIRCUITS.length} circuits urbains pré-calculés prêts pour exécution
                </div>
                <div className="text-teal-300">
                  [DATABASE] Synchronisation automatique activée sur les collections /users et /simulations
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs">
          <span className="text-stone-400">Status: Cloud Storage Connecté</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
          >
            Fermer le Studio
          </button>
        </div>
      </div>
    </div>
  );
};
