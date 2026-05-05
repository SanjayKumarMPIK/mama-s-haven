import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Trophy, RefreshCw, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── 4-7-8 Breathing (compact version) ──────────────────────────────────────

function CompactBreathing() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const phaseDurations = { inhale: 4, hold: 7, exhale: 8 };
    const phases: ("inhale" | "hold" | "exhale")[] = ["inhale", "hold", "exhale"];
    let phaseIdx = 0;
    let phaseElapsed = 0;
    let cycles = 0;
    setPhase("inhale");
    setSeconds(phaseDurations.inhale);

    intervalRef.current = setInterval(() => {
      phaseElapsed++;
      const remaining = phaseDurations[phases[phaseIdx]] - phaseElapsed;
      setSeconds(remaining);
      if (remaining <= 0) {
        phaseIdx++;
        if (phaseIdx >= phases.length) { phaseIdx = 0; cycles++; if (cycles >= 4) { setActive(false); return; } }
        phaseElapsed = 0;
        setPhase(phases[phaseIdx]);
        setSeconds(phaseDurations[phases[phaseIdx]]);
      }
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-5 text-center">
      <h3 className="text-sm font-bold text-indigo-800 mb-1">🫁 Guided Breathing</h3>
      <p className="text-[11px] text-indigo-600 mb-4">4s inhale · 7s hold · 8s exhale</p>
      <div className="flex justify-center mb-4">
        <div className={cn(
          "w-24 h-24 rounded-full bg-gradient-to-br from-indigo-300 to-purple-400 flex items-center justify-center transition-all duration-[1000ms] shadow-lg",
          active ? (phase === "exhale" ? "scale-50 shadow-indigo-100" : "scale-100 shadow-indigo-200/50") : "scale-75"
        )}>
          {active ? (
            <div>
              <p className="text-white text-xl font-bold">{seconds}</p>
              <p className="text-white/80 text-[10px] font-semibold capitalize">{phase}</p>
            </div>
          ) : <span className="text-white text-2xl">🫁</span>}
        </div>
      </div>
      <button
        onClick={() => setActive(!active)}
        className={cn("px-5 py-2 rounded-xl text-sm font-semibold transition-all",
          active ? "bg-white text-indigo-700 border border-indigo-200" : "bg-indigo-500 text-white shadow-md hover:bg-indigo-600"
        )}
      >{active ? "Stop" : "Start"}</button>
    </div>
  );
}

// ─── 5-4-3-2-1 Grounding Exercise ───────────────────────────────────────────

function GroundingExercise() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { count: 5, sense: "See", emoji: "👀", prompt: "Name 5 things you can see right now" },
    { count: 4, sense: "Touch", emoji: "✋", prompt: "Name 4 things you can touch" },
    { count: 3, sense: "Hear", emoji: "👂", prompt: "Name 3 things you can hear" },
    { count: 2, sense: "Smell", emoji: "👃", prompt: "Name 2 things you can smell" },
    { count: 1, sense: "Taste", emoji: "👅", prompt: "Name 1 thing you can taste" },
  ];

  return (
    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 p-5">
      <h3 className="text-sm font-bold text-teal-800 mb-1">🌿 5-4-3-2-1 Grounding</h3>
      <p className="text-[11px] text-teal-600 mb-4">A quick mindfulness exercise to feel centred</p>

      {currentStep < steps.length ? (
        <div className="text-center">
          <span className="text-5xl mb-3 block">{steps[currentStep].emoji}</span>
          <p className="text-3xl font-bold text-teal-700 mb-1">{steps[currentStep].count}</p>
          <p className="text-sm text-teal-600 font-medium mb-4">{steps[currentStep].prompt}</p>
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-5 py-2 rounded-xl bg-teal-500 text-white text-sm font-semibold shadow-md hover:bg-teal-600 transition-all"
          >
            Done ✓
          </button>
        </div>
      ) : (
        <div className="text-center">
          <span className="text-4xl mb-2 block">🌟</span>
          <p className="text-sm font-bold text-teal-800 mb-1">Wonderful! You're grounded.</p>
          <p className="text-xs text-teal-600 mb-3">Take a deep breath and carry this calm with you.</p>
          <button
            onClick={() => setCurrentStep(0)}
            className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="w-3 h-3" /> Start again
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MaternityFunActivities() {
  const [wins, setWins] = useState<{id: string, text: string, date: string}[]>(() => {
    try { return JSON.parse(localStorage.getItem("maternity-wins") || "[]"); } catch { return []; }
  });
  const [winText, setWinText] = useState("");
  const [gratitude, setGratitude] = useState(["", "", ""]);
  const [gratitudeSaved, setGratitudeSaved] = useState(false);

  const todayAffirmation = "My body is beautifully growing to nourish my baby.";
  const weeklyChallenge = "Take 10 minutes to write a letter to your baby this week.";

  const factIndex = 0;
  const quoteIndex = 0;
  const HEALTH_FACTS = ["Drinking water helps form the amniotic fluid around the fetus."];
  const UPLIFTING_QUOTES = ["\"A baby is something you carry inside you for nine months, in your arms for three years, and in your heart until the day you die.\" — Mary Mason"];

  const handleAddWin = () => {
    if (winText.trim()) {
      const newWin = { id: Date.now().toString(), text: winText.trim(), date: new Date().toLocaleDateString() };
      const next = [newWin, ...wins];
      setWins(next);
      localStorage.setItem("maternity-wins", JSON.stringify(next));
      setWinText("");
    }
  };

  const handleGratitudeSave = () => {
    const filled = gratitude.filter((g) => g.trim());
    if (filled.length > 0) {
      setGratitudeSaved(true);
      setTimeout(() => setGratitudeSaved(false), 3000);
    }
  };

  return (
    <div className="bg-transparent mt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-md shadow-purple-200">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Fun Activity Hub</h1>
          <p className="text-xs text-slate-500">A little joy goes a long way 💛</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Daily Affirmation */}
        <div className="bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl border border-purple-200 p-5 text-center">
          <span className="text-3xl mb-2 block">🌟</span>
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Today's Affirmation</p>
          <p className="text-base font-bold text-purple-900 leading-relaxed italic">
            "{todayAffirmation}"
          </p>
        </div>

        {/* Health Fact + Quote Carousel */}
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Health fact */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 min-h-[120px] flex flex-col justify-between">
            <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wide mb-2">💡 Health Fact</p>
            <p className="text-xs text-slate-700 leading-relaxed transition-all animate-fadeIn" key={factIndex}>
              {HEALTH_FACTS[factIndex]}
            </p>
          </div>
          {/* Quote */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 min-h-[120px] flex flex-col justify-between">
            <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide mb-2">💜 Uplifting Quote</p>
            <p className="text-xs text-slate-700 leading-relaxed italic transition-all animate-fadeIn" key={quoteIndex}>
              {UPLIFTING_QUOTES[quoteIndex]}
            </p>
          </div>
        </div>

        {/* 5-Minute Activities */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">⏱️ 5-Minute Activities</h2>

          {/* Gratitude Journal */}
          <div className="mb-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
            <h3 className="text-xs font-bold text-yellow-800 mb-2">📝 Pregnancy Journal</h3>
            <p className="text-[11px] text-yellow-700 mb-3">Name 3 things you are looking forward to with your baby:</p>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="text"
                  value={gratitude[i]}
                  onChange={(e) => {
                    const next = [...gratitude];
                    next[i] = e.target.value;
                    setGratitude(next);
                  }}
                  placeholder={`${i + 1}. I'm excited for...`}
                  className="w-full rounded-lg border border-yellow-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-300/50"
                />
              ))}
            </div>
            <button
              onClick={handleGratitudeSave}
              className={cn(
                "mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                gratitudeSaved
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              )}
            >
              {gratitudeSaved ? "✓ Saved to your heart" : "Save ✨"}
            </button>
          </div>

          {/* Doodle Challenge */}
          <div className="mb-4 p-4 rounded-xl bg-pink-50 border border-pink-200">
            <h3 className="text-xs font-bold text-pink-800 mb-1">🎨 Doodle Challenge</h3>
            <p className="text-[11px] text-pink-600">
              Grab a pen and draw something that makes you smile. No rules, no judgment — just creativity!
              Today's prompt: <span className="font-bold">A happy little cloud</span> ☁️
            </p>
          </div>
        </div>

        {/* 5-4-3-2-1 Grounding */}
        <GroundingExercise />

        {/* Guided Breathing */}
        <CompactBreathing />

        {/* Community Win Board */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-500" /> My Maternity Wins
          </h2>
          <p className="text-[11px] text-slate-500 mb-3">Celebrate every little victory during your pregnancy 🎉</p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={winText}
              onChange={(e) => setWinText(e.target.value.slice(0, 100))}
              onKeyDown={(e) => e.key === "Enter" && handleAddWin()}
              placeholder="Share your win today... (max 100 chars)"
              maxLength={100}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/50"
            />
            <button
              onClick={handleAddWin}
              disabled={!winText.trim()}
              className="px-4 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {wins.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {wins.map((win) => (
                <div key={win.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100">
                  <Heart className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700">{win.text}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{win.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              <p>No wins yet — you'll have one soon! 💜</p>
            </div>
          )}
        </div>

        {/* Weekly Challenge */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🏆</span>
            <h3 className="text-sm font-bold text-green-800">Weekly Challenge</h3>
          </div>
          <p className="text-sm text-green-700 font-medium mb-1">{weeklyChallenge}</p>
          <p className="text-[10px] text-green-600">A small goal to keep you positive and relaxed!</p>
        </div>
      </div>
    </div>
  );
}
