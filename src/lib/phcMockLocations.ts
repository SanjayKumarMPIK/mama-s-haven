/** Demo-only PHC points for map / nearby list (not from a live registry). */

export type PhcLocation = {
  id: string;
  name: string;
  area: string;
  address: string;
  lat: number;
  lon: number;
  phone?: string;
};

export const MOCK_PHC_LOCATIONS: PhcLocation[] = [
  {
    id: "chn-1",
    name: "Urban PHC — T. Nagar",
    area: "T. Nagar",
    address: "Panagal Park, T. Nagar, Chennai, Tamil Nadu 600017",
    lat: 13.0418,
    lon: 80.2341,
    phone: "04424342900",
  },
  {
    id: "chn-2",
    name: "Urban PHC — Velachery",
    area: "Velachery",
    address: "Velachery Main Rd, Chennai, Tamil Nadu 600042",
    lat: 13.0067,
    lon: 80.2206,
    phone: "04422431212",
  },
  {
    id: "chn-3",
    name: "Sub-Centre — Perungudi",
    area: "Perungudi",
    address: "Perungudi, Chennai, Tamil Nadu 600096",
    lat: 12.965,
    lon: 80.2431,
  },
  {
    id: "chn-4",
    name: "Urban PHC — Anna Nagar",
    area: "Anna Nagar",
    address: "Anna Nagar West, Chennai, Tamil Nadu 600040",
    lat: 13.085,
    lon: 80.2101,
    phone: "04426161777",
  },
  {
    id: "chn-5",
    name: "PHC — Madhavaram",
    area: "Madhavaram",
    address: "Madhavaram, Chennai, Tamil Nadu 600060",
    lat: 13.1488,
    lon: 80.2415,
  },
  {
    id: "blore-1",
    name: "Urban PHC — Indiranagar",
    area: "Indiranagar",
    address: "100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038",
    lat: 12.9719,
    lon: 77.6412,
    phone: "08025213344",
  },
  {
    id: "blore-2",
    name: "PHC — Jayanagar 4th Block",
    area: "Jayanagar",
    address: "Jayanagar, Bengaluru, Karnataka 560011",
    lat: 12.9257,
    lon: 77.5939,
  },
  {
    id: "mum-1",
    name: "Urban PHC — Bandra West",
    area: "Bandra West",
    address: "Near Bandra Station, Mumbai, Maharashtra 400050",
    lat: 19.0596,
    lon: 72.8295,
    phone: "02226402211",
  },
  {
    id: "mum-2",
    name: "PHC — Andheri East",
    area: "Andheri East",
    address: "Andheri-Kurla Rd, Mumbai, Maharashtra 400059",
    lat: 19.1136,
    lon: 72.8697,
  },
  {
    id: "del-1",
    name: "Urban PHC — Lajpat Nagar",
    area: "Lajpat Nagar",
    address: "Lajpat Nagar II, New Delhi 110024",
    lat: 28.5677,
    lon: 77.2433,
    phone: "01129845566",
  },
  {
    id: "del-2",
    name: "PHC — Rohini Sector 11",
    area: "Rohini",
    address: "Rohini, New Delhi 110085",
    lat: 28.7495,
    lon: 77.1184,
  },
  {
    id: "hyd-1",
    name: "Urban PHC — Banjara Hills",
    area: "Banjara Hills",
    address: "Road No. 12, Banjara Hills, Hyderabad, Telangana 500034",
    lat: 17.4065,
    lon: 78.4772,
    phone: "04023355440",
  },
  {
    id: "kol-1",
    name: "PHC — Salt Lake Sector V",
    area: "Salt Lake",
    address: "Bidhannagar, Kolkata, West Bengal 700091",
    lat: 22.5726,
    lon: 88.4339,
  },
  {
    id: "pun-1",
    name: "Urban PHC — Koregaon Park",
    area: "Koregaon Park",
    address: "Koregaon Park, Pune, Maharashtra 411001",
    lat: 18.5362,
    lon: 73.8933,
    phone: "02026154488",
  },
  {
    id: "cbe-1",
    name: "PHC — RS Puram",
    area: "R.S. Puram",
    address: "R.S. Puram, Coimbatore, Tamil Nadu 641002",
    lat: 11.0168,
    lon: 76.9558,
  },
];

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type NearbyPhc = PhcLocation & { distanceKm: number };

/** Closest `limit` demo PHCs for the given coordinates (works anywhere in India for this mock set). */
export function getNearbyMockPhcs(userLat: number, userLon: number, limit = 8): NearbyPhc[] {
  return MOCK_PHC_LOCATIONS.map((p) => ({
    ...p,
    distanceKm: haversineKm(userLat, userLon, p.lat, p.lon),
  }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
