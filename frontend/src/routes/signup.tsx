import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp, delay } from "@/lib/store";
import { toast } from "sonner";
import { AuthShell } from "./login";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Sign up — Speclane" }] }),
});

import { supabase } from "@/lib/supabase";

import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff } from "lucide-react";

function SignupPage() {
  const navigate = useNavigate();
  const setUser = useApp((s) => s.setUser);
  const fetchData = useApp((s) => s.fetchData);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);



  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanEmail = email.trim();
      if (!cleanEmail) throw new Error("Please enter your email");

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        if (!data.session) {
          toast.success("Account created successfully!", {
            description: "Next step: Please check your email to confirm your account, then log in.",
            duration: 8000,
          });
          navigate({ to: "/login" });
          return;
        }

        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: name || data.user.email?.split("@")[0]
        });
        await fetchData();
        toast.success("Account created successfully!", {
          description: "Welcome to Speclane! Next step: connect a repository to create your first QA workspace.",
          duration: 7000,
        });
        localStorage.removeItem("speclane_onboarded");
        navigate({ to: "/app/projects" });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin + '/app' }
    });
    if (error) toast.error(error.message);
  };

  return (
    <AuthShell title="Create your account" subtitle="Start generating test cases in minutes">
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-white/90">Full Name</Label>
          <div className="relative">
            <UserIcon className="absolute left-4 top-3 h-4 w-4 text-white/40 pointer-events-none" />
            <Input
              id="name"
              required
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-11 h-10 text-sm rounded-xl bg-[#1A1813] border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#1A1813_inset]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-white/90">Work Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-3 h-4 w-4 text-white/40 pointer-events-none" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="off"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 h-10 text-sm rounded-xl bg-[#1A1813] border-white/10 hover:border-white/20 text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary/30 focus-visible:ring-1 focus-visible:ring-primary/30 focus:outline-none shadow-inner transition-all [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#1A1813_inset]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-white/90">Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-3 h-4 w-4 text-white/40 pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Enter your password (min 8 char)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 pr-11 h-10 text-sm rounded-xl bg-[#1A1813] border-white/10 hover:border-white/20 text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary/30 focus-visible:ring-1 focus-visible:ring-primary/30 focus:outline-none shadow-inner transition-all [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#1A1813_inset]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-white/40 hover:text-white/80 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>



        <Button
          type="submit"
          className="w-full h-10 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-[#14120B] shadow-sm hover:shadow-md active:scale-[0.96] active:translate-y-[1px] transition-all duration-150 mt-1"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Sign Up"}
        </Button>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase font-semibold">
            <span className="bg-[#14120B] px-3 text-white/40 tracking-widest">OR</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-10 text-sm font-medium rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white hover:text-white transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm hover:border-white/20"
          onClick={loginWithGithub}
        >
          <Github className="h-4 w-4" /> Continue with GitHub
        </Button>

        <p className="text-center text-xs text-white/60 pt-1 font-medium">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
        </p>
      </form>
    </AuthShell>
  );
}
