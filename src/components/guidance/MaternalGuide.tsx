import React, { useState, useEffect } from "react";
import { Timeline } from "./MaternalGuide/Timeline";
import { WeekDetailsCard } from "./MaternalGuide/WeekDetailsCard";
import { timelineData } from "./MaternalGuide/data";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import { Sparkles } from "lucide-react";

export default function MaternalGuide() {
  const { currentWeek, profile } = usePregnancyProfile();
  
  // Default to week 1 if no profile, otherwise to currentWeek
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek && currentWeek <= 40 ? currentWeek : 1);

  // Sync selectedWeek if currentWeek changes on load
  useEffect(() => {
    if (currentWeek && currentWeek <= 40 && selectedWeek === 1) {
      setSelectedWeek(currentWeek);
    }
  }, [currentWeek, selectedWeek]);

  const selectedData = timelineData.find(d => d.week === selectedWeek) || timelineData[0];

  // Dummy user symptoms that might be grabbed from health logs in a real app
  const userSymptoms = ["Nausea", "Fatigue"];

  return (
    <main className="min-h-screen bg-[#fafafa]">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white border-b border-border/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] -mr-32 -mt-32 opacity-60" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100 rounded-full blur-[80px] -ml-32 -mb-32 opacity-60" />
        
        <div className="container relative py-12 md:py-16">
          <ScrollReveal>
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-100">
                <Sparkles className="w-3.5 h-3.5" /> Maternal Guide
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Your Weekly Pregnancy Journey
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {profile.isSetup && profile.name 
                  ? `Welcome back, ${profile.name}! You are on Week ${currentWeek} of your journey.` 
                  : "Navigate the beautiful changes of pregnancy week by week. Track baby's growth and understand what's happening to your body."}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        <ScrollReveal delay={100}>
          <Timeline 
            weeks={timelineData} 
            selectedWeek={selectedWeek}
            currentRealWeek={currentWeek && currentWeek <= 40 ? currentWeek : 0}
            onSelectWeek={setSelectedWeek}
          />
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <WeekDetailsCard 
            data={selectedData} 
            userSymptoms={userSymptoms} 
          />
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
