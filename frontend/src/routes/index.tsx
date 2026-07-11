import React, { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Play, Check, Activity, Target, Zap, Bell, ChevronDown, Plus, Github, Search, Command, LayoutGrid, GitPullRequest, FileText, Sparkles, Share2, FolderGit2, ListChecks, FlaskConical, Bug, GitCompare, TrendingUp, Layers, History, Milestone, Server, FileBarChart, MessageSquare, Video, UsersRound, DownloadCloud, PlugZap, CreditCard, Settings, LifeBuoy, Wand2, ShieldCheck, PieChart, RefreshCw, FileSpreadsheet, LayoutDashboard, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/public-layout";
import { CTA } from "@/components/cta";
import { useParallax, useMagnetic, useCardTilt } from "@/hooks/use-gsap-animations";
import { FramerReveal, FramerStaggerItem } from "@/components/framer-reveal";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Speclane — Generate SQA Test Cases from Your Code" },
      { name: "description", content: "AI-powered test case generation for QA engineers. Connect GitHub, define requirements, export polished test plans in seconds." },
    ],
  }),
});

function Landing() {
  return (
    <div className="dark">
      <PublicLayout>
        <div className="bg-[#14120B] min-h-screen text-foreground selection:bg-primary/30 font-sans">
          <Hero />
          <LogoCloud />
          <LaserDivider />
          <CodeDiff />
          <LaserDivider />
          <BentoGrid />
          <LaserDivider />
          <KeyboardSpeed />
          <LaserDivider />
          <Integrations />
          <LaserDivider />
          <Metrics />
          <LaserDivider />
          <Testimonials />
          <div className="-mt-21 md:-mt-25 relative z-10 w-full">
            <CTA />
          </div>
          <LaserDivider />
          <BigBrandText />
          <SpecyWidget />
        </div>
      </PublicLayout>
    </div>
  );
}

function Hero() {
  const [activeMockupTab, setActiveMockupTab] = useState("test-cases");

  const getAppIconClass = (id: string) =>
    activeMockupTab === id
      ? "w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-sm cursor-pointer transition-all"
      : "w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer";

  const getNavItemClass = (id: string) =>
    activeMockupTab === id
      ? "flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#22201A] text-white cursor-pointer transition-all border border-white/5"
      : "flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:bg-[#22201A] hover:text-white cursor-pointer transition-colors";

  return (
    <section className="relative overflow-hidden pt-28 pb-32 md:pt-36 md:pb-40 bg-[#14120B]">

      <div className="container relative mx-auto px-4 lg:px-8 max-w-7xl z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[620px]">

          {/* Left Column: ClickUp Style Text & CTA (lg:col-span-6) */}
          <div className="lg:col-span-6 text-left space-y-6 py-4 pr-0 lg:pr-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] text-white">
              AI SQA Agent to <br className="hidden sm:block" /> replace manual QA
            </h1>

            {/* ClickUp Style Checkmark List */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-white/80 text-base leading-snug"><strong className="text-white font-bold">Save engineering hours.</strong> Automated test generation from code in seconds.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-white/80 text-base leading-snug"><strong className="text-white font-bold">Ensure flawless coverage.</strong> Deep AST analysis catches edge cases before production.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-white/80 text-base leading-snug"><strong className="text-white font-bold">Create infinite determinism.</strong> Autonomous regression detection & self-healing tests.</span>
              </div>
            </div>

            {/* ClickUp Style Button & Subtitle */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-black hover:bg-white/90 h-14 px-9 rounded-full font-extrabold text-base transition-all duration-300">
                  Get started. It's FREE!
                </Button>
              </Link>
              <div className="text-xs text-white/50 leading-relaxed font-medium">
                Free forever.<br />No credit card required.
              </div>
            </div>

            {/* ClickUp Style Pill Tags Cloud */}
            <div className="pt-8 border-t border-white/10 space-y-4 font-mono">
              <div className="text-[11px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-2.5">
                <span>INTERACTIVE MOCKUP</span> <span className="text-white/20">•</span> <span>CLICK SIDEBAR TABS TO EXPLORE</span>
              </div>
              <div className="flex flex-wrap gap-2.5 pt-1 font-sans">
                {[
                  { id: "projects", name: "Projects" },
                  { id: "requirements", name: "Requirements" },
                  { id: "test-plans", name: "Test Plans" },
                  { id: "test-cases", name: "Test Cases" },
                  { id: "ai-generator", name: "AI Generator" },
                  { id: "runs", name: "Run Comparison" },
                  { id: "defects", name: "Defect Hub" },
                  { id: "trends", name: "Trends & Reports" },
                  { id: "chat", name: "Team Chat" },
                  { id: "video", name: "Video Call" }
                ].map((pill) => (
                  <div key={pill.id} onClick={() => setActiveMockupTab(pill.id)} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${activeMockupTab === pill.id ? 'bg-primary/20 border-primary text-primary shadow-sm ring-1 ring-primary/50' : 'bg-white/[0.03] border-white/5 text-white/70 hover:border-white/20 hover:text-white'}`}>
                    {pill.name} {activeMockupTab === pill.id && <span className="ml-1 text-primary font-bold">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: ClickUp Style Overflowing Half Mockup (lg:col-span-6) */}
          <div className="lg:col-span-6 relative flex items-center h-full min-h-[580px] mt-8 lg:mt-16">

            {/* Absolute frame anchored to the left of column, extending off the right of screen */}
            <div className="absolute left-0 top-[54%] -translate-y-1/2 w-[900px] xl:w-[1050px] z-10 rounded-tl-3xl rounded-bl-3xl border-t border-l border-b border-white/10 bg-[#14120B] shadow-[0_0_80px_-15px_rgba(237,236,237,0.08)] overflow-hidden ring-1 ring-white/5 backdrop-blur-xl">

              {/* macOS Top Bar */}
              <div className="h-11 w-full bg-[#14120B] border-b border-white/5 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                  <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                  <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="text-[11px] font-mono text-white/40 font-semibold px-3 py-0.5 rounded bg-white/5 flex items-center">
                  speclane-studio.app
                </div>
                <div className="w-12" /> {/* Balancing placeholder */}
              </div>

              {/* 2-Column Mockup Content matching the Real Dashboard */}
              <div className="flex w-full bg-[#1A1813] min-h-[540px] text-white font-sans text-left">

                {/* Authentic Real-World Speclane Sidebar */}
                <div className="w-64 bg-[#14120B] border-r border-white/5 flex flex-col justify-between shrink-0 overflow-y-auto z-10 select-none">
                  <div>
                    {/* Sidebar Header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 shrink-0">
                      <Logo className="h-5 w-auto" />
                    </div>

                    {/* Sidebar Groups */}
                    <div className="py-4 px-3 space-y-4">
                      {[
                        {
                          title: "Overview",
                          items: [
                            { id: "projects", label: "Projects", icon: FolderGit2 },
                            { id: "activity", label: "Activity Log", icon: History },
                            { id: "notifications", label: "Notifications", icon: Bell },
                          ]
                        },
                        {
                          title: "Test Planning",
                          items: [
                            { id: "requirements", label: "Requirements", icon: ListChecks },
                            { id: "test-plans", label: "Test Plans", icon: Layers },
                          ]
                        },
                        {
                          title: "Execution & AI",
                          items: [
                            { id: "ai-generator", label: "AI Test Generator", icon: Sparkles },
                            { id: "test-cases", label: "Test Cases", icon: FlaskConical },
                            { id: "runs", label: "Runs", icon: Activity },
                            { id: "defects", label: "Defects", icon: Bug },
                          ]
                        },
                        {
                          title: "Analytics & Reports",
                          items: [
                            { id: "trends", label: "Trends", icon: TrendingUp },
                          ]
                        },
                        {
                          title: "Collaboration",
                          items: [
                            { id: "chat", label: "Team Chat", icon: MessageSquare },
                            { id: "video", label: "Video Call", icon: Video },
                          ]
                        }
                      ].map((group) => (
                        <div key={group.title} className="space-y-1">
                          <div className="text-[9px] font-bold text-white/30 tracking-wider mb-1.5 px-3 uppercase font-mono">
                            {group.title}
                          </div>
                          <div className="space-y-0.5">
                            {group.items.map((n) => {
                              const Icon = n.icon;
                              return (
                                <div
                                  key={n.id}
                                  onClick={() => setActiveMockupTab(n.id)}
                                  className={getNavItemClass(n.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 shrink-0 ${activeMockupTab === n.id ? "text-primary" : "text-white/40"}`} />
                                    <span className="truncate">{n.label}</span>
                                  </div>
                                  {n.id === "chat" && (
                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold">4 Online</span>
                                  )}
                                  {n.id === "test-cases" && (
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${activeMockupTab === 'test-cases' ? 'bg-[#14120B]/20 text-[#14120B]' : 'bg-emerald-500/20 text-emerald-300'}`}>18</span>
                                  )}
                                  {n.id === "projects" && (
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${activeMockupTab === 'projects' ? 'bg-[#14120B]/20 text-[#14120B]' : 'bg-white/10 text-white/60'}`}>7</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar Footer */}
                  <div className="border-t border-white/5 p-3.5 flex items-center gap-2.5 text-xs bg-[#1A1813]/25 mt-6">
                    <img src="https://i.pravatar.cc/100?img=11" className="h-8 w-8 rounded-full border border-white/10 shrink-0" alt="User" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">Mark John</div>
                      <div className="text-[10px] text-white/40 truncate">mark@gmail.com</div>
                    </div>
                  </div>
                </div>

                {/* 3. Main Suite/Task View */}
                <div className="flex-1 flex flex-col h-full bg-[#1A1813] overflow-hidden">
                  {/* Top Bar */}
                  <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#1A1813]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-white/40">Speclane Workspace</span>
                      <span className="text-xs text-white/20">/</span>
                      <span className="text-xs font-bold text-white flex items-center gap-2 capitalize">
                        {activeMockupTab.replace("-", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                        <input type="text" className="h-8 w-full bg-white/[0.05] border border-white/5 rounded-lg pl-9 pr-3 text-xs text-white placeholder-white/30 focus:outline-none" placeholder="Search tests..." />
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-[#14120B] rounded-lg font-bold text-xs h-8 px-3 shadow-sm">
                        <Play className="h-3 w-3 mr-1.5 fill-current" /> Execute {activeMockupTab === 'test-cases' ? 'Suite' : 'Run'}
                      </Button>
                    </div>
                  </div>

                  {/* Sub-navigation Tabs */}
                  <div className="h-11 border-b border-white/5 flex items-center px-6 gap-6 bg-[#14120B]/50 shrink-0 text-xs font-semibold">
                    <span className="text-primary border-b-2 border-primary h-full flex items-center pt-0.5 capitalize">Active View: {activeMockupTab.replace("-", " ")}</span>
                    <span className="text-white/50 hover:text-white cursor-pointer flex items-center gap-1.5">Determinism Score <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-1 py-0 font-mono">99.4%</Badge></span>
                    <span onClick={() => setActiveMockupTab("defects")} className="text-white/50 hover:text-white cursor-pointer">Defect Hub</span>
                    <span onClick={() => setActiveMockupTab("runs")} className="text-white/50 hover:text-white cursor-pointer">Run History</span>
                  </div>

                  {/* Dynamic Interactive Body */}
                  <div className="p-6 overflow-y-auto space-y-6 max-h-[460px]">

                    {/* View 1: Test Cases */}
                    {activeMockupTab === 'test-cases' && (
                      <div className="space-y-6">
                        {/* Group 1: PASSED SCENARIOS */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <ChevronDown className="h-4 w-4 text-white/40" />
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono">✓ PASSED</Badge>
                            <span className="text-white/40 text-xs font-mono">(14)</span>
                          </div>
                          <div className="border border-white/5 rounded-xl bg-white/[0.03] divide-y divide-white/5 overflow-hidden">
                            {[
                              { title: "Should return 401 when JWT token is expired", risk: "Low Risk", time: "12ms", userImg: "11" },
                              { title: "Should successfully refresh session with valid refresh token", risk: "High Priority", time: "45ms", userImg: "33" },
                              { title: "Should throttle repeated failed login attempts (Rate Limit)", risk: "Critical", time: "8ms", userImg: "47" },
                            ].map((test, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-white/[0.02] transition-colors text-xs">
                                <div className="flex items-center gap-3">
                                  <Check className="h-4 w-4 text-emerald-400" />
                                  <span className="text-white font-medium">{test.title}</span>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                  <span className="text-[10px] font-mono text-white/40">{test.time}</span>
                                  <Badge variant="outline" className="text-white/60 font-medium text-[10px] border-white/10">{test.risk}</Badge>
                                  <img src={`https://i.pravatar.cc/100?img=${test.userImg}`} className="h-5 w-5 rounded-full" alt="User" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Group 2: REGRESSION DETECTED */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <ChevronDown className="h-4 w-4 text-white/40" />
                            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[10px] font-mono">⚡ REGRESSION DETECTED</Badge>
                            <span className="text-white/40 text-xs font-mono">(2)</span>
                          </div>
                          <div className="border border-white/5 rounded-xl bg-white/[0.03] divide-y divide-white/5 overflow-hidden">
                            {[
                              { title: "OAuth2 Google Provider callback missing nonce validation", risk: "Blocking", status: "FAILED", userImg: "12" },
                              { title: "Password reset token expiration window exceeds 15 minutes", risk: "Major Risk", status: "FAILED", userImg: "33" },
                            ].map((test, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-white/[0.02] transition-colors text-xs bg-red-500/[0.02]">
                                <div className="flex items-center gap-3">
                                  <div className="h-2 w-2 rounded-full bg-red-500" />
                                  <span className="text-white font-semibold">{test.title}</span>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                  <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-mono">{test.status}</Badge>
                                  <Badge variant="outline" className="text-amber-400/80 font-medium text-[10px] border-amber-400/20">{test.risk}</Badge>
                                  <img src={`https://i.pravatar.cc/100?img=${test.userImg}`} className="h-5 w-5 rounded-full" alt="User" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* View 2: Projects */}
                    {activeMockupTab === 'projects' && (
                      <div className="space-y-4 text-left animate-in fade-in-50 duration-300">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-white/60 uppercase tracking-wider">Active GitHub Repositories (7)</div>
                          <Button size="sm" className="bg-primary text-[#14120B] text-xs font-bold px-3 py-1 rounded-lg">Sync Repository</Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { name: "speclane-auth-service", branch: "main", commit: "a8e93f", tests: 124, coverage: "98.4%", status: "Passing" },
                            { name: "payment-gateway-api", branch: "feature/stripe", commit: "c41b80", tests: 88, coverage: "94.1%", status: "Passing" },
                            { name: "webhook-dispatcher", branch: "main", commit: "f02a11", tests: 45, coverage: "89.0%", status: "1 Failing" },
                            { name: "frontend-dashboard-v2", branch: "staging", commit: "e99b2c", tests: 310, coverage: "99.1%", status: "Passing" },
                            { name: "notification-engine", branch: "main", commit: "d87c2b", tests: 62, coverage: "91.8%", status: "Passing" },
                            { name: "analytics-aggregator", branch: "main", commit: "b91a04", tests: 154, coverage: "95.5%", status: "Passing" },
                            { name: "testforge-agent-cli", branch: "v1.2-patch", commit: "f8e029", tests: 198, coverage: "97.2%", status: "Passing" },
                          ].map((repo, idx) => (
                            <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-3 hover:border-white/20 transition-all cursor-pointer">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white font-mono">{repo.name}</span>
                                <Badge className={repo.status === "Passing" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]" : "bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]"}>{repo.status}</Badge>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-white/50 font-mono">
                                <span className="flex items-center gap-1"><GitPullRequest className="h-3 w-3 text-primary" /> {repo.branch}</span>
                                <span>#{repo.commit}</span>
                              </div>
                              <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px]">
                                <span className="text-white/60 font-semibold">{repo.tests} Automated Tests</span>
                                <span className="text-primary font-bold">{repo.coverage} Coverage</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View 3: Activity Log */}
                    {activeMockupTab === 'activity' && (
                      <div className="space-y-4 text-left animate-in fade-in-50 duration-300">
                        <div className="text-xs font-bold text-white/60 uppercase tracking-wider">Real-Time Autonomous Activity</div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden font-mono">
                          {[
                            { time: "2m ago", text: "AI Test Generator created 14 new test cases for PR #104", type: "Sparkles", user: "11" },
                            { time: "18m ago", text: "Regression run completed: 18 passed, 2 regressions detected", type: "Alert", user: "33" },
                            { time: "1h ago", text: "GitHub repository 'payment-gateway-api' synced successfully", type: "Sync", user: "47" },
                            { time: "3h ago", text: "New defect #89 automatically logged to Jira & assigned to Malik", type: "Bug", user: "12" },
                          ].map((act, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors text-xs">
                              <div className="flex items-center gap-3">
                                <span className="text-white/90">{act.text}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-[10px] text-white/40">{act.time}</span>
                                <img src={`https://i.pravatar.cc/100?img=${act.user}`} className="h-5 w-5 rounded-full border border-white/10" alt="User" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View 4: Notifications */}
                    {activeMockupTab === 'notifications' && (
                      <div className="space-y-4 text-left animate-in fade-in-50 duration-300">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-white/60 uppercase tracking-wider">Unread Alerts & Gateways</div>
                          <Badge className="bg-amber-400/10 text-amber-300 border-amber-400/20 text-[10px]">3 Actionable Alerts</Badge>
                        </div>
                        <div className="space-y-3">
                          {[
                            { title: "AST Scanner Vulnerability Check", desc: "Unhandled Promise Rejection detected in src/services/oauth.ts on line 142.", level: "High Priority", time: "10m" },
                            { title: "CI/CD Gate Triggered", desc: "Test suite execution time exceeded 500ms SLA for Core Authentication.", level: "Warning", time: "42m" },
                            { title: "Determinism Engine Alert", desc: "Flaky test detected in Payment Checkout. Scenario fails 1 in 50 runs due to timezone mock.", level: "Investigation Required", time: "2h" },
                          ].map((n, idx) => (
                            <div key={idx} className="bg-white/[0.03] border border-amber-500/20 rounded-2xl p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white flex items-center gap-2">
                                  <Bell className="h-3.5 w-3.5 text-amber-400" /> {n.title}
                                </span>
                                <span className="text-[10px] font-mono text-white/40">{n.time} ago</span>
                              </div>
                              <p className="text-xs text-white/70 leading-relaxed">{n.desc}</p>
                              <div className="flex justify-end pt-1">
                                <Button size="sm" className="bg-primary text-[#14120B] text-[10px] font-bold px-3 py-1 rounded-md">Resolve Issue</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View 5: Requirements */}
                    {activeMockupTab === 'requirements' && (
                      <div className="space-y-4 text-left animate-in fade-in-50 duration-300">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-white/60 uppercase tracking-wider">AI Requirements Matrix</div>
                          <span className="text-xs font-mono text-primary font-bold">100% Traceability</span>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden">
                          {[
                            { id: "REQ-AUTH-01", name: "OAuth2 Google login with state token validation", tests: "6 Tests", coverage: "100%", status: "Verified" },
                            { id: "REQ-PAY-04", name: "Stripe Webhook signature replay attack mitigation", tests: "4 Tests", coverage: "100%", status: "Verified" },
                            { id: "REQ-SEC-12", name: "JWT Bearer tokens must expire exactly within 15 minutes", tests: "3 Tests", coverage: "100%", status: "Verified" },
                            { id: "REQ-RATE-02", name: "IP-based token bucket rate limiting (100 req/min)", tests: "5 Tests", coverage: "96%", status: "Verified" },
                          ].map((req, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 hover:bg-white/[0.02] text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono">{req.id}</Badge>
                                  <span className="text-white font-semibold">{req.name}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 shrink-0 font-mono text-[10px]">
                                <span className="text-white/60">{req.tests}</span>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{req.coverage}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View 6: Test Plans */}
                    {activeMockupTab === 'test-plans' && (
                      <div className="space-y-4 text-left animate-in fade-in-50 duration-300">
                        <div className="text-xs font-bold text-white/60 uppercase tracking-wider">Active Test Execution Plans</div>
                        <div className="space-y-3">
                          {[
                            { name: "Production Release 4.2 Smoke Plan", scenarios: 45, passed: 45, progress: "100%", time: "34s", tag: "Release" },
                            { name: "Nightly Security Regression Checksuite", scenarios: 120, passed: 118, progress: "98%", time: "1m 12s", tag: "Nightly" },
                            { name: "GDPR & Data Erasure API Verification", scenarios: 18, passed: 18, progress: "100%", time: "14s", tag: "Compliance" },
                          ].map((plan, idx) => (
                            <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white">{plan.name}</span>
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">{plan.tag}</Badge>
                              </div>
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: plan.progress }} />
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                                <span>{plan.passed} / {plan.scenarios} Scenarios Executed Successfully</span>
                                <span>Duration: {plan.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View 7: AI Generator */}
                    {activeMockupTab === 'ai-generator' && (
                      <div className="space-y-6 text-left animate-in fade-in-50 duration-300">
                        <div className="bg-gradient-to-r from-primary/20 via-transparent to-transparent border border-primary/30 rounded-2xl p-6 relative overflow-hidden">
                          <div className="relative z-10 space-y-3">
                            <div className="inline-flex items-center gap-2 bg-primary text-[#14120B] px-2.5 py-1 rounded-full text-[10px] font-black">
                              <Sparkles className="h-3 w-3" /> AUTONOMOUS GENERATOR V2
                            </div>
                            <h3 className="text-lg font-black text-white">Generate High-Fidelity Test Cases Instantly</h3>
                            <p className="text-xs text-white/70">Our AI analyzes your AST, GitHub commits, and OpenAPI specs to write foolproof Cypress/Playwright tests in seconds.</p>
                            <div className="pt-2 flex items-center gap-3">
                              <input type="text" readOnly value="Test handling of expired Stripe refresh tokens..." className="bg-[#14120B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white w-full font-mono outline-none" />
                              <Button size="sm" className="bg-primary hover:bg-primary/90 text-[#14120B] font-bold px-5 py-2.5 rounded-xl text-xs shrink-0 shadow-lg">Generate Tests</Button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2">
                            <span className="text-xs font-bold text-white flex items-center gap-2 font-mono">⚡ 100% Determinism</span>
                            <p className="text-[11px] text-white/60">Self-healing locators adapt automatically when frontend DOM IDs change.</p>
                          </div>
                          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2">
                            <span className="text-xs font-bold text-white flex items-center gap-2 font-mono">🛡️ AST Edge-Case Analysis</span>
                            <p className="text-[11px] text-white/60">Finds hidden null pointers and race conditions before production deployment.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* View 8: Run Comparison */}
                    {activeMockupTab === 'runs' && (
                      <div className="space-y-4 text-left animate-in fade-in-50 duration-300">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-white/60 uppercase tracking-wider">Run Comparison (Master vs Feature/Auth)</div>
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Comparing 2 Active Runs</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                              <span className="text-xs font-bold text-white">Run #401 (Master Branch)</span>
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">100% Passed</Badge>
                            </div>
                            <div className="space-y-2 text-xs font-mono">
                              <div className="flex justify-between text-white/70"><span>Total Scenarios:</span> <span>18</span></div>
                              <div className="flex justify-between text-white/70"><span>Execution Time:</span> <span>412ms</span></div>
                              <div className="flex justify-between text-white/70"><span>Flakiness Index:</span> <span>0.00%</span></div>
                            </div>
                          </div>
                          <div className="bg-white/[0.03] border border-primary/30 rounded-2xl p-5 space-y-4 shadow-[0_0_30px_-5px_rgba(237,236,237,0.15)]">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                              <span className="text-xs font-bold text-white">Run #405 (Feature/Auth)</span>
                              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">2 Regressions</Badge>
                            </div>
                            <div className="space-y-2 text-xs font-mono">
                              <div className="flex justify-between text-white/70"><span>Total Scenarios:</span> <span>18</span></div>
                              <div className="flex justify-between text-amber-400"><span>Execution Time:</span> <span>680ms (+65%)</span></div>
                              <div className="flex justify-between text-red-400"><span>Flakiness Index:</span> <span>11.1%</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* View 9: Defect Hub */}
                    {activeMockupTab === 'defects' && (
                      <div className="space-y-4 text-left animate-in fade-in-50 duration-300">
                        <div className="text-xs font-bold text-white/60 uppercase tracking-wider">Autonomous Defect Log</div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden">
                          {[
                            { bugId: "BUG-802", title: "OAuth Token leak on network reconnect retry loop", sev: "CRITICAL", assignee: "11", status: "Open" },
                            { bugId: "BUG-794", title: "Cart total calculation discrepancy during currency conversion", sev: "HIGH", assignee: "33", status: "In Progress" },
                            { bugId: "BUG-751", title: "Websocket disconnect event does not trigger session cleanup", sev: "MEDIUM", assignee: "47", status: "Resolved" },
                          ].map((b, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 hover:bg-white/[0.02] text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge className={b.sev === "CRITICAL" ? "bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-mono" : "bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-mono"}>{b.sev}</Badge>
                                  <span className="text-white font-semibold">{b.title}</span>
                                </div>
                                <div className="text-[10px] text-white/40 font-mono pl-1">Ticket ID: {b.bugId}</div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <Badge variant="outline" className="text-white/70 text-[10px] border-white/10">{b.status}</Badge>
                                <img src={`https://i.pravatar.cc/100?img=${b.assignee}`} className="h-6 w-6 rounded-full border border-white/10" alt="Assignee" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View 10: Trends & Reports */}
                    {activeMockupTab === 'trends' && (
                      <div className="space-y-6 text-left animate-in fade-in-50 duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-mono">Test Suite Reliability</div>
                            <div className="text-2xl font-black text-white font-mono">99.84%</div>
                            <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">↑ 2.4% vs last month</div>
                          </div>
                          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-mono">Autonomous Execution Speed</div>
                            <div className="text-2xl font-black text-primary font-mono">14.2s</div>
                            <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">↓ 45% faster execution</div>
                          </div>
                          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-mono">Engineering Hours Saved</div>
                            <div className="text-2xl font-black text-white font-mono">1,420 hrs</div>
                            <div className="text-[10px] text-primary font-mono font-bold flex items-center gap-1">⚡ Fully automated SQA</div>
                          </div>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-center space-y-2">
                          <PieChart className="h-10 w-10 text-primary mx-auto opacity-80" />
                          <div className="text-sm font-bold text-white">Advanced Metric Analytics & Charts Engine</div>
                          <p className="text-xs text-white/60 max-w-md mx-auto">Speclane continuously logs execution trends, flaky tests, and regression recovery times across all release gates.</p>
                        </div>
                      </div>
                    )}

                    {/* View 11: Team Chat */}
                    {activeMockupTab === 'chat' && (
                      <div className="space-y-4 text-left animate-in fade-in-50 duration-300">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <div className="text-xs font-bold text-white flex items-center gap-2 font-mono">
                            <MessageSquare className="h-4 w-4 text-primary" /> Active Squad Channel (#sqa-core-auth)
                          </div>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">4 Online</span>
                        </div>
                        <div className="space-y-4 py-2">
                          <div className="flex gap-3">
                            <img src="https://i.pravatar.cc/100?img=11" className="h-7 w-7 rounded-full shrink-0" alt="Malik" />
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 space-y-1 text-xs">
                              <div className="flex items-center gap-2 font-bold text-white"><span className="text-primary">Malik Ahmad</span> <span className="text-[10px] text-white/40 font-mono font-normal">10:14 AM</span></div>
                              <p className="text-white/80 leading-relaxed">Hey team, the AI Test Generator caught the JWT expiration window issue before our CI/CD gate ran. I've resolved it in PR #412.</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <img src="https://i.pravatar.cc/100?img=33" className="h-7 w-7 rounded-full shrink-0" alt="Sarah" />
                            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 space-y-1 text-xs">
                              <div className="flex items-center gap-2 font-bold text-white"><span className="text-primary">Sarah Connor (QA Lead)</span> <span className="text-[10px] text-white/40 font-mono font-normal">10:16 AM</span></div>
                              <p className="text-white/90 leading-relaxed">Amazing! Verified the fix on my side. Determinism score for Core Auth is back up to 99.8%.</p>
                            </div>
                          </div>
                        </div>
                        <div className="pt-2">
                          <div className="bg-[#14120B] border border-white/10 rounded-xl px-4 py-3 text-xs text-white/40 font-mono flex items-center justify-between">
                            <span>Type a message to the squad or ask @SpeclaneAI...</span>
                            <Button size="sm" className="bg-primary text-[#14120B] font-bold text-[10px] h-7 px-3 rounded-lg">Send</Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* View 12: Video Call */}
                    {activeMockupTab === 'video' && (
                      <div className="space-y-4 text-left animate-in fade-in-50 duration-300">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <div className="text-xs font-bold text-white flex items-center gap-2 font-mono">
                            <Video className="h-4 w-4 text-primary" /> Live Immersive Video Debugging Room
                          </div>
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-mono">● RECORDING SESSION</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-[#14120B] border border-primary/30 rounded-2xl overflow-hidden relative group aspect-video flex items-center justify-center shadow-[0_0_20px_-5px_rgba(237,236,237,0.2)]">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-70" alt="Stream" />
                            <div className="absolute bottom-3 left-3 bg-[#14120B]/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[10px] text-white font-bold flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Malik Ahmad (Screen Sharing AST)
                            </div>
                          </div>
                          <div className="bg-[#14120B] border border-white/10 rounded-2xl overflow-hidden relative group aspect-video flex items-center justify-center">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-70" alt="Stream" />
                            <div className="absolute bottom-3 left-3 bg-[#14120B]/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[10px] text-white font-bold flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Alex Rivera (DevOps Lead)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 text-xs font-bold px-4 py-2 rounded-xl">End Call</Button>
                          <Button size="sm" className="bg-primary text-[#14120B] text-xs font-bold px-4 py-2 rounded-xl">Share Screen & Locators</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ClickUp-style Bottom Fog Fade Effect */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#14120B] via-[#14120B]/90 to-transparent z-20 pointer-events-none" />
    </section>
  );
}

// FIX 1: LogoCloud — was returning <FramerReveal> but closing with </section>
function LogoCloud() {
  const names = ["Acme", "Globex", "Initech", "Umbrella", "Stark", "Wayne", "Cyberdyne", "Hooli", "Siedel", "Pied Piper"];
  return (
    <FramerReveal direction="up" duration={1} className="py-24 relative z-10 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs tracking-[0.2em] text-slate-400 dark:text-white/30 uppercase mb-12 font-medium">Trusted by QA teams worldwide</p>

        <div className="relative flex overflow-hidden mask-edges" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)' }}>
          <div className="flex animate-marquee whitespace-nowrap gap-16 py-4 items-center">
            {[...names, ...names].map((n, i) => (
              <div key={i} className="text-3xl md:text-5xl font-black tracking-tighter text-slate-200 dark:text-white uppercase transition-all duration-500 cursor-default px-4">
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>
    </FramerReveal>
  );
}

// FIX 2: DashboardMockupShowcase — Replaces boilerplate code diff with high-fidelity customer dashboard mockup
function CodeDiff() {
  return (
    <FramerReveal direction="none" duration={1} className="py-24 bg-background relative overflow-hidden">

      {/* Increased dashboard size: outer container set to max-w-7xl */}
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3 rounded-full border-primary/20 bg-primary/5 text-primary font-bold px-4 py-1.5 text-xs">
            High-Fidelity Command Center
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-white/70 bg-clip-text text-transparent">
            Your Complete SQA Workspace
          </h2>
          <p className="text-slate-500 dark:text-white/60 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Experience the professional-grade dashboard designed for modern engineering teams. Connect GitHub repositories, analyze deep AST requirement trees, and execute auto-healing test suites in real-time.
          </p>
        </div>

        <FramerReveal direction="up" distance={30} duration={1}>
          {/* Outer Wrapper with back.png fully visible in background. Subtle border radius (rounded-2xl) */}
          <div
            className="relative rounded-2xl p-6 sm:p-10 md:p-16 border border-white/20 overflow-hidden group my-6 bg-cover bg-center bg-no-repeat shadow-none"
            style={{ backgroundImage: "url('/background/back.png')" }}
          >
            {/* Subtle semi-transparent dark overlay so back.png is vibrant and clearly seen from all sides */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            {/* Increased dashboard size: inner card container set to max-w-5xl md:max-w-6xl. Removed border radius (rounded-none) */}
            <div className="relative z-10 max-w-5xl md:max-w-6xl mx-auto rounded-none overflow-hidden bg-[#14120B]/95 border border-white/20 backdrop-blur-2xl font-sans shadow-none">
              {/* macOS Window Controls */}
              <div className="h-9 bg-[#14120B] border-b border-white/10 px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-black/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-black/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-black/20" />
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-0.5 text-[10px] font-mono text-white/70 shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> speclane-studio.app/workspace/dashboard
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-white/40 text-[10px] font-mono font-semibold">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" /> Speclane OS v2.5
                </div>
              </div>

              {/* Layout within window: Speclane Sidebar (Left) + Scrolling Command Center (Right) */}
              <div className="flex bg-[#14120B]">
                {/* Comprehensive Speclane Sidebar matching all 24 real dashboard options (Scrollable) */}
                <div className="w-52 shrink-0 hidden md:flex flex-col justify-between bg-[#14120B] border-r border-white/10 p-3 select-none overflow-y-auto max-h-[500px] custom-scrollbar">
                  <div className="space-y-4">
                    <div className="px-2 pt-1 shrink-0">
                      <Logo className="scale-80 origin-left" />
                    </div>

                    <div className="space-y-4 text-[11px] font-semibold">
                      {/* Overview */}
                      <div>
                        <div className="text-[9px] font-bold tracking-wider text-white/40 uppercase px-2 mb-1.5">Overview</div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Dashboard</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <FolderGit2 className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Projects</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <History className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Activity Log</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <Bell className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Notifications</span>
                          </div>
                        </div>
                      </div>

                      {/* Test Planning */}
                      <div>
                        <div className="text-[9px] font-bold tracking-wider text-white/40 uppercase px-2 mb-1.5">Test Planning</div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <ListChecks className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Requirements</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <Layers className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Test Plans</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <Milestone className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Releases</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <Server className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Environments</span>
                          </div>
                        </div>
                      </div>

                      {/* Execution & AI */}
                      <div>
                        <div className="text-[9px] font-bold tracking-wider text-white/40 uppercase px-2 mb-1.5">Execution & AI</div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <Sparkles className="w-3.5 h-3.5 shrink-0 text-primary" /> <span className="truncate text-primary">AI Test Generator</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <FlaskConical className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Test Cases</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <Activity className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Runs</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <GitCompare className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Run Comparison</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <Bug className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Defects</span>
                          </div>
                        </div>
                      </div>

                      {/* Analytics & Reports */}
                      <div>
                        <div className="text-[9px] font-bold tracking-wider text-white/40 uppercase px-2 mb-1.5">Analytics & Reports</div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <TrendingUp className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Trends</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <ListChecks className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Coverage</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <FileBarChart className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Reports</span>
                          </div>
                        </div>
                      </div>

                      {/* Collaboration */}
                      <div>
                        <div className="text-[9px] font-bold tracking-wider text-white/40 uppercase px-2 mb-1.5">Collaboration</div>
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <MessageSquare className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Team Chat</span>
                            </div>
                            <span className="px-1.5 py-0.2 font-mono text-[9px] font-bold bg-primary text-[#14120B] rounded-full shrink-0">3</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <Video className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Video Call</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <UsersRound className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Team Access</span>
                          </div>
                        </div>
                      </div>

                      {/* Workspace & Tools */}
                      <div>
                        <div className="text-[9px] font-bold tracking-wider text-white/40 uppercase px-2 mb-1.5">Workspace & Tools</div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <DownloadCloud className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Data Export</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <PlugZap className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Integrations</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <CreditCard className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Billing</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <Settings className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Settings</span>
                          </div>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <LifeBuoy className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Help & Docs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Footer User Card */}
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 mt-6 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] grid place-items-center shrink-0">AC</div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white truncate">Alex Chen</div>
                      <div className="text-[9px] text-white/40 truncate">QA Lead · Speclane</div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area (Scrolling Dashboard with tighter paddings & font sizes) */}
                <div className="flex-1 p-4 md:p-6 text-left space-y-6 bg-[#14120B] overflow-y-auto max-h-[500px] custom-scrollbar">
                  {/* Header within dashboard */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 font-mono">
                          WORKSPACE OVERVIEW
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400">
                          ● Live Sync Active
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight font-sans">Command Center</h3>
                      <p className="text-[11px] text-white/50 font-sans">Overview of your automated QA infrastructure.</p>
                    </div>
                    <div className="flex items-center gap-2 font-sans font-semibold">
                      <div className="bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer hover:bg-white/20 transition-all">
                        <CreditCard className="w-3 h-3" /> Manage Subscription
                      </div>
                      <div className="bg-primary text-[#14120B] px-4 py-1.5 rounded-lg text-[11px] shadow-none flex items-center gap-1.5 font-bold cursor-pointer hover:opacity-90 transition-all">
                        <Sparkles className="w-3 h-3" /> Generate test cases
                      </div>
                    </div>
                  </div>

                  {/* 4 Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/[0.03] border border-white/10 p-4 rounded-xl relative overflow-hidden group hover:border-primary/40 transition-all font-sans">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white grid place-items-center group-hover:text-primary transition-colors">
                          <FolderGit2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-white">4</div>
                      <div className="text-[11px] text-white/50 font-medium mt-0.5">Total Projects</div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 p-4 rounded-xl relative overflow-hidden group hover:border-primary/40 transition-all font-sans">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white grid place-items-center group-hover:text-primary transition-colors">
                          <FlaskConical className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-white">124</div>
                      <div className="text-[11px] text-white/50 font-medium mt-0.5">Test Cases</div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 p-4 rounded-xl relative overflow-hidden group hover:border-red-400/40 transition-all font-sans">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white grid place-items-center group-hover:text-red-400 transition-colors">
                          <Bug className="w-3.5 h-3.5 text-red-400" />
                        </div>
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-white">3</div>
                      <div className="text-[11px] text-white/50 font-medium mt-0.5">Open Defects</div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 p-4 rounded-xl relative overflow-hidden group hover:border-primary/40 transition-all font-sans">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white grid place-items-center group-hover:text-primary transition-colors">
                          <Target className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-white">96%</div>
                      <div className="text-[11px] text-white/50 font-medium mt-0.5">Avg. Coverage</div>
                    </div>
                  </div>

                  {/* Generation Velocity & Status Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                    <div className="md:col-span-2 bg-white/[0.03] border border-white/10 p-5 rounded-xl space-y-3 font-sans">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div>
                          <h4 className="text-base font-bold text-white font-sans">Generation Velocity</h4>
                          <p className="text-[10px] text-white/50 font-sans">Test cases generated over time (Last 7 Days)</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary border border-primary/20 font-mono text-[9px] py-0.5">Active Trend</Badge>
                      </div>
                      {/* Simulated elegant chart visual */}
                      <div className="h-32 flex items-end gap-2.5 pt-4 px-1">
                        {[24, 45, 32, 68, 85, 110, 124].map((val, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            <div className="w-full bg-gradient-to-t from-primary/10 via-primary/40 to-primary rounded-t transition-all hover:opacity-80" style={{ height: `${(val / 124) * 100}%` }} />
                            <span className="text-[9px] font-mono text-white/40">{"MTWTFSS"[i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 p-5 rounded-xl flex flex-col justify-between space-y-3 font-sans">
                      <div>
                        <h4 className="text-base font-bold text-white font-sans">Test Status</h4>
                        <p className="text-[10px] text-white/50 font-sans">Real-time execution stats</p>
                      </div>
                      <div className="space-y-2.5 pt-1 font-mono text-[11px] font-bold">
                        <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                          <span className="flex items-center gap-2 font-sans"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Passed</span>
                          <span className="font-mono">118 (95%)</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                          <span className="flex items-center gap-2 font-sans"><span className="w-2 h-2 rounded-full bg-red-400" /> Failed</span>
                          <span className="font-mono">4 (3%)</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                          <span className="flex items-center gap-2 font-sans"><span className="w-2 h-2 rounded-full bg-indigo-400" /> Pending</span>
                          <span className="font-mono">2 (2%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Active Projects & Recent Defects */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                    <div className="bg-white/[0.03] border border-white/10 p-5 rounded-xl space-y-3 font-sans">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 font-sans font-bold">
                        <h4 className="text-sm text-white">Active Projects</h4>
                        <span className="text-[11px] text-primary font-semibold cursor-pointer">View all</span>
                      </div>
                      <div className="space-y-2 text-[11px] font-sans font-medium">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all font-sans">
                          <div className="flex items-center gap-3 font-sans min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0"><FolderGit2 className="w-3.5 h-3.5" /></div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-[11px] font-sans truncate">speclane-auth-service</div>
                              <div className="text-[10px] text-white/40 font-mono truncate">github.com/speclane/auth</div>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono shrink-0 ml-2">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all font-sans">
                          <div className="flex items-center gap-3 font-sans min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0"><FolderGit2 className="w-3.5 h-3.5" /></div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-[11px] font-sans truncate">payment-gateway-api</div>
                              <div className="text-[10px] text-white/40 font-mono truncate">github.com/speclane/payment</div>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono shrink-0 ml-2">Active</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 p-5 rounded-xl space-y-3 font-sans">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 font-sans font-bold">
                        <h4 className="text-sm text-white">Recent Defects</h4>
                        <span className="text-[11px] text-primary font-semibold cursor-pointer">View all</span>
                      </div>
                      <div className="space-y-2 text-[11px] font-sans">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10 font-sans font-medium min-w-0">
                          <div className="flex items-center gap-3 font-sans min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 grid place-items-center shrink-0">
                              <Bug className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-[11px] font-sans truncate">OAuth Token leak on reconnect</div>
                              <div className="text-[10px] text-white/50 font-mono truncate">Open · Critical</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/10 font-sans font-medium min-w-0">
                          <div className="flex items-center gap-3 font-sans min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 grid place-items-center shrink-0">
                              <Bug className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-[11px] font-sans truncate">Cart total calculation discrepancy</div>
                              <div className="text-[10px] text-white/50 font-mono truncate">Open · High</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FramerReveal>
      </div>
    </FramerReveal>
  );
}

// FIX 3: BentoGrid — missing return(), multiple unclosed card divs, missing </FramerStaggerItem> closing tags
function BentoGrid() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">

      <FramerReveal direction="up" distance={30} className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
          Engineered for Quality. <br className="hidden md:block" /> Designed for Speed.
        </h2>
      </FramerReveal>

      <FramerReveal direction="up" staggerChildren={0.1} className="container mx-auto px-4 max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Large (spans 2 cols on lg) */}
        <FramerStaggerItem className="lg:col-span-2">
          <div ref={useCardTilt<HTMLDivElement>({ maxRotation: 3 })} className="rounded-3xl border border-white/10 hover:border-primary bg-[#14120B] p-8 md:p-12 shadow-card dark:shadow-2xl hover:-translate-y-2 relative overflow-hidden group transition-all duration-500">
            <div className="relative z-10">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-white">AI Test Generation</h3>
              <p className="text-white/50 mb-8 max-w-md text-sm md:text-base leading-relaxed">Instantly transform raw code and vague requirements into structured, edge-case-covering test suites.</p>

              <div className="rounded-xl border border-white/10 bg-[#1A1813] p-4 flex items-center gap-4 h-[220px] shadow-inner overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

                {/* Code Editor Part */}
                <div className="flex-1 bg-[#14120B] rounded-lg border border-white/5 p-5 text-[11px] font-mono h-full flex flex-col justify-center relative overflow-hidden group-hover:border-primary/20 transition-colors">
                  <div className="text-primary font-bold mb-1">
                    <TypewriterText text="def validate_user(data):" speed={60} pause={5000} />
                  </div>
                  <div className="pl-4 text-white/60">
                    <TypewriterText text="if not data.get('email'):" speed={50} pause={6000} />
                  </div>
                  <div className="pl-8 text-white/40">
                    <TypewriterText text="return Error('Missing email')" speed={40} pause={7000} />
                  </div>
                  <div className="pl-4 text-white/60 mt-1">
                    <TypewriterText text="return Success(data)" speed={50} pause={8000} />
                  </div>
                  <div className="absolute top-2 right-3 text-[9px] text-white/10 uppercase tracking-widest font-bold">Python 3.12</div>
                </div>

                <ArrowRight className="h-4 w-4 text-white/20 shrink-0 animate-pulse" />

                {/* Generated Tests Part */}
                <div className="flex-1 space-y-2 py-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-[10px] text-white/70 flex items-center gap-2 animate-in fade-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 200}ms` }}>
                      <div className={`h-1.5 w-1.5 rounded-full ${i === 2 ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      {i === 1 ? 'Valid login succeeds' : i === 2 ? 'Missing email fails' : 'Invalid pass fails'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FramerStaggerItem>

        {/* Card 2: Medium */}
        <FramerStaggerItem>
          <div ref={useCardTilt<HTMLDivElement>()} className="rounded-3xl border border-white/10 hover:border-primary bg-[#14120B] p-8 md:p-10 shadow-card dark:shadow-2xl hover:-translate-y-2 relative overflow-hidden group transition-all duration-500">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Traceability</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-8">Map every single test back to its core requirement.</p>

            <div className="relative h-48 flex items-center justify-center overflow-hidden">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M60 40C130 40 170 110 240 110" stroke="white" strokeWidth="1" strokeDasharray="3 3" opacity="0.05" />
                <path d="M60 75C130 75 170 75 240 75" stroke="white" strokeWidth="1" strokeDasharray="3 3" opacity="0.05" />
                <path d="M60 110C130 110 170 40 240 40" stroke="white" strokeWidth="1" strokeDasharray="3 3" opacity="0.05" />
                <path d="M60 75C130 75 170 75 240 75" stroke="url(#flow-gradient)" strokeWidth="2" strokeDasharray="6 6" className="animate-marquee" style={{ animationDuration: '4s' }} />
                <circle r="2.5" fill="#EDECED" className="filter blur-[1px]">
                  <animateMotion dur="4s" repeatCount="indefinite" path="M60 75C130 75 170 75 240 75" />
                  <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" />
                </circle>
                <defs>
                  <linearGradient id="flow-gradient" x1="60" y1="75" x2="240" y2="75" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#EDECED" />
                    <stop offset="0.5" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#EDECED" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between py-6 z-10">
                <div className="bg-[#14120B] border border-white/10 rounded-lg p-2 text-[8px] text-white/40 flex items-center gap-1.5 shadow-2xl backdrop-blur-sm">
                  <div className="h-1 w-1 rounded-full bg-white/20" /> R-102
                </div>
                <div className="bg-[#14120B] border border-primary/40 rounded-lg p-2 text-[9px] text-white/90 flex items-center gap-1.5 shadow-sm backdrop-blur-sm scale-110">
                  <div className="h-1 w-1 rounded-full bg-primary animate-pulse" /> R-105
                </div>
                <div className="bg-[#14120B] border border-white/10 rounded-lg p-2 text-[8px] text-white/40 flex items-center gap-1.5 shadow-2xl backdrop-blur-sm">
                  <div className="h-1 w-1 rounded-full bg-white/20" /> R-110
                </div>
              </div>

              <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-between py-6 z-10">
                <div className="bg-[#14120B] border border-white/10 rounded-lg p-2 text-[8px] text-white/40 flex items-center gap-1.5 shadow-2xl backdrop-blur-sm">
                  T-401 <div className="h-1 w-1 rounded-full bg-white/20" />
                </div>
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 text-[9px] text-primary flex items-center gap-1.5 shadow-2xl backdrop-blur-sm scale-105">
                  T-405 <div className="h-1 w-1 rounded-full bg-primary" />
                </div>
                <div className="bg-[#14120B] border border-white/10 rounded-lg p-2 text-[8px] text-white/40 flex items-center gap-1.5 shadow-2xl backdrop-blur-sm">
                  T-408 <div className="h-1 w-1 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </div>
        </FramerStaggerItem>

        {/* Card 3: Medium */}
        <FramerStaggerItem>
          <div ref={useCardTilt<HTMLDivElement>()} className="rounded-3xl border border-white/10 hover:border-primary bg-[#14120B] p-8 md:p-10 shadow-card dark:shadow-2xl hover:-translate-y-2 relative overflow-hidden group transition-all duration-500">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80">
              <GitPullRequest className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">GitHub Sync</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-8">Tests execute automatically on every pull request.</p>

            <div className="bg-[#1A1813] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3 text-xs text-white/60 mb-3 border-b border-white/5 pb-3">
                <Github className="h-4 w-4" /> <span>PR #402: Add checkout</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/40">Speclane Check</span>
                <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Passed</span>
              </div>
            </div>
          </div>
        </FramerStaggerItem>

        {/* Card 4: Full Width Row */}
        <FramerStaggerItem className="lg:col-span-3">
          <div ref={useCardTilt<HTMLDivElement>({ maxRotation: 2 })} className="rounded-3xl border border-white/10 hover:border-primary bg-[#14120B] p-8 shadow-card dark:shadow-2xl hover:-translate-y-2 relative overflow-hidden group flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-500">
            <div className="relative z-10 md:w-1/2">
              <h3 className="text-2xl font-semibold mb-2 text-white">Actionable Reports</h3>
              <p className="text-white/50 text-sm md:text-base leading-relaxed">Share beautiful PDF and CSV reports with stakeholders, auditors, and engineering leaders instantly.</p>
            </div>
            <div className="relative z-10 md:w-1/3 flex justify-end">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full flex flex-col sm:flex-row items-center justify-center gap-3 text-white font-bold text-xs backdrop-blur">
                <div className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all cursor-pointer border border-white/20 shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center">
                  <FileText className="h-4 w-4 text-primary shrink-0" /> Download PDF
                </div>
                <div className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all cursor-pointer border border-white/20 shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center">
                  <FileSpreadsheet className="h-4 w-4 text-primary shrink-0" /> Export CSV
                </div>
              </div>
            </div>
          </div>
        </FramerStaggerItem>
      </FramerReveal>
    </section>
  );
}

// FIX 4: KeyboardSpeed — removed useReveal (not imported), replaced with FramerReveal
function KeyboardSpeed() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl text-center relative z-10">
        <FramerReveal direction="up" distance={30} className="max-w-3xl mx-auto mb-20">
          <Badge variant="outline" className="mb-6 rounded-full border-primary/20 bg-primary/20 text-primary font-semibold px-3 py-1">
            <Command className="h-3 w-3 mr-2 inline" /> Built for speed
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
            Keyboard-first workflow
          </h2>
          <p className="text-white/50 text-lg md:text-xl font-light">
            Navigate your entire SQA workspace without touching the mouse. Instantly transition from raw code to production-ready test suites.
          </p>
        </FramerReveal>

        <FramerReveal direction="none" staggerChildren={0.1} className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Command Menu Mockup (Left Side) */}
          <FramerStaggerItem className="lg:col-span-3 space-y-6">
            <div className="bg-[#14120B] border border-white/10 rounded-2xl shadow-[0_0_100px_-20px_rgba(237,236,237,0.15)] overflow-hidden text-left relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="p-5 border-b border-white/5 flex items-center gap-3">
                  <Search className="h-5 w-5 text-primary" />
                  <div className="bg-transparent border-none outline-none text-white text-lg w-full font-medium">
                    <TypewriterText text="Run checkout regression suite" speed={80} pause={5000} />
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <div className="px-3 py-2 text-[10px] text-white/30 font-bold tracking-widest uppercase mt-2">Suggested Actions</div>
                  <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-primary text-[#14120B] font-semibold cursor-pointer border border-primary/30">
                    <div className="flex items-center gap-3"><Play className="h-4 w-4" /> Run Checkout Regression</div>
                    <div className="text-[10px] bg-black/60 px-2 py-1 rounded text-white/70 border border-white/20 font-mono">↵ Enter</div>
                  </div>
                  <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 text-white/60 transition-colors cursor-pointer group/item">
                    <div className="flex items-center gap-3"><FileText className="h-4 w-4 group-hover/item:text-white transition-colors" /> Generate New Test Suite</div>
                    <div className="text-[10px] bg-black/40 px-2 py-1 rounded text-white/30 font-mono">G N</div>
                  </div>
                  <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 text-white/60 transition-colors cursor-pointer group/item">
                    <div className="flex items-center gap-3"><Github className="h-4 w-4 group-hover/item:text-white transition-colors" /> Sync GitHub Requirements</div>
                    <div className="text-[10px] bg-black/40 px-2 py-1 rounded text-white/30 font-mono">G S</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-left">
                <div className="text-white/20 text-[10px] uppercase tracking-widest font-bold mb-2">Power User Tip</div>
                <p className="text-white/60 text-xs leading-relaxed">Press <kbd className="bg-white/10 px-1 rounded text-white/80">⌘ K</kbd> anywhere to open the command menu and jump to any test file or requirement instantly.</p>
              </div>
              <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-left">
                <div className="text-white/20 text-[10px] uppercase tracking-widest font-bold mb-2">Integration</div>
                <p className="text-white/60 text-xs leading-relaxed">Full support for VS Code and IntelliJ shortcuts. No learning curve for your engineering team.</p>
              </div>
            </div>
          </FramerStaggerItem>

          {/* SQA Workflow (Right Side) */}
          <FramerStaggerItem className="lg:col-span-2 space-y-8 relative">
            <div className="absolute left-[23px] top-8 bottom-8 w-[2px] bg-white/5 z-0 hidden lg:block overflow-hidden rounded-full">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-primary to-transparent animate-laser shadow-[0_0_15px_rgba(237,236,237,0.8)]" />
            </div>

            {[
              { step: "01", title: "Connect Source", desc: "Link your GitHub or GitLab repo. We analyze the code structure automatically.", icon: <Github className="h-5 w-5" /> },
              { step: "02", title: "AI Analysis", desc: "Speclane scans your PRs and requirements to find what needs testing.", icon: <Sparkles className="h-5 w-5" /> },
              { step: "03", title: "Instant Generation", desc: "Generate complete Python/JS test cases with 100% coverage in seconds.", icon: <Zap className="h-5 w-5" /> },
              { step: "04", title: "Sync & Export", desc: "Push to TestRail or export high-quality PDF/CSV reports for stakeholders.", icon: <Share2 className="h-5 w-5" /> },
            ].map((item, idx) => (
              <div key={idx} className={`flex gap-6 relative z-10 transition-all duration-700 ${activeStep === idx ? 'opacity-100 scale-105' : 'opacity-40 scale-100'}`}>
                <div className={`h-12 w-12 rounded-2xl bg-[#14120B] border flex items-center justify-center shrink-0 transition-all duration-500 shadow-sm ${activeStep === idx ? 'border-primary' : 'border-white/10'}`}>
                  <div className={`transition-colors duration-500 ${activeStep === idx ? 'text-primary' : 'text-white/20'}`}>{item.icon}</div>
                </div>
                <div className="text-left py-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`font-mono text-xs font-bold transition-colors duration-500 ${activeStep === idx ? 'text-primary' : 'text-white/10'}`}>{item.step}</span>
                    <h4 className={`font-semibold transition-colors duration-500 ${activeStep === idx ? 'text-white' : 'text-white/30'}`}>{item.title}</h4>
                  </div>
                  <p className={`text-sm leading-relaxed transition-colors duration-500 ${activeStep === idx ? 'text-white/60' : 'text-white/10'}`}>{item.desc}</p>
                </div>
              </div>
            ))}
          </FramerStaggerItem>
        </FramerReveal>
      </div>
    </section>
  );
}

function LaserDivider() {
  return (
    <div className="h-[1px] w-full bg-white/5 relative overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-transparent via-primary to-transparent animate-laser-h shadow-[0_0_30px_10px_rgba(237,236,237,0.4)]" />
    </div>
  );
}

function Integrations() {
  const tools = [
    { name: 'GitHub', slug: 'github', color: '#ffffff', forceWhite: true },
    { name: 'GitLab', slug: 'gitlab', color: '#FC6D26' },
    { name: 'Jira', slug: 'jira', color: '#0052CC' },
    { name: 'Linear', slug: 'linear', color: '#5E6AD2' },
    { name: 'Slack', slug: 'slack', color: '#4A154B', url: 'https://www.vectorlogo.zone/logos/slack/slack-icon.svg' },
    { name: 'TestRail', slug: 'testrail', color: '#009DA6', url: 'https://cdn.simpleicons.org/testrail' },
    { name: 'Azure DevOps', slug: 'azuredevops', color: '#0078D7', url: 'https://www.vectorlogo.zone/logos/microsoft_azure/microsoft_azure-icon.svg' },
    { name: 'Bitbucket', slug: 'bitbucket', color: '#0052CC' },
    { name: 'Jenkins', slug: 'jenkins', color: '#D24939' },
    { name: 'CircleCI', slug: 'circleci', color: '#343434', forceWhite: true }
  ];

  return (
    <FramerReveal direction="up" duration={1} className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-3xl mx-auto mb-20">
          <Badge variant="outline" className="mb-6 rounded-full border-primary/20 bg-primary/20 text-primary font-semibold px-3 py-1">
            <GitPullRequest className="h-3 w-3 mr-2 inline" /> Ecosystem
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
            Seamless integrations
          </h2>
          <p className="text-white/50 text-lg md:text-xl font-light">
            Speclane connects natively with the tools your engineering and product teams already use every day.
          </p>
        </div>

        <div className="relative flex overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
          <div className="flex animate-marquee whitespace-nowrap py-8 gap-6">
            {[...tools, ...tools].map((tool, i) => (
              <div
                key={i}
                className="group px-12 transition-all duration-500 flex items-center gap-4 shrink-0 cursor-default hover:scale-110"
                style={{ '--hover-color': tool.color } as React.CSSProperties}
              >
                <div className="h-10 w-10 relative">
                  <img
                    src={tool.url || `https://cdn.simpleicons.org/${tool.slug}${tool.forceWhite ? '/white' : ''}`}
                    alt={tool.name}
                    className="h-full w-full object-contain opacity-60 group-hover:opacity-100 transition-all duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[var(--hover-color)] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                </div>
                <span className="font-semibold text-lg text-white/20 group-hover:text-white transition-colors duration-500">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FramerReveal>
  );
}

// FIX 5: Metrics — missing return() statement entirely
function Metrics() {
  const stats = [
    { label: 'Test Generation', value: '10x', suffix: 'Faster', desc: 'Reduce manual effort from hours to minutes.' },
    { label: 'Code Coverage', value: '99%', suffix: 'Accuracy', desc: 'Uncover edge cases that manual testers miss.' },
    { label: 'Setup Time', value: '0', suffix: 'Config', desc: 'Plug into GitHub and start generating instantly.' }
  ];

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <FramerReveal direction="up" staggerChildren={0.15} className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-12">
          {stats.map((stat, i) => (
            <FramerStaggerItem key={i} className="text-center group">
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-6">{stat.label}</div>
              <div className="relative inline-block mb-4">
                <div className="text-7xl md:text-8xl font-black tracking-tighter text-white tabular-nums transition-transform duration-500">
                  <Counter value={stat.value} />
                </div>
              </div>
              <div className="text-xl font-bold text-white mb-2">{stat.suffix}</div>
              <p className="text-white/40 text-sm max-w-[200px] mx-auto leading-relaxed">{stat.desc}</p>
            </FramerStaggerItem>
          ))}
        </div>
      </FramerReveal>
    </section>
  );
}

function Counter({ value, duration = 2000 }: { value: string, duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    if (!isVisible) return;
    const numericValue = parseInt(value.replace(/\D/g, ""));
    if (isNaN(numericValue)) {
      setCount(0);
      return;
    }

    let animationFrameId: number;
    let startTimestamp: number | null = null;
    const isZero = numericValue === 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      if (isZero) {
        const currentVal = Math.floor(progress * 10);
        setCount(currentVal === 10 ? 0 : currentVal);
      } else {
        setCount(Math.floor(progress * numericValue));
      }

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isVisible, value, duration]);

  const suffix = value.replace(/\d/g, "");

  return (
    <span ref={setRef as any}>
      {count}{suffix}
    </span>
  );
}

// FIX 6: BigBrandText — FramerReveal had pointer-events-none on wrapper causing issues, fixed className placement
function BigBrandText() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const text = "Speclane";

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <section
      className="py-40 bg-background relative overflow-hidden flex items-center justify-center min-h-[50vh] group cursor-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Interactive Cursor Spotlight */}
      <motion.div
        className="absolute w-64 h-64 rounded-full border border-white/20 bg-white/5 backdrop-blur-md pointer-events-none z-20 flex items-center justify-center mix-blend-difference hidden md:flex"
        animate={{
          left: mousePos.x,
          top: mousePos.y,
          opacity: isHovering ? 1 : 0,
          scale: isHovering ? 1 : 0.5,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 250, mass: 0.5 }}
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_20px_white]" />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-[13vw] md:text-[15vw] font-black tracking-tighter leading-[0.8] uppercase select-none pointer-events-none flex flex-wrap justify-center gap-x-[0.3em]">
          {text.split(" ").map((word, wordIdx) => (
            <span key={wordIdx} className="whitespace-nowrap inline-flex">
              {word.split("").map((char, i) => (
                <span
                  key={`${wordIdx}-${i}`}
                  className="inline-block relative bg-gradient-to-b from-white via-white/90 to-white/20 bg-clip-text text-transparent px-[0.02em]"
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    {
      quote: "Speclane has completely changed how we handle SQA. Generation is instant and the quality is higher than our manual work.",
      author: "Sarah Chen",
      role: "Lead QA @ Vercel",
      logo: "vercel",
      bg: "bg-[#1A1813]",
      textColor: "text-white",
      descColor: "text-white/60",
      accent: "from-primary/10 to-transparent",
      laserColor: "#EDECED"
    },
    {
      quote: "The GitHub integration is seamless. Our PRs now have full test coverage automatically without any manual intervention.",
      author: "Marcus Thorne",
      role: "DevOps Engineer @ Linear",
      logo: "linear",
      bg: "bg-primary",
      textColor: "text-[#14120B]",
      descColor: "text-[#14120B]/70",
      laserColor: "#ffffff"
    },
    {
      quote: "Requirement traceability used to be a nightmare for auditors. Now it's just a click away and fully automated.",
      author: "Elena Rodriguez",
      role: "Product Manager @ Stripe",
      logo: "stripe",
      bg: "bg-primary",
      textColor: "text-[#14120B]",
      descColor: "text-[#14120B]/70",
      laserColor: "#ffffff"
    },
  ];

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <FramerReveal direction="up" staggerChildren={0.1} className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4 rounded-full border-primary/20 bg-primary/20 text-primary font-semibold">Wall of Love</Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Loved by engineering teams</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <FramerStaggerItem key={i} className="relative p-[2.5px] group rounded-[2.5rem] overflow-hidden transition-all duration-700">
              <div
                className="absolute inset-[-200%] animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                style={{ background: `conic-gradient(from 0deg, transparent 25%, ${r.laserColor} 50%, transparent 75%)` }}
              />

              <div
                ref={useCardTilt<HTMLDivElement>({ maxRotation: 3 })}
                className={`relative h-full w-full rounded-[2.5rem] p-10 flex flex-col justify-between aspect-square lg:aspect-[4/5] overflow-hidden transition-all duration-500 ${r.bg} ${r.bg.includes('bg-white') ? `bg-gradient-to-br ${r.accent}` : ''} border border-white/10 group-hover:border-white/20`}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                  <img
                    src={`https://cdn.simpleicons.org/${r.logo}/${r.textColor === 'text-white' ? 'white' : '14120b'}`}
                    className="w-64 h-64 grayscale"
                    alt=""
                  />
                </div>

                <p className={`text-2xl md:text-3xl font-medium leading-tight tracking-tight relative z-10 ${r.textColor}`}>
                  "{r.quote}"
                </p>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 relative">
                      <img
                        src={`https://cdn.simpleicons.org/${r.logo}/${r.textColor === 'text-white' ? 'white' : '14120b'}`}
                        className="h-full w-full object-contain"
                        alt={r.author}
                      />
                    </div>
                    <div>
                      <div className={`font-bold tracking-wide ${r.textColor}`}>{r.author}</div>
                      <div className={`text-xs uppercase tracking-widest font-semibold ${r.descColor}`}>{r.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </FramerStaggerItem>
          ))}
        </div>
      </FramerReveal>
    </section>
  );
}

function TypewriterText({ text, speed = 100, pause = 3000 }: { text: string, speed?: number, pause?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: any;

    if (isDeleting) {
      if (displayedText === "") {
        setIsDeleting(false);
        timer = setTimeout(() => { }, speed);
      } else {
        timer = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, speed / 3);
      }
    } else {
      if (displayedText === text) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pause);
      } else {
        timer = setTimeout(() => {
          setDisplayedText(text.slice(0, displayedText.length + 1));
        }, speed);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, text, speed, pause]);

  return (
    <span>
      {displayedText}
      <span className="animate-pulse ml-[2px] border-r-2 border-white/60 h-4 inline-block align-middle"></span>
    </span>
  );
}

function SpecyWidget() {
  const [showButton, setShowButton] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'user' | 'bot'; text: string; isTyping?: boolean }>>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([
    "Tell me about Speclane features",
    "What are the billing plans?",
    "How does AI Test Generation work?",
    "Is there a free trial?"
  ]);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  const playChimeSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.25);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn('Audio Context playback failed or blocked.', e);
    }
  };

  const playReplySound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();

      // Soft single low-pitch pop — distinct from the chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn("Reply sound playback failed.", e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
      playChimeSound();
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsBotTyping(true);
      const timer = setTimeout(() => {
        setIsBotTyping(false);
        setMessages([
          {
            id: "greeting",
            sender: "bot",
            text: "Hey there! 👋 I am Specy, your virtual Speclane assistant. I can help you with anything related to our Speclane plans, pricing, and all features.\n\nWhat would you like to know today?",
            isTyping: true
          }
        ]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isBotTyping]);

  const getSmartReply = (query: string): { text: string; suggestions: string[] } => {
    const cleanQuery = query.toLowerCase().trim();

    const intents = [
      {
        name: "greetings",
        keywords: ["hi", "hello", "hey", "greetings", "morning", "evening", "specy", "yo", "sup"],
        text: "Hello! 👋 I am Specy, your virtual Speclane SDR agent. How can I help you today? You can ask me about our features, plans, pricing, or how to get started.",
        suggestions: ["Tell me about Speclane features", "What are the billing plans?", "Is there a free trial?"]
      },
      {
        name: "features",
        keywords: ["feature", "capability", "workspaces", "traceability", "matrix", "agent", "workspace", "tool", "dashboard", "what can you do", "benefit", "does it do"],
        text: "Speclane is an autonomous AI SQA agent workspace. Key capabilities include:\n\n• **AST Code Scanner**: Scans repository code to find routes, layouts, and components.\n• **AI Test Generator**: Writes clean Playwright/Cypress tests automatically.\n• **AI Self-Healing**: Automatically repairs broken tests when classnames or selectors change.\n• **Requirements Traceability Matrix**: Maps requirements to specific test assertions.\n• **Team Collaboration**: Integrated Slack alerts, group chat, and workspace video calls.",
        suggestions: ["What are the billing plans?", "How does AI Test Generation work?", "How does self-healing work?"]
      },
      {
        name: "pricing",
        keywords: ["pricing", "plan", "cost", "price", "billing", "subscription", "tier", "pro", "starter", "business", "buy", "pay", "cheap", "expensive"],
        text: "We offer three simple, predictable billing tiers built for developers and teams:\n\n1. **Free / Starter** ($29/mo): 1 project, 150 AI generations/mo, basic requirements traceability.\n2. **Pro** ($79/mo): Unlimited projects, 1,000 AI generations/mo, team chat, self-healing, video calling, and data import/export.\n3. **Business** ($149/mo): Unlimited projects, unlimited AI generations, Slack integration, dedicated test execution, priority support.",
        suggestions: ["Can I try for free?", "How do I get started?", "Go back to main menu"]
      },
      {
        name: "generation",
        keywords: ["generation", "generate", "how does it work", "ast", "automation", "scan", "test cases", "writing tests", "generator", "how it works"],
        text: "When you link your GitHub repository, Speclane uses an Abstract Syntax Tree (AST) scanner to read your code structure, routes, and interactive elements. It then synthesizes real E2E tests, commits them to a test branch, and executes them. No manual test scripting required!",
        suggestions: ["Does it support Cypress?", "How does self-healing work?", "Go back to main menu"]
      },
      {
        name: "healing",
        keywords: ["healing", "self-heal", "broken", "flaky", "locator", "selector", "fail", "fix", "heals"],
        text: "Our Self-Healing engine acts as a proxy during test runs. Instead of relying on rigid, hardcoded CSS selectors (which break when developers update classnames), Speclane uses semantic hierarchy matching. If a selector changes, the agent finds the element's replacement and updates the script on the fly.",
        suggestions: ["What are the billing plans?", "Tell me about Speclane features", "Go back to main menu"]
      },
      {
        name: "frameworks",
        keywords: ["playwright", "cypress", "framework", "selenium", "jest", "vitest", "javascript", "typescript", "supported", "languages", "write in"],
        text: "Currently, Speclane generates out-of-the-box E2E test suites in **Playwright** and **Cypress** (both JavaScript and TypeScript are supported). More frameworks (like Selenium and Puppeteer) are coming soon!",
        suggestions: ["How does AI Test Generation work?", "Go back to main menu"]
      },
      {
        name: "free",
        keywords: ["free", "trial", "free trial", "card", "credit card", "cost anything", "starter plan", "no credit card", "try it"],
        text: "Yes, you can register and try Speclane for free! You don't need a credit card to sign up. You will get 1 project and 150 AI generations/month on our Free tier, allowing you to test out our scanner and generator with no commitments.",
        suggestions: ["How do I sign up?", "What are the billing plans?"]
      },
      {
        name: "start",
        keywords: ["start", "sign up", "register", "how to use", "account", "setup", "create account", "get started", "link repo", "onboarding"],
        text: "Getting started takes less than 2 minutes! Just click the **Get Started** button on the top-right of this page to sign up. Once inside the dashboard, our setup installer wizard will guide you to connect your GitHub account and scan your first repository.",
        suggestions: ["What are the billing plans?", "Tell me about Speclane features", "Go back to main menu"]
      },
      {
        name: "team",
        keywords: ["team", "member", "invite", "collaborate", "video", "call", "chat", "slack", "collaboration", "share"],
        text: "Speclane workspaces include built-in collaboration features. You can invite team members to your dashboard, chat with them in real-time, launch video calls directly inside the app, and set up a Slack integration to notify you of test results.",
        suggestions: ["What are the billing plans?", "Go back to main menu"]
      }
    ];

    let bestIntent = null;
    let maxMatches = 0;

    for (const intent of intents) {
      let matches = 0;
      for (const kw of intent.keywords) {
        if (cleanQuery.includes(kw)) {
          matches += cleanQuery === kw ? 3 : 1;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestIntent = intent;
      }
    }

    if (bestIntent && maxMatches > 0) {
      return {
        text: bestIntent.text,
        suggestions: bestIntent.suggestions
      };
    }

    return {
      text: "That's a great question! As a virtual Speclane SDR agent, I am programmed to help you with Speclane's features, plans, pricing, test generation, and setup.\n\nCould you specify if you'd like to learn about pricing, features, or how to get started?",
      suggestions: [
        "Tell me about Speclane features",
        "What are the billing plans?",
        "How does AI Test Generation work?",
        "Is there a free trial?"
      ]
    };
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsgId = Math.random().toString();
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: text }]);

    if (!textToSend) {
      setInputText("");
    }
    setSuggestions([]);
    setIsBotTyping(true);

    const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

    try {
      const res = await fetch(`${apiBase}/specy/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      setIsBotTyping(false);
      playReplySound();
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'bot',
        text: data.text,
        isTyping: true
      }]);
      setSuggestions(data.suggestions || []);
    } catch {
      // Fallback to local keyword matching if backend is unavailable
      const reply = getSmartReply(text);
      setIsBotTyping(false);
      playReplySound();
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'bot',
        text: reply.text,
        isTyping: true
      }]);
      setSuggestions(reply.suggestions);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showButton && !isOpen && (
          <motion.button
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 bg-[#14120B] text-white border border-white/10 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all select-none group font-semibold text-base cursor-pointer"
          >
            <img src="/integrations/logos/speclane-white.png" className="h-9 w-11 shrink-0 object-contain" alt="Specy Logo" />
            <span>Ask Specy</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[440px] h-[560px] bg-[#14120B] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden text-white"
          >
            <div className="p-4.5 bg-white/5 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  <img src="/integrations/logos/avatar.jpg" className="h-full w-full object-cover object-[center_22%]" alt="Specy Avatar" />
                </div>
                <div>
                  <div className="font-bold text-base flex items-center gap-2">
                    Specy
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                      Online
                    </span>
                  </div>
                  <div className="text-xs text-white/40 font-mono">Virtual SDR Agent</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
                <button
                  onClick={() => { setIsOpen(false); setMessages([]); setSuggestions(["Tell me about Speclane features", "What are the billing plans?", "How does AI Test Generation work?", "Is there a free trial?"]); }}
                  title="Close & Clear Chat"
                  className="p-2 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4.5 space-y-4.5 custom-scrollbar bg-transparent">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div key={msg.id} className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in-50 slide-in-from-bottom-2 duration-300`}>
                    <div className={`flex max-w-[85%] gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                      {isBot && (
                        <div className="h-9 w-9 rounded-xl border border-white/10 shrink-0 flex items-center justify-center overflow-hidden mt-0.5">
                          <img src="/integrations/logos/avatar.jpg" className="h-full w-full object-cover object-[center_22%]" alt="Specy Avatar" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className={`px-4 py-3 rounded-2xl text-sm sm:text-base shadow-sm leading-relaxed border ${isBot
                          ? 'bg-white/5 border-white/5 text-white/90 rounded-tl-none'
                          : 'bg-primary border-primary text-primary-foreground rounded-tr-none'
                          }`}>
                          {isBot && msg.isTyping ? (
                            <TypingMessage
                              text={msg.text}
                              onComplete={() => {
                                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isTyping: false } : m));
                              }}
                            />
                          ) : (
                            <div className="whitespace-pre-line">{msg.text}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isBotTyping && (
                <div className="flex w-full justify-start animate-in fade-in-50 duration-200">
                  <div className="flex max-w-[85%] gap-3">
                    <div className="h-9 w-9 rounded-xl border border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                      <img src="/integrations/logos/avatar.jpg" className="h-full w-full object-cover object-[center_22%]" alt="Specy Avatar" />
                    </div>
                    <div className="px-4 py-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-1.5 h-9">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            <div className="p-4.5 bg-white/5 border-t border-white/5 space-y-3.5 shrink-0">
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-white/30 uppercase tracking-wider px-1">Suggested Questions</div>
                  <div className="flex flex-row overflow-x-auto gap-2 py-1 px-1 scrollbar-none select-none scroll-smooth">
                    {suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sug)}
                        className="shrink-0 px-4 py-2.5 rounded-full border border-white/10 hover:border-primary/50 bg-white/5 hover:bg-white/10 text-xs sm:text-sm text-white/80 hover:text-white font-medium transition-all cursor-pointer whitespace-nowrap"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 focus-within:border-primary/50 transition-all">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                  }}
                  placeholder="Type a question..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/30"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim()}
                  className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 border-none"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const TypingMessage = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 12);
    return () => clearInterval(interval);
  }, [text]);

  return <div className="whitespace-pre-line">{displayedText}</div>;
};