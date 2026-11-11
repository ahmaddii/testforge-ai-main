import { Link } from "@tanstack/react-router";
import { Search, CheckCircle2, FolderGit2, ChevronDown, Home, Layers, Bug, Target, AlertTriangle, Wand2, Settings, CreditCard } from "lucide-react";
import { GeminiIcon } from "@/components/gemini-icon";
import { Button } from "@/components/ui/button";
import { FramerReveal } from "@/components/framer-reveal";

export function CTA() {
  return (
    <FramerReveal direction="up" duration={1} className="w-full pb-0">
      {/* Full-width edge-to-edge section with clean solid dark background */}
      <div className="relative w-full bg-[#14120B] pt-16 md:pt-20 px-0 pb-0 border-b border-primary/20 overflow-hidden text-center">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] opacity-35" />

        <div className="relative z-10 flex flex-col items-center w-full px-6 md:px-12">
          
          {/* Central Logo Container */}
          <div className="h-14 w-14 rounded-xl bg-white flex items-center justify-center shadow-lg transition-transform duration-500 hover:scale-110 mb-6">
            <img src="/integrations/logos/speclane-white.png" className="h-10 w-10 object-contain invert" alt="Speclane SQA" />
          </div>

          {/* SQA Centered Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] max-w-5xl mb-6">
            All your SQA, <br /> <span className="sm:whitespace-nowrap">all your coverage, all powered by AI</span>
          </h2>

          {/* Pill Action Button */}
          <div className="mb-5">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 h-13 px-10 text-sm rounded-full font-extrabold transition-all duration-300 hover:scale-105 shadow-md">
                Get started FREE
              </Button>
            </Link>
          </div>

          {/* Footnote text */}
          <p className="text-[10px] text-white/30 font-medium tracking-wide leading-relaxed max-w-xs mb-8">
            1. Our agreements ensure zero data training & retention on all third-party model providers
          </p>

          {/* SQA Workspace Mockups - Overlapping higher into hero, 80% section width, significantly bigger */}
          <div className="relative w-full max-w-5xl mx-auto h-[320px] overflow-hidden shrink-0 -mt-16 z-20">
            
            {/* Desktop Dashboard Mockup (Top half visible, significantly larger and centered) */}
            <div className="w-full rounded-t-2xl border border-white/10 bg-[#17150F] shadow-2xl relative overflow-hidden text-left flex flex-col h-[380px] scale-[1.02] origin-top transition-transform duration-500">
              
              {/* Window Title Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#110F0A] border-b border-white/5 select-none shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                
                {/* Simulated URL/Search Bar */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-lg w-52 md:w-80 text-[10px] text-white/40 justify-center">
                  <Search size={10} />
                  <span>speclane.ai/app/dashboard</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[9px] font-bold">
                    AI
                  </div>
                </div>
              </div>

              {/* Inner Dashboard Layout (Sidebar + Main panel) */}
              <div className="flex flex-1 overflow-hidden">
                
                {/* Left Sidebar Mockup */}
                <div className="w-40 bg-[#12100B] border-r border-white/5 p-2.5 flex flex-col justify-between shrink-0 hidden sm:flex select-none overflow-y-auto">
                  <div className="space-y-3">
                    {/* Workspace Profile */}
                    <div className="flex items-center justify-between p-1 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-1.5 truncate">
                        <div className="h-5 w-5 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[8px] font-black">
                          S
                        </div>
                        <span className="text-[8px] font-bold text-white truncate">Speclane SQA</span>
                      </div>
                      <ChevronDown size={8} className="text-white/40 shrink-0" />
                    </div>

                    {/* Sidebar Group: Overview */}
                    <div className="space-y-0.5">
                      <div className="text-[7px] font-bold text-white/30 uppercase tracking-widest px-1.5 mb-1">Overview</div>
                      {[
                        { label: "Dashboard", icon: Home, active: true },
                        { label: "Projects", icon: FolderGit2, active: false }
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div 
                            key={idx}
                            className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold cursor-pointer transition-colors ${
                              item.active 
                                ? "bg-primary text-[#14120B]" 
                                : "text-white/50 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <Icon size={10} />
                            <span>{item.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Sidebar Group: Execution & AI */}
                    <div className="space-y-0.5 pt-1 border-t border-white/5">
                      <div className="text-[7px] font-bold text-white/30 uppercase tracking-widest px-1.5 mb-1">Execution & AI</div>
                      {[
                        { label: "AI Generator", icon: GeminiIcon, active: false },
                        { label: "Test Cases", icon: Layers, active: false },
                        { label: "Runs", icon: Target, active: false },
                        { label: "Defects", icon: Bug, active: false },
                        { label: "Self-Healing", icon: Wand2, active: false },
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div 
                            key={idx}
                            className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold cursor-pointer transition-colors text-white/50 hover:bg-white/5 hover:text-white`}
                          >
                            <Icon size={10} />
                            <span>{item.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Sidebar Group: Workspace */}
                    <div className="space-y-0.5 pt-1 border-t border-white/5">
                      <div className="text-[7px] font-bold text-white/30 uppercase tracking-widest px-1.5 mb-1">Workspace</div>
                      {[
                        { label: "Settings", icon: Settings, active: false },
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div 
                            key={idx}
                            className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold cursor-pointer transition-colors text-white/50 hover:bg-white/5 hover:text-white`}
                          >
                            <Icon size={10} />
                            <span>{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sidebar Footer */}
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-2 shrink-0">
                    <div className="h-5.5 w-5.5 rounded-full bg-primary/20 border border-primary/40 text-primary flex items-center justify-center text-[7px] font-black shrink-0 shadow-sm relative">
                      MA
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full border border-[#12100B]" />
                    </div>
                    <div className="text-[7px] font-bold text-white/60">Malik Ahmad</div>
                  </div>
                </div>

                {/* Main Content Mockup Panel - Matches DashboardHome Component */}
                <div className="flex-1 bg-[#15130E] p-4 flex flex-col gap-4 overflow-y-auto">
                  
                  {/* Panel Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="text-left">
                      <div className="text-[11px] font-black text-white">Command Center</div>
                      <div className="text-[8px] text-white/40 font-medium">Automated QA infrastructure.</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button className="h-6 px-2 text-[8px] bg-primary text-[#14120B] hover:bg-primary/95 font-bold rounded-lg gap-1 border border-primary/20">
                        <GeminiIcon size={8} />
                        <span>Generate SQA</span>
                      </Button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Projects", val: "4", icon: FolderGit2 },
                      { label: "Test Cases", val: "42", icon: Layers },
                      { label: "Open Defects", val: "3", icon: Bug },
                      { label: "Coverage", val: "94%", icon: Target }
                    ].map((stat, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col text-left">
                        <stat.icon size={10} className="text-primary mb-1" />
                        <span className="text-[11px] font-black text-white leading-none">{stat.val}</span>
                        <span className="text-[6px] text-white/40 font-semibold uppercase tracking-wider mt-0.5">{stat.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Active Defects/Runs Rows */}
                  <div className="space-y-1.5 text-left">
                    <div className="text-[7px] uppercase font-mono text-white/30 tracking-wider font-bold">Recent Runs & Defects</div>
                    {[
                      { title: "Verify Authentication Flow (src/routes/login.tsx)", state: "Passed", icon: CheckCircle2, iconColor: "text-emerald-500", pillBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
                      { title: "Verify Reports Generation (app.reports.tsx)", state: "Failed", icon: AlertTriangle, iconColor: "text-rose-500", pillBg: "bg-rose-500/10 text-rose-400 border border-rose-500/20" },
                    ].map((row, rIdx) => (
                      <div 
                        key={rIdx} 
                        className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between gap-3 transition-all duration-300 hover:border-white/10"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <row.icon size={10} className={row.iconColor} />
                          <span className="text-[8px] font-bold text-white truncate">{row.title}</span>
                        </div>
                        <span className={`text-[7px] font-bold font-mono px-1.5 py-0.5 rounded uppercase ${row.pillBg}`}>
                          {row.state}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </div>

            {/* Mobile Phone Mockup Overlay (Floating on the right side, elevated, significantly larger) */}
            <div className="absolute right-10 top-[45px] w-44 h-[320px] bg-[#0E0D09] border-[4px] border-white rounded-t-[1.5rem] shadow-2xl overflow-hidden flex flex-col text-left select-none hidden md:flex z-20 scale-[1.02] origin-top transition-transform duration-500">
              
              {/* Status Bar / Notch */}
              <div className="h-5.5 bg-[#0E0D09] flex items-center justify-between px-3.5 py-1 border-b border-white/5 shrink-0">
                <span className="text-[7px] font-extrabold text-white/60">9:41</span>
                {/* Notch */}
                <div className="h-1.5 w-12 bg-black rounded-full" />
                <span className="text-[7px] font-extrabold text-white/60">5G</span>
              </div>

              {/* Mobile Content */}
              <div className="flex-1 bg-[#13110C] p-3 flex flex-col gap-3 overflow-y-auto">
                
                {/* Header Profile */}
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                  <div className="flex items-center gap-1">
                    <div className="h-4.5 w-4.5 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[7px] font-black">
                      S
                    </div>
                    <span className="text-[8px] font-bold text-white">Speclane SQA</span>
                  </div>
                  <div className="relative h-5.5 w-5.5 rounded-full bg-primary/20 border border-primary/40 text-primary flex items-center justify-center text-[7px] font-black shrink-0 shadow-sm">
                    MA
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full border border-[#0E0D09]" />
                  </div>
                </div>

                {/* Quick KPI Badges */}
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Defects", count: "3 open", color: "bg-rose-500/10 text-rose-400 border border-rose-500/20" },
                    { label: "Cases", count: "42 items", color: "bg-primary/10 text-primary border border-primary/20" },
                  ].map((card, idx) => (
                    <div key={idx} className={`p-1.5 rounded-lg flex flex-col gap-0.5 ${card.color}`}>
                      <span className="text-[6px] uppercase font-bold tracking-wider opacity-60">{card.label}</span>
                      <span className="text-[8px] font-black leading-none">{card.count}</span>
                    </div>
                  ))}
                </div>

                {/* Mobile Recent Items List */}
                <div className="space-y-1">
                  <div className="text-[6px] uppercase font-bold tracking-widest text-white/30">Recent Runs</div>
                  {[
                    { text: "Verify Authentication Flow", active: true },
                    { text: "Verify Reports Generation", active: false }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-1.5 rounded-lg border text-[7px] font-semibold transition-all ${
                        item.active 
                          ? "bg-primary/5 border-primary/20 text-primary" 
                          : "bg-white/5 border-white/5 text-white/50"
                      }`}
                    >
                      <p className="truncate">{item.text}</p>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </FramerReveal>
  );
}
