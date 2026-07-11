import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { useApp, delay } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Log in — Speclane" }] }),
});

import { supabase } from "@/lib/supabase";

import { Mail, Lock, Sparkles, Quote, ArrowRight, User as UserIcon, Eye, EyeOff } from "lucide-react";

function LoginPage() {
  const navigate = useNavigate();
  const setUser = useApp((s) => s.setUser);
  const fetchData = useApp((s) => s.fetchData);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          avatar: session.user.user_metadata?.avatar_url
        });
        navigate({ to: "/app" });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          avatar: session.user.user_metadata?.avatar_url
        });
        navigate({ to: "/app" });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, setUser]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const cleanEmail = email.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser({ 
          id: data.user.id, 
          email: data.user.email!, 
          name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0],
          avatar: data.user.user_metadata?.avatar_url
        });
        await fetchData();
        toast.success("Welcome back!");
        navigate({ to: "/app" });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { 
        redirectTo: window.location.origin + '/app',
        scopes: 'repo'
      }
    });
    if (error) toast.error(error.message);
  };

  const sendPasswordReset = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) return toast.error("Enter your email first");
    setSendingReset(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/set-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo });
      if (error) throw error;
      toast.success("Password setup link sent. Check your email.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send password setup email");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <AuthShell title="Welcome Back!" subtitle="Sign in to access your dashboard and continue optimizing your QA process.">
      <form onSubmit={submit} className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-white/90">Email</Label>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-white/90">Password</Label>
            <button
              type="button"
              onClick={sendPasswordReset}
              disabled={sendingReset}
              className="text-xs text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline disabled:opacity-50 font-medium"
            >
              {sendingReset ? "Sending link…" : "Forgot Password?"}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3 h-4 w-4 text-white/40 pointer-events-none" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              required 
              autoComplete="new-password" 
              placeholder="Enter your password"
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Sign In"}
        </Button>

        <div className="relative my-4">
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
          Don't have an Account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign Up</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  headline?: string;
  badgeText?: string;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    initials: string;
    logo?: string;
  };
}

export function AuthShell({ title, subtitle, children, headline, badgeText, testimonial }: AuthShellProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const displayHeadline = headline || "Revolutionize QA with Smarter Automation";
  const displayBadge = badgeText || "Speclane Autonomous SQA Cloud";
  const displayTestimonial = testimonial || {
    quote: "Speclane has completely transformed our testing process. It's reliable, efficient, and ensures our releases are always top-notch.",
    author: "Michael Carter",
    role: "Software Engineer at DevCore",
    initials: "MC",
    logo: "github"
  };

  return (
    <div className="min-h-screen h-screen grid lg:grid-cols-12 bg-[#14120B] text-white selection:bg-primary/30 overflow-hidden relative">
      {/* Smooth Loading Curtain */}
      <div 
        className={`absolute inset-0 z-50 bg-[#14120B] flex flex-col items-center justify-center transition-all duration-700 ease-out pointer-events-none ${
          pageReady ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <div className="flex gap-2 items-center mt-2">
             <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
             <span className="text-xs font-mono tracking-widest text-white/40 uppercase font-semibold">Loading Environment...</span>
          </div>
        </div>
      </div>

      {/* Left Form Panel (Spans 5 cols on lg) */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 lg:px-12 lg:py-8 relative z-10 border-r border-white/5 bg-[#14120B] h-screen overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
        </div>
        
        <div className="mx-auto w-full max-w-md my-auto py-2">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-1.5 leading-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 font-normal leading-relaxed">
              {subtitle}
            </p>
          </div>
          
          {/* Form Content */}
          <div className="relative">
             {children}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40 pt-3 border-t border-white/5 font-medium shrink-0">
          <p>© {new Date().getFullYear()} Speclane Inc.</p>
          <div className="flex items-center gap-5">
            <Link to="/security" className="hover:text-white transition-colors">Security</Link>
            <Link to="/faq" className="hover:text-white transition-colors">Privacy</Link>
            <a href="mailto:pulsarx.inc@gmail.com" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </div>

      {/* Right Atmospheric Full-Bleed Panel (Spans 7 cols on lg) */}
      <div className="lg:col-span-7 relative hidden lg:flex flex-col justify-between p-10 lg:py-8 h-screen overflow-hidden bg-[#14120B] border-l border-white/10">
        <div className="absolute inset-0 bg-[#14120B] z-0" />
        {/* Framer Animated Background iframe */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <iframe
            src="https://courageous-embeds-612565.framer.app/"
            className={`w-full h-full border-none transition-opacity duration-1000 ease-out ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
            title="Speclane Animated Background"
            style={{ height: 'calc(100% + 60px)', marginBottom: '-60px' }}
            scrolling="no"
            loading="lazy"
            onLoad={() => setIframeLoaded(true)}
          />
          <div className="absolute inset-0 bg-[#14120B]/60 pointer-events-none z-10" />
        </div>
        
        {/* Top Header & Floating Badge */}
        <div className="flex items-center justify-between z-10 w-full shrink-0">
          <Logo />
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-semibold shadow-xl">
             {displayBadge}
          </div>
        </div>

        {/* Center Content: Headline & Testimonial exactly matching template */}
        <div className="max-w-xl my-auto space-y-6 z-10 py-2">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            {displayHeadline}
          </h2>

          <div className="space-y-4 relative">
             <Quote className="h-8 w-8 text-primary/50 -ml-1.5" />
             <blockquote className="text-base sm:text-lg font-light leading-relaxed text-white/95 italic">
               "{displayTestimonial.quote}"
             </blockquote>
             
             <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-slate-400 p-[2px] shadow-lg shrink-0">
                  <div className="w-full h-full rounded-full bg-[#111827] flex items-center justify-center font-bold text-sm text-white font-mono">
                    {displayTestimonial.initials}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-white font-bold text-sm tracking-wide">{displayTestimonial.author}</div>
                    <div className="text-[11px] text-primary/80 font-medium">{displayTestimonial.role}</div>
                  </div>
                  {displayTestimonial.logo && (
                    <div className="ml-3 pl-3 border-l border-white/20">
                      <img
                        src={`https://cdn.simpleicons.org/${displayTestimonial.logo}/white`}
                        className="h-5 w-auto object-contain opacity-80"
                        alt={displayTestimonial.logo}
                      />
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Social Proof Bar */}
        <div className="w-full pt-6 border-t border-white/20 z-10 shrink-0">
          <div className="text-[11px] uppercase font-bold tracking-widest text-white/60 mb-4 font-mono">
            SECURED & TRUSTED BY INDUSTRY LEADERS
          </div>
          
          <div className="flex flex-wrap items-center gap-8 md:gap-12 opacity-80">
            <img src="https://cdn.simpleicons.org/vercel/white" className="h-5 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" alt="Vercel" />
            <img src="https://cdn.simpleicons.org/linear/white" className="h-5 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" alt="Linear" />
            <img src="https://cdn.simpleicons.org/stripe/white" className="h-5 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" alt="Stripe" />
            <img src="https://cdn.simpleicons.org/supabase/white" className="h-5 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" alt="Supabase" />
            <img src="https://cdn.simpleicons.org/github/white" className="h-5 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" alt="GitHub" />
          </div>
        </div>
      </div>
    </div>
  );
}
