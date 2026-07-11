import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { BookOpen, Search, Wand2, Terminal, ExternalLink, MessageSquare, ShieldCheck, Cpu, Clock, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { articles, type DocArticle } from "@/lib/docs-data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/help")({
  component: HelpDocsPage,
  head: () => ({ meta: [{ title: "Documentation & Support — Speclane" }] }),
});

function HelpDocsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const navigate = useNavigate();

  const categories = ["All", "Projects & Test Cases", "AI Test Generator", "Execution Runs", "Target Environments", "Defect Lifecycle"];

  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchCategory = selectedCategory === "All" || a.category === selectedCategory;
      const matchSearch = !search || `${a.title} ${a.summary} ${a.content}`.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [search, selectedCategory]);

  const topics = [
    {
      icon: BookOpen,
      title: "Projects & Test Cases",
      description: "Master project organization, test case structuring, and requirement traceability across your workspace.",
      linkText: "Read Documentation",
      categoryName: "Projects & Test Cases",
      colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: Wand2,
      title: "AI Test Generator Guide",
      description: "Leverage our AI engine to instantly transform user requirements and PR descriptions into comprehensive test plans.",
      linkText: "Explore AI Prompts",
      categoryName: "AI Test Generator",
      colorClass: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: Terminal,
      title: "Execution Runs & CI/CD",
      description: "Trigger automated test verification runs across configured environments and analyze real-time defect trends.",
      linkText: "View Integration Guides",
      categoryName: "Execution Runs",
      colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  const faqs = [
    {
      q: "How does the AI Test Generator handle complex test cases?",
      a: "The Speclane AI engine analyzes your requirement context, identifies boundary conditions, and generates formatted BDD test specifications with automated test steps.",
    },
    {
      q: "Can I run automated test suites across different environments?",
      a: "Yes. You can configure multiple staging, production, or preview environments in the Environments tab and assign specific test runs to any target URL.",
    },
    {
      q: "What happens when my monthly AI generation quota is reached?",
      a: "You will receive a notification prompting you to upgrade your workspace plan in the Billing section to unlock unlimited AI test generation capabilities.",
    },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-6xl relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#14120B] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none relative z-10">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
              Speclane Support Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Documentation & Resource Hub
          </h1>
          <p className="text-slate-500 dark:text-white/60 text-sm sm:text-base">
            Everything you need to configure Speclane AI test generators, manage structured test plans, and execute automated quality pipelines.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            onClick={() => navigate({ to: "/contact" })} 
            className="rounded-full shadow-sm px-6 font-bold text-xs gap-2 py-5 border border-primary/50 gradient-bg text-primary-foreground"
          >
            <MessageSquare className="h-4 w-4" /> Contact Success Team
          </Button>
        </div>
      </div>

      {/* Global Doc Search box */}
      <div className="bg-white dark:bg-[#14120B] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 text-center space-y-4 shadow-sm relative z-10 overflow-hidden">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">How can we assist your QA engineering today?</h2>
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search Speclane docs, AI generation tips, BDD assertions, environment setups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 font-medium text-sm shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant="outline"
              onClick={() => setSelectedCategory(cat)}
              className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat 
                  ? "bg-primary text-[#14120B] border-primary font-bold shadow-sm" 
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 border-slate-200 dark:border-white/10 hover:border-primary"
              }`}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Topics Grid (Category shortcuts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {topics.map((t, idx) => {
          const Icon = t.icon;
          return (
            <div 
              key={idx} 
              onClick={() => {
                setSelectedCategory(t.categoryName);
                toast.success(`Showing ${t.title} articles`);
              }}
              className="bg-white dark:bg-[#14120B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none space-y-4 hover:border-primary hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-4">
                <div className={`p-3 rounded-2xl w-fit border ${t.colorClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h3>
                <p className="text-xs text-slate-500 dark:text-white/60 leading-relaxed">
                  {t.description}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline">
                  {t.linkText}
                </span>
                <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Documentation Articles Grid */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> 
            <span>{selectedCategory === "All" ? "All Documentation Articles" : `${selectedCategory} Articles`}</span>
          </h3>
          <span className="text-xs font-mono text-slate-500 dark:text-white/50">
            Showing {filteredArticles.length} of {articles.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((article) => {
            const Icon = article.icon;
            return (
              <div
                key={article.id}
                onClick={() => navigate({ to: "/app/docs/$articleId", params: { articleId: article.id } })}
                className="bg-white dark:bg-[#14120B] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-none hover:border-primary hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-mono font-bold tracking-wide shadow-none pointer-events-none">
                      {article.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Clock className="h-3 w-3" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span>{article.title}</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-white/60 leading-relaxed line-clamp-2">
                    {article.summary}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Read full guide</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
          {filteredArticles.length === 0 && (
            <div className="col-span-full py-12 text-center border border-slate-200 dark:border-white/10 rounded-3xl bg-white dark:bg-[#14120B]">
              <p className="text-slate-500 dark:text-white/50 text-sm">No documentation articles found matching your criteria.</p>
              <Button variant="link" onClick={() => { setSearch(""); setSelectedCategory("All"); }} className="text-primary font-semibold mt-2">
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Onboarding Roadmap */}
      <div className="bg-white dark:bg-[#14120B] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-primary" /> Recommended Speclane Workflow
          </h3>
          <span className="text-xs font-mono text-slate-500 dark:text-white/50 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
            4-Step Core Flow
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: "1. Projects & Specs", desc: "Create workspace repositories and link product specs.", done: true },
            { step: "2. Target Environments", desc: "Configure test URLs (Staging, Production) for runs.", done: true },
            { step: "3. AI Test Generator", desc: "Instantly synthesize test plans from requirements.", done: false },
            { step: "4. Runs & Defect Tracking", desc: "Execute verification runs and monitor quality trends.", done: false },
          ].map((ch, idx) => (
            <div 
              key={idx} 
              className={`p-5 rounded-2xl border transition-all space-y-2 ${
                ch.done 
                  ? "bg-green-500/5 border-green-500/20 text-green-700 dark:text-green-400 shadow-sm" 
                  : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60"
              }`}
            >
              <div className="flex items-center justify-between gap-2 font-bold text-xs">
                <span className="text-slate-900 dark:text-white tracking-tight">{ch.step}</span>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${ch.done ? "bg-green-500 text-white font-extrabold" : "border border-slate-300 dark:border-white/20 text-slate-400"}`}>
                  {ch.done ? "✓" : idx + 1}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-white/50 leading-normal">{ch.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white dark:bg-[#14120B] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none space-y-6 relative z-10">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-start gap-2">
                <span className="text-primary font-mono font-black">Q.</span> {faq.q}
              </h4>
              <p className="text-xs text-slate-500 dark:text-white/60 leading-relaxed pl-5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
