import { Button } from "@/components/ui/button";
import { Baby } from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export function BabyGenderStep({ value, onChange }: Props) {
  const options = [
    { id: "male", label: "Boy" },
    { id: "female", label: "Girl" },
    { id: "prefer_not_to_say", label: "Prefer Not To Say" }
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-in slide-in-from-right-8 duration-500 fill-mode-both">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Baby className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Baby's Gender</h2>
          <p className="text-sm text-muted-foreground">Select your baby's gender</p>
        </div>
      </div>

      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`w-full p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] text-left ${
              value === opt.id
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-border bg-background text-foreground hover:border-primary/30'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
