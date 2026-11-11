import { createFileRoute } from "@tanstack/react-router";
import { Github, ListChecks, FileText, Shield, Users } from "lucide-react";
import { GeminiIcon } from "@/components/gemini-icon";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/public-layout";
import { CTA } from "@/components/cta";
import { FramerReveal, FramerStaggerItem } from "@/components/framer-reveal";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
  head: () => ({
    meta: [{ title: "Features — Speclane" }],
  }),
});

function FeaturesPage() {
  return (
    <PublicLayout>
      <div className="pt-24 md:pt-32 pb-16 relative">
        <div className="container relative mx-auto px-4">
          <FramerReveal className="mx-auto max-w-3xl text-center" direction="up" distance={40}>
            <Badge variant="outline" className="mb-4">Platform Features</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              A complete workspace for modern QA
            </h1>
            <p className="text-lg text-white/60 md:text-xl">
              From requirement mapping to AI test generation and broadcast-ready reporting. Speclane gives you the tools to ship with absolute confidence.
            </p>
          </FramerReveal>
        </div>
      </div>
      <FeaturesList />
      <CTA />
    </PublicLayout>
  );
}

function FeaturesList() {
  return (
    <section className="container mx-auto px-4 py-16 max-w-6xl">
      <FramerReveal direction="up" staggerChildren={0.1} className="grid gap-6 md:grid-cols-3 md:grid-rows-3 auto-rows-[280px]">

        {/* Card 1: AI Test Generation (Spans 2 cols) */}
        <FramerStaggerItem className="md:col-span-2">
          <div className="h-full group relative rounded-3xl border border-white/10 bg-[#14120B] p-8 shadow-none overflow-hidden hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div className="relative z-10 flex items-start justify-between mb-8">
              <div>
                <div className="mb-4 inline-grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <GeminiIcon className="h-6 w-6 object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">AI Test Generation</h3>
                <p className="text-white/60 leading-relaxed max-w-md">Generate positive, negative, and edge cases automatically from your requirements in plain English.</p>
              </div>
              <div className="hidden sm:block w-48 rounded-lg bg-[#14120B] border border-white/10 p-3 shadow-none">
                <div className="flex gap-1.5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 bg-primary/20 rounded w-full" />
                  <div className="h-2 bg-green-400/20 rounded w-5/6 pl-4" />
                  <div className="h-2 bg-green-400/20 rounded w-4/6 pl-4" />
                  <div className="h-2 bg-primary/20 rounded w-1/3" />
                </div>
              </div>
            </div>
          </div>
        </FramerStaggerItem>

        {/* Card 2: GitHub Integration */}
        <FramerStaggerItem>
          <div className="h-full group relative rounded-3xl border border-white/10 bg-[#14120B] p-8 shadow-none overflow-hidden hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div className="relative z-10">
              <div className="mb-4 inline-grid h-10 w-10 place-items-center rounded-lg bg-white/5 text-white border border-white/10">
                <Github className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">GitHub Sync</h3>
              <p className="text-white/60 text-sm leading-relaxed">Connect any repository to ground every test case in real code structure.</p>
            </div>
            <div className="relative z-10 mt-6 h-16 w-full flex items-center gap-2 text-white/30">
               <div className="w-3 h-3 rounded-full border-2 border-primary bg-[#14120B] shrink-0 relative">
                 <div className="absolute top-3 left-1 w-0.5 h-12 bg-white/10" />
               </div>
               <div className="h-0.5 flex-1 bg-white/10 relative">
                  <div className="absolute inset-0 bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
               </div>
               <div className="w-3 h-3 rounded-full border-2 border-white/20 bg-[#14120B] shrink-0 group-hover:border-primary group-hover:bg-primary transition-colors delay-700 duration-300 shadow-none" />
            </div>
          </div>
        </FramerStaggerItem>

        {/* Card 3: Requirements */}
        <FramerStaggerItem>
          <div className="h-full group relative rounded-3xl border border-white/10 bg-[#14120B] p-8 shadow-none overflow-hidden hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div className="relative z-10">
              <div className="mb-4 inline-grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <ListChecks className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Requirements</h3>
              <p className="text-white/60 text-sm leading-relaxed">Centralize specs and track priorities. Map every test to a requirement.</p>
            </div>
            <div className="mt-6 rounded border border-white/10 bg-white/5 p-3 relative z-10 group-hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-primary">TEST-101</span>
                <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Passed</span>
              </div>
              <div className="h-2 bg-white/20 rounded w-3/4 mb-1" />
              <div className="h-2 bg-white/10 rounded w-1/2" />
            </div>
          </div>
        </FramerStaggerItem>

        {/* Card 4: Coverage Insights */}
        <FramerStaggerItem>
          <div className="h-full group relative rounded-3xl border border-white/10 bg-[#14120B] p-8 shadow-none overflow-hidden hover:border-primary/40 transition-colors flex flex-col justify-between">
             <div className="relative z-10">
              <div className="mb-4 inline-grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Coverage Insights</h3>
              <p className="text-white/60 text-sm leading-relaxed">See precise coverage scores per module so you know exactly where to focus.</p>
            </div>
            <div className="mt-6 flex items-center justify-center relative z-10">
              <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-primary group-hover:rotate-180 transition-transform duration-1000 ease-in-out flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-white/5 border-r-white group-hover:-rotate-90 transition-transform duration-1000 delay-100 flex items-center justify-center" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white">94%</span>
              </div>
            </div>
          </div>
        </FramerStaggerItem>

        {/* Card 5: Export */}
        <FramerStaggerItem>
          <div className="h-full group relative rounded-3xl border border-white/10 bg-[#14120B] p-8 shadow-none overflow-hidden hover:border-primary/40 transition-colors flex flex-col justify-between">
             <div className="relative z-10">
              <div className="mb-4 inline-grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">PDF & CSV Export</h3>
              <p className="text-white/60 text-sm leading-relaxed">Polished, shareable reports for stakeholders, auditors, and pipelines.</p>
            </div>
            <div className="mt-6 flex gap-2 relative z-10 justify-center">
              <div className="w-12 h-16 bg-white border border-white/20 rounded shadow-none flex flex-col gap-1 p-2">
                 <div className="w-full h-1 bg-red-500 rounded-sm" />
                 <div className="w-3/4 h-0.5 bg-black/20 mt-1" />
                 <div className="w-full h-0.5 bg-black/10" />
                 <div className="w-5/6 h-0.5 bg-black/10" />
              </div>
               <div className="w-12 h-16 bg-[#14120B] border border-white/20 rounded shadow-none flex flex-col gap-1 p-2 overflow-hidden">
                 <div className="flex gap-1"><div className="w-2 h-2 bg-green-500/50" /><div className="w-4 h-2 bg-white/20" /></div>
                 <div className="flex gap-1"><div className="w-2 h-2 bg-green-500/50" /><div className="w-6 h-2 bg-white/20" /></div>
                 <div className="flex gap-1"><div className="w-2 h-2 bg-red-500/50" /><div className="w-3 h-2 bg-white/20" /></div>
              </div>
            </div>
          </div>
        </FramerStaggerItem>

        {/* Card 6: Built for Teams (Spans 3 cols) */}
        <FramerStaggerItem className="md:col-span-3">
          <div className="h-full group relative rounded-3xl border border-white/10 bg-[#14120B] p-8 md:p-12 shadow-none overflow-hidden hover:border-primary/40 transition-colors flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="relative z-10 max-w-xl">
              <div className="mb-4 inline-grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Built for Collaborative Teams</h3>
              <p className="text-white/60 leading-relaxed">
                Granular roles, inline commenting, and full audit history ensure your QA engineers, product managers, and developers stay perfectly aligned.
              </p>
            </div>
            <div className="relative z-10 flex -space-x-4 hover:space-x-2 transition-all duration-300">
              <div className="h-16 w-16 rounded-full border-2 border-[#14120B] bg-gradient-to-br from-primary to-slate-400 flex items-center justify-center text-[#14120B] font-bold shadow-none">PM</div>
              <div className="h-16 w-16 rounded-full border-2 border-[#14120B] bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold shadow-none">QA</div>
              <div className="h-16 w-16 rounded-full border-2 border-[#14120B] bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-none">DEV</div>
              <div className="h-16 w-16 rounded-full border-2 border-[#14120B] bg-white/5 flex items-center justify-center text-white font-bold shadow-none backdrop-blur border-dashed border-white/30">+3</div>
            </div>
          </div>
        </FramerStaggerItem>

      </FramerReveal>
    </section>
  );
}
