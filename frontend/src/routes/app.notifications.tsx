import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, CheckCircle2, AlertOctagon, AlertCircle, Clock, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const notifications = useApp((s) => s.notifications);
  const markAllRead = useApp((s) => s.markAllNotificationsRead);
  const markRead = useApp((s) => s.markNotificationRead);
  const deleteNotif = useApp((s) => s.deleteNotification);
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    if (filter === "CRITICAL") return n.type === "critical" || n.type === "warning" || n.type === "defect" || n.type === "alert";
    return true;
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1 flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" /> Workspace Notifications
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">
            Real-time alerts for failed execution suites, new defect logs, and sprint deadlines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={markAllRead}
            variant="outline"
            className="border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-white rounded-full px-5 h-10 shadow-sm flex items-center gap-2 text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            <CheckCircle2 className="h-4 w-4 text-green-500" /> Mark All as Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-[#14120B] p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 w-fit shadow-none relative z-10">
        <Filter className="h-4 w-4 text-slate-400 mx-2 shrink-0" />
        {["ALL", "UNREAD", "CRITICAL"].map((f) => {
          const count = f === "UNREAD" ? notifications.filter(x => !x.read).length : null;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === f
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <span>{f}</span>
              {count !== null && count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  filter === f ? "bg-white/20 text-white" : "bg-primary/10 text-primary font-bold"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-4 relative z-10">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            const dateStr = new Date(item.created_at).toLocaleString();
            return (
              <div
                key={item.id}
                onClick={() => !item.read && markRead(item.id)}
                className={`p-5 rounded-3xl border transition-all duration-300 relative flex items-start gap-4 cursor-pointer shadow-none ${
                  !item.read
                    ? "bg-white dark:bg-[#1a170e] border-primary/40 shadow-none"
                    : "bg-white/80 dark:bg-[#14120B]/80 border-slate-200 dark:border-white/10 opacity-80 hover:opacity-100"
                }`}
              >
                {/* Icon badge */}
                <div
                  className={`p-3.5 rounded-2xl shrink-0 border flex items-center justify-center ${
                    item.type === "critical" || item.type === "defect"
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : item.type === "warning" || item.type === "alert"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : item.type === "success"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-primary/10 text-primary border-primary/20"
                  }`}
                >
                  {(item.type === "critical" || item.type === "defect") && <AlertOctagon className="h-5 w-5" />}
                  {(item.type === "warning" || item.type === "alert") && <AlertCircle className="h-5 w-5" />}
                  {item.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {(item.type === "info" || item.type === "sprint") && <Clock className="h-5 w-5 text-primary" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/80 border border-slate-200 dark:border-white/10">
                      {item.type.toUpperCase()}
                    </span>
                    {!item.read && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-primary text-primary-foreground shadow-sm flex items-center gap-1.5 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground inline-block" />
                        NEW
                      </span>
                    )}
                    <span className="text-xs text-slate-400 dark:text-white/40 font-mono ml-auto">{dateStr}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1 flex items-center gap-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-white/70 leading-relaxed">{item.message}</p>
                </div>

                <div className="flex items-center gap-2 self-center ml-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotif(item.id);
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-16 text-center bg-white dark:bg-[#14120B] rounded-3xl border border-slate-200 dark:border-white/10 shadow-none">
            <Bell className="h-12 w-12 text-slate-300 dark:text-white/20 mx-auto mb-4" />
            <div className="text-slate-900 dark:text-white font-bold text-lg mb-1">All caught up!</div>
            <div className="text-slate-500 dark:text-white/60 text-sm">No notifications right now. Check back later.</div>
          </div>
        )}
      </div>
    </div>
  );
}

