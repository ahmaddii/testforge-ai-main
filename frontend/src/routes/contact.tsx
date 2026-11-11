import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building, Clock, Loader2, Mail, MessageSquare, Phone, Send, Shield, Zap } from "lucide-react";
import { GeminiIcon } from "@/components/gemini-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PublicLayout } from "@/components/public-layout";
import { CTA } from "@/components/cta";
import { FramerReveal, FramerStaggerItem } from "@/components/framer-reveal";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({ meta: [{ title: "Contact Us — Speclane" }] }),
});

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    inquiryType: "sales",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", formData);
      toast.success("Message received! Our team will get back to you within working business hours.");
      setFormData({ name: "", email: "", company: "", inquiryType: "sales", message: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to send inquiry. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="pt-24 md:pt-32 pb-16 relative overflow-hidden">
        <div className="container relative mx-auto px-4 z-10">
          <FramerReveal className="mx-auto max-w-3xl text-center" direction="up" distance={40}>
            <Badge variant="outline" className="mb-4 rounded-full border-primary/20 bg-primary/5 text-primary px-4 py-1.5 font-semibold">
              <MessageSquare className="h-3.5 w-3.5 mr-2 inline text-primary" /> Enterprise Inquiries
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent leading-[1.15]">
              Let's build your automated QA pipeline
            </h1>
            <p className="text-lg text-white/60 md:text-xl leading-relaxed max-w-2xl mx-auto">
              Have questions about Enterprise licensing, custom AI integration, or evaluating Speclane for your team? Our engineering and sales experts are here to help.
            </p>
          </FramerReveal>
        </div>
      </div>

      <section className="container mx-auto px-4 pb-24 relative z-10 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Contact Information Cards (Spans 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <FramerReveal direction="right" staggerChildren={0.1}>
              <FramerStaggerItem>
                <div className="rounded-3xl border border-white/10 bg-[#14120B] p-8 shadow-none relative overflow-hidden group hover:border-primary/30 transition-colors">
                  <div className="absolute top-0 right-0 p-6 opacity-10 text-primary">
                    <Building className="h-16 w-16" />
                  </div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 border border-primary/20">
                    <GeminiIcon className="h-6 w-6 object-contain" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-2">Sales & Enterprise</h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-6 font-light">
                    Custom deployment, SLA guarantees, dedicated account managers, and volume pricing discounts.
                  </p>
                  <div className="flex items-center gap-3 text-sm text-white/90 font-medium font-mono bg-white/5 p-3 rounded-xl border border-white/5">
                    <Mail className="h-4 w-4 text-primary" /> enterprise@speclane.com
                  </div>
                </div>
              </FramerStaggerItem>

              <FramerStaggerItem>
                <div className="rounded-3xl border border-white/10 bg-[#14120B] p-8 shadow-none relative overflow-hidden group hover:border-primary/30 transition-colors mt-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-2">Support & Engineering</h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-6 font-light">
                    Direct access to our core AI engineers and QA infrastructure specialists for any technical questions.
                  </p>
                  <div className="flex items-center gap-3 text-sm text-white/90 font-medium font-mono bg-white/5 p-3 rounded-xl border border-white/5">
                    <Mail className="h-4 w-4 text-emerald-400" /> support@speclane.com
                  </div>
                </div>
              </FramerStaggerItem>

              {/* Trust Badges */}
              <FramerStaggerItem>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 text-center shadow-none">
                    <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
                    <div className="text-sm font-bold text-white">2-Hour SLA</div>
                    <div className="text-xs text-white/40">Guaranteed response</div>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 text-center shadow-none">
                    <Shield className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                    <div className="text-sm font-bold text-white">Strict NDA</div>
                    <div className="text-xs text-white/40">100% Confidential</div>
                  </div>
                </div>
              </FramerStaggerItem>
            </FramerReveal>
          </div>

          {/* Contact Form (Spans 7 cols) */}
          <div className="lg:col-span-7">
            <FramerReveal direction="left">
              <div className="rounded-3xl border border-white/10 bg-[#14120B] p-8 md:p-12 shadow-none relative overflow-hidden">
                <h2 className="text-2xl font-extrabold text-white mb-6 tracking-tight">Send an Inquiry</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-white/90">Full Name *</Label>
                      <Input
                        id="name"
                        required
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary text-sm px-4 shadow-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-white/90">Work Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="Enter your work email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary text-sm px-4 shadow-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm font-medium text-white/90">Company Name *</Label>
                      <Input
                        id="company"
                        required
                        placeholder="Enter your company name"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="h-12 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary text-sm px-4 shadow-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiryType" className="text-sm font-medium text-white/90">Inquiry Type</Label>
                      <Select
                        value={formData.inquiryType}
                        onValueChange={(val) => setFormData({ ...formData, inquiryType: val })}
                      >
                        <SelectTrigger className="w-full h-12 px-4 rounded-2xl bg-white/5 border-white/10 text-white focus:ring-primary/20 text-sm shadow-none">
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#14120B] border border-white/10 text-white rounded-2xl shadow-none">
                          <SelectItem value="sales" className="focus:bg-white/10 py-3 rounded-xl cursor-pointer">Sales & Enterprise Licensing</SelectItem>
                          <SelectItem value="demo" className="focus:bg-white/10 py-3 rounded-xl cursor-pointer">Request a Live Demo</SelectItem>
                          <SelectItem value="support" className="focus:bg-white/10 py-3 rounded-xl cursor-pointer">Technical Support & Bugs</SelectItem>
                          <SelectItem value="partners" className="focus:bg-white/10 py-3 rounded-xl cursor-pointer">Partnerships & Integrations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium text-white/90">How can we help you? *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={5}
                      placeholder="Tell us about your testing requirements, existing stack, and team size..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary p-4 text-sm resize-none shadow-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-2xl font-extrabold bg-primary hover:bg-primary/90 text-[#14120B] shadow-none transition-colors text-base"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </FramerReveal>
          </div>
        </div>
      </section>

      {/* Enterprise Buyer FAQ Section */}
      <section className="container mx-auto px-4 pb-24 max-w-4xl relative z-10">
        <FramerReveal className="text-center mb-12" direction="up">
          <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Enterprise Evaluation FAQ</h2>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            Quick answers to common questions asked by VP of QA and Engineering directors during vendor evaluation.
          </p>
        </FramerReveal>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border-white/10 bg-[#14120B] px-6 rounded-2xl">
            <AccordionTrigger className="text-left font-bold text-white hover:text-primary transition-colors py-5 text-base">
              Do you sign NDAs before discussing our proprietary product requirements?
            </AccordionTrigger>
            <AccordionContent className="text-white/60 leading-relaxed pb-5 text-sm">
              Absolutely. We operate under strict confidentiality. Our enterprise team can execute mutual NDAs prior to any deep-dive architecture discussions or sample document evaluations.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-white/10 bg-[#14120B] px-6 rounded-2xl">
            <AccordionTrigger className="text-left font-bold text-white hover:text-primary transition-colors py-5 text-base">
              Can we evaluate Speclane on a private cloud or on-premise infrastructure?
            </AccordionTrigger>
            <AccordionContent className="text-white/60 leading-relaxed pb-5 text-sm">
              Yes. Enterprise plans include options for dedicated virtual private cloud (VPC) deployments and self-hosted docker clusters to ensure zero data egress for sensitive test environments.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-white/10 bg-[#14120B] px-6 rounded-2xl">
            <AccordionTrigger className="text-left font-bold text-white hover:text-primary transition-colors py-5 text-base">
              What is the SLA and onboarding support for Enterprise teams?
            </AccordionTrigger>
            <AccordionContent className="text-white/60 leading-relaxed pb-5 text-sm">
              We provide a guaranteed 2-hour response window for critical inquiries, dedicated Jitsi video call channels with our core AI engineers, and customized onboarding workshops for your entire QA organization.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <CTA />
    </PublicLayout>
  );
}
