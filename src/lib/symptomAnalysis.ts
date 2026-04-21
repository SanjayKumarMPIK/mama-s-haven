import type { Phase } from "@/hooks/usePhase";
import type {
  FamilyPlanningEntry,
  HealthLogs,
  MaternityEntry,
  MenopauseEntry,
  PubertyEntry,
} from "@/hooks/useHealthLog";
import { calcAverageCycleLength } from "@/hooks/useHealthLog";

export type KeySymptomId =
  | "cramps"
  | "fatigue"
  | "moodSwings"
  | "headache"
  | "acne"
  | "breastTenderness"
  | "nausea"
  | "dizziness"
  | "backPain"
  | "swelling"
  | "sleepDisturbance"
  | "irregularCycle"
  | "ovulationPain"
  | "moodChanges"
  | "stress"
  | "sleepIssues"
  | "hotFlashes"
  | "nightSweats"
  | "jointPain";

export type Trend = "Frequent" | "Occasional" | "Stable";
export type Timing = "Before period" | "During cycle" | "Random";
export type Confidence = "Low Confidence" | "Moderate Confidence" | "High Confidence";
export type TrendDirection = "Stable" | "Increasing" | "Decreasing" | "Irregular";
export type TimingPattern = "Morning" | "Evening" | "Random";
export type ViewMode = "weekly" | "monthly";

export interface SymptomAnalysisResult {
  insight: string;
  prediction: string;
  trend: Trend;
  timing: Timing;
  trendDirection: TrendDirection;
  timingPattern: TimingPattern;
  confidence: Confidence;
  suggestions: string[];
  showSuggestions: boolean;
  showPHC: boolean;
  barData: { label: string; count: number }[];
  pieData: { name: "Mild" | "Moderate" | "Severe"; value: number }[];
}

type SymptomDef = { id: KeySymptomId; label: string };

export const KEY_SYMPTOMS_BY_PHASE: Record<Phase, SymptomDef[]> = {
  puberty: [
    { id: "cramps", label: "Cramps" },
    { id: "fatigue", label: "Fatigue" },
    { id: "moodSwings", label: "Mood swings" },
    { id: "headache", label: "Headache" },
    { id: "acne", label: "Acne" },
    { id: "breastTenderness", label: "Breast tenderness" },
  ],
  maternity_T1: [
    { id: "nausea", label: "Nausea / Vomiting" },
    { id: "fatigue", label: "Fatigue" },
    { id: "breastTenderness", label: "Breast Tenderness" },
    { id: "frequentUrination", label: "Frequent Urination" },
    { id: "moodSwings", label: "Mood Swings" },
    { id: "foodAversions", label: "Food Aversions" },
  ],
  maternity_T2: [
    { id: "increasedAppetite", label: "Increased Appetite" },
    { id: "babyBumpGrowth", label: "Baby Bump Growth" },
    { id: "fetalMovement", label: "Fetal Movement" },
    { id: "backPain", label: "Back Pain" },
    { id: "skinChanges", label: "Skin Changes" },
    { id: "mildSwelling", label: "Mild Swelling" },
  ],
  maternity_T3: [
    { id: "shortnessOfBreath", label: "Shortness of Breath" },
    { id: "frequentUrination", label: "Frequent Urination" },
    { id: "braxtonHicks", label: "Braxton Hicks Contractions" },
    { id: "sleepDifficulty", label: "Sleep Difficulty" },
    { id: "heartburn", label: "Heartburn" },
    { id: "swelling", label: "Swelling" },
  ],
  maternity: [
    { id: "nausea", label: "Nausea / Vomiting" },
    { id: "fatigue", label: "Fatigue" },
    { id: "breastTenderness", label: "Breast Tenderness" },
    { id: "frequentUrination", label: "Frequent Urination" },
    { id: "moodSwings", label: "Mood Swings" },
    { id: "foodAversions", label: "Food Aversions" },
  ],
  "family-planning": [
    { id: "irregularCycle", label: "Irregular cycle" },
    { id: "ovulationPain", label: "Ovulation pain" },
    { id: "moodChanges", label: "Mood changes" },
    { id: "fatigue", label: "Fatigue" },
    { id: "stress", label: "Stress" },
    { id: "sleepIssues", label: "Sleep issues" },
  ],
  menopause: [
    { id: "hotFlashes", label: "Hot flashes" },
    { id: "nightSweats", label: "Night sweats" },
    { id: "moodSwings", label: "Mood swings" },
    { id: "sleepDisturbance", label: "Sleep disturbance" },
    { id: "jointPain", label: "Joint pain" },
    { id: "fatigue", label: "Fatigue" },
  ],
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseISOToMidday(dateISO: string): Date | null {
  const d = new Date(dateISO + "T12:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTrendFromCount(count: number): Trend {
  if (count >= 3) return "Frequent";
  if (count >= 1) return "Occasional";
  return "Stable";
}

function confidenceFromPoints(points: number): Confidence {
  if (points >= 10) return "High Confidence";
  if (points >= 4) return "Moderate Confidence";
  return "Low Confidence";
}

function getPhaseContextText(phase: Phase, symptomId: KeySymptomId): string {
  if (symptomId === "fatigue") {
    if (phase === "puberty") return "Fatigue can feel stronger as your body adapts during this stage.";
    if (phase === "maternity") return "During pregnancy, fatigue is common—especially when sleep or hydration is low.";
    if (phase === "menopause") return "During menopause, fatigue often increases alongside sleep changes.";
    return "Fatigue can build up with busy routines and recovery needs.";
  }

  if (symptomId === "sleepDisturbance" || symptomId === "sleepIssues") {
    if (phase === "maternity") return "Sleep disturbance is common during pregnancy. Tracking helps you spot patterns.";
    if (phase === "menopause") return "Sleep disturbance often comes and goes during menopause. A steady routine can help.";
    return "Sleep issues can be affected by stress and daily habits.";
  }

  if (symptomId === "moodSwings" || symptomId === "moodChanges") {
    if (phase === "maternity") return "Mood can shift during pregnancy due to changing routines and stress.";
    if (phase === "menopause") return "Mood swings can be stronger during menopause, especially when sleep is disrupted.";
    if (phase === "puberty") return "Mood swings can happen as your body changes and stress builds up.";
    return "Mood changes can be influenced by stress, sleep, and day-to-day pressures.";
  }

  if (symptomId === "hotFlashes") return "Hot flashes can be triggered by heat, stress, or warm environments—staying cool matters.";
  if (symptomId === "swelling") return "Swelling can be affected by standing, hydration, and salt—small habits make a difference.";
  if (symptomId === "nausea") return "Nausea is often influenced by meals, hydration, and daily routines—small changes can help.";
  if (symptomId === "acne") return "Acne can fluctuate with daily hormones and stress—gentle care helps.";
  if (symptomId === "breastTenderness") return "Breast tenderness can come and go with natural body changes—supportive comfort can help.";

  return "Tracking your symptoms over time helps you spot patterns that are personal to you.";
}

function getKeySymptomLabel(phase: Phase, symptomId: KeySymptomId): string {
  return KEY_SYMPTOMS_BY_PHASE[phase].find((s) => s.id === symptomId)?.label ?? "Symptom";
}

interface SymptomOccurrence {
  dateISO: string;
  hour: number;
  severity: 1 | 2 | 3;
}

function getPredictedNextPeriodStartISO(phase: Phase, logs: HealthLogs): string | null {
  const todayISO = getTodayISO();
  const dateNow = parseISOToMidday(todayISO);
  if (!dateNow) return null;

  if (phase === "puberty") {
    const periodStarts = Object.entries(logs)
      .filter(([, e]) => e.phase === "puberty" && (e as PubertyEntry).periodStarted)
      .map(([d]) => d)
      .sort();

    if (periodStarts.length < 2) return null;
    const lastStart = periodStarts[periodStarts.length - 1];
    const avgCycle = calcAverageCycleLength(logs);
    if (!avgCycle) return null;

    const d = parseISOToMidday(lastStart);
    if (!d) return null;
    d.setDate(d.getDate() + avgCycle);
    return toISODate(d);
  }

  if (phase === "family-planning") {
    const latest = Object.entries(logs)
      .filter(([, e]) => e.phase === "family-planning")
      .sort(([a], [b]) => b.localeCompare(a))[0]?.[1] as FamilyPlanningEntry | undefined;

    if (!latest || !latest.lastPeriodDate || !latest.cycleLength) return null;
    const d = parseISOToMidday(latest.lastPeriodDate);
    if (!d) return null;
    d.setDate(d.getDate() + latest.cycleLength);
    return toISODate(d);
  }

  // For maternity/menopause, we use "Random" timing (no period-cycle prediction).
  return null;
}

function getWindowStartISO(phase: Phase, logs: HealthLogs): string {
  const todayISO = getTodayISO();
  const today = parseISOToMidday(todayISO);
  if (!today) return todayISO;

  // Last 2-3 cycles for cycle-based phases. Otherwise, use last 60 days.
  if (phase === "puberty") {
    const dates = Object.entries(logs)
      .filter(([, e]) => e.phase === "puberty" && (e as PubertyEntry).periodStarted)
      .map(([d]) => d)
      .sort((a, b) => a.localeCompare(b));

    if (dates.length >= 2) {
      const recent = dates.slice(Math.max(0, dates.length - 3));
      const oldest = parseISOToMidday(recent[0]);
      if (oldest) {
        oldest.setDate(oldest.getDate() - 5);
        return toISODate(oldest);
      }
    }
  }

  if (phase === "family-planning") {
    const periodDates = Object.entries(logs)
      .filter(([, e]) => e.phase === "family-planning")
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, e]) => (e as FamilyPlanningEntry).lastPeriodDate)
      .filter(Boolean);

    if (periodDates.length >= 2) {
      const recent = periodDates.slice(0, 3);
      const oldest = parseISOToMidday(recent[recent.length - 1]);
      if (oldest) {
        oldest.setDate(oldest.getDate() - 5);
        return toISODate(oldest);
      }
    }
  }

  const start = new Date(today.getTime() - MS_PER_DAY * 60);
  return toISODate(start);
}

function isSymptomTrueForEntry(phase: Phase, entry: any, symptomId: KeySymptomId): boolean {
  if (phase === "puberty") {
    const e = entry as PubertyEntry;
    switch (symptomId) {
      case "cramps":
        return !!e.symptoms.cramps;
      case "fatigue":
        return !!e.symptoms.fatigue;
      case "moodSwings":
        return !!e.symptoms.moodSwings;
      case "headache":
        return !!e.symptoms.headache;
      case "acne":
        return !!e.symptoms.acne;
      case "breastTenderness":
        return !!e.symptoms.breastTenderness;
      default:
        return false;
    }
  }

  if (phase === "maternity") {
    const e = entry as MaternityEntry;
    switch (symptomId) {
      case "nausea":
        return !!e.symptoms.nausea;
      case "fatigue":
        return e.fatigueLevel !== null;
      case "dizziness":
        return !!e.symptoms.dizziness;
      case "backPain":
        return !!e.symptoms.backPain;
      case "swelling":
        return !!e.symptoms.swelling;
      case "sleepDisturbance":
        return !!e.symptoms.sleepDisturbance || (e.sleepHours !== null && e.sleepHours < 6);
      default:
        return false;
    }
  }

  if (phase === "family-planning") {
    const e = entry as FamilyPlanningEntry;
    switch (symptomId) {
      case "irregularCycle":
        return !!e.symptoms.irregularCycle;
      case "ovulationPain":
        return !!e.symptoms.ovulationPain;
      case "moodChanges":
        return !!e.symptoms.moodChanges;
      case "fatigue":
        return !!e.symptoms.fatigue;
      case "stress":
        return !!e.symptoms.stress;
      case "sleepIssues":
        return !!e.symptoms.sleepIssues || (e.sleepHours !== null && e.sleepHours < 6);
      default:
        return false;
    }
  }

  if (phase === "menopause") {
    const e = entry as MenopauseEntry;
    switch (symptomId) {
      case "hotFlashes":
        return !!e.symptoms.hotFlashes;
      case "nightSweats":
        return !!e.symptoms.nightSweats;
      case "moodSwings":
        return !!e.symptoms.moodSwings;
      case "sleepDisturbance":
        return !!e.symptoms.sleepDisturbance || (e.sleepHours !== null && e.sleepHours < 6);
      case "jointPain":
        return !!e.symptoms.jointPain;
      case "fatigue":
        return !!e.symptoms.fatigue;
      default:
        return false;
    }
  }

  return false;
}

function deriveSeverityFromEntry(phase: Phase, entry: any, symptomId: KeySymptomId): 1 | 2 | 3 {
  if (phase === "maternity") {
    const e = entry as MaternityEntry;
    if (symptomId === "fatigue" && e.fatigueLevel === "High") return 3;
    if (symptomId === "fatigue" && e.fatigueLevel === "Medium") return 2;
    if (e.sleepHours !== null && e.sleepHours < 5) return 3;
    if (e.sleepHours !== null && e.sleepHours < 6) return 2;
  }
  if (phase === "menopause") {
    const e = entry as MenopauseEntry;
    if (symptomId === "sleepDisturbance" && e.sleepHours !== null && e.sleepHours < 5) return 3;
    if (symptomId === "sleepDisturbance" && e.sleepHours !== null && e.sleepHours < 6) return 2;
  }
  if (phase === "family-planning") {
    const e = entry as FamilyPlanningEntry;
    if ((symptomId === "sleepIssues" || symptomId === "fatigue") && e.sleepHours !== null && e.sleepHours < 5) return 3;
    if ((symptomId === "sleepIssues" || symptomId === "fatigue") && e.sleepHours !== null && e.sleepHours < 6) return 2;
  }
  return 1;
}

function getOccurrences(phase: Phase, logs: HealthLogs, symptomId: KeySymptomId): SymptomOccurrence[] {
  const todayISO = getTodayISO();
  const startISO = getWindowStartISO(phase, logs);
  const points: SymptomOccurrence[] = [];

  const entries = Object.entries(logs).filter(([, e]) => e.phase === phase);

  for (const [dateISO, entry] of entries) {
    if (dateISO < startISO || dateISO > todayISO) continue;
    if (isSymptomTrueForEntry(phase, entry, symptomId)) {
      points.push({
        dateISO,
        hour: 12, // calendar logs are day-based; noon keeps grouping neutral
        severity: deriveSeverityFromEntry(phase, entry, symptomId),
      });
    }
  }

  return points.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

function computeTimingCategory(opts: {
  phase: Phase;
  predictedNextStartISO: string | null;
  occurrenceDays: string[];
}): Timing {
  const { predictedNextStartISO, occurrenceDays } = opts;
  if (!predictedNextStartISO || occurrenceDays.length === 0) return "Random";

  const predicted = parseISOToMidday(predictedNextStartISO);
  if (!predicted) return "Random";

  const beforeStart = new Date(predicted.getTime() - MS_PER_DAY * 5);
  const beforeEnd = new Date(predicted.getTime() - MS_PER_DAY * 1);
  const duringStart = predicted;
  const duringEnd = new Date(predicted.getTime() + MS_PER_DAY * 3);

  const beforeStartISO = toISODate(beforeStart);
  const beforeEndISO = toISODate(beforeEnd);
  const duringStartISO = toISODate(duringStart);
  const duringEndISO = toISODate(duringEnd);

  let beforeCount = 0;
  let duringCount = 0;
  for (const day of occurrenceDays) {
    if (day >= beforeStartISO && day <= beforeEndISO) beforeCount += 1;
    else if (day >= duringStartISO && day <= duringEndISO) duringCount += 1;
  }

  if (beforeCount >= 1 && beforeCount >= duringCount) return "Before period";
  if (duringCount >= 1) return "During cycle";
  return "Random";
}

function getSuggestionsForSymptom(symptomId: KeySymptomId): string[] {
  switch (symptomId) {
    case "cramps":
      return ["Try light exercise or heat therapy.", "Stay hydrated during the day."];
    case "fatigue":
      return ["Ensure proper sleep with a consistent bedtime.", "Maintain regular, nutritious meals."];
    case "moodSwings":
      return ["Practice short relaxation techniques (breathing, short breaks).", "Take brief pauses when emotions feel intense."];
    case "moodChanges":
      return ["Use quick calming breaks (2–5 minutes).", "Keep a small routine for sleep and meals if possible."];
    case "headache":
      return ["Rest in a quiet, dim room.", "Stay hydrated and take screen breaks.", "Consider a cool or warm compress (as comfortable)."];
    case "acne":
      return ["Use a gentle cleanser and avoid harsh scrubbing.", "Avoid picking or squeezing spots.", "Stick to a simple routine for a few weeks."];
    case "breastTenderness":
      return ["Wear a supportive bra for comfort.", "Use a warm or cool compress if it feels soothing.", "Track changes and note what helps."];
    case "nausea":
      return ["Try small, frequent meals instead of large portions.", "Sip water slowly and avoid strong smells.", "Consider ginger/comfort foods if it suits you."];
    case "dizziness":
      return ["Increase hydration and avoid sudden standing.", "Consult a doctor if dizziness persists for 3+ days."];
    case "backPain":
      return ["Gentle stretching is recommended.", "Avoid long static posture and use back support."];
    case "swelling":
      return ["Elevate legs when resting.", "Avoid long standing; take short breaks.", "Stay hydrated and keep an eye on salt intake."];
    case "sleepDisturbance":
    case "sleepIssues":
      return ["Maintain a consistent sleep schedule.", "Reduce screen exposure before bedtime."];
    case "hotFlashes":
      return ["Avoid heat triggers and stay in cooler spaces.", "Wear breathable clothing.", "Sip water and rest when you feel flushed."];
    case "nightSweats":
      return ["Keep your room cool and use breathable sleepwear.", "Use light bedding you can adjust easily.", "Stay hydrated during the day."];
    case "jointPain":
      return ["Do gentle movement or stretches.", "Use warmth or gentle massage if comfortable.", "Take short activity breaks instead of long stretches."];
    case "irregularCycle":
      return ["Keep tracking your cycle dates consistently.", "Note any patterns (stress, sleep, travel, major routine changes).", "If it keeps happening, consider speaking with a PHC."];
    case "ovulationPain":
      return ["Try gentle rest and light movement.", "Use a warm heat therapy pack if it feels soothing.", "Stay hydrated and monitor changes."];
    case "stress":
      return ["Practice quick calming techniques (deep breathing, grounding).", "Take short breaks and stay hydrated.", "Try a short evening wind-down routine."];
    default:
      return ["Keep tracking what helps.", "If symptoms feel severe or worrying, consider speaking to a healthcare worker."];
  }
}

function buildInsightText(opts: {
  phase: Phase;
  symptomId: KeySymptomId;
  trendDirection: TrendDirection;
  points: SymptomOccurrence[];
}): string {
  const { phase, symptomId, trendDirection, points } = opts;
  const label = getKeySymptomLabel(phase, symptomId);
  const lastDate = points.length ? points[points.length - 1].dateISO : null;
  const today = parseISOToMidday(getTodayISO());
  const last = lastDate ? parseISOToMidday(lastDate) : null;
  const gap = today && last ? Math.round((today.getTime() - last.getTime()) / MS_PER_DAY) : null;

  if (points.length === 0) return `No recent ${label.toLowerCase()} recorded in your timeline.`;
  if (gap !== null && gap >= 10) return `No recent ${label.toLowerCase()} recorded in the last ${gap} days.`;
  if (trendDirection === "Increasing") return `${label} frequency is increasing compared to the previous period.`;
  if (trendDirection === "Decreasing") return `${label} frequency has reduced compared to the previous period.`;
  if (trendDirection === "Irregular") return `${label} appears with an irregular pattern across recent logs.`;
  return `${label} appears stable in recent logs.`;
}

function inferRecurringWindow(points: SymptomOccurrence[]): string | null {
  if (points.length < 3) return null;
  const diffs: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const prev = parseISOToMidday(points[i - 1].dateISO);
    const next = parseISOToMidday(points[i].dateISO);
    if (!prev || !next) continue;
    const diff = Math.max(1, Math.round((next.getTime() - prev.getTime()) / MS_PER_DAY));
    diffs.push(diff);
  }
  if (!diffs.length) return null;
  const min = Math.min(...diffs);
  const max = Math.max(...diffs);
  if (max - min > 4) return null;
  return `${min}\u2013${max} days`;
}

function getTimingPattern(points: SymptomOccurrence[]): TimingPattern {
  if (!points.length) return "Random";
  const morning = points.filter((p) => p.hour < 12).length;
  const evening = points.filter((p) => p.hour >= 17).length;
  const ratioMorning = morning / points.length;
  const ratioEvening = evening / points.length;
  if (ratioMorning >= 0.5) return "Morning";
  if (ratioEvening >= 0.5) return "Evening";
  return "Random";
}

function buildPredictionText(opts: {
  phase: Phase;
  symptomId: KeySymptomId;
  trend: Trend;
  timingPattern: TimingPattern;
  points: SymptomOccurrence[];
}): string {
  const { phase, symptomId, trend, timingPattern, points } = opts;
  const label = getKeySymptomLabel(phase, symptomId).toLowerCase();
  const recurring = inferRecurringWindow(points);
  const context = getPhaseContextText(phase, symptomId);

  if (trend === "Stable" && points.length === 0) {
    return `No clear recurrence for ${label} right now. ${context}`;
  }
  if (recurring) {
    return `Mild recurrence observed every ${recurring}. Higher likelihood during ${timingPattern.toLowerCase()} hours.`;
  }
  if (trend === "Occasional") {
    return `${getKeySymptomLabel(phase, symptomId)} appears occasionally with no fixed pattern. Higher likelihood during ${timingPattern.toLowerCase()} hours.`;
  }

  return `${getKeySymptomLabel(phase, symptomId)} may continue based on current pattern. Higher likelihood during ${timingPattern.toLowerCase()} hours.`;
}

function buildBarData(points: SymptomOccurrence[], viewMode: ViewMode): { label: string; count: number }[] {
  const buckets = new Map<string, number>();
  for (const p of points) {
    const d = parseISOToMidday(p.dateISO);
    if (!d) continue;
    const label =
      viewMode === "weekly"
        ? `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString("en-IN", { month: "short" })}`
        : d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([label, count]) => ({ label, count }));
}

function buildPieData(points: SymptomOccurrence[]): { name: "Mild" | "Moderate" | "Severe"; value: number }[] {
  let mild = 0;
  let moderate = 0;
  let severe = 0;
  for (const p of points) {
    if (p.severity === 1) mild += 1;
    else if (p.severity === 2) moderate += 1;
    else severe += 1;
  }
  return [
    { name: "Mild", value: mild },
    { name: "Moderate", value: moderate },
    { name: "Severe", value: severe },
  ];
}

function detectTrendDirection(barData: { label: string; count: number }[]): TrendDirection {
  if (barData.length < 3) return "Stable";
  const values = barData.map((b) => b.count);
  const first = values[0];
  const last = values[values.length - 1];
  const unique = new Set(values).size;
  if (last > first && unique > 1) return "Increasing";
  if (last < first && unique > 1) return "Decreasing";
  const changes = values.slice(1).map((v, i) => v - values[i]);
  const hasPos = changes.some((c) => c > 0);
  const hasNeg = changes.some((c) => c < 0);
  if (hasPos && hasNeg) return "Irregular";
  return "Stable";
}

export function analyzePhaseSymptom(opts: {
  phase: Phase;
  logs: HealthLogs;
  symptomId: KeySymptomId;
  viewMode?: ViewMode;
}): SymptomAnalysisResult {
  const { phase, logs, symptomId, viewMode = "weekly" } = opts;

  const points = getOccurrences(phase, logs, symptomId);
  const count = points.length;
  const trend = getTrendFromCount(count);
  const predictedNext = getPredictedNextPeriodStartISO(phase, logs);
  const occurrenceDays = points.map((p) => p.dateISO);
  const timing = computeTimingCategory({ phase, predictedNextStartISO: predictedNext, occurrenceDays });
  const timingPattern = getTimingPattern(points);
  const barData = buildBarData(points, viewMode);
  const pieData = buildPieData(points);
  const trendDirection = detectTrendDirection(barData);
  const confidence = confidenceFromPoints(points.length);
  const severeShare = points.length ? pieData.find((p) => p.name === "Severe")!.value / points.length : 0;
  const risingRisk = trendDirection === "Increasing" || severeShare >= 0.3 || trend === "Frequent";
  const suggestions = risingRisk ? getSuggestionsForSymptom(symptomId).slice(0, 2) : [];

  return {
    trend,
    timing,
    trendDirection,
    timingPattern,
    confidence,
    insight: buildInsightText({ phase, symptomId, trendDirection, points }),
    prediction: buildPredictionText({
      phase,
      symptomId,
      trend,
      timingPattern,
      points,
    }),
    suggestions,
    showSuggestions: risingRisk,
    showPHC: risingRisk && trend === "Frequent",
    barData,
    pieData,
  };
}

