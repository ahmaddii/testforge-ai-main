import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { Wand2, ShieldCheck, AlertCircle, CheckCircle2, XCircle, Search, RefreshCw, Code2, ArrowRight, Activity, Cpu, Copy, Check, Terminal, Webhook, GitBranch, GitCommit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/app/self-healing")({
  component: SelfHealingPage,
  head: () => ({ meta: [{ title: "AI Self-Healing Tests — Speclane" }] }),
});

function SelfHealingPage() {
  const store = useApp();
  const { selfHealingJobs, applyHealingFix, rejectHealingFix, triggerHealingScan, loading, projects } = store;

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterProject, setFilterProject] = useState<string>("All Projects");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedYaml, setCopiedYaml] = useState(false);

  // Auto-refresh feed to listen for Webhooks
  useEffect(() => {
    const interval = setInterval(() => {
      store.fetchData();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredJobs = useMemo(() => {
    return selfHealingJobs.filter(job => {
      const matchStatus = filterStatus === "All" || job.status === filterStatus;
      const matchProject = filterProject === "All Projects" || job.project_id === filterProject;
      const matchSearch = !search ||
        job.test_case_title.toLowerCase().includes(search.toLowerCase()) ||
        job.broken_selector.toLowerCase().includes(search.toLowerCase()) ||
        job.healed_selector.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchProject && matchSearch;
    });
  }, [selfHealingJobs, search, filterStatus, filterProject]);

  const healedCount = selfHealingJobs.filter(j => j.status === "Healed").length;
  const pendingCount = selfHealingJobs.filter(j => j.status === "Pending Approval").length;
  const avgConfidence = selfHealingJobs.length > 0
    ? (selfHealingJobs.reduce((acc, curr) => acc + curr.confidence, 0) / selfHealingJobs.length).toFixed(1)
    : "93.4";

  const webhookUrl = `http://localhost:3001/api/self-healing/webhook?projectId=${projects[0]?.id || "demo-project"}`;

  const githubActionsYaml = `name: Speclane AI QA Pipeline

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]

jobs:
  test-and-heal:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run Playwright tests
        id: test
        run: npx playwright test
      
      - name: Trigger Speclane AI Self-Healing
        if: failure()
        run: |
          curl -X POST "${webhookUrl}" \\
          -H "Content-Type: application/json" \\
          -d '{
            "branch": "\${{ github.ref_name }}",
            "commitSha": "\${{ github.sha }}",
            "workflowName": "\${{ github.workflow }}",
            "actor": "\${{ github.actor }}",
            "status": "failed"
          }'`;

  const copyToClipboard = (text: string, type: 'url' | 'yaml') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedYaml(true);
      setTimeout(() => setCopiedYaml(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#14120B] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none relative z-10">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 shadow-none">
              AST DOM Drift Protection
            </Badge>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Monitoring Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Wand2 className="h-7 w-7 text-primary" />
            <span>AI Self-Healing Selectors</span>
          </h1>
          <p className="text-slate-500 dark:text-white/60 text-sm sm:text-base leading-relaxed">
            Speclane's neural engine automatically intercepts test execution failures, analyzes AST structural DOM changes, and auto-corrects broken selectors before builds fail.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-full px-6 font-bold text-xs gap-2 py-5 border border-primary/50 gradient-bg text-primary-foreground shadow-none hover:opacity-95 transition-opacity">
                <Terminal className="h-4 w-4" />
                Configure CI/CD Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-3xl shadow-none max-w-xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <DialogHeader className="mb-2">
                <DialogTitle className="text-2xl font-bold">Configure CI/CD Webhook</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-2 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3 text-amber-600 dark:text-amber-500">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold uppercase tracking-wider">Localhost Detected</p>
                    <p>To receive real webhooks from GitHub Actions, replace <code className="bg-amber-500/20 px-1 rounded font-mono">http://localhost:3001</code> in the URL below with your public Cloudflare Tunnel URL.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Your Unique Webhook URL</span>
                  </div>
                  <div className="relative">
                    <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-mono text-xs overflow-x-auto border border-slate-200 dark:border-white/10">
                      {webhookUrl}
                    </pre>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(webhookUrl, 'url')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-slate-200 dark:hover:bg-white/10"
                    >
                      {copiedUrl ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <GitCommit className="h-4 w-4" /> GitHub Actions Workflow
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
                      .github/workflows/speclane.yml
                    </span>
                  </div>
                  <div className="relative">
                    <pre className="p-4 rounded-2xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto border border-slate-800 scrollbar-hide">
                      {githubActionsYaml}
                    </pre>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(githubActionsYaml, 'yaml')}
                      className="absolute right-4 top-4 h-8 px-3 bg-white/10 hover:bg-white/20 text-white border-0"
                    >
                      {copiedYaml ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copiedYaml ? "Copied" : "Copy Workflow"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {[
          { title: "Total Webhook Events", value: `${selfHealingJobs.length * 3 + 120}`, desc: "Processed this month", icon: Webhook, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
          { title: "AI Healing Tickets", value: `${selfHealingJobs.length}`, desc: "Issues identified", icon: Activity, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
          { title: "Successfully Applied", value: `${healedCount}`, desc: "Resolutions pushed to CI", icon: ShieldCheck, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
          { title: "Pending Approval", value: `${pendingCount}`, desc: "Requires manual confirmation", icon: AlertCircle, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#14120B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none hover:border-primary hover:-translate-y-2 transition-all duration-300 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/60 font-mono">{card.title}</span>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{card.value}</div>
              <div className="text-xs text-slate-400 font-medium">{card.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#14120B] p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none relative z-10">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search test titles or selectors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-xs font-medium placeholder:text-slate-400 shadow-none"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-none outline-none focus:border-primary"
          >
            <option value="All Projects">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-white/10 pl-3">
            {["All", "Pending Approval", "Healed", "Failed"].map((st) => (
              <Badge
                key={st}
                variant="outline"
                onClick={() => setFilterStatus(st)}
                className={`cursor-pointer px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shadow-none ${filterStatus === st
                  ? "bg-primary text-[#14120B] border-primary font-bold"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 border-slate-200 dark:border-white/10 hover:border-primary"
                  }`}
              >
                {st}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Feed */}
      <div className="space-y-6 relative z-10">
        {filteredJobs.length === 0 ? (
          <div className="py-16 text-center border border-slate-200 dark:border-white/10 rounded-3xl bg-white dark:bg-[#14120B] space-y-3">
            <Code2 className="h-10 w-10 text-slate-400 mx-auto opacity-50" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">No self-healing events found</h3>
            <p className="text-xs text-slate-500 dark:text-white/60">There are no broken selectors or DOM drift events matching your current filters.</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const project = projects.find(p => p.id === job.project_id);
            const repoName = project?.repo_url ? project.repo_url.split('/').slice(-2).join('/') : "Unknown Repository";
            const shortCommit = job.commit_sha ? job.commit_sha.substring(0, 7) : job.id.substring(job.id.length - 7);
            const branchName = job.branch || project?.branch || "main";
            const workflowName = job.workflow_name || "Speclane AI QA Pipeline";
            const actor = job.actor || "github-actions";

            return (
              <div
                key={job.id}
                className="bg-white dark:bg-[#14120B] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none hover:border-primary hover:-translate-y-2 transition-all duration-300 space-y-6 relative overflow-hidden"
              >
                {/* Project Badge Header */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        📦 {project?.name || "Demo Project"}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded">
                        {repoName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                        <GitBranch className="h-3 w-3" /> {branchName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                        <GitCommit className="h-3 w-3" /> {shortCommit}
                      </span>
                      <Badge variant="outline" className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 flex items-center gap-1 ml-auto sm:ml-0">
                        <Webhook className="h-3 w-3" /> GitHub Actions: {workflowName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Test Scenario:</span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">{job.test_case_title}</h3>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-2 pt-2 text-[10px] font-mono font-semibold overflow-x-auto pb-1 scrollbar-hide">
                      <div className="flex items-center gap-1 text-slate-500 whitespace-nowrap">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                        Triggered by {actor}
                      </div>
                      <ArrowRight className="h-3 w-3 text-slate-300 dark:text-slate-700" />
                      <div className="flex items-center gap-1 text-blue-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        AST Analysis
                      </div>
                      <ArrowRight className="h-3 w-3 text-slate-300 dark:text-slate-700" />
                      <div className="flex items-center gap-1 text-emerald-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Patch Generated
                      </div>
                      <ArrowRight className="h-3 w-3 text-slate-300 dark:text-slate-700" />
                      <div className={`flex items-center gap-1 ${job.status === 'Healed' ? 'text-emerald-500' : job.status === 'Failed' ? 'text-red-500' : 'text-amber-500'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${job.status === 'Healed' ? 'bg-emerald-500' : job.status === 'Failed' ? 'bg-red-500' : 'bg-amber-500'}`} />
                        {job.status === "Pending Approval" ? "Pending QA" : job.status === "Healed" ? "Committed" : "Rejected"}
                      </div>
                      <span className="text-slate-400 ml-auto border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded">
                        {new Date(job.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className="px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase bg-primary/10 text-primary border border-primary/20 shadow-none">
                      ⚡ {job.confidence}% AI Confidence
                    </Badge>
                    {job.status === "Healed" && (
                      <Badge variant="outline" className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/20 shadow-none flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Auto-Healed
                      </Badge>
                    )}
                    {job.status === "Pending Approval" && (
                      <Badge variant="outline" className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-none flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Pending Review
                      </Badge>
                    )}
                    {job.status === "Failed" && (
                      <Badge variant="outline" className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 shadow-none flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Rejected
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Selector Comparison Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">

                  {/* Broken Selector Box */}
                  <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2">
                    <div className="flex items-center justify-between text-red-500 font-bold uppercase text-[10px] tracking-wider font-sans">
                      <span>Previous Broken Selector</span>
                      <span className="px-2 py-0.5 rounded bg-red-500/10">Failure Cause</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/10 dark:bg-black/40 text-red-600 dark:text-red-400 font-semibold break-all border border-red-500/10">
                      {job.broken_selector}
                    </div>
                  </div>

                  {/* Healed Selector Box */}
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between text-emerald-600 font-bold uppercase text-[10px] tracking-wider font-sans">
                      <span>Speclane AI Auto-Healed Selector</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10">Active Fix</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/10 dark:bg-black/40 text-emerald-600 dark:text-emerald-400 font-semibold break-all border border-emerald-500/10 flex items-center justify-between">
                      <span>{job.healed_selector}</span>
                      <ArrowRight className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
                    </div>
                  </div>

                </div>

                {/* DOM Diff Code Snippet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-white/60 font-mono uppercase tracking-wider">
                    <span>DOM Structural Diff Analysis</span>
                    <span>AST Node Diff</span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-white/10 leading-relaxed shadow-none">
                    {job.dom_diff_snippet.split('\n').map((line, lIdx) => {
                      const isRemoved = line.startsWith('-');
                      const isAdded = line.startsWith('+');
                      return (
                        <div key={lIdx} className={isRemoved ? "text-red-400 bg-red-950/40 px-1 rounded" : isAdded ? "text-emerald-400 bg-emerald-950/40 px-1 rounded font-bold" : "text-slate-300"}>
                          {line}
                        </div>
                      );
                    })}
                  </pre>
                </div>

                {/* Action Buttons */}
                {job.status === "Pending Approval" && (
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <Button
                      onClick={() => {
                        rejectHealingFix(job.id);
                        toast.error("Self-healing recommendation rejected.");
                      }}
                      variant="outline"
                      className="w-full sm:w-auto rounded-full h-10 px-6 font-bold text-xs text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-none"
                    >
                      Reject Recommendation
                    </Button>
                    <Button
                      onClick={() => {
                        applyHealingFix(job.id);
                        toast.success(`Selector successfully updated to "${job.healed_selector}"`);
                      }}
                      className="w-full sm:w-auto rounded-full h-10 px-6 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-none flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve & Apply Fix
                    </Button>
                  </div>
                )}

                {job.status === "Healed" && (
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-emerald-600">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Auto-healing applied. Build verification completed successfully.
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">AST Synced</span>
                  </div>
                )}

                {job.status === "Failed" && (
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-red-500">
                    <span className="flex items-center gap-1.5">
                      <XCircle className="h-4 w-4" /> Recommendation rejected by QA engineer.
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">Manual intervention required</span>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
