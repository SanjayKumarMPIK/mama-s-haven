import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyThemeBannerProps {
  themeTitle: string;
  tagline: string;
  weekKey: string;
  onRefreshTheme: () => void;
  onShuffleWeek: () => void;
  className?: string;
}

export default function WeeklyThemeBanner({
  themeTitle,
  tagline,
  weekKey,
  onRefreshTheme,
  onShuffleWeek,
  className,
}: WeeklyThemeBannerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-md shadow-purple-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-600/90">This week</p>
            <h2 className="text-lg font-bold text-slate-800">{themeTitle}</h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">{tagline}</p>
            <p className="mt-2 text-[11px] text-slate-400">Calendar week {weekKey}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 self-start">
          <button
            type="button"
            onClick={onShuffleWeek}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Shuffle week
          </button>
          <button
            type="button"
            onClick={onRefreshTheme}
            className="rounded-xl border border-purple-200 bg-white px-4 py-2 text-xs font-semibold text-purple-700 shadow-sm transition hover:bg-purple-50"
          >
            Next theme
          </button>
        </div>
      </div>
    </div>
  );
}
