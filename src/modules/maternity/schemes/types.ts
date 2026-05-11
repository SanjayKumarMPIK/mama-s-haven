export type SchemeType = "financial" | "nutrition" | "insurance" | "institutional_delivery" | "healthcare";

export type SchemeBadge =
  | "highly_recommended"
  | "cash_benefit"
  | "free_delivery"
  | "nutrition_support"
  | "transport_support";

export interface Scheme {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  eligibility: string;
  type: SchemeType;
  badges: SchemeBadge[];
  state: string;
}

export type SchemesByState = Record<string, Scheme[]>;

export const SCHEME_TYPE_LABELS: Record<SchemeType, string> = {
  financial: "Financial Aid",
  nutrition: "Nutrition",
  insurance: "Insurance",
  institutional_delivery: "Institutional Delivery",
  healthcare: "Healthcare",
};

export const SCHEME_TYPE_ICONS: Record<SchemeType, string> = {
  financial: "💰",
  nutrition: "🥗",
  insurance: "🛡️",
  institutional_delivery: "🏥",
  healthcare: "❤️",
};

export const BADGE_LABELS: Record<SchemeBadge, string> = {
  highly_recommended: "Highly Recommended",
  cash_benefit: "Cash Benefit",
  free_delivery: "Free Delivery",
  nutrition_support: "Nutrition Support",
  transport_support: "Transport Support",
};

export const BADGE_COLORS: Record<SchemeBadge, string> = {
  highly_recommended: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cash_benefit: "bg-green-100 text-green-700 border-green-200",
  free_delivery: "bg-blue-100 text-blue-700 border-blue-200",
  nutrition_support: "bg-amber-100 text-amber-700 border-amber-200",
  transport_support: "bg-purple-100 text-purple-700 border-purple-200",
};

export const FILTER_OPTIONS: { type: SchemeType; label: string; icon: string }[] = [
  { type: "financial", label: "Financial Aid", icon: "💰" },
  { type: "nutrition", label: "Nutrition", icon: "🥗" },
  { type: "insurance", label: "Insurance", icon: "🛡️" },
  { type: "institutional_delivery", label: "Institutional Delivery", icon: "🏥" },
];
