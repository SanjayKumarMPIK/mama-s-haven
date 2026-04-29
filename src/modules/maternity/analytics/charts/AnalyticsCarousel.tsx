import { useMemo } from "react";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useMaternityAnalytics } from "../useMaternityAnalytics";
import SymptomsTrendChart from "./SymptomsTrendChart";
import SleepTrendChart from "./SleepTrendChart";
import MoodTrendChart from "./MoodTrendChart";
import ActivityTrendChart from "./ActivityTrendChart";
import type { AnalyticsType } from "../../dashboard/visualAnalyticsMenu/VisualAnalyticsMenu";

interface AnalyticsCarouselProps {
  activeType: AnalyticsType;
  onTypeChange: (type: AnalyticsType) => void;
}

const TYPE_TO_INDEX: Record<AnalyticsType, number> = {
  symptoms: 0,
  sleep: 1,
  mood: 2,
  activity: 3,
};

const INDEX_TO_TYPE: AnalyticsType[] = ["symptoms", "sleep", "mood", "activity"];

export default function AnalyticsCarousel({ activeType, onTypeChange }: AnalyticsCarouselProps) {
  try {
    const analytics = useMaternityAnalytics(7);
    const activeIndex = TYPE_TO_INDEX[activeType];

    const configs = useMemo(() => {
      try {
        const symptomCount = analytics.symptomsCount;
        const avgSleep = analytics.sleep.length > 0
          ? (analytics.sleep.reduce((sum, d) => sum + d.hours, 0) / analytics.sleep.length).toFixed(1)
          : "0";
        const avgMoodScore = analytics.mood.length > 0
          ? analytics.mood.reduce((sum, d) => sum + d.moodScore, 0) / analytics.mood.length
          : 3;
        const moodLabel = avgMoodScore >= 4 ? "Good" : avgMoodScore >= 3 ? "Neutral" : "Low";
        const activeDays = analytics.activityCount;
        const activityLabel = activeDays >= 4 ? "Active" : activeDays >= 2 ? "Moderate" : "Low";

        return [
          { id: "symptoms", title: "Symptoms Trend", subtitle: `${symptomCount} logged this week`, component: <SymptomsTrendChart data={analytics.symptoms} /> },
          { id: "sleep", title: "Sleep Trend", subtitle: `${avgSleep} avg hrs`, component: <SleepTrendChart data={analytics.sleep} /> },
          { id: "mood", title: "Mood Trend", subtitle: `${moodLabel} avg mood`, component: <MoodTrendChart data={analytics.mood} /> },
          { id: "activity", title: "Activity Trend", subtitle: activityLabel, component: <ActivityTrendChart data={analytics.activity} /> },
        ];
      } catch (error) {
        console.error("Analytics config error:", error);
        return [];
      }
    }, [analytics]);

    const activeConfig = configs[activeIndex];

    const handlePrevious = () => {
      const newIndex = activeIndex === 0 ? configs.length - 1 : activeIndex - 1;
      onTypeChange(INDEX_TO_TYPE[newIndex]);
    };

    const handleNext = () => {
      const newIndex = activeIndex === configs.length - 1 ? 0 : activeIndex + 1;
      onTypeChange(INDEX_TO_TYPE[newIndex]);
    };

    const handleDotClick = (i: number) => {
      onTypeChange(INDEX_TO_TYPE[i]);
    };

    if (!analytics.hasData || configs.length === 0) {
      return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-lavender flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-lavender-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Visual Analytics</h2>
              <p className="text-[10px] text-muted-foreground">Track your health trends</p>
            </div>
          </div>
          <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
            No analytics data available yet
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lavender flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-lavender-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Visual Analytics</h2>
              <p className="text-[10px] text-muted-foreground">{activeConfig.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handlePrevious} className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleNext} className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="text-xs font-semibold mb-3">{activeConfig.title}</h3>

        <div className="transition-all duration-200 ease-in-out">
          {activeConfig.component}
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          {configs.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? "bg-primary w-6" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("AnalyticsCarousel error:", error);
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-lavender flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-lavender-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Visual Analytics</h2>
            <p className="text-[10px] text-muted-foreground">Track your health trends</p>
          </div>
        </div>
        <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
          Analytics temporarily unavailable
        </div>
      </div>
    );
  }
}
