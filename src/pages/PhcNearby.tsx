import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, ExternalLink, Building2 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { usePhase } from "@/hooks/usePhase";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";

/** Mock PHC data — prototype only, no live backend */
const MOCK_PHCS = [
  { name: "Urban Primary Health Centre — Sector 12", area: "Near bus stand", mapUrl: "https://www.openstreetmap.org/search?query=primary%20health%20centre%20india" },
  { name: "Sub-Centre — Village Cluster A", area: "Block PHC catchment", mapUrl: "https://www.openstreetmap.org/" },
  { name: "District Hospital Outpatient Wing", area: "Town centre (referral)", mapUrl: "https://www.openstreetmap.org/" },
];

export default function PhcNearby() {
  const { phaseName, phaseEmoji } = usePhase();

  return (
    <main className="min-h-screen py-12 bg-background">
      <div className="container max-w-3xl">
        <ScrollReveal>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-mint/80 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-foreground/80" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              PHC <span className="text-gradient-bloom">Nearby</span>
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Prototype: static examples. Tap a map link to explore facilities in your area.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={60}>
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-sm font-medium text-foreground">
              {phaseEmoji} Current phase: <span className="font-bold">{phaseName}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Consider visiting a Primary Health Centre based on your current health inputs — for check-ups, vaccinations, or if symptoms worry you.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-8 space-y-4">
          {MOCK_PHCS.map((p, i) => (
            <ScrollReveal key={p.name} delay={80 + i * 50}>
              <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">{p.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.area}</p>
                  </div>
                </div>
                <a
                  href={p.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-muted transition-colors shrink-0"
                >
                  Open map <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <SafetyDisclaimer />
      </div>
    </main>
  );
}
