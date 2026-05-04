/**
 * Map-backed place search via Photon (OpenStreetMap-derived, browser CORS-friendly).
 * https://photon.komoot.io/
 */

export type MapSearchHit = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  osmKey?: string;
  osmValue?: string;
};

type PhotonFeature = {
  geometry?: { type?: string; coordinates?: [number, number] };
  properties?: Record<string, unknown>;
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

function formatPhotonAddress(p: Record<string, unknown>): string {
  const street = p.street != null ? String(p.street) : "";
  const hn = p.housenumber != null ? String(p.housenumber) : "";
  const line1 = hn && street ? `${hn} ${street}` : street || hn;
  const parts = [line1, p.district, p.city, p.state, p.country]
    .filter((x) => x != null && String(x).trim() !== "")
    .map((x) => String(x));
  if (parts.length) return parts.join(", ");
  if (p.type) return String(p.type);
  return "Address not available";
}

function displayName(p: Record<string, unknown>): string {
  const n = p.name;
  if (n != null && String(n).trim()) return String(n);
  return formatPhotonAddress(p);
}

/** Prefer PH / clinic–like OSM tags when filtering. */
export function isHealthcarePlace(props: Record<string, unknown>): boolean {
  const key = String(props.osm_key ?? "");
  const val = String(props.osm_value ?? "").toLowerCase();
  if (key === "healthcare") return true;
  if (key === "amenity") {
    if (["clinic", "hospital", "doctors", "social_facility"].includes(val)) return true;
  }
  const blob = `${props.name ?? ""} ${props.type ?? ""}`.toLowerCase();
  return (
    blob.includes("health") ||
    blob.includes("clinic") ||
    blob.includes("phc") ||
    blob.includes("primary health") ||
    blob.includes("dispensary") ||
    blob.includes("sub-centre") ||
    blob.includes("sub centre")
  );
}

function stableId(props: Record<string, unknown>, lon: number, lat: number, index: number): string {
  const osmId = props.osm_id;
  const osmType = props.osm_type;
  if (osmId != null && osmType != null) return `${osmType}-${osmId}`;
  return `photon-${index}-${lon.toFixed(5)}-${lat.toFixed(5)}`;
}

/**
 * Search places; biasLat/Lon improves local ranking (Photon).
 */
export async function searchMapPlaces(
  query: string,
  biasLat: number,
  biasLon: number,
  options?: { limit?: number; healthcareOnly?: boolean },
): Promise<MapSearchHit[]> {
  const q = query.trim();
  if (!q) return [];

  const limit = options?.limit ?? 15;
  const healthcareOnly = options?.healthcareOnly ?? false;

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("lat", String(biasLat));
  url.searchParams.set("lon", String(biasLon));
  url.searchParams.set("limit", String(Math.min(50, limit + 20)));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Search failed (${res.status})`);

  const data = (await res.json()) as PhotonResponse;
  const features = data.features ?? [];

  const hits: MapSearchHit[] = [];
  let i = 0;
  for (const f of features) {
    const coords = f.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;
    const [lon, lat] = coords;
    const p = f.properties ?? {};
    if (healthcareOnly && !isHealthcarePlace(p)) continue;

    const osmKey = p.osm_key != null ? String(p.osm_key) : undefined;
    const osmValue = p.osm_value != null ? String(p.osm_value) : undefined;

    hits.push({
      id: stableId(p, lon, lat, i),
      name: displayName(p),
      address: formatPhotonAddress(p),
      lat,
      lon,
      osmKey,
      osmValue,
    });
    i += 1;
    if (hits.length >= limit) break;
  }

  return hits;
}
