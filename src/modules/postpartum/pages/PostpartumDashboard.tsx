import { useMemo } from "react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import RecoveryScoreCard from "../components/RecoveryScoreCard"; // Kept for rollback/validation
import PostpartumOverviewCard from "../components/PostpartumOverviewCard";
import PostpartumGrid from "../components/PostpartumGrid";
import RecoverySummaryCards from "../components/RecoverySummaryCards";
import PostpartumRecoveryTimeline from "../components/PostpartumRecoveryTimeline"; // Kept for rollback/validation
import NutritionTipsCard from "../components/NutritionTipsCard";
import ActiveAlertsCard from "../components/ActiveAlertsCard";
import { PostpartumRecoveryCard } from "../recovery/PostpartumRecoveryCard";
import { PostpartumTimeline } from "../recovery/PostpartumTimeline";
import MaternityRouteGuard from "@/components/MaternityRouteGuard";
import VisualAnalytics from "@/components/dashboard/VisualAnalytics";
import { Heart, ArrowLeft, RotateCcw } from "lucide-react";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useHealthLog } from "@/hooks/useHealthLog";
import { filterLogsByPhase, buildChartDataset } from "@/shared/symptom-sync/symptomAnalyticsAdapter";

const accent = {
  gradient: "from-rose-500 to-pink-400",
  bg: "bg-rose-50",
  text: "text-rose-700",
  border: "border-rose-200/60",
  cardBg: "bg-gradient-to-br from-rose-50 to-pink-50",
};

export default function PostpartumDashboard() {
  const { clearProfile, profile } = usePregnancyProfile();
  const { maternityLogs } = useHealthLog();

  const weeksPostpartum = useMemo(() => {
    if (!profile.delivery?.birthDate) return 1;
    const birth = new Date(profile.delivery.birthDate + "T00:00:00");
    const now = new Date();
    return Math.max(1, Math.floor((now.getTime() - birth.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  }, [profile.delivery?.birthDate]);

  const deliveryDateISO = profile.delivery?.birthDate || new Date().toISOString().split("T")[0];

  // Convert maternityLogs using the unified adapter to strictly isolate postpartum phase
  const chartDataset = useMemo(() => {
    const filtered = filterLogsByPhase(maternityLogs, "postpartum", deliveryDateISO);
    return buildChartDataset(filtered);
  }, [maternityLogs, deliveryDateISO]);

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
          {/* Recovery Summary Cards */}
          <ScrollReveal>
            <RecoverySummaryCards />
          </ScrollReveal>

          {/* Dynamic Recovery Score + Recovery Timeline */}
          <ScrollReveal delay={20}>
            <div className="grid gap-4 md:grid-cols-[1fr_3fr] md:items-stretch">
              <PostpartumRecoveryCard />
              <PostpartumTimeline />
            </div>
          </ScrollReveal>

          {/* Visual Analytics */}
          <VisualAnalytics pubertyLogs={chartDataset} />

          {/* Recovery Insight Cards */}
          <ScrollReveal delay={40}>
            <div className="grid gap-4 md:grid-cols-2">
              <NutritionTipsCard />
              <ActiveAlertsCard />
            </div>
          </ScrollReveal>

          {/* Overview Card */}
          <ScrollReveal delay={50}>
            <PostpartumOverviewCard />
          </ScrollReveal>

          {/* Main Dashboard Grid */}
          <ScrollReveal delay={60}>
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