import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, ExternalLink } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const categories = [
  {
    trimester: "First Trimester",
    color: "bg-peach/60",
    items: [
      { name: "Prenatal Vitamins", desc: "Folic acid, iron, DHA essentials", price: "$15–$35" },
      { name: "Anti-Nausea Bands", desc: "Acupressure wristbands for morning sickness", price: "$8–$12" },
      { name: "Comfortable Bras", desc: "Soft, wire-free maternity bras", price: "$20–$40" },
      { name: "Pregnancy Journal", desc: "Document your journey week by week", price: "$12–$25" },
    ],
  },
  {
    trimester: "Second Trimester",
    color: "bg-mint/60",
    items: [
      { name: "Maternity Jeans", desc: "Stretchy, supportive denim", price: "$30–$60" },
      { name: "Body Pillow", desc: "Full-body support for better sleep", price: "$40–$80" },
      { name: "Belly Butter", desc: "Cocoa butter for stretch mark prevention", price: "$10–$25" },
      { name: "Maternity Dresses", desc: "Comfortable and stylish everyday wear", price: "$25–$55" },
    ],
  },
  {
    trimester: "Third Trimester",
    color: "bg-lavender/60",
    items: [
      { name: "Hospital Bag Essentials", desc: "Robe, slippers, toiletries kit", price: "$35–$60" },
      { name: "Nursing Pillow", desc: "Ergonomic breastfeeding support", price: "$25–$50" },
      { name: "Baby Car Seat", desc: "Infant-safe rear-facing seat", price: "$80–$200" },
      { name: "Swaddle Blankets", desc: "Soft muslin wraps for newborn comfort", price: "$15–$30" },
    ],
  },
  {
    trimester: "Postpartum",
    color: "bg-baby-blue/60",
    items: [
      { name: "Postpartum Recovery Kit", desc: "Healing pads, sprays, and comfort essentials", price: "$20–$40" },
      { name: "Nursing Tops", desc: "Easy-access breastfeeding clothing", price: "$20–$35" },
      { name: "Baby Monitor", desc: "Audio/video monitoring for peace of mind", price: "$40–$120" },
      { name: "Diaper Bag", desc: "Organized, stylish carry-all for outings", price: "$30–$70" },
    ],
  },
];

export default function Shopping() {
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
              Smart <span className="text-gradient-bloom">Shopping</span>
            </h1>
          </div>
          <p className="mt-3 text-muted-foreground max-w-lg">
            Curated essentials for every stage — because you deserve to shop stress-free.
          </p>
        </ScrollReveal>

        <div className="mt-10 space-y-10">
          {categories.map((cat, ci) => (
            <ScrollReveal key={cat.trimester} delay={ci * 80}>
              <div>
                <h2 className="text-xl font-bold mb-4">{cat.trimester}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cat.items.map((item) => (
                    <div
                      key={item.name}
                      className={`rounded-xl ${cat.color} p-5 transition-all duration-300 hover:shadow-md group`}
                    >
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-bold">{item.price}</span>
                        <button className="p-1.5 rounded-md hover:bg-background/50 transition-colors">
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
