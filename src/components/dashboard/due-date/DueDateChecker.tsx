import { useState, useEffect } from "react";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { DueDateConfirmationModal } from "./DueDateConfirmationModal";
import { CelebrationFlow } from "./CelebrationFlow";

export function DueDateChecker() {
  const { activeEDD, mode, profile } = usePregnancyProfile();
  const [showModal, setShowModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Only check if we are in pregnancy mode and we have an EDD
    if (!activeEDD || mode !== "pregnancy") return;

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const eddDate = new Date(activeEDD + "T00:00:00");
    eddDate.setHours(0, 0, 0, 0);

    // Condition: today >= expectedDueDate
    if (eddDate.getTime() <= todayDate.getTime()) {
      if (profile.userEDD && profile.userEDD === activeEDD) {
        setShowCelebration(true);
      } else {
        const hasAsked = sessionStorage.getItem(`due_date_asked_${activeEDD}`);
        if (!hasAsked) {
          setShowModal(true);
        }
      }
    }
  }, [activeEDD, mode, profile.userEDD]);

  if (showCelebration) {
    return <CelebrationFlow onClose={() => setShowCelebration(false)} />;
  }

  if (showModal) {
    return (
      <DueDateConfirmationModal 
        onClose={() => {
          sessionStorage.setItem(`due_date_asked_${activeEDD}`, "true");
          setShowModal(false);
        }}
        onYes={() => {
          sessionStorage.setItem(`due_date_asked_${activeEDD}`, "true");
          setShowModal(false);
          setShowCelebration(true);
        }}
      />
    );
  }

  return null;
}
