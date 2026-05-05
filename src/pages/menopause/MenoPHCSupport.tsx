import React from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import ScrollReveal from "@/components/ScrollReveal";

export default function MenoPHCSupport() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      <div className="container max-w-4xl mx-auto px-4 space-y-6">
        <ScrollReveal>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">PHC Support</h1>
              <p className="text-sm text-slate-500">Find nearby support and healthcare guidance</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-slate-700">Locate Healthcare Resources</h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              Find Primary Health Centers (PHC) and specialized clinics that provide supportive guidance 
              and medical care for navigating menopause transitions in your area.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3 mb-8">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">
                <strong>Healthcare Consultation Reminder:</strong> Regular check-ups with healthcare professionals 
                are highly recommended to monitor symptoms and manage menopause effectively. Do not rely solely 
                on digital guidance.
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Building2 className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-slate-500 italic text-sm">PHC locator tool coming soon...</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
