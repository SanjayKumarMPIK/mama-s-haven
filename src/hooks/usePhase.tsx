import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Phase = "puberty" | "maternity" | "family-planning" | "menopause";

interface PhaseContextType {
  phase: Phase;
  setPhase: (p: Phase) => void;
  phaseName: string;
  phaseEmoji: string;
  phaseColor: string;
}

const PHASE_META: Record<Phase, { name: string; emoji: string; color: string }> = {
  puberty: { name: "Puberty", emoji: "🌸", color: "bg-pink-100 text-pink-700 border-pink-200" },
  maternity: { name: "Maternity", emoji: "🤰", color: "bg-purple-100 text-purple-700 border-purple-200" },
  "family-planning": { name: "Family Planning", emoji: "🌿", color: "bg-teal-100 text-teal-700 border-teal-200" },
  menopause: { name: "Menopause", emoji: "✨", color: "bg-amber-100 text-amber-700 border-amber-200" },
};

const PhaseContext = createContext<PhaseContextType>({
  phase: "puberty",
  setPhase: () => {},
  phaseName: "Puberty",
  phaseEmoji: "🌸",
  phaseColor: "bg-pink-100 text-pink-700 border-pink-200",
});

const VALID: Phase[] = ["puberty", "maternity", "family-planning", "menopause"];

function normalizePhase(raw: string | null): Phase {
  if (raw && VALID.includes(raw as Phase)) return raw as Phase;
  return "puberty";
}

export function PhaseProvider({ children }: { children: ReactNode }) {
  const [phase, setPhaseState] = useState<Phase>(() => {
    try {
      return normalizePhase(localStorage.getItem("ss-phase"));
    } catch {
      return "puberty";
    }
  });

  const setPhase = (p: Phase) => {
    setPhaseState(p);
    try { localStorage.setItem("ss-phase", p); } catch {}
  };

  const meta = PHASE_META[phase];

  return (
    <PhaseContext.Provider
      value={{ phase, setPhase, phaseName: meta.name, phaseEmoji: meta.emoji, phaseColor: meta.color }}
    >
      {children}
    </PhaseContext.Provider>
  );
}

export function usePhase() {
  return useContext(PhaseContext);
}

export { PHASE_META };
