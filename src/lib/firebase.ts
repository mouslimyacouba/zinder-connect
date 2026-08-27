import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin' | 'contributor';
  totalSimulations: number;
  totalDistanceKm: number;
  createdAt?: string;
  lastActiveAt?: string;
}

export interface SimulationRecord {
  id?: string;
  userId: string;
  userDisplayName: string;
  circuitId: string;
  circuitTitle: string;
  vehicleType: string;
  speedKmh: number;
  distanceKm: number;
  durationSeconds: number;
  status: 'completed' | 'in_progress' | 'saved';
  createdAt?: any;
}

// User Profile management
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const existing = snap.data() as UserProfile;
    await setDoc(userRef, {
      ...existing,
      lastActiveAt: new Date().toISOString()
    }, { merge: true });
    return existing;
  } else {
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || 'anonyme@zinder.ne',
      displayName: user.displayName || (user.isAnonymous ? 'Visiteur Zinder' : 'Utilisateur'),
      photoURL: user.photoURL || null,
      role: 'user',
      totalSimulations: 0,
      totalDistanceKm: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }
}

// Simulation saving
export async function saveSimulationResult(record: Omit<SimulationRecord, 'id' | 'createdAt'>) {
  try {
    const colRef = collection(db, 'simulations');
    const docRef = await addDoc(colRef, {
      ...record,
      createdAt: new Date().toISOString()
    });

    // Update user aggregates if user logged in
    if (record.userId && record.userId !== 'guest') {
      const userRef = doc(db, 'users', record.userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        await setDoc(userRef, {
          totalSimulations: (userData.totalSimulations || 0) + 1,
          totalDistanceKm: Number(((userData.totalDistanceKm || 0) + (record.distanceKm || 0)).toFixed(2)),
          lastActiveAt: new Date().toISOString()
        }, { merge: true });
      }
    }

    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('Error saving simulation to Firestore:', error);
    return { success: false, error };
  }
}

// Fetch user simulations
export async function getUserSimulations(userId: string): Promise<SimulationRecord[]> {
  try {
    const colRef = collection(db, 'simulations');
    const q = query(colRef, where('userId', '==', userId), limit(20));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SimulationRecord));
  } catch (error) {
    console.error('Error getting simulations:', error);
    return [];
  }
}

// Favorites handling
export async function toggleUserFavorite(userId: string, placeId: number, placeData: any): Promise<boolean> {
  try {
    const favRef = doc(db, 'users', userId, 'favorites', String(placeId));
    const snap = await getDoc(favRef);
    if (snap.exists()) {
      await deleteDoc(favRef);
      return false; // removed
    } else {
      await setDoc(favRef, {
        placeId,
        ...placeData,
        savedAt: new Date().toISOString()
      });
      return true; // added
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
}

export async function getUserFavorites(userId: string): Promise<number[]> {
  try {
    const colRef = collection(db, 'users', userId, 'favorites');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d => Number(d.id));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

// Custom Places
export async function saveCommunityPlace(place: any, userId: string): Promise<string | null> {
  try {
    const colRef = collection(db, 'places');
    const docRef = await addDoc(colRef, {
      ...place,
      createdBy: userId,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving place to cloud:', error);
    return null;
  }
}

export { firebaseSignOut, signInWithPopup, signInAnonymously, onAuthStateChanged };
