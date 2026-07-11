import { createFileRoute } from "@tanstack/react-router";
import { Shield, Lock, Server, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/public-layout";
import { CTA } from "@/components/cta";
import { FramerReveal, FramerStaggerItem } from "@/components/framer-reveal";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
  head: () => ({
    meta: [{ title: "Security & Compliance — Speclane" }],
  }),
});

function SecurityPage() {
  const securityFeatures = [
    {
      icon: Shield,
      title: "SOC 2 Type II Compliant",
      desc: "Our platform and infrastructure are audited annually to ensure the highest standards of security, availability, and confidentiality."
    },
    {
      icon: Lock,
      title: "Zero Data Retention",
      desc: "We do not train our machine learning models on your private source code. Your code is processed in memory and immediately discarded."
    },
    {
      icon: Server,
      title: "End-to-End Encryption",
      desc: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Your credentials and API keys are stored in isolated vaults."
    },
    {
      icon: FileCheck,
      title: "Role-Based Access Control",
      desc: "Granular permissions ensure that team members only have access to the repositories and test environments they explicitly need."
    }
  ];

  return (
    <PublicLayout>
      <div className="pt-24 md:pt-32 pb-16 relative overflow-hidden">
        <div className="container relative mx-auto px-4">
          <FramerReveal className="mx-auto max-w-3xl text-center" direction="up" distance={40}>
            <Badge variant="outline" className="mb-4 rounded-full border-primary/20 bg-primary/5 text-primary font-semibold">Enterprise Grade</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Security & Compliance
            </h1>
            <p className="text-lg text-white/60 md:text-xl">
              We treat your source code with the same level of security as you do. Speclane is built from the ground up to meet strict enterprise compliance standards.
            </p>
          </FramerReveal>
        </div>
      </div>

      <section className="container mx-auto px-4 py-16 max-w-5xl relative z-10">
        <FramerReveal direction="up" staggerChildren={0.12} className="grid gap-8 md:grid-cols-2">
          {securityFeatures.map((feature, idx) => (
            <FramerStaggerItem key={idx}>
              <div className="h-full rounded-3xl border border-white/10 bg-[#14120B] p-8 shadow-none relative overflow-hidden group transition-colors hover:border-primary/30">
                <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-[#14120B] shadow-none relative z-10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white relative z-10">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed relative z-10">{feature.desc}</p>
              </div>
            </FramerStaggerItem>
          ))}
        </FramerReveal>
      </section>

      <CTA />
    </PublicLayout>
  );
}
