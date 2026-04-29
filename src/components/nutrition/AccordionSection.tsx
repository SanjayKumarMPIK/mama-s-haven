import { useRef, useEffect, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface AccordionSectionProps {
  title: string;
  emoji: string;
  count?: number;
  countLabel?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  accentGradient?: string;
  accentBorder?: string;
}

export default function AccordionSection({
  title,
  emoji,
  count,
  countLabel,
  isOpen,
  onToggle,
  children,
  accentGradient = "from-teal-500 to-emerald-400",
  accentBorder = "border-teal-200/60",
}: AccordionSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  // Measure content height when open or when children change
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight);
        }
      });
      resizeObserver.observe(contentRef.current);
      setHeight(contentRef.current.scrollHeight);
      return () => resizeObserver.disconnect();
    }
  }, [isOpen, children]);

  return (
    <div
      className={`rounded-2xl border ${accentBorder} bg-card overflow-hidden transition-shadow duration-300 ${
        isOpen ? "shadow-md" : "shadow-sm hover:shadow-md"
      }`}
    >
      {/* ── Clickable Header ───────────────────────────────────── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left group transition-colors hover:bg-muted/30"
        aria-expanded={isOpen}
      >
        {/* Icon */}
        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shadow-sm shrink-0`}
        >
          <span className="text-base">{emoji}</span>
        </div>

        {/* Title + count */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold tracking-tight truncate">{title}</h3>
          {count !== undefined && countLabel && (
            <p className="text-[11px] text-muted-foreground">
              {count} {countLabel}
            </p>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ease-out ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        />
      </button>

      {/* ── Collapsible Content ─────────────────────────────────── */}
      <div
        style={{
          maxHeight: isOpen ? `${height}px` : "0px",
          opacity: isOpen ? 1 : 0,
        }}
        className="transition-all duration-300 ease-out overflow-hidden"
      >
        <div ref={contentRef} className="px-4 pb-4 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}
