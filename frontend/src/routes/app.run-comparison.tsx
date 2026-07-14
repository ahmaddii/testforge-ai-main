import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GitCompare, Plus, Trash2, CheckCircle2, XCircle, Clock, Zap, ShieldAlert, Sparkles, FolderGit2, Check } from "lucide-react";
import { useApp, type ExecutionRun } from "@/lib/store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/page-skeleton";
import { PaywallOverlay } from "@/components/paywall-overlay";

export const Route = createFileRoute("/app/run-comparison")({
  component: RunComparisonPage,
  head: () => ({ meta: [{ title: "Run Comparison — Speclane" }] }),
});

function RunComparisonPage() {
  const { testCases, executionRuns, addExecutionRun, deleteExecutionRun, projects, fetchData, loading, billing } = useApp();

  const isFreePlan = !billing || billing.plan === "free";

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [isOpen, setIsOpen] = useState(false);
  const [runName, setRunName] = useState("");
  const [envName, setEnvName] = useState("Staging EU");
  const [targetProjectId, setTargetProjectId] = useState<string>("all");
  const [capturing, setCapturing] = useState(false);
  const [uploadMode, setUploadMode] = useState<"simulate" | "upload">("simulate");
  const [testResultFile, setTestResultFile] = useState<File | null>(null);

  const [runAId, setRunAId] = useState<string>("");
  const [runBId, setRunBId] = useState<string>("");

  useEffect(() => {
    if (executionRuns.length > 0) {
      if (!runAId || !executionRuns.find(r => r.id === runAId)) {
        setRunAId(executionRuns[0]?.id || "");
      }
      if (!runBId || !executionRuns.find(r => r.id === runBId)) {
        setRunBId(executionRuns[1]?.id || executionRuns[0]?.id || "");
      }
    }
  }, [executionRuns, runAId, runBId]);

  const handleCapture = async () => {
    const finalName = runName.trim() || `Execution Run #${Math.floor(Math.random() * 8999 + 1000)}`;
    const finalEnv = envName.trim() || "Staging EU";
    const pid = targetProjectId === "all" ? (projects[0]?.id || null) : targetProjectId;

    setCapturing(true);
    try {
      if (uploadMode === "upload") {
        if (!testResultFile) throw new Error("Please upload a JSON test report file.");
        
        const fileContent = await testResultFile.text();
        let parsed;
        try {
          parsed = JSON.parse(fileContent);
        } catch (e) {
          throw new Error("Invalid JSON file format. Please upload a valid JSON report.");
        }
        
        const results: Record<string, any> = {};
        let passed = 0;
        let failed = 0;
        let totalDurationMs = 0;

        if (parsed.testResults && Array.isArray(parsed.testResults)) {
            // Jest format
            parsed.testResults.forEach((tr: any, idx: number) => {
               if (tr.assertionResults && Array.isArray(tr.assertionResults)) {
                  tr.assertionResults.forEach((ar: any, i: number) => {
                      const st = ar.status === "passed" ? "Passed" : "Failed";
                      if (st === "Passed") passed++; else failed++;
                      totalDurationMs += ar.duration || 0;
                      results[`test-${idx}-${i}`] = {
                          status: st,
                          time: `${ar.duration || 0}ms`,
                          name: ar.title || ar.fullName || `Test ${i}`,
                          module: ar.ancestorTitles?.[0] || "General"
                      };
                  });
               }
            });
        } else if (parsed.suites && Array.isArray(parsed.suites)) {
            // Playwright / Generic format
            const traverseSuites = (suites: any[]) => {
                suites.forEach(s => {
                    if (s.specs) {
                        s.specs.forEach((sp: any, i: number) => {
                            const ok = sp.ok || (sp.tests && sp.tests.some((t:any) => t.results && t.results.some((r:any) => r.status === 'passed')));
                            const st = ok ? "Passed" : "Failed";
                            if (st === "Passed") passed++; else failed++;
                            const duration = sp.tests?.[0]?.results?.[0]?.duration || Math.floor(Math.random() * 500);
                            totalDurationMs += duration;
                            results[`spec-${passed+failed}`] = {
                                status: st,
                                time: `${duration}ms`,
                                name: sp.title || `Test ${passed+failed}`,
                                module: s.title || "General"
                            };
                        });
                    }
                    if (s.suites) traverseSuites(s.suites);
                });
            };
            traverseSuites(parsed.suites);
        } else {
             // Fallback minimal format
             const items = Array.isArray(parsed) ? parsed : Object.values(parsed);
             items.forEach((item: any, idx) => {
                 if (item && item.name && item.status) {
                     const st = item.status.toLowerCase() === "passed" ? "Passed" : "Failed";
                     if (st === "Passed") passed++; else failed++;
                     results[`item-${idx}`] = {
                         status: st,
                         time: `${item.duration || item.time || 0}ms`,
                         name: item.name,
                         module: item.module || "General"
                     };
                 }
             });
        }
        
        if (Object.keys(results).length === 0) {
            throw new Error("Could not extract test results. Ensure the JSON is from Jest or Playwright.");
        }

        const durationStr = totalDurationMs > 0 ? `${Math.floor(totalDurationMs/1000)}s` : `${Math.floor(Math.random() * 2 + 1)}m ${Math.floor(Math.random() * 50 + 10)}s`;

        await addExecutionRun({
          project_id: pid || undefined,
          name: finalName,
          environment: finalEnv,
          passed,
          failed,
          duration: durationStr,
          results
        });
      } else {
        const relevantCases = pid 
          ? testCases.filter(t => t.project_id === pid)
          : testCases;

      const results: Record<string, { status: string; time: string; name: string; module: string }> = {};
      let passed = 0;
      let failed = 0;

      if (relevantCases.length > 0) {
        relevantCases.forEach((tc) => {
          let st = tc.status;
          if (st !== "Passed" && st !== "Failed") {
            st = Math.random() > 0.15 ? "Passed" : "Failed";
          }
          if (st === "Passed") passed++;
          else failed++;

          results[tc.id] = {
            status: st,
            time: `${Math.floor(Math.random() * 450 + 85)}ms`,
            name: tc.title,
            module: tc.module || "General"
          };
        });
      } else {
        // Fallback realistic items if no cases present
        const sampleTitles = [
          { name: "Biometric Authentication Handshake", module: "Security & Auth", status: "Passed", time: "142ms" },
          { name: "OAuth Token Refresh Concurrency", module: "Security & Auth", status: Math.random() > 0.5 ? "Passed" : "Failed", time: "504ms" },
          { name: "High Volume Virtualized Data Grid", module: "UI / Frontend", status: "Passed", time: "240ms" },
          { name: "Stripe Webhook Asynchronous Retry", module: "Billing & Payment", status: "Passed", time: "112ms" },
          { name: "GraphQL Subscription Rate Limiting", module: "API Gateway", status: Math.random() > 0.3 ? "Passed" : "Failed", time: "389ms" },
          { name: "Redis Cache Eviction Policy Verification", module: "Backend Core", status: "Passed", time: "65ms" }
        ];

        sampleTitles.forEach((st, idx) => {
          if (st.status === "Passed") passed++;
          else failed++;
          results[`tc-demo-${idx}`] = {
            status: st.status,
            time: st.time,
            name: st.name,
            module: st.module
          };
        });
      }

      await addExecutionRun({
        project_id: pid || undefined,
        name: finalName,
        environment: finalEnv,
        passed,
        failed,
        duration: `${Math.floor(Math.random() * 2 + 1)}m ${Math.floor(Math.random() * 50 + 10)}s`,
        results
      });
      }

      toast.success("Execution snapshot successfully recorded");
      setRunName("");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to capture execution run");
    } finally {
      setCapturing(false);
    }
  };

  const selectedA = useMemo(() => executionRuns.find((r) => r.id === runAId) || executionRuns[0], [executionRuns, runAId]);
  const selectedB = useMemo(() => executionRuns.find((r) => r.id === runBId) || executionRuns[1] || executionRuns[0], [executionRuns, runBId]);

  const diffItems = useMemo(() => {
    if (!selectedA && !selectedB) return [];
    const allKeys = Array.from(new Set([
      ...Object.keys(selectedA?.results || {}),
      ...Object.keys(selectedB?.results || {})
    ]));

    return allKeys.map(key => {
      const a = selectedA?.results?.[key];
      const b = selectedB?.results?.[key];
      const name = a?.name || b?.name || key;
      const module = a?.module || b?.module || "General";

      let comparison = "stable";
      if (a?.status === "Passed" && b?.status === "Failed") comparison = "regression";
      if (a?.status === "Failed" && b?.status === "Passed") comparison = "fixed";

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
    return { regressions, fixes };
  }, [diffItems]);

  const navigate = useNavigate();
  const [generatingTicket, setGeneratingTicket] = useState(false);

  const handleGenerateTicket = async () => {
    if (!selectedA || !selectedB) return;
    setGeneratingTicket(true);
    
    const regressionItems = diffItems.filter(item => item.comparison === "regression");
    const description = `Automated regression ticket generated from Execution Run Diffing.\n\nBaseline Run: ${selectedA.name}\nTarget Run: ${selectedB.name} (${selectedB.environment})\n\nRegressed Scenarios:\n` + regressionItems.map(item => `- ${item.name} [Module: ${item.module}] (Failed in ${selectedB.name})`).join("\n");

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
              <Sparkles className="h-3 w-3" /> Live Run Diffing
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1 flex items-center gap-3">
            <GitCompare className="h-8 w-8 text-primary" /> Execution Run Comparison
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">
            Capture live snapshots and compare execution runs side-by-side to detect flakiness and regressions.
          </p>
        </div>

        {!isFreePlan && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-bg text-primary-foreground border border-primary/50 relative group overflow-hidden h-11 px-6 rounded-full font-semibold hover:scale-[1.02] transition-transform shadow-none">
                <Plus className="mr-2 h-4 w-4 relative z-10" />
                <span className="relative z-10">Capture Run Snapshot</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-3xl shadow-none max-w-md">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <DialogHeader className="mb-2">
                <DialogTitle className="text-2xl font-bold">Record Execution Run</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-white/70 font-medium">Run Snapshot Name</Label>
                  <Input
                    value={runName}
                    onChange={(e) => setRunName(e.target.value)}
                    placeholder="e.g. Master PR #640 Build"
                    className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-white/70 font-medium">Target Environment</Label>
                  <Select value={envName} onValueChange={setEnvName}>
                    <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-primary/20 h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                      <SelectItem value="Staging EU" className="focus:bg-slate-50 dark:focus:bg-white/10">Staging EU</SelectItem>
                      <SelectItem value="Staging US-East" className="focus:bg-slate-50 dark:focus:bg-white/10">Staging US-East</SelectItem>
                      <SelectItem value="Production Cluster" className="focus:bg-slate-50 dark:focus:bg-white/10">Production Cluster</SelectItem>
                      <SelectItem value="Dev Sandbox" className="focus:bg-slate-50 dark:focus:bg-white/10">Dev Sandbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-white/70 font-medium">Scope to Project</Label>
                  <Select value={targetProjectId} onValueChange={setTargetProjectId}>
                    <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-primary/20 h-11 rounded-xl font-medium">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                      <SelectItem value="all" className="focus:bg-slate-50 dark:focus:bg-white/10 font-bold">All Projects ({projects.length})</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="focus:bg-slate-50 dark:focus:bg-white/10 font-medium">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-white/70 font-medium">Data Source</Label>
                  <Select value={uploadMode} onValueChange={(v: any) => setUploadMode(v)}>
                    <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-primary/20 h-11 rounded-xl font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl">
                      <SelectItem value="simulate" className="focus:bg-slate-50 dark:focus:bg-white/10 font-medium">Simulate Data (Demo)</SelectItem>
                      <SelectItem value="upload" className="focus:bg-slate-50 dark:focus:bg-white/10 font-medium">Upload JSON Report (Jest/Playwright)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
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
                <Button onClick={handleCapture} disabled={capturing} className="gradient-bg text-primary-foreground rounded-full h-11 px-8 font-bold shadow-none">
                  {capturing ? "Capturing..." : "Record Snapshot"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isFreePlan ? (
        <PaywallOverlay
          title="Execution Run Comparison is a Paid Feature"
          description="Upgrade your workspace to Starter, Pro, or Enterprise to unlock side-by-side execution diffing, automatic flake detection, and instant regression ticket generation."
          planRequired="Starter"
          icon={<GitCompare className="h-10 w-10 text-primary animate-pulse" />}
        />
      ) : executionRuns.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-16 text-center shadow-none relative z-10 flex flex-col items-center justify-center min-h-[400px]">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-primary mb-6 shadow-none relative z-10">
            <GitCompare className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">No Execution Snapshots Found</h2>
          <p className="text-slate-500 dark:text-white/50 max-w-md mx-auto mb-8 relative z-10">
            Record your first execution run snapshot above to start diffing outcomes across code changes and deployments.
          </p>
          <Button onClick={() => setIsOpen(true)} className="gradient-bg text-primary-foreground shadow-none h-11 px-8 rounded-full font-bold relative z-10">
            <Plus className="mr-2 h-4 w-4" /> Capture First Snapshot
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

                <Select value={runAId} onValueChange={setRunAId}>
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
                <div className="grid grid-cols-3 gap-3 mt-6 font-mono text-xs">
                  <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {selectedA.passed} Passed
                  </div>
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-1.5">
                    <XCircle className="h-4 w-4 shrink-0" /> {selectedA.failed} Failed
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

                <Select value={runBId} onValueChange={setRunBId}>
                  <SelectTrigger className="w-full h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-bold text-sm">
                    <SelectValue placeholder="Select Run B" />
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

              {selectedB && (
                <div className="grid grid-cols-3 gap-3 mt-6 font-mono text-xs">
                  <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {selectedB.passed} Passed
                  </div>
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-1.5">
                    <XCircle className="h-4 w-4 shrink-0" /> {selectedB.failed} Failed
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 font-bold flex items-center justify-center gap-1.5">
                    <Clock className="h-4 w-4 shrink-0" /> {selectedB.duration}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delta Summary Banner */}
          {selectedA && selectedB && (
            <div className={`p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-none ${diffSummary.regressions > 0 ? 'bg-red-500/10 border-red-500/20' : diffSummary.fixes > 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-slate-50 dark:bg-white/5'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl ${diffSummary.regressions > 0 ? 'bg-red-500 text-white' : diffSummary.fixes > 0 ? 'bg-green-500 text-white' : 'bg-primary/20 text-primary'}`}>
                  {diffSummary.regressions > 0 ? <ShieldAlert className="h-7 w-7" /> : <Check className="h-7 w-7" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    {diffSummary.regressions > 0 ? `${diffSummary.regressions} Regressions Detected Between Runs` : diffSummary.fixes > 0 ? `${diffSummary.fixes} Issues Fixed Between Runs` : 'No Deltas / Fully Stable Comparison'}
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
          )}

          {/* Diff Table */}
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] overflow-hidden shadow-none">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-[10px] font-bold text-slate-400 dark:text-white/40 px-6 grid grid-cols-12 gap-4 uppercase tracking-wider">
              <div className="col-span-6">Test Case Identifier & Module</div>
              <div className="col-span-3 text-center">Run A Outcome</div>
              <div className="col-span-3 text-center">Run B Outcome</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {diffItems.map((item, idx) => {
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

                    <div className="col-span-3 flex items-center justify-center font-mono">
                      {item.a ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${item.a.status === 'Passed' ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'}`}>
                          {item.a.status === 'Passed' ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                          <span>{item.a.status.toUpperCase()} ({item.a.time})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-white/30 italic">Not in run</span>
                      )}
                    </div>

                    <div className="col-span-3 flex items-center justify-center font-mono">
                      {item.b ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${item.b.status === 'Passed' ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'}`}>
                          {item.b.status === 'Passed' ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                          <span>{item.b.status.toUpperCase()} ({item.b.time})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-white/30 italic">Not in run</span>
                      )}
                    </div>
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
