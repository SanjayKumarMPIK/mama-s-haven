import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-xl">
        <ScrollReveal>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-baby-blue flex items-center justify-center">
              <Mail className="w-5 h-5 text-foreground/70" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Get in <span className="text-gradient-bloom">Touch</span>
            </h1>
          </div>
          <p className="mt-3 text-muted-foreground">
            Have a question, suggestion, or just want to say hello? We'd love to hear from you.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          {submitted ? (
            <div className="mt-10 rounded-xl bg-mint/30 p-10 text-center">
              <span className="text-4xl block mb-3">💌</span>
              <h2 className="text-xl font-bold">Message Sent!</h2>
              <p className="mt-2 text-sm text-muted-foreground">We'll get back to you soon. Take care, mama!</p>
              <button onClick={() => setSubmitted(false)} className="mt-4 text-sm text-primary hover:underline">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  required
                  type="text"
                  maxLength={100}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  required
                  type="email"
                  maxLength={255}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Message</label>
                <textarea
                  required
                  maxLength={1000}
                  rows={5}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </ScrollReveal>
      </div>
    </div>
  );
}
