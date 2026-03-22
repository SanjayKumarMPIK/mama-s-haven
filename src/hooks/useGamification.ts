import { useState, useEffect, useCallback } from "react";
import { DAILY_HABITS, BADGES, getLevel, getNextLevel, getLevelProgress, getDailyNudge, type GamificationStats, type Badge } from "@/lib/gamificationData";

const STORAGE_KEY = "mh-gamification";

interface DayRecord {
  date: string;
  habits: Record<string, boolean>;
}

interface StoredData {
  days: DayRecord[];
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { days: [] };
}

function saveData(data: StoredData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function computeStats(data: StoredData): GamificationStats {
  const habitCounts: Record<string, number> = {};
  let totalHabitsCompleted = 0;
  let perfectDays = 0;

  for (const day of data.days) {
    const completedToday = Object.values(day.habits).filter(Boolean).length;
    totalHabitsCompleted += completedToday;
    if (completedToday >= DAILY_HABITS.length) perfectDays++;
    for (const [hid, done] of Object.entries(day.habits)) {
      if (done) habitCounts[hid] = (habitCounts[hid] || 0) + 1;
    }
  }

  // Calculate streaks — want days where at least 1 habit was done
  const sortedDays = [...data.days]
    .filter((d) => Object.values(d.habits).some(Boolean))
    .sort((a, b) => a.date.localeCompare(b.date));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDays[i - 1].date);
      const curr = new Date(sortedDays[i].date);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Check if the current streak is still active (includes today or yesterday)
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (sortedDays.length > 0) {
    const lastDate = sortedDays[sortedDays.length - 1].date;
    if (lastDate === today || lastDate === yesterday) {
      currentStreak = tempStreak;
    }
  }

  const totalXP = totalHabitsCompleted * 10 + currentStreak * 5;

  return {
    totalDaysTracked: data.days.length,
    currentStreak,
    longestStreak,
    totalXP,
    totalHabitsCompleted,
    perfectDays,
    habitCounts,
  };
}

export function useGamification(language: string) {
  const [data, setData] = useState<StoredData>(loadData);

  useEffect(() => { saveData(data); }, [data]);

  const today = getToday();
  const todayRecord = data.days.find((d) => d.date === today);
  const todayHabits: Record<string, boolean> = todayRecord?.habits || {};

  const toggleHabit = useCallback((habitId: string) => {
    setData((prev) => {
      const days = [...prev.days];
      const idx = days.findIndex((d) => d.date === today);
      if (idx >= 0) {
        days[idx] = {
          ...days[idx],
          habits: { ...days[idx].habits, [habitId]: !days[idx].habits[habitId] },
        };
      } else {
        days.push({ date: today, habits: { [habitId]: true } });
      }
      return { days };
    });
  }, [today]);

  const stats = computeStats(data);
  const level = getLevel(stats.totalXP);
  const nextLevel = getNextLevel(stats.totalXP);
  const levelProgress = getLevelProgress(stats.totalXP);
  const unlockedBadges: Badge[] = BADGES.filter((b) => b.check(stats));
  const lockedBadges: Badge[] = BADGES.filter((b) => !b.check(stats));
  const nudge = getDailyNudge(language);

  // Last 7 days completion percentages
  const last7Days: { date: string; pct: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const rec = data.days.find((day) => day.date === d);
    const completed = rec ? Object.values(rec.habits).filter(Boolean).length : 0;
    last7Days.push({ date: d, pct: Math.round((completed / DAILY_HABITS.length) * 100) });
  }

  const todayCompleted = Object.values(todayHabits).filter(Boolean).length;
  const todayTotal = DAILY_HABITS.length;
  const todayPct = Math.round((todayCompleted / todayTotal) * 100);

  return {
    todayHabits,
    toggleHabit,
    stats,
    level,
    nextLevel,
    levelProgress,
    unlockedBadges,
    lockedBadges,
    nudge,
    last7Days,
    todayCompleted,
    todayTotal,
    todayPct,
  };
}
