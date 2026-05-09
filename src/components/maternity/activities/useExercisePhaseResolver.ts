import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import type { DatasetMaternityStage } from "./SchedulerUtils";

/**
 * A centralized resolver for the Maternity Exercise module.
 * 
 * Ensures that if a user is in the Postpartum or Premature mode, 
 * they are strictly locked to that stage and do not receive stale 
 * Trimester recommendations due to cached or default gestational weeks.
 */
export function useExercisePhaseResolver(): DatasetMaternityStage {
  const { mode, gestationalWeek } = usePregnancyProfile();

  if (mode === "postpartum") {
    return "Postpartum";
  }

  if (mode === "premature") {
    return "Premature Stage";
  }

  // mode === "pregnancy"
  // Dynamically calculate trimester based on gestationalWeek to prevent stale caching
  if (gestationalWeek <= 13) {
    return "Trimester 1";
  } else if (gestationalWeek <= 27) {
    return "Trimester 2";
  } else {
    return "Trimester 3";
  }
}
