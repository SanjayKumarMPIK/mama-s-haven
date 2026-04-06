import { LayoutDashboard } from "lucide-react";
import StatusCard from "@/components/dashboard/StatusCard";
import AnalyticsList from "@/components/dashboard/AnalyticsList";
import ActionList from "@/components/dashboard/ActionList";

/* ── Mock data (will be replaced with real data from symptom logs) ── */
const STATUS_DATA = {
  phase: "Luteal Phase",
  energy: "Low",
  mood: "Irritated",
  body: "Bloated",
  alerts: ["High chance of cramps in next 24 hours"],
};

const INSIGHTS = [
  "You usually experience cramps 2 days before your period",
  "Your mood drops during late luteal phase",
  "Energy levels peak after ovulation",
  "Sleep quality decreases 3 days before menstruation",
];

const ACTIONS = [
  { text: "Avoid intense workouts today", emoji: "🧘" },
  { text: "Increase iron-rich foods", emoji: "🥬" },
  { text: "Do light stretching for 10 minutes", emoji: "🤸" },
];

export default function Dashboard() {
  return (
    <main className="dashboard-page">
      {/* Page heading */}
      <header className="dashboard-header">
        <div className="dashboard-header-icon-wrap">
          <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your health at a glance
          </p>
        </div>
      </header>

      {/* 3 Sections */}
      <div className="dashboard-sections-container">
        <StatusCard data={STATUS_DATA} />
        <AnalyticsList insights={INSIGHTS} />
        <ActionList actions={ACTIONS} />
      </div>
    </main>
  );
}
