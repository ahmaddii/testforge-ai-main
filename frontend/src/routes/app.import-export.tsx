import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DownloadCloud, FileSpreadsheet, Sparkles, FolderGit2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/page-skeleton";

export const Route = createFileRoute("/app/import-export")({
  component: DataExportPage,
  head: () => ({ meta: [{ title: "Workspace Backup & Export — Speclane" }] }),
});

function DataExportPage() {
  const { projects, testCases, requirements, defects, testPlans, executionRuns, fetchData, loading } = useApp();
  const [targetProjectId, setTargetProjectId] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (projects.length > 0 && !targetProjectId) {
      setTargetProjectId(projects[0].id);
    }
  }, [projects, targetProjectId]);

  // Real Export JSON Trigger
  const handleExportJSON = async () => {
    try {
      const relevantCases = targetProjectId === "all" ? testCases : testCases.filter(t => t.project_id === targetProjectId);
      const relevantDefects = targetProjectId === "all" ? defects : defects.filter(d => d.project_id === targetProjectId);
      const relevantPlans = targetProjectId === "all" ? testPlans : testPlans.filter(p => p.project_id === targetProjectId);

      const exportBundle = {
        meta: {
          version: "1.0.0",
          exported_at: new Date().toISOString(),
          project_id: targetProjectId,
          project_name: targetProjectId === "all" ? "All Projects" : projects.find(p => p.id === targetProjectId)?.name
        },
        workspace: {
          projects: targetProjectId === "all" ? projects : projects.filter(p => p.id === targetProjectId),
          requirements: targetProjectId === "all" ? requirements : requirements.filter(r => r.project_id === targetProjectId),
          testCases: relevantCases,
          defects: relevantDefects,
          testPlans: relevantPlans,
          executionRuns: targetProjectId === "all" ? executionRuns : executionRuns.filter(r => r.project_id === targetProjectId)
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `speclane_backup_${targetProjectId}_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      await api.post("/activity", {
        action: `Exported full workspace JSON backup for ${exportBundle.meta.project_name}`,
        category: "Export",
        project_id: targetProjectId === "all" ? projects[0]?.id : targetProjectId
      }).catch(() => {});
      await api.post("/notifications", {
        title: "Workspace Export Complete",
        message: `JSON backup bundle (${relevantCases.length} test cases) successfully downloaded.`,
        type: "success",
        project_id: targetProjectId === "all" ? projects[0]?.id : targetProjectId
      }).catch(() => {});

      toast.success("Workspace JSON successfully exported and downloaded!");
    } catch (err) {
      toast.error("Failed to generate JSON export.");
    }
  };

  // Real Export CSV Trigger
  const handleExportCSV = async () => {
    try {
      const relevantCases = targetProjectId === "all" ? testCases : testCases.filter(t => t.project_id === targetProjectId);
      if (relevantCases.length === 0) {
        return toast.error("No test cases found in selected project to export.");
      }

      const headers = ["ID", "Project ID", "Module", "Title", "Steps", "Expected Result", "Type", "Priority", "Status", "Created At"];
      const rows = relevantCases.map(tc => [
        `"${tc.id}"`,
        `"${tc.project_id}"`,
        `"${(tc.module || 'General').replace(/"/g, '""')}"`,
        `"${tc.title.replace(/"/g, '""')}"`,
        `"${(tc.steps || '').replace(/"/g, '""')}"`,
        `"${(tc.expected || '').replace(/"/g, '""')}"`,
        `"${tc.type || 'positive'}"`,
        `"${tc.priority || 'High'}"`,
        `"${tc.status}"`,
        `"${tc.created_at || new Date().toISOString()}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = url;
      downloadAnchor.setAttribute("download", `speclane_test_cases_${targetProjectId}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      await api.post("/activity", {
        action: `Exported test cases CSV spreadsheet for project`,
        category: "Export",
        project_id: targetProjectId === "all" ? projects[0]?.id : targetProjectId
      }).catch(() => {});
      await api.post("/notifications", {
        title: "CSV Export Complete",
        message: `Spreadsheet archive (${relevantCases.length} cases) successfully generated.`,
        type: "success",
        project_id: targetProjectId === "all" ? projects[0]?.id : targetProjectId
      }).catch(() => {});

      toast.success("CSV spreadsheet successfully exported!");
    } catch (err) {
      toast.error("Failed to generate CSV export.");
    }
  };

  if (loading && projects.length === 0) {
    return <PageSkeleton cards={1} rows={8} />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-4xl relative min-h-[600px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 bg-white/40 dark:bg-[#14120B]/40 p-6 rounded-3xl border border-white/20 dark:border-white/10 shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Secure Data Custody
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1 flex items-center gap-3">
            <DownloadCloud className="h-8 w-8 text-primary" /> Workspace Backup & Export Studio
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">
            Generate full offline JSON archives or spreadsheet CSV backups of your repository data anytime.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Project Scope:</label>
          <Select value={targetProjectId} onValueChange={setTargetProjectId}>
            <SelectTrigger className="w-64 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white font-bold h-11 px-4 shadow-sm">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#14120B] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-medium">
              <SelectItem value="all" className="focus:bg-slate-50 dark:focus:bg-white/10 font-bold">All Workspace Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id} className="focus:bg-slate-50 dark:focus:bg-white/10 font-medium">{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative z-10">
          {/* Real Export Panel */}
          <div className="bg-white dark:bg-[#14120B] p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none space-y-8 relative overflow-hidden border-t-4 border-t-primary">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-5">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <DownloadCloud className="h-7 w-7 text-primary" /> Complete Workspace Export
                </h3>
                <span className="text-xs uppercase font-extrabold text-primary font-mono bg-primary/10 px-3.5 py-1 rounded-full tracking-wider">Outbound Backup</span>
              </div>

              <p className="text-base text-slate-600 dark:text-white/70 leading-relaxed">
                Ensure total data ownership and prevent vendor lock-in. Generate an instant offline backup containing all repository test cases, execution runs, defect logs, and project metadata directly to your local file system.
              </p>

              <div className="space-y-5 pt-6 border-t border-slate-100 dark:border-white/10">
                {/* Standard JSON Export */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 gap-6 group hover:border-primary/50 transition-all shadow-none">
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Full Workspace JSON Backup
                    </div>
                    <div className="text-sm text-slate-500 dark:text-white/60">Complete raw dataset structured for automated API parsing, CI/CD archiving, and full restoration.</div>
                  </div>
                  <Button 
                    onClick={handleExportJSON} 
                    className="rounded-full font-bold text-sm gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 shrink-0 shadow-none"
                  >
                    <DownloadCloud className="h-5 w-5" /> Download JSON Backup
                  </Button>
                </div>

                {/* Spreadsheet CSV Export */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 gap-6 group hover:border-green-500/50 transition-all shadow-none">
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Test Cases Spreadsheet (CSV)
                    </div>
                    <div className="text-sm text-slate-500 dark:text-white/60">Flattened scenario tables ready for Microsoft Excel, Google Sheets, Tableau, and executive reporting.</div>
                  </div>
                  <Button 
                    onClick={handleExportCSV} 
                    className="rounded-full font-bold text-sm gap-2.5 bg-green-600 hover:bg-green-700 text-white h-12 px-8 shrink-0 border-none shadow-none"
                  >
                    <FileSpreadsheet className="h-5 w-5" /> Download CSV Bundle
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3.5 text-sm text-slate-600 dark:text-white/70 font-medium">
              <FolderGit2 className="h-6 w-6 text-primary shrink-0 animate-pulse" />
              <span>Archive scope is currently set to: <strong className="text-slate-900 dark:text-white underline decoration-primary font-bold">{targetProjectId === "all" ? "All Workspace Projects" : projects.find(p => p.id === targetProjectId)?.name}</strong></span>
            </div>
          </div>
        </div>
    </div>
  );
}
