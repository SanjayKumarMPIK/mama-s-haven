import { useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, Activity, Timer, Heart, ArrowLeft, Wrench, BarChart3 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { usePhase } from "@/hooks/usePhase";
import { CycleTracker } from "@/pages/Puberty";
import { FertilityWindowSection } from "@/pages/FamilyPlanning";
import { TrimesterSelector, type Trimester } from "@/pages/Maternity";

// Due Date Calculator
function DueDateCalculator() {
  const [lmp, setLmp] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);

  const calculate = () => {
    if (!lmp) return;
    const date = new Date(lmp);
    date.setDate(date.getDate() + 280);
    setDueDate(date.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-peach flex items-center justify-center">
          <Calculator className="w-5 h-5 text-foreground/70" />
        </div>
        <h2 className="text-xl font-bold">Due Date Calculator</h2>
      </div>
      <label className="block text-sm font-medium mb-2">First day of your last period</label>
      <input
        type="date"
        value={lmp}
        onChange={(e) => setLmp(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
      <button
        onClick={calculate}
        className="mt-4 w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
      >
        Calculate
      </button>
      {dueDate && (
        <div className="mt-6 p-4 rounded-lg bg-mint/50 text-center">
          <p className="text-sm text-muted-foreground">Your estimated due date</p>
          <p className="mt-1 text-lg font-bold">{dueDate}</p>
        </div>
      )}
    </div>
  );
}

function KickCounter() {
  const [kicks, setKicks] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const handleKick = () => {
    if (!startTime) setStartTime(new Date());
    setKicks((k) => k + 1);
  };

  const reset = () => {
    setKicks(0);
    setStartTime(null);
  };

  const elapsed = startTime ? Math.floor((Date.now() - startTime.getTime()) / 60000) : 0;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-mint flex items-center justify-center">
          <Activity className="w-5 h-5 text-foreground/70" />
        </div>
        <h2 className="text-xl font-bold">Kick Counter</h2>
      </div>
      <div className="text-center">
        <div className="text-6xl font-bold text-primary">{kicks}</div>
        <p className="mt-1 text-sm text-muted-foreground">{startTime ? `${elapsed} min elapsed` : "Tap to start counting"}</p>
        <button
          onClick={handleKick}
          className="mt-6 w-32 h-32 rounded-full bg-mint hover:bg-mint/80 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center mx-auto"
        >
          <span className="text-lg font-semibold text-mint-foreground">Tap!</span>
        </button>
        {kicks > 0 && (
          <button onClick={reset} className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Reset counter
          </button>
        )}
      </div>
    </div>
  );
}

function ContractionTimer() {
  const [contractions, setContractions] = useState<{ start: number; end?: number }[]>([]);
  const [active, setActive] = useState(false);

  const toggle = () => {
    if (active) {
      setContractions((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].end = Date.now();
        return updated;
      });
      setActive(false);
    } else {
      setContractions((prev) => [...prev, { start: Date.now() }]);
      setActive(true);
    }
  };

  const reset = () => {
    setContractions([]);
    setActive(false);
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-baby-blue flex items-center justify-center">
          <Timer className="w-5 h-5 text-foreground/70" />
        </div>
        <h2 className="text-xl font-bold">Contraction Timer</h2>
      </div>
      <div className="text-center">
        <button
          onClick={toggle}
          className={`w-36 h-36 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center mx-auto ${
            active ? "bg-primary text-primary-foreground" : "bg-baby-blue text-baby-blue-foreground"
          }`}
        >
          <span className="text-lg font-semibold">{active ? "Stop" : "Start"}</span>
        </button>
        {contractions.length > 0 && (
          <>
            <div className="mt-8 text-left">
              <h3 className="text-sm font-semibold mb-3">History</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {contractions.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-sm p-3 rounded-lg bg-muted/50">
                    <span>#{i + 1}</span>
                    <span>{c.end ? formatDuration(c.end - c.start) : "In progress..."}</span>
                    <span className="text-muted-foreground">{new Date(c.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={reset} className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Clear history
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function MoodLog() {
  const moods = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😌", label: "Calm" },
    { emoji: "😴", label: "Tired" },
    { emoji: "🤢", label: "Nauseous" },
    { emoji: "😟", label: "Anxious" },
    { emoji: "😢", label: "Emotional" },
  ];
  const [selected, setSelected] = useState<string | null>(null);
  const [logged, setLogged] = useState(false);

  const handleLog = () => {
    if (selected) setLogged(true);
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-lavender flex items-center justify-center">
          <Heart className="w-5 h-5 text-foreground/70" />
        </div>
        <h2 className="text-xl font-bold">Mood Check-in</h2>
      </div>
      {logged ? (
        <div className="text-center py-8">
          <p className="text-4xl mb-3">{moods.find((m) => m.label === selected)?.emoji}</p>
          <p className="font-semibold">Logged: {selected}</p>
          <p className="text-sm text-muted-foreground mt-1">Take care of yourself today 💕</p>
          <button onClick={() => { setLogged(false); setSelected(null); }} className="mt-4 text-sm text-primary hover:underline">
            Log another
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">How are you feeling today?</p>
          <div className="grid grid-cols-3 gap-3">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => setSelected(m.label)}
                className={`p-4 rounded-lg text-center transition-all duration-200 active:scale-95 ${
                  selected === m.label ? "bg-primary/10 border-2 border-primary shadow-sm" : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                }`}
              >
                <span className="text-2xl block">{m.emoji}</span>
                <span className="text-xs mt-1 block">{m.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleLog}
            disabled={!selected}
            className="mt-6 w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
          >
            Log Mood
          </button>
        </>
      )}
    </div>
  );
}

export default function Tools() {
  const { phase, phaseName, phaseEmoji, phaseColor } = usePhase();
  const [trimester, setTrimester] = useState<Trimester>("first");

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <ScrollReveal>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Health <span className="text-gradient-bloom">Tools</span>
            </h1>
          </div>
          <p className="mt-1 text-lg font-medium border rounded-full px-3 py-1 inline-flex items-center gap-2 bg-card border-border/60">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${phaseColor}`}>
              {phaseEmoji} Current phase: {phaseName}
            </span>
          </p>
          <p className="mt-3 text-muted-foreground max-w-lg text-sm">
            Tools shown below match your selected life stage. Everything stays on your device unless you use AI chat.
          </p>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Body Report — always visible */}
          <ScrollReveal>
            <Link
              to="/weekly-report"
              className="flex items-start gap-4 rounded-xl border border-border/60 bg-card p-6 md:p-8 hover:shadow-md hover:border-primary/20 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold mb-1">Weekly Body Report</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Analytics, patterns, and action plans generated purely from your calendar logs.
                </p>
                <span className="inline-block mt-3 text-xs font-semibold text-primary group-hover:underline">View Report →</span>
              </div>
            </Link>
          </ScrollReveal>
          {(phase === "puberty" || phase === "family-planning") && (
            <ScrollReveal>
              <CycleTracker onResultChange={() => {}} />
            </ScrollReveal>
          )}

          {phase === "maternity" && (
            <ScrollReveal delay={80}>
              <FertilityWindowSection onResult={() => {}} />
            </ScrollReveal>
          )}

          {phase === "maternity" && (
            <>
              <ScrollReveal>
                <TrimesterSelector value={trimester} onChange={setTrimester} />
              </ScrollReveal>
              <ScrollReveal delay={80}>
                <DueDateCalculator />
              </ScrollReveal>
              <ScrollReveal delay={120}>
                <KickCounter />
              </ScrollReveal>
              <ScrollReveal delay={160}>
                <ContractionTimer />
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <MoodLog />
              </ScrollReveal>
            </>
          )}
        </div>

        {phase === "puberty" && (
          <p className="mt-8 text-xs text-muted-foreground text-center">
            <Link to="/puberty" className="text-primary font-medium hover:underline">
              Open full Puberty module
            </Link>{" "}
            for hemoglobin, mood, and personalised suggestions.
          </p>
        )}

        {/* Wellness Dashboard link — visible for non-maternity phases */}
        {phase !== "maternity" && (
          <ScrollReveal>
            <Link
              to="/wellness"
              className="mt-8 flex items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-teal-50 to-emerald-50 p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-teal-200/40">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold mb-0.5">Wellness Dashboard</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Full health overview — BMI, water intake, health score, and daily wellness plans.
                </p>
              </div>
            </Link>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
