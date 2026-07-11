import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Calendar, CheckCircle2, XCircle, AlertCircle, Clock, Filter, ArrowRight, Layers, Trash2, FolderGit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/app/test-plans")({
  component: TestPlansPage,
});

function TestPlansPage() {
  const navigate = useNavigate();
  const testPlans = useApp((s) => s.testPlans);
  const testCases = useApp((s) => s.testCases);
  const projects = useApp((s) => s.projects);
  const addTestPlan = useApp((s) => s.addTestPlan);
  const deleteTestPlan = useApp((s) => s.deleteTestPlan);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: "", sprint: "", start_date: "", end_date: "", project_id: "" });

  const filteredPlans = testPlans.filter((p) => {
    const matchQuery = p.name.toLowerCase().includes(search.toLowerCase()) || p.sprint.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || p.status.toUpperCase() === filterStatus;
    const matchProject = selectedProjectId === "all" || p.project_id === selectedProjectId;
    return matchQuery && matchStatus && matchProject;
  });

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.sprint) return;
    const targetProject = newPlan.project_id || (projects[0]?.id ?? "");
    await addTestPlan({
      ...newPlan,
      project_id: targetProject
    });
    setIsOpen(false);
    setNewPlan({ name: "", sprint: "", start_date: "", end_date: "", project_id: "" });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1 flex items-center gap-3">
            <Layers className="h-8 w-8 text-primary" /> Test Plans & Milestones
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">
            Group test cases per sprint, release cycle, or major verification milestone. Fully scoped by project.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {projects.length > 0 && (
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-48 h-10 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-full font-medium text-xs">
                <FolderGit2 className="mr-2 h-4 w-4 text-primary" />
                <SelectValue placeholder="Filter Project" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                <SelectItem value="all" className="focus:bg-slate-50 dark:focus:bg-white/10 text-xs font-bold">All Projects ({testPlans.length})</SelectItem>
                {projects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id} className="focus:bg-slate-50 dark:focus:bg-white/10 text-xs font-medium">
                    {proj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full h-10 px-6 shadow-none hover:scale-105 transition-all flex items-center gap-2 font-semibold text-sm">
                <Plus className="h-4 w-4" /> Create Test Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl glass-strong border-white/10 p-6 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">New Test Plan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePlan} className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-white/70">Target Project</label>
                  <Select value={newPlan.project_id || (projects[0]?.id ?? "")} onValueChange={(v) => setNewPlan({ ...newPlan, project_id: v })}>
                    <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl h-11">
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl shadow-2xl">
                      {projects.map((proj) => (
                        <SelectItem key={proj.id} value={proj.id} className="focus:bg-slate-50 dark:focus:bg-white/10 text-xs font-medium">
                          {proj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-white/70">Plan Name</label>
                  <Input
                    placeholder="e.g. Sprint 44 Core Regression"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white h-11"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-white/70">Sprint / Milestone</label>
                  <Input
                    placeholder="e.g. Sprint 44"
                    value={newPlan.sprint}
                    onChange={(e) => setNewPlan({ ...newPlan, sprint: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white h-11"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-white/70">Start Date</label>
                    <Input
                      type="date"
                      value={newPlan.start_date}
                      onChange={(e) => setNewPlan({ ...newPlan, start_date: e.target.value })}
                      className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white h-11 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-white/70">End Date</label>
                    <Input
                      type="date"
                      value={newPlan.end_date}
                      onChange={(e) => setNewPlan({ ...newPlan, end_date: e.target.value })}
                      className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white h-11 font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-full border-slate-200 dark:border-white/10 text-xs font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-full shadow-none text-xs font-bold">
                    Create Plan
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-[#14120B] p-2 sm:px-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-none relative z-10">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plans or sprints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-sm focus-visible:ring-primary/20 text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0">
          <Filter className="h-4 w-4 text-slate-400 shrink-0 mx-2" />
          {["ALL", "IN PROGRESS", "PLANNED", "COMPLETED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === status
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {filteredPlans.map((plan) => {
          const planProject = projects.find(p => p.id === plan.project_id) || projects[0];
          const planCases = testCases.filter(t => t.project_id === planProject?.id);

          const livePassed = planCases.filter((t) => t.status === "Passed").length;
          const liveFailed = planCases.filter((t) => t.status === "Failed").length;
          const liveUntested = planCases.filter((t) => t.status !== "Passed" && t.status !== "Failed").length;
          const liveTotal = planCases.length > 0 ? planCases.length : 1;
          const livePassPercent = Math.round((livePassed / liveTotal) * 100);
          const liveFailPercent = Math.round((liveFailed / liveTotal) * 100);
          const liveUntestedPercent = Math.round((liveUntested / liveTotal) * 100);

          return (
            <div
              key={plan.id}
              className="group bg-white dark:bg-[#14120B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none hover:border-primary hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none rounded-bl-full" />
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wide bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/80 border border-slate-200 dark:border-white/10">
                    {plan.sprint}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      plan.status === "In Progress"
                        ? "bg-primary/10 text-primary border border-primary/20 animate-pulse"
                        : plan.status === "Completed"
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        plan.status === "In Progress" ? "bg-primary" : plan.status === "Completed" ? "bg-green-500" : "bg-amber-500"
                      }`}
                    />
                    {plan.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors tracking-tight">
                  {plan.name}
                </h3>
                <div className="text-xs text-primary/80 dark:text-primary/60 font-medium mb-4 flex items-center gap-1.5">
                  <FolderGit2 className="h-3.5 w-3.5" /> Project: {planProject?.name || "Default Project"}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-white/50 mb-6 font-medium">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {plan.start_date} → {plan.end_date}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-primary font-bold">
                    <Clock className="h-3.5 w-3.5 text-slate-400" /> {planCases.length} Scenarios Mapped
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 mb-6 font-mono">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-white/70 font-sans font-bold">Execution Progress</span>
                    <span className="text-primary font-bold">{livePassPercent}% Passed</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden flex">
                    <div style={{ width: `${livePassPercent}%` }} className="bg-green-500 transition-all duration-500" />
                    <div style={{ width: `${liveFailPercent}%` }} className="bg-red-500 transition-all duration-500" />
                    <div style={{ width: `${liveUntestedPercent}%` }} className="bg-slate-300 dark:bg-white/20 transition-all duration-500" />
                  </div>
                </div>

                {/* Case counts breakdown */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-200 dark:border-white/10 mb-6 font-mono">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-green-500/5 text-green-500 border border-green-500/10">
                    <CheckCircle2 className="h-4 w-4 mb-1" />
                    <span className="text-lg font-black">{livePassed}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 font-sans">Passed</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-red-500/5 text-red-500 border border-red-500/10">
                    <XCircle className="h-4 w-4 mb-1" />
                    <span className="text-lg font-black">{liveFailed}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 font-sans">Failed</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-slate-500/5 text-slate-500 dark:text-white/60 border border-slate-500/10">
                    <AlertCircle className="h-4 w-4 mb-1" />
                    <span className="text-lg font-black">{liveUntested}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 font-sans">Untested</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400 dark:text-white/40 font-mono">ID: {plan.id}</span>
                <div className="flex items-center gap-2">
                  <Button onClick={() => navigate({ to: "/app/test-cases" })} variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 hover:text-primary font-bold text-xs gap-1">
                    View Execution Suite <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button onClick={() => deleteTestPlan(plan.id)} variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500 text-slate-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredPlans.length === 0 && (
          <div className="col-span-full p-16 text-center text-sm text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 rounded-3xl bg-white dark:bg-[#14120B] shadow-none">
            <Layers className="h-10 w-10 text-slate-300 dark:text-white/20 mx-auto mb-3" />
            <p>No test plans found for selected project. Click "Create Test Plan" above to start one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
