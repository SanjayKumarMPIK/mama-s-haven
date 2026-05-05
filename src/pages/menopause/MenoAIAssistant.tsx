import React from 'react';
import { Bot, AlertCircle } from 'lucide-react';
import ScrollReveal from "@/components/ScrollReveal";

export default function MenoAIAssistant() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      <div className="container max-w-4xl mx-auto px-4 space-y-6">
        <ScrollReveal>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Menopause AI Assistant</h1>
              <p className="text-sm text-slate-500">Ask menopause-related health and wellness questions</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-slate-700">How can I help you today?</h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              This AI assistant is designed to provide supportive wellness information related to menopause symptoms, 
              lifestyle adjustments, and daily guidance. Please note that the information provided is for educational 
              purposes only and should not be used as a substitute for professional medical advice.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3 mb-8">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">
                <strong>Healthcare Consultation Reminder:</strong> Always consult with a qualified healthcare provider 
                for diagnosis, treatment, and medical advice concerning menopause or any health conditions.
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Bot className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-slate-500 italic text-sm">AI Assistant interface coming soon...</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
