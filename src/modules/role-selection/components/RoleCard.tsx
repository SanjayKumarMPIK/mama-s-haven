import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  selected: boolean;
  onClick: () => void;
  accentColor?: string;
}

export default function RoleCard({
  icon,
  title,
  subtitle,
  selected,
  onClick,
  accentColor = "primary",
}: RoleCardProps) {
  const colorMap: Record<string, { border: string; bg: string; bgHover: string; ring: string; iconBg: string; iconText: string }> = {
    primary: {
      border: "border-orange-200",
      bg: "bg-orange-50/50",
      bgHover: "hover:bg-orange-50",
      ring: "ring-orange-400",
      iconBg: "bg-orange-100",
      iconText: "text-orange-600",
    },
    teal: {
      border: "border-teal-200",
      bg: "bg-teal-50/50",
      bgHover: "hover:bg-teal-50",
      ring: "ring-teal-400",
      iconBg: "bg-teal-100",
      iconText: "text-teal-600",
    },
  };

  const colors = colorMap[accentColor] ?? colorMap.primary;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-2xl border-2 p-8 text-left transition-all duration-300",
        "focus:outline-none focus-visible:ring-4",
        colors.bgHover,
        selected
          ? cn("border-transparent shadow-lg", colors.ring, "ring-4")
          : cn("border-slate-200 hover:border-transparent hover:shadow-md hover:-translate-y-1"),
      )}
    >
      <div className={cn("inline-flex rounded-xl p-4 mb-5 transition-colors", colors.iconBg, colors.iconText)}>
        <span className="w-12 h-12 flex items-center justify-center">{icon}</span>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-base text-slate-500 leading-relaxed">{subtitle}</p>
      <div
        className={cn(
          "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          selected ? cn("border-transparent", colors.iconBg, colors.iconText) : "border-slate-300",
        )}
      >
        {selected && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </button>
  );
}
