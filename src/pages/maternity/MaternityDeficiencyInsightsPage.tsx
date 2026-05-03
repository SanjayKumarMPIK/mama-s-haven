import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import MaternityWellnessPlan from "./components/MaternityWellnessPlan";
import MaternityDailyGoals from "./components/MaternityDailyGoals";
import MaternityFunActivities from "./components/MaternityFunActivities";

export default function MaternityDeficiencyInsightsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <Link to="/nutrition" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-card hover:bg-muted/50 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Activities</h1>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-8">
        <ScrollReveal>
          <MaternityWellnessPlan />
        </ScrollReveal>
        
        <ScrollReveal delay={50}>
          <MaternityDailyGoals />
        </ScrollReveal>
        
        <ScrollReveal delay={100}>
          <MaternityFunActivities />
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
