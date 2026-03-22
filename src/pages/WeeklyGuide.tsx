import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { WEEK_DATA } from "@/lib/pregnancyData";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import { ChevronLeft, ChevronRight, Baby, Heart, Apple, Droplets, Activity, AlertTriangle, Calendar, Target } from "lucide-react";

export default function WeeklyGuide() {
  const { t, simpleMode } = useLanguage();
  const { profile, saveProfile, currentWeek, daysLeft, trimester, progress } = usePregnancyProfile();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [setupName, setSetupName] = useState(profile.name);
  const [setupDueDate, setSetupDueDate] = useState(profile.dueDate);
  const [setupRegion, setSetupRegion] = useState(profile.region);

  const weekData = WEEK_DATA[selectedWeek - 1];

  const handleSave = () => {
    if (setupDueDate) {
      saveProfile({ name: setupName, dueDate: setupDueDate, region: setupRegion });
    }
  };

  if (!profile.isSetup) {
    return (
      <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
        <div className="container py-16 max-w-lg">
          <ScrollReveal>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">{t("profileSetup")}</h1>
              <p className="mt-2 text-muted-foreground text-sm">{t("enterDueDate")}</p>
            </div>
          </ScrollReveal>
          <div className="space-y-4 bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("name")}</label>
              <input
                type="text"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("dueDate")}</label>
              <input
                type="date"
                value={setupDueDate}
                onChange={(e) => setSetupDueDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("region")}</label>
              <select
                value={setupRegion}
                onChange={(e) => setSetupRegion(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="north">{t("northIndia")}</option>
                <option value="south">{t("southIndia")}</option>
                <option value="east">{t("eastIndia")}</option>
                <option value="west">{t("westIndia")}</option>
              </select>
            </div>
            <button
              onClick={handleSave}
              disabled={!setupDueDate}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-40"
            >
              {t("save")} →
            </button>
          </div>
        </div>
      </main>
    );
  }

  const trimesterLabel = trimester === 1 ? t("firstTrimester") : trimester === 2 ? t("secondTrimester") : t("thirdTrimester");
  const trimesterColor = trimester === 1 ? "text-orange-600 bg-orange-50" : trimester === 2 ? "text-green-600 bg-green-50" : "text-purple-600 bg-purple-50";

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {/* Progress header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-5">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{trimesterLabel}</p>
                <h1 className="text-2xl font-bold mt-1">
                  {t("yourWeek")} {selectedWeek} <span className="text-muted-foreground font-normal text-lg">/ 40</span>
                </h1>
                {profile.name && <p className="text-sm text-muted-foreground mt-0.5">👋 {profile.name}</p>}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{daysLeft}</p>
                  <p className="text-xs text-muted-foreground">{t("daysRemaining")}</p>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${progress}, 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{progress}%</div>
                </div>
              </div>
            </div>
            {/* Progress bar full width */}
            <div className="mt-4 w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Week navigator */}
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
            disabled={selectedWeek <= 1}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium bg-muted hover:bg-muted/80 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <div className="flex items-center gap-1">
            <span className="text-4xl">{weekData?.babySizeEmoji}</span>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t("babySize")}</p>
              <p className="text-sm font-semibold">{weekData?.babySize}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedWeek(Math.min(40, selectedWeek + 1))}
            disabled={selectedWeek >= 40}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium bg-muted hover:bg-muted/80 transition-colors disabled:opacity-30"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick week selector */}
        <div className="mt-3 flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`shrink-0 w-8 h-8 rounded-full text-xs font-medium transition-all duration-150 ${
                w === selectedWeek
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : w === currentWeek
                  ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Week content */}
      {weekData && (
        <div className="container pb-12">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Baby Development */}
            <ScrollReveal>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-lavender flex items-center justify-center">
                    <Baby className="w-4 h-4 text-lavender-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("babySize")} — {weekData.babySize} {weekData.babySizeEmoji}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{weekData.development}</p>
              </div>
            </ScrollReveal>

            {/* Mom Feels */}
            <ScrollReveal delay={80}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-peach flex items-center justify-center">
                    <Heart className="w-4 h-4 text-peach-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("whatMomFeels")}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{weekData.momFeels}</p>
              </div>
            </ScrollReveal>

            {/* Nutrition */}
            <ScrollReveal delay={160}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center">
                    <Apple className="w-4 h-4 text-mint-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("nutritionTips")}</h3>
                </div>
                <ul className="space-y-1.5">
                  {weekData.nutritionTips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Hygiene */}
            <ScrollReveal delay={240}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-baby-blue flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-baby-blue-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("hygieneTips")}</h3>
                </div>
                <ul className="space-y-1.5">
                  {weekData.hygieneTips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Activity */}
            <ScrollReveal delay={320}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center">
                    <Activity className="w-4 h-4 text-mint-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("activityTips")}</h3>
                </div>
                <ul className="space-y-1.5">
                  {weekData.activityTips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Warning Signs */}
            <ScrollReveal delay={400}>
              <div className="rounded-xl border-2 border-red-200 bg-red-50/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-red-800">{t("warningSigns")}</h3>
                </div>
                <ul className="space-y-1.5">
                  {weekData.warningSigns.map((sign, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">⚠</span> {sign}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-red-600 font-medium">{t("visitCenter")}</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}

      <SafetyDisclaimer />
    </main>
  );
}
