import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  processState,
  createInitialInput,
  type PostpartumInput,
  type PostpartumOutput,
  type Stage,
} from '@/lib/postpartumEngine';
import { submitPostpartumCheckin, getCheckinHistory, type CheckinHistoryItem } from '@/api/postpartumApi';

// ── Hook ────────────────────────────────────────────────────────

export interface PostpartumCheckinHook {
  /** Current engine input (accumulated data) */
  input: PostpartumInput;
  /** Current engine output (what to render) */
  output: PostpartumOutput;
  /** Whether we're in the processing animation */
  isProcessing: boolean;
  /** Whether we've reached the RESULT stage */
  hasResult: boolean;
  /** Check-in history */
  history: CheckinHistoryItem[];
  /** Error state */
  error: string | null;
  /** Start the check-in (move from CONGRATS → DELIVERY_TYPE) */
  startCheckin: () => void;
  /** Answer a question (any stage) */
  answerQuestion: (questionId: string, value: string) => void;
  /** Go back one step */
  goBack: () => void;
  /** Reset to beginning */
  resetCheckin: () => void;
  /** Progress info */
  progress: { current: number; total: number };
}

export function usePostpartumCheckin(): PostpartumCheckinHook {
  const [input, setInput] = useState<PostpartumInput>(createInitialInput);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [history, setHistory] = useState<CheckinHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Compute engine output from current input (memoized, stateless)
  const output = useMemo(() => processState(input), [input]);

  // Load history on mount
  useEffect(() => {
    getCheckinHistory().then(h => setHistory(h)).catch(() => {});
  }, []);

  // Detect when engine reaches RESULT → show processing, then reveal
  useEffect(() => {
    if (output.stage !== 'RESULT' || hasResult) return;

    setIsProcessing(true);
    const timeout = setTimeout(() => {
      setIsProcessing(false);
      setHasResult(true);

      // Persist check-in
      const deliveryType = input.deliveryType === 'C_SECTION' ? 'c_section' : 'normal';
      submitPostpartumCheckin({
        deliveryType: deliveryType as 'normal' | 'c_section',
        mental: {
          mood: input.mental.mood,
          anxiety: input.mental.anxiety,
          overwhelm: input.mental.overwhelm,
          sleep: input.mental.sleep,
          bonding: input.mental.bonding,
        },
        physical: input.deliveryType === 'C_SECTION'
          ? {
              incision_pain: input.physical.incision_pain as any,
              wound_healing: input.physical.wound_healing as any,
              mobility: input.physical.mobility as any,
              fever: input.physical.fever as any,
              swelling: input.physical.swelling as any,
            }
          : {
              vaginal_pain: input.physical.vaginal_pain as any,
              bleeding: input.physical.bleeding as any,
              energy: input.physical.energy as any,
              back_pain: input.physical.back_pain as any,
            },
      }).catch(() => {});
    }, 1800);

    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [output.stage, hasResult]);

  // ── Actions ──

  const startCheckin = useCallback(() => {
    setInput(prev => ({ ...prev, stage: 'DELIVERY_TYPE' as Stage }));
  }, []);

  const answerQuestion = useCallback((questionId: string, value: string) => {
    setInput(prev => {
      // Delivery type
      if (questionId === 'delivery_type') {
        return { ...prev, deliveryType: value as 'NORMAL' | 'C_SECTION' };
      }

      // Mental questions
      const mentalKeys = ['mood', 'anxiety', 'overwhelm', 'sleep', 'bonding'];
      if (mentalKeys.includes(questionId)) {
        return { ...prev, mental: { ...prev.mental, [questionId]: value } };
      }

      // Physical questions
      return { ...prev, physical: { ...prev.physical, [questionId]: value } };
    });
  }, []);

  const goBack = useCallback(() => {
    setInput(prev => {
      // From DELIVERY_TYPE → CONGRATS
      if (output.stage === 'DELIVERY_TYPE') {
        return { ...prev, stage: 'CONGRATS' as Stage, deliveryType: null };
      }

      // From MENTAL → undo last mental answer, or go to DELIVERY_TYPE
      if (output.stage === 'MENTAL') {
        const mentalKeys = ['mood', 'anxiety', 'overwhelm', 'sleep', 'bonding'] as const;
        // Find the last answered mental key
        const answered = mentalKeys.filter(k => prev.mental[k] !== null);
        if (answered.length > 0) {
          const lastKey = answered[answered.length - 1];
          return { ...prev, mental: { ...prev.mental, [lastKey]: null } };
        }
        // No mental answered yet → go back to delivery type
        return { ...prev, stage: 'DELIVERY_TYPE' as Stage, deliveryType: null };
      }

      // From PHYSICAL → undo last physical answer, or go to last mental
      if (output.stage === 'PHYSICAL') {
        const physQuestions = prev.deliveryType === 'C_SECTION'
          ? ['incision_pain', 'wound_healing', 'mobility', 'fever', 'swelling']
          : ['vaginal_pain', 'bleeding', 'energy', 'back_pain'];
        const answered = physQuestions.filter(k => k in prev.physical && prev.physical[k] !== null);
        if (answered.length > 0) {
          const lastKey = answered[answered.length - 1];
          const newPhysical = { ...prev.physical };
          delete newPhysical[lastKey];
          return { ...prev, physical: newPhysical };
        }
        // No physical answered yet → undo last mental
        return { ...prev, mental: { ...prev.mental, bonding: null } };
      }

      return prev;
    });
  }, [output.stage]);

  const resetCheckin = useCallback(() => {
    setInput(createInitialInput());
    setIsProcessing(false);
    setHasResult(false);
    setError(null);
  }, []);

  // ── Progress ──
  const mentalTotal = 5;
  const physTotal = input.deliveryType === 'C_SECTION' ? 5 : 4;
  const totalSteps = 1 + mentalTotal + physTotal; // delivery + mental + physical

  let currentStep = 0;
  if (output.stage === 'DELIVERY_TYPE') currentStep = 0;
  else if (output.stage === 'MENTAL') {
    const mentalKeys = ['mood', 'anxiety', 'overwhelm', 'sleep', 'bonding'] as const;
    currentStep = 1 + mentalKeys.filter(k => input.mental[k] !== null).length;
  } else if (output.stage === 'PHYSICAL') {
    const physKeys = input.deliveryType === 'C_SECTION'
      ? ['incision_pain', 'wound_healing', 'mobility', 'fever', 'swelling']
      : ['vaginal_pain', 'bleeding', 'energy', 'back_pain'];
    currentStep = 1 + mentalTotal + physKeys.filter(k => k in input.physical && input.physical[k] !== null).length;
  } else if (output.stage === 'RESULT') {
    currentStep = totalSteps;
  }

  return {
    input,
    output,
    isProcessing,
    hasResult,
    history,
    error,
    startCheckin,
    answerQuestion,
    goBack,
    resetCheckin,
    progress: { current: currentStep, total: totalSteps },
  };
}
