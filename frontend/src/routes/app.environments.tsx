import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search, Server, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, Trash2, ShieldAlert, BarChart3, Clock, History, ChevronRight, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, CartesianGrid } from "recharts";

/* ---------- design tokens ---------- */
const C = { pass: "#10b981", fail: "#C2452D", block: "#d99a1e" };
const CARD = "rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B]";
const MUTED = "text-slate-500 dark:text-white/50";
const TITLE = "text-slate-900 dark:text-white";
const TXT_PASS = "text-emerald-600 dark:text-emerald-400";
const TXT_FAIL = "text-[#C2452D] dark:text-[#E8735C]";
const TXT_BLOCK = "text-amber-600 dark:text-amber-400";
const SELECT = "w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-background/50 text-sm";

/* ---------- helpers ---------- */
const getBlockedCount = (run: any) => {
  const savedCount = run.blocked ?? run.results?._meta?.blocked;
  if (savedCount !== undefined && Number.isFinite(Number(savedCount))) return Number(savedCount);
  return Object.values(run.results || {}).filter((result: any) => result?.status === "Blocked").length;
};

const matchesEnv = (run: any, env: any) => {
  if (!run.environment) return false;
  const rEnv = run.environment.trim().toLowerCase();
  const eName = env.name.trim().toLowerCase();
  const eUrl = (env.url || "").trim().toLowerCase();
  return rEnv === eName || (eUrl && (rEnv === eUrl || rEnv.includes(eUrl) || eUrl.includes(rEnv)));
};

const parseLatency = (str: string) => str?.match(/(\d+)ms/)?.[0] ?? null;
const rateColor = (rate: number | null) => (rate === null ? MUTED : rate >= 80 ? TXT_PASS : TXT_FAIL);

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Healthy" ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
    : status === "Degraded" ? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
    : "text-sky-600 dark:text-sky-400 bg-sky-500/10";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${tone}`}>
      {status === "Healthy" && <CheckCircle2 className="h-3.5 w-3.5" />}
      {status === "Degraded" && <AlertTriangle className="h-3.5 w-3.5" />}
      {status === "Updating" && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
      {status}
    </span>
  );
}

function Legend({ items }: { items: { label: string; color: string; value?: number }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      {items.map((i) => (
        <span key={i.label} className={`flex items-center gap-1.5 ${MUTED}`}>
          <span className="h-2 w-2 rounded-full" style={{ background: i.color }} />
          {i.label}
          {i.value !== undefined && <span className={`font-semibold tabular-nums ${TITLE}`}>{i.value}</span>}
        </span>
      ))}
    </div>
  );
}

function SplitBar({ p, f, b, h = "h-1.5" }: { p: number; f: number; b: number; h?: string }) {
  const t = p + f + b;
  return (
    <div className={`${h} w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10 flex`}>
      {t > 0 && (
        <>
          <div style={{ width: `${(p / t) * 100}%`, background: C.pass }} />
          <div style={{ width: `${(f / t) * 100}%`, background: C.fail }} />
          <div style={{ width: `${(b / t) * 100}%`, background: C.block }} />
        </>
      )}
    </div>
  );
}

const CustomBarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const row = (label: string, value: number, color: string) => (
    <div className="flex items-center justify-between gap-6">
      <span className={`flex items-center gap-2 ${MUTED}`}>
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className={`tabular-nums font-medium ${TITLE}`}>{value}</span>
    </div>
  );
  return (
    <div className={`${CARD} p-3 shadow-lg text-xs space-y-2 min-w-[200px]`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-2">
        <span className={`font-semibold truncate ${TITLE}`}>{d.fullName}</span>
        <span className={MUTED}>{d.type}</span>
      </div>
      {row("Passed", d.passed, C.pass)}
      {row("Failed", d.failed, C.fail)}
      {row("Blocked", d.blocked, C.block)}
      <div className={`flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-2 ${MUTED}`}>
        <span>{d.runs} run{d.runs !== 1 ? "s" : ""}</span>
        <span className={`font-medium ${rateColor(d.hasRuns ? d.passRateNum : null)}`}>{d.passRate} pass rate</span>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/app/environments")({
  component: EnvironmentsPage,
});

function EnvironmentsPage() {
  const navigate = useNavigate();
  const environments = useApp((s) => s.environments);
  const projects = useApp((s) => s.projects);
  const executionRuns = useApp((s) => s.executionRuns);
  const fetchData = useApp((s) => s.fetchData);
  const addEnvironment = useApp((s) => s.addEnvironment);
  const deleteEnvironment = useApp((s) => s.deleteEnvironment);
  const triggerCheck = useApp((s) => s.triggerEnvironmentCheck);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [analyticsTab, setAnalyticsTab] = useState<"cluster" | "runs">("cluster");
  const [newEnv, setNewEnv] = useState({ name: "", type: "Staging" as const, url: "" });
  const [dispatchEnv, setDispatchEnv] = useState<any | null>(null);
  const [dispatchProjectId, setDispatchProjectId] = useState("");
  const [dispatching, setDispatching] = useState(false);

  const filteredEnvs = environments.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.url.toLowerCase().includes(search.toLowerCase()));
  const degradedCount = environments.filter((e) => e.status === "Degraded").length;
  const dispatchProjects = dispatchEnv?.project_id ? projects.filter((p) => p.id === dispatchEnv.project_id) : projects;

  const envStats = useMemo(() => {
    return environments.map((env) => {
      const runs = executionRuns.filter((r) => matchesEnv(r, env));
      const totalBlocked = runs.reduce((a, r) => a + getBlockedCount(r), 0);
      const totalPassed = runs.reduce((a, r) => a + r.passed, 0);
      const totalFailed = runs.reduce((a, r) => a + r.failed, 0);
      const totalTests = totalPassed + totalFailed + totalBlocked;
      const passRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : null;
      const avgDuration = runs.length > 0
        ? runs.reduce((a, r) => {
            const m = r.duration?.match(/(\d+)m\s*(\d+)s|(\d+)s/);
            if (!m) return a;
            return a + (m[1] ? parseInt(m[1]) * 60 + parseInt(m[2]) : parseInt(m[3]));
          }, 0) / runs.length
        : 0;
      return { env, runs, runCount: runs.length, totalTests, totalPassed, totalFailed, totalBlocked, passRate, avgDuration: Math.round(avgDuration) };
    });
  }, [environments, executionRuns]);

  const hasAnyRuns = envStats.some((s) => s.runCount > 0);

  const allMatchedRuns = useMemo(() => {
    const list: (typeof executionRuns[0] & { envName: string; envType?: string })[] = [];
    environments.forEach((env) => {
      executionRuns.filter((r) => matchesEnv(r, env)).forEach((r) => list.push({ ...r, envName: env.name, envType: env.type }));
    });
    return list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [environments, executionRuns]);

  const chartData = useMemo(() => envStats.map(({ env, runCount, totalPassed, totalFailed, totalBlocked, totalTests, passRate }) => ({
    name: env.name.length > 14 ? env.name.slice(0, 12) + "…" : env.name,
    fullName: env.name,
    type: env.type,
    passed: totalPassed,
    failed: totalFailed,
    blocked: totalBlocked,
    total: totalTests,
    runs: runCount,
    passRate: passRate !== null ? `${passRate}%` : "0%",
    passRateNum: passRate ?? 0,
    hasRuns: runCount > 0,
  })), [envStats]);

  const totalAllPassed = envStats.reduce((a, b) => a + b.totalPassed, 0);
  const totalAllFailed = envStats.reduce((a, b) => a + b.totalFailed, 0);
  const totalAllBlocked = envStats.reduce((a, b) => a + b.totalBlocked, 0);
  const totalAllTests = totalAllPassed + totalAllFailed + totalAllBlocked;
  const overallPassRate = totalAllTests > 0 ? Math.round((totalAllPassed / totalAllTests) * 100) : null;

  const donutData = useMemo(() => {
    if (totalAllTests === 0) return [{ name: "No runs yet", value: 1, color: "rgba(148,163,184,0.25)" }];
    const data = [];
    if (totalAllPassed > 0) data.push({ name: "Passed", value: totalAllPassed, color: C.pass });
    if (totalAllFailed > 0) data.push({ name: "Failed", value: totalAllFailed, color: C.fail });
    if (totalAllBlocked > 0) data.push({ name: "Blocked", value: totalAllBlocked, color: C.block });
    return data;
  }, [totalAllPassed, totalAllFailed, totalAllBlocked, totalAllTests]);

  /* ---------- handlers (unchanged) ---------- */
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
    if (updated?.status === "Healthy") toast.success(`✓ Cluster verified: ${updated.last_verified}`);
    else toast.warning(`⚠ Cluster status: ${updated?.status} — ${updated?.last_verified}`);
  };

  const handleDispatch = (env: any) => {
    if (env.status === "Degraded") {
      const go = confirm(`⚠ WARNING: "${env.name}" is currently DEGRADED.\n\nDispatching test runs to a degraded cluster may cause false failures and corrupt your results.\n\nContinue anyway?`);
      if (!go) return;
    }
    const eligibleProjects = env.project_id ? projects.filter((p) => p.id === env.project_id) : projects;
    if (eligibleProjects.length === 0) {
      return toast.error(env.project_id ? "This environment is linked to a project you cannot access." : "Create a project before dispatching tests.");
    }
    setDispatchProjectId(eligibleProjects.length === 1 ? eligibleProjects[0].id : "");
    setDispatchEnv(env);
  };

  const runDispatch = async () => {
    if (!dispatchEnv || !dispatchProjectId || dispatching) return;
    const project = projects.find((item) => item.id === dispatchProjectId);
    if (!project) return toast.error("Choose a project for this test run.");
    setDispatching(true);
    try {
      const summary = await api.post("/execution-runs/execute", {
        project_id: project.id,
        environment_id: dispatchEnv.id,
        force_all: true,
        run_name: `${project.name} — ${dispatchEnv.name}`,
        triggered_by: "Environment Dashboard",
      });
      setDispatchEnv(null);
      toast.success(`Run complete on ${dispatchEnv.name}: ${summary.passed} passed, ${summary.failed} failed, ${summary.blocked} blocked.`);
      await fetchData().catch((error) => console.error("Failed to refresh environment run history:", error));
    } catch (err: any) {
      toast.error(err?.error || err?.message || "Could not run tests against this environment.");
    } finally {
      setDispatching(false);
    }
  };

  const tabBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
      active ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : `${MUTED} hover:text-slate-900 dark:hover:text-white`
    }`;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Degraded banner */}
      {degradedCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {degradedCount} environment{degradedCount > 1 ? "s are" : " is"} degraded
            </p>
            <p className={`text-sm mt-0.5 ${MUTED}`}>Test runs sent to a degraded environment can fail for the wrong reasons. Run a probe, or wait until it recovers.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-semibold tracking-tight flex items-center gap-2.5 ${TITLE}`}>
            <Server className="h-6 w-6 text-primary" /> Test environments
          </h1>
          <p className={`text-sm mt-1 ${MUTED}`}>Register target URLs, check their availability, and run saved test cases against them.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-lg h-10 px-4 gap-2 font-medium shadow-none">
              <Plus className="h-4 w-4" /> Register environment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl glass-strong border-white/10 p-6 shadow-none">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Register environment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEnv} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name</label>
                <Input placeholder="e.g. EU Core Staging" value={newEnv.name} onChange={(e) => setNewEnv({ ...newEnv, name: e.target.value })} className="rounded-lg border-white/10 bg-background/50" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Type</label>
                <select value={newEnv.type} onChange={(e) => setNewEnv({ ...newEnv, type: e.target.value as any })} className={SELECT}>
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Development">Development</option>
                  <option value="Preview">Preview</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Base URL</label>
                <Input type="url" placeholder="https://staging.api.example.com" value={newEnv.url} onChange={(e) => setNewEnv({ ...newEnv, url: e.target.value })} className="rounded-lg border-white/10 bg-background/50" required />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-lg">Cancel</Button>
                <Button type="submit" className="rounded-lg shadow-none">Register</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!dispatchEnv} onOpenChange={(open) => { if (!open && !dispatching) setDispatchEnv(null); }}>
          <DialogContent className="sm:max-w-md rounded-2xl glass-strong border-white/10 p-6 shadow-none">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Run tests</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Run this project’s test cases against <span className="font-semibold text-foreground">{dispatchEnv?.name}</span> at {dispatchEnv?.url}. Results are saved in Execution Runs.
              </p>
              <div className="space-y-1.5">
                <label htmlFor="dispatch-project" className="text-sm font-medium">Project</label>
                <select id="dispatch-project" value={dispatchProjectId} onChange={(e) => setDispatchProjectId(e.target.value)} disabled={dispatching || dispatchProjects.length <= 1} className={SELECT}>
                  <option value="" disabled>Select a project</option>
                  {dispatchProjects.map((project) => (<option key={project.id} value={project.id}>{project.name}</option>))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => setDispatchEnv(null)} disabled={dispatching} className="rounded-lg">Cancel</Button>
                <Button type="button" onClick={runDispatch} disabled={dispatching || !dispatchProjectId} className="rounded-lg shadow-none">
                  {dispatching ? "Running tests…" : "Run test suite"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or domain" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 rounded-lg border-slate-200 dark:border-white/10 bg-white/40 dark:bg-[#14120B]/30" />
      </div>

      {/* Analytics */}
      {environments.length > 0 && (
        <section className={`${CARD} p-5 sm:p-6 space-y-5`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className={`text-base font-semibold ${TITLE}`}>Test execution</h2>
              <p className={`text-sm ${MUTED}`}>Results per environment across all saved runs</p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 p-1 self-start md:self-auto">
              <button onClick={() => setAnalyticsTab("cluster")} className={tabBtn(analyticsTab === "cluster")}>
                <BarChart3 className="h-4 w-4" /> Overview
              </button>
              <button onClick={() => setAnalyticsTab("runs")} className={tabBtn(analyticsTab === "runs")}>
                <History className="h-4 w-4" /> Recent runs ({allMatchedRuns.length})
              </button>
            </div>
          </div>

          {!hasAnyRuns ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-dashed border-slate-200 dark:border-white/10">
              <BarChart3 className="h-8 w-8 text-slate-300 dark:text-white/20 mb-3" />
              <p className={`text-sm font-medium ${TITLE}`}>No test runs yet</p>
              <p className={`text-sm max-w-sm mt-1 mb-4 ${MUTED}`}>Run your test cases against an environment to compare results here.</p>
              <Button onClick={() => navigate({ to: "/app/test-cases" })} size="sm" className="rounded-lg gap-1.5 shadow-none">
                <Play className="h-3.5 w-3.5" /> Go to test cases
              </Button>
            </div>
          ) : analyticsTab === "cluster" ? (
            <div className="space-y-5">
              {overallPassRate === 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#C2452D]/30 bg-[#C2452D]/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${TXT_FAIL}`} />
                    <div>
                      <p className={`text-sm font-semibold ${TXT_FAIL}`}>No tests passed</p>
                      <p className={`text-sm ${MUTED}`}>{totalAllFailed} failed and {totalAllBlocked} blocked out of {totalAllTests}. Check the failures, and look at blocked steps for safety restrictions.</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate({ to: "/app/run-comparison" })} size="sm" variant="outline" className="rounded-lg shrink-0 gap-1">
                    Open run comparison <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Bar chart */}
                <div className="lg:col-span-2 rounded-lg border border-slate-200 dark:border-white/10 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h3 className={`text-sm font-semibold ${TITLE}`}>Results by environment</h3>
                    <Legend items={[
                      { label: "Passed", color: C.pass },
                      { label: "Failed", color: C.fail },
                      { label: "Blocked", color: C.block },
                    ]} />
                  </div>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={4} barCategoryGap={chartData.length === 1 ? "45%" : "25%"}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" />
                        <XAxis dataKey="name" stroke="currentColor" className="text-slate-500 dark:text-white/50 text-xs" tickLine={false} axisLine={false} />
                        <YAxis stroke="currentColor" className="text-slate-500 dark:text-white/50 text-xs" tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(148,163,184,0.1)" }} />
                        <Bar dataKey="passed" name="Passed" fill={C.pass} radius={[3, 3, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="failed" name="Failed" fill={C.fail} radius={[3, 3, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="blocked" name="Blocked" fill={C.block} radius={[3, 3, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut */}
                <div className="rounded-lg border border-slate-200 dark:border-white/10 p-4 flex flex-col">
                  <h3 className={`text-sm font-semibold ${TITLE}`}>Overall pass rate</h3>
                  <div className="relative h-44 my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={54} outerRadius={72} paddingAngle={donutData.length > 1 ? 3 : 0} dataKey="value" stroke="none">
                          {donutData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#14120B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className={`text-2xl font-semibold tabular-nums ${rateColor(overallPassRate)}`}>{overallPassRate === null ? "—" : `${overallPassRate}%`}</span>
                      <span className={`text-xs ${MUTED}`}>passed</span>
                    </div>
                  </div>
                  <dl className="space-y-1.5 text-sm mt-auto">
                    {[["Passed", totalAllPassed, C.pass], ["Failed", totalAllFailed, C.fail], ["Blocked", totalAllBlocked, C.block]].map(([label, n, color]: any) => (
                      <div key={label} className="flex items-center justify-between">
                        <dt className={`flex items-center gap-2 ${MUTED}`}><span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}</dt>
                        <dd className={`tabular-nums font-medium ${TITLE}`}>{n}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* Environment summary table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`text-left text-xs ${MUTED} border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03]`}>
                      <th className="px-4 py-2.5 font-medium">Environment</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 font-medium w-56">Results</th>
                      <th className="px-4 py-2.5 font-medium text-right">Pass rate</th>
                      <th className="px-4 py-2.5 font-medium text-right">Runs</th>
                      <th className="px-4 py-2.5 font-medium text-right">Avg time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {envStats.map((s) => (
                      <tr key={s.env.id}>
                        <td className="px-4 py-3">
                          <div className={`font-medium ${TITLE}`}>{s.env.name}</div>
                          <div className={`text-xs ${MUTED}`}>{s.env.type}</div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={s.env.status} /></td>
                        <td className="px-4 py-3">
                          <SplitBar p={s.totalPassed} f={s.totalFailed} b={s.totalBlocked} />
                          <div className={`mt-1.5 text-xs tabular-nums ${MUTED}`}>{s.totalPassed} passed · {s.totalFailed} failed · {s.totalBlocked} blocked</div>
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold tabular-nums ${rateColor(s.passRate)}`}>{s.passRate === null ? "—" : `${s.passRate}%`}</td>
                        <td className={`px-4 py-3 text-right tabular-nums ${TITLE}`}>{s.runCount}</td>
                        <td className={`px-4 py-3 text-right tabular-nums ${MUTED}`}>{s.avgDuration > 0 ? `${s.avgDuration}s` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`flex items-center justify-between text-sm ${MUTED}`}>
                <span>{allMatchedRuns.length} run{allMatchedRuns.length !== 1 ? "s" : ""} on registered environments</span>
                <button onClick={() => navigate({ to: "/app/run-comparison" })} className="text-primary hover:underline font-medium flex items-center gap-1">
                  Open run comparison <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/5 rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden">
                {allMatchedRuns.map((run) => {
                  const blocked = getBlockedCount(run);
                  const ok = run.failed === 0 && blocked === 0;
                  return (
                    <div key={run.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-sm font-medium ${TITLE}`}>{run.name}</span>
                          <Badge variant="outline" className="text-xs rounded-md px-2 py-0 font-normal border-slate-200 dark:border-white/10">{run.envName}</Badge>
                          {run.status && (
                            <Badge className={`text-xs rounded-md px-2 py-0 font-normal shadow-none ${ok ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-[#C2452D]/10 " + TXT_FAIL + " border-[#C2452D]/20"}`}>
                              {run.status}
                            </Badge>
                          )}
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${MUTED}`}>
                          <Clock className="h-3 w-3" /> {run.duration || "0s"}
                          <span aria-hidden>·</span>
                          {run.created_at ? new Date(run.created_at).toLocaleString() : "Recent"}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs tabular-nums shrink-0">
                        <span className={`font-medium ${TXT_PASS}`}>{run.passed} passed</span>
                        <span className={`font-medium ${TXT_FAIL}`}>{run.failed} failed</span>
                        <span className={`font-medium ${TXT_BLOCK}`}>{blocked} blocked</span>
                        <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/app/run-comparison" })} className="rounded-lg h-8 px-2 text-xs">
                          Inspect
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Environment cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredEnvs.map((env) => {
          const runStats = envStats.find((s) => s.env.id === env.id);
          const latency = parseLatency(env.last_verified);
          const degraded = env.status === "Degraded";
          return (
            <article key={env.id} className={`${CARD} p-5 flex flex-col gap-5 hover:border-slate-300 dark:hover:border-white/20 transition-colors`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-lg font-semibold truncate ${TITLE}`}>{env.name}</h3>
                    <Badge variant="outline" className="text-xs rounded-md px-2 py-0 font-normal border-slate-200 dark:border-white/10 shrink-0">{env.type}</Badge>
                  </div>
                  <a href={env.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm text-primary hover:underline">
                    <span className="truncate">{env.url}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </div>
                <StatusBadge status={env.status} />
              </div>

              <dl className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-white/10 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03]">
                <div className="p-3">
                  <dt className={`text-xs ${MUTED}`}>Active runners</dt>
                  <dd className={`mt-1 text-xl font-semibold tabular-nums ${TITLE}`}>{env.active_runners}</dd>
                </div>
                <div className="p-3">
                  <dt className={`text-xs ${MUTED}`}>Test pass rate</dt>
                  <dd className={`mt-1 text-xl font-semibold tabular-nums ${rateColor(runStats?.passRate ?? null)}`}>{runStats?.passRate == null ? "—" : `${runStats.passRate}%`}</dd>
                  <div className={`text-xs ${MUTED}`}>{runStats?.totalTests ? `${runStats.totalPassed}/${runStats.totalTests} passed` : "No runs"}</div>
                </div>
                <div className="p-3">
                  <dt className={`text-xs ${MUTED}`}>Probe success</dt>
                  <dd className={`mt-1 text-xl font-semibold tabular-nums ${env.success_rate >= 80 ? TXT_PASS : TXT_BLOCK}`}>{env.success_rate}%</dd>
                  <div className={`text-xs ${MUTED}`}>{latency ?? "No latency"}</div>
                </div>
              </dl>

              <div className={`text-xs truncate ${MUTED}`} title={env.last_verified}>Last probe: {env.last_verified}</div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/10">
                <Button onClick={() => handleTriggerCheck(env)} variant="outline" size="sm" className="rounded-lg h-9 gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> Probe
                </Button>
                <Button
                  onClick={() => handleDispatch(env)}
                  size="sm"
                  variant={degraded ? "outline" : "default"}
                  className={`rounded-lg h-9 gap-1.5 shadow-none ${degraded ? "border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10" : ""}`}
                >
                  <Play className="h-3.5 w-3.5" /> {degraded ? "Run anyway" : "Run tests"}
                </Button>
                <Button onClick={() => deleteEnvironment(env.id)} variant="ghost" size="icon" className="ml-auto h-9 w-9 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500" title="Delete environment" aria-label="Delete environment">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          );
        })}
        {filteredEnvs.length === 0 && (
          <div className={`col-span-full rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-12 text-center text-sm ${MUTED}`}>
            No environments match your search. Register one to start running tests.
          </div>
        )}
      </div>
    </div>
  );
}