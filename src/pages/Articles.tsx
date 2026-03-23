import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { usePhase, type Phase } from "@/hooks/usePhase";

type Article = { title: string; category: string; readTime: string; color: string; excerpt: string; phases: Phase[] };

const articles: Article[] = [
  { title: "Your first periods: what’s normal", category: "Puberty", readTime: "3 min", color: "bg-pink-100/80", excerpt: "Cycle length, pain, and when to tell a trusted adult or nurse.", phases: ["puberty"] },
  { title: "Iron-rich snacks that fit school days", category: "Nutrition", readTime: "3 min", color: "bg-mint/60", excerpt: "Quick combos with vitamin C to support iron absorption.", phases: ["puberty"] },
  { title: "Managing cramps without medicine first", category: "Wellness", readTime: "3 min", color: "bg-lavender/60", excerpt: "Warmth, movement, and rest ideas — escalate if pain is severe.", phases: ["puberty"] },

  { title: "Nutrition Guide for Each Trimester", category: "Diet", readTime: "5 min", color: "bg-peach/60", excerpt: "What to eat, what to avoid, and how to manage cravings throughout your pregnancy.", phases: ["maternity"] },
  { title: "Managing Morning Sickness Naturally", category: "Wellness", readTime: "4 min", color: "bg-mint/60", excerpt: "Tried-and-tested remedies including ginger, acupressure, and meal timing strategies.", phases: ["maternity"] },
  { title: "Safe Exercises During Pregnancy", category: "Fitness", readTime: "6 min", color: "bg-baby-blue/60", excerpt: "Prenatal yoga, swimming, and walking routines approved by OB-GYNs.", phases: ["maternity"] },
  { title: "Preparing for Your Birth Plan", category: "Planning", readTime: "7 min", color: "bg-lavender/60", excerpt: "How to communicate your preferences and what to include in your birth plan.", phases: ["maternity"] },
  { title: "Understanding Braxton Hicks vs Real Contractions", category: "Health", readTime: "4 min", color: "bg-peach/60", excerpt: "Key differences to know so you're confident about when to call your provider.", phases: ["maternity"] },
  { title: "Bonding with Your Baby Before Birth", category: "Emotional", readTime: "3 min", color: "bg-mint/60", excerpt: "Music, reading aloud, and mindful touch techniques for prenatal bonding.", phases: ["maternity"] },
  { title: "Postpartum Recovery Timeline", category: "Postpartum", readTime: "6 min", color: "bg-lavender/60", excerpt: "What to expect in the first 6 weeks and how to support your healing.", phases: ["maternity"] },
  { title: "Breastfeeding Basics for New Moms", category: "Newborn", readTime: "5 min", color: "bg-baby-blue/60", excerpt: "Latching techniques, common challenges, and when to seek lactation support.", phases: ["maternity"] },

  { title: "Fertile window basics (calendar method)", category: "Planning", readTime: "3 min", color: "bg-teal-100/80", excerpt: "How cycle length links to ovulation estimates — and why it’s only a guide.", phases: ["family-planning"] },
  { title: "Pre-pregnancy folate and partners’ health", category: "Nutrition", readTime: "3 min", color: "bg-mint/60", excerpt: "Simple food ideas and why both partners benefit from healthy habits.", phases: ["family-planning"] },
  { title: "Stress, sleep, and hormones while planning", category: "Mind", readTime: "3 min", color: "bg-lavender/60", excerpt: "Short routines to calm the nervous system during a high-hope phase.", phases: ["family-planning"] },
];

export default function Articles() {
  const { phase, phaseName, phaseEmoji } = usePhase();

  const list = useMemo(() => articles.filter((a) => a.phases.includes(phase)), [phase]);

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <ScrollReveal>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-baby-blue flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-foreground/70" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Short <span className="text-gradient-bloom">Reads</span>
            </h1>
          </div>
          <p className="mt-2 text-xs inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
            <span>{phaseEmoji}</span>
            <span>
              Curated for: <strong>{phaseName}</strong> · {list.length} articles
            </span>
          </p>
          <p className="mt-3 text-muted-foreground max-w-lg text-sm">Card-sized summaries — tap nothing long; use as conversation starters with your clinician.</p>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {list.map((a, i) => (
            <ScrollReveal key={a.title} delay={i * 60}>
              <article className="rounded-xl border border-border/60 bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${a.color}`}>{a.category}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {a.readTime}
                  </span>
                </div>
                <h2 className="font-bold group-hover:text-primary transition-colors">{a.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{a.excerpt}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
