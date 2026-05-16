import { Heart, Lightbulb, Brain, Users, Target, Trophy } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import CancerAwarenessLayout from "./CancerAwarenessLayout";
import { EMOTIONAL_SUPPORT_CONTENT } from "./cancerAwarenessContent";

const iconMap: Record<string, typeof Heart> = {
  Heart,
  Lightbulb,
  Brain,
  Users,
  Target,
  Trophy,
};

export default function EmotionalSupportPage() {
  return (
    <CancerAwarenessLayout
      title="Emotional Support"
      subtitle="Taking care of your emotional well-being is an essential part of your cancer awareness journey. You are not alone."
    >
      <ScrollReveal delay={60}>
        <div className="rounded-xl border border-pink-200/60 bg-gradient-to-br from-pink-100 via-rose-50/50 to-white p-6 mb-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-200/50 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">You Are Not Alone in This Journey</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Whether you are seeking knowledge, feeling concerned, or wanting to stay proactive — your feelings are valid, and support is always available.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-5 sm:grid-cols-2">
        {EMOTIONAL_SUPPORT_CONTENT.map((item, index) => {
          const IconComponent = iconMap[item.icon] || Heart;

          return (
            <ScrollReveal key={index} delay={80 + index * 60}>
              <div
                className={cn(
                  "rounded-xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md h-full",
                  "border-pink-200/60 hover:border-pink-300/80",
                )}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center shadow-md mb-4",
                      item.color,
                    )}
                  >
                    {IconComponent && <IconComponent className="w-7 h-7 text-gray-700" />}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </CancerAwarenessLayout>
  );
}
