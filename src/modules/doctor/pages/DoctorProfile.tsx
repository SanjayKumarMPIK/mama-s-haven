import { useState, useEffect } from 'react';
import {
  User, Stethoscope, Building2, Phone, Mail, MapPin, Clock,
  Fingerprint, Copy, CheckCircle2, UserCircle2, Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDoctorAuth } from '@/modules/doctor/hooks/useDoctorAuth';



export default function DoctorProfile() {
  const { doctorProfile, isDoctorLoading, refreshDoctorProfile } = useDoctorAuth();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void refreshDoctorProfile();
  }, [refreshDoctorProfile]);

  const doctorCode = doctorProfile?.doctor_code || '—';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(doctorCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isDoctorLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
          <p className="text-sm text-slate-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!doctorProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <UserCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600">No profile found</p>
          <p className="text-sm text-slate-400 mt-1">
            Your doctor profile has not been set up yet.
          </p>
        </div>
      </div>
    );
  }

  const initials = doctorProfile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-teal-100 text-sm">Your professional information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Doctor Code Card */}
          <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Fingerprint className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-teal-700">Doctor Code</p>
                    <p className="text-lg font-mono font-bold text-teal-900 tracking-widest mt-0.5">
                      {doctorCode}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/80 border border-teal-200 text-teal-600 text-sm font-medium hover:bg-white hover:border-teal-300 transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-teal-500 mt-3 ml-[3.25rem]">
                Share this code with patients so they can connect with you
              </p>
            </CardContent>
          </Card>

          {/* Identity Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-3xl shrink-0">
                  {initials}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-slate-900">{doctorProfile.full_name}</h2>
                  <p className="text-teal-600 font-medium mt-1">{doctorProfile.designation}</p>
                  {doctorProfile.specialization && (
                    <p className="text-slate-500 text-sm mt-0.5">
                      Specialization: {doctorProfile.specialization}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                    <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100">
                      {doctorProfile.designation}
                    </Badge>
                    {doctorProfile.gender && (
                      <Badge variant="outline" className="text-slate-600">
                        {doctorProfile.gender}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PHC & Work Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-teal-600" />
                PHC & Work Details
              </h3>
              <div className="space-y-4">
                <DetailRow
                  icon={<Building2 className="h-5 w-5 text-slate-400" />}
                  label="PHC Center"
                  value={doctorProfile.phc_center}
                />
                <DetailRow
                  icon={<MapPin className="h-5 w-5 text-slate-400" />}
                  label="PHC Location"
                  value={doctorProfile.phc_location}
                />
                <DetailRow
                  icon={<Clock className="h-5 w-5 text-slate-400" />}
                  label="Working Hours"
                  value={doctorProfile.working_hours}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-teal-600" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <DetailRow
                  icon={<Phone className="h-5 w-5 text-slate-400" />}
                  label="Phone"
                  value={doctorProfile.phone_no}
                />
                <DetailRow
                  icon={<Mail className="h-5 w-5 text-slate-400" />}
                  label="Email"
                  value={doctorProfile.email}
                />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-sm text-slate-900">{value}</p>
      </div>
    </div>
  );
}
