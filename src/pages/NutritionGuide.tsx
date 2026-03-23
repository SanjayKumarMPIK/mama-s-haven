import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { NUTRITION_DATA, type Region } from "@/lib/nutritionData";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import { Apple, Coffee, Moon, Sun, Cookie, XCircle, Sparkles, MapPin } from "lucide-react";

const mealIcons = { breakfast: Sun, lunch: Coffee, dinner: Moon, snacks: Cookie };

export default function NutritionGuide() {
  const { t, simpleMode } = useLanguage();
  const { phase, phaseName, phaseEmoji } = usePhase();
  const { profile, trimester } = usePregnancyProfile();
  const [region, setRegion] = useState<Region>(profile.region || "south");
  const [selTrimester, setSelTrimester] = useState<1 | 2 | 3>(trimester);

  const data = NUTRITION_DATA[region];
  const meals = selTrimester === 1 ? data.trimester1 : selTrimester === 2 ? data.trimester2 : data.trimester3;

  const pubertyTips = [
    "Iron + vitamin C: lemon with dal, amla with meals.",
    "Cooked greens (spinach, methi) most days; limit tea with meals (reduces iron uptake).",
    "Protein: eggs, chana, milk — supports growth and energy.",
    "Hydration: plain water + buttermilk; reduce sugary drinks.",
  ];

  const planningTips = [
    "Folate-first: leafy greens, citrus, fortified grains (as advised).",
    "Zinc & healthy fats: nuts, seeds, fish (if you eat non-veg).",
    "Cut back ultra-processed snacks; keep blood sugar steadier.",
    "Partners: shared meals make new habits easier before pregnancy.",
  ];

  const regions: { val: Region; label: string; emoji: string }[] = [
    { val: "north", label: t("northIndia"), emoji: "🏔️" },
    { val: "south", label: t("southIndia"), emoji: "🌴" },
    { val: "east", label: t("eastIndia"), emoji: "🌿" },
    { val: "west", label: t("westIndia"), emoji: "🏖️" },
  ];

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-mint flex items-center justify-center">
                <Apple className="w-5 h-5 text-mint-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t("nutritionGuide")}</h1>
                <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
                <p className="mt-2 text-xs inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
                  <span>{phaseEmoji}</span>
                  <span>
                    Personalised for: <strong>{phaseName}</strong>
                  </span>
                </p>
              </div>
            </div>

            {phase !== "maternity" && (
              <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                {phase === "puberty" && (
                  <>
                    <p className="font-semibold text-foreground">Iron-rich focus</p>
                    <ul className="mt-2 space-y-1.5 text-muted-foreground">
                      {pubertyTips.map((line, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary">✦</span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {phase === "family-planning" && (
                  <>
                    <p className="font-semibold text-foreground">Fertility-support nutrition</p>
                    <ul className="mt-2 space-y-1.5 text-muted-foreground">
                      {planningTips.map((line, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary">✦</span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* Region selector */}
            {phase === "maternity" && (
            <div className="flex flex-wrap gap-2 mb-4">
              {regions.map((r) => (
                <button
                  key={r.val}
                  onClick={() => setRegion(r.val)}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
                    region === r.val
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <span>{r.emoji}</span> {r.label}
                </button>
              ))}
            </div>
            )}

            {/* Trimester selector */}
            {phase === "maternity" && (
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((tr) => (
                <button
                  key={tr}
                  onClick={() => setSelTrimester(tr)}
                  className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                    selTrimester === tr
                      ? tr === 1 ? "bg-orange-100 text-orange-700" : tr === 2 ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tr === 1 ? t("firstTrimester") : tr === 2 ? t("secondTrimester") : t("thirdTrimester")}
                </button>
              ))}
            </div>
            )}
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-8">
        {phase !== "maternity" ? (
          <ScrollReveal>
            <p className="text-sm text-muted-foreground max-w-xl">
              Switch to <strong>Maternity</strong> in your life-stage settings for trimester meal plans and region-specific pregnancy foods.
            </p>
          </ScrollReveal>
        ) : (
        <>
        {/* Meal cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {(["breakfast", "lunch", "dinner", "snacks"] as const).map((meal, idx) => {
            const Icon = mealIcons[meal];
            const colors = [
              "bg-amber-50 border-amber-100",
              "bg-green-50 border-green-100",
              "bg-indigo-50 border-indigo-100",
              "bg-pink-50 border-pink-100",
            ];
            return (
              <ScrollReveal key={meal} delay={idx * 100}>
                <div className={`rounded-xl border p-5 shadow-sm ${colors[idx]}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold">{t(meal)}</h3>
                  </div>
                  <ul className="space-y-2">
                    {meals[meal].map((item, i) => (
                      <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                        <span className="text-primary shrink-0 mt-0.5">✦</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Foods to avoid */}
        <ScrollReveal delay={400}>
          <div className="mt-8 rounded-xl border-2 border-red-200 bg-red-50/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-red-800">{t("foodsToAvoid")}</h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.foodsToAvoid.map((food, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="text-red-400 mt-0.5">✕</span> {food}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Cultural notes */}
        <ScrollReveal delay={500}>
          <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{t("culturalNotes")}</h3>
            </div>
            <ul className="space-y-2">
              {data.culturalNotes.map((note, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
        </>
        )}
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
