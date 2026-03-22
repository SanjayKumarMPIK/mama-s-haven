import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const articles = [
  { title: "Nutrition Guide for Each Trimester", category: "Diet", readTime: "5 min", color: "bg-peach/60", excerpt: "What to eat, what to avoid, and how to manage cravings throughout your pregnancy." },
  { title: "Managing Morning Sickness Naturally", category: "Wellness", readTime: "4 min", color: "bg-mint/60", excerpt: "Tried-and-tested remedies including ginger, acupressure, and meal timing strategies." },
  { title: "Safe Exercises During Pregnancy", category: "Fitness", readTime: "6 min", color: "bg-baby-blue/60", excerpt: "Prenatal yoga, swimming, and walking routines approved by OB-GYNs." },
  { title: "Preparing for Your Birth Plan", category: "Planning", readTime: "7 min", color: "bg-lavender/60", excerpt: "How to communicate your preferences and what to include in your birth plan." },
  { title: "Understanding Braxton Hicks vs Real Contractions", category: "Health", readTime: "4 min", color: "bg-peach/60", excerpt: "Key differences to know so you're confident about when to call your provider." },
  { title: "Bonding with Your Baby Before Birth", category: "Emotional", readTime: "3 min", color: "bg-mint/60", excerpt: "Music, reading aloud, and mindful touch techniques for prenatal bonding." },
  { title: "Postpartum Recovery Timeline", category: "Postpartum", readTime: "6 min", color: "bg-lavender/60", excerpt: "What to expect in the first 6 weeks and how to support your healing." },
  { title: "Breastfeeding Basics for New Moms", category: "Newborn", readTime: "5 min", color: "bg-baby-blue/60", excerpt: "Latching techniques, common challenges, and when to seek lactation support." },
];

export default function Articles() {
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
              Expert <span className="text-gradient-bloom">Articles</span>
            </h1>
          </div>
          <p className="mt-3 text-muted-foreground max-w-lg">
            Trusted advice from medical professionals and experienced mothers.
          </p>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {articles.map((a, i) => (
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
