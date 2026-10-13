import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, FileText, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { PageSkeleton } from "@/components/page-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { exportPDF, exportCSV } from "@/lib/export";
import { toast } from "sonner";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Reports — Speclane" }] }),
});

function ReportsPage() {
  const { reports, testCases, fetchData, loading, deleteReport } = useApp();
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [selectedId, setSelectedId] = useState(reports[0]?.id);
  const selected = reports.find((r) => r.id === selectedId) || reports[0];
  const previewCases = selected ? testCases.filter((t) => t.report_id === selected.id).slice(0, 8) : [];

  if (loading) {
    return <PageSkeleton cards={4} rows={7} />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl relative min-h-[calc(100vh-80px)]">

      <div className="relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1">Reports</h1>
        <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">Review AI-generated insights and download your technical documentation.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4 relative z-10">
        {/* Report Selector Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between mb-2 px-1">
             <h3 className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">History</h3>
             <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40">{reports.length}</Badge>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {reports.map((r) => (
              <button 
                key={r.id} 
                onClick={() => setSelectedId(r.id)} 
                className={`group w-full text-left rounded-2xl border p-4 transition-all duration-300 relative overflow-hidden ${
                  selected?.id === r.id 
                    ? "border-primary/50 bg-primary/10 shadow-none" 
                    : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.08] hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                {selected?.id === r.id && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
                )}
                <div className="flex items-center justify-between mb-1 relative z-10">
                  <div className={`font-bold text-sm ${selected?.id === r.id ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                    {r.project_name} <span className="text-primary/60 dark:text-white/30 font-medium ml-1">— {r.requirement_name || 'All'}</span>
                  </div>
                  <div className="text-[10px] font-black text-green-600 dark:text-green-400">{r.coverage}%</div>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-white/40 group-hover:text-slate-600 dark:group-hover:text-white/60 transition-colors relative z-10">
                   {new Date(r.generated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="mt-2 text-[10px] font-medium text-slate-300 dark:text-white/30 relative z-10">{r.test_case_count} scenarios</div>
              </button>
            ))}
            {reports.length === 0 && (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                <p className="text-xs text-slate-400 dark:text-white/30">No reports generated yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Report View */}
        <div className="lg:col-span-3 space-y-6">
          {selected ? (
            <>
              <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-6 sm:p-8 shadow-none relative overflow-hidden">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{selected.project_name}</h2>
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/40">
                      <span className="font-mono">Generated {new Date(selected.generated_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => { exportCSV(previewCases, `${selected.project_name}-test-cases.csv`); toast.success("CSV downloaded"); }} 
                      className="rounded-full h-11 px-6 font-bold text-sm border-slate-200 dark:border-white/10"
                    >
                      <Download className="mr-2 h-4 w-4" /> CSV
                    </Button>
                    <Button 
                      onClick={() => { exportPDF(previewCases, `${selected.project_name} — Test Report`); toast.success("PDF downloaded"); }} 
                      className="gradient-bg text-primary-foreground shadow-none rounded-full h-11 px-8 font-bold text-sm"
                    >
                      <FileText className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                    <Button
                      onClick={async () => {
                        await deleteReport(selected.id);
                        toast.success("Test report deleted");
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-full hover:bg-red-500/10 hover:text-red-500 text-slate-400"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 relative z-10 mb-8">
                  <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/30 font-bold mb-1">Scenarios</div>
                    <span className="font-black text-slate-900 dark:text-white">{selected.test_case_count}</span>
                  </div>
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 group hover:border-primary/30 transition-colors">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-1">Risk Coverage</div>
                    <div className="text-3xl font-black text-green-600 dark:text-green-400">{selected.coverage}%</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 group hover:border-primary/30 transition-colors">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-1">AI Confidence</div>
                    <div className="text-3xl font-black text-primary">98.4%</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#14120B] overflow-hidden relative z-10 shadow-none">
                  <div className="bg-slate-100 dark:bg-white/5 px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">
                      <FileText className="h-3 w-3" /> Technical Preview
                    </div>
                    <Badge className="bg-primary text-primary-foreground border-primary/20 text-[9px] font-bold px-2 py-0">LATEST</Badge>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {previewCases.map((t) => (
                      <div key={t.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-sm text-slate-800 dark:text-white/90">{t.title}</div>
                          <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold text-slate-500 dark:text-white/70">{t.module}</div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-white/40 mb-3 leading-relaxed">{t.steps}</div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-300 dark:text-white/20 font-bold uppercase tracking-tighter">Expected:</span>
                          <span className="text-slate-600 dark:text-white/60">{t.expected}</span>
                        </div>
                      </div>
                    ))}
                    {previewCases.length === 0 && (
                      <div className="p-20 text-center text-xs text-slate-400 dark:text-white/30 italic">No scenarios found for this project.</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[400px] rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] shadow-none flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
               <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-300 dark:text-white/20 mb-4 shadow-none relative z-10">
                 <FileText className="h-8 w-8" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">Select a report</h3>
               <p className="text-slate-500 dark:text-white/40 max-w-xs mx-auto text-sm relative z-10">Choose a generation record from the sidebar to review your test plan analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
