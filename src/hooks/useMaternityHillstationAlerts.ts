import { useState, useEffect, useRef, useCallback } from "react";
import {
  getAllActiveAlerts,
  isAlertAcknowledgedByDoctor,
  acknowledgeAlert,
  type MaternityHillstationAlert,
} from "@/services/maternityAlertStore";
import { patientPhcMatchesDoctorPhc } from "@/lib/phcMatch";
import { runRiskEvaluation, ensureDemoPatients } from "@/services/maternityRiskEvaluator";
import {
  fetchActiveHillstationAlertsForDoctor,
  fetchAcknowledgedAlertIdsForDoctor,
  acknowledgeHillstationAlertOnServer,
} from "@/services/maternityHillstationSupabase";
import { isInHillstationMaternityDeliveryWindow } from "@/lib/maternityHillstationAlertWindow";

const EVALUATOR_INTERVAL = 5 * 60 * 1000;
const POLL_INTERVAL = 10000;

function isRemoteAlertId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function useMaternityHillstationAlerts(
  doctorId: string | undefined,
  doctorPhcCenter: string | undefined,
  doctorPhcLocation?: string | undefined,
) {
  const [alerts, setAlerts] = useState<MaternityHillstationAlert[]>([]);
  const acknowledgedRef = useRef<Set<string>>(new Set());
  const evaluatorStarted = useRef(false);
  const mountedRef = useRef(true);

  const refreshAlerts = useCallback(async () => {
    const center = doctorPhcCenter?.trim();
    const loc = doctorPhcLocation?.trim();
    if (!center && !loc) {
      if (mountedRef.current) setAlerts([]);
      return;
    }

    const local = getAllActiveAlerts().filter((a) =>
      patientPhcMatchesDoctorPhc(a.phc_location, center || undefined, loc || undefined),
    );
    let remote: MaternityHillstationAlert[] = [];
    let remoteAck = new Set<string>();
    try {
      remote = await fetchActiveHillstationAlertsForDoctor(
        center || undefined,
        loc || undefined,
      );
      if (doctorId) {
        remoteAck = await fetchAcknowledgedAlertIdsForDoctor(doctorId);
      }
    } catch {
      /* network */
    }

    const merged: MaternityHillstationAlert[] = [...remote];
    for (const l of local) {
      if (!merged.some((m) => m.patient_id === l.patient_id && m.phc_location === l.phc_location)) {
        merged.push(l);
      }
    }

    const unacknowledged = merged.filter((a) => {
      if (acknowledgedRef.current.has(a.id)) return false;
      if (doctorId && isAlertAcknowledgedByDoctor(a.id, doctorId)) {
        acknowledgedRef.current.add(a.id);
        return false;
      }
      if (doctorId && remoteAck.has(a.id)) {
        acknowledgedRef.current.add(a.id);
        return false;
      }
      return true;
    });

    const inDeliveryWindow = unacknowledged.filter((a) =>
      isInHillstationMaternityDeliveryWindow(a),
    );

    if (mountedRef.current) {
      setAlerts(inDeliveryWindow);
    }
  }, [doctorPhcCenter, doctorPhcLocation, doctorId]);

  useEffect(() => {
    mountedRef.current = true;

    if (!evaluatorStarted.current) {
      evaluatorStarted.current = true;
      ensureDemoPatients();
      runRiskEvaluation();
    }

    void refreshAlerts();

    const evalInterval = setInterval(() => {
      runRiskEvaluation();
    }, EVALUATOR_INTERVAL);

    const pollInterval = setInterval(() => {
      void refreshAlerts();
    }, POLL_INTERVAL);

    const handleStorage = () => {
      void refreshAlerts();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      mountedRef.current = false;
      clearInterval(evalInterval);
      clearInterval(pollInterval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshAlerts]);

  const acknowledge = useCallback(
    async (alertId: string) => {
      acknowledgedRef.current.add(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      if (doctorId && isRemoteAlertId(alertId)) {
        await acknowledgeHillstationAlertOnServer(alertId, doctorId);
      } else if (doctorId) {
        acknowledgeAlert(alertId, doctorId);
      }
    },
    [doctorId],
  );

  return {
    alerts,
    acknowledge,
    refresh: refreshAlerts,
  };
}
