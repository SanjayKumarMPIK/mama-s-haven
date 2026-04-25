import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface Props {
  onNext: () => void;
  onSkip: () => void;
}

export function CongratsStep({ onNext, onSkip }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center animate-in zoom-in-95 duration-500 delay-100 fill-mode-both">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Trophy className="w-6 h-6 text-primary" />
      </div>
      <h1 className="text-xl font-bold text-foreground mb-2">
        Congratulations!
      </h1>
      <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
        You've completed a beautiful and challenging chapter of your journey. Welcome to motherhood!
      </p>

      <div className="space-y-3">
        <Button
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-transform active:scale-[0.98]"
          onClick={onNext}
        >
          Continue
        </Button>
        <button
          className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          onClick={onSkip}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
