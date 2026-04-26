export interface HydrationInput {
  weightKg: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  climate: "cool" | "temperate" | "hot-humid";
  phase: "puberty" | "maternity" | "postpartum" | "menopause" | "family-planning";
  signals: {
    fatigueFrequency: number; // 0..1
    headacheFrequency: number; // 0..1
    hydrationLowFrequency: number; // 0..1
  };
}

export interface HydrationResult {
  dailyWaterMl: number;
  dailyWaterLiters: number;
  hydrationStatus: "Low" | "Moderate" | "Good";
}

export function calculateWaterRequirement(input: HydrationInput): HydrationResult {
  const activityAdd: Record<HydrationInput["activityLevel"], number> = {
    sedentary: 150,
    light: 250,
    moderate: 420,
    active: 650,
  };
  const climateAdd: Record<HydrationInput["climate"], number> = {
    cool: 0,
    temperate: 140,
    "hot-humid": 320,
  };
  const phaseAdd: Record<HydrationInput["phase"], number> = {
    puberty: 50,
    maternity: 450,
    postpartum: 380,
    menopause: 220,
    "family-planning": 80,
  };

  const symptomAdd =
    Math.round(input.signals.fatigueFrequency * 180) +
    Math.round(input.signals.headacheFrequency * 170) +
    Math.round(input.signals.hydrationLowFrequency * 260);

  const dailyWaterMl = Math.round(input.weightKg * 35 + activityAdd[input.activityLevel] + climateAdd[input.climate] + phaseAdd[input.phase] + symptomAdd);
  const dailyWaterLiters = Number((dailyWaterMl / 1000).toFixed(1));

  const hydrationRisk = input.signals.hydrationLowFrequency + input.signals.headacheFrequency * 0.6;
  const hydrationStatus: HydrationResult["hydrationStatus"] = hydrationRisk > 0.75 ? "Low" : hydrationRisk > 0.35 ? "Moderate" : "Good";

  return { dailyWaterMl, dailyWaterLiters, hydrationStatus };
}
