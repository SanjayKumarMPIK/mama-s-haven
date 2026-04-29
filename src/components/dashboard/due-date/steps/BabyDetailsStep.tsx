import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BabyDetails } from "../CelebrationFlow";

interface Props {
  details: BabyDetails;
  onChange: (updates: Partial<BabyDetails>) => void;
  onNext: () => void;
}

export function BabyDetailsStep({ details, onChange, onNext }: Props) {
  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not Sure"];

  const canContinue = details.name.trim().length > 0 && details.weight.trim().length > 0 && details.bloodGroup !== "";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-in slide-in-from-right-8 duration-500 fill-mode-both">
      <h2 className="text-lg font-bold text-foreground mb-1">Baby Details</h2>
      <p className="text-sm text-muted-foreground mb-6">Enter your baby's information to personalize the experience.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Baby Name</label>
          <Input
            type="text"
            placeholder="e.g. Aarav"
            value={details.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="rounded-lg border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Birth Weight (kg)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g. 3.2"
            value={details.weight}
            onChange={(e) => onChange({ weight: e.target.value })}
            className="rounded-lg border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Blood Group</label>
          <div className="grid grid-cols-3 gap-2">
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => onChange({ bloodGroup: bg })}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  details.bloodGroup === bg
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          onClick={onNext}
          disabled={!canContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
