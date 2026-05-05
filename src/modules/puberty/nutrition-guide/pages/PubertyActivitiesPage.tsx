import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import PubertyWellnessPlan from "../components/PubertyWellnessPlan";

export default function PubertyActivitiesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <Link to="/puberty/nutrition-guide" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-card hover:bg-muted/50 transition-colors">
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
          <PubertyWellnessPlan />
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
