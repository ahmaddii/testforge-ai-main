import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tag, CheckCircle2, AlertTriangle, ShieldCheck, Milestone, Calendar, ArrowRight, Bug, Layers, PlayCircle, Plus, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp } from "@/lib/store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/app/releases")({
  component: ReleasesPage,
});

function ReleasesPage() {
  const releases = useApp((s) => s.releases);
  const signOffRelease = useApp((s) => s.signOffRelease);
  const addRelease = useApp((s) => s.addRelease);
  const deleteRelease = useApp((s) => s.deleteRelease);
  const defects = useApp((s) => s.defects);
  const executionRuns = useApp((s) => s.executionRuns);
  const reports = useApp((s) => s.reports);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [newRel, setNewRel] = useState({ version: "", title: "", release_date: "" });

  const filtered = releases.filter(r => r.version.toLowerCase().includes(search.toLowerCase()) || r.title.toLowerCase().includes(search.toLowerCase()));

  const signOff = (id: string) => {
    signOffRelease(id);
  };

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRel.version || !newRel.title) return;
    await addRelease(newRel);
    setIsOpen(false);
    setNewRel({ version: "", title: "", release_date: "" });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          * {
            color: #000 !important;
            text-shadow: none !important;
          }
          .bg-white\\/50, .bg-\\[\\#14120B\\] {
            background-color: transparent !important;
            border-color: #e2e8f0 !important;
          }
          /* Preserve alert colors but make text dark */
          .text-red-500 { color: #dc2626 !important; }
          .text-green-500 { color: #16a34a !important; }
          .text-amber-500 { color: #d97706 !important; }
          .text-blue-500 { color: #2563eb !important; }
          
          /* Preserve progress bars */
          .bg-red-500 { background-color: #dc2626 !important; }
          .bg-green-500 { background-color: #16a34a !important; }
          .bg-amber-500 { background-color: #d97706 !important; }
          
          /* Hide non-printable elements */
          button { display: none !important; }
        }
      `}</style>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#14120B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
              Should Have · Readiness
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Milestone className="h-7 w-7 text-primary" /> Release Readiness Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-white/60">
            Map execution runs and defect rates to specific product version milestones to verify production readiness.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search version tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 h-10 rounded-full border-white/20 bg-background/50 pl-4 text-sm"
          />
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full px-5 shadow-none hover:scale-105 transition-all flex items-center gap-2 font-bold text-sm shrink-0">
                <Plus className="h-4 w-4" /> Register Milestone
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl glass-strong border-white/10 p-6 shadow-none">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Register Release Milestone</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRelease} className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-white/70">Version Tag</label>
                  <Input
                    placeholder="e.g. v2.9.0-rc1"
                    value={newRel.version}
                    onChange={(e) => setNewRel({ ...newRel, version: e.target.value })}
                    className="rounded-xl border-white/10 bg-background/50 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-white/70">Milestone Title</label>
                  <Input
                    placeholder="e.g. Q3 Automated Billing Pod"
                    value={newRel.title}
                    onChange={(e) => setNewRel({ ...newRel, title: e.target.value })}
                    className="rounded-xl border-white/10 bg-background/50 font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-white/70">Target Release Date</label>
                  <Input
                    type="date"
                    value={newRel.release_date}
                    onChange={(e) => setNewRel({ ...newRel, release_date: e.target.value })}
                    className="rounded-xl border-white/10 bg-background/50 font-mono"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-full">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-full shadow-none font-bold">
                    Register Milestone
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((rel) => {
          // Calculate live blocking bugs from actual defect tracker
          const projectDefects = defects.filter(d => (!rel.project_id || d.project_id === rel.project_id) && (d.status === "Open" || d.status === "In Progress"));
          const liveBlockingBugs = projectDefects.filter(d => d.severity === "Critical" || d.severity === "Major").length;
          
          // Calculate live runs executed
          const projectRuns = executionRuns.filter(r => !rel.project_id || r.project_id === rel.project_id);
          const liveRunsExecuted = projectRuns.length;

          // Calculate live coverage from the latest generated report
          const projectReports = reports.filter(r => !rel.project_id || r.project_id === rel.project_id).sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
          const liveCoverage = projectReports.length > 0 ? projectReports[0].coverage : 0;

          // Calculate live readiness score (starts at 100%, drops by 15% per blocking bug)
          const liveReadiness = Math.max(0, 100 - (liveBlockingBugs * 15));
          const isSignedOff = rel.status === "Released";
          const finalReadiness = isSignedOff ? 100 : liveReadiness;

          const downloadPDF = () => {
            const doc = new jsPDF();
            
            doc.setFontSize(22);
            doc.setTextColor(15, 23, 42); // slate-900
            doc.text(`Release Scorecard: ${rel.version}`, 14, 20);
            
            doc.setFontSize(14);
            doc.text(rel.title, 14, 30);
            
            doc.setFontSize(11);
            doc.setTextColor(100, 116, 139); // slate-500
            doc.text(`Target Release Date: ${rel.release_date}`, 14, 40);
            
            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.text(`Readiness Score: ${finalReadiness}%`, 14, 55);
            doc.text(`Runs Executed: ${liveRunsExecuted}`, 14, 65);
            doc.text(`Blocking Bugs: ${liveBlockingBugs}`, 14, 75);
            doc.text(`Test Coverage: ${liveCoverage}%`, 14, 85);
            
            doc.text(`Status: ${isSignedOff ? "Signed Off & Deployed" : liveBlockingBugs > 0 ? "At Risk" : "Ready"}`, 14, 95);

            autoTable(doc, {
              startY: 105,
              head: [['Metric', 'Value', 'Status']],
              body: [
                ['Readiness', `${finalReadiness}%`, finalReadiness >= 90 ? 'Excellent' : finalReadiness >= 80 ? 'Good' : 'Critical'],
                ['Blocking Bugs', liveBlockingBugs.toString(), liveBlockingBugs === 0 ? 'Pass' : 'Fail'],
                ['Coverage', `${liveCoverage}%`, liveCoverage >= 80 ? 'Pass' : 'Warning']
              ],
            });
            
            doc.save(`${rel.version}-release-scorecard.pdf`);
          };

          return (
            <div
              key={rel.id}
              className="group bg-white dark:bg-[#14120B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none hover:border-primary hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none rounded-bl-full" />
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
                    {rel.version}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${isSignedOff
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : liveBlockingBugs > 0
                        ? "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse"
                        : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      }`}
                  >
                    {isSignedOff ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                    {isSignedOff ? "Released" : liveBlockingBugs > 0 ? "At Risk" : "Ready"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{rel.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/50 print:text-black mb-6 font-mono">
                  <Calendar className="h-3.5 w-3.5" /> Target Release: {rel.release_date}
                </div>

                {/* Readiness Meter */}
                <div className="bg-slate-50/50 dark:bg-[#14120B]/30 p-4 rounded-2xl border border-white/10 mb-6 space-y-3 print:bg-white print:border-slate-300">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600 dark:text-white/70 print:text-black">Readiness Score</span>
                    <span className={`text-base font-black font-mono ${finalReadiness >= 90 ? "text-green-500" : finalReadiness >= 80 ? "text-amber-500" : "text-red-500"}`}>
                      {finalReadiness}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${finalReadiness}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${finalReadiness >= 90 ? "bg-green-500" : finalReadiness >= 80 ? "bg-amber-500" : "bg-red-500"
                        }`}
                    />
                  </div>
                </div>

                {/* Stats breakdown */}
                <div className="grid grid-cols-3 gap-3 mb-6 font-mono">
                  <div className="p-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/10 flex flex-col items-center print:border-slate-300">
                    <PlayCircle className="h-4 w-4 text-primary mb-1" />
                    <span className="text-lg font-black text-slate-900 dark:text-white print:text-black">{liveRunsExecuted}</span>
                    <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-bold tracking-wider print:text-black">Runs Executed</span>
                  </div>
                  <div className={`p-3 rounded-2xl border flex flex-col items-center ${liveBlockingBugs > 0 ? "bg-red-500/10 border-red-500/20 text-red-500 animate-pulse" : "bg-white/50 dark:bg-white/5 border-white/10 print:border-slate-300"}`}>
                    <Bug className="h-4 w-4 mb-1" />
                    <span className="text-lg font-black">{liveBlockingBugs}</span>
                    <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-bold tracking-wider print:text-black">Blocking Bugs</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/10 flex flex-col items-center print:border-slate-300">
                    <ShieldCheck className="h-4 w-4 text-green-500 mb-1" />
                    <span className="text-lg font-black text-green-500">{liveCoverage}%</span>
                    <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-bold tracking-wider print:text-black">Test Coverage</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between print:border-slate-300">
                <span className="text-xs text-slate-400 dark:text-white/40 font-mono truncate max-w-[120px] print:text-black">ID: {rel.id}</span>
                <div className="flex items-center gap-2">
                  <Button onClick={downloadPDF} variant="ghost" size="icon" title="Export PDF Scorecard" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary text-slate-400">
                    <Download className="h-4 w-4" />
                  </Button>
                  {rel.status !== "Released" ? (
                    <Button onClick={() => signOff(rel.id)} disabled={liveBlockingBugs > 0} className="rounded-full shadow-none text-xs px-5 h-9 font-bold">
                      Sign Off Release
                    </Button>
                  ) : (
                    <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Signed Off & Deployed
                    </span>
                  )}
                  <Button onClick={() => deleteRelease(rel.id)} variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-red-500/10 hover:text-red-500 text-slate-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 dark:text-white/40">
            No release milestones found in repository. Click "Register Milestone" above to create one.
          </div>
        )}
      </div>
    </div>
  );
}
