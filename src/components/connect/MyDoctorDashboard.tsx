import { useState, useEffect, useMemo } from "react";
import { getRequestByCode } from "@/lib/connectionStore";
import DoctorProfileSummary from "@/components/connect/DoctorProfileSummary";
import QuickActions from "@/components/connect/QuickActions";
import UpcomingScheduleCard from "@/components/connect/UpcomingScheduleCard";
import DoctorReportsSection from "@/components/connect/DoctorReportsSection";
import DoctorActivityFeed from "@/components/connect/DoctorActivityFeed";

interface Props {
  doctorCode: string;
  onDisconnect: () => void;
}

interface DoctorInfo {
  name: string;
  specialty: string;
  hospital: string;
}

function loadDoctorProfile(): DoctorInfo | null {
  try {
    const raw = localStorage.getItem("ss-doctor-profile");
    if (!raw) return null;
    const profile = JSON.parse(raw);
    return {
      name: profile.name || "Your Doctor",
      specialty: profile.specialty || "Healthcare Provider",
      hospital: profile.hospital || "Registered Healthcare Facility",
    };
  } catch {
    return null;
  }
}

export default function MyDoctorDashboard({ doctorCode, onDisconnect }: Props) {
  const [doctor, setDoctor] = useState<DoctorInfo | null>(loadDoctorProfile);

  useEffect(() => {
    const interval = setInterval(() => {
      const fresh = loadDoctorProfile();
      setDoctor((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(fresh)) return fresh;
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const connectedDate = useMemo(() => {
    try {
      const req = getRequestByCode(doctorCode);
      if (req?.createdAt) {
        const d = new Date(req.createdAt);
        return d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
      }
    } catch {
      /* ignore */
    }
    return "Today";
  }, [doctorCode]);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900">My Doctor</h1>
        <p className="text-sm text-gray-500">Your connected healthcare provider</p>
      </div>
      <DoctorProfileSummary doctor={doctor} connectedDate={connectedDate} onChangeDoctor={onDisconnect} />
      <QuickActions />
      <UpcomingScheduleCard doctorCode={doctorCode} />
      <DoctorReportsSection doctorCode={doctorCode} doctorName={doctor?.name || "Your Doctor"} />
      <DoctorActivityFeed connectedDate={connectedDate} doctorCode={doctorCode} />
    </div>
  );
}
