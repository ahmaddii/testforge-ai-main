import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PublicLayout } from "@/components/public-layout";
import { CTA } from "@/components/cta";
import { FramerReveal, FramerStaggerItem } from "@/components/framer-reveal";

export const Route = createFileRoute("/faq")({
  component: FAQPage,
  head: () => ({
    meta: [{ title: "FAQ — Speclane" }],
  }),
});

function FAQPage() {
  return (
    <PublicLayout>
      <div className="pt-24 md:pt-32 pb-16 relative overflow-hidden">
        <div className="container relative mx-auto px-4">
          <FramerReveal className="mx-auto max-w-3xl text-center" direction="up" distance={40}>
            <Badge variant="outline" className="mb-4 rounded-full border-primary/20 bg-primary/5 text-blue-400">Help Center</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Frequently asked questions
            </h1>
            <p className="text-lg text-white/60 md:text-xl">
              Everything you need to know about the product and billing. Can't find the answer you're looking for? Please chat to our friendly team.
            </p>
          </FramerReveal>
        </div>
      </div>
      <FAQList />
      <CTA />
    </PublicLayout>
  );
}

function FAQList() {
  const items = [
    { q: "How does Speclane generate test cases?", a: "We combine your requirements with static analysis of your codebase to produce positive, negative, and edge test cases tailored to each module." },
    { q: "Do you store my source code?", a: "No. We analyze ephemerally and only persist the generated test cases and metadata. Source is never stored." },
    { q: "Can I export to my existing tools?", a: "Yes — PDF, CSV, and JSON exports work with Jira, TestRail, Xray, and any modern test management system." },
    { q: "Is there a free plan?", a: "Yes, the Free tier supports 1 project and 50 test cases per month forever." },
    { q: "What programming languages do you support?", a: "We currently support TypeScript/JavaScript, Python, Java, Go, and Ruby. More languages are added regularly." },
    { q: "How accurate is the AI generation?", a: "Our AI is specifically tuned for QA workflows and consistently achieves 90%+ coverage on standard web and API modules. You can always manually refine the generated cases." },
  ];

  return (
    <section className="container mx-auto px-4 py-8 mb-24 relative z-10">
      <FramerReveal className="mx-auto max-w-3xl" direction="up" staggerChildren={0.08}>
        <Accordion type="single" collapsible className="rounded-3xl border border-white/10 bg-[#14120B] px-8 py-4 shadow-none">
          {items.map((it, i) => (
            <FramerStaggerItem key={i}>
              <AccordionItem value={`i${i}`} className="border-white/10 py-2">
                <AccordionTrigger className="text-left font-semibold text-lg text-white/80 hover:text-white transition-colors">{it.q}</AccordionTrigger>
                <AccordionContent className="text-white/50 text-base leading-relaxed">{it.a}</AccordionContent>
              </AccordionItem>
            </FramerStaggerItem>
          ))}
        </Accordion>
      </FramerReveal>
    </section>
  );
}
