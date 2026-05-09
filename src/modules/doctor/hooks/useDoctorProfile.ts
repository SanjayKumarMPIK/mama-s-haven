import { useState, useCallback } from "react";
import { generateDoctorCode } from "@/lib/doctorCode";

const LS_KEY = "ss-doctor-profile";

interface DoctorProfileData {
  doctorCode: string;
  name: string;
  specialty: string;
  hospital: string;
  clinic: string;
  experience: string;
  contact: string;
  email: string;
  address: string;
  qualifications: string[];
  timings: string;
}

const DEFAULT_PROFILE: DoctorProfileData = {
  name: "Dr. Ananya Sharma",
  specialty: "Gynecologist & Obstetrician",
  hospital: "City General Hospital",
  clinic: "Women's Health Clinic, MG Road",
  experience: "12 years",
  contact: "+91 98765 43210",
  email: "dr.ananya@womenshealth.com",
  address: "Bangalore, Karnataka",
  qualifications: [
    "MBBS",
    "MD (Obstetrics & Gynecology)",
    "Fellowship in Reproductive Medicine",
  ],
  timings: "Mon - Sat: 9:00 AM - 5:00 PM",
};

function load(): DoctorProfileData {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DoctorProfileData;
      if (parsed.doctorCode) return parsed;
    }
  } catch {
    /* ignore */
  }
  const fresh: DoctorProfileData = {
    ...DEFAULT_PROFILE,
    doctorCode: generateDoctorCode(),
  };
  save(fresh);
  return fresh;
}

function save(profile: DoctorProfileData) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export function useDoctorProfile() {
  const [profile, setProfileState] = useState<DoctorProfileData>(load);

  const updateProfile = useCallback(
    (updates: Partial<Omit<DoctorProfileData, "doctorCode">>) => {
      setProfileState((prev) => {
        const next = { ...prev, ...updates };
        save(next);
        return next;
      });
    },
    [],
  );

  const resetProfile = useCallback(() => {
    const fresh: DoctorProfileData = {
      ...DEFAULT_PROFILE,
      doctorCode: generateDoctorCode(),
    };
    save(fresh);
    setProfileState(fresh);
  }, []);

  return {
    profile,
    doctorCode: profile.doctorCode,
    updateProfile,
    resetProfile,
  };
}

export function getDoctorCode(): string | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DoctorProfileData;
      return parsed.doctorCode ?? null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export type { DoctorProfileData };
