import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageSkeleton } from "@/components/page-skeleton";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/agent-runs")({
  component: AgentRunsPage,
  head: () => ({ meta: [{ title: "Automated PR Checks — Speclane" }] }),
});

function AgentRunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/github-agent/runs');
      setRuns(res.data || []);
    } catch (e) {
      console.error(e);
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageSkeleton cards={3} rows={8} />;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold">Automated PR Checks</h1>
        <p className="text-muted-foreground text-sm">Monitor test results executed automatically by the GitHub AI Agent on Pull Requests.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-white/5 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Repository</th>
              <th className="px-4 py-3">PR #</th>
              <th className="px-4 py-3">Results</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-t border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(run.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{run.projects?.name || "Unknown Project"}</td>
                <td className="px-4 py-3 text-sm">{run.repo_name}</td>
                <td className="px-4 py-3 font-semibold">#{run.pull_request_number}</td>
                <td className="px-4 py-3">
                  {run.status === 'Completed' ? (
                     <div className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-white/60">
                        <span className="text-green-600 dark:text-green-400">{run.tests_passed} Passed</span>
                        {run.tests_fixed > 0 && <span className="text-yellow-600 dark:text-yellow-400">{run.tests_fixed} Auto-Fixed</span>}
                        {run.bugs_found > 0 && <span className="text-red-600 dark:text-red-400">{run.bugs_found} Bugs Found</span>}
                     </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {run.status === "Completed" ? (
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
                  No automated PR checks have run yet. Trigger one via GitHub or the Integrations page!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
