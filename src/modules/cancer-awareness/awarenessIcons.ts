import {
  Activity,
  Eye,
  Lightbulb,
  Shield,
  Users,
  ClipboardList,
  Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CardIcon {
  icon: LucideIcon;
  gradient: string;
  shadow: string;
}

export const CARD_ICONS: Record<string, CardIcon> = {
  "early-symptoms": {
    icon: Activity,
    gradient: "from-rose-500 to-pink-600",
    shadow: "shadow-rose-200/50",
  },
  "self-exam-guide": {
    icon: Eye,
    gradient: "from-sky-500 to-cyan-600",
    shadow: "shadow-sky-200/50",
  },
  "myths-facts": {
    icon: Lightbulb,
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-200/50",
  },
  prevention: {
    icon: Shield,
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-200/50",
  },
  "family-history": {
    icon: Users,
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-200/50",
  },
  "screening-awareness": {
    icon: ClipboardList,
    gradient: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-200/50",
  },
  "emotional-support": {
    icon: Heart,
    gradient: "from-pink-500 to-rose-600",
    shadow: "shadow-pink-200/50",
  },
};
