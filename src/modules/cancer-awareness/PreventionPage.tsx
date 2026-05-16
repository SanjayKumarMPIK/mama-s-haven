import { Activity, Apple, Moon, Ban, Scale, Baby } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import CancerAwarenessLayout from "./CancerAwarenessLayout";
import { PREVENTION_CONTENT } from "./cancerAwarenessContent";

const iconMap: Record<string, typeof Activity> = {
  Activity,
  Apple,
  Moon,
  Ban,
  Scale,
  Baby,
};

const colorMap: Record<string, { gradient: string; border: string; bg: string }> = {
  "Regular Exercise": {
    gradient: "from-emerald-500 to-teal-600",
    border: "border-emerald-200/60",
    bg: "bg-emerald-50",
  },
  "Healthy Diet": {
    gradient: "from-green-500 to-emerald-600",
    border: "border-green-200/60",
    bg: "bg-green-50",
  },
  "Quality Sleep": {
    gradient: "from-indigo-500 to-purple-600",
    border: "border-indigo-200/60",
    bg: "bg-indigo-50",
  },
  "Avoid Smoking & Limit Alcohol": {
    gradient: "from-red-500 to-rose-600",
    border: "border-red-200/60",
    bg: "bg-red-50",
  },
  "Maintain Healthy Weight": {
    gradient: "from-blue-500 to-sky-600",
    border: "border-blue-200/60",
    bg: "bg-blue-50",
  },
  "Breastfeeding Benefits": {
    gradient: "from-pink-500 to-rose-600",
    border: "border-pink-200/60",
    bg: "bg-pink-50",
  },
};

export default function PreventionPage() {
  return (
    <CancerAwarenessLayout
      title="Lifestyle Prevention"
      subtitle="Empower yourself with lifestyle choices that can reduce your cancer risk. Small daily habits make a lasting difference."
    >
      <div className="space-y-6">
        {PREVENTION_CONTENT.map((item, index) => {
          const IconComponent = iconMap[item.icon] || Activity;
          const colors = colorMap[item.title] || {
            gradient: "from-emerald-500 to-teal-600",
            border: "border-emerald-200/60",
            bg: "bg-emerald-50",
          };

          return (
            <ScrollReveal key={index} delay={index * 70}>
              <div
                className={cn(
                  "rounded-xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md",
                  colors.border,
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shadow-md shrink-0",
                      `bg-gradient-to-br ${colors.gradient}`,
                    )}
                  >
                    {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.description}</p>
                    <ul className="space-y-2">
                      {item.tips.map((tip, tipIdx) => (
                        <li key={tipIdx} className="flex items-start gap-2">
                          <span className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0", colors.bg.replace("bg-", "bg-").replace("-50", "-500"))} />
                          <span className="text-sm text-gray-600 leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </CancerAwarenessLayout>
  );
}
