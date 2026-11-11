import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useApp, type Priority, type ReqStatus } from "@/lib/store";
import { PageSkeleton } from "@/components/page-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/app/requirements")({
  component: RequirementsPage,
  head: () => ({ meta: [{ title: "Requirements — Speclane" }] }),
});

const priorityStyle: Record<Priority, string> = {
  High: "bg-destructive/15 text-destructive",
  Medium: "bg-warning/15 text-warning",
  Low: "bg-muted text-muted-foreground",
};
const statusStyle: Record<ReqStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Approved: "bg-primary/15 text-primary",
  Implemented: "bg-success/15 text-success",
};

import { api } from "@/lib/api";

function RequirementsPage() {
  const { requirements, projects, user, fetchData, loading } = useApp();

  // Ensure data is loaded on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [project_id, setProjectId] = useState<string>("all");
  const [q, setQ] = useState("");
  const [filterPri, setFilterPri] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "Medium" as Priority, status: "Draft" as ReqStatus, project_id: "" });

  const filtered = useMemo(() => requirements.filter((r) => {
    if (project_id !== "all" && r.project_id !== project_id) return false;
    if (q && !`${r.title} ${r.description}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (filterPri !== "all" && r.priority !== filterPri) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  }), [requirements, q, filterPri, filterStatus, project_id]);

  const openNew = () => {
    setEditId(null);
    // Auto-select the current filter project, or the first available project
    const defaultProject = project_id !== "all" ? project_id : (projects.length > 0 ? projects[0].id : "");
    setForm({
      title: "",
      description: "",
      priority: "Medium",
      status: "Draft",
      project_id: defaultProject
    });
    setOpen(true);
  };
  const openEdit = (id: string) => {
    const r = requirements.find((x) => x.id === id);
    if (!r) return;
    setEditId(id); setForm({ title: r.title, description: r.description, priority: r.priority, status: r.status, project_id: r.project_id || "" }); setOpen(true);
  };
  const save = async () => {
    if (!form.title) return toast.error("Title is required");
    if (!form.project_id && projects.length === 0) {
      return toast.error("Please create a project first before adding requirements.");
    }
    try {
      const payload = {
        ...form,
        project_id: form.project_id || (projects.length > 0 ? projects[0].id : null)
      };

      const actorName = user?.name || user?.email?.split('@')[0] || 'Team member';
      const actorMeta = {
        actor_name: actorName,
        actor_avatar: user?.avatar || '',
        actor_email: user?.email || '',
      };

      if (editId) {
        await api.patch(`/requirements/${editId}`, payload);
        await api.post('/activity', {
          action: `${actorName} updated requirement: ${form.title}`,
          category: 'Requirement',
          project_id: form.project_id || null
        }).catch(() => {});
        await api.post('/notifications', {
          title: "Requirement Updated",
          message: `${actorName} updated requirement specification "${form.title.substring(0, 50)}".`,
          type: "info",
          project_id: form.project_id || null,
          ...actorMeta
        }).catch(() => {});
        toast.success("Updated");
      }
      else {
        await api.post('/requirements', payload);
        await api.post('/activity', {
          action: `${actorName} added requirement: ${form.title}`,
          category: 'Requirement',
          project_id: form.project_id || null
        }).catch(() => {});
        await api.post('/notifications', {
          title: "Requirement Registered",
          message: `${actorName} registered new specification "${form.title.substring(0, 50)}" for AI analysis.`,
          type: "success",
          project_id: form.project_id || null,
          ...actorMeta
        }).catch(() => {});
        toast.success("Requirement added");
      }
      setOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save requirement");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this requirement?")) return;
    try {
      const reqTarget = requirements.find((r) => r.id === id);
      await api.delete(`/requirements/${id}`);
      await api.post('/activity', {
        action: `Deleted requirement ${reqTarget ? reqTarget.title : id}`,
        category: 'Requirement',
        project_id: reqTarget?.project_id || null
      }).catch(() => {});
      await fetchData();
      toast.success("Deleted");
    } catch (err: any) {
      toast.error("Failed to delete");
    }
  };

  const getPriorityBadge = (pri: string) => {
    switch (pri) {
      case "High": return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)] animate-pulse" /><span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{pri}</span></div>;
      case "Medium": return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]" /><span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">{pri}</span></div>;
      default: return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/40" /><span className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">{pri}</span></div>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "Implemented": return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /><span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">{st}</span></div>;
      case "Approved": return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20"><div className="w-1.5 h-1.5 rounded-full bg-primary" /><span className="text-[10px] font-bold text-primary uppercase tracking-wider">{st}</span></div>;
      default: return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/40" /><span className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">{st}</span></div>;
    }
  };

  if (loading) {
    return <PageSkeleton cards={3} rows={8} />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl relative">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1">Requirements</h1>
          <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">Centralize your product specs and link them to AI test generation.</p>
        </div>
        <Button onClick={openNew} className="gradient-bg text-primary-foreground border border-primary/50 relative group overflow-hidden h-10 px-6 rounded-full font-semibold hover:scale-[1.02] transition-transform shadow-none">
          <Plus className="mr-2 h-4 w-4 relative z-10" />
          <span className="relative z-10">Add requirement</span>
        </Button>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-4 shadow-none relative z-10">
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
          <div className="relative flex-1 w-full min-w-[250px]">
            <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400 dark:text-white/40" />
            <Input
              placeholder="Search by title or description..."
              className="pl-11 h-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 rounded-full"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={project_id} onValueChange={setProjectId}>
              <SelectTrigger className="w-full sm:w-48 h-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-full focus:ring-primary/20">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                <SelectItem value="all" className="focus:bg-slate-50 dark:focus:bg-white/10">All Projects</SelectItem>
                {projects.map((p) => <SelectItem key={p.id} value={p.id} className="focus:bg-slate-50 dark:focus:bg-white/10">{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPri} onValueChange={setFilterPri}>
              <SelectTrigger className="w-full sm:w-40 h-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-full focus:ring-primary/20">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                <SelectItem value="all" className="focus:bg-slate-50 dark:focus:bg-white/10">All priorities</SelectItem>
                <SelectItem value="High" className="focus:bg-slate-50 dark:focus:bg-white/10 text-red-500">High</SelectItem>
                <SelectItem value="Medium" className="focus:bg-slate-50 dark:focus:bg-white/10 text-yellow-500">Medium</SelectItem>
                <SelectItem value="Low" className="focus:bg-slate-50 dark:focus:bg-white/10 text-slate-400">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40 h-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-full focus:ring-primary/20">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                <SelectItem value="all" className="focus:bg-slate-50 dark:focus:bg-white/10">All statuses</SelectItem>
                <SelectItem value="Draft" className="focus:bg-slate-50 dark:focus:bg-white/10">Draft</SelectItem>
                <SelectItem value="Approved" className="focus:bg-slate-50 dark:focus:bg-white/10 text-primary">Approved</SelectItem>
                <SelectItem value="Implemented" className="focus:bg-slate-50 dark:focus:bg-white/10 text-green-500">Implemented</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] overflow-hidden shadow-none relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="py-4 pl-6 w-24">ID</th>
                <th className="py-4">Requirement Details</th>
                <th className="py-4 w-32">Priority</th>
                <th className="py-4 w-36">Status</th>
                <th className="py-4 pr-6 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map((r, i) => (
                <tr key={r.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                  <td className="py-4 pl-6">
                    <div className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-[10px] font-bold text-slate-500 dark:text-white/50">
                      REQ-{String(i + 1).padStart(3, "0")}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="font-bold text-slate-900 dark:text-white mb-1">{r.title}</div>
                    <div className="text-xs text-slate-500 dark:text-white/50 line-clamp-1 max-w-xl leading-relaxed">{r.description}</div>
                  </td>
                  <td className="py-4">{getPriorityBadge(r.priority)}</td>
                  <td className="py-4">{getStatusBadge(r.status)}</td>
                  <td className="py-4 pr-6 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-full" onClick={() => openEdit(r.id)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 dark:text-white/50 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full" onClick={() => remove(r.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-300 dark:text-white/20 mb-4 shadow-none">
                <Search className="h-8 w-8" />
              </div>
              <p className="text-slate-500 dark:text-white/50">No requirements match your current filters.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-3xl shadow-none max-w-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          <DialogHeader className="mb-2">
            <DialogTitle className="text-2xl font-bold">{editId ? "Edit requirement" : "New requirement"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-600 dark:text-white/70 font-medium">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 h-11 rounded-xl"
                placeholder="Feature title..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 dark:text-white/70 font-medium">Description</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 resize-none rounded-xl"
                placeholder="Detailed context for test generation..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-600 dark:text-white/70 font-medium">Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                  <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-primary/20 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                    <SelectItem value="High" className="focus:bg-slate-50 dark:focus:bg-white/10">High</SelectItem>
                    <SelectItem value="Medium" className="focus:bg-slate-50 dark:focus:bg-white/10">Medium</SelectItem>
                    <SelectItem value="Low" className="focus:bg-slate-50 dark:focus:bg-white/10">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 dark:text-white/70 font-medium">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ReqStatus })}>
                  <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-primary/20 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                    <SelectItem value="Draft" className="focus:bg-slate-50 dark:focus:bg-white/10">Draft</SelectItem>
                    <SelectItem value="Approved" className="focus:bg-slate-50 dark:focus:bg-white/10">Approved</SelectItem>
                    <SelectItem value="Implemented" className="focus:bg-slate-50 dark:focus:bg-white/10">Implemented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 dark:text-white/70 font-medium">Linked Project</Label>
              <Select value={form.project_id || "none"} onValueChange={(v) => setForm({ ...form, project_id: v === "none" ? "" : v })}>
                <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-primary/20 h-11 rounded-xl">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-h-[200px] rounded-xl shadow-2xl">
                  {projects.length > 0 ? (
                    projects.map((p) => <SelectItem key={p.id} value={p.id} className="focus:bg-slate-50 dark:focus:bg-white/10">{p.name}</SelectItem>)
                  ) : (
                    <SelectItem value="none" disabled className="focus:bg-slate-50 dark:focus:bg-white/10 text-muted-foreground">No projects — create one first</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-200 dark:border-white/10 bg-transparent text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 rounded-full h-11 px-8 font-bold shadow-none">Cancel</Button>
            <Button onClick={save} className="gradient-bg text-primary-foreground rounded-full h-11 px-8 font-bold shadow-none">Save Requirement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
