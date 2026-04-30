import { Sparkles } from "lucide-react";

interface MotivationalNudgeProps {
  message: string;
}

export default function MotivationalNudge({ message }: MotivationalNudgeProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-4 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-800 mb-0.5">Daily Motivation</p>
          <p className="text-sm text-amber-700 leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}
