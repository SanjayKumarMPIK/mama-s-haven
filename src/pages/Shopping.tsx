import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, ExternalLink } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { usePhase, type Phase } from "@/hooks/usePhase";

type Product = { name: string; desc: string; purpose: string; price: string };

const BY_PHASE: Record<Phase, { label: string; color: string; items: Product[] }> = {
  puberty: {
    label: "Puberty — sanitary & comfort",
    color: "bg-pink-50 border-pink-100",
    items: [
      { name: "Overnight sanitary pads (pack)", desc: "Soft, long-length pads", purpose: "Comfortable protection on heavier nights", price: "₹180–₹320" },
      { name: "Menstrual cup (medical-grade)", desc: "Reusable, with storage pouch", purpose: "Eco-friendly period care when you’re ready to try", price: "₹600–₹1,200" },
      { name: "Period underwear (2-pack)", desc: "Absorbent inner layer", purpose: "Backup protection with pads or light days", price: "₹800–₹1,400" },
      { name: "Heating patch / warm bottle", desc: "Portable cramp relief", purpose: "Gentle warmth for lower abdominal discomfort", price: "₹150–₹450" },
    ],
  },
  maternity: {
    label: "Maternity — essentials",
    color: "bg-purple-50 border-purple-100",
    items: [
      { name: "Prenatal vitamin kit", desc: "Folic acid + iron (as prescribed)", purpose: "Supports maternal blood and baby’s neural development", price: "₹450–₹900" },
      { name: "Maternity pillow", desc: "C-shaped side support", purpose: "Better sleep posture in 2nd–3rd trimester", price: "₹1,800–₹3,500" },
      { name: "Stretch mark balm", desc: "Cocoa / shea butter blend", purpose: "Skin comfort as belly grows", price: "₹350–₹700" },
      { name: "Hospital bag starter", desc: "Gown, pads, newborn cap set", purpose: "Ready-to-pack basics for delivery day", price: "₹1,200–₹2,500" },
    ],
  },
  "family-planning": {
    label: "Family planning — health kits",
    color: "bg-teal-50 border-teal-100",
    items: [
      { name: "Basal thermometer", desc: "2-decimal oral thermometer", purpose: "Track subtle temperature shifts across cycles", price: "₹350–₹800" },
      { name: "Folic acid supplement", desc: "Only as advised by doctor", purpose: "Pre-conception neural tube support", price: "₹120–₹350" },
      { name: "Ovulation strip kit", desc: "LH test strips (home use)", purpose: "Approximate fertile window alongside tracking", price: "₹400–₹900" },
      { name: "Basic wellness kit", desc: "BP monitor + notebook", purpose: "Monitor general health before pregnancy", price: "₹900–₹2,200" },
    ],
  },
};

/** Original trimester/postpartum catalogue — kept for reference; prices shown in ₹ */
const categories = [
  {
    trimester: "First Trimester",
    color: "bg-peach/60",
    items: [
      { name: "Prenatal Vitamins", desc: "Folic acid, iron, DHA essentials", price: "₹1,200–₹2,800" },
      { name: "Anti-Nausea Bands", desc: "Acupressure wristbands for morning sickness", price: "₹650–₹1,000" },
      { name: "Comfortable Bras", desc: "Soft, wire-free maternity bras", price: "₹1,600–₹3,200" },
      { name: "Pregnancy Journal", desc: "Document your journey week by week", price: "₹950–₹2,000" },
    ],
  },
  {
    trimester: "Second Trimester",
    color: "bg-mint/60",
    items: [
      { name: "Maternity Jeans", desc: "Stretchy, supportive denim", price: "₹2,400–₹4,800" },
      { name: "Body Pillow", desc: "Full-body support for better sleep", price: "₹3,200–₹6,500" },
      { name: "Belly Butter", desc: "Cocoa butter for stretch mark prevention", price: "₹800–₹2,000" },
      { name: "Maternity Dresses", desc: "Comfortable and stylish everyday wear", price: "₹2,000–₹4,400" },
    ],
  },
  {
    trimester: "Third Trimester",
    color: "bg-lavender/60",
    items: [
      { name: "Hospital Bag Essentials", desc: "Robe, slippers, toiletries kit", price: "₹2,800–₹4,800" },
      { name: "Nursing Pillow", desc: "Ergonomic breastfeeding support", price: "₹2,000–₹4,000" },
      { name: "Baby Car Seat", desc: "Infant-safe rear-facing seat", price: "₹6,500–₹16,500" },
      { name: "Swaddle Blankets", desc: "Soft muslin wraps for newborn comfort", price: "₹1,200–₹2,400" },
    ],
  },
  {
    trimester: "Postpartum",
    color: "bg-baby-blue/60",
    items: [
      { name: "Postpartum Recovery Kit", desc: "Healing pads, sprays, and comfort essentials", price: "₹1,600–₹3,200" },
      { name: "Nursing Tops", desc: "Easy-access breastfeeding clothing", price: "₹1,600–₹2,800" },
      { name: "Baby Monitor", desc: "Audio/video monitoring for peace of mind", price: "₹3,200–₹9,500" },
      { name: "Diaper Bag", desc: "Organized, stylish carry-all for outings", price: "₹2,400–₹5,600" },
    ],
  },
];

export default function Shopping() {
  const { phase, phaseName, phaseEmoji } = usePhase();
  const block = BY_PHASE[phase];

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <ScrollReveal>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-peach flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-foreground/70" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Care <span className="text-gradient-bloom">Essentials</span>
            </h1>
          </div>
          <p className="mt-2 text-xs inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
            <span>{phaseEmoji}</span>
            <span>
              Phase picks: <strong>{phaseName}</strong>
            </span>
          </p>
          <p className="mt-3 text-muted-foreground max-w-lg text-sm">
            Illustrative ₹ ranges for planning — no payment flow in this app.
          </p>
        </ScrollReveal>

        <div className="mt-10 space-y-10">
          <ScrollReveal>
            <div>
              <h2 className="text-xl font-bold mb-4">{block.label}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {block.items.map((item) => (
                  <div key={item.name} className={`rounded-xl border p-5 transition-all duration-300 hover:shadow-md group ${block.color}`}>
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                    <p className="mt-2 text-xs text-foreground/90">
                      <span className="font-medium">Purpose:</span> {item.purpose}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold">{item.price}</span>
                      <span className="p-1.5 rounded-md text-muted-foreground" title="External shops — not linked">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <h2 className="text-xl font-bold mb-2">Pregnancy journey catalogue</h2>
            <p className="text-sm text-muted-foreground mb-6">Original trimester-wise list (still available for everyone).</p>
          </ScrollReveal>
          {categories.map((cat, ci) => (
            <ScrollReveal key={cat.trimester} delay={ci * 80}>
              <div>
                <h3 className="text-lg font-bold mb-4">{cat.trimester}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cat.items.map((item) => (
                    <div key={item.name} className={`rounded-xl ${cat.color} p-5 transition-all duration-300 hover:shadow-md group`}>
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-bold">{item.price}</span>
                        <button type="button" className="p-1.5 rounded-md hover:bg-background/50 transition-colors" aria-label="External reference">
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
