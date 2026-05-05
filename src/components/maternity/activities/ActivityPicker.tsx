import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { activitiesForActivityPicker } from "./SchedulerEngine";
import { maternityActivitiesData } from "@/components/maternity/MaternityActivities";
import type { DatasetMaternityStage } from "./SchedulerUtils";
import { formatDifficultyLabel } from "./SchedulerUtils";
import { cn } from "@/lib/utils";

interface ActivityPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: DatasetMaternityStage;
  themeId: string;
  onPick: (activityId: string) => void;
}

export default function ActivityPicker({ open, onOpenChange, stage, themeId, onPick }: ActivityPickerProps) {
  const [q, setQ] = useState("");
  const pool = useMemo(
    () => activitiesForActivityPicker(maternityActivitiesData, stage, themeId),
    [stage, themeId],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return pool;
    return pool.filter(
      (a) =>
        a.name.toLowerCase().includes(s) ||
        a.category.toLowerCase().includes(s) ||
        a.targetAreas.some((t) => t.toLowerCase().includes(s)),
    );
  }, [pool, q]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setQ("");
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-hidden border-slate-200 bg-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Choose a replacement</DialogTitle>
          <p className="text-left text-xs font-normal text-slate-500">
            Only activities cleared for your current stage and weekly theme are shown.
          </p>
        </DialogHeader>
        <Input
          placeholder="Search by name, category, or area…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border-slate-200"
        />
        <ul className="-mx-1 max-h-[50vh] space-y-1 overflow-y-auto px-1 py-1">
          {filtered.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(a.id);
                  setQ("");
                }}
                className={cn(
                  "flex w-full flex-col rounded-xl border border-transparent px-3 py-2.5 text-left transition",
                  "hover:border-purple-200 hover:bg-purple-50/60",
                )}
              >
                <span className="text-sm font-semibold text-slate-800">{a.name}</span>
                <span className="text-[11px] text-slate-500">{a.category}</span>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500">
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                    {a.durationMinutes} min
                  </span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                    {formatDifficultyLabel(a.difficulty)}
                  </span>
                  <span className="line-clamp-1">{a.targetAreas.join(" · ")}</span>
                </div>
              </button>
            </li>
          ))}
          {!filtered.length ? (
            <li className="py-8 text-center text-sm text-slate-500">No matches for that search.</li>
          ) : null}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
