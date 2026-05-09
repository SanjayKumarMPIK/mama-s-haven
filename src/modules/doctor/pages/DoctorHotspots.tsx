import { Map, MapPin, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DoctorHotspots() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <Map className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">Health Hotspots</h1>
              <p className="text-teal-100 text-sm">Regional health analytics and trends</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Placeholder Map Container */}
        <Card className="mb-6">
          <CardContent className="p-0 overflow-hidden">
            <div className="bg-slate-100 h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                <p className="text-slate-500 font-medium">Interactive Map View</p>
                <p className="text-sm text-slate-400">Regional health data visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                  <Activity className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-slate-900">High Risk Areas</h3>
              </div>
              <p className="text-sm text-slate-500">
                Regional hotspot analytics will appear here. Track areas with high concentrations of specific health conditions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Trending Conditions</h3>
              </div>
              <p className="text-sm text-slate-500">
                Health trend analytics will appear here. Monitor rising health concerns in different regions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Map className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Hotspot Data Available</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Regional hotspot analytics will appear here. This feature will display geographic health data, disease clusters, and regional health trends when connected to the backend.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
