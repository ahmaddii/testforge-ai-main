import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/public-layout";
import { CTA } from "@/components/cta";
import { FramerReveal, FramerStaggerItem } from "@/components/framer-reveal";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({ meta: [{ title: "Pricing — Speclane" }] }),
});

const PLANS = [
  {
    id: "free",
    name: "Free Starter",
    priceLabel: "$0",
    period: "forever",
    description: "Preview Speclane with a small workspace before upgrading.",
    limits: { projects: "1 Project", generations: "0 AI generations/mo", seats: "1 Team member" },
    features: ["Community Discord support", "Basic manual test cases"],
    badge: "Free",
    cta: "Start Free",
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    priceLabel: "$19",
    period: "per month",
    description: "For solo QA engineers validating a few products.",
    limits: { projects: "3 Projects", generations: "50 AI generations/mo", seats: "1 Team seat" },
    features: ["AI Test Generator", "Execution Run Comparison", "Data Export (PDF/CSV/JSON)", "Advanced reports", "Priority generation queue", "Email support"],
    badge: null,
    cta: "Subscribe",
    popular: false,
  },
  {
    id: "pro",
    name: "Team Pro",
    priceLabel: "$49",
    period: "per month",
    description: "For growing QA teams with shared requirements and reports.",
    limits: { projects: "15 Projects", generations: "500 AI generations/mo", seats: "10 Team seats" },
    features: ["AI Test Generator", "Execution Run Comparison", "Data Export (PDF/CSV/JSON)", "Slack alerts", "Team Chat & Collaboration", "Advanced reports", "24/7 priority support"],
    badge: "Most Popular",
    cta: "Subscribe",
    popular: true,
  },
  {
    id: "business",
    name: "Enterprise",
    priceLabel: "$149",
    period: "per month",
    description: "For companies that need high-volume AI QA workflows.",
    limits: { projects: "Unlimited Projects", generations: "3,000 AI generations/mo", seats: "50 Team seats" },
    features: ["AI Test Generator", "Execution Run Comparison", "Data Export (PDF/CSV/JSON)", "Integrated Video Calls", "Slack alerts & Team Chat", "Advanced reports", "Dedicated Success Manager"],
    badge: null,
    cta: "Subscribe",
    popular: false,
  },
];

function PricingPage() {
  return (
    <PublicLayout>
      <div className="pt-24 md:pt-32 pb-16 relative overflow-hidden">
        <div className="container relative mx-auto px-4 z-10">
          <FramerReveal className="mx-auto max-w-3xl text-center" direction="up" distance={40}>
            <Badge variant="outline" className="mb-4 rounded-full border-primary/20 bg-primary/5 text-primary px-4 py-1.5 font-semibold">
              <Sparkles className="h-3.5 w-3.5 mr-2 inline text-primary animate-pulse" /> Transparent Pricing
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent leading-[1.15]">
              Simple, predictable pricing for QA automation
            </h1>
            <p className="text-lg text-white/60 md:text-xl leading-relaxed">
              Start generating high-coverage test cases for free. Upgrade as your team and testing requirements scale.
            </p>
          </FramerReveal>
        </div>
      </div>

      <section className="container mx-auto px-4 pb-24 relative z-10 max-w-6xl">
        <FramerReveal className="grid gap-8 md:grid-cols-2 lg:grid-cols-4" direction="up" staggerChildren={0.1}>
          {PLANS.map((plan) => (
            <FramerStaggerItem key={plan.id}>
              <div
                className={`relative flex flex-col justify-between h-full rounded-3xl border bg-[#14120B] p-8 shadow-none transition-colors ${
                  plan.popular
                    ? "border-primary ring-2 ring-primary/20 z-20"
                    : "border-white/10 hover:border-primary/40"
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-0">
                    <div className={`text-[10px] font-extrabold uppercase tracking-widest py-1.5 px-5 rounded-bl-2xl shadow-none ${plan.popular ? 'bg-primary text-[#14120B]' : 'bg-white/20 text-white backdrop-blur'}`}>
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-6 pt-2">
                    <h3 className={`text-xl font-extrabold ${plan.popular ? "text-primary text-2xl" : "text-white"}`}>
                      {plan.name}
                    </h3>
                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-white">{plan.priceLabel}</span>
                      <span className="text-sm font-medium text-white/50">/ {plan.period}</span>
                    </div>
                    <p className="mt-4 text-sm text-white/60 min-h-[48px] leading-relaxed font-light">
                      {plan.description}
                    </p>
                  </div>

                  <div className="space-y-3.5 text-sm mb-8 pt-6 border-t border-white/10">
                    <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 font-mono">
                      Includes:
                    </div>
                    <div className="flex items-center gap-3 text-white/90 font-medium">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{plan.limits.projects}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/90 font-medium">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{plan.limits.generations}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/90 font-medium">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{plan.limits.seats}</span>
                    </div>
                    
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-white/70">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link to="/signup">
                  <Button
                    className={`w-full rounded-2xl h-12 font-bold transition-colors text-base shadow-none ${
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 text-[#14120B]"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </FramerStaggerItem>
          ))}
        </FramerReveal>
      </section>

      {/* Feature Highlights Section */}
      <section className="container mx-auto px-4 pb-24 max-w-5xl relative z-10">
        <div className="rounded-3xl border border-white/10 bg-[#14120B] p-8 sm:p-12 shadow-none flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Zap className="h-3.5 w-3.5 text-emerald-400" /> Instant Activation
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to automate your test case generation?
            </h3>
            <p className="text-white/60 text-base leading-relaxed font-light">
              Create an account in 30 seconds. No credit card required to start on the Free plan. You can upgrade or change plans directly from your workspace dashboard at any time.
            </p>
          </div>
          <div className="shrink-0">
            <Link to="/signup">
              <Button className="rounded-2xl h-12 px-8 font-bold bg-white text-black hover:bg-white/90 text-base shadow-none transition-colors">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CTA />
    </PublicLayout>
  );
}
