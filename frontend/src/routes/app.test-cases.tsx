import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Download, Search, Loader2, Trash2, Pencil, FileText, FileSpreadsheet, Plus } from "lucide-react";
import { useApp, delay, type TestCase, type Priority, type TestType, type TestStatus } from "@/lib/store";
import { PageSkeleton } from "@/components/page-skeleton";
import { generateMockTestCases } from "@/lib/mock-generation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportCSV, exportPDF } from "@/lib/export";
import { toast } from "sonner";

export const Route = createFileRoute("/app/test-cases")({
  component: TestCasesPage,
  head: () => ({ meta: [{ title: "Test Case Generator — Speclane" }] }),
});

const typeStyle: Record<TestType, string> = {
  positive: "bg-success/15 text-success border-success/30",
  negative: "bg-destructive/15 text-destructive border-destructive/30",
  edge: "bg-warning/15 text-warning border-warning/30",
};
const priorityStyle: Record<Priority, string> = {
  High: "bg-destructive/15 text-destructive",
  Medium: "bg-warning/15 text-warning",
  Low: "bg-muted text-muted-foreground",
};

import { api } from "@/lib/api";

function TestCasesPage() {
  const navigate = useNavigate();
  const { projects, requirements, testCases, fetchData, loading, billing } = useApp();
  const [project_id, setProjectId] = useState<string>("all");
  const [q, setQ] = useState("");
  const [targetReqId, setTargetReqId] = useState<string>("all");
 
  const genLimit = billing?.plans?.find((p: any) => p.id === billing?.plan)?.limits?.monthlyGenerations ?? 1;
  const genUsage = billing?.usage?.monthlyGenerations ?? 0;
  const isGenLimitReached = genLimit !== -1 && genUsage >= genLimit;

  // Ensure data is loaded on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [filterType, setFilterType] = useState("all");
  const [filterPri, setFilterPri] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [skeletons, setSkeletons] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<TestCase | null>(null);

  const remove = async (id: string) => {
    if (!confirm("Delete this test case?")) return;
    try {
      await api.delete(`/test-cases/${id}`);
      await fetchData();
      toast.success("Deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const projectRequirements = useMemo(() => 
    requirements.filter(r => r.project_id === project_id), 
    [requirements, project_id]
  );

  const rows = useMemo(() => testCases.filter((t) => {
    if (project_id !== "all" && t.project_id !== project_id) return false;
    if (targetReqId !== "all") {
       const targetReq = projectRequirements.find(r => r.id === targetReqId);
       if (targetReq) {
         const m = t.module.toLowerCase();
         const rt = targetReq.title.toLowerCase();
         if (m !== rt && !m.includes(rt) && !rt.includes(m)) return false;
       }
    }
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterPri !== "all" && t.priority !== filterPri) return false;
    if (q && !`${t.title} ${t.module} ${t.expected}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [testCases, project_id, targetReqId, filterType, filterPri, q, projectRequirements]);

  const generate = async () => {
    const pid = project_id === "all" ? projects[0]?.id : project_id;
    if (!pid) return toast.error("Create a project first");
    
    setGenerating(true); 
    setSkeletons(8);
    try {
      // 1. Call Generation API with optional requirement_id
      await api.post('/generate', { 
        project_id: pid,
        requirement_id: targetReqId === "all" ? undefined : targetReqId
      });
      
      // 2. Refresh data
      await fetchData();
      toast.success("AI Generation Complete!");
    } catch (err: any) {
      if (err.code === 'billing_limit_exceeded') {
        toast.error("Generation Limit Reached", {
          description: "You've reached your monthly AI limit. Upgrade to keep generating.",
          action: {
            label: "Upgrade",
            onClick: () => navigate({ to: "/app/billing" })
          }
        });
      } else {
        toast.error(err.error || err.message || "Generation failed");
      }
    } finally {
      setGenerating(false); 
      setSkeletons(0);
    }
  };

  const toggleAll = (checked: boolean) => setSelected(checked ? new Set(rows.map((r) => r.id)) : new Set());
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} test cases?`)) return;
    try {
      await Promise.all(Array.from(selected).map(id => api.delete(`/test-cases/${id}`)));
      await fetchData();
      toast.success(`Deleted ${selected.size} test cases`);
      setSelected(new Set());
    } catch (err) {
      toast.error("Failed to delete some test cases");
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await api.patch(`/test-cases/${editing.id}`, editing);
      await fetchData();
      toast.success("Changes synced");
      setEditing(null);
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const addBlank = async () => {
    const pid = project_id === "all" ? (projects[0]?.id || "proj-default") : project_id;
    try {
      await api.post('/test-cases', { 
        project_id: pid, 
        module: "New", 
        title: "Untitled test case", 
        steps: "1. ", 
        expected: "", 
        type: "positive", 
        priority: "Medium", 
        status: "Pending" 
      });
      await api.post('/activity', {
        action: `Created new test case: Untitled test case`,
        category: 'Test Case',
        project_id: pid
      }).catch(() => {});
      await fetchData();
      toast.success("Added new test case row");
    } catch (err) {
      toast.error("Failed to add test case");
    }
  };

  const getTypeBadge = (type: string) => {
    switch(type) {
      case "positive": return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-500 dark:text-green-400 uppercase tracking-wider"><div className="w-1 h-1 rounded-full bg-green-500 dark:bg-green-400" />{type}</div>;
      case "negative": return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider"><div className="w-1 h-1 rounded-full bg-red-500 dark:bg-red-400" />{type}</div>;
      case "edge": return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider"><div className="w-1 h-1 rounded-full bg-yellow-500 dark:bg-yellow-400" />{type}</div>;
      default: return null;
    }
  };

  const getPriorityBadge = (pri: string) => {
    switch(pri) {
      case "High": return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />{pri}</div>;
      case "Medium": return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold text-yellow-400 uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />{pri}</div>;
      default: return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-white/30" />{pri}</div>;
    }
  };

  if (loading) {
    return <PageSkeleton cards={3} rows={10} />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-[100rem] relative">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1">Test Case Generator</h1>
          <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">AI-generated, editable, exportable test plans for your repository.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={project_id} onValueChange={setProjectId}>
            <SelectTrigger className="w-40 sm:w-48 h-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-full focus:ring-primary/20">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
              <SelectItem value="all" className="focus:bg-slate-50 dark:focus:bg-white/10">All projects</SelectItem>
              {projects.map((p) => <SelectItem key={p.id} value={p.id} className="focus:bg-slate-50 dark:focus:bg-white/10">{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          
          <Select value={targetReqId} onValueChange={setTargetReqId}>
            <SelectTrigger className="w-48 sm:w-56 h-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-full focus:ring-primary/20">
              <SelectValue placeholder="Target Module" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl max-h-[300px]">
              <SelectItem value="all" className="focus:bg-slate-50 dark:focus:bg-white/10 font-medium">All requirements</SelectItem>
              {projectRequirements.map((r) => (
                <SelectItem key={r.id} value={r.id} className="focus:bg-slate-50 dark:focus:bg-white/10">
                  {r.title}
                </SelectItem>
              ))}
              {projectRequirements.length === 0 && (
                <div className="px-2 py-3 text-center text-xs text-muted-foreground">No requirements found</div>
              )}
            </SelectContent>
          </Select>
          {isGenLimitReached ? (
            <Link to="/app/billing">
              <Button className="gradient-bg text-primary-foreground border border-primary/50 relative group overflow-hidden h-10 px-6 rounded-full font-semibold hover:scale-[1.02] transition-transform shadow-none">
                <Sparkles className="mr-2 h-4 w-4 relative z-10" /> 
                <span className="relative z-10">Upgrade for more AI</span>
              </Button>
            </Link>
          ) : (
            <Button onClick={generate} disabled={generating} className="gradient-bg text-primary-foreground border border-primary/50 relative group overflow-hidden h-10 px-6 rounded-full font-semibold hover:scale-[1.02] transition-transform shadow-none">
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin relative z-10" /> : <Sparkles className="mr-2 h-4 w-4 relative z-10" />}
              <span className="relative z-10">{generating ? "Generating…" : "Generate with AI"}</span>
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-4 shadow-none relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400 dark:text-white/40" />
            <Input 
              placeholder="Search test cases by title, module or result..." 
              className="pl-11 h-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 rounded-full" 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 h-10 bg-white/5 border-white/10 text-white rounded-full">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#14120B] border border-white/10 text-white">
                <SelectItem value="all" className="focus:bg-white/10 focus:text-white">All types</SelectItem>
                <SelectItem value="positive" className="focus:bg-white/10 focus:text-white">Positive</SelectItem>
                <SelectItem value="negative" className="focus:bg-white/10 focus:text-white">Negative</SelectItem>
                <SelectItem value="edge" className="focus:bg-white/10 focus:text-white">Edge</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPri} onValueChange={setFilterPri}>
              <SelectTrigger className="w-36 h-10 bg-white/5 border-white/10 text-white rounded-full">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-[#14120B] border border-white/10 text-white">
                <SelectItem value="all" className="focus:bg-white/10 focus:text-white">All priorities</SelectItem>
                <SelectItem value="High" className="focus:bg-white/10 focus:text-white">High</SelectItem>
                <SelectItem value="Medium" className="focus:bg-white/10 focus:text-white">Medium</SelectItem>
                <SelectItem value="Low" className="focus:bg-white/10 focus:text-white">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="h-6 w-px bg-white/10 mx-1 hidden md:block" />
            <Button variant="outline" size="sm" onClick={addBlank} className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-full h-10 px-4">
              <Plus className="mr-2 h-4 w-4" /> Add row
            </Button>
            {selected.size > 0 && (
              <Button variant="outline" size="sm" onClick={bulkDelete} className="border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-full h-10 px-4">
                <Trash2 className="mr-2 h-4 w-4" /> Delete ({selected.size})
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full h-10 px-4">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                <DropdownMenuItem onClick={() => exportPDF(rows)} className="focus:bg-slate-50 dark:focus:bg-white/10"><FileText className="mr-2 h-4 w-4" /> Export PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportCSV(rows)} className="focus:bg-slate-50 dark:focus:bg-white/10"><FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] overflow-hidden shadow-none relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="py-4 pl-6 w-12"><Checkbox checked={selected.size === rows.length && rows.length > 0} onCheckedChange={(v) => toggleAll(!!v)} className="border-slate-300 dark:border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" /></th>
                <th className="py-4 w-48 pr-4">Module</th>
                <th className="py-4">Test Scenario</th>
                <th className="py-4 w-56">Expected Outcome</th>
                <th className="py-4 w-32 pr-6">Type</th>
                <th className="py-4 w-28 pr-6">Priority</th>
                <th className="py-4 w-28">Status</th>
                <th className="py-4 pr-6 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {generating && Array.from({ length: skeletons }).map((_, i) => (
                <tr key={`sk-${i}`} className="animate-pulse">
                  <td className="py-6 pl-6"><Skeleton className="h-4 w-4 bg-slate-100 dark:bg-white/5" /></td>
                  <td className="py-6 pr-4"><Skeleton className="h-4 w-20 bg-slate-100 dark:bg-white/5" /></td>
                  <td className="py-6 pr-4"><Skeleton className="h-4 w-full bg-slate-100 dark:bg-white/5" /></td>
                  <td className="py-6 pr-4"><Skeleton className="h-4 w-full bg-slate-100 dark:bg-white/5" /></td>
                  <td className="py-6 pr-6"><Skeleton className="h-4 w-16 bg-slate-100 dark:bg-white/5" /></td>
                  <td className="py-6 pr-6"><Skeleton className="h-4 w-16 bg-slate-100 dark:bg-white/5" /></td>
                  <td className="py-6"><Skeleton className="h-4 w-16 bg-slate-100 dark:bg-white/5" /></td>
                  <td className="py-6 pr-6"><Skeleton className="h-4 w-10 bg-slate-100 dark:bg-white/5 ml-auto" /></td>
                </tr>
              ))}
              {rows.map((t) => (
                <tr key={t.id} className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors" onClick={() => setEditing(t)}>
                  <td className="py-5 pl-6" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.has(t.id)} onCheckedChange={() => toggleOne(t.id)} className="border-slate-300 dark:border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  </td>
                  <td className="py-5 pr-4">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-mono font-bold text-slate-500 dark:text-white/70 group-hover:text-primary group-hover:border-primary/30 transition-colors whitespace-nowrap max-w-[170px] truncate">
                      {t.module}
                    </div>
                  </td>
                  <td className="py-5 pr-4">
                    <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">{t.title}</div>
                    <div className="text-xs text-slate-400 dark:text-white/40 line-clamp-1 group-hover:text-slate-600 dark:group-hover:text-white/60 transition-colors">{t.steps}</div>
                  </td>
                  <td className="py-5 pr-4">
                    <div className="text-xs text-slate-500 dark:text-white/50 line-clamp-1">{t.expected}</div>
                  </td>
                  <td className="py-5 pr-6">{getTypeBadge(t.type)}</td>
                  <td className="py-5 pr-6">{getPriorityBadge(t.priority)}</td>
                  <td className="py-5">
                    <div className="flex items-center gap-2">
                       {t.status === "Passed" ? (
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                       ) : t.status === "Failed" ? (
                         <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                       ) : (
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/20" />
                       )}
                       <span className="text-[10px] font-bold text-slate-400 dark:text-white/50 uppercase tracking-wider">{t.status}</span>
                    </div>
                  </td>
                  <td className="py-5 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-full" onClick={() => setEditing(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-white/50 hover:text-red-400 hover:bg-red-500/20 rounded-full" onClick={() => remove(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!generating && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 border border-white/10 text-primary mx-auto mb-6 shadow-none">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No test cases generated</h3>
                    <p className="text-white/40 max-w-sm mx-auto">Select a project and click "Generate with AI" to build your automated test plan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full sm:max-w-xl bg-[#14120B] border-l border-white/10 text-white overflow-y-auto p-0 shadow-none">
          {/* Neon Border Accent */}
          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-transparent opacity-50" />

          <div className="p-8">
            <SheetHeader className="mb-8 text-left">
              <SheetTitle className="text-3xl font-black bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">Edit scenario</SheetTitle>
              <div className="h-1 w-12 bg-primary rounded-full mt-2" />
            </SheetHeader>

            {editing && (
              <div className="space-y-8 relative z-10">
                {/* General Info Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3 bg-primary rounded-full" />
                    <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Context & Identity</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-500 dark:text-white/50 text-[11px] font-bold uppercase tracking-wider ml-1">Scenario Title</Label>
                    <Input 
                      value={editing.title} 
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })} 
                      className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 focus:ring-primary/20 focus:border-primary/50 transition-all rounded-xl placeholder:text-slate-400 dark:placeholder:text-white/20"
                      placeholder="e.g. Verify user login with valid credentials"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-500 dark:text-white/50 text-[11px] font-bold uppercase tracking-wider ml-1">Module</Label>
                      <Input 
                        value={editing.module} 
                        onChange={(e) => setEditing({ ...editing, module: e.target.value })} 
                        className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 focus:ring-primary/20 focus:border-primary/50 rounded-xl font-mono text-xs uppercase tracking-widest"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500 dark:text-white/50 text-[11px] font-bold uppercase tracking-wider ml-1">Test Type</Label>
                      <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as TestType })}>
                        <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 focus:ring-primary/20 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl shadow-2xl">
                          <SelectItem value="positive" className="focus:bg-slate-50 dark:focus:bg-white/10">Positive</SelectItem>
                          <SelectItem value="negative" className="focus:bg-slate-50 dark:focus:bg-white/10">Negative</SelectItem>
                          <SelectItem value="edge" className="focus:bg-slate-50 dark:focus:bg-white/10">Edge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Execution Params Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3 bg-yellow-500 rounded-full" />
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">Execution Parameters</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-500 dark:text-white/50 text-[11px] font-bold uppercase tracking-wider ml-1">Priority</Label>
                      <Select value={editing.priority} onValueChange={(v) => setEditing({ ...editing, priority: v as Priority })}>
                        <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 focus:ring-primary/20 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl shadow-2xl">
                          <SelectItem value="High" className="focus:bg-slate-50 dark:focus:bg-white/10 text-red-500 dark:text-red-400">High</SelectItem>
                          <SelectItem value="Medium" className="focus:bg-slate-50 dark:focus:bg-white/10 text-yellow-600 dark:text-yellow-400">Medium</SelectItem>
                          <SelectItem value="Low" className="focus:bg-slate-50 dark:focus:bg-white/10 text-slate-400 dark:text-white/40">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500 dark:text-white/50 text-[11px] font-bold uppercase tracking-wider ml-1">Status</Label>
                        <Select value={editing.status} onValueChange={(v) => {
                          setEditing({ ...editing, status: v as TestStatus });
                          if (v === "Failed") {
                            // Automatically suggest creating a defect
                            toast("Test Failed! Log a defect?", {
                              duration: 10000,
                              action: {
                                label: "Create",
                                onClick: () => {
                                  api.post('/defects', {
                                    project_id: editing.project_id,
                                    test_case_id: editing.id,
                                    title: `Defect: ${editing.title}`,
                                    description: `Test Case Failed.\nSteps:\n${editing.steps}\n\nExpected: ${editing.expected}`,
                                    severity: "Major"
                                  }).then(async () => {
                                    toast.success("Defect logged in tracker");
                                    await api.post('/activity', {
                                      action: `Logged defect BUG-${editing.id.slice(-4)}: ${editing.title}`,
                                      category: 'Defect',
                                      project_id: editing.project_id
                                    }).catch(() => {});
                                    await api.post('/notifications', {
                                      title: `New Defect Logged`,
                                      message: `BUG-${editing.id.slice(-4)}: ${editing.title} failed verification in ${editing.module} module.`,
                                      type: 'defect',
                                      project_id: editing.project_id
                                    }).catch(() => {});
                                    await delay(500);
                                    fetchData();
                                  });
                                }
                              }
                            });
                          }
                        }}>
                        <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 focus:ring-primary/20 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl shadow-2xl">
                          <SelectItem value="Pending" className="focus:bg-slate-50 dark:focus:bg-white/10">Pending</SelectItem>
                          <SelectItem value="Passed" className="focus:bg-slate-50 dark:focus:bg-white/10 text-green-600 dark:text-green-400">Passed</SelectItem>
                          <SelectItem value="Failed" className="focus:bg-slate-50 dark:focus:bg-white/10 text-red-500 dark:text-red-400">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Technical Steps Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3 bg-green-500 rounded-full" />
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">Technical Flow</h4>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-500 dark:text-white/50 text-[11px] font-bold uppercase tracking-wider ml-1">Reproduction Steps</Label>
                    <Textarea 
                      rows={6} 
                      value={editing.steps} 
                      onChange={(e) => setEditing({ ...editing, steps: e.target.value })} 
                      className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-primary/20 focus:border-primary/50 resize-none leading-relaxed rounded-xl font-mono text-xs text-slate-600 dark:text-white/70" 
                      placeholder="1. Navigate to /login..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-500 dark:text-white/50 text-[11px] font-bold uppercase tracking-wider ml-1">Expected Outcome</Label>
                    <Textarea 
                      rows={3} 
                      value={editing.expected} 
                      onChange={(e) => setEditing({ ...editing, expected: e.target.value })} 
                      className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-primary/20 focus:border-primary/50 resize-none leading-relaxed rounded-xl text-sm" 
                      placeholder="Successful redirection to dashboard..."
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-12 flex items-center justify-end gap-3 pb-8">
              <Button 
                variant="outline" 
                onClick={() => setEditing(null)} 
                className="border-slate-200 dark:border-white/10 bg-transparent text-slate-400 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-full h-12 px-8 font-bold text-xs uppercase tracking-widest transition-all"
              >
                Cancel
              </Button>
              <Button 
                className="gradient-bg text-primary-foreground rounded-full h-12 px-10 font-black text-xs uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-none" 
                onClick={saveEdit}
              >
                Sync Changes
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
