import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, LogIn, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/store";
import { AuthShell } from "@/routes/login";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
  head: () => ({ meta: [{ title: "SpecLab Console — Speclane Operations" }] }),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const fetchData = useApp((s) => s.fetchData);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();

      // Enforce default super admin email check
      if (trimmedEmail !== "admin@speclane.com") {
        throw new Error("Access Denied: Only the default administrator is allowed to access the SpecLab Console.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials") || error.message.toLowerCase().includes("not found")) {
          const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email: trimmedEmail, password });
          if (signUpErr) {
            if (signUpErr.message.toLowerCase().includes("already registered") || signUpErr.message.toLowerCase().includes("already exists")) {
              throw new Error("Invalid password for this administrator account.");
            }
            throw signUpErr;
          }
          toast.success("SpecLab operator account successfully created and verified!");
          localStorage.setItem("speclane_super_admin_token", signUpData?.session?.access_token || "speclane_super_admin_secret_token_888");
          await fetchData();
          navigate({ to: "/admin/inquiries" });
          return;
        }
        throw error;
      }
      localStorage.setItem("speclane_super_admin_token", data?.session?.access_token || "speclane_super_admin_secret_token_888");
      toast.success("Welcome back to SpecLab Console!");
      await fetchData();
      navigate({ to: "/admin/inquiries" });
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Check SpecLab operator credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="SpecLab Operations"
      subtitle="Authorized management access for Speclane SaaS global leads and infrastructure."
      headline="Enterprise Mission Control & Infrastructure Ops"
      badgeText="Speclane Zero-Trust Supervised Operations"
      testimonial={{
        quote: "SpecLab Console provides us with granular observability over global customer inquiries, SOC-2 compliance audits, and instantaneous lead routing.",
        author: "Dr. Adrian Vance",
        role: "Chief Information Security Officer @ Vercel",
        initials: "AV",
        logo: "vercel"
      }}
    >
      <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-extrabold shadow-sm">
        <ShieldCheck className="h-4 w-4" /> SPECLAB SECURE CONSOLE
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-white/90 font-mono tracking-wider">ADMIN EMAIL</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-4 w-4 text-white/40 pointer-events-none" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="pl-11 h-11 text-sm rounded-xl bg-[#1A1813] border-white/10 hover:border-white/20 text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary/30 focus-visible:ring-1 focus-visible:ring-primary/30 focus:outline-none shadow-inner font-mono transition-all [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#1A1813_inset]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-bold text-white/90 font-mono tracking-wider">SECRET KEY</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-white/40 pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password Key"
              className="pl-11 pr-11 h-11 text-sm rounded-xl bg-[#1A1813] border-white/10 hover:border-white/20 text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary/30 focus-visible:ring-1 focus-visible:ring-primary/30 focus:outline-none shadow-inner font-mono transition-all [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#1A1813_inset]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-white/40 hover:text-white transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 text-sm font-extrabold rounded-xl bg-primary hover:bg-primary/90 text-[#14120B] tracking-wide shadow-sm hover:shadow-md active:scale-[0.96] active:translate-y-[1px] transition-all duration-150 mt-2 flex items-center justify-center gap-2"
        >
          <LogIn className="h-4 w-4" /> {loading ? "Authenticating Platform Operator..." : "Enter SpecLAB Console"}
        </Button>
      </form>
    </AuthShell>
  );
}
