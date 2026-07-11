import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { PageSkeleton } from "@/components/page-skeleton";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/runs")({
  component: RunsPage,
  head: () => ({ meta: [{ title: "Analysis Runs — Speclane" }] }),
});

function RunsPage() {
  const { loading, reports, projects } = useApp();

  const runs = useMemo(() => {
    return reports.map((report) => {
      const project = projects.find((p) => p.id === report.project_id);
      const runStatus = project?.status === "Failed" ? "Failed" : "Completed";
      return {
        ...report,
        runStatus,
      };
    });
  }, [reports, projects]);

  if (loading) return <PageSkeleton cards={3} rows={8} />;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold">Analysis Runs</h1>
        <p className="text-muted-foreground text-sm">Monitor generation runs and their outcomes over time.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-white/5 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Generated At</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3">Test Cases</th>
              <th className="px-4 py-3">Coverage</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-t border-slate-100 dark:border-white/10">
                <td className="px-4 py-3 text-sm">{new Date(run.generated_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{run.project_name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{run.requirement_name || "All Modules"}</td>
                <td className="px-4 py-3">{run.test_case_count}</td>
                <td className="px-4 py-3">{run.coverage}%</td>
                <td className="px-4 py-3">
                  {run.runStatus === "Completed" ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Completed</Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>
                  )}
                </td>
              </tr>
            ))}
            {runs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No analysis runs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
