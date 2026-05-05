import { addDays } from "date-fns";
import {
  resolveMaternityLifecycle,
  type MaternityLifecycleState,
  type MaternityProfile,
} from "@/lib/maternityLifecycleResolver";
import { getTrimester } from "@/lib/pregnancyData";

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Strip time for stable calendar-day comparisons */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Gestational week (1–40) from EDD as of `refDate` (defaults to pregnancyData semantics when ref is “today”).
 */
export function getGestationalWeekAtRef(dueDateIso: string, refDate: Date): number {
  const due = new Date(dueDateIso + "T12:00:00");
  const ref = startOfDay(refDate);
  const totalDays = 280;
  const daysLeft = Math.ceil((due.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = totalDays - daysLeft;
  return Math.max(1, Math.min(40, Math.ceil(daysPassed / 7)));
}

/** Completed weeks since `sinceIso` (YYYY-MM-DD), minimum 1 */
export function getCompletedWeeksSince(sinceIso: string, refDate: Date = new Date()): number {
  const start = new Date(sinceIso + "T12:00:00");
  const ref = startOfDay(refDate);
  const diffMs = ref.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
}

/**
 * Single LMP-based phase resolution (EDD = LMP + 280 days).
 * `phase` is clinical pregnancy vs post-birth / post-dates; premature is folded into `postpartum` here — use
 * `resolveMaternityLifecycle` when you need the `"premature"` distinction.
 */
export function resolveMaternalPhase(
  lmpDate: Date,
  refDate: Date = new Date(),
  delivery?: MaternityProfile["delivery"],
): {
  phase: "pregnancy" | "postpartum";
  trimester?: 1 | 2 | 3;
  postpartumWeek?: number;
  lifecycle: MaternityLifecycleState;
} {
  const lmpStart = startOfDay(lmpDate);
  const edd = addDays(lmpStart, 280);
  const eddIso = toIsoDate(edd);
  const lmpIso = toIsoDate(lmpStart);

  const lifecycle = resolveMaternityLifecycle({
    activeEDD: eddIso,
    lmp: lmpIso,
    delivery,
    pregnancyActive: true,
  });

  if (lifecycle === "pregnancy") {
    const gw = getGestationalWeekAtRef(eddIso, refDate);
    return {
      phase: "pregnancy",
      trimester: getTrimester(gw),
      lifecycle,
    };
  }

  if (lifecycle === "none") {
    return { phase: "pregnancy", trimester: 1, lifecycle };
  }

  let postpartumWeek = 1;
  if (delivery?.isDelivered && delivery.birthDate) {
    postpartumWeek = getCompletedWeeksSince(delivery.birthDate, refDate);
  } else {
    postpartumWeek = getCompletedWeeksSince(eddIso, refDate);
  }

  return {
    phase: "postpartum",
    postpartumWeek,
    lifecycle,
  };
}

/** Minimal profile slice — avoids coupling this lib to the full hook module graph */
export type MaternityLifecycleProfileInput = {
  isSetup: boolean;
  lmp: string;
  calculatedEDD: string;
  delivery: {
    isDelivered: boolean;
    birthDate: string;
    weeksAtBirth: number;
  };
};

/** Shared input for `resolveMaternityLifecycle` from app profile + effective EDD */
export function toMaternityLifecycleProfile(
  profile: MaternityLifecycleProfileInput,
  activeEDD: string,
): MaternityProfile {
  return {
    activeEDD: activeEDD || profile.calculatedEDD || null,
    lmp: profile.lmp || null,
    delivery: profile.delivery?.isDelivered
      ? {
          isDelivered: true,
          birthDate: profile.delivery.birthDate,
          weeksAtBirth: profile.delivery.weeksAtBirth,
        }
      : undefined,
    pregnancyActive: profile.isSetup && !!(activeEDD || profile.calculatedEDD),
  };
}
