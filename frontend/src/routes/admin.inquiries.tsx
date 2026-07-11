import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Check, Clock, Inbox, LogOut, RefreshCw, Search, ShieldCheck, Download, Building2, Mail, MessageSquare, AlertCircle, Sparkles, UserCheck, ArrowUpRight, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/inquiries")({
  component: AdminInquiriesPage,
  head: () => ({ meta: [{ title: "Platform Leads & CRM — SpecLab Operations" }] }),
});

interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  inquiryType: string;
  message: string;
  createdAt: string;
  status: "new" | "contacted" | "resolved";
}

function AdminInquiriesPage() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const getAdminToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("speclane_super_admin_token");
  };

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      toast.error("Super Admin login required");
      navigate({ to: "/admin/login" });
      return;
    }
    fetchInquiries();
  }, [navigate]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await api.get("/contact");
      setInquiries(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: "new" | "contacted" | "resolved") => {
    try {
      const updated = await api.patch(`/contact/${id}`, { status: newStatus });
      setInquiries((prev) => prev.map((item) => (item.id === id ? updated : item)));
      toast.success(`Inquiry status updated to ${newStatus}`);
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(updated);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("speclane_super_admin_token");
    await supabase.auth.signOut();
    toast.success("Super Admin session locked");
    navigate({ to: "/admin/login" });
  };

  const exportCSV = () => {
    if (inquiries.length === 0) return toast.error("No leads available to export");
    const headers = ["ID", "Name", "Email", "Company", "Inquiry Type", "Status", "Created At", "Message"];
    const rows = inquiries.map(i => [
      i.id,
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.email}"`,
      `"${i.company.replace(/"/g, '""')}"`,
      i.inquiryType,
      i.status,
      i.createdAt,
      `"${i.message.replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `speclane_crm_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CRM Leads exported successfully");
  };

  const stats = useMemo(() => {
    const total = inquiries.length;
    const newLeads = inquiries.filter(i => i.status === "new").length;
    const inProgress = inquiries.filter(i => i.status === "contacted").length;
    const resolved = inquiries.filter(i => i.status === "resolved").length;
    const responseRate = total > 0 ? Math.round(((inProgress + resolved) / total) * 100) : 100;
    return [
      { label: "Total Inquiries", value: total, icon: Inbox },
      { label: "Action Required", value: newLeads, icon: AlertCircle },
      { label: "In Discussion", value: inProgress, icon: MessageSquare },
      { label: "Resolved Leads", value: resolved, icon: Check },
    ];
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.company.toLowerCase().includes(search.toLowerCase()) ||
        item.message.toLowerCase().includes(search.toLowerCase());
      
      if (statusFilter === "all") return matchesSearch;
      return matchesSearch && item.status === statusFilter;
    });
  }, [inquiries, search, statusFilter]);

  const getInquiryTypeBadge = (type: string) => {
    return <Badge variant="outline" className="border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white/90 font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5">{type}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> New Lead
          </div>
        );
      case "contacted":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/90 border border-slate-200 dark:border-white/20 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/60" /> In Discussion
          </div>
        );
      case "resolved":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Resolved
          </div>
        );
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#14120B] text-slate-900 dark:text-white font-sans selection:bg-primary/30 transition-colors">
      {/* Platform Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#14120B]/80 backdrop-blur-xl px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/integrations/logos/speclane-white.png" alt="Speclane" className="h-8 w-8 object-contain shrink-0" />
              <span className="text-xl font-extrabold italic tracking-tight">
                <span className="text-slate-900 dark:text-white">Spec</span><span className="text-primary font-black drop-shadow-[0_0_8px_rgba(237,236,237,0.3)]">lane</span>
              </span>
            </div>
            <div className="h-5 w-px bg-slate-200 dark:bg-white/20" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold tracking-wide">
              <ShieldCheck className="h-4 w-4" /> SPECLAB OPERATIONS
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={exportCSV} variant="outline" size="sm" className="h-9 px-4 rounded-full border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button onClick={fetchInquiries} disabled={loading} variant="outline" size="sm" className="h-9 px-4 rounded-full border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} /> Refresh
            </Button>

            <Button onClick={handleLogout} variant="ghost" size="sm" className="h-9 px-4 rounded-full text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <LogOut className="h-3.5 w-3.5" /> Lock Session
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8 mt-4 pb-16">
        {/* Header Title Section matching app.index.tsx */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1">
              Platform Inquiries & CRM
            </h1>
            <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">
              Centralized lead management, live demo requests, and global enterprise communications.
            </p>
          </div>
        </div>

        {/* Metrics Grid exactly matching app.index.tsx stats styling */}
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 relative z-10">
          {stats.map((s) => (
            <div key={s.label} className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-6 shadow-none transition-all hover:-translate-y-1 hover:border-primary/40 group">
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-1">{s.value}</div>
                <div className="text-sm font-medium text-slate-500 dark:text-white/50 group-hover:text-slate-700 dark:group-hover:text-white/70 transition-colors">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Lead Table Console */}
        <Card className="bg-white dark:bg-[#14120B] border-slate-200 dark:border-white/10 shadow-none rounded-3xl overflow-hidden transition-colors">
          <CardHeader className="px-6 py-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Inbox className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Leads Registry</CardTitle>
                <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">{filteredInquiries.length} inquiries displayed</div>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 self-start sm:self-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStatusFilter("all")}
                  className={`h-8 px-3.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === "all" ? "bg-white text-slate-900 dark:text-black font-bold shadow" : "text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStatusFilter("new")}
                  className={`h-8 px-3.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === "new" ? "bg-white text-slate-900 dark:text-black font-bold shadow" : "text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  New
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStatusFilter("contacted")}
                  className={`h-8 px-3.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === "contacted" ? "bg-white text-slate-900 dark:text-black font-bold shadow" : "text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  In Discussion
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStatusFilter("resolved")}
                  className={`h-8 px-3.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === "resolved" ? "bg-white text-slate-900 dark:text-black font-bold shadow" : "text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  Resolved
                </Button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white/40" />
                <Input
                  placeholder="Search lead or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-primary transition-all"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-white/10">
                  <TableHead className="text-slate-500 dark:text-white/40 font-semibold text-xs h-12 px-6">Contact / Organization</TableHead>
                  <TableHead className="text-slate-500 dark:text-white/40 font-semibold text-xs h-12">Inquiry Type</TableHead>
                  <TableHead className="text-slate-500 dark:text-white/40 font-semibold text-xs h-12">Message Overview</TableHead>
                  <TableHead className="text-slate-500 dark:text-white/40 font-semibold text-xs h-12">Date</TableHead>
                  <TableHead className="text-slate-500 dark:text-white/40 font-semibold text-xs h-12">Status</TableHead>
                  <TableHead className="text-right text-slate-500 dark:text-white/40 font-semibold text-xs h-12 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-56 text-center text-slate-400 dark:text-white/40 font-light">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm font-medium">Fetching global leads...</span>
                        </div>
                      ) : (
                        <div className="space-y-1 py-6">
                          <Inbox className="h-10 w-10 text-slate-300 dark:text-white/20 mx-auto mb-2" />
                          <div className="text-base font-semibold text-slate-800 dark:text-white/80">No matching leads found</div>
                          <div className="text-xs text-slate-500 dark:text-white/50">Try adjusting your filters or search terms.</div>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInquiries.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      onClick={() => setSelectedInquiry(item)}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-white group-hover:border-primary/40 group-hover:text-primary transition-colors shrink-0">
                            {getInitials(item.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white text-sm tracking-tight truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                              {item.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-white/60 font-mono mt-0.5 truncate flex items-center gap-1.5">
                              {item.email}
                            </div>
                            <div className="text-xs text-primary font-semibold mt-1 flex items-center gap-1 truncate">
                              <Building2 className="h-3 w-3" /> {item.company}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        {getInquiryTypeBadge(item.inquiryType)}
                      </TableCell>

                      <TableCell className="py-4 max-w-sm">
                        <div className="text-sm text-slate-700 dark:text-white/80 truncate font-light leading-relaxed">
                          {item.message}
                        </div>
                      </TableCell>

                      <TableCell className="py-4 text-xs text-slate-500 dark:text-white/60 font-mono whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>

                      <TableCell className="py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end items-center gap-2">
                          {item.status === "new" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(item.id, "contacted")}
                              className="h-8 rounded-full bg-white dark:bg-white/5 text-slate-800 dark:text-white border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold px-4 transition-colors shadow-sm"
                            >
                              Start Discussion
                            </Button>
                          )}
                          {item.status !== "resolved" && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(item.id, "resolved")}
                              className="h-8 rounded-full bg-primary text-black hover:bg-primary/90 text-xs font-extrabold px-4 transition-colors shadow-sm flex items-center gap-1.5"
                            >
                              <Check className="h-3.5 w-3.5" /> Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Professional Lead Sheet Drawer / Modal */}
        <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
          {selectedInquiry && (
            <DialogContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 rounded-3xl text-slate-900 dark:text-white max-w-2xl p-8 shadow-none overflow-hidden transition-colors">

              <DialogHeader className="mb-6 border-b border-slate-200 dark:border-white/10 pb-6 flex flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-lg text-primary shadow-xl shrink-0">
                    {getInitials(selectedInquiry.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {getInquiryTypeBadge(selectedInquiry.inquiryType)}
                      <span className="text-slate-400 dark:text-white/40 text-xs font-mono">• Lead ID: {selectedInquiry.id}</span>
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedInquiry.name}</DialogTitle>
                    <div className="text-xs font-mono text-slate-600 dark:text-white/80 font-semibold mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-primary" /> {selectedInquiry.company}</span>
                      <span className="text-slate-300 dark:text-white/30">•</span>
                      <a href={`mailto:${selectedInquiry.email}`} className="flex items-center gap-1 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"><Mail className="h-3.5 w-3.5" /> {selectedInquiry.email}</a>
                    </div>
                  </div>
                </div>
                <div className="pt-1">{getStatusBadge(selectedInquiry.status)}</div>
              </DialogHeader>

              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-white/40 font-bold flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" /> Full Message Submission:
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 text-sm leading-relaxed whitespace-pre-wrap font-light shadow-inner">
                    {selectedInquiry.message}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 dark:text-white/40">RECORDED DATE:</span>
                    <div className="text-slate-900 dark:text-white font-medium mt-1">
                      {new Date(selectedInquiry.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-white/40">TIMESTAMP:</span>
                    <div className="text-slate-900 dark:text-white font-medium mt-1">
                      {new Date(selectedInquiry.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/10">
                  <div className="text-xs text-slate-400 dark:text-white/40 font-mono">
                    Secure CRM Registry · Speclane Cloud
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedInquiry.status === "new" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(selectedInquiry.id, "contacted")}
                        className="h-10 rounded-full bg-white dark:bg-white/10 text-slate-800 dark:text-white border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/20 font-semibold px-5 transition-colors"
                      >
                        Start Discussion
                      </Button>
                    )}
                    {selectedInquiry.status !== "resolved" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(selectedInquiry.id, "resolved")}
                        className="h-10 rounded-full bg-primary text-black hover:bg-primary/90 font-extrabold px-6 shadow-lg transition-all"
                      >
                        <Check className="h-4 w-4 mr-1.5" /> Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </main>
    </div>
  );
}
