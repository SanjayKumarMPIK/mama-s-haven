// ─── Menopause Dashboard Engine ──────────────────────────────────────────────
// Pure logic module — no React imports. Drives the new menopause dashboard.

import type { MenopauseProfile, MenopauseLogEntry, MenopauseStage } from "@/hooks/useMenopause";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WellnessScore {
  score: number;      // 0–100
  label: string;
  color: "emerald" | "amber" | "rose" | "slate";
  insight: string;
  loggedDays: number;
  totalDays: number;
}

export interface TopSymptom {
  id: string;
  label: string;
  emoji: string;
  avgSeverity: number;   // 0–5
  frequency: number;     // days reported
  trend: "up" | "down" | "stable";
}

export interface SleepMoodSummary {
  avgSleep: number;
  sleepTrend: "up" | "down" | "stable";
  avgMood: number;
  moodTrend: "up" | "down" | "stable";
  sleepLabel: string;
  moodLabel: string;
}

export interface DailyGuidanceCard {
  emoji: string;
  headline: string;
  message: string;
  tone: "positive" | "caution" | "info";
}

export interface BoneHealthStatus {
  calciumAdequacy: number;     // 0–100 (% of 1200mg target)
  vitaminDStreak: number;      // consecutive days
  alerts: string[];
  tips: string[];
}

export interface HeartHealthStatus {
  latestBP: { systolic: number; diastolic: number } | null;
  bpCategory: "normal" | "elevated" | "high" | "unknown";
  palpitationFrequency: number;
  alerts: string[];
  tips: string[];
}

export interface WeightStatus {
  bmi: number | null;
  bmiCategory: "underweight" | "normal" | "overweight" | "obese" | "unknown";
  weightTrend: "up" | "down" | "stable" | "unknown";
  latestWeight: number | null;
  tips: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function recentLogs(logs: MenopauseLogEntry[], days: number): MenopauseLogEntry[] {
  const now = new Date();
  return logs.filter((l) => {
    const diff = (now.getTime() - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= days && diff >= 0;
  });
}

function avg(items: MenopauseLogEntry[], fn: (l: MenopauseLogEntry) => number, fallback = 0): number {
  if (items.length === 0) return fallback;
  return items.reduce((s, l) => s + fn(l), 0) / items.length;
}

function trend(curr: number, prev: number, reverse = false): "up" | "down" | "stable" {
  const delta = curr - prev;
  if (Math.abs(delta) < 0.35) return "stable";
  if (reverse) return delta < 0 ? "up" : "down";
  return delta > 0 ? "up" : "down";
}

// ─── Wellness Score ──────────────────────────────────────────────────────────

export function computeMenoWellnessScore(logs: MenopauseLogEntry[], profile: MenopauseProfile | null): WellnessScore {
  const last7 = recentLogs(logs, 7);
  if (last7.length === 0) {
    return { score: 0, label: "Start Logging", color: "slate", insight: "Log your daily symptoms to see your wellness score.", loggedDays: 0, totalDays: 7 };
  }

  const avgSleep = avg(last7, (l) => l.sleepHrs, 7);
  const avgMood = avg(last7, (l) => l.mood, 3);
  const avgHotFlash = avg(last7, (l) => l.hotFlashCount, 0);
  const avgPain = avg(last7, (l) => l.jointPain ?? l.painLevel ?? 0, 0);
  const avgFatigue = avg(last7, (l) => l.fatigue ?? 0, 0);
  const avgAnxiety = avg(last7, (l) => l.anxiety ?? 0, 0);

  // Score components (each 0-1, weighted)
  const sleepScore = Math.min(avgSleep / 8, 1);                    // 8hrs = perfect
  const moodScore = avgMood / 5;                                    // 5 = perfect
  const hotFlashScore = Math.max(0, 1 - avgHotFlash / 8);         // lower is better
  const painScore = Math.max(0, 1 - avgPain / 5);
  const fatigueScore = Math.max(0, 1 - avgFatigue / 5);
  const anxietyScore = Math.max(0, 1 - avgAnxiety / 5);

  const raw = (sleepScore * 25 + moodScore * 20 + hotFlashScore * 20 + painScore * 15 + fatigueScore * 10 + anxietyScore * 10);
  const score = Math.round(Math.min(100, Math.max(0, raw)));

  let label: string;
  let color: WellnessScore["color"];
  let insight: string;

  if (score >= 75) {
    label = "Thriving"; color = "emerald";
    insight = "You're managing beautifully. Keep up your current routine!";
  } else if (score >= 50) {
    label = "Steady"; color = "amber";
    insight = "Some areas need attention. Check your symptoms and sleep patterns.";
  } else {
    label = "Needs Care"; color = "rose";
    insight = "Your body is asking for more support. Focus on sleep and stress relief.";
  }

  return { score, label, color, insight, loggedDays: last7.length, totalDays: 7 };
}

// ─── Top Symptoms This Week ──────────────────────────────────────────────────

const SYMPTOM_MAP: { key: string; field: string; label: string; emoji: string }[] = [
  { key: "hot_flashes", field: "hotFlashCount", label: "Hot flashes", emoji: "🔥" },
  { key: "night_sweats", field: "nightSweats", label: "Night sweats", emoji: "🌙" },
  { key: "joint_pain", field: "jointPain", label: "Joint pain", emoji: "🦴" },
  { key: "fatigue", field: "fatigue", label: "Fatigue", emoji: "🪫" },
  { key: "anxiety", field: "anxiety", label: "Anxiety", emoji: "😰" },
  { key: "headache", field: "headache", label: "Headache", emoji: "🤕" },
  { key: "vaginal_dryness", field: "vaginalDryness", label: "Vaginal dryness", emoji: "💧" },
  { key: "mood_swings", field: "mood", label: "Mood swings", emoji: "🎭" },
  { key: "muscle_stiffness", field: "muscleStiffness", label: "Muscle stiffness", emoji: "💪" },
  { key: "dry_skin", field: "drySkin", label: "Dry skin", emoji: "🧴" },
  { key: "hair_thinning", field: "hairThinning", label: "Hair thinning", emoji: "💇" },
  { key: "palpitations", field: "palpitations", label: "Palpitations", emoji: "💓" },
];

export function getTopSymptomsThisWeek(logs: MenopauseLogEntry[]): TopSymptom[] {
  const last7 = recentLogs(logs, 7);
  const prev7 = recentLogs(logs, 14).filter((l) => !last7.some((x) => x.date === l.date));

  if (last7.length === 0) return [];

  const results: TopSymptom[] = [];

  for (const sym of SYMPTOM_MAP) {
    const values = last7.map((l) => (l as any)[sym.field] ?? 0).filter((v) => v > 0);
    if (values.length === 0) continue;

    const avgSev = values.reduce((s, v) => s + v, 0) / values.length;
    const prevValues = prev7.map((l) => (l as any)[sym.field] ?? 0).filter((v) => v > 0);
    const prevAvg = prevValues.length > 0 ? prevValues.reduce((s, v) => s + v, 0) / prevValues.length : avgSev;

    // For mood, lower = worse, so reverse
    const isMood = sym.key === "mood_swings";

    results.push({
      id: sym.key,
      label: sym.label,
      emoji: sym.emoji,
      avgSeverity: Number(avgSev.toFixed(1)),
      frequency: values.length,
      trend: isMood ? trend(avgSev, prevAvg, true) as any : trend(avgSev, prevAvg) as any,
    });
  }

  // Sort by severity × frequency
  results.sort((a, b) => (b.avgSeverity * b.frequency) - (a.avgSeverity * a.frequency));
  return results.slice(0, 5);
}

// ─── Sleep & Mood Summary ────────────────────────────────────────────────────

export function getSleepMoodSummary(logs: MenopauseLogEntry[]): SleepMoodSummary {
  const last7 = recentLogs(logs, 7);
  const prev7 = recentLogs(logs, 14).filter((l) => !last7.some((x) => x.date === l.date));

  const avgSleep = avg(last7, (l) => l.sleepHrs, 0);
  const prevSleep = avg(prev7, (l) => l.sleepHrs, avgSleep);
  const avgMood = avg(last7, (l) => l.mood, 0);
  const prevMood = avg(prev7, (l) => l.mood, avgMood);

  return {
    avgSleep: Number(avgSleep.toFixed(1)),
    sleepTrend: trend(avgSleep, prevSleep, true),
    avgMood: Number(avgMood.toFixed(1)),
    moodTrend: trend(avgMood, prevMood, true),
    sleepLabel: avgSleep >= 7 ? "Good" : avgSleep >= 5.5 ? "Fair" : "Poor",
    moodLabel: avgMood >= 4 ? "Great" : avgMood >= 3 ? "Okay" : "Low",
  };
}

// ─── Daily Guidance ──────────────────────────────────────────────────────────

export function getDailyGuidance(profile: MenopauseProfile | null, logs: MenopauseLogEntry[]): DailyGuidanceCard {
  const last7 = recentLogs(logs, 7);

  if (last7.length === 0) {
    return { emoji: "📝", headline: "Welcome to your wellness journey", message: "Start logging your symptoms daily to unlock personalized guidance and insights.", tone: "info" };
  }

  const avgSleep = avg(last7, (l) => l.sleepHrs, 7);
  const avgMood = avg(last7, (l) => l.mood, 3);
  const avgHotFlash = avg(last7, (l) => l.hotFlashCount, 0);
  const avgAnxiety = avg(last7, (l) => l.anxiety ?? 0, 0);
  const avgPain = avg(last7, (l) => l.jointPain ?? 0, 0);

  if (avgSleep < 5) {
    return { emoji: "😴", headline: "Your sleep needs attention", message: "You've averaged under 5 hours this week. Try the 4-7-8 breathing technique before bed and keep your room cool.", tone: "caution" };
  }
  if (avgHotFlash >= 4) {
    return { emoji: "🧊", headline: "Hot flash management", message: "Frequent hot flashes detected. Stay hydrated, avoid caffeine and spicy foods, and dress in breathable layers.", tone: "caution" };
  }
  if (avgMood <= 2) {
    return { emoji: "💜", headline: "Be gentle with yourself today", message: "Your mood has been low. Try a short walk, call someone you trust, or do something that brings you joy.", tone: "caution" };
  }
  if (avgAnxiety >= 3) {
    return { emoji: "🫁", headline: "Calm your mind", message: "Anxiety has been elevated. Try deep breathing exercises, limit screen time, and spend 10 minutes in nature.", tone: "info" };
  }
  if (avgPain >= 3) {
    return { emoji: "🦴", headline: "Joint comfort matters", message: "Joint pain has been notable. Gentle stretching, warm compresses, and anti-inflammatory foods can help.", tone: "info" };
  }
  if (avgMood >= 4 && avgSleep >= 7) {
    return { emoji: "✨", headline: "You're doing wonderfully!", message: "Your sleep and mood are great this week. Keep nurturing what's working — you deserve to feel this good!", tone: "positive" };
  }

  return { emoji: "🌿", headline: "Steady progress", message: "Keep logging daily — your patterns are building and we'll personalize your guidance further.", tone: "info" };
}

// ─── Bone Health Status ──────────────────────────────────────────────────────

export function getBoneHealthStatus(logs: MenopauseLogEntry[], profile: MenopauseProfile | null): BoneHealthStatus {
  const last7 = recentLogs(logs, 7);
  const calciumDays = last7.filter((l) => (l as any).calciumMg > 0);
  const avgCalcium = calciumDays.length > 0 ? calciumDays.reduce((s, l) => s + ((l as any).calciumMg ?? 0), 0) / calciumDays.length : 0;
  const calciumAdequacy = Math.min(100, Math.round((avgCalcium / 1200) * 100));

  let vitDStreak = 0;
  const sorted = [...last7].sort((a, b) => b.date.localeCompare(a.date));
  for (const l of sorted) {
    if ((l as any).vitaminDTaken) vitDStreak++;
    else break;
  }

  const alerts: string[] = [];
  const tips: string[] = [
    "Include ragi, sesame seeds, and dairy in your daily meals",
    "15 minutes of morning sunlight helps vitamin D absorption",
    "Weight-bearing exercises strengthen bones",
  ];

  if (profile?.familyHistory?.includes("osteoporosis")) {
    alerts.push("Family history of osteoporosis — prioritize calcium and vitamin D");
  }

  const avgPain = avg(last7, (l) => l.jointPain ?? 0, 0);
  if (avgPain >= 4) {
    alerts.push("Severe joint pain detected — consider consulting a doctor");
  }

  if (profile?.stage === "postmenopause") {
    tips.unshift("A DEXA scan can measure bone density — discuss with your doctor");
  }

  return { calciumAdequacy, vitaminDStreak: vitDStreak, alerts, tips };
}

// ─── Heart Health Status ─────────────────────────────────────────────────────

export function getHeartHealthStatus(logs: MenopauseLogEntry[]): HeartHealthStatus {
  const last7 = recentLogs(logs, 7);
  const bpLogs = last7.filter((l) => (l as any).bpSystolic > 0);
  const palps = last7.filter((l) => (l as any).palpitations > 0);

  let latestBP: { systolic: number; diastolic: number } | null = null;
  let bpCategory: HeartHealthStatus["bpCategory"] = "unknown";

  if (bpLogs.length > 0) {
    const latest = bpLogs.sort((a, b) => b.date.localeCompare(a.date))[0];
    const sys = (latest as any).bpSystolic;
    const dia = (latest as any).bpDiastolic;
    latestBP = { systolic: sys, diastolic: dia };

    if (sys < 120 && dia < 80) bpCategory = "normal";
    else if (sys < 130 && dia < 80) bpCategory = "elevated";
    else bpCategory = "high";
  }

  const palpFreq = palps.length;
  const alerts: string[] = [];
  const tips = [
    "Walk 30 minutes daily for heart health",
    "Reduce sodium and processed foods",
    "Manage stress through breathing exercises",
    "Include omega-3 rich foods in your diet",
  ];

  if (bpCategory === "high") alerts.push("Your blood pressure readings are high — please consult a doctor");
  if (palpFreq >= 3) alerts.push("Frequent palpitations this week — monitor and consult a doctor if persistent");

  return { latestBP, bpCategory, palpitationFrequency: palpFreq, alerts, tips };
}

// ─── Weight Status ───────────────────────────────────────────────────────────

export function getWeightStatus(logs: MenopauseLogEntry[], profile: MenopauseProfile | null, heightCm?: number): WeightStatus {
  const weightLogs = logs.filter((l) => (l as any).weightKg > 0).sort((a, b) => b.date.localeCompare(a.date));

  const latestWeight = weightLogs.length > 0 ? (weightLogs[0] as any).weightKg : null;
  let bmi: number | null = null;
  let bmiCategory: WeightStatus["bmiCategory"] = "unknown";

  if (latestWeight && heightCm && heightCm > 0) {
    const heightM = heightCm / 100;
    bmi = Number((latestWeight / (heightM * heightM)).toFixed(1));
    if (bmi < 18.5) bmiCategory = "underweight";
    else if (bmi < 25) bmiCategory = "normal";
    else if (bmi < 30) bmiCategory = "overweight";
    else bmiCategory = "obese";
  }

  let weightTrend: WeightStatus["weightTrend"] = "unknown";
  if (weightLogs.length >= 2) {
    const recent = (weightLogs[0] as any).weightKg;
    const older = (weightLogs[Math.min(3, weightLogs.length - 1)] as any).weightKg;
    const diff = recent - older;
    if (Math.abs(diff) < 0.5) weightTrend = "stable";
    else weightTrend = diff > 0 ? "up" : "down";
  }

  const tips: string[] = [
    "Focus on strength training to maintain metabolism",
    "Eat protein with every meal to support muscle mass",
    "Stay hydrated — dehydration can mimic hunger",
  ];

  if (bmiCategory === "overweight" || bmiCategory === "obese") {
    tips.unshift("Small, consistent changes work better than drastic diets");
    tips.push("Walk after meals to improve metabolic response");
  }

  return { bmi, bmiCategory, weightTrend, latestWeight, tips };
}

// ─── Wellness Focus Today ────────────────────────────────────────────────────

export interface WellnessFocusAction {
  id: string;
  icon: string;       // emoji
  text: string;
}

export interface WellnessFocusToday {
  hasFocus: boolean;          // true if logs exist
  focusEmoji: string;
  focusTitle: string;         // e.g. "Hot flashes were frequent this week"
  explanation: string;        // safe wording explanation
  actions: WellnessFocusAction[];
  redFlagAlert: string | null;  // consultation warning if red flag detected
  tone: "positive" | "caution" | "info" | "alert";
}

const RED_FLAG_SYMPTOMS: { field: string; threshold: number; label: string }[] = [
  { field: "palpitations", threshold: 4, label: "persistent palpitations" },
];

const FOCUS_PROFILES: {
  key: string;
  field: string;
  threshold: number;
  emoji: string;
  title: (freq: number) => string;
  explanation: string;
  actions: WellnessFocusAction[];
  priority: number;
}[] = [
  {
    key: "hot_flashes",
    field: "hotFlashCount",
    threshold: 2,
    emoji: "🔥",
    priority: 10,
    title: (f) => `Hot flashes appeared on ${f} of the last 7 days`,
    explanation: "This may be linked to hormonal changes, stress, or hydration levels. Cooling strategies can sometimes help manage episodes.",
    actions: [
      { id: "hf1", icon: "💧", text: "Stay hydrated today" },
      { id: "hf2", icon: "🚫", text: "Avoid spicy food and excess caffeine" },
      { id: "hf3", icon: "👕", text: "Wear light, breathable clothing" },
      { id: "hf4", icon: "📝", text: "Track night sweats tonight" },
    ],
  },
  {
    key: "night_sweats",
    field: "nightSweats",
    threshold: 2,
    emoji: "🌙",
    priority: 9,
    title: (f) => `Night sweats were reported on ${f} recent days`,
    explanation: "Night sweats can sometimes happen during menopause transition and may affect sleep quality. Cooling your sleep environment may support better rest.",
    actions: [
      { id: "ns1", icon: "❄️", text: "Keep bedroom cool tonight" },
      { id: "ns2", icon: "💧", text: "Stay hydrated throughout the day" },
      { id: "ns3", icon: "🛏️", text: "Use breathable bedding" },
      { id: "ns4", icon: "📝", text: "Log sleep quality tomorrow" },
    ],
  },
  {
    key: "sleep_issues",
    field: "sleepHrs",
    threshold: -1, // special: check avg < 6
    emoji: "😴",
    priority: 8,
    title: (_f) => "Sleep quality has been low for the past few days",
    explanation: "This may be linked to hormonal changes, stress, or night-time symptoms. A consistent sleep routine may support better rest.",
    actions: [
      { id: "sl1", icon: "🍽️", text: "Keep dinner light tonight" },
      { id: "sl2", icon: "📵", text: "Avoid screen time close to bedtime" },
      { id: "sl3", icon: "🕐", text: "Try a fixed sleep routine" },
      { id: "sl4", icon: "📝", text: "Log sleep quality tomorrow" },
    ],
  },
  {
    key: "mood_swings",
    field: "mood",
    threshold: -1, // special: check avg <= 2
    emoji: "🎭",
    priority: 7,
    title: (_f) => "Mood has been low in recent days",
    explanation: "Mood changes can sometimes happen during menopause and may be linked to hormonal shifts, sleep quality, or daily stress.",
    actions: [
      { id: "md1", icon: "🫁", text: "Try 5 minutes of deep breathing" },
      { id: "md2", icon: "🚶", text: "Take a short walk outdoors" },
      { id: "md3", icon: "☕", text: "Reduce caffeine if anxiety is high" },
      { id: "md4", icon: "📝", text: "Log mood later today" },
    ],
  },
  {
    key: "anxiety",
    field: "anxiety",
    threshold: 2,
    emoji: "😰",
    priority: 7,
    title: (f) => `Anxiety appeared on ${f} of the last 7 days`,
    explanation: "Anxiety may be linked to hormonal changes or sleep disruptions. Gentle calming activities may support emotional balance.",
    actions: [
      { id: "ax1", icon: "🫁", text: "Try 5 minutes of breathing exercises" },
      { id: "ax2", icon: "🚶", text: "Take a short walk" },
      { id: "ax3", icon: "☕", text: "Reduce caffeine intake today" },
      { id: "ax4", icon: "📝", text: "Log mood later today" },
    ],
  },
  {
    key: "fatigue",
    field: "fatigue",
    threshold: 2,
    emoji: "🪫",
    priority: 6,
    title: (f) => `Fatigue was reported on ${f} recent days`,
    explanation: "Fatigue can sometimes happen during menopause transition and may be linked to sleep quality, nutrition, or hormonal changes.",
    actions: [
      { id: "ft1", icon: "🥩", text: "Add protein-rich food today" },
      { id: "ft2", icon: "💤", text: "Take short rest breaks" },
      { id: "ft3", icon: "💧", text: "Drink enough water" },
      { id: "ft4", icon: "🏃", text: "Try gentle movement" },
    ],
  },
  {
    key: "joint_pain",
    field: "jointPain",
    threshold: 2,
    emoji: "🦴",
    priority: 5,
    title: (f) => `Joint pain appears often in your recent logs (${f} days)`,
    explanation: "Joint discomfort may be linked to hormonal changes during menopause. Calcium, sunlight, and gentle exercise may support bone and joint health.",
    actions: [
      { id: "jp1", icon: "🥛", text: "Add calcium-rich food today" },
      { id: "jp2", icon: "☀️", text: "Spend a few minutes in sunlight" },
      { id: "jp3", icon: "🧘", text: "Try gentle stretching" },
      { id: "jp4", icon: "📝", text: "Track pain intensity" },
    ],
  },
  {
    key: "palpitations",
    field: "palpitations",
    threshold: 1,
    emoji: "💓",
    priority: 4,
    title: (f) => `Palpitations were noted on ${f} recent days`,
    explanation: "Occasional palpitations can sometimes happen during menopause. If they are frequent or severe, please consult a healthcare professional.",
    actions: [
      { id: "pp1", icon: "🫁", text: "Try slow deep breathing" },
      { id: "pp2", icon: "☕", text: "Limit caffeine and stimulants" },
      { id: "pp3", icon: "💧", text: "Stay well hydrated" },
      { id: "pp4", icon: "📝", text: "Log intensity if it happens again" },
    ],
  },
  {
    key: "headache",
    field: "headache",
    threshold: 2,
    emoji: "🤕",
    priority: 4,
    title: (f) => `Headaches appeared on ${f} of the last 7 days`,
    explanation: "Headaches may be linked to hormonal fluctuations, dehydration, or stress during menopause transition.",
    actions: [
      { id: "hd1", icon: "💧", text: "Drink enough water today" },
      { id: "hd2", icon: "😌", text: "Take short breaks from screens" },
      { id: "hd3", icon: "🧘", text: "Try a neck and shoulder stretch" },
      { id: "hd4", icon: "📝", text: "Note headache triggers today" },
    ],
  },
];

export function getWellnessFocusToday(
  logs: MenopauseLogEntry[],
  profile: MenopauseProfile | null,
): WellnessFocusToday {
  const last7 = recentLogs(logs, 7);

  // ── Fallback: no logs ──────────────────────────────────────────────
  if (last7.length === 0) {
    return {
      hasFocus: false,
      focusEmoji: "📝",
      focusTitle: "Start logging symptoms to receive personalized menopause guidance",
      explanation: "Once you begin tracking, we'll analyze your patterns and suggest daily wellness actions tailored to you.",
      actions: [
        { id: "fb1", icon: "📊", text: "Track one symptom today" },
        { id: "fb2", icon: "😴", text: "Log sleep quality" },
        { id: "fb3", icon: "💧", text: "Drink enough water" },
        { id: "fb4", icon: "🥛", text: "Add calcium-rich food today" },
      ],
      redFlagAlert: null,
      tone: "info",
    };
  }

  // ── Red flag detection ─────────────────────────────────────────────
  let redFlagAlert: string | null = null;
  // Check for red flag symptoms in the most recent log
  const latest = [...last7].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (latest) {
    const severity = latest.severity;
    const symptoms = latest.symptoms || [];
    const hasSeverePalp = (latest.palpitations ?? 0) >= 5 || latest.palpitationSeverity === "severe";
    const hasSevereSymptom = severity === "severe" && (
      symptoms.includes("palpitations") || hasSeverePalp
    );

    if (hasSevereSymptom || hasSeverePalp) {
      redFlagAlert = "Please consult a healthcare professional or visit the nearest health center.";
    }
  }

  // ── Detect dominant focus ──────────────────────────────────────────
  type Candidate = { profile: typeof FOCUS_PROFILES[0]; freq: number; score: number };
  const candidates: Candidate[] = [];

  for (const fp of FOCUS_PROFILES) {
    if (fp.key === "sleep_issues") {
      // Special: average sleep < 6
      const avgSleep = last7.reduce((s, l) => s + l.sleepHrs, 0) / last7.length;
      if (avgSleep < 6) {
        candidates.push({ profile: fp, freq: last7.length, score: fp.priority * last7.length * (6 - avgSleep) });
      }
    } else if (fp.key === "mood_swings") {
      // Special: average mood <= 2
      const avgMood = last7.reduce((s, l) => s + l.mood, 0) / last7.length;
      if (avgMood <= 2.5) {
        candidates.push({ profile: fp, freq: last7.length, score: fp.priority * last7.length * (3 - avgMood) });
      }
    } else {
      const values = last7.map((l) => (l as any)[fp.field] ?? 0).filter((v) => v > 0);
      if (values.length >= fp.threshold) {
        const avgSev = values.reduce((s, v) => s + v, 0) / values.length;
        candidates.push({ profile: fp, freq: values.length, score: fp.priority * values.length * avgSev });
      }
    }
  }

  // Sort by composite score
  candidates.sort((a, b) => b.score - a.score);

  // ── Positive state: everything looks good ──────────────────────────
  if (candidates.length === 0) {
    return {
      hasFocus: true,
      focusEmoji: "✨",
      focusTitle: "You're doing great this week!",
      explanation: "Your recent logs show good balance. Keep nurturing your current routine — small consistent steps matter most.",
      actions: [
        { id: "pos1", icon: "📝", text: "Log today's symptoms" },
        { id: "pos2", icon: "🥛", text: "Include calcium-rich food" },
        { id: "pos3", icon: "🚶", text: "Take a 15-minute walk" },
      ],
      redFlagAlert,
      tone: "positive",
    };
  }

  // ── Build focus card from top candidate ────────────────────────────
  const top = candidates[0];

  return {
    hasFocus: true,
    focusEmoji: top.profile.emoji,
    focusTitle: top.profile.title(top.freq),
    explanation: top.profile.explanation,
    actions: top.profile.actions,
    redFlagAlert,
    tone: redFlagAlert ? "alert" : "caution",
  };
}

// ─── Mini Trends ─────────────────────────────────────────────────────────────

export interface MiniTrend {
  key: string;
  label: string;
  emoji: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "stable";
  trendGood: boolean;
  insight: string;
  color: string;
}

export function getMiniTrends(logs: MenopauseLogEntry[], _profile: MenopauseProfile | null): MiniTrend[] {
  const last7 = recentLogs(logs, 7);
  const prev7 = recentLogs(logs, 14).filter((l) => !last7.some((x) => x.date === l.date));
  if (last7.length === 0) return [];

  const trends: MiniTrend[] = [];

  const avgSleep = avg(last7, (l) => l.sleepHrs, 0);
  const prevSleep = avg(prev7, (l) => l.sleepHrs, avgSleep);
  trends.push({
    key: "sleep", label: "Sleep", emoji: "😴",
    value: avgSleep.toFixed(1), unit: "h avg",
    trend: trend(avgSleep, prevSleep),
    trendGood: avgSleep >= prevSleep,
    insight: avgSleep >= 7 ? "Good" : avgSleep >= 5.5 ? "Fair" : "Low",
    color: "indigo",
  });

  const avgMood = avg(last7, (l) => l.mood, 0);
  const prevMood = avg(prev7, (l) => l.mood, avgMood);
  trends.push({
    key: "mood", label: "Mood", emoji: "🎭",
    value: avgMood.toFixed(1), unit: "/5",
    trend: trend(avgMood, prevMood),
    trendGood: avgMood >= prevMood,
    insight: avgMood >= 4 ? "Great" : avgMood >= 3 ? "Stable" : "Low",
    color: "purple",
  });

  const avgEnergy = avg(last7, (l) => l.energyLevel ?? l.mood, 0);
  const prevEnergy = avg(prev7, (l) => l.energyLevel ?? l.mood, avgEnergy);
  trends.push({
    key: "energy", label: "Energy", emoji: "⚡",
    value: avgEnergy.toFixed(1), unit: "/5",
    trend: trend(avgEnergy, prevEnergy),
    trendGood: avgEnergy >= prevEnergy,
    insight: avgEnergy >= 4 ? "Good" : avgEnergy >= 3 ? "Fair" : "Low",
    color: "amber",
  });

  const avgHF = avg(last7, (l) => l.hotFlashCount, 0);
  const prevHF = avg(prev7, (l) => l.hotFlashCount, avgHF);
  if (avgHF > 0 || prevHF > 0) {
    trends.push({
      key: "hot_flashes", label: "Hot Flashes", emoji: "🔥",
      value: avgHF.toFixed(1), unit: "/day",
      trend: trend(avgHF, prevHF),
      trendGood: avgHF <= prevHF,
      insight: avgHF <= 1 ? "Mild" : avgHF <= 3 ? "Moderate" : "Frequent",
      color: "rose",
    });
  }

  const weightLogs = last7.filter((l) => (l as any).weightKg > 0);
  if (weightLogs.length > 0) {
    const latest = (weightLogs.sort((a, b) => b.date.localeCompare(a.date))[0] as any).weightKg;
    const prevWL = prev7.filter((l) => (l as any).weightKg > 0);
    const prevW = prevWL.length > 0 ? (prevWL.sort((a, b) => b.date.localeCompare(a.date))[0] as any).weightKg : latest;
    const diff = latest - prevW;
    trends.push({
      key: "weight", label: "Weight", emoji: "⚖️",
      value: latest.toFixed(1), unit: "kg",
      trend: Math.abs(diff) < 0.5 ? "stable" : diff > 0 ? "up" : "down",
      trendGood: Math.abs(diff) < 0.5,
      insight: Math.abs(diff) < 0.5 ? "Stable" : diff > 0 ? "Gaining" : "Losing",
      color: "blue",
    });
  }

  return trends;
}
