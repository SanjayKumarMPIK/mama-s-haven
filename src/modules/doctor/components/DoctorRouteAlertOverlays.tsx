import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useDoctorAuth } from "@/modules/doctor/hooks/useDoctorAuth";
import { SOSEmergencyPopup, useDoctorSOSAlerts } from "@/modules/doctor/components/SOSEmergencyPopup";
import { MaternityHillstationPopup } from "@/modules/doctor/components/MaternityHillstationPopup";
import { useMaternityHillstationAlerts } from "@/hooks/useMaternityHillstationAlerts";
import { supabaseDoctorClient } from "@/lib/supabase-doctor";
import type { SOSStatus } from "@/lib/sosStore";

interface RouteAlertCounts {
  pendingSos: number;
  maternityHillstation: number;
}

const CountsContext = createContext<RouteAlertCounts>({
  pendingSos: 0,
  maternityHillstation: 0,
});

export function useDoctorRouteAlertCounts(): RouteAlertCounts {
  return useContext(CountsContext);
}

/**
 * Mount once per authenticated doctor route: SOS + hillstation maternity popups
 * and shared counts for dashboard stats (no duplicate hooks per page).
 */
export function DoctorRouteAlertProvider({ children }: { children: ReactNode }) {
  const { doctorProfile, refreshDoctorProfile } = useDoctorAuth();
  const lastProfileKey = useRef<string>("");

  useEffect(() => {
    void refreshDoctorProfile();
  }, [refreshDoctorProfile]);

  const {
    pendingAlerts: pendingSOSAlerts,
    acknowledgeAlertLocally: dismissSOSPopup,
    refresh: refreshSosAlerts,
  } = useDoctorSOSAlerts(doctorProfile?.id, { pollInterval: 5000 });

  const {
    alerts: maternityHillstationAlerts,
    acknowledge: acknowledgeMaternityAlert,
    refresh: refreshMaternityAlerts,
  } = useMaternityHillstationAlerts(
    doctorProfile?.id,
    doctorProfile?.phc_center,
    doctorProfile?.phc_location,
  );

  /** After login or PHC profile change: pull hillstation + SOS alerts immediately. */
  useEffect(() => {
    if (!doctorProfile?.id) {
      lastProfileKey.current = "";
      return;
    }
    const key = `${doctorProfile.id}|${doctorProfile.phc_center ?? ""}|${doctorProfile.phc_location ?? ""}`;
    if (key === lastProfileKey.current) return;
    lastProfileKey.current = key;
    void refreshMaternityAlerts();
    void refreshSosAlerts();
  }, [
    doctorProfile?.id,
    doctorProfile?.phc_center,
    doctorProfile?.phc_location,
    refreshMaternityAlerts,
    refreshSosAlerts,
  ]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseDoctorClient.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN") return;
      void refreshDoctorProfile().then(() => {
        void refreshMaternityAlerts();
        void refreshSosAlerts();
      });
    });
    return () => subscription.unsubscribe();
  }, [refreshDoctorProfile, refreshMaternityAlerts, refreshSosAlerts]);

  const counts = useMemo<RouteAlertCounts>(
    () => ({
      pendingSos: pendingSOSAlerts.length,
      maternityHillstation: maternityHillstationAlerts.length,
    }),
    [pendingSOSAlerts.length, maternityHillstationAlerts.length],
  );

  const handleSOSAction = useCallback((_sosId: string, _status: SOSStatus) => {
    // Status updates are handled inside SOSEmergencyPopup / sosStore
  }, []);

  return (
    <CountsContext.Provider value={counts}>
      {children}
      {pendingSOSAlerts.length > 0 && (
        <SOSEmergencyPopup
          alert={pendingSOSAlerts[0]}
          onAction={(sosId, status) => {
            dismissSOSPopup(sosId);
            handleSOSAction(sosId, status);
          }}
        />
      )}
      {pendingSOSAlerts.length === 0 && maternityHillstationAlerts.length > 0 && (
        <MaternityHillstationPopup
          alert={maternityHillstationAlerts[0]}
          onAcknowledge={(id) => void acknowledgeMaternityAlert(id)}
        />
      )}
    </CountsContext.Provider>
  );
}
