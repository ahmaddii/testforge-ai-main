import { createFileRoute } from "@tanstack/react-router";
import { Github, Workflow, BellRing } from "lucide-react";
import { GeminiIcon } from "@/components/gemini-icon";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/public-layout";
import { CTA } from "@/components/cta";
import { FramerReveal } from "@/components/framer-reveal";

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorksPage,
  head: () => ({
    meta: [{ title: "How it works — Speclane" }],
  }),
});

function HowItWorksPage() {
  return (
    <PublicLayout>
      <div className="pt-24 md:pt-32 pb-16 relative overflow-hidden">
        <div className="container relative mx-auto px-4">
          <FramerReveal className="mx-auto max-w-3xl text-center" direction="up" distance={40}>
            <Badge variant="outline" className="mb-4">How it works</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              From repo to test plan in four steps
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Our AI engine analyzes your codebase and connects it with your human-readable requirements to generate comprehensive test cases instantly.
            </p>
          </FramerReveal>
        </div>
      </div>
      <HowItWorksSteps />
      <CTA />
    </PublicLayout>
  );
}

function HowItWorksSteps() {
  const steps = [
    { icon: Github, title: "1. Connect & Analyze", desc: "Plug into GitHub or GitLab. We safely analyze your project structure without training on your source code." },
    { icon: GeminiIcon, title: "2. AI Generation", desc: "Our models read your code and instantly write robust Playwright or Cypress tests based on your components." },
    { icon: Workflow, title: "3. Continuous Execution", desc: "Tests are seamlessly integrated into your CI/CD pipeline and run automatically on every pull request." },
    { icon: BellRing, title: "4. Smart Reporting", desc: "Get rich, actionable alerts directly in Slack or Jira the moment a test fails, with AI-suggested fixes." },
  ];

  return (
    <section className="container mx-auto px-4 py-24 max-w-6xl relative">
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2 hidden md:block">
        <div className="absolute top-0 w-full h-[30vh] bg-gradient-to-b from-transparent via-primary to-transparent animate-laser shadow-[0_0_15px_rgba(237,236,237,0.4)]" />
      </div>
      <div className="space-y-24 md:space-y-32 relative z-10">
        {steps.map((s, i) => {
          const isEven = i % 2 === 0;
          return (
            <div key={s.title} className={`flex flex-col md:flex-row gap-8 md:gap-16 items-center ${isEven ? '' : 'md:flex-row-reverse'}`}>
              <FramerReveal className={`flex-1 text-left ${isEven ? 'md:text-right' : 'md:text-left'}`} direction={isEven ? "left" : "right"} distance={50}>
                <div className={`mb-6 inline-grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-[#14120B] shadow-none ${isEven ? 'md:ml-auto' : 'md:mr-auto'}`}>
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white tracking-tight">{s.title}</h3>
                <p className="text-white/50 leading-relaxed text-lg max-w-md mx-auto md:mx-0">{s.desc}</p>
              </FramerReveal>
              <div className="hidden md:flex w-12 items-center justify-center shrink-0 z-20">
                <div className="w-4 h-4 rounded-full bg-[#14120B] border-2 border-primary shadow-none" />
              </div>
              <FramerReveal className="flex-1 w-full max-w-md" direction={isEven ? "right" : "left"} distance={50}>
                <div className="bg-[#14120B] border border-white/10 rounded-xl p-6 shadow-none text-white/60 font-mono text-sm">
                  <div className="flex gap-1.5 mb-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-primary/20 rounded w-3/4" />
                    <div className="h-2 bg-white/10 rounded w-full" />
                    <div className="h-2 bg-white/10 rounded w-5/6" />
                    <div className="h-2 bg-green-400/20 rounded w-2/3 mt-4" />
                    <div className="h-2 bg-green-400/20 rounded w-1/2" />
                  </div>
                </div>
              </FramerReveal>
            </div>
          );
        })}
      </div>
    </section>
  );
}
