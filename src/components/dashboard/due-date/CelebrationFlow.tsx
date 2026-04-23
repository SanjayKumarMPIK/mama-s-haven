import { useState } from "react";
import { CelebrationEffects } from "./CelebrationEffects";
import { CongratsStep } from "./steps/CongratsStep";
import { BabyGenderStep } from "./steps/BabyGenderStep";
import { BabyDetailsStep } from "./steps/BabyDetailsStep";
import { CompletionSummaryStep } from "./steps/CompletionSummaryStep";

export type BabyDetails = {
  gender: string;
  name: string;
  weight: string;
  bloodGroup: string;
};

interface Props {
  onClose: () => void;
}

export function CelebrationFlow({ onClose }: Props) {
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<BabyDetails>({
    gender: "",
    name: "",
    weight: "",
    bloodGroup: ""
  });

  const nextStep = () => setStep((s) => s + 1);

  const updateDetails = (updates: Partial<BabyDetails>) => {
    setDetails((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-100/60 via-transparent to-transparent pointer-events-none" />

      {/* Confetti / Burst effect triggers primarily on step 1 */}
      {step === 1 && <CelebrationEffects />}

      <div className="relative z-10 w-full max-w-md px-4">
        {step === 1 && <CongratsStep onNext={nextStep} onSkip={() => setStep(4)} />}
        {step === 2 && <BabyGenderStep value={details.gender} onChange={(val) => { updateDetails({ gender: val }); nextStep(); }} />}
        {step === 3 && <BabyDetailsStep details={details} onChange={(updates) => updateDetails(updates)} onNext={nextStep} />}
        {step === 4 && <CompletionSummaryStep details={details} onClose={onClose} />}

        {/* Minimal Progress indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-rose-400" : i < step ? "w-2 bg-rose-200" : "w-2 bg-slate-200"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
