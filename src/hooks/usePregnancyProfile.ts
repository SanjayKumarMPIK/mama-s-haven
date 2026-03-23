import { createContext, createElement, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentWeek, getDaysRemaining, getTrimester, getProgressPercentage } from "@/lib/pregnancyData";
import type { Region } from "@/lib/nutritionData";

export interface PregnancyProfile {
  name: string;
  dueDate: string;
  region: Region;
  isSetup: boolean;
}

const STORAGE_KEY = "mh-profile";

function loadProfile(): PregnancyProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...JSON.parse(stored), isSetup: true };
    }
  } catch {}
  return { name: "", dueDate: "", region: "north", isSetup: false };
}

interface PregnancyProfileContextType {
  profile: PregnancyProfile;
  saveProfile: (data: Omit<PregnancyProfile, "isSetup">) => void;
  clearProfile: () => void;
  currentWeek: number;
  daysLeft: number;
  trimester: number;
  progress: number;
}

const PregnancyProfileContext = createContext<PregnancyProfileContextType>({
  profile: { name: "", dueDate: "", region: "north", isSetup: false },
  saveProfile: () => {},
  clearProfile: () => {},
  currentWeek: 1,
  daysLeft: 280,
  trimester: 1,
  progress: 0,
});

export function PregnancyProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PregnancyProfile>(loadProfile);

  useEffect(() => {
    if (profile.isSetup) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch {}
    }
  }, [profile]);

  const saveProfile = useCallback((data: Omit<PregnancyProfile, "isSetup">) => {
    setProfile({ ...data, isSetup: true });
  }, []);

  const clearProfile = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setProfile({ name: "", dueDate: "", region: "north", isSetup: false });
  }, []);

  const currentWeek = profile.dueDate ? getCurrentWeek(profile.dueDate) : 1;
  const daysLeft = profile.dueDate ? getDaysRemaining(profile.dueDate) : 280;
  const trimester = getTrimester(currentWeek);
  const progress = getProgressPercentage(currentWeek);

  const value: PregnancyProfileContextType = {
    profile,
    saveProfile,
    clearProfile,
    currentWeek,
    daysLeft,
    trimester,
    progress,
  };

  return createElement(PregnancyProfileContext.Provider, { value }, children);
}

export function usePregnancyProfile() {
  return useContext(PregnancyProfileContext);
}
