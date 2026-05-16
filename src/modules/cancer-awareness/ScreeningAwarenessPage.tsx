import { Heart, Search, Shield } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import CancerAwarenessLayout from "./CancerAwarenessLayout";
import { SCREENING_CONTENT } from "./cancerAwarenessContent";

const iconMap: Record<string, typeof Heart> = {
  Heart,
  Search,
  Shield,
};

const colorConfig: Record<string, { gradient: string; border: string; iconBg: string }> = {
  "Self-Awareness": {
    gradient: "from-rose-500 to-pink-600",
    border: "border-rose-200/60",
    iconBg: "bg-rose-50",
  },
  "Mammogram Education": {
    gradient: "from-blue-500 to-indigo-600",
    border: "border-blue-200/60",
    iconBg: "bg-blue-50",
  },
  "Screening Importance": {
    gradient: "from-emerald-500 to-teal-600",
    border: "border-emerald-200/60",
    iconBg: "bg-emerald-50",
  },
};

export default function ScreeningAwarenessPage() {
  return (
    <CancerAwarenessLayout
      title="Screening Awareness"
      subtitle="Regular cancer screening saves lives. Learn about self-awareness, mammograms, and why early detection through screening matters."
    >
      <div className="space-y-8">
        {SCREENING_CONTENT.map((item, index) => {
          const IconComponent = iconMap[item.icon] || Heart;
          const colors = colorConfig[item.title] || {
            gradient: "from-blue-500 to-indigo-600",
            border: "border-blue-200/60",
            iconBg: "bg-blue-50",
          };

          return (
            <ScrollReveal key={index} delay={index * 80}>
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
                      {item.recommendations.map((rec, recIdx) => (
                        <li key={recIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                          <span className="text-sm text-gray-600 leading-relaxed">{rec}</span>
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
