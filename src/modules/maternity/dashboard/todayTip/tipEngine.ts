// ─── Tip Selection Engine ───────────────────────────────────────────────────────
// Deterministic daily tip selection based on pregnancy context

import { PregnancyTip, MATERNITY_TIPS } from "./maternityTips";

// ─── Cache Key ───────────────────────────────────────────────────────────────────

const TIP_CACHE_KEY = "mh-maternity-daily-tip-cache";

// ─── Cache Structure ─────────────────────────────────────────────────────────────

interface TipCacheEntry {
  date: string; // YYYY-MM-DD
  pregnancyWeek: number;
  tipId: string;
  timestamp: number;
}

// ─── Deterministic Seed Generation ─────────────────────────────────────────────────

function generateDailySeed(pregnancyWeek: number, date: string, userId: string): number {
  // Create a deterministic seed from pregnancy week, date, and user ID
  const seedString = `${pregnancyWeek}-${date}-${userId}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash);
}

// ─── Filter Tips by Context ───────────────────────────────────────────────────────

interface TipFilterContext {
  pregnancyWeek: number;
  trimester: 1 | 2 | 3;
  symptoms?: string[];
  recentTipIds?: string[]; // Tips shown recently to avoid repetition
}

function filterTipsByContext(tips: PregnancyTip[], context: TipFilterContext): PregnancyTip[] {
  const { pregnancyWeek, trimester, symptoms, recentTipIds = [] } = context;

  return tips.filter((tip) => {
    // Filter by trimester
    if (tip.trimester && tip.trimester !== trimester) {
      return false;
    }

    // Filter by specific pregnancy weeks
    if (tip.pregnancyWeeks && !tip.pregnancyWeeks.includes(pregnancyWeek)) {
      return false;
    }

    // Filter by symptom relevance (if symptoms provided)
    if (symptoms && symptoms.length > 0 && tip.symptomTags) {
      const hasRelevantSymptom = tip.symptomTags.some((tag) =>
        symptoms.some((symptom) => symptom.toLowerCase().includes(tag.toLowerCase()))
      );
      if (!hasRelevantSymptom) {
        return false;
      }
    }

    // Avoid recently shown tips
    if (recentTipIds.includes(tip.id)) {
      return false;
    }

    return true;
  });
}

// ─── Select Tip by Priority ─────────────────────────────────────────────────────

function selectTipByPriority(tips: PregnancyTip[], seed: number): PregnancyTip {
  if (tips.length === 0) {
    // Fallback to any tip if no context matches
    return MATERNITY_TIPS[seed % MATERNITY_TIPS.length];
  }

  // Sort by priority (higher first), then use seed for tie-breaking
  const sortedTips = [...tips].sort((a, b) => {
    const priorityDiff = (b.priority || 0) - (a.priority || 0);
    if (priorityDiff !== 0) return priorityDiff;
    
    // Use seed for deterministic selection among same-priority tips
    const aIndex = MATERNITY_TIPS.findIndex((t) => t.id === a.id);
    const bIndex = MATERNITY_TIPS.findIndex((t) => t.id === b.id);
    return ((aIndex + seed) % MATERNITY_TIPS.length) - ((bIndex + seed) % MATERNITY_TIPS.length);
  });

  // Select from top priority tier (same priority)
  const topPriority = sortedTips[0].priority || 0;
  const topPriorityTips = sortedTips.filter((t) => (t.priority || 0) === topPriority);
  
  const selectedIndex = seed % topPriorityTips.length;
  return topPriorityTips[selectedIndex];
}

// ─── Main Selection Function ───────────────────────────────────────────────────

export interface SelectTipOptions {
  pregnancyWeek: number;
  trimester: 1 | 2 | 3;
  userId: string;
  date?: string; // YYYY-MM-DD, defaults to today
  symptoms?: string[];
  recentTipIds?: string[];
}

export function selectDailyTip(options: SelectTipOptions): PregnancyTip {
  const {
    pregnancyWeek,
    trimester,
    userId,
    date = new Date().toISOString().slice(0, 10),
    symptoms,
    recentTipIds,
  } = options;

  // Generate deterministic seed
  const seed = generateDailySeed(pregnancyWeek, date, userId);

  // Filter tips by context
  const context: TipFilterContext = {
    pregnancyWeek,
    trimester,
    symptoms,
    recentTipIds,
  };

  const filteredTips = filterTipsByContext(MATERNITY_TIPS, context);

  // Select tip by priority
  return selectTipByPriority(filteredTips, seed);
}

// ─── Cache Management ───────────────────────────────────────────────────────────

export function getCachedTip(date: string, pregnancyWeek: number): TipCacheEntry | null {
  try {
    const cacheJson = localStorage.getItem(TIP_CACHE_KEY);
    if (!cacheJson) return null;

    const cache: TipCacheEntry = JSON.parse(cacheJson);
    
    // Check if cache is for the same date and pregnancy week
    if (cache.date === date && cache.pregnancyWeek === pregnancyWeek) {
      return cache;
    }
    
    return null;
  } catch {
    return null;
  }
}

export function setCachedTip(entry: TipCacheEntry): void {
  try {
    localStorage.setItem(TIP_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function clearTipCache(): void {
  try {
    localStorage.removeItem(TIP_CACHE_KEY);
  } catch {
    // Silently fail
  }
}

// ─── Get Tip with Caching ─────────────────────────────────────────────────────

export function getDailyTipWithCache(options: SelectTipOptions): PregnancyTip {
  const { pregnancyWeek, date = new Date().toISOString().slice(0, 10) } = options;

  // Check cache first
  const cached = getCachedTip(date, pregnancyWeek);
  if (cached) {
    const tip = MATERNITY_TIPS.find((t) => t.id === cached.tipId);
    if (tip) {
      return tip;
    }
  }

  // Select new tip
  const tip = selectDailyTip(options);

  // Update cache
  setCachedTip({
    date,
    pregnancyWeek,
    tipId: tip.id,
    timestamp: Date.now(),
  });

  return tip;
}

// ─── Get Recent Tip History ───────────────────────────────────────────────────

export function getRecentTipHistory(limit: number = 5): string[] {
  try {
    const cacheJson = localStorage.getItem(TIP_CACHE_KEY);
    if (!cacheJson) return [];

    const cache: TipCacheEntry = JSON.parse(cacheJson);
    return [cache.tipId];
  } catch {
    return [];
  }
}
