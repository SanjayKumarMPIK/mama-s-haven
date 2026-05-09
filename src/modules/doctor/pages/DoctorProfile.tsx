import { useState } from "react";
import {
  User, Stethoscope, Building2, Phone, Mail, MapPin, Clock, Award,
  Fingerprint, Copy, CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDoctorProfile } from "@/modules/doctor/hooks/useDoctorProfile";

export default function DoctorProfile() {
  const { profile, doctorCode } = useDoctorProfile();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(doctorCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">Profile</h1>
              <p className="text-teal-100 text-sm">Your professional information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="max-w-2xl mx-auto">
          {/* Doctor Code Card */}
          <Card className="mb-6 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
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

          {/* Profile Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-3xl shrink-0">
                  {profile.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                  <p className="text-teal-600 font-medium mt-1">{profile.specialty}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <p className="text-sm text-slate-600">{profile.hospital}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                    {profile.qualifications.map((qual) => (
                      <Badge key={qual} variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100">
                        <Award className="h-3 w-3 mr-1" />
                        {qual}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                  Professional Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Clinic</p>
                      <p className="text-sm text-slate-900">{profile.clinic}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Working Hours</p>
                      <p className="text-sm text-slate-900">{profile.timings}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Experience</p>
                      <p className="text-sm text-slate-900">{profile.experience}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-teal-600" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Phone</p>
                      <p className="text-sm text-slate-900">{profile.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Email</p>
                      <p className="text-sm text-slate-900">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Location</p>
                      <p className="text-sm text-slate-900">{profile.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
