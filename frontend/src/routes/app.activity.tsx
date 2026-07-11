import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, History, Filter, Database, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/app/activity")({
  component: ActivityPage,
});

function ActivityPage() {
  const activities = useApp((s) => s.activities);
  const currentUser = useApp((s) => s.user);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("ALL");

  const filtered = activities.filter((a) => {
    const matchQuery = a.action.toLowerCase().includes(search.toLowerCase()) || (a.details || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "ALL" || a.category.toUpperCase() === filterCat.toUpperCase();
    return matchQuery && matchCat;
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1 flex items-center gap-3">
            <History className="h-8 w-8 text-primary" /> Workspace Activity Audit Log
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">
            Immutable audit log of all workspace changes, test executions, and administrative events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-white rounded-full px-5 h-10 shadow-sm flex items-center gap-2 text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            <Database className="h-4 w-4 text-primary" /> Export Audit Records
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-[#14120B] p-2 sm:px-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-none relative z-10">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search action or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-sm focus-visible:ring-primary/20 text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0">
          <Filter className="h-4 w-4 text-slate-400 shrink-0 mx-2" />
          {["ALL", "TEST CASE", "ENVIRONMENT", "DEFECT", "RELEASE", "SECURITY", "SYSTEM"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterCat === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table / List */}
      <div className="bg-white dark:bg-[#14120B] rounded-3xl border border-slate-200 dark:border-white/10 shadow-none overflow-hidden relative z-10">
        <div className="p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] font-semibold text-xs text-slate-400 uppercase tracking-wider px-6 grid grid-cols-12 gap-4">
          <div className="col-span-4">OPERATOR / USER</div>
          <div className="col-span-5">ACTION & TARGET</div>
          <div className="col-span-3 text-right">TIMESTAMP & IP</div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {filtered.map((item) => {
            const userName = item.user_id === currentUser?.id ? (currentUser?.name || "You") : "Team Operator";
            const userEmail = item.user_id === currentUser?.id ? (currentUser?.email || "operator@speclane.internal") : "operator@speclane.internal";
            const dateStr = new Date(item.created_at).toLocaleString();

            return (
              <div key={item.id} className="p-4 px-6 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors duration-150">
                {/* User info */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 uppercase shadow-sm">
                    {userName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{userName}</div>
                    <div className="text-xs text-slate-500 dark:text-white/50 truncate font-mono">{userEmail}</div>
                  </div>
                </div>

                {/* Action */}
                <div className="col-span-5 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/80 border border-slate-200 dark:border-white/10 shrink-0">
                      {item.category}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.action}</span>
                  </div>
                  {item.details && (
                    <div className="text-xs font-semibold text-primary truncate flex items-center gap-1 inline-flex hover:underline cursor-pointer">
                      <span>{item.details}</span> <ArrowUpRight className="h-3 w-3 shrink-0" />
                    </div>
                  )}
                </div>

                {/* Timestamp & IP */}
                <div className="col-span-3 text-right font-mono min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white mb-0.5 truncate">{dateStr}</div>
                  <div className="text-[10px] text-slate-400 dark:text-white/40 truncate">{item.ip_address || "127.0.0.1"}</div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-16 text-center text-slate-500 dark:text-white/40 text-sm">
              <History className="h-10 w-10 text-slate-300 dark:text-white/20 mx-auto mb-3" />
              <span>No activity records found matching your search.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

