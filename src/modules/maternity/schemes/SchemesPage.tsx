import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, MapPin, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ScrollReveal from "@/components/ScrollReveal";
import { SchemeCard } from "./SchemeCard";
import {
  getSchemesByState,
  searchSchemes,
  filterSchemesByType,
  ALL_STATES,
} from "./schemesData";
import { FILTER_OPTIONS, type SchemeType } from "./types";

export function SchemesPage() {
  const { fullProfile } = useAuth();
  const userState = fullProfile?.location?.state ?? "";

  const [selectedState, setSelectedState] = useState(userState);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<SchemeType[]>([]);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const allSchemes = useMemo(() => getSchemesByState(selectedState), [selectedState]);

  const filteredSchemes = useMemo(() => {
    let result = allSchemes;
    if (searchQuery) result = searchSchemes(result, searchQuery);
    if (activeFilters.length) result = filterSchemesByType(result, activeFilters);
    return result;
  }, [allSchemes, searchQuery, activeFilters]);

  const toggleFilter = (type: SchemeType) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilters([]);
  };

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/maternity"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Maternity
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Government Schemes
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Maternity <span className="text-gradient-bloom">Schemes</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Discover government maternity welfare schemes available in your state.
            Each scheme provides financial, nutritional, or healthcare support for expecting mothers.
          </p>
        </div>

        {/* State badge + picker */}
        <div className="mb-6">
          {selectedState ? (
            <button
              onClick={() => setShowStatePicker(!showStatePicker)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-sm font-semibold hover:bg-purple-100 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {selectedState}
            </button>
          ) : (
            <button
              onClick={() => setShowStatePicker(!showStatePicker)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold hover:bg-amber-100 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Select State
            </button>
          )}

          {showStatePicker && (
            <div className="mt-3 p-3 rounded-xl border border-border/60 bg-card shadow-sm">
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {ALL_STATES.map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setSelectedState(st);
                      setShowStatePicker(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      st === selectedState
                        ? "bg-purple-600 text-white"
                        : "bg-muted text-slate-600 hover:bg-muted/80"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes by name, benefit, or eligibility..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/60 bg-card text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-300 transition-all"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => toggleFilter(opt.type)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeFilters.includes(opt.type)
                  ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                  : "bg-card text-slate-600 border-border/60 hover:border-purple-300 hover:text-purple-700"
              }`}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}

          {(searchQuery || activeFilters.length > 0) && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Schemes grid */}
        <ScrollReveal>
          {!selectedState ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
              <MapPin className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-amber-800">
                No schemes available currently for your region.
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Please select a state above to view available schemes.
              </p>
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">
                No schemes match your search.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try different keywords or clear filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Showing {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? "s" : ""} for {selectedState}
              </p>
              <div className="grid gap-4">
                {filteredSchemes.map((scheme) => (
                  <SchemeCard key={scheme.id} scheme={scheme} />
                ))}
              </div>
            </div>
          )}
        </ScrollReveal>
      </div>
    </div>
  );
}
