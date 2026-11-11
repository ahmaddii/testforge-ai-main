import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GitCompare, Plus, Trash2, CheckCircle2, XCircle, Clock, ShieldAlert, Check, AlertTriangle } from "lucide-react";
import { GeminiIcon } from "@/components/gemini-icon";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/page-skeleton";

export const Route = createFileRoute("/app/run-comparison")({
  component: RunComparisonPage,
  head: () => ({ meta: [{ title: "Run Comparison — Speclane" }] }),
});

function RunComparisonPage() {
  const { executionRuns, deleteExecutionRun, projects, environments, fetchData, loading } = useApp();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [isOpen, setIsOpen] = useState(false);
  const [runName, setRunName] = useState("");
  const [envName, setEnvName] = useState(environments[0]?.name || "");
  const [environmentId, setEnvironmentId] = useState("");
  const [targetProjectId, setTargetProjectId] = useState<string>(projects[0]?.id || "");
  const [capturing, setCapturing] = useState(false);
  const [uploadMode, setUploadMode] = useState<"execute" | "upload">("execute");
  const [testResultFile, setTestResultFile] = useState<File | null>(null);

  useEffect(() => {
    if (!targetProjectId || !projects.some((project) => project.id === targetProjectId)) {
      setTargetProjectId(projects[0]?.id || "");
    }
  }, [projects, targetProjectId]);

  const eligibleEnvironments = useMemo(
    () => environments.filter((environment) => !environment.project_id || environment.project_id === targetProjectId),
    [environments, targetProjectId]
  );

  useEffect(() => {
    if (!eligibleEnvironments.some((environment) => environment.id === environmentId)) {
      setEnvironmentId(eligibleEnvironments[0]?.id || "");
    }
    if (!envName && environments.length > 0) setEnvName(environments[0].name);
  }, [eligibleEnvironments, environmentId, envName, environments]);

  const [runAId, setRunAId] = useState<string>("");
  const [runBId, setRunBId] = useState<string>("");

  useEffect(() => {
    if (!executionRuns.some((run) => run.id === runAId)) setRunAId(executionRuns[0]?.id || "");
    const baseline = executionRuns.find((run) => run.id === runAId) || executionRuns[0];
    const target = executionRuns.find((run) => run.id === runBId);
    if (!target || target.id === baseline?.id || target.project_id !== baseline?.project_id) {
      setRunBId(executionRuns.find((run) => run.id !== baseline?.id && run.project_id === baseline?.project_id)?.id || "");
    }
  }, [executionRuns, runAId, runBId]);

  const handleCapture = async () => {
    const finalName = runName.trim() || `Execution Run #${executionRuns.length + 1}`;
    const projectId = targetProjectId === "all" ? null : targetProjectId;

    setCapturing(true);
    try {
      if (uploadMode === "execute") {
        if (!projectId) throw new Error("Select a project before running its test cases.");
        const targetEnvironment = eligibleEnvironments.find((environment) => environment.id === environmentId);
        if (!targetEnvironment) throw new Error("Register an environment before running tests.");
        if (targetEnvironment.status === "Degraded" && !confirm(`Environment "${targetEnvironment.name}" is degraded. Run the suite there anyway?`)) return;

        const summary = await api.post("/execution-runs/execute", {
          project_id: projectId,
          environment_id: targetEnvironment.id,
          force_all: true,
          run_name: finalName,
          triggered_by: "Run Comparison",
        });
        await fetchData();
        toast.success(`${summary.name || finalName} saved on ${targetEnvironment.name}: ${summary.passed} passed, ${summary.failed} failed, ${summary.blocked || 0} blocked.`);
      } else {
        if (!testResultFile) throw new Error("Please upload a JSON test report file.");

        let parsed: any;
        try {
          parsed = JSON.parse(await testResultFile.text());
        } catch {
          throw new Error("Invalid JSON file. Upload a Jest or Playwright JSON report.");
        }

        const results: Record<string, any> = {};
        let passed = 0;
        let failed = 0;
        let blocked = 0;
        let totalDurationMs = 0;
        const addResult = (name: string, module: string, rawStatus: string, durationMs: number) => {
          if (!name?.trim() || !module?.trim()) throw new Error("Each imported test needs a name and module.");
          const normalizedStatus = rawStatus.toLowerCase();
          const status = normalizedStatus === "passed"
            ? "Passed"
            : ["skipped", "pending", "todo", "interrupted"].includes(normalizedStatus)
              ? "Blocked"
              : "Failed";
          if (status === "Passed") passed++;
          else if (status === "Failed") failed++;
          else blocked++;
          totalDurationMs += durationMs;
          const stableName = name.trim().toLowerCase().replace(/\s+/g, " ");
          const stableModule = module.trim().toLowerCase().replace(/\s+/g, " ");
          const resultKey = `report:${stableModule}::${stableName}`;
          if (results[resultKey]) throw new Error(`The report contains duplicate test identity "${name}" in "${module}". Give duplicate tests distinct names before importing.`);
          results[resultKey] = {
            status,
            time: `${durationMs}ms`,
            name,
            module,
          };
        };

        if (Array.isArray(parsed.testResults)) {
          parsed.testResults.forEach((suite: any) => {
            (suite.assertionResults || []).forEach((assertion: any) => {
              addResult(
                assertion.fullName || assertion.title || "Unnamed Jest test",
                suite.name || assertion.ancestorTitles?.join(" / ") || "General",
                assertion.status || "failed",
                Number(assertion.duration) || 0,
              );
            });
          });
        } else if (Array.isArray(parsed.suites)) {
          const visitSuites = (suites: any[], parentTitle = "") => {
            suites.forEach((suite: any) => {
              const module = [parentTitle, suite.title].filter(Boolean).join(" / ") || "General";
              (suite.specs || []).forEach((spec: any) => {
                const tests = spec.tests || [];
                const finalResults = tests.map((test: any) => test.results?.[test.results.length - 1]).filter(Boolean);
                const lastResult = finalResults[finalResults.length - 1];
                const status = spec.ok === true
                  ? "passed"
                  : spec.ok === false
                    ? "failed"
                    : lastResult?.status || "failed";
                const duration = finalResults.reduce((total: number, result: any) => total + (Number(result.duration) || 0), 0);
                addResult(spec.title || "Unnamed Playwright test", module, status, duration);
              });
              visitSuites(suite.suites || [], module);
            });
          };
          visitSuites(parsed.suites);
        } else {
          const items = Array.isArray(parsed) ? parsed : Object.values(parsed || {});
          items.forEach((item: any) => {
            if (item?.name && item?.status) {
              addResult(item.name, item.module || "General", item.status, Number(item.duration) || 0);
            }
          });
        }

        if (Object.keys(results).length === 0) {
          throw new Error("No test results found. Upload a Jest/Playwright JSON report or an array of {name, status} results.");
        }

        const duration = totalDurationMs > 0 ? `${Math.max(1, Math.round(totalDurationMs / 1000))}s` : "0s";
        await api.post("/execution-runs", {
          project_id: projectId || undefined,
          name: finalName,
          environment: envName.trim() || "Imported Report",
          passed,
          failed,
          duration,
          results: { _meta: { blocked, total_cases: Object.keys(results).length }, ...results },
        });
        await fetchData();
        toast.success(`Report saved: ${passed} passed, ${failed} failed, ${blocked} blocked.`);
      }

      setRunName("");
      setTestResultFile(null);
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create execution run");
    } finally {
      setCapturing(false);
    }
  };

  const selectedA = useMemo(() => executionRuns.find((r) => r.id === runAId), [executionRuns, runAId]);
  const selectedB = useMemo(() => executionRuns.find((r) => r.id === runBId), [executionRuns, runBId]);

  const comparableRuns = useMemo(
    () => selectedA ? executionRuns.filter((run) => run.id !== selectedA.id && run.project_id === selectedA.project_id) : [],
    [executionRuns, selectedA]
  );

  useEffect(() => {
    if (selectedA && runBId && selectedB && (selectedA.project_id !== selectedB.project_id || selectedA.id === selectedB.id)) {
      setRunBId(comparableRuns[0]?.id || "");
    }
  }, [selectedA, selectedB, comparableRuns]);

  const diffItems = useMemo(() => {
    if (!selectedA || !selectedB) return [];
    const allKeys = Array.from(new Set([
      ...Object.keys(selectedA.results || {}),
      ...Object.keys(selectedB.results || {})
    ])).filter((key) => key !== "_meta");

    return allKeys.map(key => {
      const a = selectedA?.results?.[key];
      const b = selectedB?.results?.[key];
      const name = a?.name || b?.name || key;
      const module = a?.module || b?.module || "General";

      let comparison = "stable";
      const failureStatuses = ["Failed", "Error"];
      if (a?.status === "Passed" && failureStatuses.includes(b?.status)) comparison = "regression";
      if (failureStatuses.includes(a?.status) && b?.status === "Passed") comparison = "fixed";
      if (!a && b) comparison = "new";
      if (a && !b) comparison = "removed";

      return { key, name, module, a, b, comparison };
    });
  }, [selectedA, selectedB]);

  const diffSummary = useMemo(() => {
    let regressions = 0;
    let fixes = 0;
    diffItems.forEach(item => {
      if (item.comparison === "regression") regressions++;
      if (item.comparison === "fixed") fixes++;
    });
    const newTests = diffItems.filter((item) => !item.a && item.b).length;
    const removedTests = diffItems.filter((item) => item.a && !item.b).length;
    return { regressions, fixes, newTests, removedTests };
  }, [diffItems]);

  const getBlockedCount = (run: typeof selectedA) =>
    (run as any)?.blocked ?? (run?.results?._meta as any)?.blocked ?? 0;

  const navigate = useNavigate();
  const [generatingTicket, setGeneratingTicket] = useState(false);

  const handleGenerateTicket = async () => {
    if (!selectedA || !selectedB) return;
    setGeneratingTicket(true);
    
    const regressionItems = diffItems.filter(item => item.comparison === "regression");
    const description = `Automated regression ticket generated from Execution Run Diffing.\n\nBaseline Run: ${selectedA.name}\nTarget Run: ${selectedB.name} (${selectedB.environment})\n\nRegressed Scenarios:\n` + regressionItems.map(item => `- ${item.name} [Module: ${item.module}] (${item.b?.status} in ${selectedB.name})`).join("\n");

    try {
      const payload = {
        project_id: selectedB.project_id || projects[0]?.id || null,
        title: `[Regression] ${regressionItems.length} test failures detected in build ${selectedB.name}`,
        description,
        severity: "Critical",
        status: "Open"
      };

      await api.post("/defects", payload);
      await api.post("/activity", {
        action: `Generated regression defect ticket for ${selectedB.name}`,
        category: "Defect",
        project_id: payload.project_id
      }).catch(() => {});
      await api.post("/notifications", {
        title: "Regression Ticket Logged",
        message: `Regression ticket created for engineering triage.`,
        type: "defect",
        project_id: payload.project_id
      }).catch(() => {});

      await fetchData();
      toast.success("Regression ticket successfully generated!", {
        action: {
          label: "View Defect",
          onClick: () => navigate({ to: "/app/defects" })
        }
      });
    } catch (err: any) {
      toast.error("Failed to generate regression ticket.");
    } finally {
      setGeneratingTicket(false);
    }
  };

  if (loading && executionRuns.length === 0) {
    return <PageSkeleton cards={2} rows={6} />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl relative min-h-[600px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <GeminiIcon className="h-3 w-3 object-contain" /> Live Run Diffing
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1 flex items-center gap-3">
            <GitCompare className="h-8 w-8 text-primary" /> Execution Run Comparison
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">
            Capture live snapshots and compare execution runs side-by-side to detect flakiness and regressions.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
          <Button className="gradient-bg text-primary-foreground border border-primary/50 relative group overflow-hidden h-11 px-6 rounded-full font-semibold hover:scale-[1.02] transition-transform shadow-none">
                <Plus className="mr-2 h-4 w-4 relative z-10" />
                <span className="relative z-10">Create Run</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-3xl shadow-none max-w-md">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <DialogHeader className="mb-2">
                <DialogTitle className="text-2xl font-bold">Create Execution Run</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-white/70 font-medium">Run Name</Label>
                  <Input
                    value={runName}
                    onChange={(e) => setRunName(e.target.value)}
                    placeholder="e.g. Master PR #640 Build"
                    className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-white/70 font-medium">Target Environment</Label>
                  {uploadMode === "execute" ? (
                    <Select
                      value={environmentId}
                      onValueChange={(id) => {
                        setEnvironmentId(id);
                        setEnvName(eligibleEnvironments.find((environment) => environment.id === id)?.name || "");
                      }}
                    >
                    <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-primary/20 h-11 rounded-xl">
                        <SelectValue placeholder="Select an environment" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                        {eligibleEnvironments.map((e) => (
                          <SelectItem key={e.id} value={e.id} className="focus:bg-slate-50 dark:focus:bg-white/10 font-medium">
                            {e.name} ({e.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                  ) : environments.length > 0 ? (
                    <Select value={envName} onValueChange={setEnvName}>
                      <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-primary/20 h-11 rounded-xl">
                        <SelectValue placeholder="Choose report environment" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                        {environments.map((environment) => (
                          <SelectItem key={environment.id} value={environment.name} className="focus:bg-slate-50 dark:focus:bg-white/10 font-medium">
                            {environment.name} ({environment.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={envName} onChange={(event) => setEnvName(event.target.value)} placeholder="e.g. Staging" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-white/70 font-medium">Scope to Project</Label>
                  <Select value={targetProjectId} onValueChange={setTargetProjectId}>
                    <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-primary/20 h-11 rounded-xl font-medium">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                      {uploadMode === "upload" && <SelectItem value="all" className="focus:bg-slate-50 dark:focus:bg-white/10 font-bold">All Projects ({projects.length})</SelectItem>}
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="focus:bg-slate-50 dark:focus:bg-white/10 font-medium">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-white/70 font-medium">Execution Engine</Label>
                  <Select value={uploadMode} onValueChange={(value: "execute" | "upload") => {
                    setUploadMode(value);
                    if (value === "execute" && targetProjectId === "all") setTargetProjectId(projects[0]?.id || "");
                  }}>
                    <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-primary/20 h-11 rounded-xl font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                      <SelectItem value="execute" className="focus:bg-slate-50 dark:focus:bg-white/10 font-medium">Run real Playwright test suite</SelectItem>
                      <SelectItem value="upload" className="focus:bg-slate-50 dark:focus:bg-white/10 font-medium">Upload Test Report (Jest/Playwright JSON)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {uploadMode === "execute" && (
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-white/50">
                    Runs the selected project’s saved test cases against this environment and stores the real Playwright results. Production targets use read-only safety rules.
                  </p>
                )}

                {uploadMode === "execute" && eligibleEnvironments.length === 0 && (
                  <p className="text-xs text-amber-700 dark:text-amber-300">No environment is registered for this project. Add one on the Environments page first.</p>
                )}
                
                {uploadMode === "upload" && (
                  <div className="space-y-2">
                    <Label className="text-slate-600 dark:text-white/70 font-medium">Upload Test Result File (.json)</Label>
                    <Input 
                      type="file" 
                      accept=".json"
                      onChange={(e) => setTestResultFile(e.target.files?.[0] || null)}
                      className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-11 rounded-xl cursor-pointer"
                    />
                  </div>
                )}
              </div>
              <DialogFooter className="mt-6 gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="border-slate-200 dark:border-white/10 bg-transparent text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 rounded-full h-11 px-8 font-bold">Cancel</Button>
                <Button
                  onClick={handleCapture}
                  disabled={capturing || (uploadMode === "execute" && (!targetProjectId || targetProjectId === "all" || !environmentId)) || (uploadMode === "upload" && !testResultFile)}
                  className="gradient-bg text-primary-foreground rounded-full h-11 px-8 font-bold shadow-none"
                >
                  {capturing ? (uploadMode === "execute" ? "Running Suite..." : "Saving Report...") : (uploadMode === "execute" ? "Run Test Suite" : "Save Report Run")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>

      {executionRuns.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-16 text-center shadow-none relative z-10 flex flex-col items-center justify-center min-h-[400px]">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-primary mb-6 shadow-none relative z-10">
            <GitCompare className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">No Execution Snapshots Found</h2>
          <p className="text-slate-500 dark:text-white/50 max-w-md mx-auto mb-8 relative z-10">
            Record your first execution run snapshot above to start diffing outcomes across code changes and deployments.
          </p>
          <Button onClick={() => setIsOpen(true)} className="gradient-bg text-primary-foreground shadow-none h-11 px-8 rounded-full font-bold relative z-10">
            <Plus className="mr-2 h-4 w-4" /> Create First Run
          </Button>
        </div>
      ) : (
        <div className="space-y-8 relative z-10">
          {/* Side by Side Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Run A */}
            <div className="bg-white dark:bg-[#14120B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none relative overflow-hidden flex flex-col justify-between border-l-4 border-l-slate-400 dark:border-l-white/30 transition-all duration-300 hover:-translate-y-2 hover:border-primary">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider">Baseline Run (Run A)</label>
                  {selectedA && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                      onClick={() => deleteExecutionRun(selectedA.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Select value={runAId} onValueChange={(id) => {
                  setRunAId(id);
                  const nextBaseline = executionRuns.find((run) => run.id === id);
                  if (selectedB && nextBaseline?.project_id !== selectedB.project_id) setRunBId("");
                }}>
                  <SelectTrigger className="w-full h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-bold text-sm">
                    <SelectValue placeholder="Select Run A" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                    {executionRuns.map(r => (
                      <SelectItem key={r.id} value={r.id} className="focus:bg-slate-50 dark:focus:bg-white/10 text-sm font-medium">
                        {r.name} · {r.environment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedA && (
                <div className="grid grid-cols-4 gap-3 mt-6 font-mono text-xs">
                  <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {selectedA.passed} Passed
                  </div>
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-1.5">
                    <XCircle className="h-4 w-4 shrink-0" /> {selectedA.failed} Failed
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> {getBlockedCount(selectedA)} Blocked
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 font-bold flex items-center justify-center gap-1.5">
                    <Clock className="h-4 w-4 shrink-0" /> {selectedA.duration}
                  </div>
                </div>
              )}
            </div>

            {/* Run B */}
            <div className="bg-white dark:bg-[#14120B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none relative overflow-hidden flex flex-col justify-between border-l-4 border-l-primary transition-all duration-300 hover:-translate-y-2 hover:border-primary">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider">Target Run (Run B)</label>
                  {selectedB && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                      onClick={() => deleteExecutionRun(selectedB.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Select value={runBId} onValueChange={setRunBId} disabled={comparableRuns.length === 0}>
                  <SelectTrigger className="w-full h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-bold text-sm">
                    <SelectValue placeholder="Select Run B" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                    {comparableRuns.map(r => (
                      <SelectItem key={r.id} value={r.id} className="focus:bg-slate-50 dark:focus:bg-white/10 text-sm font-medium">
                        {r.name} · {r.environment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedB && (
                <div className="grid grid-cols-4 gap-3 mt-6 font-mono text-xs">
                  <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {selectedB.passed} Passed
                  </div>
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-1.5">
                    <XCircle className="h-4 w-4 shrink-0" /> {selectedB.failed} Failed
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> {getBlockedCount(selectedB)} Blocked
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 font-bold flex items-center justify-center gap-1.5">
                    <Clock className="h-4 w-4 shrink-0" /> {selectedB.duration}
                  </div>
                </div>
              )}
              {!selectedB && <p className="mt-4 text-xs text-slate-500 dark:text-white/50">Create another run for this project to enable comparison.</p>}
            </div>
          </div>

          {/* Delta Summary Banner */}
          {selectedA && selectedB ? (
            <div className={`p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-none ${diffSummary.regressions > 0 ? 'bg-red-500/10 border-red-500/20' : diffSummary.fixes > 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-slate-50 dark:bg-white/5'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl ${diffSummary.regressions > 0 ? 'bg-red-500 text-white' : diffSummary.fixes > 0 ? 'bg-green-500 text-white' : 'bg-primary/20 text-primary'}`}>
                  {diffSummary.regressions > 0 ? <ShieldAlert className="h-7 w-7" /> : <Check className="h-7 w-7" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    {diffSummary.regressions > 0 ? `${diffSummary.regressions} Regressions Detected Between Runs` : diffSummary.fixes > 0 ? `${diffSummary.fixes} Issues Fixed Between Runs` : diffSummary.newTests + diffSummary.removedTests > 0 ? `${diffSummary.newTests} New · ${diffSummary.removedTests} Removed Test Cases` : 'No Deltas / Fully Stable Comparison'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-white/70 mt-1">
                    Comparing baseline {selectedA.name} with target {selectedB.name} ({selectedB.environment}).
                  </p>
                </div>
              </div>

              {diffSummary.regressions > 0 && (
                <Button 
                  onClick={handleGenerateTicket} 
                  disabled={generatingTicket}
                  className="rounded-full shadow-none px-6 h-11 font-bold text-xs bg-red-600 hover:bg-red-700 text-white border-none"
                >
                  {generatingTicket ? "Logging Ticket..." : "Generate Regression Ticket"}
                </Button>
              )}
            </div>
          ) : selectedA ? (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-5 text-sm text-slate-600 dark:text-white/60">
              Select another run from <strong>{selectedA.name}</strong>’s project to compare results. Runs from different projects cannot be compared.
            </div>
          ) : null}

          {/* Diff Table */}
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] overflow-hidden shadow-none">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-[10px] font-bold text-slate-400 dark:text-white/40 px-6 grid grid-cols-12 gap-4 uppercase tracking-wider">
              <div className="col-span-6">Test Case Identifier & Module</div>
              <div className="col-span-3 text-center">Run A Outcome</div>
              <div className="col-span-3 text-center">Run B Outcome</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {diffItems.map((item, idx) => {
                const renderOutcome = (outcome: any) => {
                  if (!outcome) return <span className="text-xs text-slate-400 dark:text-white/30 italic">Not in run</span>;
                  const status = outcome.status || "Unknown";
                  const style = status === "Passed"
                    ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                    : status === "Blocked"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
                      : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400";
                  const icon = status === "Passed"
                    ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    : status === "Blocked"
                      ? <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      : <XCircle className="h-3.5 w-3.5 shrink-0" />;
                  return <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style}`}>{icon}<span>{status.toUpperCase()} ({outcome.time || "—"})</span></div>;
                };
                const bgClass = item.comparison === "regression" 
                  ? "bg-red-500/10 dark:bg-red-500/5 hover:bg-red-500/15" 
                  : item.comparison === "fixed"
                  ? "bg-green-500/10 dark:bg-green-500/5 hover:bg-green-500/15"
                  : "hover:bg-slate-50 dark:hover:bg-white/[0.02]";

                return (
                  <div key={item.key || idx} className={`p-4 px-6 grid grid-cols-12 gap-4 items-center transition-colors ${bgClass}`}>
                    <div className="col-span-6">
                      <div className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        {item.name}
                        {item.comparison === "regression" && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500 text-white animate-pulse">Regression</span>
                        )}
                        {item.comparison === "fixed" && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-green-500 text-white">Fixed</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-white/50 font-mono">{item.module}</div>
                    </div>

                    <div className="col-span-3 flex items-center justify-center font-mono">{renderOutcome(item.a)}</div>

                    <div className="col-span-3 flex items-center justify-center font-mono">{renderOutcome(item.b)}</div>
                  </div>
                );
              })}

              {diffItems.length === 0 && (
                <div className="py-16 text-center text-slate-500 dark:text-white/50">
                  Select two valid execution runs above to view case-by-case comparison.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
