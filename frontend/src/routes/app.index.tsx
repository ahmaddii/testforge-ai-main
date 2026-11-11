import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FolderGit2, FlaskConical, Target, Bug, AlertTriangle, Server, CheckCircle2, RefreshCw, Zap } from "lucide-react";
import { useApp } from "@/lib/store";
import { PageSkeleton } from "@/components/page-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import GrayAgent from "./Gray-agent";

export const Route = createFileRoute("/app/")({
  component: DashboardHome,
  head: () => ({ meta: [{ title: "Dashboard — Speclane" }] }),
});

function DashboardHome() {
  const { projects, testCases, reports, defects: allDefects, environments, loading } = useApp();
  const [velocityRange, setVelocityRange] = useState<'7d' | '30d' | 'all'>('7d');
  
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

  const { trendData, periodTotal, peakDaily } = useMemo(() => {
    const now = new Date();
    const toYMD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const countsByDate = new Map<string, number>();
    testCases.forEach((tc) => {
      if (!tc.created_at) return;
      try {
        const d = new Date(tc.created_at);
        if (isNaN(d.getTime())) return;
        const key = toYMD(d);
        countsByDate.set(key, (countsByDate.get(key) || 0) + 1);
      } catch {
        // ignore invalid date
      }
    });

    let points: { d: string; fullDate: string; count: number }[] = [];

    if (velocityRange === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = toYMD(d);
        const dayName = i === 0 ? "Today" : d.toLocaleDateString(undefined, { weekday: 'short' });
        const fullDate = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const count = countsByDate.get(key) || 0;
        points.push({ d: dayName, fullDate, count });
      }
    } else if (velocityRange === '30d') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = toYMD(d);
        const dayLabel = i === 0 ? "Today" : (i % 5 === 0 || i === 29 ? d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }) : "");
        const fullDate = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const count = countsByDate.get(key) || 0;
        points.push({ d: dayLabel, fullDate, count });
      }
    } else {
      if (countsByDate.size === 0) {
        points = [{ d: "Today", fullDate: now.toLocaleDateString(), count: 0 }];
      } else {
        const sortedKeys = Array.from(countsByDate.keys()).sort();
        if (sortedKeys.length === 1) {
          const onlyDate = new Date(sortedKeys[0]);
          const prev = new Date(onlyDate);
          prev.setDate(onlyDate.getDate() - 1);
          points.push({
            d: prev.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            fullDate: prev.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
            count: 0
          });
        }
        sortedKeys.forEach(k => {
          const d = new Date(k + 'T00:00:00');
          points.push({
            d: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            fullDate: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
            count: countsByDate.get(k) || 0
          });
        });
      }
    }

    const total = points.reduce((acc, p) => acc + p.count, 0);
    const peak = Math.max(0, ...points.map(p => p.count));

    return { trendData: points, periodTotal: total, peakDaily: peak };
  }, [testCases, velocityRange]);

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

          <Link to={projects.length > 0 ? "/app/test-cases" : "/app/projects"}>
            <Button className="dashboard-generate-button gradient-bg text-primary-foreground shadow-none border border-primary/50 relative group overflow-hidden h-10 px-6 rounded-full font-semibold">
              <GrayAgent size={100} color="#2A8BF3" eyeColor="#ffffff" />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
               <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Generation Velocity</h3>
                    <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] px-2 py-0.5">
                      {periodTotal} Generated
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
                    Test cases generated over time {peakDaily > 0 ? `• Peak: ${peakDaily}/day` : ''}
                  </p>
               </div>

               <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 self-start sm:self-auto">
                  {(['7d', '30d', 'all'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setVelocityRange(range)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        velocityRange === range
                          ? "bg-white dark:bg-[#1f1d16] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10"
                          : "text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {range === '7d' ? 'Last 7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex-1 min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, left: -20, right: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EDECED" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#EDECED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="d" 
                      stroke="currentColor" 
                      className="text-slate-400 dark:text-white/20" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="currentColor" 
                      className="text-slate-400 dark:text-white/20" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip 
                       contentStyle={{ background: "#14120B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} 
                       itemStyle={{ color: "#fff", fontWeight: "bold" }}
                       formatter={(value: any) => [`${value} test case${value === 1 ? '' : 's'}`, "Generated"]}
                       labelFormatter={(_label: any, payload: any) => {
                         if (payload && payload[0]?.payload?.fullDate) {
                           return payload[0].payload.fullDate;
                         }
                         return _label;
                       }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      name="Generated"
                      stroke="#EDECED" 
                      strokeWidth={3} 
                      fill="url(#g1)" 
                      activeDot={{ r: 6, fill: "#EDECED", stroke: "#14120B", strokeWidth: 2 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
            </div>

            {periodTotal === 0 && testCases.length > 0 && velocityRange === '7d' && (
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-white/40 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2">
                <span>No test cases generated in the last 7 days. ({testCases.length} earlier test cases recorded)</span>
                <button 
                  onClick={() => setVelocityRange('all')}
                  className="text-primary hover:underline font-semibold ml-2 shrink-0"
                >
                  View All Time
                </button>
              </div>
            )}
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

      {/* Environment Health Panel */}
      {environments.length > 0 && (() => {
        const degraded = environments.filter(e => e.status === "Degraded");
        return (
          <div className="relative z-10 space-y-3">
            {degraded.length > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 animate-pulse">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-500">{degraded.length} Environment{degraded.length > 1 ? 's' : ''} Degraded — Test Dispatch at Risk</p>
                  <p className="text-xs text-red-400/80 mt-0.5">Test runs targeting <span className="font-mono font-bold">{degraded.map(e => e.name).join(', ')}</span> may fail. Trigger a health check or pause dispatches.</p>
                </div>
                <Link to="/app/environments" className="ml-auto shrink-0">
                  <Button size="sm" variant="outline" className="rounded-full border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500 text-xs font-bold">
                    Fix Now
                  </Button>
                </Link>
              </div>
            )}
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-6 shadow-none">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Server className="h-5 w-5 text-primary" /> Environment Health
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-white/40 mt-0.5">Live status of all registered test execution clusters</p>
                </div>
                <Link to="/app/environments">
                  <Button size="sm" variant="ghost" className="rounded-full text-xs font-semibold text-primary hover:bg-primary/10">
                    Manage <RefreshCw className="ml-1.5 h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {environments.slice(0, 4).map(env => (
                  <div key={env.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      env.status === 'Healthy' ? 'bg-green-500' : env.status === 'Degraded' ? 'bg-red-500 animate-pulse' : 'bg-blue-500 animate-pulse'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{env.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-white/40 font-mono truncate">{env.url}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        env.status === 'Healthy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        env.status === 'Degraded' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>{env.status}</span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-white/30 hidden sm:inline">{env.success_rate}% pass</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

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
