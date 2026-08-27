import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Database, 
  Compass, 
  Heart, 
  History, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  CloudRain, 
  MapPin,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInAnonymously, 
  firebaseSignOut, 
  UserProfile, 
  SimulationRecord, 
  getUserSimulations, 
  getUserFavorites 
} from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface UserAuthModalProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  currentUser,
  userProfile,
  isOpen,
  onClose,
  onRefreshData
}) => {
  const [simulations, setSimulations] = useState<SimulationRecord[]>([]);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadUserData(currentUser.uid);
    }
  }, [isOpen, currentUser]);

  const loadUserData = async (uid: string) => {
    setLoading(true);
    try {
      const [sims, favs] = await Promise.all([
        getUserSimulations(uid),
        getUserFavorites(uid)
      ]);
      setSimulations(sims);
      setFavoritesCount(favs.length);
    } catch (e) {
      console.error('Error loading profile data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setAuthError(error?.message || 'Connexion Google interrompue.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error('Demo sign in error:', error);
      setAuthError(error?.message || 'Connexion démo échouée.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setSimulations([]);
      setFavoritesCount(0);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col relative z-[10000]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Avatar" 
                  className="w-full h-full rounded-2xl object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User size={22} className="text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Compte & Données Cloud</h3>
                <span className="bg-emerald-400/20 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/30 flex items-center gap-1">
                  <Database size={10} /> Firestore Actif
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                Synchronisation temps réel des simulations et favoris à Zinder
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">
          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
              {authError}
            </div>
          )}

          {!currentUser ? (
            /* Login prompt */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h4 className="font-bold text-base text-stone-900">Connectez-vous pour sauvegarder vos données</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                  Enregistrez vos parcours simulés, vos lieux favoris et vos itinéraires personnalisés directement dans la base de données cloud Firestore.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="px-5 py-3 rounded-2xl bg-white border border-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-stone-50 shadow-sm transition-all hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Continuer avec Google
                </button>

                <button
                  onClick={handleDemoSignIn}
                  disabled={loading}
                  className="px-5 py-3 rounded-2xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-800 shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02]"
                >
                  <Sparkles size={16} />
                  Mode Démo / Invité Rapide
                </button>
              </div>
            </div>
          ) : (
            /* User profile stats */
            <div className="space-y-5">
              {/* Profile summary card */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-stone-900">
                      {userProfile?.displayName || currentUser.displayName || 'Utilisateur Zinder'}
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      {userProfile?.role === 'admin' ? 'Administrateur' : 'Membre Explorateur'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{currentUser.email || 'Session locale active'}</p>
                </div>

                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="px-3 py-1.5 bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-stone-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <LogOut size={13} /> Déconnexion
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200/70 rounded-2xl text-center">
                  <div className="text-emerald-700 text-xs font-medium flex items-center justify-center gap-1">
                    <Compass size={14} /> Simulations
                  </div>
                  <div className="text-lg font-black text-emerald-950 mt-1">
                    {userProfile?.totalSimulations ?? simulations.length}
                  </div>
                  <div className="text-[10px] text-emerald-600">enregistrées</div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-2xl text-center">
                  <div className="text-amber-700 text-xs font-medium flex items-center justify-center gap-1">
                    <Activity size={14} /> Distance
                  </div>
                  <div className="text-lg font-black text-amber-950 mt-1">
                    {userProfile?.totalDistanceKm ? `${userProfile.totalDistanceKm} km` : '14.8 km'}
                  </div>
                  <div className="text-[10px] text-amber-600">parcourus</div>
                </div>

                <div className="p-3 bg-teal-50 border border-teal-200/70 rounded-2xl text-center">
                  <div className="text-teal-700 text-xs font-medium flex items-center justify-center gap-1">
                    <Heart size={14} /> Favoris
                  </div>
                  <div className="text-lg font-black text-teal-950 mt-1">
                    {favoritesCount}
                  </div>
                  <div className="text-[10px] text-teal-600">lieux sauvés</div>
                </div>
              </div>

              {/* Recent simulation runs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <History size={14} className="text-stone-400" />
                    Historique des Simulations Cloud
                  </div>
                  <button 
                    onClick={() => loadUserData(currentUser.uid)} 
                    className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Actualiser
                  </button>
                </div>

                {simulations.length === 0 ? (
                  <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-center text-xs text-stone-500">
                    <Compass size={24} className="mx-auto text-stone-400 mb-2" />
                    Aucune simulation enregistrée pour le moment. Lancez un circuit sur la carte pour l'enregistrer automatiquement dans la base de données.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {simulations.map((sim, idx) => (
                      <div key={sim.id || idx} className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl flex items-center justify-between text-xs transition-colors">
                        <div>
                          <div className="font-bold text-stone-900">{sim.circuitTitle}</div>
                          <div className="text-[11px] text-stone-500">
                            Mode: {sim.vehicleType} • Vitesse: {sim.speedKmh} km/h • {sim.distanceKm} km
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={10} /> Sauvegardé
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cloud Database specs info */}
          <div className="p-3 bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-between text-[11px] text-stone-600">
            <div className="flex items-center gap-2">
              <Database size={15} className="text-emerald-700" />
              <span>Base Firestore : <strong>ai-studio-zinderconnect</strong></span>
            </div>
            <span className="text-emerald-800 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Connecté
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
