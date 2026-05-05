import React from 'react';
import { Home } from 'lucide-react';
import ScrollReveal from "@/components/ScrollReveal";

export default function MenoHome() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      <div className="container max-w-4xl mx-auto px-4 space-y-6">
        <ScrollReveal>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Menopause Home</h1>
              <p className="text-sm text-slate-500">Welcome to your menopause phase</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-slate-700">Home</h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              This is the home page for the menopause phase. Content coming soon...
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
