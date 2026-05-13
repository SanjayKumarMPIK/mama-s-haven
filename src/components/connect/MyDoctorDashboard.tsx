import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchDoctorProfileByCode,
  getSupabaseRequestByCode,
} from "@/lib/supabaseConnectionStore";
import DoctorProfileSummary from "@/components/connect/DoctorProfileSummary";
import QuickActions from "@/components/connect/QuickActions";
import UpcomingScheduleCard from "@/components/connect/UpcomingScheduleCard";
import DoctorActivityFeed from "@/components/connect/DoctorActivityFeed";

interface Props {
  doctorCode: string;
  doctorId?: string;
  connectedAt?: string;
  onDisconnect: () => void;
}

interface DoctorInfo {
  name: string;
  specialty: string;
  hospital: string;
}

export default function MyDoctorDashboard({ doctorCode, doctorId, connectedAt, onDisconnect }: Props) {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [connectedDate, setConnectedDate] = useState("Today");
  const [resolvedDoctorId, setResolvedDoctorId] = useState<string | undefined>(doctorId);
  const [resolvedConnectedAt, setResolvedConnectedAt] = useState<string | undefined>(connectedAt);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setResolvedDoctorId(doctorId);
  }, [doctorId]);

  useEffect(() => {
    setResolvedConnectedAt(connectedAt);
  }, [connectedAt]);

  // Fetch the real doctor profile from Supabase on mount
  useEffect(() => {
    if (!doctorCode) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profile = await fetchDoctorProfileByCode(doctorCode);
        if (profile) {
          setDoctor({
            name: profile.name,
            specialty: profile.specialty,
            hospital: profile.hospital,
          });
        }
      } catch (err) {
        console.warn('[MyDoctorDashboard] Failed to fetch doctor profile:', err);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [doctorCode]);

  // Fetch the connected date from the Supabase connection record
  useEffect(() => {
    if (!doctorCode || !user?.id) return;

    const fetchConnectionDate = async () => {
      try {
        const req = await getSupabaseRequestByCode(doctorCode, user.id);
        if (req?.doctorId) {
          setResolvedDoctorId(req.doctorId);
        }
        if (req?.createdAt) {
          setResolvedConnectedAt(req.createdAt);
          const d = new Date(req.createdAt);
          setConnectedDate(
            d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
          );
        } else if (connectedAt) {
          const d = new Date(connectedAt);
          if (!Number.isNaN(d.getTime())) {
            setConnectedDate(
              d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
            );
          }
        }
      } catch (err) {
        console.warn('[MyDoctorDashboard] Failed to fetch connection date:', err);
      }
    };

    fetchConnectionDate();
  }, [connectedAt, doctorCode, user?.id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900">My Doctor</h1>
        <p className="text-sm text-gray-500">Your connected healthcare provider</p>
      </div>
      <DoctorProfileSummary doctor={doctor} connectedDate={connectedDate} onChangeDoctor={onDisconnect} />
      <QuickActions />
      <UpcomingScheduleCard doctorCode={doctorCode} />
      <DoctorActivityFeed
        connectedAt={resolvedConnectedAt ?? connectedAt ?? new Date().toISOString()}
        connectedDate={connectedDate}
        doctorCode={doctorCode}
        doctorId={resolvedDoctorId}
      />
    </div>
  );
}
