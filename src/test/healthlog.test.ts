import { describe, it, expect, vi, beforeEach } from "vitest";
import { calcFertileWindow, calcAverageCycleLength, detectFrequentSymptoms, detectMaternityAlerts } from "@/hooks/useHealthLog";
import type { HealthLogs } from "@/hooks/useHealthLog";

describe("calcFertileWindow", () => {
  it("returns null for invalid cycle length", () => {
    expect(calcFertileWindow("2025-01-01", 5)).toBeNull();
    expect(calcFertileWindow("2025-01-01", 70)).toBeNull();
  });

  it("returns correct ovulation date for 28-day cycle", () => {
    const result = calcFertileWindow("2025-01-01", 28);
    expect(result).not.toBeNull();
    // Ovulation = day 14 after last period
    expect(result!.ovulation).toBe("2025-01-15");
    expect(result!.fertileStart).toBe("2025-01-10");
    expect(result!.fertileEnd).toBe("2025-01-16");
  });

  it("returns null for invalid date", () => {
    expect(calcFertileWindow("not-a-date", 28)).toBeNull();
  });
});

describe("calcAverageCycleLength", () => {
  it("returns null when fewer than 2 tracked start dates", () => {
    const logs: HealthLogs = {
      "2025-01-01": { phase: "puberty", periodStarted: true, periodEnded: false, flowIntensity: null, symptoms: { cramps: false, fatigue: false, moodSwings: false, headache: false, acne: false, breastTenderness: false }, mood: null },
    };
    expect(calcAverageCycleLength(logs)).toBeNull();
  });

  it("calculates average from two period start dates", () => {
    const logs: HealthLogs = {
      "2025-01-01": { phase: "puberty", periodStarted: true, periodEnded: false, flowIntensity: null, symptoms: { cramps: false, fatigue: false, moodSwings: false, headache: false, acne: false, breastTenderness: false }, mood: null },
      "2025-01-29": { phase: "puberty", periodStarted: true, periodEnded: false, flowIntensity: null, symptoms: { cramps: false, fatigue: false, moodSwings: false, headache: false, acne: false, breastTenderness: false }, mood: null },
    };
    expect(calcAverageCycleLength(logs)).toBe(28);
  });
});

describe("detectFrequentSymptoms", () => {
  it("returns empty for non-menopause logs", () => {
    const logs: HealthLogs = {
      "2025-01-01": { phase: "puberty", periodStarted: false, periodEnded: false, flowIntensity: null, symptoms: { cramps: false, fatigue: false, moodSwings: false, headache: false }, mood: null },
    };
    expect(detectFrequentSymptoms(logs)).toEqual([]);
  });

  it("counts and sorts symptom frequency", () => {
    const logs: HealthLogs = {
      "2025-01-01": { phase: "menopause", symptoms: { hotFlashes: true, nightSweats: false, moodSwings: true, jointPain: false, sleepDisturbance: false, fatigue: false }, sleepHours: 6, mood: null },
      "2025-01-02": { phase: "menopause", symptoms: { hotFlashes: true, nightSweats: true, moodSwings: false, jointPain: false, sleepDisturbance: false, fatigue: false }, sleepHours: 7, mood: "Good" },
    };
    const result = detectFrequentSymptoms(logs);
    expect(result[0].symptom).toBe("Hot Flashes");
    expect(result[0].count).toBe(2);
  });
});

describe("detectMaternityAlerts", () => {
  it("flags low sleep entries", () => {
    const logs: HealthLogs = {
      "2025-01-05": { phase: "maternity", fatigueLevel: null, hydrationGlasses: 8, sleepHours: 4, symptoms: { nausea: false, dizziness: false, swelling: false, backPain: false, sleepDisturbance: false }, mood: null },
    };
    const alerts = detectMaternityAlerts(logs);
    expect(alerts.some((a) => a.reason.includes("Low sleep"))).toBe(true);
  });

  it("flags low hydration entries", () => {
    const logs: HealthLogs = {
      "2025-01-06": { phase: "maternity", fatigueLevel: null, hydrationGlasses: 3, sleepHours: 8, symptoms: { nausea: false, dizziness: false, swelling: false, backPain: false, sleepDisturbance: false }, mood: null },
    };
    const alerts = detectMaternityAlerts(logs);
    expect(alerts.some((a) => a.reason.includes("Low hydration"))).toBe(true);
  });
});
