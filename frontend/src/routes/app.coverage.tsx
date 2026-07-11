import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { PageSkeleton } from "@/components/page-skeleton";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/coverage")({
  component: CoveragePage,
  head: () => ({ meta: [{ title: "Requirement Coverage — Speclane" }] }),
});

function CoveragePage() {
  const { loading, requirements, testCases, projects } = useApp();

  const rows = useMemo(() => {
    return requirements.map((req) => {
      const mapped = testCases.filter(
        (tc) => tc.project_id === req.project_id && tc.module.toLowerCase() === req.title.toLowerCase()
      );
      const passed = mapped.filter((tc) => tc.status === "Passed").length;
      const failed = mapped.filter((tc) => tc.status === "Failed").length;
      const pending = mapped.filter((tc) => tc.status === "Pending").length;

      return {
        ...req,
        projectName: projects.find((p) => p.id === req.project_id)?.name || "Unknown",
        total: mapped.length,
        passed,
        failed,
        pending,
      };
    });
  }, [requirements, testCases, projects]);

  if (loading) return <PageSkeleton cards={4} rows={8} />;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold">Requirement Coverage</h1>
        <p className="text-muted-foreground text-sm">Trace each requirement to generated and executed test cases.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-white/5 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Requirement</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Mapped Cases</th>
              <th className="px-4 py-3">Passed</th>
              <th className="px-4 py-3">Failed</th>
              <th className="px-4 py-3">Pending</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 dark:border-white/10">
                <td className="px-4 py-3 font-medium">{row.title}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{row.projectName}</td>
                <td className="px-4 py-3">{row.total}</td>
                <td className="px-4 py-3 text-green-600">{row.passed}</td>
                <td className="px-4 py-3 text-red-500">{row.failed}</td>
                <td className="px-4 py-3 text-yellow-600">{row.pending}</td>
                <td className="px-4 py-3">
                  {row.total > 0 ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Covered</Badge>
                  ) : (
                    <Badge variant="outline">Uncovered</Badge>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No requirements found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
