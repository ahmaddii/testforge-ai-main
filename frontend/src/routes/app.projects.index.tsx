import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Github, MoreHorizontal, FolderGit2, FlaskConical, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { PageSkeleton } from "@/components/page-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/app/projects/")({
  component: ProjectsPage,
  head: () => ({ meta: [{ title: "Projects — Speclane" }] }),
});

import { api } from "@/lib/api";

function ProjectsPage() {
  const navigate = useNavigate();
  const projects = useApp((s) => s.projects);
  const fetchData = useApp((s) => s.fetchData);
  const appLoading = useApp((s) => s.loading);
  const billing = useApp((s) => s.billing);

  const projectLimit = billing?.plans?.find((p: any) => p.id === billing?.plan)?.limits?.projects ?? 1;
  const isLimitReached = projectLimit !== -1 && projects.length >= projectLimit;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [repo, setRepo] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [acceptedLicense, setAcceptedLicense] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStatus, setInstallStatus] = useState("Extracting engine...");


  useEffect(() => {
    const onboarded = localStorage.getItem("speclane_onboarded");
    if (!onboarded) {
      setShowWizard(true);
    }
  }, []);

  const startInstallation = () => {
    setWizardStep(3);
    setInstallProgress(0);
    setInstallStatus("Extracting engine...");

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        setInstallProgress(100);
        setInstallStatus("Installation successful!");
        clearInterval(interval);
      } else {
        setInstallProgress(progress);
        if (progress < 25) {
          setInstallStatus("Extracting Speclane test engine...");
        } else if (progress < 50) {
          setInstallStatus("Configuring AI agents and requirements mapper...");
        } else if (progress < 75) {
          setInstallStatus("Verifying sandbox runner connections...");
        } else {
          setInstallStatus("Optimizing workspace parameters...");
        }
      }
    }, 250);
  };

  const finishWizard = () => {
    localStorage.setItem("speclane_onboarded", "true");
    setShowWizard(false);
  };

  const create = async () => {
    if (!name || !repo) return toast.error("Name and repo URL are required");
    setLoading(true);
    try {
      const res = await api.post('/projects', {
        name,
        repo_url: repo,
        description: desc,
        status: "Active"
      });
      await api.post('/activity', {
        action: `Created new project workspace: ${name}`,
        category: 'Project',
        project_id: res?.id
      }).catch(() => { });
      await api.post('/notifications', {
        title: "Project Workspace Created",
        message: `Successfully connected repository "${repo}" for automated QA.`,
        type: "success",
        project_id: res?.id
      }).catch(() => { });
      toast.success("Project created");
      setName(""); setRepo(""); setDesc(""); setOpen(false);
      fetchData().catch(console.error);
      if (res?.id) {
        navigate({ to: "/app/projects/$projectId", params: { projectId: res.id } });
      }
    } catch (err: any) {
      if (err.code === 'billing_limit_exceeded') {
        toast.error("Project Limit Reached", {
          description: "You've reached your plan's project limit. Upgrade to add more.",
          action: {
            label: "Upgrade",
            onClick: () => navigate({ to: "/app/billing" })
          }
        });
      } else {
        toast.error(err.error || err.message || "Failed to create project");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">{status}</span>
          </div>
        );
      case "Analyzing":
        return (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">{status}</span>
          </div>
        );
      case "Failed":
        return (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{status}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/30" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-white/50 uppercase tracking-wider">{status}</span>
          </div>
        );
    }
  };

  if (appLoading) {
    return <PageSkeleton cards={3} rows={6} />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl relative">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1">Projects</h1>
          <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">Connect repositories and manage your QA workspaces.</p>
        </div>

        {projects.length > 0 && (
          isLimitReached ? (
            <Link to="/app/billing">
              <Button className="gradient-bg text-primary-foreground border border-primary/50 relative group overflow-hidden h-10 px-6 rounded-full font-semibold shadow-none">
                <Sparkles className="mr-2 h-4 w-4 relative z-10" />
                <span className="relative z-10">Upgrade to add projects</span>
              </Button>
            </Link>
          ) : (
            <Button onClick={() => setOpen(true)} className="gradient-bg text-primary-foreground border border-primary/50 relative group overflow-hidden h-10 px-6 rounded-full font-semibold hover:scale-[1.02] transition-transform shadow-none">
              <Plus className="mr-2 h-4 w-4 relative z-10" />
              <span className="relative z-10">New project</span>
            </Button>
          )
        )}
      </div>

      {projects.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-16 text-center shadow-none relative z-10 flex flex-col items-center justify-center min-h-[400px]">

          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-primary mb-6 shadow-none relative z-10">
            <FolderGit2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">No projects yet</h2>
          <p className="text-slate-500 dark:text-white/50 max-w-sm mx-auto relative z-10">
            Connect your first repository to start generating AI-powered test cases and mapping requirements.
          </p>
          <Button onClick={() => setOpen(true)} className="gradient-bg text-primary-foreground border border-primary/50 relative group overflow-hidden h-10 px-6 rounded-full font-semibold mt-6 shadow-none relative z-10 hover:scale-[1.02] transition-transform">
            <Plus className="mr-2 h-4 w-4 relative z-10" />
            <span className="relative z-10">Create your first project</span>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
          {projects.map((p) => (
            <Link key={p.id} to="/app/projects/$projectId" params={{ projectId: p.id }} className="block h-full outline-none">
              <div className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-6 shadow-none transition-all hover:-translate-y-1 flex flex-col h-full">

                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                    <FolderGit2 className="h-6 w-6" />
                  </div>
                  {getStatusIndicator(p.status)}
                </div>

                <div className="relative z-10 flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{p.name}</h3>

                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[11px] font-mono text-slate-400 dark:text-white/40 group-hover:text-slate-600 dark:group-hover:text-white/60 transition-colors mb-6 max-w-full">
                    <Github className="h-3 w-3 shrink-0" />
                    <span className="truncate">{p.repo_url.replace('https://github.com/', '').replace('http://github.com/', '')}</span>
                  </div>
                </div>

                <div className="relative z-10 mt-auto pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-6 w-6 place-items-center rounded bg-primary/10 text-primary border border-primary/20">
                      <FlaskConical className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-white/80">{p.test_case_count || 0} <span className="font-normal text-slate-400 dark:text-white/40">cases</span></span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-white/30 uppercase tracking-wider">
                    {p.last_analyzed ? new Date(p.last_analyzed).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "New"}
                  </span>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-3xl shadow-none">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">Create project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-600 dark:text-white/70 font-medium">Project Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Checkout Service"
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 placeholder:text-slate-300 dark:placeholder:text-white/20 h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 dark:text-white/70 font-medium">GitHub Repository URL</Label>
              <Input
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="https://github.com/org/repo"
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 placeholder:text-slate-300 dark:placeholder:text-white/20 h-11 font-mono text-sm rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 dark:text-white/70 font-medium">Description (Optional)</Label>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={2}
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 placeholder:text-slate-300 dark:placeholder:text-white/20 resize-none rounded-xl"
                placeholder="Brief context for the AI..."
              />
            </div>
          </div>
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-200 dark:border-white/10 bg-transparent text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 rounded-full shadow-none">Cancel</Button>
            <Button onClick={create} className="gradient-bg text-primary-foreground rounded-full shadow-none">Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in-50 duration-300">
          <div className="w-[680px] h-[460px] bg-[#14120B] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative text-white">
            {/* Top Bar */}
            <div className="h-10 bg-white/5 border-b border-white/10 flex items-center justify-between px-4 select-none">
              <span className="text-xs font-semibold tracking-wider text-white/70 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Speclane Setup Wizard
              </span>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left sidebar */}
              <div className="w-52 bg-gradient-to-b from-[#1c180e] to-[#12100a] border-r border-white/5 p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="text-primary font-bold text-lg tracking-wider flex items-center gap-2">
                    <FolderGit2 className="h-6 w-6 animate-pulse" /> SPECLANE
                  </div>

                  <nav className="space-y-4">
                    {[
                      { step: 1, label: "License Agreement" },
                      { step: 2, label: "Select Features" },
                      { step: 3, label: "Installing Agent" },
                      { step: 4, label: "Finish Setup" }
                    ].map((s) => (
                      <div key={s.step} className="flex items-center gap-3 text-xs">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold border transition-colors ${wizardStep === s.step
                          ? "bg-primary text-[#14120B] border-primary"
                          : wizardStep > s.step
                            ? "bg-primary/20 text-primary border-primary/30"
                            : "bg-transparent text-white/30 border-white/10"
                          }`}>
                          {s.step}
                        </div>
                        <span className={`font-medium ${wizardStep === s.step
                          ? "text-white font-semibold"
                          : wizardStep > s.step
                            ? "text-white/70"
                            : "text-white/30"
                          }`}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </nav>
                </div>

                <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
                  v1.0.0-production
                </div>
              </div>

              {/* Right Panel Step Content */}
              <div className="flex-1 p-6 flex flex-col overflow-hidden">
                {wizardStep === 1 && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <h3 className="text-lg font-bold text-white mb-1">License Agreement</h3>
                    <p className="text-white/50 text-xs mb-4">Please read the following important information before continuing.</p>

                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 overflow-y-auto font-mono text-[10px] text-white/70 leading-relaxed mb-4 scrollbar-thin select-none">
                      <p className="font-bold mb-2">SPECLANE END-USER LICENSE AGREEMENT (EULA)</p>
                      <p className="mb-2">1. SCOPE OF LICENSE: Speclane grants you a non-exclusive, non-transferable, revocable license to utilize the AI automation sandbox and connect git repositories for QA operations.</p>
                      <p className="mb-2">2. DATA SECURITY & PRIVACY: We respect your source code confidentiality. Code scanning occurs dynamically within secure container environments. No proprietary business logic is stored permanently without consent.</p>
                      <p className="mb-2">3. RESPONSIBLE USE: You agree not to execute malicious commands, launch Denial-of-Service attacks, or bypass api quotas.</p>
                      <p>4. WARRANTY LIMITATION: Speclane AI test suites are generated to assist manual QA. Ultimate system safety remains the sole responsibility of the deployment engineer.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="agree-license"
                        checked={acceptedLicense}
                        onChange={(e) => setAcceptedLicense(e.target.checked)}
                        className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 cursor-pointer"
                      />
                      <label htmlFor="agree-license" className="text-xs text-white/80 cursor-pointer select-none">
                        I accept the terms in the license agreement
                      </label>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Select Features</h3>
                      <p className="text-white/50 text-xs mb-4">Choose which Speclane services you wish to activate in this workspace.</p>

                      <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <input type="checkbox" checked disabled className="rounded border-white/10 bg-white/5 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-white/90">AI Test Generator & Self-Healing Engine (Required)</p>
                            <p className="text-[10px] text-white/40">Automatically writes test cases and heals broken DOM assertions dynamically.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <input type="checkbox" checked disabled className="rounded border-white/10 bg-white/5 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-white/90">AI Requirements Mapping & Traceability Matrix</p>
                            <p className="text-[10px] text-white/40">Aligns git codebase repositories directly with active test coverage specifications.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <input type="checkbox" checked disabled className="rounded border-white/10 bg-white/5 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-white/90">Workspace Collaboration (Chat & Video Calls)</p>
                            <p className="text-[10px] text-white/40">Enables team messaging, AI copilot answers, and live video huddles inside the app.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Destination Directory</label>
                      <input
                        type="text"
                        readOnly
                        value="/app/workspace/speclane-agent/"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 font-mono outline-none"
                      />
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="flex-1 flex flex-col justify-center items-center px-4">
                    <div className="w-full text-center space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">Installing Speclane Services...</h4>
                        <p className="text-[11px] font-mono text-primary animate-pulse">{installStatus}</p>
                      </div>

                      <div className="w-full h-3 bg-white/5 border border-white/10 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          style={{ width: `${installProgress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white/70">{installProgress}%</span>
                    </div>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white">Completing Speclane Setup</h3>
                        <p className="text-white/50 text-xs leading-relaxed">
                          Setup has finished installing Speclane services on your web dashboard. The application is now ready to connect repositories and run QA checks.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons Row */}
            <div className="h-16 bg-white/5 border-t border-white/10 flex items-center justify-end px-6 gap-2">
              <Button
                variant="outline"
                onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
                disabled={wizardStep === 1 || wizardStep === 3 || wizardStep === 4}
                className="h-9 px-4 rounded-lg bg-transparent border-white/10 text-xs text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent shadow-none"
              >
                &lt; Back
              </Button>

              {wizardStep === 1 && (
                <Button
                  onClick={() => setWizardStep(2)}
                  disabled={!acceptedLicense}
                  className="h-9 px-4 rounded-lg bg-primary text-[#14120B] hover:bg-primary/90 text-xs font-bold disabled:opacity-30 shadow-none"
                >
                  Next &gt;
                </Button>
              )}

              {wizardStep === 2 && (
                <Button
                  onClick={startInstallation}
                  className="h-9 px-4 rounded-lg bg-primary text-[#14120B] hover:bg-primary/90 text-xs font-bold shadow-none"
                >
                  Next &gt;
                </Button>
              )}

              {wizardStep === 3 && (
                <Button
                  disabled={installProgress < 100}
                  onClick={() => setWizardStep(4)}
                  className="h-9 px-4 rounded-lg bg-primary text-[#14120B] hover:bg-primary/90 text-xs font-bold disabled:opacity-30 shadow-none"
                >
                  Next &gt;
                </Button>
              )}

              {wizardStep === 4 && (
                <Button
                  onClick={finishWizard}
                  className="h-9 px-4 rounded-lg bg-primary text-[#14120B] hover:bg-primary/90 text-xs font-bold shadow-none"
                >
                  Finish
                </Button>
              )}

              <Button
                variant="outline"
                disabled={wizardStep === 3}
                onClick={() => {
                  toast.error("Setup was cancelled");
                  setShowWizard(false);
                }}
                className="h-9 px-4 rounded-lg bg-transparent border-white/10 text-xs text-white/50 hover:bg-white/5 disabled:opacity-30 shadow-none ml-4"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
