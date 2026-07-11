import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bug, Search, Filter, Plus, Trash2, ExternalLink, ShieldAlert, CheckCircle2, Clock, AlertTriangle, ChevronRight, Save } from "lucide-react";
import { useApp, type Defect } from "@/lib/store";
import { PageSkeleton } from "@/components/page-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/app/defects")({
  component: DefectsPage,
  head: () => ({ meta: [{ title: "Defect Tracker — Speclane" }] }),
});

function DefectsPage() {
  const { defects, projects, fetchData, loading } = useApp();
  const [projectId, setProjectId] = useState("all");
  const [q, setQ] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  // State for Create/View Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingDefect, setViewingDefect] = useState<Defect | null>(null);
  const [newDefect, setNewDefect] = useState({
    project_id: "",
    title: "",
    description: "",
    severity: "Major" as const,
  });
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (projects.length > 0 && !newDefect.project_id) {
      setNewDefect(prev => ({ ...prev, project_id: projects[0].id }));
    }
  }, [projects, newDefect.project_id]);

  const filteredDefects = useMemo(() => defects.filter(d => {
    if (projectId !== "all" && d.project_id !== projectId) return false;
    if (severityFilter !== "all" && d.severity !== severityFilter) return false;
    if (q && !`${d.title} ${d.description}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [defects, projectId, severityFilter, q]);

  const handleCreate = async () => {
    if (!newDefect.title || !newDefect.project_id) return toast.error("Please fill in required fields");
    setSubmitting(true);
    try {
      await api.post("/defects", newDefect);
      toast.success("Defect logged successfully");
      setIsCreateOpen(false);
      setNewDefect({ project_id: projects[0]?.id || "", title: "", description: "", severity: "Major" });
      await fetchData();
    } catch (err) {
      toast.error("Failed to log defect");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!viewingDefect) return;
    setUpdatingStatus(true);
    try {
      await api.patch(`/defects/${viewingDefect.id}`, { status: newStatus });
      toast.success(`Defect marked as ${newStatus}`);
      await fetchData();
      setViewingDefect(prev => prev ? { ...prev, status: newStatus as any } : null);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "Critical": return <Badge className="bg-red-500/15 text-red-500 border-red-500/30">CRITICAL</Badge>;
      case "Major": return <Badge className="bg-orange-500/15 text-orange-500 border-orange-500/30">MAJOR</Badge>;
      case "Minor": return <Badge className="bg-primary/15 text-primary border-primary/30">MINOR</Badge>;
      default: return <Badge variant="outline">{sev}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open": return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case "Fixed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "In Progress": return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <div className="h-4 w-4 rounded-full border border-muted-foreground" />;
    }
  };

  if (loading) {
    return <PageSkeleton cards={4} rows={8} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl relative">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1">Defect Tracker</h1>
          <p className="text-muted-foreground text-sm">Monitor and resolve quality issues across your AI-generated test plans.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-48 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#14120B] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-bg text-primary-foreground font-bold rounded-full px-6 shadow-none">
                <Plus className="mr-2 h-4 w-4" /> Create Defect
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#14120B] border-white/10 text-white sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Bug className="text-primary h-6 w-6" /> Log New Defect
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={newDefect.project_id} onValueChange={(v) => setNewDefect({...newDefect, project_id: v})}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#14120B] border-white/10 text-white">
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Defect Title</Label>
                  <Input 
                    placeholder="e.g. Login page fails on mobile" 
                    className="bg-white/5 border-white/10"
                    value={newDefect.title}
                    onChange={(e) => setNewDefect({...newDefect, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select value={newDefect.severity} onValueChange={(v: any) => setNewDefect({...newDefect, severity: v})}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#14120B] border-white/10 text-white">
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="Major">Major</SelectItem>
                        <SelectItem value="Minor">Minor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe the bug and how to reproduce it..." 
                    className="bg-white/5 border-white/10 min-h-[120px]"
                    value={newDefect.description}
                    onChange={(e) => setNewDefect({...newDefect, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="text-white/50 hover:text-white">Cancel</Button>
                <Button onClick={handleCreate} disabled={submitting} className="gradient-bg text-primary-foreground font-bold shadow-none rounded-full px-6">
                  {submitting ? "Logging..." : "Log Defect"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 relative z-10">
        <Card className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 transition-all duration-300 hover:-translate-y-2 hover:border-primary">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Defects</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-slate-900 dark:text-white">{defects.length}</div></CardContent>
        </Card>
        <Card className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 border-l-red-500/50 transition-all duration-300 hover:-translate-y-2 hover:border-primary">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Open</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-red-500">{defects.filter(d => d.status === "Open").length}</div></CardContent>
        </Card>
        <Card className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 border-l-green-500/50 transition-all duration-300 hover:-translate-y-2 hover:border-primary">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resolved</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-500">{defects.filter(d => d.status === "Fixed").length}</div></CardContent>
        </Card>
        <Card className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 border-l-primary/50 transition-all duration-300 hover:-translate-y-2 hover:border-primary">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">In Progress</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-primary">{defects.filter(d => d.status === "In Progress").length}</div></CardContent>
        </Card>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-6 shadow-none relative z-10">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title or description..." 
              className="pl-10 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white" 
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#14120B] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="Major">Major</SelectItem>
              <SelectItem value="Minor">Minor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Defect</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Severity</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Project</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date Reported</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDefects.map((d) => (
                <TableRow key={d.id} className="border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] group transition-colors cursor-pointer" onClick={() => setViewingDefect(d)}>
                  <TableCell className="py-4">
                    <div className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">{d.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{d.description}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-white/70">
                      {getStatusIcon(d.status)}
                      {d.status}
                    </div>
                  </TableCell>
                  <TableCell>{getSeverityBadge(d.severity)}</TableCell>
                  <TableCell>
                    <div className="text-xs font-mono text-muted-foreground">
                      {projects.find(p => p.id === d.project_id)?.name || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDefects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-muted-foreground italic">
                    No defects found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Defect Details Sheet */}
      <Sheet open={!!viewingDefect} onOpenChange={(o) => !o && setViewingDefect(null)}>
        <SheetContent className="bg-[#14120B] border-white/10 text-white sm:max-w-[500px]">
          <SheetHeader className="mb-8">
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-2">
              <Bug className="h-4 w-4" /> Defect Details
            </div>
            <SheetTitle className="text-3xl font-black text-white">{viewingDefect?.title}</SheetTitle>
            <div className="flex items-center gap-3 mt-4">
              {viewingDefect && getSeverityBadge(viewingDefect.severity)}
              <Badge variant="outline" className="border-white/10 bg-white/5 text-white/70">{viewingDefect?.status}</Badge>
            </div>
          </SheetHeader>
          
          <div className="space-y-8">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Update Lifecycle</h4>
              <div className="flex items-center gap-3">
                 <Select value={viewingDefect?.status} onValueChange={handleUpdateStatus} disabled={updatingStatus}>
                   <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl flex-1">
                     <SelectValue placeholder="Set Status" />
                   </SelectTrigger>
                   <SelectContent className="bg-[#14120B] border-white/10 text-white">
                     <SelectItem value="Open">Open</SelectItem>
                     <SelectItem value="In Progress">In Progress</SelectItem>
                     <SelectItem value="Fixed">Fixed</SelectItem>
                     <SelectItem value="Closed">Closed</SelectItem>
                   </SelectContent>
                 </Select>
                 <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 ${updatingStatus ? 'animate-spin' : ''}`}>
                   {updatingStatus ? <Clock className="h-5 w-5 text-primary" /> : <Save className="h-5 w-5 text-white/40" />}
                 </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Description & Reproduction</h4>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                {viewingDefect?.description || "No description provided."}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Project</div>
                  <div className="text-sm font-bold truncate">{projects.find(p => p.id === viewingDefect?.project_id)?.name}</div>
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Date Reported</div>
                  <div className="text-sm font-bold">{viewingDefect && new Date(viewingDefect.created_at).toLocaleDateString()}</div>
               </div>
            </div>

            <div className="pt-8">
               <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 rounded-xl h-12" onClick={() => setViewingDefect(null)}>
                 Close Details
               </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
