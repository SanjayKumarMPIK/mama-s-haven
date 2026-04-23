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
    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-indigo-100/40 animate-in slide-in-from-right-8 duration-500 fill-mode-both">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Baby Details</h2>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Baby Name</label>
          <Input 
            type="text" 
            placeholder="e.g. Aarav" 
            value={details.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="rounded-xl h-12 text-lg px-4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Birth Weight (kg)</label>
          <Input 
            type="number" 
            step="0.01"
            placeholder="e.g. 3.2" 
            value={details.weight}
            onChange={(e) => onChange({ weight: e.target.value })}
            className="rounded-xl h-12 text-lg px-4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Blood Group</label>
          <div className="grid grid-cols-3 gap-2">
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => onChange({ bloodGroup: bg })}
                className={`py-2 rounded-lg border text-sm font-medium transition-all ${details.bloodGroup === bg ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button 
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-full py-6 text-lg font-semibold shadow-lg shadow-indigo-200 transition-transform active:scale-[0.98] disabled:opacity-50"
          onClick={onNext}
          disabled={!canContinue}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
