import { User, Stethoscope, Building2, Phone, Mail, MapPin, Clock, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock doctor data
const doctorData = {
  name: "Dr. Ananya Sharma",
  specialty: "Gynecologist & Obstetrician",
  hospital: "City General Hospital",
  clinic: "Women's Health Clinic, MG Road",
  experience: "12 years",
  contact: "+91 98765 43210",
  email: "dr.ananya@womenshealth.com",
  address: "Bangalore, Karnataka",
  qualifications: ["MBBS", "MD (Obstetrics & Gynecology)", "Fellowship in Reproductive Medicine"],
  timings: "Mon - Sat: 9:00 AM - 5:00 PM",
};

export default function DoctorProfile() {
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
          {/* Profile Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-3xl shrink-0">
                  {doctorData.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-slate-900">{doctorData.name}</h2>
                  <p className="text-teal-600 font-medium mt-1">{doctorData.specialty}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <p className="text-sm text-slate-600">{doctorData.hospital}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                    {doctorData.qualifications.map((qual) => (
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
                      <p className="text-sm text-slate-900">{doctorData.clinic}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Working Hours</p>
                      <p className="text-sm text-slate-900">{doctorData.timings}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Experience</p>
                      <p className="text-sm text-slate-900">{doctorData.experience}</p>
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
                      <p className="text-sm text-slate-900">{doctorData.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Email</p>
                      <p className="text-sm text-slate-900">{doctorData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Location</p>
                      <p className="text-sm text-slate-900">{doctorData.address}</p>
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
