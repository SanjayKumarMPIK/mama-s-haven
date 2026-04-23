import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface Props {
  onNext: () => void;
  onSkip: () => void;
}

export function CongratsStep({ onNext, onSkip }: Props) {
  return (
    <div className="bg-white rounded-[2rem] p-8 text-center shadow-xl shadow-rose-100/50 animate-in zoom-in-95 duration-500 delay-100 fill-mode-both">
      <div className="w-24 h-24 bg-gradient-to-tr from-amber-200 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-amber-50">
        <Trophy className="w-12 h-12 text-amber-500" />
      </div>
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500 mb-4 font-serif">
        Congratulations!
      </h1>
      <p className="text-slate-600 mb-8 text-lg leading-relaxed">
        You've completed a beautiful and challenging chapter of your journey. Welcome to motherhood!
      </p>

      <div className="space-y-4">
        <Button 
          className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-full py-6 text-lg font-semibold shadow-lg shadow-rose-200 transition-transform active:scale-[0.98]"
          onClick={onNext}
        >
          Continue
        </Button>
        <button 
          className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
          onClick={onSkip}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
