import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { fetchOrSeedDoctorProfile } from '../utils/seedDoctorProfiles';
import type { DoctorProfile } from '../types/doctorProfile';

// ─── Context Shape ────────────────────────────────────────────────────────────
interface DoctorAuthContextType {
  doctorProfile: DoctorProfile | null;
  isDoctorLoading: boolean;
  isDoctorLoggedIn: boolean;
  loginAsDoctor: (email: string, password: string) => Promise<boolean>;
  logoutDoctor: () => Promise<void>;
  refreshDoctorProfile: () => Promise<void>;
}

const DoctorAuthContext = createContext<DoctorAuthContextType>({
  doctorProfile: null,
  isDoctorLoading: true,
  isDoctorLoggedIn: false,
  loginAsDoctor: async () => false,
  logoutDoctor: async () => {},
  refreshDoctorProfile: async () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────
export function DoctorAuthProvider({ children }: { children: ReactNode }) {
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [isDoctorLoading, setIsDoctorLoading] = useState(true);

  // Attempt to restore doctor session from existing Supabase session
  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      // Always check the Supabase session — do NOT gate on ss-role.
      // If the role is missing from sessionStorage (new tab, cleared storage)
      // but a valid Supabase session exists, the doctor should stay logged in.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (mounted) setIsDoctorLoading(false);
        return;
      }

      // Returns null for non-doctor accounts (no doctor_profiles row + email
      // not in the seed list), so this is safe to call for any logged-in user.
      const profile = await fetchOrSeedDoctorProfile(
        session.user.id,
        session.user.email ?? '',
      );

      if (mounted) {
        setDoctorProfile(profile);
        // If we found a doctor profile but role wasn't set, set it now
        if (profile) {
          sessionStorage.setItem('ss-role', 'doctor');
        }
        setIsDoctorLoading(false);
      }
    }

    restoreSession();

    // Also listen for sign-out events to clear state
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        if (mounted) {
          setDoctorProfile(null);
          setIsDoctorLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // ── loginAsDoctor ──────────────────────────────────────────────────────────
  const loginAsDoctor = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsDoctorLoading(true);

      // 1. Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user) {
        toast.error(error?.message ?? 'Invalid credentials. Please try again.');
        setIsDoctorLoading(false);
        return false;
      }

      // 2. Verify / seed doctor_profiles row
      const profile = await fetchOrSeedDoctorProfile(
        data.user.id,
        data.user.email ?? email,
      );

      if (!profile) {
        // Valid Supabase auth account but NOT a registered doctor
        toast.error(
          'This account is not registered as a doctor. Please contact the administrator.',
        );
        await supabase.auth.signOut();
        setIsDoctorLoading(false);
        return false;
      }

      setDoctorProfile(profile);
      setIsDoctorLoading(false);
      toast.success(`Welcome back, ${profile.full_name}!`);
      return true;
    },
    [],
  );

  // ── logoutDoctor ───────────────────────────────────────────────────────────
  const logoutDoctor = useCallback(async () => {
    setDoctorProfile(null);
    await supabase.auth.signOut();
    sessionStorage.removeItem('ss-role');
    localStorage.removeItem('ss-role');
    toast.info('Logged out successfully.');
    setTimeout(() => {
      window.location.href = '/';
    }, 400);
  }, []);

  // ── refreshDoctorProfile ───────────────────────────────────────────────────
  const refreshDoctorProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;
    const profile = await fetchOrSeedDoctorProfile(
      session.user.id,
      session.user.email ?? '',
    );
    setDoctorProfile(profile);
  }, []);

  return (
    <DoctorAuthContext.Provider
      value={{
        doctorProfile,
        isDoctorLoading,
        isDoctorLoggedIn: !!doctorProfile,
        loginAsDoctor,
        logoutDoctor,
        refreshDoctorProfile,
      }}
    >
      {children}
    </DoctorAuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useDoctorAuth(): DoctorAuthContextType {
  const ctx = useContext(DoctorAuthContext);
  if (!ctx) throw new Error('useDoctorAuth must be used within DoctorAuthProvider');
  return ctx;
}
