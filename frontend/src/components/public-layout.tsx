import { useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  useSmoothScroll();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        navigate({ to: "/admin/login" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#14120B] text-foreground antialiased flex flex-col relative overflow-x-hidden selection:bg-primary/30">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

function Nav() {
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const showAnim = gsap.from(nav, {
      yPercent: -100,
      paused: true,
      duration: 0.3,
      ease: "power2.out"
    }).progress(1);

    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        self.direction === -1 ? showAnim.play() : showAnim.reverse();
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.vars.trigger === nav && t.kill());
    };
  }, []);

  return (
    <div ref={navRef} className="fixed top-0 inset-x-0 z-50 p-6 pointer-events-none">
      <header className="pointer-events-auto mx-auto max-w-6xl flex h-18 items-center justify-between rounded-full border border-white/[0.08] bg-[#14120B]/40 px-8 backdrop-blur-xl shadow-none ring-1 ring-white/5 transition-all">
        <Link to="/"><Logo /></Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/features" className="text-sm font-medium text-white/70 hover:text-white transition-colors [&.active]:text-white">Features</Link>
          <Link to="/how-it-works" className="text-sm font-medium text-white/70 hover:text-white transition-colors [&.active]:text-white">How it works</Link>
          <Link to="/pricing" className="text-sm font-medium text-white/70 hover:text-white transition-colors [&.active]:text-white">Pricing</Link>
          <Link to="/faq" className="text-sm font-medium text-white/70 hover:text-white transition-colors [&.active]:text-white">FAQ</Link>
          <Link to="/security" className="text-sm font-medium text-white/70 hover:text-white transition-colors [&.active]:text-white">Security</Link>
          <Link to="/contact" className="text-sm font-medium text-white/70 hover:text-white transition-colors [&.active]:text-white">Contact</Link>
        </nav>
        <div className="flex items-center gap-6">
          <Link to="/login" className="hidden sm:block text-sm font-medium text-white/70 hover:text-white transition-colors">Log in</Link>
          <Link to="/signup">
            <Button className="relative group rounded-full gradient-bg text-primary-foreground shadow-none font-black overflow-hidden border-none transition-all px-10 h-12 text-[16px]">
              <span className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                Start free
              </span>
            </Button>
          </Link>
        </div>
      </header>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-[#14120B] relative pt-20 pb-10 overflow-hidden border-t border-white/10">
      {/* Framer Animated Background iframe */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <iframe
          src="https://courageous-embeds-612565.framer.app/"
          className="w-full h-full border-none"
          title="Footer Animated Background"
          style={{ height: 'calc(100% + 60px)', marginBottom: '-60px' }}
          scrolling="no"
          loading="lazy"
        />
        {/* Gradient overlay so footer content stays readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#14120B] via-[#14120B]/90 to-[#14120B]/70" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-6"><Logo /></Link>
            <p className="text-white/40 text-sm max-w-[240px] leading-relaxed mb-6 font-light">
              Automating SQA test case generation with high-fidelity AI. Built for the modern engineering team.
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-8 w-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <img src="https://cdn.simpleicons.org/x/white" className="h-3 w-3" alt="X" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <img src="https://cdn.simpleicons.org/github/white" className="h-3 w-3" alt="GitHub" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <img src="https://cdn.simpleicons.org/discord/white" className="h-3 w-3" alt="Discord" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-bold mb-6 uppercase tracking-widest">Product</h4>
            <ul className="space-y-4">
              <li><Link to="/features" className="text-white/40 hover:text-white transition-colors text-sm">Features</Link></li>
              <li><Link to="/how-it-works" className="text-white/40 hover:text-white transition-colors text-sm">Workflow</Link></li>
              <li><Link to="/pricing" className="text-white/40 hover:text-white transition-colors text-sm">Pricing</Link></li>
              <li><Link to="/app" className="text-white/40 hover:text-white transition-colors text-sm">Live Demo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-bold mb-6 uppercase tracking-widest">Resources</h4>
            <ul className="space-y-4">
              <li><Link to="/faq" className="text-white/40 hover:text-white transition-colors text-sm">FAQ</Link></li>
              <li><Link to="/security" className="text-white/40 hover:text-white transition-colors text-sm">Security & Compliance</Link></li>
              <li><Link to="/contact" className="text-white/40 hover:text-white transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold relative z-10">© {new Date().getFullYear()} Speclane. All rights reserved.</p>
          <div className="flex items-center gap-6 relative z-10">
            <Link to="/admin/login" className="text-[10px] text-white/50 hover:text-white font-mono uppercase tracking-widest transition-colors font-medium">
              SpecLab
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
