// ─── Maternity Care Log Header Component ───────────────────────────────────────
// Hero header section for the maternity care log dashboard

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

interface MaternityCareLogHeaderProps {
  onBack?: string;
}

export default function MaternityCareLogHeader({ onBack = "/maternity" }: MaternityCareLogHeaderProps) {
  return (
    <ScrollReveal>
      <Link
        to={onBack}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Maternity
      </Link>

      <div className="mb-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-3">
          💊 Care Log
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold">
          Care <span className="text-gradient-bloom">Log</span>
        </h1>

        {/* Description */}
        <p className="mt-3 text-muted-foreground max-w-xl">
          Never miss a dose — smart reminders, snooze options, and complete medicine tracking for your pregnancy journey.
        </p>
      </div>
    </ScrollReveal>
  );
}
