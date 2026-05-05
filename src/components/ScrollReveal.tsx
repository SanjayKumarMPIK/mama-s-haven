import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

function elementIntersectsViewport(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
}

export default function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }

    // Avoid permanent blank screen if the node is already on-screen before IO runs
    if (elementIntersectsViewport(el)) {
      setVisible(true);
      return;
    }

    let fallback: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          setVisible(true);
          if (fallback) clearTimeout(fallback);
          observer.unobserve(el);
        }
      },
      { threshold: 0.01, rootMargin: "80px 0px 120px 0px" },
    );
    observer.observe(el);

    fallback = setTimeout(() => setVisible(true), 1500);

    return () => {
      if (fallback) clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        filter: visible ? "blur(0px)" : "blur(4px)",
        transition: `all 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
