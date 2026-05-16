import { Users, AlertCircle } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import CancerAwarenessLayout from "./CancerAwarenessLayout";
import { FAMILY_HISTORY_CONTENT } from "./cancerAwarenessContent";

export default function FamilyHistoryPage() {
  return (
    <CancerAwarenessLayout
      title="Family History Awareness"
      subtitle="Understanding your family's medical history helps assess your cancer risk and guides proactive healthcare decisions."
    >
      <ScrollReveal delay={60}>
        <div className="rounded-xl border border-violet-200/60 bg-gradient-to-br from-violet-50 via-purple-50/50 to-white p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-200/50 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Why Family History Matters</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your family health history provides valuable clues about your genetic risk for cancer. While having a family history does not mean you will develop cancer, it helps your doctor recommend appropriate screening schedules and preventive measures tailored to your risk profile.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid gap-5 sm:grid-cols-2">
        {FAMILY_HISTORY_CONTENT.map((item, index) => (
          <ScrollReveal key={index} delay={80 + index * 70}>
            <div
              className={cn(
                "rounded-xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md h-full",
                "border-violet-200/60 hover:border-violet-300/80",
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-200/50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">{item.relation}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.description}</p>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">{item.riskNote}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </CancerAwarenessLayout>
  );
}
