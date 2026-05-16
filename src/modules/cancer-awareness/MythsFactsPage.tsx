import { useState } from "react";
import { Lightbulb, X, Check } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import CancerAwarenessLayout from "./CancerAwarenessLayout";
import { MYTHS_FACTS_CONTENT } from "./cancerAwarenessContent";

type FlipState = Record<number, boolean>;

export default function MythsFactsPage() {
  const [flipped, setFlipped] = useState<FlipState>({});

  const toggleFlip = (index: number) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <CancerAwarenessLayout
      title="Myths vs Facts"
      subtitle="Separating common cancer myths from scientific facts helps you make informed decisions about your health."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {MYTHS_FACTS_CONTENT.map((item, index) => (
          <ScrollReveal key={index} delay={index * 60}>
            <button
              onClick={() => toggleFlip(index)}
              className="w-full text-left group perspective-[1000px] h-64"
            >
              <div
                className={cn(
                  "relative w-full h-full transition-transform duration-500 preserve-3d",
                  flipped[index] && "rotate-y-180",
                )}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front - Myth */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl border bg-white p-6 shadow-sm backface-hidden",
                    "border-amber-200/60 hover:border-amber-300/80 hover:shadow-md transition-all",
                  )}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <X className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Myth</span>
                    </div>
                    <div className="flex-1 flex items-center">
                      <p className="text-sm font-medium text-gray-900 leading-relaxed">
                        "{item.myth}"
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Tap to reveal the fact</p>
                  </div>
                </div>

                {/* Back - Fact */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl border bg-white p-6 shadow-sm rotate-y-180",
                    "border-emerald-200/60 hover:border-emerald-300/80 hover:shadow-md transition-all",
                  )}
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Fact</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <p className="text-sm text-gray-700 leading-relaxed">{item.fact}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Tap to see the myth</p>
                  </div>
                </div>
              </div>
            </button>
          </ScrollReveal>
        ))}
      </div>
    </CancerAwarenessLayout>
  );
}
