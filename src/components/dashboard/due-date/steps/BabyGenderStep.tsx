import { Button } from "@/components/ui/button";
import { Baby } from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export function BabyGenderStep({ value, onChange }: Props) {
  const options = [
    { id: "male", label: "Boy", color: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200" },
    { id: "female", label: "Girl", color: "bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200" },
    { id: "prefer_not_to_say", label: "Prefer Not To Say", color: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200" }
  ];

  return (
    <div className="bg-white rounded-[2rem] p-8 text-center shadow-xl shadow-indigo-100/40 animate-in slide-in-from-right-8 duration-500 fill-mode-both">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-white">
        <Baby className="w-10 h-10 text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Little One's Gender</h2>
      <p className="text-slate-500 mb-8">
        What is your baby's gender?
      </p>

      <div className="space-y-4">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`w-full py-5 rounded-2xl border-2 text-lg font-semibold transition-all duration-200 active:scale-95 ${opt.color} ${value === opt.id ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
