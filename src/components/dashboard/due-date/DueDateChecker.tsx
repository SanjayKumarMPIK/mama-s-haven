import { useState, useEffect } from "react";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { DueDateConfirmationModal } from "./DueDateConfirmationModal";
import { CelebrationFlow } from "./CelebrationFlow";

export function DueDateChecker() {
  const { activeEDD, mode, profile } = usePregnancyProfile();
  const [showModal, setShowModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Only check if we have an EDD (regardless of mode - handle postpartum mode too)
    if (!activeEDD) return;

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const eddDate = new Date(activeEDD + "T00:00:00");
    eddDate.setHours(0, 0, 0, 0);

    console.log("=== DueDateChecker Debug ===");
    console.log("Active EDD:", activeEDD);
    console.log("Today:", todayDate.toISOString());
    console.log("EDD Date:", eddDate.toISOString());
    console.log("Mode:", mode);
    console.log("Is Delivered:", profile.delivery.isDelivered);
    console.log("User EDD:", profile.userEDD);
    console.log("Delivery Transition Completed:", profile.deliveryTransitionCompleted);
    console.log("==========================");

    // Condition: today >= expectedDueDate
    if (eddDate.getTime() <= todayDate.getTime()) {
      console.log("EDD is today or past - checking celebration trigger");

      // Check if delivery transition has already been completed
      if (profile.deliveryTransitionCompleted) {
        console.log("Delivery transition already completed, skipping celebration");
        return;
      }

      // Check if delivery has already been confirmed
      if (profile.delivery.isDelivered) {
        console.log("Already delivered, skipping celebration");
        // Already delivered, don't show celebration again
        return;
      }

      // Check if celebration was already shown
      const celebrationShown = sessionStorage.getItem(`due_date_celebration_shown_${activeEDD}`);
      if (celebrationShown === "true") {
        console.log("Celebration already shown, skipping");
        // Already went through celebration, don't show again
        return;
      }

      if (profile.userEDD && profile.userEDD === activeEDD) {
        console.log("User EDD matches, showing celebration");
        setShowCelebration(true);
      } else {
        const hasAsked = sessionStorage.getItem(`due_date_asked_${activeEDD}`);
        if (!hasAsked) {
          console.log("Showing confirmation modal");
          setShowModal(true);
        } else {
          console.log("Already asked, showing celebration");
          setShowCelebration(true);
        }
      }
    } else {
      console.log("EDD is in the future, not triggering");
    }
  }, [activeEDD, mode, profile.userEDD, profile.delivery.isDelivered, profile.deliveryTransitionCompleted]);

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
