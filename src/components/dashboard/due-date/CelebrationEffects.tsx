import { useEffect, useState, memo } from "react";
import { Sparkles, Star, Heart } from "lucide-react";

export const CelebrationEffects = memo(function CelebrationEffects() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate 60 particles
    const arr = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      tx: (Math.random() - 0.5) * window.innerWidth * 0.8 + "px",
      ty: (Math.random() - 0.5) * window.innerHeight * 0.8 + "px",
      rot: Math.random() * 720 + "deg",
      s: Math.random() * 0.8 + 0.4,
      delay: Math.random() * 0.3 + "s",
      color: ["text-rose-400", "text-amber-400", "text-blue-400", "text-emerald-400", "text-purple-400"][Math.floor(Math.random() * 5)],
      Icon: [Star, Sparkles, Heart][Math.floor(Math.random() * 3)]
    }));
    setParticles(arr);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center overflow-hidden">
      {particles.map((p) => {
        const Icon = p.Icon;
        return (
          <div
            key={p.id}
            className={`absolute ${p.color}`}
            style={{
              "--tx": p.tx,
              "--ty": p.ty,
              "--rot": p.rot,
              "--s": p.s,
              animation: `burst 2.5s ease-out forwards ${p.delay}`
            } as any}
          >
            <Icon className="w-8 h-8 fill-current" />
          </div>
        );
      })}
      <style>{`
        @keyframes burst {
          0% { transform: translate(0, 0) rotate(0deg) scale(0); opacity: 1; }
          15% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(var(--s)); opacity: 0; }
        }
      `}</style>
    </div>
  );
});
