/**
 * regionalRiskZones.ts
 *
 * Configurable risk-zone registry for hillstation / remote terrain detection.
 * Phase 1: static list. Phase 2+: fetch from Supabase `regional_risk_zones` table.
 */

export type RiskType = 'hillstation' | 'remote_tribal' | 'flood_prone' | 'conflict_zone';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface RegionalRiskZone {
  name: string;
  state: string;
  district?: string;
  riskType: RiskType;
  riskLevel: RiskLevel;
  aliases?: string[];
}

/**
 * Static seed data – known hillstation regions in India.
 * This is the source of truth until a Supabase `regional_risk_zones` table is populated.
 */
const KNOWN_HILLSTATION_ZONES: RegionalRiskZone[] = [
  { name: 'Kodaikanal', state: 'Tamil Nadu', district: 'Dindigul', riskType: 'hillstation', riskLevel: 'high', aliases: ['kodai'] },
  { name: 'Ooty', state: 'Tamil Nadu', district: 'Nilgiris', riskType: 'hillstation', riskLevel: 'high', aliases: ['ootacamund', 'udhagamandalam'] },
  { name: 'Yercaud', state: 'Tamil Nadu', district: 'Salem', riskType: 'hillstation', riskLevel: 'high' },
  { name: 'Coonoor', state: 'Tamil Nadu', district: 'Nilgiris', riskType: 'hillstation', riskLevel: 'high' },
  { name: 'Munnar', state: 'Kerala', district: 'Idukki', riskType: 'hillstation', riskLevel: 'high' },
  { name: 'Wayanad', state: 'Kerala', riskType: 'hillstation', riskLevel: 'high' },
  { name: 'Coorg', state: 'Karnataka', district: 'Kodagu', riskType: 'hillstation', riskLevel: 'high', aliases: ['kodagu', 'madikeri'] },
  { name: 'Shimla', state: 'Himachal Pradesh', riskType: 'hillstation', riskLevel: 'high' },
  { name: 'Manali', state: 'Himachal Pradesh', district: 'Kullu', riskType: 'hillstation', riskLevel: 'critical' },
  { name: 'Darjeeling', state: 'West Bengal', riskType: 'hillstation', riskLevel: 'high' },
  { name: 'Mussoorie', state: 'Uttarakhand', district: 'Dehradun', riskType: 'hillstation', riskLevel: 'high' },
  { name: 'Nainital', state: 'Uttarakhand', riskType: 'hillstation', riskLevel: 'high' },
  { name: 'Shillong', state: 'Meghalaya', riskType: 'hillstation', riskLevel: 'high' },
  { name: 'Mount Abu', state: 'Rajasthan', district: 'Sirohi', riskType: 'hillstation', riskLevel: 'medium' },
  { name: 'Lonavala', state: 'Maharashtra', district: 'Pune', riskType: 'hillstation', riskLevel: 'medium' },
  { name: 'Mahabaleshwar', state: 'Maharashtra', district: 'Satara', riskType: 'hillstation', riskLevel: 'medium' },
];

const normalize = (s: string) => s.trim().toLowerCase().replace(/[\s\-_]+/g, '');

/**
 * Check whether a user's regionType string indicates a high-risk zone.
 * Accepts raw profile value like "hillstation", "hill-station", "hill station".
 */
export function isHighRiskRegionType(regionType: string | undefined | null): boolean {
  if (!regionType) return false;
  const n = normalize(regionType);
  return n === 'hillstation' || n === 'hillstation' || n === 'remotetribal' || n === 'floodprone';
}

/**
 * Try to match a village/town/district string against known hillstation zones.
 * Returns the matched zone or null.
 */
export function matchKnownRiskZone(
  villageTown: string | undefined | null,
  state?: string | undefined | null,
): RegionalRiskZone | null {
  if (!villageTown) return null;
  const vn = normalize(villageTown);

  for (const zone of KNOWN_HILLSTATION_ZONES) {
    const nameMatch = vn.includes(normalize(zone.name));
    const aliasMatch = zone.aliases?.some((a) => vn.includes(normalize(a))) ?? false;
    if (nameMatch || aliasMatch) {
      if (state && normalize(state) !== normalize(zone.state)) continue;
      return zone;
    }
  }
  return null;
}

/**
 * Get the risk level for a given region. Falls back to 'high' for
 * any confirmed hillstation without a specific zone match.
 */
export function getRegionRiskLevel(
  regionType: string | undefined | null,
  villageTown?: string | undefined | null,
  state?: string | undefined | null,
): RiskLevel | null {
  if (!isHighRiskRegionType(regionType)) return null;
  const zone = matchKnownRiskZone(villageTown, state);
  return zone?.riskLevel ?? 'high';
}

export function getAllKnownHillstationZones(): RegionalRiskZone[] {
  return [...KNOWN_HILLSTATION_ZONES];
}
