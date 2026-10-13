import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Server, Globe, CheckCircle2, AlertTriangle, RefreshCw, Terminal, ExternalLink, Activity, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/environments")({
  component: EnvironmentsPage,
});

function EnvironmentsPage() {
  const environments = useApp((s) => s.environments);
  const addEnvironment = useApp((s) => s.addEnvironment);
  const deleteEnvironment = useApp((s) => s.deleteEnvironment);
  const triggerCheck = useApp((s) => s.triggerEnvironmentCheck);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [newEnv, setNewEnv] = useState({ name: "", type: "Staging" as const, url: "" });

  const filteredEnvs = environments.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.url.toLowerCase().includes(search.toLowerCase()));

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
      toast.success(`Cluster verified: ${updated.last_verified}`);
    } else {
      toast.warning(`Cluster status: ${updated?.status} (${updated?.last_verified})`);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl relative">

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
                      : "bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-spin"
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

            <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-white/50 font-mono">
              <span className="truncate max-w-[200px]" title={env.last_verified}>Probe: {env.last_verified}</span>
              <div className="flex items-center gap-2">
                <Button onClick={() => handleTriggerCheck(env)} variant="outline" size="sm" className="rounded-full px-4 h-8 text-xs font-bold border-primary/40 text-primary hover:bg-primary hover:text-white transition-all">
                  <RefreshCw className="h-3 w-3 mr-1.5" /> Trigger Health Check
                </Button>
                <Button onClick={() => deleteEnvironment(env.id)} variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500 text-slate-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
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
