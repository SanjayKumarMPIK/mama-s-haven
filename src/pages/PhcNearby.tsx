import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  LocateFixed,
  MapPin,
  Phone,
  Printer,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHealthLog, type HealthLogEntry, type HealthLogs, type MoodType } from "@/hooks/useHealthLog";
import { useProfile } from "@/hooks/useProfile";
import { usePhase, type Phase } from "@/hooks/usePhase";
import { searchMapPlaces } from "@/lib/mapPlaceSearch";
import { computeWellnessScore } from "@/lib/wellnessCommandEngine";
import { predictFamilyPlanningDeficiencies } from "@/lib/familyPlanningNutritionEngine";
import { getNearbyMockPhcs, haversineKm, type NearbyPhc } from "@/lib/phcMockLocations";
import { cn } from "@/lib/utils";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [13.0827, 80.2707];

const REPORT_RANGE_OPTIONS = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "3m", label: "Last 3 months" },
  { id: "custom", label: "Custom range" },
] as const;

type ReportRangeKey = (typeof REPORT_RANGE_OPTIONS)[number]["id"];
type SupportedLogPhase = "puberty" | "maternity" | "family-planning" | "menopause";

type NearbyCenter = {
  id: string;
  name: string;
  area: string;
  address: string;
  lat: number;
  lon: number;
  distanceKm: number;
  phone?: string;
  source: "directory" | "map";
};

type ReportRow = {
  date: string;
  symptoms: string[];
  mood: string;
  sleep: string;
  hydration: string;
  period: string;
  notes: string;
};

type GeneratedReport = {
  fileName: string;
  rangeLabel: string;
  totalLogs: number;
  symptomFrequency: Array<{ label: string; count: number }>;
  redFlags: string[];
  html: string;
};

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 11));
  }, [center, map]);

  return null;
}

function toISODate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(dateISO: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateISO}T12:00:00`));
}

function getReportRangeBounds(range: ReportRangeKey, customStart: string, customEnd: string) {
  const end = customEnd || toISODate(new Date());
  const endDate = new Date(`${end}T12:00:00`);
  const startDate = new Date(endDate);

  if (range === "7d") startDate.setDate(endDate.getDate() - 6);
  if (range === "30d") startDate.setDate(endDate.getDate() - 29);
  if (range === "3m") startDate.setMonth(endDate.getMonth() - 3);

  const start = range === "custom" ? customStart : toISODate(startDate);
  return {
    start,
    end,
    label:
      range === "custom"
        ? start && end
          ? `${formatDate(start)} to ${formatDate(end)}`
          : "Custom range"
        : REPORT_RANGE_OPTIONS.find((option) => option.id === range)?.label ?? "Selected range",
  };
}

function prettifyKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase())
    .trim();
}

function getOpenStreetMapUrl(lat: number, lon: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
}

function normalizeLogPhase(phase: Phase): SupportedLogPhase {
  if (phase === "postpartum") return "maternity";
  return phase;
}

function getActiveSymptoms(entry: HealthLogEntry) {
  return Object.entries((entry as { symptoms?: Record<string, boolean> }).symptoms ?? {})
    .filter(([, active]) => Boolean(active))
    .map(([key]) => prettifyKey(key));
}

function getHydrationValue(entry: HealthLogEntry) {
  if ("hydrationGlasses" in entry && typeof entry.hydrationGlasses === "number") {
    return entry.hydrationGlasses;
  }

  return null;
}

function getSleepValue(entry: HealthLogEntry) {
  if ("sleepHours" in entry && typeof entry.sleepHours === "number") {
    return entry.sleepHours;
  }

  return null;
}

function getMoodValue(entry: HealthLogEntry): MoodType | null {
  if ("mood" in entry) {
    return entry.mood ?? null;
  }

  return null;
}

function getMoodScore(mood: MoodType | null) {
  if (mood === "Good") return 3;
  if (mood === "Okay") return 2;
  if (mood === "Low") return 1;
  return null;
}

function getEnergyScore(entry: HealthLogEntry) {
  if ("fatigueLevel" in entry) {
    if (entry.fatigueLevel === "Low") return 3;
    if (entry.fatigueLevel === "Medium") return 2;
    if (entry.fatigueLevel === "High") return 1;
  }

  const symptoms = (entry as { symptoms?: Record<string, boolean> }).symptoms ?? {};
  if (symptoms.lowEnergy) return 1;
  if (symptoms.fatigue) return 2;
  return null;
}

function getPeriodSummary(entry: HealthLogEntry) {
  const parts: string[] = [];

  if ("periodStarted" in entry && entry.periodStarted) parts.push("Started");
  if ("periodEnded" in entry && entry.periodEnded) parts.push("Ended");
  if ("flowIntensity" in entry && entry.flowIntensity) parts.push(entry.flowIntensity);
  if ("bloodColor" in entry && entry.bloodColor) parts.push(entry.bloodColor);

  return parts.length ? parts.join(", ") : "-";
}

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function summarizeTrend(values: number[], positiveHigher = true) {
  if (values.length < 2) return "Not enough data";

  const midpoint = Math.ceil(values.length / 2);
  const first = average(values.slice(0, midpoint));
  const second = average(values.slice(midpoint));
  if (first === null || second === null) return "Not enough data";

  const diff = second - first;
  if (Math.abs(diff) < 0.2) return "Stable";
  if (positiveHigher) return diff > 0 ? "Improving" : "Needs support";
  return diff < 0 ? "Improving" : "Needs support";
}

function isRedFlagLabel(label: string) {
  const normalized = label.toLowerCase();
  return ["severe pain", "heavy bleeding", "fever", "chills", "dizziness", "fainting", "bad smell", "foul", "severe bleeding"].some((keyword) => normalized.includes(keyword));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildCommonRecommendations(symptomFrequency: Array<{ label: string; count: number }>) {
  const labels = symptomFrequency.map((item) => item.label.toLowerCase());
  const recommendations: string[] = [];

  if (labels.some((label) => label.includes("fatigue"))) {
    recommendations.push("Include iron-rich meals such as leafy greens, lentils, beans, and dates.");
  }

  if (labels.some((label) => label.includes("mood") || label.includes("stress"))) {
    recommendations.push("Include balanced meals and foods with healthy fats such as nuts and seeds.");
  }

  if (labels.some((label) => label.includes("sleep"))) {
    recommendations.push("Keep evening meals light and maintain a regular hydration and sleep routine.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Focus on regular meals, hydration, fruits, vegetables, and protein-rich foods.");
  }

  return recommendations.slice(0, 4);
}

function buildReportHtml(params: {
  profile: ReturnType<typeof useProfile>["profile"];
  phaseName: string;
  rangeLabel: string;
  rows: ReportRow[];
  symptomFrequency: Array<{ label: string; count: number }>;
  periodCount: number;
  avgMood: number | null;
  avgSleep: number | null;
  avgHydration: number | null;
  moodTrend: string;
  sleepTrend: string;
  energyTrend: string;
  wellnessScore: ReturnType<typeof computeWellnessScore>;
  nutrientSummary: string[];
  commonRecommendations: string[];
  redFlags: string[];
  notes: string[];
}) {
  const {
    profile,
    phaseName,
    rangeLabel,
    rows,
    symptomFrequency,
    periodCount,
    avgMood,
    avgSleep,
    avgHydration,
    moodTrend,
    sleepTrend,
    energyTrend,
    wellnessScore,
    nutrientSummary,
    commonRecommendations,
    redFlags,
    notes,
  } = params;

  const profileRows = [
    ["Name", profile.name || "Not provided"],
    ["Age", profile.age ? String(profile.age) : "Not provided"],
    ["Phase", phaseName],
    ["Blood group", profile.bloodGroup || "Not provided"],
    ["Location", [profile.state, profile.nearbyPhc].filter(Boolean).join(" | ") || "Not provided"],
    ["Existing health conditions", profile.medicalConditions.length ? profile.medicalConditions.join(", ") : profile.knownConditions || "None reported"],
  ];

  const logRowsHtml = rows.length
    ? rows.map((row) => `
      <tr>
        <td>${escapeHtml(formatDate(row.date))}</td>
        <td>${escapeHtml(row.symptoms.join(", ") || "-")}</td>
        <td>${escapeHtml(row.mood)}</td>
        <td>${escapeHtml(row.sleep)}</td>
        <td>${escapeHtml(row.hydration)}</td>
        <td>${escapeHtml(row.period)}</td>
        <td>${escapeHtml(row.notes)}</td>
      </tr>`).join("")
    : `<tr><td colspan="7">No logs found in the selected date range.</td></tr>`;

  const frequencyHtml = symptomFrequency.length
    ? symptomFrequency.map((item) => `<tr><td>${escapeHtml(item.label)}</td><td>${item.count}</td></tr>`).join("")
    : `<tr><td colspan="2">No symptom entries found.</td></tr>`;

  const noteHtml = notes.length
    ? `<ul>${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>`
    : `<p>No important notes were logged in this date range.</p>`;

  const redFlagHtml = redFlags.length
    ? `<ul>${redFlags.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : `<p>No red flag symptoms were identified from the selected logs.</p>`;

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>SwasthyaSakhi Health Log Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
        h1, h2, h3 { margin: 0 0 12px; }
        h1 { font-size: 28px; }
        h2 { font-size: 18px; margin-top: 28px; }
        p, li { font-size: 13px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; vertical-align: top; text-align: left; }
        th { background: #f8fafc; }
        .meta { margin-top: 8px; color: #475569; }
        .section { margin-top: 22px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .card { border: 1px solid #cbd5e1; padding: 14px; border-radius: 12px; background: #ffffff; }
        .footer { margin-top: 28px; font-size: 11px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 16px; }
      </style>
    </head>
    <body>
      <h1>SwasthyaSakhi Health Log Report</h1>
      <p class="meta">Generated on ${escapeHtml(new Date().toLocaleString("en-IN"))}</p>
      <p class="meta">Date range: ${escapeHtml(rangeLabel)}</p>

      <div class="section">
        <h2>User Profile Summary</h2>
        <table>
          <tbody>
            ${profileRows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Calendar Log Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Symptoms</th>
              <th>Mood</th>
              <th>Sleep</th>
              <th>Hydration</th>
              <th>Period</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>${logRowsHtml}</tbody>
        </table>
      </div>

      <div class="section grid">
        <div class="card">
          <h3>Summary Trends</h3>
          <p>Period-related log days: ${periodCount}</p>
          <p>Average mood score: ${avgMood !== null ? avgMood.toFixed(1) : "Not available"}</p>
          <p>Average sleep hours: ${avgSleep !== null ? avgSleep.toFixed(1) : "Not available"}</p>
          <p>Average hydration glasses: ${avgHydration !== null ? avgHydration.toFixed(1) : "Not available"}</p>
          <p>Mood trend: ${escapeHtml(moodTrend)}</p>
          <p>Sleep trend: ${escapeHtml(sleepTrend)}</p>
          <p>Energy trend: ${escapeHtml(energyTrend)}</p>
        </div>
        <div class="card">
          <h3>Wellness Summary</h3>
          <p>Wellness score: ${wellnessScore.score}</p>
          <p>Status: ${escapeHtml(wellnessScore.label)}</p>
          <p>Insight: ${escapeHtml(wellnessScore.insight)}</p>
          <p>Recent logging: ${wellnessScore.loggedDays}/${wellnessScore.totalDays} days</p>
        </div>
      </div>

      <div class="section">
        <h2>Symptom Frequency</h2>
        <table>
          <thead><tr><th>Symptom</th><th>Count</th></tr></thead>
          <tbody>${frequencyHtml}</tbody>
        </table>
      </div>

      <div class="section grid">
        <div class="card">
          <h3>Nutrition Summary</h3>
          <p><strong>Priority nutrients if available</strong></p>
          <ul>${nutrientSummary.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          <p><strong>Common recommendations</strong></p>
          <ul>${commonRecommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div class="card">
          <h3>Risk and Alert Summary</h3>
          ${redFlagHtml}
        </div>
      </div>

      <div class="section">
        <h2>Important Notes</h2>
        ${noteHtml}
      </div>

      <div class="footer">
        <p>This report is generated from user-entered logs for awareness and consultation support. It is not a medical diagnosis.</p>
      </div>
    </body>
  </html>`;
}

export default function PhcNearby() {
  const { profile } = useProfile();
  const { phase, phaseName } = usePhase();
  const healthLog = useHealthLog();

  const logPhase = normalizeLogPhase(phase);
  const phaseLogs = useMemo(() => healthLog.getPhaseLogs(logPhase), [healthLog, logPhase]);

  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [locationLabel, setLocationLabel] = useState("Chennai");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyCenters, setNearbyCenters] = useState<NearbyCenter[]>([]);
  const [reportRange, setReportRange] = useState<ReportRangeKey>("30d");
  const [customStart, setCustomStart] = useState(() => toISODate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)));
  const [customEnd, setCustomEnd] = useState(() => toISODate(new Date()));
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);

  const loadNearbyCenters = useCallback(async (lat: number, lon: number) => {
    setNearbyLoading(true);

    const directoryCenters = getNearbyMockPhcs(lat, lon, 8).map<NearbyCenter>((item: NearbyPhc) => ({
      id: item.id,
      name: item.name,
      area: item.area,
      address: item.address,
      lat: item.lat,
      lon: item.lon,
      distanceKm: item.distanceKm,
      phone: item.phone,
      source: "directory",
    }));

    try {
      const mapCenters = await searchMapPlaces("primary health centre", lat, lon, { limit: 6, healthcareOnly: true });
      const mapped = mapCenters.map<NearbyCenter>((item) => ({
        id: item.id,
        name: item.name,
        area: item.address.split(",")[0] || item.address,
        address: item.address,
        lat: item.lat,
        lon: item.lon,
        distanceKm: haversineKm(lat, lon, item.lat, item.lon),
        source: "map",
      }));

      const merged = [...mapped, ...directoryCenters].filter((item, index, all) => {
        return index === all.findIndex((candidate) => candidate.name.toLowerCase() === item.name.toLowerCase());
      });

      merged.sort((first, second) => first.distanceKm - second.distanceKm);
      setNearbyCenters(merged.slice(0, 10));
    } catch {
      setNearbyCenters(directoryCenters);
      setLocationMessage("Map search could not load additional centers. Showing available nearby PHC directory entries.");
    } finally {
      setNearbyLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNearbyCenters(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
  }, [loadNearbyCenters]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported in this browser. Please search by city, district, or area.");
      return;
    }

    setSearchLoading(true);
    setLocationMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextCenter: [number, number] = [position.coords.latitude, position.coords.longitude];
        setCenter(nextCenter);
        setLocationLabel("Current location");
        await loadNearbyCenters(nextCenter[0], nextCenter[1]);
        setSearchLoading(false);
      },
      () => {
        setLocationMessage("Location access is blocked. Please allow browser access or search manually by city, district, or area.");
        setSearchLoading(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 },
    );
  }, [loadNearbyCenters]);

  const handleLocationSearch = useCallback(async () => {
    const query = locationQuery.trim();
    if (!query) {
      setLocationMessage("Enter a city, district, or area to search.");
      return;
    }

    setSearchLoading(true);
    setLocationMessage(null);

    try {
      const hits = await searchMapPlaces(query, center[0], center[1], { limit: 5, healthcareOnly: false });
      if (hits.length === 0) {
        setLocationMessage("Unable to find that location. Try a nearby district or city.");
        setSearchLoading(false);
        return;
      }

      const first = hits[0];
      const nextCenter: [number, number] = [first.lat, first.lon];
      setCenter(nextCenter);
      setLocationLabel(first.name);
      await loadNearbyCenters(first.lat, first.lon);
    } catch {
      setLocationMessage("Search could not be completed. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  }, [center, loadNearbyCenters, locationQuery]);

  const rangeBounds = useMemo(() => getReportRangeBounds(reportRange, customStart, customEnd), [customEnd, customStart, reportRange]);

  const reportEntries = useMemo(() => {
    return Object.entries(phaseLogs)
      .filter(([date]) => date >= rangeBounds.start && date <= rangeBounds.end)
      .sort(([first], [second]) => second.localeCompare(first));
  }, [phaseLogs, rangeBounds.end, rangeBounds.start]);

  const canGenerateReport = reportRange !== "custom" || Boolean(customStart && customEnd && customStart <= customEnd);

  const generateReport = useCallback(() => {
    const rows: ReportRow[] = reportEntries.map(([date, entry]) => ({
      date,
      symptoms: getActiveSymptoms(entry),
      mood: getMoodValue(entry) ?? "-",
      sleep: getSleepValue(entry) !== null ? `${getSleepValue(entry)} hrs` : "-",
      hydration: getHydrationValue(entry) !== null ? `${getHydrationValue(entry)} glasses` : "-",
      period: getPeriodSummary(entry),
      notes: ("notes" in entry && entry.notes?.trim()) ? entry.notes.trim() : "-",
    }));

    const symptomCounts = new Map<string, number>();
    const moodScores: number[] = [];
    const sleepValues: number[] = [];
    const hydrationValues: number[] = [];
    const energyScores: number[] = [];
    const noteLines: string[] = [];
    let periodCount = 0;

    reportEntries.forEach(([date, entry]) => {
      getActiveSymptoms(entry).forEach((label) => {
        symptomCounts.set(label, (symptomCounts.get(label) ?? 0) + 1);
      });

      const moodScore = getMoodScore(getMoodValue(entry));
      if (moodScore !== null) moodScores.push(moodScore);

      const sleep = getSleepValue(entry);
      if (sleep !== null) sleepValues.push(sleep);

      const hydration = getHydrationValue(entry);
      if (hydration !== null) hydrationValues.push(hydration);

      const energy = getEnergyScore(entry);
      if (energy !== null) energyScores.push(energy);

      if (getPeriodSummary(entry) !== "-") periodCount += 1;

      if ("notes" in entry && entry.notes?.trim()) {
        noteLines.push(`${formatDate(date)}: ${entry.notes.trim()}`);
      }
    });

    const symptomFrequency = Array.from(symptomCounts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 8);

    const filteredLogsObject = Object.fromEntries(reportEntries) as HealthLogs;
    const nutrientSummary = logPhase === "family-planning"
      ? (() => {
          const deficiency = predictFamilyPlanningDeficiencies(filteredLogsObject, "tracking");
          if (deficiency.predictions.length > 0) {
            return deficiency.predictions.slice(0, 3).map((item) => `${item.nutrient}: ${item.title}`);
          }
          if (deficiency.fallback) {
            return [deficiency.fallback.focusTitle, ...deficiency.fallback.foods.slice(0, 2)];
          }
          return ["No priority nutrient summary available for this date range."];
        })()
      : ["No phase-specific nutrient priority is available for this phase yet."];

    const redFlags = symptomFrequency.filter((item) => isRedFlagLabel(item.label)).map((item) => `${item.label} (${item.count})`);
    const wellnessScore = computeWellnessScore(healthLog.logs, logPhase);

    const html = buildReportHtml({
      profile,
      phaseName,
      rangeLabel: rangeBounds.label,
      rows: rows.slice(0, 20),
      symptomFrequency,
      periodCount,
      avgMood: average(moodScores),
      avgSleep: average(sleepValues),
      avgHydration: average(hydrationValues),
      moodTrend: summarizeTrend(moodScores),
      sleepTrend: summarizeTrend(sleepValues),
      energyTrend: summarizeTrend(energyScores),
      wellnessScore,
      nutrientSummary,
      commonRecommendations: buildCommonRecommendations(symptomFrequency),
      redFlags,
      notes: noteLines.slice(0, 5),
    });

    setGeneratedReport({
      fileName: `swasthyasakhi-health-log-report-${rangeBounds.end}.html`,
      rangeLabel: rangeBounds.label,
      totalLogs: reportEntries.length,
      symptomFrequency,
      redFlags,
      html,
    });
  }, [healthLog.logs, logPhase, phaseName, profile, rangeBounds.end, rangeBounds.label, reportEntries]);

  const handleDownloadReport = useCallback(() => {
    if (!generatedReport) return;

    const blob = new Blob([generatedReport.html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = generatedReport.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, [generatedReport]);

  const handlePrintReport = useCallback(() => {
    if (!generatedReport) return;

    const win = window.open("", "_blank", "noopener,noreferrer,width=960,height=720");
    if (!win) return;
    win.document.open();
    win.document.write(generatedReport.html);
    win.document.close();
    win.focus();
    win.print();
  }, [generatedReport]);

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="container max-w-5xl px-4">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Nearby PHC Centers</h1>
          <p className="mt-2 text-sm text-slate-600">Find nearby public health centers and support services.</p>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Location Search</h2>
              <p className="mt-1 text-sm text-slate-500">Search by city, district, or area, or use your current location.</p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1">
                <Input
                  value={locationQuery}
                  onChange={(event) => setLocationQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleLocationSearch();
                  }}
                  placeholder="Search by city, district, or area"
                  disabled={searchLoading}
                />
              </div>
              <Button type="button" onClick={() => void handleLocationSearch()} disabled={searchLoading} className="gap-2">
                {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search location
              </Button>
              <Button type="button" variant="outline" onClick={handleUseCurrentLocation} disabled={searchLoading} className="gap-2">
                <LocateFixed className="h-4 w-4" />
                Use current location
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">Current search area: {locationLabel}</span>
            </div>

            {locationMessage ? <p className="mt-3 text-sm text-slate-600">{locationMessage}</p> : null}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Map View</h2>
            </div>

            <MapContainer
              center={center}
              zoom={12}
              scrollWheelZoom
              style={{ height: "420px", width: "100%" }}
              className="z-0 rounded-2xl border border-slate-200"
            >
              <MapRecenter center={center} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={center}>
                <Popup>{locationLabel}</Popup>
              </Marker>

              {nearbyCenters.map((centerItem) => (
                <CircleMarker
                  key={centerItem.id}
                  center={[centerItem.lat, centerItem.lon]}
                  radius={10}
                  pathOptions={{
                    color: centerItem.source === "map" ? "#0f766e" : "#2563eb",
                    fillColor: centerItem.source === "map" ? "#14b8a6" : "#60a5fa",
                    fillOpacity: 0.7,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <strong className="block text-sm">{centerItem.name}</strong>
                    <span className="mt-1 block text-xs text-slate-600">{centerItem.address}</span>
                    <span className="mt-1 block text-xs font-medium">~{centerItem.distanceKm.toFixed(1)} km away</span>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Nearby PHC List</h2>
                <p className="mt-1 text-sm text-slate-500">Nearby centers based on your selected location.</p>
              </div>
              {nearbyLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : null}
            </div>

            {nearbyCenters.length === 0 && !nearbyLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                Unable to find nearby PHC centers. Try searching by district or city.
              </div>
            ) : (
              <div className="space-y-3">
                {nearbyCenters.map((centerItem) => (
                  <div key={centerItem.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{centerItem.name}</p>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">{centerItem.distanceKm.toFixed(1)} km</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{centerItem.area}</p>
                        <p className="mt-1 text-xs text-slate-500">{centerItem.address}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <a
                          href={getOpenStreetMapUrl(centerItem.lat, centerItem.lon)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open in map
                        </a>
                        {centerItem.phone ? (
                          <a
                            href={`tel:${centerItem.phone}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                          >
                            <Phone className="h-4 w-4" />
                            Call
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Download Health Report</h2>
              <p className="mt-1 text-sm text-slate-500">Generate a summary of your recent health logs to share with a healthcare professional.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {REPORT_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setReportRange(option.id)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left text-sm transition",
                    reportRange === option.id ? "border-teal-300 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {reportRange === "custom" ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Start date</label>
                  <Input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">End date</label>
                  <Input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
                </div>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="button" onClick={generateReport} disabled={!canGenerateReport} className="gap-2">
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
              <Button type="button" variant="outline" onClick={handleDownloadReport} disabled={!generatedReport} className="gap-2">
                <Download className="h-4 w-4" />
                Download HTML
              </Button>
              <Button type="button" variant="outline" onClick={handlePrintReport} disabled={!generatedReport} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Report
              </Button>
            </div>

            {generatedReport ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Report ready</p>
                <p className="mt-1 text-sm text-slate-600">Date range: {generatedReport.rangeLabel}</p>
                <p className="mt-1 text-sm text-slate-600">Logs included: {generatedReport.totalLogs}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {generatedReport.symptomFrequency.slice(0, 5).map((item) => (
                    <span key={item.label} className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">
                      {item.label}: {item.count}
                    </span>
                  ))}
                </div>
                {generatedReport.redFlags.length > 0 ? (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Red flag symptoms noted in report: {generatedReport.redFlags.join(", ")}
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-start gap-2.5 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <p>This feature helps you locate nearby public health centers. For emergencies, call 108.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
