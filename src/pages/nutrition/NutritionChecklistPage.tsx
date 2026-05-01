import { usePhase } from "@/hooks/usePhase";
import { AlertTriangle, ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function NutritionChecklistPage() {
  const { phase } = usePhase();

  // Phase gate: only allow access in maternity phase
  if (phase !== "maternity") {
    return (
      <main className="min-h-screen bg-background pb-20">
        <div className="container py-16 max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Feature Not Available</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            The Nutrition Checklist is only available during the Maternity phase.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <Link 
            to="/nutrition"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Nutrition Guide
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center shadow-lg shadow-primary/10">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Nutrition Checklist</h1>
              <p className="text-sm text-muted-foreground">
                This section is reserved for future nutrition workflow expansion.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-6">
            <Calendar className="w-4 h-4" />
            Coming Soon
          </div>
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 flex items-center justify-center mx-auto mb-6 border border-purple-100">
            <Calendar className="w-12 h-12 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Nutrition Checklist</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            This section is reserved for future nutrition workflow expansion.
          </p>
          <Link
            to="/nutrition/personalized-diet"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Go to Personalized Diet
          </Link>
        </div>
      </div>
    </main>
  );
}
