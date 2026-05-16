import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { AWARENESS_ROUTES } from "./awarenessRoutes";
import type { ReactNode } from "react";

interface CancerAwarenessLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export default function CancerAwarenessLayout({
  children,
  title,
  subtitle,
  showBack = true,
}: CancerAwarenessLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50/50 to-white">
      <div className="container max-w-4xl py-8 px-4">
        {showBack && (
          <ScrollReveal>
            <Link
              to={AWARENESS_ROUTES.home}
              className="inline-flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cancer Awareness
            </Link>
          </ScrollReveal>
        )}

        <ScrollReveal delay={50}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
            {subtitle && (
              <p className="text-base text-muted-foreground max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </ScrollReveal>

        {children}

        <ScrollReveal delay={200}>
          <div className="mt-12 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>Disclaimer:</strong> This educational content is for informational purposes only and does not constitute medical advice. It is not intended to diagnose, treat, or prevent any disease. Always consult a qualified healthcare professional for medical concerns, symptoms, or before making any health-related decisions.
            </p>
          </div>
        </ScrollReveal>

        <div className="h-12" />
      </div>
    </div>
  );
}
