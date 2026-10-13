import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Sparkles, Wand2, ArrowRight, CheckCircle2, Copy, FileText, PlusCircle, Check, Zap, FolderGit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/app/ai-generator")({
  component: AIGeneratorPage,
});

type GeneratedCase = {
  id: string;
  title: string;
  module: string;
  priority: "High" | "Medium" | "Low";
  steps: string[];
  expected: string;
};

function AIGeneratorPage() {
  const navigate = useNavigate();
  const requirements = useApp((s) => s.requirements);
  const projects = useApp((s) => s.projects);
  const fetchData = useApp((s) => s.fetchData);
  const addTestCase = useApp((s) => s.addTestCase);
  const billing = useApp((s) => s.billing);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [selectedReq, setSelectedReq] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [results, setResults] = useState<GeneratedCase[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [limitError, setLimitError] = useState<{ plan?: string; limit?: number } | null>(null);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const filteredRequirements = useMemo(() => {
    return selectedProjectId ? requirements.filter(r => r.project_id === selectedProjectId) : requirements;
  }, [requirements, selectedProjectId]);

  const handleGenerate = async () => {
    if (!selectedReq && !customPrompt) {
      toast.error("Please select a requirement or enter custom prompt");
      return;
    }

    const targetReq = requirements.find(r => r.id === selectedReq);
    const targetProjectId = targetReq?.project_id || selectedProjectId || projects[0]?.id;
    if (!targetProjectId) {
      toast.error("No active project found in workspace. Please create a project first.");
      return;
    }

    setGenerating(true);
    setResults([]);

    try {
      let targetReqId = selectedReq === "ALL" ? undefined : selectedReq;

      // If user typed a custom prompt instead of choosing an existing requirement, create one on the fly!
      if (!targetReqId && customPrompt) {
        const newReq = await api.post('/requirements', {
          project_id: targetProjectId,
          title: customPrompt.length > 40 ? customPrompt.substring(0, 40) + "..." : customPrompt,
          description: customPrompt,
          priority: "High",
          status: "Approved",
        });
        targetReqId = newReq.id;
      }

      // Call the live AI generation backend!
      await api.post('/generate', {
        project_id: targetProjectId,
        requirement_id: targetReqId ? targetReqId : undefined,
      });

      // Pull down the newly generated test cases from Supabase database
      await fetchData();

      // Filter top recent test cases generated for this project
      const currentTestCases = useApp.getState().testCases;
      const newlyGenerated = currentTestCases.slice(0, 6);

      setResults(newlyGenerated.map(tc => ({
        id: tc.id,
        title: tc.title,
        module: tc.module || "AI Discovered",
        priority: tc.priority || "High",
        steps: tc.steps ? tc.steps.split('\n') : ["Execute verification steps"],
        expected: tc.expected || "Assert successful outcome",
      })));

      toast.success(selectedReq === "ALL" ? "Gemini AI analyzed all workspace requirements and generated full test suite!" : "Gemini AI successfully analyzed requirement and synthesized test cases!");
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      if (err?.code === "billing_limit_exceeded" || err?.error?.includes("monthly AI generation limit")) {
        setLimitError(err?.details || { plan: "free", limit: 1 });
      } else {
        toast.error(err?.error || err?.message || "Failed to generate test cases via AI.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToSuite = (item: GeneratedCase) => {
    if (savedIds.includes(item.id)) return;
    addTestCase({
      title: item.title,
      module: item.module,
      priority: item.priority as any,
      steps: item.steps.join("\n"),
      expected: item.expected,
      status: "Pending",
    });
    setSavedIds([...savedIds, item.id]);
    toast.success("Test case saved to repository!");
  };

  const handleSaveAll = () => {
    results.forEach((item) => handleSaveToSuite(item));
    toast.success("All generated cases saved!");
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl relative min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1 flex items-center gap-3">
            <Wand2 className="h-8 w-8 text-primary" /> Autonomous AI Test Generator
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">
            Harness Google Gemini 2.5 Pro to automatically analyze product requirements and synthesize BDD test cases.
          </p>
        </div>
      </div>

      {/* Generator Form Card */}
      <div className="bg-white dark:bg-[#14120B] p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Project Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-white/80 uppercase tracking-wider flex items-center gap-1.5">
              <FolderGit2 className="h-4 w-4 text-primary" /> Select Project
            </label>
            <Select
              value={selectedProjectId}
              onValueChange={(val) => {
                setSelectedProjectId(val);
                setSelectedReq("");
              }}
            >
              <SelectTrigger className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-semibold shadow-sm">
                <SelectValue placeholder="Choose Project" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl shadow-2xl z-50">
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="focus:bg-slate-50 dark:focus:bg-white/10 text-xs font-medium py-2.5">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Requirement Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-white/80 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" /> Select Requirement
            </label>
            <Select
              value={selectedReq}
              onValueChange={(val) => {
                setSelectedReq(val);
                setCustomPrompt("");
                const reqObj = requirements.find(r => r.id === val);
                if (reqObj && reqObj.project_id) {
                  setSelectedProjectId(reqObj.project_id);
                }
              }}
            >
              <SelectTrigger className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-semibold shadow-sm">
                <SelectValue placeholder="Choose Requirement" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl shadow-2xl z-50 max-h-80">
                <SelectItem value="ALL" className="focus:bg-slate-50 dark:focus:bg-white/10 text-xs font-bold py-3">
                  All Project Requirements (Full Suite)
                </SelectItem>
                {filteredRequirements.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="focus:bg-slate-50 dark:focus:bg-white/10 text-xs font-medium py-2.5">
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-white/80 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> Or Custom User Story
            </label>
            <Input
              placeholder="e.g. As a shopper, I want to checkout..."
              value={customPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value);
                setSelectedReq("");
              }}
              className="h-12 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 font-medium text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
              <div className="text-xs text-slate-500 dark:text-white/50">
                Powered by Gemini Advanced Synthesis Engine · Model: <span className="font-mono text-primary font-bold">gemini-2.5-pro</span>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="rounded-full px-8 h-12 shadow-none hover:scale-105 transition-all text-sm font-bold flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <Sparkles className="h-5 w-5 animate-spin" /> Generating Tests with Gemini...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" /> Generate Tests with Gemini
                  </>
                )}
              </Button>
            </div>

            {generating && (
              <div className="p-8 text-center space-y-4 py-12">
                <div className="relative w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent animate-laser-h" />
                </div>
                <div className="text-sm font-bold text-primary animate-pulse flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" /> Analyzing requirement AST and generating edge cases...
                </div>
              </div>
            )}
          </div>

          {/* Generated Results */}
          {results.length > 0 && (
            <div className="space-y-6 pt-4 animate-in fade-in zoom-in-95 duration-500 relative z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" /> Synthesized Test Cases ({results.length})
                </h2>
                <Button onClick={handleSaveAll} variant="outline" className="rounded-full px-5 border-primary/40 text-primary hover:bg-primary/10">
                  Save All to Repository
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.map((item) => {
                  const isSaved = savedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-[#14120B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none flex flex-col justify-between relative overflow-hidden group hover:border-primary/40 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-primary/10 text-primary uppercase">
                            {item.module}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">
                            {item.priority}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{item.title}</h3>

                        <div className="space-y-1.5 mb-6 text-xs bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-200 dark:border-white/10 font-mono">
                          <div className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-bold tracking-wider mb-1">Execution Steps:</div>
                          {item.steps.map((step, sIdx) => (
                            <div key={sIdx} className="text-slate-600 dark:text-white/70 flex items-start gap-1.5">
                              <span className="text-primary font-bold">{sIdx + 1}.</span> {step}
                            </div>
                          ))}
                        </div>

                        <div className="text-xs mb-6">
                          <div className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-bold tracking-wider mb-1 font-mono">Expected Outcome:</div>
                          <div className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1.5 bg-green-500/5 p-2.5 rounded-xl border border-green-500/10">
                            <CheckCircle2 className="h-4 w-4 shrink-0" /> {item.expected}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleSaveToSuite(item)}
                        disabled={isSaved}
                        className={`w-full rounded-full h-10 font-bold flex items-center justify-center gap-2 ${isSaved ? "bg-green-500 text-white shadow-none opacity-100" : "shadow-none hover:scale-[1.02]"
                          }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="h-4 w-4" /> Saved to Suite
                          </>
                        ) : (
                          <>
                            <PlusCircle className="h-4 w-4" /> Save Test Case
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
    </div>
  );
}
