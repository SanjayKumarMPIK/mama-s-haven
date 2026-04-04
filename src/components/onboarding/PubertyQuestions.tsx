import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PubertyOnboardingData } from "@/hooks/useOnboarding";

interface PubertyQuestionsProps {
  onComplete: (data: PubertyOnboardingData) => void;
  onBack: () => void;
}

type QuestionId = keyof PubertyOnboardingData | "completion";

interface QuestionDef {
  id: QuestionId;
  title: string;
  subtitle?: string;
  options: string[];
}

const QUESTIONS: QuestionDef[] = [
  {
    id: "has_started_periods",
    title: "Have you started your periods?",
    options: ["Yes", "Not yet"],
  },
  {
    id: "cramps",
    title: "Do you usually experience cramps during your cycle?",
    options: ["Yes", "No", "Not sure"],
  },
  {
    id: "mood_swings",
    title: "Do your moods change during your cycle?",
    options: ["Yes, a lot", "Sometimes", "Not really"],
  },
  {
    id: "fatigue",
    title: "Do you feel tired or low on energy during your cycle?",
    options: ["Often", "Sometimes", "Rarely"],
  },
  {
    id: "acne",
    title: "Do you notice acne or skin changes regularly?",
    options: ["Yes", "Sometimes", "No"],
  },
  {
    id: "sleep_hours",
    title: "How many hours do you usually sleep?",
    options: ["Less than 5 hours", "5–7 hours", "7+ hours"],
  },
  {
    id: "sleep_impact",
    title: "Does your cycle affect your sleep?",
    options: ["Yes", "No", "Not sure"],
  },
  {
    id: "skin_impact",
    title: "Does your cycle impact your skin?",
    options: ["Yes", "No", "Not sure"],
  },
];

export default function PubertyQuestions({ onComplete, onBack }: PubertyQuestionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState<PubertyOnboardingData>({});
  
  // Custom transition state could go here

  const currentQ = QUESTIONS[currentIndex];
  // Calculate total questions for progress (excluding the completion step object)
  const totalQuestions = QUESTIONS.length;
  const isCompleting = currentIndex >= totalQuestions;

  const handleSelect = (val: string) => {
    let nextData = { ...data };
    
    if (currentQ.id === "has_started_periods") {
      nextData.has_started_periods = val === "Yes";
    } else {
      (nextData as any)[currentQ.id] = val;
    }

    setData(nextData);
  };

  const handleNext = () => {
    // Basic skip logic
    let nextIndex = currentIndex + 1;
    if (currentIndex === 0 && data.has_started_periods === false) {
      // Skip cramps (1), mood_swings (2), fatigue (3) to go straight to acne (4)
      nextIndex = 4;
    }

    if (nextIndex >= totalQuestions) {
      setCurrentIndex(nextIndex); // Move to completing state
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (currentIndex === 0) {
      onBack();
      return;
    }

    let prevIndex = currentIndex - 1;
    // Walk back logic handling skips
    if (currentIndex === 4 && data.has_started_periods === false) {
      prevIndex = 0; // Go back to the first question
    }
    setCurrentIndex(prevIndex);
  };

  const handleFinalComplete = () => {
    onComplete(data);
  };

  if (isCompleting) {
    return (
      <div className="animate-fadeIn text-center flex flex-col justify-center items-center h-full max-w-md mx-auto py-20 px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">You're all set 🎉</h2>
        <p className="text-slate-600 mb-10 leading-relaxed text-lg">
          We’ll personalize your experience based on your answers.
        </p>
        <button
          onClick={handleFinalComplete}
          className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
        >
          Go to Dashboard <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Get current answer
  const currentAnswer = currentQ.id === "has_started_periods" 
      ? (data.has_started_periods === true ? "Yes" : data.has_started_periods === false ? "Not yet" : undefined)
      : (data as any)[currentQ.id];

  return (
    <div className="animate-fadeIn w-full max-w-xl mx-auto flex flex-col h-[70vh] sm:h-auto min-h-[400px]">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handlePrevious}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 max-w-[200px] mx-4 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        <button 
          onClick={handleNext} 
          className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors px-2"
        >
          Skip
        </button>
      </div>

      {/* Center: Question */}
      <div className="flex-1 flex flex-col justify-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 leading-tight">
          {currentQ.title}
        </h2>
        {currentQ.subtitle && (
          <p className="text-slate-500 text-sm sm:text-base">
            {currentQ.subtitle}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {currentQ.options.map((opt) => {
          const isSelected = currentAnswer === opt;
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium",
                isSelected
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center justify-between">
                <span>{opt}</span>
                {isSelected && <Check className="w-5 h-5 text-primary" />}
              </div>
            </button>
          );
        })}
        {currentAnswer && (
          <p className="text-sm text-primary font-medium text-center animate-fadeIn pt-2">
            Got it — we’ll use this to understand your patterns better.
          </p>
        )}
      </div>

      {/* Bottom: Next Button */}
      <div className="mt-auto pb-4">
        <button
          onClick={handleNext}
          disabled={currentAnswer === undefined}
          className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 disabled:hover:shadow-none"
        >
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
