import { useState, useEffect } from "react";
import type { Schedule, ScheduleFormData, ScheduleStatus, SchedulePriority } from "../types/schedule";

const STORAGE_KEY = "doctor-schedules";

let scheduleCounter = 1000;

const generateId = (): string => {
  scheduleCounter++;
  return `SCH-${scheduleCounter}`;
};

const getStoredSchedules = (): Schedule[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const schedules = JSON.parse(stored);
      // Update counter based on max ID
      const maxId = schedules.reduce((max: number, s: Schedule) => {
        const num = parseInt(s.id.replace("SCH-", ""));
        return num > max ? num : max;
      }, 1000);
      scheduleCounter = maxId;
      return schedules;
    }
  } catch (error) {
    console.error("Error loading schedules:", error);
  }
  return [];
};

const saveSchedules = (schedules: Schedule[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.error("Error saving schedules:", error);
  }
};

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = getStoredSchedules();
    setSchedules(loaded);
    setIsLoading(false);
  }, []);

  const createSchedule = (formData: ScheduleFormData): Schedule => {
    const newSchedule: Schedule = {
      id: generateId(),
      ...formData,
      status: formData.scheduleType === "Emergency" ? "Emergency" : "Scheduled",
      createdAt: new Date().toISOString(),
    };
    
    const updated = [...schedules, newSchedule];
    setSchedules(updated);
    saveSchedules(updated);
    return newSchedule;
  };

  const updateSchedule = (id: string, updates: Partial<Schedule>): void => {
    const updated = schedules.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    setSchedules(updated);
    saveSchedules(updated);
  };

  const deleteSchedule = (id: string): void => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    saveSchedules(updated);
  };

  const markComplete = (id: string): void => {
    updateSchedule(id, { status: "Completed" });
  };

  const markCancelled = (id: string): void => {
    updateSchedule(id, { status: "Cancelled" });
  };

  const markEmergency = (id: string): void => {
    updateSchedule(id, { status: "Emergency", priority: "Critical" });
  };

  const reschedule = (id: string, newDate: string, newTime: string): void => {
    updateSchedule(id, { scheduleDate: newDate, scheduleTime: newTime, status: "Rescheduled" });
  };

  const getTodaySchedules = (): Schedule[] => {
    const today = new Date().toISOString().split("T")[0];
    return schedules.filter((s) => s.scheduleDate === today && s.status !== "Cancelled");
  };

  const getUpcomingSchedules = (): Schedule[] => {
    const today = new Date().toISOString().split("T")[0];
    return schedules.filter(
      (s) => s.scheduleDate > today && s.status !== "Cancelled" && s.status !== "Completed"
    );
  };

  const getEmergencySchedules = (): Schedule[] => {
    return schedules.filter((s) => s.status === "Emergency");
  };

  const getCompletedThisWeek = (): Schedule[] => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return schedules.filter(
      (s) => s.status === "Completed" && new Date(s.createdAt) >= weekAgo
    );
  };

  const getFilteredSchedules = (
    filter: "all" | "upcoming" | "today" | "completed" | "emergency" | "critical"
  ): Schedule[] => {
    let filtered = [...schedules];
    const today = new Date().toISOString().split("T")[0];

    switch (filter) {
      case "upcoming":
        filtered = filtered.filter(
          (s) => s.scheduleDate > today && s.status !== "Cancelled" && s.status !== "Completed"
        );
        break;
      case "today":
        filtered = filtered.filter((s) => s.scheduleDate === today && s.status !== "Cancelled");
        break;
      case "completed":
        filtered = filtered.filter((s) => s.status === "Completed");
        break;
      case "emergency":
        filtered = filtered.filter((s) => s.status === "Emergency");
        break;
      case "critical":
        filtered = filtered.filter((s) => s.priority === "Critical" && s.status !== "Cancelled");
        break;
    }

    // Sort: emergency first, then by date
    return filtered.sort((a, b) => {
      if (a.status === "Emergency" && b.status !== "Emergency") return -1;
      if (a.status !== "Emergency" && b.status === "Emergency") return 1;
      return new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime();
    });
  };

  return {
    schedules,
    isLoading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    markComplete,
    markCancelled,
    markEmergency,
    reschedule,
    getTodaySchedules,
    getUpcomingSchedules,
    getEmergencySchedules,
    getCompletedThisWeek,
    getFilteredSchedules,
  };
};
