export interface CircuitPoint {
  latitude: number;
  longitude: number;
  name: string;
  description: string;
}

export interface SimulationCircuit {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  points: CircuitPoint[];
  color: string;
}

export const SIMULATION_CIRCUITS: SimulationCircuit[] = [
  {
    id: 'birni-history',
    title: 'Circuit Historique du Birni',
    subtitle: 'Palais du Sultan, Grande Mosquée, Musée et remparts anciens',
    category: 'Culture',
    icon: 'Landmark',
    color: '#059669', // emerald
    points: [
      { latitude: 13.8045, longitude: 8.9800, name: 'Entrée Ouest du Birni', description: 'Porte historique de la vieille ville fortifiée.' },
      { latitude: 13.8025, longitude: 8.9833, name: 'Palais du Sultan du Damagaram', description: 'Résidence séculaire en banco sculpté.' },
      { latitude: 13.8017, longitude: 8.9817, name: 'Grande Mosquée de Zinder', description: 'Édifice religieux emblématique du Damagaram.' },
      { latitude: 13.8038, longitude: 8.9825, name: 'Musée Régional de Zinder', description: 'Trésors archéologiques et parures traditionnelles.' },
      { latitude: 13.8005, longitude: 8.9790, name: 'Quartier des Tanneurs & Artisans', description: 'Savoir-faire ancestral du travail du maroquin.' }
    ]
  },
  {
    id: 'commercial-daily',
    title: 'Circuit Vie Quotidienne & Marchés',
    subtitle: 'Gare Routière, Grand Marché, Banques et Stations',
    category: 'Commerce',
    icon: 'ShoppingBag',
    color: '#d97706', // amber
    points: [
      { latitude: 13.8120, longitude: 8.9930, name: 'Gare Routière Centrale', description: 'Arrivée des transports Rimbo et SNTV.' },
      { latitude: 13.8080, longitude: 8.9940, name: 'Station Oryx & Carrefour Sabon Gari', description: 'Axe commercial animé.' },
      { latitude: 13.8050, longitude: 8.9880, name: 'Grand Marché Central', description: 'Cœur battant du commerce de Zinder.' },
      { latitude: 13.8045, longitude: 8.9875, name: 'Pharmacie du Grand Marché', description: 'Service de santé de garde.' },
      { latitude: 13.8055, longitude: 8.9865, name: 'Restaurant Le Damagaram', description: 'Dégustation de Kilichi et grillades locales.' }
    ]
  },
  {
    id: 'health-emergency',
    title: 'Itinéraire Urgence & Santé',
    subtitle: 'Centre-ville vers Cliniques et Hôpital National',
    category: 'Santé',
    icon: 'Hospital',
    color: '#dc2626', // red
    points: [
      { latitude: 13.8050, longitude: 8.9850, name: 'Poste de Police / Rond-Point', description: 'Point de départ sécurisé.' },
      { latitude: 13.8075, longitude: 8.9920, name: 'Clinique Magaria Sabon Gari', description: 'Consultations et premiers soins.' },
      { latitude: 13.8100, longitude: 8.9900, name: 'Hôpital National de Zinder (HNZ)', description: 'Service des Urgences et plateau technique 24/7.' }
    ]
  },
  {
    id: 'university-route',
    title: 'Axe Étudiant & Savoir (RN1)',
    subtitle: 'Lycée Amadou Kouran Daga vers Université André Salifou',
    category: 'Éducation',
    icon: 'GraduationCap',
    color: '#2563eb', // blue
    points: [
      { latitude: 13.8090, longitude: 8.9845, name: 'Lycée Amadou Kouran Daga', description: 'Lycée historique du centre-ville.' },
      { latitude: 13.8150, longitude: 8.9780, name: 'Axe Route de Niamey (RN1)', description: 'Voie express vers les campus.' },
      { latitude: 13.8240, longitude: 8.9680, name: 'Université André Salifou de Zinder', description: 'Campus universitaire et facultés.' }
    ]
  }
];
