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
