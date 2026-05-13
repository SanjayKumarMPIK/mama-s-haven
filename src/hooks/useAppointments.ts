import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Appointment,
  AppointmentStatus,
  AppointmentFilter,
  APPOINTMENTS_STORAGE_KEY,
} from "@/lib/appointments/appointmentTypes";

// ─── Storage Functions ───────────────────────────────────────────────────────────

function loadAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveAppointments(appointments: Appointment[]) {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  } catch {}
}

// ─── Supabase Cloud Sync ─────────────────────────────────────────────────────────

async function upsertAppointmentsCloud(appointments: Appointment[]): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    await (supabase as any).from("maternity_appointments").upsert(
      {
        user_id: session.user.id,
        appointments,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch {
    /* silent — localStorage is the fallback */
  }
}

// ─── Status Logic ────────────────────────────────────────────────────────────────

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isDatePast(dateISO: string): boolean {
  const today = getTodayISO();
  return dateISO < today;
}

function isDateToday(dateISO: string): boolean {
  const today = getTodayISO();
  return dateISO === today;
}

function updateStatusForPastAppointments(appointments: Appointment[]): Appointment[] {
  const today = getTodayISO();
  return appointments.map((apt) => {
    // Only auto-update if it's still "upcoming" and date has passed
    if (apt.status === "upcoming" && apt.date < today) {
      return { ...apt, status: "missed", updatedAt: new Date().toISOString() };
    }
    return apt;
  });
}

// ─── Main Hook ───────────────────────────────────────────────────────────────────

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const loaded = loadAppointments();
    return updateStatusForPastAppointments(loaded);
  });

  // Load from Supabase on auth (cloud → local merge)
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id;
      if (!uid) return;
      try {
        const { data: row, error } = await (supabase as any)
          .from("maternity_appointments")
          .select("*")
          .eq("user_id", uid)
          .maybeSingle();
        if (error || !row) return;
        if (row.appointments && (row.appointments as Appointment[]).length > 0) {
          const cloudAppts = updateStatusForPastAppointments(row.appointments as Appointment[]);
          setAppointments(cloudAppts);
          saveAppointments(cloudAppts);
        }
      } catch { /* silent */ }
    });
  }, []);

  // Save to localStorage + Supabase whenever appointments change
  useEffect(() => {
    saveAppointments(appointments);
    upsertAppointmentsCloud(appointments);
  }, [appointments]);

  // ── CRUD Operations ─────────────────────────────────────────────────────────────

  const addAppointment = useCallback(
    (appointment: Omit<Appointment, "id" | "status" | "createdAt" | "updatedAt">) => {
      const newAppointment: Appointment = {
        ...appointment,
        id: crypto.randomUUID(),
        status: "upcoming",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAppointments((prev) => [...prev, newAppointment]);
    },
    []
  );

  const updateAppointment = useCallback(
    (id: string, updates: Partial<Omit<Appointment, "id" | "createdAt">>) => {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id
            ? { ...apt, ...updates, updatedAt: new Date().toISOString() }
            : apt
        )
      );
    },
    []
  );

  const deleteAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
  }, []);

  const markAsCompleted = useCallback((id: string) => {
    updateAppointment(id, { status: "completed" });
  }, [updateAppointment]);

  const markAsMissed = useCallback((id: string) => {
    updateAppointment(id, { status: "missed" });
  }, [updateAppointment]);

  const rescheduleAppointment = useCallback(
    (id: string, newDate: string, newTime: string) => {
      updateAppointment(id, { date: newDate, time: newTime, status: "rescheduled" });
    },
    [updateAppointment]
  );

  // ── Filtering ───────────────────────────────────────────────────────────────────

  const getFilteredAppointments = useCallback(
    (filter: AppointmentFilter): Appointment[] => {
      const today = getTodayISO();
      const currentMonth = today.slice(0, 7); // YYYY-MM

      let filtered = appointments;

      switch (filter) {
        case "upcoming":
          filtered = appointments.filter((apt) => apt.status === "upcoming");
          break;
        case "completed":
          filtered = appointments.filter((apt) => apt.status === "completed");
          break;
        case "missed":
          filtered = appointments.filter((apt) => apt.status === "missed");
          break;
        case "this_month":
          filtered = appointments.filter((apt) => apt.date.startsWith(currentMonth));
          break;
        case "all":
        default:
          // No filtering
          break;
      }

      return filtered;
    },
    [appointments]
  );

  // ── Sorting ─────────────────────────────────────────────────────────────────────

  const getSortedAppointments = useCallback(
    (appointmentsToSort: Appointment[]): Appointment[] => {
      return [...appointmentsToSort].sort((a, b) => {
        // Sort by date first
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        // Then by time
        return a.time.localeCompare(b.time);
      });
    },
    []
  );

  // ── Computed Values ─────────────────────────────────────────────────────────────

  const upcomingAppointments = useMemo(
    () => getSortedAppointments(getFilteredAppointments("upcoming")),
    [getFilteredAppointments, getSortedAppointments]
  );

  const pastAppointments = useMemo(() => {
    const past = appointments.filter(
      (apt) => apt.status === "completed" || apt.status === "missed" || apt.status === "rescheduled"
    );
    return getSortedAppointments(past);
  }, [appointments, getSortedAppointments]);

  const todayAppointments = useMemo(() => {
    const today = getTodayISO();
    return appointments.filter((apt) => apt.date === today);
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    const today = getTodayISO();
    const upcoming = appointments
      .filter((apt) => apt.status === "upcoming" && apt.date >= today)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
    return upcoming[0] || null;
  }, [appointments]);

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      upcoming: appointments.filter((a) => a.status === "upcoming").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      missed: appointments.filter((a) => a.status === "missed").length,
      rescheduled: appointments.filter((a) => a.status === "rescheduled").length,
    };
  }, [appointments]);

  // ── Return API ─────────────────────────────────────────────────────────────────

  return {
    // Data
    appointments,
    upcomingAppointments,
    pastAppointments,
    todayAppointments,
    nextAppointment,
    stats,

    // CRUD
    addAppointment,
    updateAppointment,
    deleteAppointment,
    markAsCompleted,
    markAsMissed,
    rescheduleAppointment,

    // Utilities
    getFilteredAppointments,
    getSortedAppointments,
  };
}
