import { useState, useEffect, useCallback } from "react";
import { DAILY_CHECKLIST, ANC_SCHEDULE, MILESTONES } from "@/lib/pregnancyDashboardData";
import type { ANCVisit, Milestone } from "@/lib/pregnancyDashboardData";

// ─── Storage keys ────────────────────────────────────────────────────────────
const CHECKLIST_KEY = "mh-preg-checklist";
const ANC_KEY = "mh-preg-anc";
const MILESTONE_KEY = "mh-preg-milestones";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Checklist persistence ───────────────────────────────────────────────────
interface ChecklistDay {
  date: string;
  items: Record<string, boolean>;
}

interface ChecklistStore {
  days: ChecklistDay[];
}

function loadChecklist(): ChecklistStore {
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { days: [] };
}

function saveChecklist(data: ChecklistStore) {
  try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(data)); } catch {}
}

// ─── ANC persistence ────────────────────────────────────────────────────────
function loadANC(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(ANC_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveANC(data: Record<string, boolean>) {
  try { localStorage.setItem(ANC_KEY, JSON.stringify(data)); } catch {}
}

// ─── Milestone persistence ───────────────────────────────────────────────────
function loadMilestones(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(MILESTONE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveMilestones(data: Record<string, boolean>) {
  try { localStorage.setItem(MILESTONE_KEY, JSON.stringify(data)); } catch {}
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function usePregnancyDashboard(currentWeek: number) {
  // ── Checklist ──────────────────────────────────────────────────────────────
  const [checklistStore, setChecklistStore] = useState<ChecklistStore>(loadChecklist);

  useEffect(() => { saveChecklist(checklistStore); }, [checklistStore]);

  const todayStr = today();
  const todayRecord = checklistStore.days.find((d) => d.date === todayStr);
  const todayItems: Record<string, boolean> = todayRecord?.items || {};

  const toggleChecklistItem = useCallback((itemId: string) => {
    setChecklistStore((prev) => {
      const days = [...prev.days];
      const idx = days.findIndex((d) => d.date === todayStr);
      if (idx >= 0) {
        days[idx] = {
          ...days[idx],
          items: { ...days[idx].items, [itemId]: !days[idx].items[itemId] },
        };
      } else {
        days.push({ date: todayStr, items: { [itemId]: true } });
      }
      return { days };
    });
  }, [todayStr]);

  const checklistCompleted = Object.values(todayItems).filter(Boolean).length;
  const checklistTotal = DAILY_CHECKLIST.length;
  const checklistPct = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

  // Checklist streak (consecutive days with ≥1 item done)
  const sortedDays = [...checklistStore.days]
    .filter((d) => Object.values(d.items).some(Boolean))
    .sort((a, b) => a.date.localeCompare(b.date));

  let checklistStreak = 0;
  for (let i = sortedDays.length - 1; i >= 0; i--) {
    const d = new Date(sortedDays[i].date);
    const expected = new Date(Date.now() - (sortedDays.length - 1 - i) * 86400000);
    const expStr = expected.toISOString().slice(0, 10);
    if (sortedDays[i].date === expStr || sortedDays[i].date === todayStr) {
      checklistStreak++;
    } else {
      break;
    }
  }

  // ── ANC Visits ─────────────────────────────────────────────────────────────
  const [ancCompleted, setAncCompleted] = useState<Record<string, boolean>>(loadANC);

  useEffect(() => { saveANC(ancCompleted); }, [ancCompleted]);

  const toggleANC = useCallback((visitId: string) => {
    setAncCompleted((prev) => ({ ...prev, [visitId]: !prev[visitId] }));
  }, []);

  const ancWithStatus = ANC_SCHEDULE.map((visit) => ({
    ...visit,
    completed: !!ancCompleted[visit.id],
    isPast: currentWeek >= visit.week,
    isCurrent: currentWeek >= visit.week - 2 && currentWeek <= visit.week + 1,
    isUpcoming: currentWeek < visit.week - 2,
  }));

  const nextANC: (ANCVisit & { completed: boolean }) | undefined =
    ancWithStatus.find((v) => !v.completed && currentWeek <= v.week + 2);

  const ancCompletedCount = ancWithStatus.filter((v) => v.completed).length;

  // ── Milestones ─────────────────────────────────────────────────────────────
  const [milestonesDone, setMilestonesDone] = useState<Record<string, boolean>>(loadMilestones);

  useEffect(() => { saveMilestones(milestonesDone); }, [milestonesDone]);

  const toggleMilestone = useCallback((msId: string) => {
    setMilestonesDone((prev) => ({ ...prev, [msId]: !prev[msId] }));
  }, []);

  const milestonesWithStatus = MILESTONES.map((ms) => ({
    ...ms,
    completed: !!milestonesDone[ms.id],
    isActive: currentWeek >= ms.week - 2 && currentWeek <= ms.week + 1 && !milestonesDone[ms.id],
    isPast: currentWeek > ms.week + 1,
    isUpcoming: currentWeek < ms.week - 2,
  }));

  const activeMilestones = milestonesWithStatus.filter((m) => m.isActive);
  const upcomingMilestones = milestonesWithStatus.filter((m) => m.isUpcoming && !m.completed);
  const completedMilestones = milestonesWithStatus.filter((m) => m.completed);

  return {
    // Checklist
    todayItems,
    toggleChecklistItem,
    checklistCompleted,
    checklistTotal,
    checklistPct,
    checklistStreak,
    // ANC
    ancWithStatus,
    toggleANC,
    nextANC,
    ancCompletedCount,
    // Milestones
    milestonesWithStatus,
    activeMilestones,
    upcomingMilestones,
    completedMilestones,
    toggleMilestone,
  };
}
