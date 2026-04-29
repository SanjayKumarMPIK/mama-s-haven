import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, X, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { Phase } from "@/hooks/usePhase";
import {
  searchSymptomGuide,
  getPopularSymptoms,
  getSymptomGuideEntry,
  getPhaseTagLabel,
  type SymptomGuideEntry,
} from "@/lib/symptomGuideRegistry";

// ─── Phase accent map ────────────────────────────────────────────────────

const phaseColors: Record<string, {
  gradient: string; bg: string; text: string; border: string;
  cardBg: string; badge: string; chipActive: string; ring: string;
}> = {
  puberty: {
    gradient: "from-pink-500 to-rose-400", bg: "bg-pink-50", text: "text-pink-700",
    border: "border-pink-200/60", cardBg: "bg-gradient-to-br from-pink-50/80 to-rose-50/60",
    badge: "bg-pink-100 text-pink-700", chipActive: "bg-pink-100 border-pink-300 text-pink-800",
    ring: "ring-pink-400/30",
  },
  maternity: {
    gradient: "from-purple-500 to-violet-400", bg: "bg-purple-50", text: "text-purple-700",
    border: "border-purple-200/60", cardBg: "bg-gradient-to-br from-purple-50/80 to-violet-50/60",
    badge: "bg-purple-100 text-purple-700", chipActive: "bg-purple-100 border-purple-300 text-purple-800",
    ring: "ring-purple-400/30",
  },
  "family-planning": {
    gradient: "from-teal-500 to-emerald-400", bg: "bg-teal-50", text: "text-teal-700",
    border: "border-teal-200/60", cardBg: "bg-gradient-to-br from-teal-50/80 to-emerald-50/60",
    badge: "bg-teal-100 text-teal-700", chipActive: "bg-teal-100 border-teal-300 text-teal-800",
    ring: "ring-teal-400/30",
  },
  menopause: {
    gradient: "from-amber-500 to-orange-400", bg: "bg-amber-50", text: "text-amber-700",
    border: "border-amber-200/60", cardBg: "bg-gradient-to-br from-amber-50/80 to-orange-50/60",
    badge: "bg-amber-100 text-amber-700", chipActive: "bg-amber-100 border-amber-300 text-amber-800",
    ring: "ring-amber-400/30",
  },
};

// ─── Component ───────────────────────────────────────────────────────────

interface SymptomGuideSearchProps {
  phase: Phase;
  initialQuery?: string;
  onClose?: () => void;
}

export default function SymptomGuideSearch({ phase, initialQuery, onClose }: SymptomGuideSearchProps) {
  const accent = phaseColors[phase] ?? phaseColors.puberty;
  const [query, setQuery] = useState(initialQuery ?? "");
  const [results, setResults] = useState<SymptomGuideEntry[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SymptomGuideEntry | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const popularSymptoms = useMemo(() => getPopularSymptoms(phase), [phase]);

  // Handle initial query from URL param
  useEffect(() => {
    if (initialQuery) {
      const entry = getSymptomGuideEntry(initialQuery);
      if (entry) {
        setSelectedEntry(entry);
        setQuery("");
      } else {
        setQuery(initialQuery);
      }
    }
  }, [initialQuery]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setIsDropdownOpen(false); return; }
    debounceRef.current = setTimeout(() => {
      const found = searchSymptomGuide(query, phase);
      setResults(found);
      setIsDropdownOpen(found.length > 0);
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, phase]);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback((entry: SymptomGuideEntry) => {
    setSelectedEntry(entry);
    setQuery("");
    setResults([]);
    setIsDropdownOpen(false);
  }, []);

  const handleChipClick = useCallback((entry: SymptomGuideEntry) => {
    setSelectedEntry(entry);
    setQuery("");
  }, []);

  const handleClose = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* ── Section Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <h2 className="text-base font-bold tracking-tight">Symptom Guide</h2>
          <span className="text-xs text-muted-foreground ml-1">Search & learn</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Search Bar ───────────────────────────────────────────── */}
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setIsDropdownOpen(true); }}
            placeholder="Search any symptom (e.g., fatigue, headache, hot flashes)..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-border/60 bg-card text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            aria-label="Search symptom guide"
            id="symptom-guide-search-input"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); setIsDropdownOpen(false); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isDropdownOpen && results.length > 0 && (
          <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-border/60 bg-card shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
            {results.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleSelect(entry)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/20 last:border-0 group"
              >
                <span className="text-lg shrink-0">{entry.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{entry.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{entry.shortDescription.slice(0, 60)}…</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Popular / Suggested Chips ────────────────────────────── */}
      {!selectedEntry && !query && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Common symptoms
          </p>
          <div className="flex flex-wrap gap-2">
            {popularSymptoms.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleChipClick(entry)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all active:scale-95 hover:shadow-sm ${accent.chipActive} hover:ring-2 ${accent.ring}`}
              >
                <span>{entry.emoji}</span>
                <span>{entry.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Selected Symptom Result Card ─────────────────────────── */}
      {selectedEntry && (
        <div className={`relative rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-5 animate-in fade-in zoom-in-95 duration-300`}>
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Close symptom details"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{selectedEntry.emoji}</span>
            <div>
              <h3 className="text-lg font-bold">{selectedEntry.name}</h3>
              {/* Phase Tags */}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedEntry.phaseTags.map((p) => (
                  <span
                    key={p}
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      p === phase ? accent.badge : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {getPhaseTagLabel(p)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl bg-background/80 border border-border/30 p-3.5 mb-4">
            <p className="text-sm leading-relaxed text-foreground/90">
              {selectedEntry.shortDescription}
            </p>
          </div>

          {/* Possible Causes */}
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Often associated with
            </p>
            <ul className="space-y-1.5">
              {selectedEntry.possibleCauses.map((cause, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                  <span className="text-foreground/80">{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Nutrition Link */}
          <Link
            to={`/nutrition`}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${accent.gradient} text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97]`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View nutrition insights for this symptom
          </Link>

          {/* Disclaimer */}
          <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
            This information is for educational purposes only. It does not constitute medical advice.
          </p>
        </div>
      )}
    </div>
  );
}
