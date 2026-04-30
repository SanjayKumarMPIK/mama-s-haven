import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SymptomSearchBarProps {
  onSearch: (query: string) => { id: string; label: string; emoji: string }[];
  onSelectSymptom: (symptomId: string) => void;
  suggestedSymptoms: { id: string; label: string; emoji: string }[];
  accentColor?: string;
}

export default function SymptomSearchBar({ onSearch, onSelectSymptom, suggestedSymptoms, accentColor = "pink" }: SymptomSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; label: string; emoji: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(() => {
      setResults(onSearch(query));
      setIsOpen(true);
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, onSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (id: string) => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onSelectSymptom(id);
  };

  return (
    <div ref={containerRef} className="relative" id="symptom-search-bar">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Search symptoms (e.g., fatigue, headache)..."
          className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-border/60 bg-card text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          aria-label="Search symptoms"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-border/60 bg-card shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/20 last:border-0"
            >
              <span className="text-lg">{r.emoji}</span>
              <span className="text-sm font-medium">{r.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Suggested Symptom Chips */}
      {!query && suggestedSymptoms.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestedSymptoms.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/40 bg-card text-xs font-medium hover:bg-muted/50 hover:border-primary/30 transition-all active:scale-95"
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
