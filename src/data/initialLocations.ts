export interface LocationItem {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  description: string;
  address: string;
  neighborhood: string;
  phone: string;
  is_on_duty: number;
  opening_hours: string;
  rating: number;
  created_at?: string;
}

export const INITIAL_ZINDER_LOCATIONS: LocationItem[] = [
  // Culture & Patrimoine
  {
    id: 1,
    name: "Palais du Sultan du Damagaram",
    type: "Culture",
    latitude: 13.8025,
    longitude: 8.9833,
    description: "Résidence historique du Sultanat du Damagaram, joyau architectural en banco sculpté.",
    address: "Rue du Palais",
    neighborhood: "Quartier Birni",
    phone: "+227 20 51 01 23",
    is_on_duty: 0,
    opening_hours: "08h00 - 18h00",
    rating: 4.9
  },
  {
    id: 2,
    name: "Grande Mosquée de Zinder",
    type: "Religion",
    latitude: 13.8017,
    longitude: 8.9817,
    description: "Édifice religieux emblématique fondé au milieu du XIXe siècle au cœur du vieux Birni.",
    address: "Place de la Grande Mosquée",
    neighborhood: "Quartier Birni",
    phone: "",
    is_on_duty: 0,
    opening_hours: "Ouvert 24h/24",
    rating: 4.9
  },
  {
    id: 3,
    name: "Musée Régional de Zinder",
    type: "Culture",
    latitude: 13.8038,
    longitude: 8.9825,
    description: "Expositions d'artisanat touareg et haoussa, armes traditionnelles du sultanat et parures royales.",
    address: "Avenue des Sultans",
    neighborhood: "Quartier Birni",
    phone: "+227 96 12 34 56",
    is_on_duty: 0,
    opening_hours: "09h00 - 17h30",
    rating: 4.7
  },
  {
    id: 4,
    name: "Centre Culturel Franco-Nigérien (CCFN)",
    type: "Culture",
    latitude: 13.8085,
    longitude: 8.9862,
    description: "Espace d'événements culturels, concerts, cinéma, bibliothèque et ateliers pour la jeunesse.",
    address: "Boulevard du 15 Avril",
    neighborhood: "Centre-ville",
    phone: "+227 20 51 04 40",
    is_on_duty: 0,
    opening_hours: "08h30 - 19h00",
    rating: 4.6
  },
  
  // Commerce & Marchés
  {
    id: 5,
    name: "Grand Marché Central de Zinder",
    type: "Commerce",
    latitude: 13.8050,
    longitude: 8.9880,
    description: "Cœur économique du Damagaram : tissus, épices, cuirs célèbres, artisanat et produits locaux.",
    address: "Avenue du Marché",
    neighborhood: "Centre-ville",
    phone: "",
    is_on_duty: 0,
    opening_hours: "07h00 - 19h00",
    rating: 4.8
  },
  {
    id: 6,
    name: "Marché Dolé (Bétail & Céréales)",
    type: "Commerce",
    latitude: 13.8160,
    longitude: 8.9950,
    description: "Grand marché traditionnel de bétail, céréales et échanges agricoles régionaux.",
    address: "Route de Tanout",
    neighborhood: "Quartier Dolé",
    phone: "",
    is_on_duty: 0,
    opening_hours: "06h00 - 18h00 (Jeudis)",
    rating: 4.5
  },
  {
    id: 7,
    name: "Village Artisanal des Tanneurs & Maroquiniers",
    type: "Commerce",
    latitude: 13.8005,
    longitude: 8.9790,
    description: "Ateliers réputés de travail du cuir de chèvre maroquin rouge, sacs, sandales et poufs.",
    address: "Rue des Artisans",
    neighborhood: "Quartier Birni",
    phone: "+227 90 22 11 33",
    is_on_duty: 0,
    opening_hours: "08h00 - 18h30",
    rating: 4.8
  },
  
  // Santé & Pharmacies (avec statut de garde)
  {
    id: 8,
    name: "Hôpital National de Zinder (HNZ)",
    type: "Santé",
    latitude: 13.8100,
    longitude: 8.9900,
    description: "Centre hospitalier régional de référence : urgences 24/7, maternité, chirurgie et pédiatrie.",
    address: "Route de l'Aéroport",
    neighborhood: "Sabon Gari",
    phone: "+227 20 51 01 01",
    is_on_duty: 1,
    opening_hours: "Ouvert 24h/24",
    rating: 4.4
  },
  {
    id: 9,
    name: "Pharmacie du Grand Marché",
    type: "Santé",
    latitude: 13.8045,
    longitude: 8.9875,
    description: "Pharmacie de garde cette semaine. Médicaments essentiels et produits de santé.",
    address: "Face Entrée Sud Marché",
    neighborhood: "Centre-ville",
    phone: "+227 20 51 02 34",
    is_on_duty: 1,
    opening_hours: "Garde 24h/24",
    rating: 4.7
  },
  {
    id: 10,
    name: "Pharmacie Populaire de Birni",
    type: "Santé",
    latitude: 13.8020,
    longitude: 8.9840,
    description: "Officine pharmaceutique de proximité, matériel médical et conseils de santé.",
    address: "Place du Sultan",
    neighborhood: "Quartier Birni",
    phone: "+227 20 51 05 60",
    is_on_duty: 0,
    opening_hours: "08h00 - 22h00",
    rating: 4.6
  },
  {
    id: 11,
    name: "Clinique Médicale Magaria Sabon Gari",
    type: "Santé",
    latitude: 13.8075,
    longitude: 8.9920,
    description: "Soins de santé généraux, consultations spécialisées, laboratoire d'analyse et échographie.",
    address: "Rue des Écoles",
    neighborhood: "Sabon Gari",
    phone: "+227 96 55 44 33",
    is_on_duty: 0,
    opening_hours: "07h30 - 21h00",
    rating: 4.5
  },
  
  // Éducation & Formation
  {
    id: 12,
    name: "Université André Salifou de Zinder (UASZ)",
    type: "Éducation",
    latitude: 13.8240,
    longitude: 8.9680,
    description: "Campus universitaire public majeur : facultés de sciences, lettres, droit et IUT.",
    address: "Route de Niamey (RN1)",
    neighborhood: "Zone Universitaire",
    phone: "+227 20 51 08 80",
    is_on_duty: 0,
    opening_hours: "07h30 - 18h00",
    rating: 4.7
  },
  {
    id: 13,
    name: "Lycée Amadou Kouran Daga",
    type: "Éducation",
    latitude: 13.8090,
    longitude: 8.9845,
    description: "Établissement secondaire historique de référence formé par de nombreuses générations d'élites.",
    address: "Avenue de l'Indépendance",
    neighborhood: "Centre-ville",
    phone: "+227 20 51 03 12",
    is_on_duty: 0,
    opening_hours: "07h30 - 17h00",
    rating: 4.5
  },
  
  // Transport & Services Publics
  {
    id: 14,
    name: "Gare Routière Centrale (SNTV / Rimbo)",
    type: "Transport",
    latitude: 13.8120,
    longitude: 8.9930,
    description: "Lignes de bus et minibus interurbains vers Niamey, Maradi, Agadez, Diffa et Kano (Nigéria).",
    address: "Sortie Est",
    neighborhood: "Sabon Gari",
    phone: "+227 20 51 07 00",
    is_on_duty: 0,
    opening_hours: "05h30 - 22h00",
    rating: 4.3
  },
  {
    id: 15,
    name: "Station-Service Total Birni / Étoile",
    type: "Service",
    latitude: 13.8000,
    longitude: 8.9850,
    description: "Carburant Super/Gasoil, boutique express, vidange et gonflage rapide de pneus.",
    address: "Boulevard du Sultan",
    neighborhood: "Quartier Birni",
    phone: "+227 90 11 22 33",
    is_on_duty: 1,
    opening_hours: "Ouvert 24h/24",
    rating: 4.5
  },
  {
    id: 16,
    name: "Station Oryx Sabon Gari",
    type: "Service",
    latitude: 13.8080,
    longitude: 8.9940,
    description: "Carburant, lubrifiants, station de lavage et paiement mobile accepté.",
    address: "Rond-point des Martyrs",
    neighborhood: "Sabon Gari",
    phone: "+227 94 33 22 11",
    is_on_duty: 0,
    opening_hours: "06h00 - 23h00",
    rating: 4.4
  },
  {
    id: 17,
    name: "Commissariat Central de Police de Zinder",
    type: "Service",
    latitude: 13.8060,
    longitude: 8.9830,
    description: "Sécurité publique, déclarations d'objets perdus, passeports et assistance 24/7.",
    address: "Rue de la République",
    neighborhood: "Centre-ville",
    phone: "17 (Urgences Police)",
    is_on_duty: 1,
    opening_hours: "Ouvert 24h/24",
    rating: 4.6
  },
  {
    id: 18,
    name: "Groupement des Sapeurs-Pompiers Zinder",
    type: "Service",
    latitude: 13.8115,
    longitude: 8.9880,
    description: "Secours d'urgence, incendies, accidents de la route et assistance médicale d'urgence.",
    address: "Avenue de l'Hôpital",
    neighborhood: "Sabon Gari",
    phone: "18 (Urgences Pompiers)",
    is_on_duty: 1,
    opening_hours: "Ouvert 24h/24",
    rating: 4.8
  },
  
  // Restauration & Hôtellerie
  {
    id: 19,
    name: "Restaurant & Grillades Le Damagaram",
    type: "Restauration",
    latitude: 13.8055,
    longitude: 8.9865,
    description: "Spécialités de viandes grillées (Kilichi, Dambou, Suya), riz gras et jus de Bissap frais.",
    address: "Près du Rond-point Marché",
    neighborhood: "Centre-ville",
    phone: "+227 96 77 88 99",
    is_on_duty: 0,
    opening_hours: "11h00 - 23h30",
    rating: 4.8
  },
  {
    id: 20,
    name: "Hôtel & Résidence Les Gourounis",
    type: "Restauration",
    latitude: 13.8095,
    longitude: 8.9810,
    description: "Chambres climatisées, restaurant terrasse et espace de travail calme pour professionnels.",
    address: "Quartier Résidentiel",
    neighborhood: "Quartier Administratif",
    phone: "+227 20 51 09 10",
    is_on_duty: 0,
    opening_hours: "Ouvert 24h/24",
    rating: 4.6
  }
];
