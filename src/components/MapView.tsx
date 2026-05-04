import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { getNearbyMockPhcs, haversineKm } from "@/lib/phcMockLocations";
import { searchMapPlaces, type MapSearchHit } from "@/lib/mapPlaceSearch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [13.0827, 80.2707];

type MapPoint = MapSearchHit & { distanceKm: number };

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 11));
  }, [center, map]);
  return null;
}

export default function MapView() {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [rawHits, setRawHits] = useState<MapSearchHit[]>([]);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("primary health centre");
  const [healthcareOnly, setHealthcareOnly] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const displayed: MapPoint[] = useMemo(() => {
    return rawHits
      .map((h) => ({
        ...h,
        distanceKm: haversineKm(center[0], center[1], h.lat, h.lon),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [rawHits, center]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoMessage("Location is not supported. Search is biased to the map center (default: Chennai).");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCenter([latitude, longitude]);
        setGeoMessage("Using your location to rank search results and measure distance.");
      },
      () => {
        setGeoMessage(
          "Location not shared. Map center is Chennai — distances are from this point until you search.",
        );
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 60_000 },
    );
  }, []);

  const runSearch = async () => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchError("Enter a place or facility to search.");
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    try {
      const hits = await searchMapPlaces(q, center[0], center[1], {
        limit: 12,
        healthcareOnly,
      });
      setRawHits(hits);
      if (hits.length === 0) {
        setSearchError(
          healthcareOnly
            ? "No healthcare-tagged matches. Try turning off the filter or a different phrase."
            : "No results. Try another search phrase.",
        );
      }
    } catch (e) {
      setRawHits([]);
      setSearchError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setSearchLoading(false);
    }
  };

  const loadDemoPhcs = () => {
    setSearchError(null);
    const mock = getNearbyMockPhcs(center[0], center[1], 8);
    setRawHits(
      mock.map((m) => ({
        id: m.id,
        name: m.name,
        address: m.address,
        lat: m.lat,
        lon: m.lon,
      })),
    );
  };

  return (
    <div className="space-y-4">
      {geoMessage && <p className="text-xs text-muted-foreground">{geoMessage}</p>}

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/40 p-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor="map-place-search" className="text-xs font-medium text-muted-foreground">
            Map search (OpenStreetMap via Photon)
          </label>
          <Input
            id="map-place-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void runSearch();
            }}
            placeholder="e.g. primary health centre, PHC, government clinic…"
            disabled={searchLoading}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground sm:pb-2">
          <input
            type="checkbox"
            className="rounded border-input"
            checked={healthcareOnly}
            onChange={(e) => setHealthcareOnly(e.target.checked)}
            disabled={searchLoading}
          />
          Healthcare / PHC–like tags only
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void runSearch()} disabled={searchLoading}>
            {searchLoading ? "Searching…" : "Search"}
          </Button>
          <Button type="button" variant="outline" onClick={loadDemoPhcs} disabled={searchLoading}>
            PHCs
          </Button>
        </div>
      </div>

      {searchError && <p className="text-xs text-destructive">{searchError}</p>}

      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ height: "400px", width: "100%" }}
        className="z-0 rounded-xl border border-border"
      >
        <MapRecenter center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={center}>
          <Popup>Your location / search origin (distances measured from here)</Popup>
        </Marker>

        {displayed.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lon]}
            radius={14}
            pathOptions={{
              color: "#c2410c",
              fillColor: "#ea580c",
              fillOpacity: 0.55,
              weight: 2,
            }}
          >
            <Popup>
              <strong className="block text-sm">{p.name}</strong>
              <span className="mt-1 block text-xs text-muted-foreground">{p.address}</span>
              {(p.osmKey || p.osmValue) && (
                <span className="mt-1 block text-[10px] text-muted-foreground">
                  OSM: {p.osmKey ?? "?"}={p.osmValue ?? "?"}
                </span>
              )}
              <span className="mt-1 block text-xs font-medium">~{p.distanceKm.toFixed(1)} km away</span>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div>
        <h3 className="text-sm font-semibold">Results</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Distances are straight-line (km) from your pin to each place. Data comes from OpenStreetMap contributors;
          verify before visiting.
        </p>
        {displayed.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Search the map for facilities such as PHCs, or use &quot;Demo PHCs&quot; for sample points.
          </p>
        ) : (
          <ul className="mt-3 space-y-3 text-sm">
            {displayed.map((p) => (
              <li key={p.id} className="rounded-lg border border-border/80 bg-card/50 px-3 py-2">
                <div className="font-medium">{p.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{p.address}</div>
                <div className="mt-1 text-xs font-medium text-foreground">~{p.distanceKm.toFixed(1)} km</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
