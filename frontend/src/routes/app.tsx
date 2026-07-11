import { createFileRoute, Outlet, Link, useNavigate, useRouterState, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard, FolderGit2, ListChecks, FlaskConical, FileBarChart, Settings, Search, LogOut, ChevronRight, Bug, Activity, PlugZap, UsersRound, MessageSquare, Video, CreditCard, Inbox, Layers, Server, History, Bell, Sparkles, Milestone, TrendingUp, GitCompare, ArrowDownUp, DownloadCloud, FileCode2, LifeBuoy, Wand2, GitPullRequest
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarGroupLabel,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useApp } from "@/lib/store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const Route = createFileRoute("/app")({
  component: AppLayout,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (window.location.hash.includes("access_token") || window.location.hash.includes("refresh_token") || window.location.search.includes("code")) {
      return;
    }
    try {
      const raw = localStorage.getItem("speclane-store");
      if (!raw) throw new Error("no");
      const parsed = JSON.parse(raw);
      if (!parsed?.state?.user) throw new Error("no");
    } catch {
      throw redirect({ to: "/login" });
    }
  },
});

type NavItem = { to: string; label: string; icon: any; exact?: boolean; pro?: boolean; requiredFeature?: string };
const nav: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/projects", label: "Projects", icon: FolderGit2 },
  { to: "/app/activity", label: "Activity Log", icon: History },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/requirements", label: "Requirements", icon: ListChecks },
  { to: "/app/test-plans", label: "Test Plans", icon: Layers },
  { to: "/app/releases", label: "Releases", icon: Milestone },
  { to: "/app/environments", label: "Environments", icon: Server },
  { to: "/app/ai-generator", label: "AI Test Generator", icon: Sparkles },
  { to: "/app/test-cases", label: "Test Cases", icon: FlaskConical },
  { to: "/app/runs", label: "Manual AI Runs", icon: Activity },
  { to: "/app/agent-runs", label: "Automated PR Checks", icon: GitPullRequest },
  { to: "/app/run-comparison", label: "Run Comparison", icon: GitCompare },
  { to: "/app/defects", label: "Defects", icon: Bug },
  { to: "/app/self-healing", label: "AI Self-Healing", icon: Wand2 },
  { to: "/app/trends", label: "Trends", icon: TrendingUp },
  { to: "/app/coverage", label: "Coverage", icon: ListChecks },
  { to: "/app/reports", label: "Reports", icon: FileBarChart },
  { to: "/app/chat", label: "Team Chat", icon: MessageSquare },
  { to: "/app/video-call", label: "Video Call", icon: Video },
  { to: "/app/team", label: "Team Access", icon: UsersRound },
  { to: "/app/import-export", label: "Data Export", icon: DownloadCloud },
  { to: "/app/integrations", label: "Integrations", icon: PlugZap },
  { to: "/app/billing", label: "Billing", icon: CreditCard },
  { to: "/app/settings", label: "Settings", icon: Settings },
  { to: "/app/help", label: "Help & Docs", icon: LifeBuoy },
];

const navGroups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Overview",
    items: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/app/projects", label: "Projects", icon: FolderGit2 },
      { to: "/app/activity", label: "Activity Log", icon: History },
      { to: "/app/notifications", label: "Notifications", icon: Bell },
    ]
  },
  {
    title: "Test Planning",
    items: [
      { to: "/app/requirements", label: "Requirements", icon: ListChecks },
      { to: "/app/test-plans", label: "Test Plans", icon: Layers },
      { to: "/app/releases", label: "Releases", icon: Milestone },
      { to: "/app/environments", label: "Environments", icon: Server },
    ]
  },
  {
    title: "Execution & AI",
    items: [
      { to: "/app/ai-generator", label: "AI Test Generator", icon: Sparkles, pro: true, requiredFeature: "aiTestGenerator" },
      { to: "/app/test-cases", label: "Test Cases", icon: FlaskConical },
      { to: "/app/runs", label: "Manual AI Runs", icon: Activity },
      { to: "/app/agent-runs", label: "Automated PR Checks", icon: GitPullRequest },
      { to: "/app/run-comparison", label: "Run Comparison", icon: GitCompare, pro: true, requiredFeature: "runComparison" },
      { to: "/app/defects", label: "Defects", icon: Bug },
      { to: "/app/self-healing", label: "AI Self-Healing", icon: Wand2, pro: true, requiredFeature: "aiTestGenerator" },
    ]
  },
  {
    title: "Analytics & Reports",
    items: [
      { to: "/app/trends", label: "Trends", icon: TrendingUp },
      { to: "/app/coverage", label: "Coverage", icon: ListChecks },
      { to: "/app/reports", label: "Reports", icon: FileBarChart },
    ]
  },
  {
    title: "Collaboration",
    items: [
      { to: "/app/chat", label: "Team Chat", icon: MessageSquare },
      { to: "/app/video-call", label: "Video Call", icon: Video, pro: true, requiredFeature: "videoCalls" },
      { to: "/app/team", label: "Team Access", icon: UsersRound },
    ]
  },
  {
    title: "Workspace & Tools",
    items: [
      { to: "/app/import-export", label: "Data Export", icon: DownloadCloud, pro: true, requiredFeature: "dataExport" },
      { to: "/app/integrations", label: "Integrations", icon: PlugZap, pro: true, requiredFeature: "slackAlerts" },
      { to: "/app/billing", label: "Billing", icon: CreditCard },
      { to: "/app/settings", label: "Settings", icon: Settings },
      { to: "/app/help", label: "Help & Docs", icon: LifeBuoy },
    ]
  }
];

import { supabase } from "@/lib/supabase";

function AppLayout() {
  const navigate = useNavigate();
  const user = useApp((s) => s.user);
  const projects = useApp((s) => s.projects);
  const requirements = useApp((s) => s.requirements);
  const testCases = useApp((s) => s.testCases);
  const defects = useApp((s) => s.defects);
  const setUser = useApp((s) => s.setUser);
  const fetchData = useApp((s) => s.fetchData);
  const loading = useApp((s) => s.loading);
  const onlineUsers = useApp((s) => s.onlineUsers);
  const setOnlineUsers = useApp((s) => s.setOnlineUsers);
  const setUnreadMessages = useApp((s) => s.setUnreadMessages);
  const unreadMessages = useApp((s) => s.unreadMessages);
  const billing = useApp((s) => s.billing);
  const notifications = useApp((s) => s.notifications);
  const markAllNotificationsRead = useApp((s) => s.markAllNotificationsRead);

  const unreadNotificationsCount = useMemo(() => {
    return notifications ? notifications.filter(n => !n.read).length : 0;
  }, [notifications]);

  const activeFeatures = useMemo(() => {
    const currentPlan = billing?.plan || "free";
    const defaultFeaturesMap: Record<string, Record<string, boolean>> = {
      free: {
        slackAlerts: false,
        teamCollaboration: false,
        videoCalls: false,
        advancedReports: false,
        aiTestGenerator: false,
        runComparison: false,
        dataExport: false,
      },
      starter: {
        slackAlerts: false,
        teamCollaboration: false,
        videoCalls: false,
        advancedReports: true,
        aiTestGenerator: true,
        runComparison: true,
        dataExport: true,
      },
      pro: {
        slackAlerts: true,
        teamCollaboration: true,
        videoCalls: false,
        advancedReports: true,
        aiTestGenerator: true,
        runComparison: true,
        dataExport: true,
      },
      business: {
        slackAlerts: true,
        teamCollaboration: true,
        videoCalls: true,
        advancedReports: true,
        aiTestGenerator: true,
        runComparison: true,
        dataExport: true,
      }
    };

    const planDetails = billing?.plans?.find((p: any) => p.id === currentPlan);
    const resolved: Record<string, boolean> = planDetails?.features || defaultFeaturesMap[currentPlan] || defaultFeaturesMap.free;
    return resolved;
  }, [billing]);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [isBootSyncing, setIsBootSyncing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [hiddenBadgeCount, setHiddenBadgeCount] = useState(0);

  useEffect(() => {
    if (pathname === '/app/chat') {
      setUnreadMessages(0);
    }
    
    if (pathname === '/app/notifications') {
      setHiddenBadgeCount(unreadNotificationsCount);
    } else if (unreadNotificationsCount === 0) {
      setHiddenBadgeCount(0);
    }
  }, [pathname, setUnreadMessages, unreadNotificationsCount]);

  const displayNotificationCount = unreadNotificationsCount > 0 ? Math.max(0, unreadNotificationsCount - hiddenBadgeCount) : 0;

  useEffect(() => {
    fetchData();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const currentUser = session.user;
        setUser({
          id: currentUser.id,
          email: currentUser.email!,
          name: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0],
          avatar: currentUser.user_metadata?.avatar_url
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate({ to: "/login" });
      } else if (session?.user) {
        const currentUser = session.user;
        setUser({
          id: currentUser.id,
          email: currentUser.email!,
          name: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0],
          avatar: currentUser.user_metadata?.avatar_url
        });
        fetchData();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchData, setUser, navigate]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel('workspace-presence', {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users: any[] = [];
        Object.values(newState).forEach((p: any) => p[0] && users.push(p[0]));
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            email: user.email,
            last_seen: new Date().toISOString(),
          });
        }
      });

    const dbChannel = supabase.channel('db-changes');
    
    dbChannel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requirements' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'test_cases' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'defects' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => fetchData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (pathname !== '/app/chat' && payload.new.user_id !== user.id) {
          setUnreadMessages(prev => prev + 1);
          toast.info("New message from team member", {
             description: payload.new.content.startsWith('[VOICE_NOTE]') ? "Voice Note" : payload.new.content.substring(0, 30) + (payload.new.content.length > 30 ? "..." : ""),
             action: {
               label: "View",
               onClick: () => navigate({ to: "/app/chat" })
             }
          });
        }
      })
      .subscribe();

    return () => { 
      channel.unsubscribe(); 
      dbChannel.unsubscribe();
    };
  }, [user?.id, user?.name, user?.avatar, setOnlineUsers, fetchData, pathname, setUnreadMessages]);

  // Ensure data is loaded as soon as user state becomes available after login.
  useEffect(() => {
    if (user?.id) {
      setIsBootSyncing(true);
      fetchData();
    }
  }, [user?.id, fetchData]);

  useEffect(() => {
    if (isBootSyncing && !loading) {
      setIsBootSyncing(false);
    }
  }, [isBootSyncing, loading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate({ to: "/login" });
    toast.success("Signed out successfully");
  };

  const current = nav.find((n) => (n.exact ? pathname === n.to : pathname.startsWith(n.to)));
  const normalizedSearch = searchText.trim().toLowerCase();

  const globalSearchResults = useMemo(() => {
    if (normalizedSearch.length < 2) return [];

    const limit = 8;
    const results: Array<{ id: string; label: string; hint: string; onSelect: () => void }> = [];

    for (const item of nav) {
      const labelMatch = item.label.toLowerCase().includes(normalizedSearch);
      const pathMatch = item.to.toLowerCase().includes(normalizedSearch);
      if (labelMatch || pathMatch) {
        results.push({
          id: `page-${item.to}`,
          label: item.label,
          hint: "Page",
          onSelect: () => navigate({ to: item.to as any }),
        });
      }
      if (results.length >= limit) return results;
    }

    for (const p of projects) {
      const haystack = `${p.name} ${p.repo_url}`.toLowerCase();
      if (haystack.includes(normalizedSearch)) {
        results.push({
          id: `project-${p.id}`,
          label: p.name,
          hint: "Project",
          onSelect: () => navigate({ to: "/app/projects/$projectId", params: { projectId: p.id } }),
        });
      }
      if (results.length >= limit) return results;
    }

    for (const r of requirements) {
      const haystack = `${r.title} ${r.description}`.toLowerCase();
      if (haystack.includes(normalizedSearch)) {
        results.push({
          id: `requirement-${r.id}`,
          label: r.title,
          hint: "Requirement",
          onSelect: () => navigate({ to: "/app/requirements" }),
        });
      }
      if (results.length >= limit) return results;
    }

    for (const t of testCases) {
      const haystack = `${t.title} ${t.module} ${t.expected}`.toLowerCase();
      if (haystack.includes(normalizedSearch)) {
        results.push({
          id: `test-case-${t.id}`,
          label: t.title,
          hint: `Test Case · ${t.module}`,
          onSelect: () => navigate({ to: "/app/test-cases" }),
        });
      }
      if (results.length >= limit) return results;
    }

    for (const d of defects) {
      const haystack = `${d.title} ${d.description}`.toLowerCase();
      if (haystack.includes(normalizedSearch)) {
        results.push({
          id: `defect-${d.id}`,
          label: d.title,
          hint: "Defect",
          onSelect: () => navigate({ to: "/app/defects" }),
        });
      }
      if (results.length >= limit) return results;
    }

    return results;
  }, [normalizedSearch, projects, requirements, testCases, defects, navigate]);

  const handleSearchSelect = (onSelect: () => void) => {
    onSelect();
    setShowSearchResults(false);
    setSearchText("");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
          <SidebarHeader className="px-3 py-3 group-data-[state=collapsed]:px-0">
            <Link to="/app"><Logo /></Link>
          </SidebarHeader>
          <SidebarContent>
            <div className="py-2 flex flex-col gap-4">
              {navGroups.map((group) => (
                <div key={group.title} className="px-2">
                  <div className="text-[10px] font-bold tracking-wider text-muted-foreground/50 uppercase px-3 mb-1.5 group-data-[state=collapsed]:hidden select-none">
                    {group.title}
                  </div>
                  <SidebarMenu className="flex flex-col gap-0.5">
                    {group.items.map((n) => {
                      const isActive = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                      const showProBadge = n.pro && (!n.requiredFeature || !activeFeatures[n.requiredFeature]);
                      return (
                        <SidebarMenuItem key={n.to} className="relative">
                          <SidebarMenuButton asChild isActive={isActive} tooltip={n.label} className="h-8 py-1.5">
                            <Link to={n.to as any} className="flex items-center gap-2 w-full">
                              <n.icon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{n.label}</span>
                              {showProBadge && (
                                <span className="ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider group-data-[state=collapsed]:hidden select-none">
                                  Pro
                                </span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                          {n.label === "Team Chat" && unreadMessages > 0 && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in group-data-[state=collapsed]:hidden">
                              {unreadMessages > 9 ? "9+" : unreadMessages}
                            </div>
                          )}
                          {n.label === "Notifications" && displayNotificationCount > 0 && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-in zoom-in group-data-[state=collapsed]:hidden">
                              {displayNotificationCount > 9 ? "9+" : displayNotificationCount}
                            </div>
                          )}
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </div>
              ))}
            </div>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-8 w-8 rounded-full border border-sidebar-border overflow-hidden shrink-0 bg-sidebar-accent flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center gradient-bg text-primary-foreground text-xs font-semibold">
                    {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 group-data-[state=collapsed]:hidden">
                <div className="font-medium truncate">{user?.name || "User"}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="sticky top-0 z-30 p-4">
            <header className="flex h-14 items-center gap-3 rounded-2xl border border-white/20 dark:border-white/10 bg-white dark:bg-[#14120B] px-4 shadow-none ring-1 ring-black/5 dark:ring-white/5">
              <SidebarTrigger className="text-foreground/70 hover:text-foreground transition-colors" />
              <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground ml-1">
                <span className="font-medium text-foreground/80">Speclane</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                <span className="text-foreground font-semibold">{current?.label || "App"}</span>
              </div>
              <div className="flex-1" />
              
              {/* Presence Bar */}
              <div className="flex items-center -space-x-2 mr-4">
                <TooltipProvider>
                  {onlineUsers.filter(u => u.id !== user?.id).map((u) => (
                    <Tooltip key={u.id}>
                      <TooltipTrigger asChild>
                        <div className="relative h-8 w-8 rounded-full border-2 border-white dark:border-black overflow-hidden bg-muted flex items-center justify-center ring-2 ring-primary/20 cursor-default transition-transform hover:-translate-y-1">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full grid place-items-center bg-slate-200 dark:bg-white/10 text-[10px] font-bold">
                              {(u.name?.[0] || u.email?.[0] || "U").toUpperCase()}
                            </div>
                          )}
                          <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-black z-30" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs font-medium">{u.name || u.email} (Online)</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>

              <div className="hidden md:flex relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search anything…"
                  className="pl-9 h-9 bg-background/50 border-white/20 dark:border-white/10 focus-visible:ring-primary/30 rounded-xl"
                  value={searchText}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 120)}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setShowSearchResults(false);
                      return;
                    }
                    if (e.key === "Enter" && globalSearchResults.length > 0) {
                      handleSearchSelect(globalSearchResults[0].onSelect);
                    }
                  }}
                />
                {showSearchResults && normalizedSearch.length >= 2 && (
                  <div className="absolute top-11 z-50 w-full rounded-xl border border-white/10 bg-white dark:bg-[#14120B] shadow-2xl overflow-hidden">
                    {globalSearchResults.length > 0 ? (
                      globalSearchResults.map((result) => (
                        <button
                          key={result.id}
                          className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                          onMouseDown={() => handleSearchSelect(result.onSelect)}
                        >
                          <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{result.label}</div>
                          <div className="text-[10px] text-slate-500 dark:text-white/50 uppercase tracking-wider">{result.hint}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-3 text-xs text-slate-500 dark:text-white/50">No results found.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="h-5 w-px bg-border/50 mx-1 hidden sm:block" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-8 w-8 rounded-full overflow-hidden shadow-none hover:opacity-90 transition-opacity ml-1 border border-primary/20 bg-primary/10 flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center gradient-bg text-primary-foreground text-xs font-semibold">
                        {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                    <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-black z-30" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-white/10 glass-strong">
                  <DropdownMenuLabel>{user?.name || "User"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>
            {isBootSyncing && loading && (
              <div className="mt-2 h-9 rounded-xl border border-primary/30 bg-primary/10 px-4 flex items-center gap-3 text-xs text-primary animate-pulse">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                <span>
                  Welcome back{user?.name ? `, ${user.name}` : ""} - syncing your workspace data...
                </span>
              </div>
            )}
          </div>
          <main className="flex-1 px-4 pb-4 animate-in fade-in duration-300 relative">
            <div className="relative z-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
