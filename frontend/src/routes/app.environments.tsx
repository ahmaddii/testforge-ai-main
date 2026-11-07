import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search, Server, Globe, CheckCircle2, AlertTriangle, RefreshCw, Terminal, ExternalLink, Activity, Trash2, Zap, ShieldAlert, BarChart3, TrendingDown, TrendingUp, Clock, History, ArrowRight, CheckCircle, XCircle, ChevronRight, Layers, PlayCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp } from "@/lib/store";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, CartesianGrid } from "recharts";

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#14120B]/95 backdrop-blur-xl p-4 shadow-2xl text-xs space-y-2.5 min-w-[210px]">
        <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-white/10">
          <span className="truncate text-sm font-black">{data.fullName}</span>
          <span className="text-[10px] font-mono text-slate-500 dark:text-white/40 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 shrink-0 border border-slate-200 dark:border-white/10">
            {data.type}
          </span>
        </div>
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Passed Tests
            </span>
            <span className="font-mono font-bold">{data.passed}</span>
          </div>
          <div className="flex items-center justify-between text-[#B9402A] dark:text-rose-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#B9402A]" /> Failed Tests
            </span>
            <span className="font-mono font-bold">{data.failed}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-white/50 pt-1.5 border-t border-slate-100 dark:border-white/5 font-mono text-[11px]">
            <span>Success Rate</span>
            <span className={`font-bold ${data.passRateNum >= 80 ? 'text-emerald-500' : 'text-[#B9402A]'}`}>
              {data.passRate}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400 dark:text-white/40 text-[10px] font-mono">
            <span>Execution Runs</span>
            <span>{data.runs} snapshot{data.runs !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const Route = createFileRoute("/app/environments")({
  component: EnvironmentsPage,
});

function EnvironmentsPage() {
  const navigate = useNavigate();
  const environments = useApp((s) => s.environments);
  const executionRuns = useApp((s) => s.executionRuns);
  const addEnvironment = useApp((s) => s.addEnvironment);
  const deleteEnvironment = useApp((s) => s.deleteEnvironment);
  const triggerCheck = useApp((s) => s.triggerEnvironmentCheck);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [analyticsTab, setAnalyticsTab] = useState<'cluster' | 'runs'>('cluster');
  const [newEnv, setNewEnv] = useState({ name: "", type: "Staging" as const, url: "" });

  const filteredEnvs = environments.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.url.toLowerCase().includes(search.toLowerCase()));
  const degradedCount = environments.filter(e => e.status === "Degraded").length;

  // Per-environment analytics from real execution run history with robust fuzzy matching
  const envStats = useMemo(() => {
    return environments.map(env => {
      const runs = executionRuns.filter(r => {
        if (!r.environment) return false;
        const rEnv = r.environment.trim().toLowerCase();
        const eName = env.name.trim().toLowerCase();
        const eUrl = (env.url || "").trim().toLowerCase();
        return rEnv === eName || (eUrl && (rEnv === eUrl || rEnv.includes(eUrl) || eUrl.includes(rEnv)));
      });
      const totalTests = runs.reduce((a, r) => a + r.passed + r.failed, 0);
      const totalPassed = runs.reduce((a, r) => a + r.passed, 0);
      const totalFailed = runs.reduce((a, r) => a + r.failed, 0);
      const passRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : null;
      // Average duration in seconds
      const avgDuration = runs.length > 0
        ? runs.reduce((a, r) => {
            const m = r.duration?.match(/(\d+)m\s*(\d+)s|(\d+)s/);
            if (!m) return a;
            return a + (m[1] ? parseInt(m[1]) * 60 + parseInt(m[2]) : parseInt(m[3]));
          }, 0) / runs.length
        : 0;
      return { env, runs, runCount: runs.length, totalTests, totalPassed, totalFailed, passRate, avgDuration: Math.round(avgDuration) };
    });
  }, [environments, executionRuns]);

  const hasAnyRuns = envStats.some(s => s.runCount > 0);

  // All execution runs matched to any registered environment
  const allMatchedRuns = useMemo(() => {
    const list: (typeof executionRuns[0] & { envName: string; envType?: string })[] = [];
    environments.forEach(env => {
      const runs = executionRuns.filter(r => {
        if (!r.environment) return false;
        const rEnv = r.environment.trim().toLowerCase();
        const eName = env.name.trim().toLowerCase();
        const eUrl = (env.url || "").trim().toLowerCase();
        return rEnv === eName || (eUrl && (rEnv === eUrl || rEnv.includes(eUrl) || eUrl.includes(rEnv)));
      });
      runs.forEach(r => {
        list.push({ ...r, envName: env.name, envType: env.type });
      });
    });
    return list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [environments, executionRuns]);

  const chartData = useMemo(() => {
    return envStats.map(({ env, runCount, totalPassed, totalFailed, totalTests, passRate }) => ({
      name: env.name.length > 14 ? env.name.slice(0, 12) + "…" : env.name,
      fullName: env.name,
      type: env.type,
      status: env.status,
      passed: totalPassed,
      failed: totalFailed,
      total: totalTests,
      runs: runCount,
      passRate: passRate !== null ? `${passRate}%` : "0%",
      passRateNum: passRate ?? 0,
      hasRuns: runCount > 0,
    }));
  }, [envStats]);

  const totalAllPassed = useMemo(() => envStats.reduce((a, b) => a + b.totalPassed, 0), [envStats]);
  const totalAllFailed = useMemo(() => envStats.reduce((a, b) => a + b.totalFailed, 0), [envStats]);
  const totalAllTests = totalAllPassed + totalAllFailed;
  const overallPassRate = totalAllTests > 0 ? Math.round((totalAllPassed / totalAllTests) * 100) : 100;

  const donutData = useMemo(() => {
    if (totalAllTests === 0) {
      return [{ name: "No runs yet", value: 1, count: 0, color: "rgba(255,255,255,0.12)" }];
    }
    const data = [];
    if (totalAllPassed > 0) {
      data.push({ name: "Passed", value: totalAllPassed, count: totalAllPassed, color: "#10b981" });
    }
    if (totalAllFailed > 0) {
      data.push({ name: "Failed", value: totalAllFailed, count: totalAllFailed, color: "#B9402A" });
    }
    return data;
  }, [totalAllPassed, totalAllFailed, totalAllTests]);

  const handleCreateEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnv.name || !newEnv.url) return;
    await addEnvironment(newEnv);
    setIsOpen(false);
    setNewEnv({ name: "", type: "Staging", url: "" });
    toast.success(`Cluster environment '${newEnv.name}' registered`);
  };

  const handleTriggerCheck = async (env: any) => {
    toast.info(`Executing probe on ${env.name}...`);
    await triggerCheck(env.id);
    const updated = useApp.getState().environments.find((e) => e.id === env.id);
    if (updated?.status === "Healthy") {
      toast.success(`✓ Cluster verified: ${updated.last_verified}`);
    } else {
      toast.warning(`⚠ Cluster status: ${updated?.status} — ${updated?.last_verified}`);
    }
  };

  const handleDispatch = (env: any) => {
    if (env.status === "Degraded") {
      const go = confirm(`⚠ WARNING: "${env.name}" is currently DEGRADED.\n\nDispatching test runs to a degraded cluster may cause false failures and corrupt your results.\n\nContinue anyway?`);
      if (!go) return;
    }
    navigate({ to: "/app/test-cases" });
    toast.info(`Targeting test suite against ${env.name} (${env.type})`);
  };

  // Parse latency from strings like "142ms (HTTP 200) • Just now"
  const parseLatency = (str: string) => {
    const m = str?.match(/(\d+)ms/);
    return m ? `${m[1]}ms` : null;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl relative">

      {/* Degraded Banner */}
      {degradedCount > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
          <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="text-sm font-bold text-red-500">{degradedCount} Cluster{degradedCount > 1 ? 's' : ''} Degraded — Test Dispatch Risk Detected</p>
            <p className="text-xs text-red-400/70 mt-0.5">Any test run dispatched to degraded environments may produce false negatives. Trigger a health check or hold dispatches until clusters recover.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1 flex items-center gap-3">
            <Server className="h-8 w-8 text-primary" /> Target Test Environments
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">
            Configure and monitor execution environments (Staging, Prod, Dev clusters) across your test suites.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full px-6 h-10 shadow-none hover:scale-105 transition-all flex items-center gap-2 font-semibold text-sm">
              <Plus className="h-4 w-4" /> Register Environment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl glass-strong border-white/10 p-6 shadow-none">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Register Environment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEnv} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-white/70">Environment Name</label>
                <Input
                  placeholder="e.g. EU Core Staging"
                  value={newEnv.name}
                  onChange={(e) => setNewEnv({ ...newEnv, name: e.target.value })}
                  className="rounded-xl border-white/10 bg-background/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-white/70">Cluster Type</label>
                <select
                  value={newEnv.type}
                  onChange={(e) => setNewEnv({ ...newEnv, type: e.target.value as any })}
                  className="w-full h-10 px-3 rounded-xl border border-white/10 bg-background/50 text-slate-900 dark:text-white text-sm font-semibold"
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Development">Development</option>
                  <option value="Preview">Preview</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-white/70">Base URL</label>
                <Input
                  type="url"
                  placeholder="https://staging.api.example.com"
                  value={newEnv.url}
                  onChange={(e) => setNewEnv({ ...newEnv, url: e.target.value })}
                  className="rounded-xl border-white/10 bg-background/50"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-full">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full shadow-none font-bold">
                  Register
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search environment name or domain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-2xl border-white/20 dark:border-white/10 bg-white/30 dark:bg-[#14120B]/20 font-medium"
        />
      </div>

      {/* Per-Environment Test Analytics */}
      {environments.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-6 sm:p-8 shadow-none space-y-6">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#B9402A]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header & View Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 border-b border-slate-100 dark:border-white/5 pb-5">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="h-9 w-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Test Execution Analytics</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-white/40 ml-11">
                Pass / fail breakdown per registered cluster & live execution logs
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              {/* Tab Selector */}
              <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setAnalyticsTab('cluster')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    analyticsTab === 'cluster'
                      ? 'bg-white dark:bg-[#1e1c15] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10'
                      : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Cluster Overview
                </button>
                <button
                  onClick={() => setAnalyticsTab('runs')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    analyticsTab === 'runs'
                      ? 'bg-white dark:bg-[#1e1c15] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10'
                      : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  Recent Run Logs ({allMatchedRuns.length})
                </button>
              </div>

              {/* Counters */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Passed ({totalAllPassed})</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B9402A]/10 border border-[#B9402A]/20">
                  <div className="h-2 w-2 rounded-full bg-[#B9402A]" />
                  <span className="text-[11px] font-bold text-[#B9402A]">Failed ({totalAllFailed})</span>
                </div>
                <Badge variant="outline" className="text-[11px] border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white/60 rounded-full px-3 py-1 font-medium">
                  {environments.length} Cluster{environments.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>

          {!hasAnyRuns ? (
            <div className="flex flex-col items-center justify-center py-14 text-center relative z-10 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-slate-400 dark:text-white/20" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white/60 mb-1">No execution runs linked yet</p>
              <p className="text-xs text-slate-500 dark:text-white/30 max-w-sm leading-relaxed mb-4">
                Execute automated test runs against <span className="font-bold text-primary">{environments.map(e => e.name).join(', ')}</span> to track comparative analytics.
              </p>
              <Button
                onClick={() => navigate({ to: "/app/test-cases" })}
                size="sm"
                className="rounded-full shadow-none font-semibold text-xs gap-1.5"
              >
                <PlayCircle className="h-3.5 w-3.5" /> Dispatch Automated Tests
              </Button>
            </div>
          ) : analyticsTab === 'cluster' ? (
            <div className="space-y-6 relative z-10">

              {/* Notice Banner when failures dominate */}
              {overallPassRate === 0 && totalAllTests > 0 && (
                <div className="p-4 rounded-2xl bg-[#B9402A]/10 border border-[#B9402A]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-[#B9402A]/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-4 w-4 text-[#B9402A]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#B9402A]">
                        High Failure Concentration Detected on {environments.length === 1 ? environments[0].name : 'Target Clusters'}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-white/50">
                        {totalAllFailed} of {totalAllTests} tests failed in recent runs. Inspect assertions, endpoint response codes, or UI selectors.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate({ to: "/app/run-comparison" })}
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs font-bold border-[#B9402A]/30 text-[#B9402A] hover:bg-[#B9402A]/10 shrink-0 gap-1.5"
                  >
                    Inspect in Run Comparison <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Dual Graph Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Recharts Bar Chart (Cluster Comparative Breakdown) */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-6 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cluster Pass / Fail Distribution</h4>
                        {environments.length === 1 && (
                          <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/10 text-primary rounded-full px-2 py-0">
                            Single Active Target
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-white/40">Comparative automated test suite metrics across clusters</p>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-500 dark:text-white/50">Passed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-[#B9402A]" />
                        <span className="text-slate-500 dark:text-white/50">Failed</span>
                      </div>
                      <div className="border-l border-slate-200 dark:border-white/10 pl-3 text-slate-400 dark:text-white/40">
                        Total: <span className="font-bold text-slate-900 dark:text-white">{totalAllTests}</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={chartData} 
                        margin={{ top: 16, right: 16, left: -15, bottom: 8 }}
                        barGap={10}
                        barCategoryGap={chartData.length === 1 ? "40%" : "20%"}
                      >
                        <defs>
                          <linearGradient id="passedBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                          </linearGradient>
                          <linearGradient id="failedBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.95} />
                            <stop offset="100%" stopColor="#B9402A" stopOpacity={0.75} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5 opacity-60" />
                        <XAxis
                          dataKey="name"
                          stroke="currentColor"
                          className="text-slate-400 dark:text-white/40 text-[11px]"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="currentColor"
                          className="text-slate-400 dark:text-white/40 text-[11px]"
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                        <Bar 
                          dataKey="passed" 
                          name="Passed" 
                          fill="url(#passedBarGrad)" 
                          radius={[6, 6, 0, 0]} 
                          maxBarSize={chartData.length === 1 ? 52 : 38} 
                        />
                        <Bar 
                          dataKey="failed" 
                          name="Failed" 
                          fill="url(#failedBarGrad)" 
                          radius={[6, 6, 0, 0]} 
                          maxBarSize={chartData.length === 1 ? 52 : 38} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right: Recharts Donut Pie Chart (Overall Pass Ratio) */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Global Pass Ratio</h4>
                      <p className="text-[11px] text-slate-500 dark:text-white/40">Overall stability score</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] rounded-full px-2.5 py-0.5 font-bold ${
                      overallPassRate >= 80
                        ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
                        : 'text-[#B9402A] border-[#B9402A]/20 bg-[#B9402A]/10'
                    }`}>
                      {totalAllTests > 0 ? `${overallPassRate}% Pass` : "100% Ready"}
                    </Badge>
                  </div>

                  <div className="relative w-full h-[175px] flex items-center justify-center my-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={54}
                          outerRadius={74}
                          paddingAngle={donutData.length > 1 ? 4 : 0}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`donut-${index}`} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: "#14120B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className={`text-2xl font-black tracking-tight ${overallPassRate >= 80 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                        {totalAllTests > 0 ? `${overallPassRate}%` : "100%"}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-bold">
                        {totalAllTests > 0 && overallPassRate === 0 ? "All Tests Failed" : "Pass Rate"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-200/60 dark:border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-600 dark:text-white/70">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Passed Tests
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {totalAllPassed} ({totalAllTests > 0 ? Math.round((totalAllPassed / totalAllTests) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-600 dark:text-white/70">
                        <span className="h-2 w-2 rounded-full bg-[#B9402A]" /> Failed Tests
                      </span>
                      <span className="font-mono font-bold text-[#B9402A]">
                        {totalAllFailed} ({totalAllTests > 0 ? Math.round((totalAllFailed / totalAllTests) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                      <span className="text-[11px] text-slate-400 dark:text-white/40 font-mono">
                        {allMatchedRuns.length} execution run{allMatchedRuns.length !== 1 ? 's' : ''} logged
                      </span>
                      <button
                        onClick={() => navigate({ to: "/app/run-comparison" })}
                        className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        Run Comparison <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Cluster Detail Cards: Adaptive Layout */}
              {environments.length === 1 ? (
                // Tailored layout for a single environment
                (() => {
                  const stat = envStats[0];
                  if (!stat) return null;
                  const env = stat.env;
                  return (
                    <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="space-y-1.5 min-w-[220px]">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900 dark:text-white">{env.name}</span>
                          <span className={`h-2.5 w-2.5 rounded-full ${
                            env.status === 'Healthy' ? 'bg-emerald-400' :
                            env.status === 'Degraded' ? 'bg-[#B9402A] animate-pulse' : 'bg-blue-400'
                          }`} />
                          <Badge variant="outline" className="text-[10px] font-mono rounded-full px-2 py-0 border-slate-200 dark:border-white/10">
                            {env.type}
                          </Badge>
                        </div>
                        <a
                          href={env.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-500 dark:text-white/40 hover:text-primary transition-colors flex items-center gap-1 truncate font-mono"
                        >
                          {env.url} <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      </div>

                      {/* Visual segmented test progress bar */}
                      <div className="flex-1 max-w-lg space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-500 dark:text-white/40">Execution Distribution</span>
                          <span className={stat.passRate !== null && stat.passRate >= 80 ? 'text-emerald-500 font-bold' : 'text-[#B9402A] font-bold'}>
                            {stat.passRate !== null ? `${stat.passRate}% Success` : '0% Success'}
                          </span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden flex">
                          {stat.totalTests > 0 ? (
                            <>
                              <div
                                style={{ width: `${(stat.totalPassed / stat.totalTests) * 100}%` }}
                                className="bg-emerald-500 h-full transition-all"
                                title={`${stat.totalPassed} Passed`}
                              />
                              <div
                                style={{ width: `${(stat.totalFailed / stat.totalTests) * 100}%` }}
                                className="bg-[#B9402A] h-full transition-all"
                                title={`${stat.totalFailed} Failed`}
                              />
                            </>
                          ) : (
                            <div className="w-full bg-slate-300 dark:bg-white/20 h-full" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-white/40 font-mono">
                          <span>{stat.totalPassed} passed / {stat.totalFailed} failed</span>
                          <span>{stat.runCount} execution run{stat.runCount !== 1 ? 's' : ''} {stat.avgDuration > 0 ? `• Avg ${stat.avgDuration}s` : ''}</span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTriggerCheck(env)}
                          className="rounded-full text-xs font-semibold gap-1.5"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Probe Cluster
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDispatch(env)}
                          className="rounded-full text-xs font-semibold gap-1.5 shadow-none"
                        >
                          <PlayCircle className="h-3.5 w-3.5" /> Dispatch Tests
                        </Button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                // Multi-cluster grid
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-1">
                  {chartData.map((c) => (
                    <div key={c.fullName} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-primary/40 transition-all flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate" title={c.fullName}>{c.fullName}</span>
                          <span className={`h-2 w-2 rounded-full shrink-0 ${
                            c.status === 'Healthy' ? 'bg-emerald-400' :
                            c.status === 'Degraded' ? 'bg-[#B9402A] animate-pulse' : 'bg-blue-400'
                          }`} />
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-white/40 truncate">{c.type}</div>
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="space-y-1">
                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden flex">
                          {c.total > 0 ? (
                            <>
                              <div style={{ width: `${(c.passed / c.total) * 100}%` }} className="bg-emerald-500 h-full" />
                              <div style={{ width: `${(c.failed / c.total) * 100}%` }} className="bg-[#B9402A] h-full" />
                            </>
                          ) : (
                            <div className="w-full bg-slate-300 dark:bg-white/20 h-full" />
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-baseline justify-between font-mono">
                        <span className={`text-sm font-black ${
                          c.passRateNum >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                          c.total === 0 ? 'text-slate-400 dark:text-white/40' : 'text-[#B9402A]'
                        }`}>
                          {c.passRate}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-white/40">
                          {c.passed}p / {c.failed}f ({c.runs}r)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : (
            // Recent Run Logs Tab View
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/40 px-1 font-mono">
                <span>Execution snapshots targeting registered environments ({allMatchedRuns.length} records)</span>
                <button
                  onClick={() => navigate({ to: "/app/run-comparison" })}
                  className="text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  View full history in Run Comparison <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
                {allMatchedRuns.map((run) => {
                  const total = run.passed + run.failed;
                  const rate = total > 0 ? Math.round((run.passed / total) * 100) : 0;
                  const isSuccess = rate >= 80 && run.failed === 0;
                  return (
                    <div
                      key={run.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/50 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{run.name}</span>
                          <Badge variant="outline" className="text-[10px] font-mono rounded-full px-2 py-0 border-slate-200 dark:border-white/10">
                            {run.envName}
                          </Badge>
                          {run.status && (
                            <Badge className={`text-[10px] rounded-full px-2 py-0 ${
                              isSuccess ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-[#B9402A]/10 text-[#B9402A] border-[#B9402A]/20'
                            }`}>
                              {run.status}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-white/40 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {run.duration || '0s'}
                          </span>
                          <span>•</span>
                          <span>{run.created_at ? new Date(run.created_at).toLocaleString() : 'Recent snapshot'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto font-mono">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                            {run.passed} passed
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#B9402A]/10 text-[#B9402A] font-bold border border-[#B9402A]/20">
                            {run.failed} failed
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate({ to: "/app/run-comparison" })}
                          className="rounded-full text-xs font-semibold hover:bg-primary/10 hover:text-primary gap-1"
                        >
                          Inspect <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Environments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEnvs.map((env) => (
          <div
            key={env.id}
            className="group bg-white dark:bg-[#14120B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none hover:border-primary hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none rounded-bl-full" />
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                  {env.type}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    env.status === "Healthy"
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : env.status === "Degraded"
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse"
                      : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  }`}
                >
                  {env.status === "Healthy" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                  {env.status === "Degraded" && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                  {env.status === "Updating" && <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin" />}
                  {env.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight flex items-center gap-2">
                <Globe className="h-5 w-5 text-slate-400" /> {env.name}
              </h3>
              <a
                href={env.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-mono mb-6 hover:underline"
              >
                {env.url} <ExternalLink className="h-3 w-3" />
              </a>

              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-[#14120B]/30 p-4 rounded-2xl border border-white/10 mb-6 font-mono">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-white/50 tracking-wider mb-1 flex items-center gap-1">
                    <Terminal className="h-3 w-3" /> Active Runners
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">{env.active_runners} Nodes</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-white/50 tracking-wider mb-1 flex items-center gap-1">
                    <Activity className="h-3 w-3" /> Pass Rate
                  </div>
                  <div className="text-xl font-black text-green-500">{env.success_rate}%</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-2">
              {/* Uptime / Success Rate Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-white/40">
                  <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Success Rate</span>
                  <span className={env.success_rate >= 80 ? 'text-green-500' : 'text-red-500'}>{env.success_rate}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${env.success_rate}%` }}
                    className={`h-full rounded-full transition-all duration-700 ${
                      env.success_rate >= 80 ? 'bg-green-500' : env.success_rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/50 font-mono">
                <span className="truncate max-w-[160px]" title={env.last_verified}>Probe: {env.last_verified}</span>
                <div className="flex items-center gap-1.5">
                  {parseLatency(env.last_verified) && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[10px] font-bold text-slate-600 dark:text-white/60">
                      {parseLatency(env.last_verified)}
                    </span>
                  )}
                  <Button onClick={() => handleTriggerCheck(env)} variant="outline" size="sm" className="rounded-full px-3 h-7 text-xs font-bold border-primary/40 text-primary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all">
                    <RefreshCw className="h-3 w-3 mr-1" /> Probe
                  </Button>
                  <Button onClick={() => handleDispatch(env)} size="sm" className={`rounded-full px-3 h-7 text-xs font-bold shadow-none ${
                    env.status === 'Degraded' ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}>
                    <Zap className="h-3 w-3 mr-1" />
                    {env.status === 'Degraded' ? 'Dispatch Anyway' : 'Dispatch Tests'}
                  </Button>
                  <Button onClick={() => deleteEnvironment(env.id)} variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-red-500/10 hover:text-red-500 text-slate-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredEnvs.length === 0 && (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 dark:text-white/40">
            No test environments registered in repository.
          </div>
        )}
      </div>
    </div>
  );
}
