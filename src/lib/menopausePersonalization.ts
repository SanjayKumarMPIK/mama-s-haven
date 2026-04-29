import type { MenopauseLogEntry, MenopauseProfile } from "@/hooks/useMenopause";

export type Trend = "improving" | "worsening" | "stable";

export interface MenopauseUserContext extends MenopauseProfile {
  avgHotFlash: number;
  avgNightSweats: number;
  avgJointPain: number;
  avgHeadache: number;
  avgAnxiety: number;
  avgVaginalDryness: number;
  avgMood: number;
  avgSleep: number;
  avgFatigue: number;
  hotFlashTrend: Trend;
  nightSweatTrend: Trend;
  jointPainTrend: Trend;
  headacheTrend: Trend;
  anxietyTrend: Trend;
  moodTrend: Trend;
  sleepTrend: Trend;
  fatigueTrend: Trend;
}

function toDay(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

function getRecentLogs(logs: MenopauseLogEntry[], days: number): MenopauseLogEntry[] {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return logs.filter((l) => {
    const d = toDay(l.date);
    return d >= start && d <= end;
  });
}

function avg(items: MenopauseLogEntry[], selector: (l: MenopauseLogEntry) => number, fallback = 0): number {
  if (items.length === 0) return fallback;
  return Number((items.reduce((sum, item) => sum + selector(item), 0) / items.length).toFixed(2));
}

function trend(curr: number, prev: number, reverse = false): Trend {
  const delta = curr - prev;
  if (Math.abs(delta) < 0.35) return "stable";
  if (reverse) return delta < 0 ? "improving" : "worsening";
  return delta > 0 ? "worsening" : "improving";
}

export function buildMenopauseUserContext(profile: MenopauseProfile, logs: MenopauseLogEntry[]): MenopauseUserContext {
  const logs14 = getRecentLogs(logs, 14);
  const logs7 = getRecentLogs(logs, 7);
  const prev7 = logs14.filter((l) => !logs7.some((x) => x.date === l.date));

  const avgHotFlash = avg(logs14, (l) => l.hotFlashCount, 0);
  const avgNightSweats = avg(logs14, (l) => l.nightSweats ?? 0, 0);
  const avgJointPain = avg(logs14, (l) => l.jointPain ?? l.painLevel ?? 0, 0);
  const avgHeadache = avg(logs14, (l) => l.headache ?? 0, 0);
  const avgAnxiety = avg(logs14, (l) => l.anxiety ?? 0, 0);
  const avgVaginalDryness = avg(logs14, (l) => l.vaginalDryness ?? 0, 0);
  const avgMood = avg(logs14, (l) => l.mood, 3);
  const avgSleep = avg(logs14, (l) => l.sleepHrs, 7);
  const avgFatigue = avg(logs14, (l) => l.fatigue ?? 0, 0);

  const cHot = avg(logs7, (l) => l.hotFlashCount, 0);
  const pHot = avg(prev7, (l) => l.hotFlashCount, cHot);
  const cNight = avg(logs7, (l) => l.nightSweats ?? 0, 0);
  const pNight = avg(prev7, (l) => l.nightSweats ?? 0, cNight);
  const cJoint = avg(logs7, (l) => l.jointPain ?? l.painLevel ?? 0, 0);
  const pJoint = avg(prev7, (l) => l.jointPain ?? l.painLevel ?? 0, cJoint);
  const cHead = avg(logs7, (l) => l.headache ?? 0, 0);
  const pHead = avg(prev7, (l) => l.headache ?? 0, cHead);
  const cAnx = avg(logs7, (l) => l.anxiety ?? 0, 0);
  const pAnx = avg(prev7, (l) => l.anxiety ?? 0, cAnx);
  const cMood = avg(logs7, (l) => l.mood, 3);
  const pMood = avg(prev7, (l) => l.mood, cMood);
  const cSleep = avg(logs7, (l) => l.sleepHrs, 7);
  const pSleep = avg(prev7, (l) => l.sleepHrs, cSleep);
  const cFat = avg(logs7, (l) => l.fatigue ?? 0, 0);
  const pFat = avg(prev7, (l) => l.fatigue ?? 0, cFat);

  return {
    ...profile,
    avgHotFlash,
    avgNightSweats,
    avgJointPain,
    avgHeadache,
    avgAnxiety,
    avgVaginalDryness,
    avgMood,
    avgSleep,
    avgFatigue,
    hotFlashTrend: trend(cHot, pHot),
    nightSweatTrend: trend(cNight, pNight),
    jointPainTrend: trend(cJoint, pJoint),
    headacheTrend: trend(cHead, pHead),
    anxietyTrend: trend(cAnx, pAnx),
    moodTrend: trend(cMood, pMood, true),
    sleepTrend: trend(cSleep, pSleep, true),
    fatigueTrend: trend(cFat, pFat),
  };
}
