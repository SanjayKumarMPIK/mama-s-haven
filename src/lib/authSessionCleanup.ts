/**
 * Clears app-side caches tied to the mother (user) Supabase session.
 * Call after `supabaseUserClient.auth.signOut` so tokens are revoked first.
 */
export function clearUserSessionCaches(options?: { onboardingUserId?: string }): void {
  try {
    if (options?.onboardingUserId) {
      localStorage.removeItem(`ss-onboarding-${options.onboardingUserId}`);
    }
    localStorage.removeItem('ss-onboarding');

    const keys = [
      'swasthyasakhi_user',
      'ss-wellness-profile',
      'ss-phase',
      'mh-profile',
      'swasthya-user-auth',
    ];
    for (const k of keys) {
      localStorage.removeItem(k);
    }
    sessionStorage.removeItem('ss-role');
    localStorage.removeItem('ss-role');
    sessionStorage.removeItem('ss-active-doctor-code');
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Clears app-side caches tied to the doctor Supabase session.
 * Call after `supabaseDoctorClient.auth.signOut`.
 */
export function clearDoctorSessionCaches(): void {
  try {
    const keys = [
      'ss-doctor-profile',
      'doctor-schedules',
      'ss-maternity-doctor-alerts',
      'ss-doctor-profiles',
      'ss-doctor-ask-questions',
      'ss-doctor-ask-quota',
      'swasthya-doctor-auth',
    ];
    for (const k of keys) {
      localStorage.removeItem(k);
    }
    sessionStorage.removeItem('ss-role');
    localStorage.removeItem('ss-role');
  } catch {
    /* ignore */
  }
}
