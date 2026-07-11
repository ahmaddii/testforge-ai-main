import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { FolderGit2, FlaskConical, GitBranch, Target, ArrowRight, Sparkles, Bug, AlertTriangle, CreditCard } from "lucide-react";
import { useApp } from "@/lib/store";
import { PageSkeleton } from "@/components/page-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/app/")({
  component: DashboardHome,
  head: () => ({ meta: [{ title: "Dashboard — Speclane" }] }),
});

function DashboardHome() {
  const { projects, testCases, reports, defects: allDefects, loading } = useApp();
  
  const coverage = useMemo(() => {
    if (reports.length === 0) return 0;
    return Math.round(reports.reduce((a, r) => a + r.coverage, 0) / reports.length);
  }, [reports]);

  const stats = [
    { label: "Total Projects", value: projects.length, icon: FolderGit2, accent: "from-primary to-primary-glow" },
    { label: "Test Cases", value: testCases.length, icon: FlaskConical, accent: "from-chart-2 to-primary" },
    { label: "Open Defects", value: allDefects.filter(d => d.status === 'Open').length, icon: Bug, accent: "from-red-500 to-orange-500" },
    { label: "Avg. Coverage", value: `${coverage}%`, icon: Target, accent: "from-chart-4 to-chart-5" },
  ];

  const trend = [
    { d: "Mon", v: testCases.length > 0 ? Math.floor(testCases.length * 0.2) : 0 }, 
    { d: "Tue", v: testCases.length > 0 ? Math.floor(testCases.length * 0.4) : 0 }, 
    { d: "Wed", v: testCases.length > 0 ? Math.floor(testCases.length * 0.3) : 0 },
    { d: "Thu", v: testCases.length > 0 ? Math.floor(testCases.length * 0.5) : 0 }, 
    { d: "Fri", v: testCases.length > 0 ? Math.floor(testCases.length * 0.7) : 0 }, 
    { d: "Sat", v: testCases.length > 0 ? Math.floor(testCases.length * 0.8) : 0 }, 
    { d: "Sun", v: testCases.length },
  ];

  const testStatusData = useMemo(() => {
    const passed = testCases.filter(t => t.status === "Passed").length;
    const failed = testCases.filter(t => t.status === "Failed").length;
    const pending = testCases.filter(t => t.status === "Pending").length;
    const total = testCases.length || 1;

    return [
      { name: "Passed", value: Math.round((passed / total) * 100), count: passed, color: "#10b981" },
      { name: "Failed", value: Math.round((failed / total) * 100), count: failed, color: "#B9402A" },
      { name: "Pending", value: Math.round((pending / total) * 100), count: pending, color: "#6366f1" },
    ];
  }, [testCases]);

  if (loading) {
    return <PageSkeleton cards={4} rows={5} />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1">Command Center</h1>
          <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">Overview of your automated QA infrastructure.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/app/billing">
            <Button variant="outline" className="border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 text-slate-700 dark:text-white hover:bg-white/20 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white h-10 px-6 rounded-full font-semibold transition-all hover:scale-[1.02]">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Manage Subscription</span>
            </Button>
          </Link>
          <Link to={projects.length > 0 ? "/app/test-cases" : "/app/projects"}>
            <Button className="gradient-bg text-primary-foreground shadow-none border border-primary/50 relative group overflow-hidden h-10 px-6 rounded-full font-semibold">
              <Sparkles className="mr-2 h-4 w-4 relative z-10" /> 
              <span className="relative z-10">Generate test cases</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 relative z-10">
        {stats.map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-6 shadow-none transition-all duration-300 hover:-translate-y-2 hover:border-primary group">
             <div className="flex items-center justify-between mb-6 relative z-10">
               <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                 <s.icon className="h-5 w-5" />
               </div>
             </div>
             <div className="relative z-10">
               <div className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-1">{s.value}</div>
               <div className="text-sm font-medium text-slate-500 dark:text-white/50 group-hover:text-slate-700 dark:group-hover:text-white/70 transition-colors">{s.label}</div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 relative z-10">
         <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-6 sm:p-8 shadow-none flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Generation Velocity</h3>
                  <p className="text-xs text-slate-500 dark:text-white/40 mt-1">Test cases generated over time</p>
               </div>
               <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary rounded-full px-3 py-1 font-medium text-[10px]">Last 7 Days</Badge>
            </div>
            <div className="flex-1 min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 10, left: -20, right: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EDECED" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#EDECED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="d" stroke="currentColor" className="text-slate-400 dark:text-white/20" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="currentColor" className="text-slate-400 dark:text-white/20" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                       contentStyle={{ background: "#14120B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} 
                       itemStyle={{ color: "#fff", fontWeight: "bold" }} 
                    />
                    <Area type="monotone" dataKey="v" stroke="#EDECED" strokeWidth={3} fill="url(#g1)" activeDot={{ r: 6, fill: "#EDECED", stroke: "#14120B", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
         </div>

         <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-6 sm:p-8 shadow-none flex flex-col">
            <div className="flex items-center justify-between mb-4">
               <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Test Status</h3>
                  <p className="text-xs text-slate-500 dark:text-white/40 mt-1">Real-time execution stats</p>
               </div>
               <Badge variant="outline" className="border-red-500/20 bg-red-500/10 text-red-400 rounded-full px-3 py-1 font-medium text-[10px]">
                 {testCases.filter(t => t.status === "Failed").length} Failed
               </Badge>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
               <div className="relative w-[160px] h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={testStatusData}
                           cx="50%"
                           cy="50%"
                           innerRadius={52}
                           outerRadius={72}
                           paddingAngle={3}
                           dataKey="value"
                        >
                           {testStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-2xl font-black text-slate-900 dark:text-white">{testCases.length}</span>
                     <span className="text-[10px] text-slate-400 dark:text-white/40 font-medium uppercase tracking-wide">Total</span>
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-2 w-full">
                  {testStatusData.map((d) => (
                     <div key={d.name} className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-xs text-slate-500 dark:text-white/50 font-medium flex-1 truncate">{d.name}</span>
                        <span className="text-xs font-black" style={{ color: d.color }}>{d.count}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 relative z-10">
         <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-6 sm:p-8 shadow-none flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Projects</h3>
               <Link to="/app/projects" className="text-xs font-semibold text-primary">View all</Link>
            </div>
            <div className="space-y-3">
               {projects.slice(0, 4).map((p) => (
                  <Link key={p.id} to="/app/projects/$projectId" params={{ projectId: p.id }} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <FolderGit2 size={18} />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-white/40 truncate w-48">{p.repo_url.replace('https://github.com/', '')}</div>
                       </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                  </Link>
               ))}
               {projects.length === 0 && <p className="text-center py-8 text-slate-500 dark:text-white/30 text-sm">No projects found.</p>}
            </div>
         </div>

         <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-6 sm:p-8 shadow-none flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Defects</h3>
               <Link to="/app/defects" className="text-xs font-semibold text-primary">View all</Link>
            </div>
            <div className="space-y-3">
               {allDefects.slice(0, 4).map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-4">
                       <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
                         d.severity === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                       }`}>
                          <AlertTriangle size={18} />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{d.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-white/40">{d.status} · {d.severity}</div>
                       </div>
                    </div>
                  </div>
               ))}
               {allDefects.length === 0 && <p className="text-center py-8 text-slate-500 dark:text-white/30 text-sm">No defects reported.</p>}
            </div>
         </div>
      </div>
    </div>
  );
}
