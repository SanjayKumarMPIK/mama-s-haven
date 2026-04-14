import React from "react";
import { 
  Baby, 
  Activity, 
  ThermometerSun, 
  Apple, 
  HeartHandshake, 
  AlertOctagon 
} from "lucide-react";
import { type WeekData } from "./data";
import { cn } from "@/lib/utils";

interface WeekDetailsCardProps {
  data: WeekData;
  userSymptoms?: string[];
}

export function WeekDetailsCard({ data, userSymptoms = [] }: WeekDetailsCardProps) {
  
  const getTrimesterColors = (tri: 1 | 2 | 3) => {
    switch(tri) {
      case 1: return { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500", border: "border-emerald-100" };
      case 2: return { bg: "bg-amber-50", text: "text-amber-700", icon: "text-amber-500", border: "border-amber-100" };
      case 3: return { bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-500", border: "border-purple-100" };
    }
  };

  const theme = getTrimesterColors(data.trimester);

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={cn("rounded-3xl p-6 md:p-8 border", theme.border, theme.bg, "flex items-center gap-4")}>
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
          <Baby className={cn("w-8 h-8", theme.icon)} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{data.title}</h2>
          <p className={cn("font-semibold text-sm uppercase tracking-wider", theme.text)}>
            Trimester {data.trimester}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Baby Development */}
        <div className="bg-white rounded-3xl p-6 border border-border/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Baby className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-900">Baby Development</h3>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <p className="text-sm font-medium text-blue-800">
              <span className="font-bold">Size:</span> {data.babyDev.size}
            </p>
          </div>
          <ul className="space-y-2">
            {data.babyDev.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                <span className="text-blue-400 mt-1 shrink-0">•</span> {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Mother Changes */}
        <div className="bg-white rounded-3xl p-6 border border-border/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900">Your Body & Mind</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase text-indigo-400 tracking-wider mb-2">Physical</p>
              <ul className="space-y-1">
                {data.motherChanges.physical.map((p, i) => (
                  <li key={i} className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>{p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-indigo-400 tracking-wider mb-2">Emotional</p>
              <ul className="space-y-1">
                {data.motherChanges.emotional.map((e, i) => (
                  <li key={i} className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>{e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div className="bg-white rounded-3xl p-6 border border-border/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <ThermometerSun className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-slate-900">Common Symptoms</h3>
          </div>
          <div className="space-y-3">
            {data.symptoms.map((s, i) => {
              const isHigh = s.intensity === 'high';
              const isMedium = s.intensity === 'medium';
              // Simulate smart behavior check: if user naturally logged this symptom recently
              const isHighlighted = userSymptoms.some(userSym => userSym.toLowerCase().includes(s.name.toLowerCase()));
              
              return (
                <div key={i} className={cn(
                  "flex items-center justify-between p-3 rounded-xl border",
                  isHighlighted ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-100"
                )}>
                  <span className={cn("text-sm font-semibold", isHighlighted ? "text-orange-900" : "text-slate-700")}>
                    {s.name} {isHighlighted && "✨"}
                  </span>
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                    isHigh ? "bg-rose-100 text-rose-600" : isMedium ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {s.intensity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Care & Nutrition */}
        <div className="bg-white rounded-3xl p-6 border border-border/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <HeartHandshake className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-slate-900">Care & Nutrition</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-slate-400">
                <HeartHandshake className="w-3 h-3" /> Care Tips
              </p>
              <ul className="space-y-1.5">
                {data.careTips.map((tip, i) => (
                  <li key={i} className="text-sm text-slate-600 font-medium flex items-start gap-2">
                    <span className="text-pink-400 mt-1">•</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-slate-400">
                <Apple className="w-3 h-3" /> Nutrition Focus
              </p>
              <ul className="space-y-1.5">
                {data.nutritionFocus.map((n, i) => (
                  <li key={i} className="text-sm text-slate-600 font-medium flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>{n}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Red Flags */}
        <div className="md:col-span-2 bg-rose-50 rounded-3xl p-6 border border-rose-100">
          <div className="flex items-center gap-2 mb-3 text-rose-600">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="font-bold">Red Flags: When to call a doctor</h3>
          </div>
          <ul className="grid sm:grid-cols-2 gap-2 mt-4">
            {data.redFlags.map((flag, i) => (
              <li key={i} className="text-sm font-medium text-rose-800 bg-white/60 p-3 rounded-lg border border-rose-200/50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
