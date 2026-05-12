import { useMemo, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Map as MapIcon, Activity, TrendingUp, Users, AlertTriangle, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePatientsData } from "@/modules/doctor/patients/hooks/usePatientsData";
import L from "leaflet";

// Fix default icon paths
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const INDIAN_CITIES: [number, number, string][] = [
  [13.0827, 80.2707, "Chennai"],
  [12.9716, 77.5946, "Bangalore"],
  [17.385, 78.4867, "Hyderabad"],
  [19.076, 72.8777, "Mumbai"],
  [28.6139, 77.209, "Delhi"],
  [22.5726, 88.3639, "Kolkata"],
  [23.0225, 72.5714, "Ahmedabad"],
  [18.5204, 73.8567, "Pune"],
  [26.9124, 75.7873, "Jaipur"],
  [11.0168, 76.9558, "Coimbatore"],
];

function generatePatientLocation(index: number): { lat: number; lng: number; city: string } {
  const city = INDIAN_CITIES[index % INDIAN_CITIES.length];
  const jitter = () => (Math.random() - 0.5) * 0.08;
  return { lat: city[0] + jitter(), lng: city[1] + jitter(), city: city[2] };
}

type RiskLevel = "High" | "Moderate" | "Low";

interface PatientWithLocation {
  id: string;
  name: string;
  age: number;
  phase: string;
  riskLevel: RiskLevel;
  lastActivity: string;
  lat: number;
  lng: number;
  city: string;
}

interface CityHotspot {
  lat: number;
  lng: number;
  city: string;
  total: number;
  high: number;
  moderate: number;
  low: number;
  patients: PatientWithLocation[];
  dominantRisk: RiskLevel;
  intensity: number; // 0–1
}

// Risk color palette
const RISK_COLORS: Record<RiskLevel, { fill: string; stroke: string; glow: string }> = {
  High:     { fill: "rgba(220, 38,  38,  0.18)", stroke: "rgba(220, 38,  38,  0.75)", glow: "#dc2626" },
  Moderate: { fill: "rgba(217, 119, 6,   0.18)", stroke: "rgba(217, 119, 6,   0.75)", glow: "#d97706" },
  Low:      { fill: "rgba(22,  163, 74,  0.18)", stroke: "rgba(22,  163, 74,  0.75)", glow: "#16a34a" },
};

// ── Hotspot Layer ────────────────────────────────────────────────────────────
function HotspotLayer({ hotspots }: { hotspots: CityHotspot[] }) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
    } else {
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const lg = layerGroupRef.current;

    hotspots.forEach((hs) => {
      const colors = RISK_COLORS[hs.dominantRisk];
      // Base radius: 30–90km depending on patient count, scaled by intensity
      const baseRadius = 30000 + hs.intensity * 60000;

      // Outer glow ring (large, very transparent)
      L.circle([hs.lat, hs.lng], {
        radius: baseRadius * 1.6,
        color: "transparent",
        fillColor: colors.glow,
        fillOpacity: 0.06 + hs.intensity * 0.06,
        interactive: false,
      }).addTo(lg);

      // Mid ring
      L.circle([hs.lat, hs.lng], {
        radius: baseRadius,
        color: colors.stroke,
        weight: 1.5,
        fillColor: colors.glow,
        fillOpacity: 0.13 + hs.intensity * 0.1,
        interactive: false,
      }).addTo(lg);

      // Core hotspot (brighter, smaller)
      L.circle([hs.lat, hs.lng], {
        radius: baseRadius * 0.45,
        color: colors.stroke,
        weight: 2,
        fillColor: colors.glow,
        fillOpacity: 0.32 + hs.intensity * 0.2,
        interactive: false,
      }).addTo(lg);

      // Clickable label/popup circle on top
      const popupCircle = L.circle([hs.lat, hs.lng], {
        radius: baseRadius * 0.18,
        color: colors.stroke,
        weight: 2.5,
        fillColor: colors.glow,
        fillOpacity: 0.85,
      }).addTo(lg);

      // City label marker (no icon, just a div label)
      const labelIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            display:flex;flex-direction:column;align-items:center;
            pointer-events:none;transform:translate(-50%,-50%);
          ">
            <div style="
              background:${colors.glow};
              color:#fff;
              font-size:11px;
              font-weight:700;
              padding:3px 8px;
              border-radius:20px;
              white-space:nowrap;
              box-shadow:0 2px 8px rgba(0,0,0,0.25);
              border:1.5px solid rgba(255,255,255,0.6);
              letter-spacing:0.3px;
            ">${hs.city} · ${hs.total}</div>
          </div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      L.marker([hs.lat, hs.lng], { icon: labelIcon, interactive: false }).addTo(lg);

      // Build popup content
      const popupHtml = `
        <div style="font-family:system-ui,sans-serif;min-width:180px;padding:2px 0;">
          <div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:6px;">${hs.city}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px;">
            <div style="background:#fef2f2;border-radius:6px;padding:6px 8px;text-align:center;">
              <div style="font-size:16px;font-weight:700;color:#dc2626;">${hs.high}</div>
              <div style="font-size:10px;color:#64748b;">High Risk</div>
            </div>
            <div style="background:#fffbeb;border-radius:6px;padding:6px 8px;text-align:center;">
              <div style="font-size:16px;font-weight:700;color:#d97706;">${hs.moderate}</div>
              <div style="font-size:10px;color:#64748b;">Moderate</div>
            </div>
            <div style="background:#f0fdf4;border-radius:6px;padding:6px 8px;text-align:center;">
              <div style="font-size:16px;font-weight:700;color:#16a34a;">${hs.low}</div>
              <div style="font-size:10px;color:#64748b;">Low Risk</div>
            </div>
            <div style="background:#f8fafc;border-radius:6px;padding:6px 8px;text-align:center;">
              <div style="font-size:16px;font-weight:700;color:#1e293b;">${hs.total}</div>
              <div style="font-size:10px;color:#64748b;">Total</div>
            </div>
          </div>
          <div style="font-size:10px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:6px;">
            Click anywhere to close
          </div>
        </div>`;

      popupCircle.bindPopup(popupHtml, {
        maxWidth: 220,
        className: "hotspot-popup",
      });
    });

    return () => {
      layerGroupRef.current?.clearLayers();
    };
  }, [hotspots, map]);

  return null;
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  accent: string;
  bg: string;
}) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
            <Icon className={`h-4.5 w-4.5 ${accent}`} style={{ width: 18, height: 18 }} />
          </div>
        </div>
        <p className={`text-3xl font-bold ${accent} mb-0.5`}>{value}</p>
        <p className="text-xs font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-1 leading-tight">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function DoctorHotspots() {
  const { patients, stats } = usePatientsData();

  const patientMarkers: PatientWithLocation[] = useMemo(
    () => patients.map((p, i) => ({ ...p, ...generatePatientLocation(i) })),
    [patients],
  );

  // Aggregate patients by city into hotspots
  const hotspots: CityHotspot[] = useMemo(() => {
    const cityMap = new Map<string, PatientWithLocation[]>();
    patientMarkers.forEach((p) => {
      const arr = cityMap.get(p.city) ?? [];
      arr.push(p);
      cityMap.set(p.city, arr);
    });

    const maxCount = Math.max(...Array.from(cityMap.values()).map((a) => a.length), 1);

    return Array.from(cityMap.entries()).map(([city, pts]) => {
      const cityInfo = INDIAN_CITIES.find((c) => c[2] === city)!;
      const high = pts.filter((p) => p.riskLevel === "High").length;
      const moderate = pts.filter((p) => p.riskLevel === "Moderate").length;
      const low = pts.filter((p) => p.riskLevel === "Low").length;
      const dominantRisk: RiskLevel =
        high > 0 ? "High" : moderate > 0 ? "Moderate" : "Low";
      return {
        lat: cityInfo[0],
        lng: cityInfo[1],
        city,
        total: pts.length,
        high,
        moderate,
        low,
        patients: pts,
        dominantRisk,
        intensity: pts.length / maxCount,
      };
    });
  }, [patientMarkers]);

  const highRiskCount = patientMarkers.filter((p) => p.riskLevel === "High").length;
  const moderateRiskCount = patientMarkers.filter((p) => p.riskLevel === "Moderate").length;
  const hotCities = hotspots.filter((h) => h.high > 0).length;

  const phases = ["Puberty", "Maternity", "Postpartum", "Menopause", "Family Planning"];

  const phaseColors: Record<string, string> = {
    Puberty: "bg-violet-50 text-violet-700 border-violet-100",
    Maternity: "bg-pink-50 text-pink-700 border-pink-100",
    Postpartum: "bg-blue-50 text-blue-700 border-blue-100",
    Menopause: "bg-orange-50 text-orange-700 border-orange-100",
    "Family Planning": "bg-teal-50 text-teal-700 border-teal-100",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-teal-700 text-white">
        <div className="container py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Health Hotspots</h1>
              <p className="text-white/60 text-xs mt-0.5">
                Regional patient density & risk distribution across India
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={Users}
            label="Total Patients"
            value={stats.total}
            sub="Across all regions"
            accent="text-slate-800"
            bg="bg-slate-100"
          />
          <StatCard
            icon={AlertTriangle}
            label="High Risk Zones"
            value={hotCities}
            sub={`${highRiskCount} patients need urgent care`}
            accent="text-red-600"
            bg="bg-red-50"
          />
          <StatCard
            icon={TrendingUp}
            label="Moderate Risk"
            value={moderateRiskCount}
            sub={stats.total > 0 ? `${((moderateRiskCount / stats.total) * 100).toFixed(0)}% need monitoring` : "No data"}
            accent="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            icon={Activity}
            label="Active Cities"
            value={hotspots.length}
            sub="With patient presence"
            accent="text-teal-600"
            bg="bg-teal-50"
          />
        </div>

        {/* Phase breakdown */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Patient Distribution by Phase
            </p>
            <div className="flex flex-wrap gap-2">
              {phases.map((phase) => {
                const count = patients.filter((p) => p.phase === phase).length;
                const pct = stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : "0";
                const colorClass = phaseColors[phase];
                return (
                  <div
                    key={phase}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${colorClass}`}
                  >
                    <span className="text-sm font-bold">{count}</span>
                    <span>{phase}</span>
                    <span className="opacity-60">({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Map header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <MapIcon className="h-4 w-4 text-teal-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Live Hotspot Map</p>
                  <p className="text-xs text-slate-400">
                    Larger, brighter zones = higher patient density · Click a hotspot for details
                  </p>
                </div>
              </div>
              {/* Legend */}
              <div className="hidden md:flex items-center gap-4 text-xs text-slate-600">
                {(["High", "Moderate", "Low"] as RiskLevel[]).map((r) => (
                  <span key={r} className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-3 h-3 rounded-full border-2 border-white shadow-sm"
                      style={{ background: RISK_COLORS[r].glow }}
                    />
                    {r} Risk
                  </span>
                ))}
              </div>
            </div>

            {/* Map container */}
            <div style={{ position: "relative", height: 520 }}>
              {patientMarkers.length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(248,250,252,0.85)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-slate-100 max-w-xs">
                    <div className="mx-auto w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Flame className="h-7 w-7 text-slate-300" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 mb-1">No Hotspot Data</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Patient hotspot zones will appear here once patients connect with you.
                    </p>
                  </div>
                </div>
              )}

              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                scrollWheelZoom
                zoomControl
                style={{ height: "100%", width: "100%" }}
              >
                {/* Clean light map tiles */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <HotspotLayer hotspots={hotspots} />
              </MapContainer>
            </div>

            {/* Bottom legend on mobile */}
            <div className="flex md:hidden items-center justify-center gap-5 py-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50">
              {(["High", "Moderate", "Low"] as RiskLevel[]).map((r) => (
                <span key={r} className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ background: RISK_COLORS[r].glow }}
                  />
                  {r}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popup styles */}
      <style>{`
        .hotspot-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          border: 1px solid #f1f5f9;
          padding: 0;
        }
        .hotspot-popup .leaflet-popup-content {
          margin: 14px 14px;
        }
        .hotspot-popup .leaflet-popup-tip {
          background: #ffffff;
        }
      `}</style>
    </div>
  );
}