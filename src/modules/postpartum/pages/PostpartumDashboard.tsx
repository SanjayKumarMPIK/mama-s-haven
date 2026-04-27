import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import RecoveryScoreCard from "../components/RecoveryScoreCard";
import PostpartumOverviewCard from "../components/PostpartumOverviewCard";
import PostpartumGrid from "../components/PostpartumGrid";
import RecoverySummaryCards from "../components/RecoverySummaryCards";
import MaternityRouteGuard from "@/components/MaternityRouteGuard";
import { Heart, ArrowLeft, RotateCcw } from "lucide-react";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";

const accent = {
  gradient: "from-rose-500 to-pink-400",
  bg: "bg-rose-50",
  text: "text-rose-700",
  border: "border-rose-200/60",
  cardBg: "bg-gradient-to-br from-rose-50 to-pink-50",
};

export default function PostpartumDashboard() {
  const { clearProfile } = usePregnancyProfile();

  return (
    <MaternityRouteGuard expectedState="postpartum">
      <main className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/60 backdrop-blur-sm">
          <div className="container py-6">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-4">
                <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Home
                </Link>
                <button
                  onClick={clearProfile}
                  title="Clear pregnancy data"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Data
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg shadow-primary/10`}>
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Postpartum Recovery</h1>
                  <p className="text-sm text-muted-foreground">
                    Track your healing journey after delivery
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="container py-6 space-y-6">
          {/* Top Section: Recovery Score and Overview */}
          <ScrollReveal>
            <div className="grid gap-4 md:grid-cols-2">
              <RecoveryScoreCard />
              <PostpartumOverviewCard />
            </div>
          </ScrollReveal>

          {/* Recovery Summary Cards */}
          <ScrollReveal delay={30}>
            <RecoverySummaryCards />
          </ScrollReveal>

          {/* Main Dashboard Grid */}
          <ScrollReveal delay={50}>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Your Recovery Tools</h2>
              <PostpartumGrid />
            </div>
          </ScrollReveal>
        </div>

        <SafetyDisclaimer />
      </main>
    </MaternityRouteGuard>
  );
}
