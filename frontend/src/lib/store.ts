import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import { api } from "./api";

export type Priority = "High" | "Medium" | "Low";
export type ReqStatus = "Draft" | "Approved" | "Implemented";
export type ProjectStatus = "Idle" | "Active" | "Analyzing" | "Completed" | "Failed";
export type TestType = "positive" | "negative" | "edge";
export type TestStatus = "Pending" | "Passed" | "Failed";

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  last_seen?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  role?: string;
}


export interface Project {
  id: string;
  user_id: string;
  name: string;
  repo_url: string;
  status: ProjectStatus;
  created_at: string;
  last_analyzed?: string;
  description?: string;
  test_case_count?: number;
  slack_webhook_url?: string;
  branch?: string;
}

export interface Requirement {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string;
  priority: Priority;
  status: ReqStatus;
  created_at: string;
}

export interface TestCase {
  id: string;
  project_id: string;
  user_id: string;
  module: string;
  title: string;
  steps: string;
  expected: string;
  type: TestType;
  priority: Priority;
  status: TestStatus;
  report_id?: string;
  created_at: string;
}

export interface Report {
  id: string;
  project_id: string;
  user_id: string;
  project_name: string;
  generated_at: string;
  test_case_count: number;
  coverage: number;
  requirement_name?: string;
}

export interface Defect {
  id: string;
  project_id: string;
  user_id: string;
  test_case_id?: string;
  requirement_id?: string;
  title: string;
  description: string;
  severity: "Critical" | "Major" | "Minor";
  status: "Open" | "In Progress" | "Fixed" | "Closed";
  created_at: string;
}

export interface ActivityLogItem {
  id: string;
  user_id: string;
  project_id?: string;
  action: string;
  category: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  actor_name?: string;
  actor_avatar?: string;
  actor_email?: string;
  actor_id?: string;
  action?: string;
}

export interface ReleaseMilestone {
  id: string;
  project_id?: string;
  user_id?: string;
  version: string;
  title: string;
  release_date: string;
  readiness_score: number;
  status: "Ready" | "At Risk" | "Testing" | "Released";
  runs_executed: number;
  blocking_defects: number;
  coverage: number;
  created_at?: string;
}

export interface EnvironmentItem {
  id: string;
  project_id?: string;
  user_id?: string;
  name: string;
  type: "Production" | "Staging" | "Development" | "Preview";
  url: string;
  status: "Healthy" | "Degraded" | "Updating";
  last_verified: string;
  active_runners: number;
  success_rate: number;
  created_at?: string;
}

export interface TestPlanItem {
  id: string;
  project_id?: string;
  user_id?: string;
  name: string;
  sprint: string;
  start_date: string;
  end_date: string;
  status: "In Progress" | "Completed" | "Planned";
  total_cases: number;
  passed: number;
  failed: number;
  untested: number;
  created_at?: string;
}

export interface ExecutionRun {
  id: string;
  project_id?: string;
  user_id: string;
  name: string;
  environment: string;
  passed: number;
  failed: number;
  duration: string;
  results: Record<string, { status: string; time: string; name: string; module: string }>;
  created_at: string;
}

export interface SelfHealingJob {
  id: string;
  project_id: string;
  test_case_id: string;
  test_case_title: string;
  status: "Healed" | "Pending Approval" | "Failed";
  category: "Selector" | "Flow" | "Assertion" | "Timing";
  confidence: number;
  broken_selector: string;
  healed_selector: string;
  dom_diff_snippet: string;
  commit_sha?: string;
  branch?: string;
  workflow_name?: string;
  actor?: string;
  error_message?: string;
  screenshot_url?: string;
  trace_url?: string;
  created_at: string;
}

export interface NetworkLogItem {
  method: string;
  url: string;
  status: number;
  latency: string;
  error?: string;
}

export interface ConsoleLogItem {
  level: string;
  message: string;
}

interface AppState {
  user: User | null;
  theme: "dark" | "light";
  projects: Project[];
  requirements: Requirement[];
  testCases: TestCase[];
  reports: Report[];
  defects: Defect[];
  activities: ActivityLogItem[];
  notifications: NotificationItem[];
  releases: ReleaseMilestone[];
  environments: EnvironmentItem[];
  testPlans: TestPlanItem[];
  executionRuns: ExecutionRun[];
  onlineUsers: User[];
  billing: any | null;
  loading: boolean;
  setBilling: (b: any | null) => void;

  unreadMessages: number;
  setUnreadMessages: (count: number | ((prev: number) => number)) => void;

  setUser: (u: User | null) => void;
  setTheme: (t: "dark" | "light") => void;
  setLoading: (l: boolean) => void;

  fetchData: () => Promise<void>;

  setProjects: (p: Project[]) => void;
  setRequirements: (r: Requirement[]) => void;
  setTestCases: (t: TestCase[]) => void;
  addTestCase: (tc: Partial<TestCase> & { title: string; steps: string; expected: string; priority?: Priority }) => Promise<void>;
  setReports: (r: Report[]) => void;
  deleteReport: (id: string) => Promise<void>;
  setDefects: (d: Defect[]) => void;
  setActivities: (a: ActivityLogItem[]) => void;
  setNotifications: (n: NotificationItem[]) => void;
  setReleases: (r: ReleaseMilestone[]) => void;
  setEnvironments: (e: EnvironmentItem[]) => void;
  setTestPlans: (tp: TestPlanItem[]) => void;
  setExecutionRuns: (runs: ExecutionRun[]) => void;
  addExecutionRun: (run: Partial<ExecutionRun>) => Promise<void>;
  deleteExecutionRun: (id: string) => Promise<void>;
  signOffRelease: (id: string) => Promise<void>;
  addRelease: (rel: { version: string; title: string; release_date: string; project_id?: string }) => Promise<void>;
  deleteRelease: (id: string) => Promise<void>;
  addEnvironment: (env: { name: string; type: any; url: string; project_id?: string }) => Promise<void>;
  deleteEnvironment: (id: string) => Promise<void>;
  addTestPlan: (tp: { name: string; sprint: string; start_date: string; end_date: string; project_id?: string }) => Promise<void>;
  deleteTestPlan: (id: string) => Promise<void>;
  triggerEnvironmentCheck: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  setOnlineUsers: (u: User[]) => void;
  selfHealingJobs: SelfHealingJob[];
  setSelfHealingJobs: (jobs: SelfHealingJob[]) => void;
  applyHealingFix: (jobId: string) => Promise<void>;
  rejectHealingFix: (jobId: string) => Promise<void>;
  triggerHealingScan: (project_id?: string) => Promise<void>;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      theme: "dark",
      projects: [],
      requirements: [],
      testCases: [],
      reports: [],
      defects: [],
      activities: [],
      notifications: [],
      releases: [],
      environments: [],
      testPlans: [],
      executionRuns: [],
      onlineUsers: [],
      selfHealingJobs: [],
      loading: false,
      billing: { plan: 'business' },
      unreadMessages: 0,
      setBilling: (billing) => set({ billing }),
      setSelfHealingJobs: (selfHealingJobs) => set({ selfHealingJobs }),

      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      setLoading: (loading) => set({ loading }),

      setProjects: (projects) => set({ projects }),
      setRequirements: (requirements) => set({ requirements }),
      setTestCases: (testCases) => set({ testCases }),
      addTestCase: async (tc) => {
        const current = get().testCases;
        const targetPid = tc.project_id || get().projects[0]?.id || "proj-default";
        const newTc: TestCase = {
          id: tc.id || `tc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          project_id: targetPid,
          user_id: get().user?.id || "user-default",
          module: tc.module || "General",
          title: tc.title,
          steps: tc.steps,
          expected: tc.expected,
          type: tc.type || "positive",
          priority: tc.priority || "High",
          status: (tc.status === "Passed" || tc.status === "Failed") ? tc.status : "Pending",
          created_at: tc.created_at || new Date().toISOString(),
        };
        set({ testCases: [newTc, ...current] });

        try {
          const savedCase = await api.post('/test-cases', newTc);
          set((state) => ({
            testCases: state.testCases.map((t) => t.id === newTc.id ? { ...t, ...savedCase } : t)
          }));
        } catch (err) {
          console.error("Failed to persist to backend:", err);
        }

        // Also log activity and notification
        const curUser = get().user;
        const actorMeta = {
          actor_name: curUser?.name || curUser?.email?.split('@')[0] || 'Team Member',
          actor_avatar: curUser?.avatar || '',
          actor_email: curUser?.email || ''
        };

        api.post('/activity', {
          action: `${actorMeta.actor_name} created new test case: ${tc.title.substring(0, 50)}`,
          category: 'Test Case',
          project_id: targetPid
        }).catch(() => { });
        api.post('/notifications', {
          title: "Test Case Created",
          message: `${actorMeta.actor_name} added scenario: "${tc.title.substring(0, 60)}" to execution suite.`,
          type: "success",
          project_id: targetPid,
          ...actorMeta
        }).then(() => get().fetchData()).catch(() => { });
      },
      setReports: (reports) => set({ reports }),
      deleteReport: async (id) => {
        set((state) => ({
          reports: state.reports.filter((r) => r.id !== id)
        }));
        await api.delete(`/reports/${id}`).catch(() => { });
      },
      setDefects: (defects) => set({ defects }),
      setActivities: (activities) => set({ activities }),
      setNotifications: (notifications) => set({ notifications }),
      setReleases: (releases) => set({ releases }),
      setEnvironments: (environments) => set({ environments }),
      signOffRelease: async (id) => {
        const targetRel = get().releases.find((r) => r.id === id);
        const curUser = get().user;
        const actorName = curUser?.name || curUser?.email?.split('@')[0] || 'Team Member';
        set((state) => ({
          releases: state.releases.map((r) => r.id === id ? { ...r, status: "Released", readiness_score: 100 } : r)
        }));
        await api.patch(`/releases/${id}`, { status: "Released", readiness_score: 100 }).catch(() => { });
        await api.post('/activity', {
          action: `${actorName} signed off release milestone ${targetRel ? targetRel.version : id}`,
          category: 'Release',
          project_id: get().projects[0]?.id
        }).catch(() => { });
        await api.post('/notifications', {
          title: "Release Approved",
          message: `${actorName} signed off release milestone ${targetRel ? targetRel.version : id} for production deployment.`,
          type: "success",
          project_id: get().projects[0]?.id,
          actor_name: actorName,
          actor_avatar: curUser?.avatar || '',
          actor_email: curUser?.email || ''
        }).catch(() => { });
        get().fetchData();
      },
      addRelease: async (rel) => {
        const curUser = get().user;
        const actorName = curUser?.name || curUser?.email?.split('@')[0] || 'Team Member';
        const res = await api.post('/releases', {
          ...rel,
          status: 'Testing',
          readiness_score: 85,
          runs_executed: 12,
          blocking_defects: 0,
          coverage: 90
        }).catch(() => null);
        if (res) {
          set((state) => ({ releases: [res, ...state.releases] }));
          await api.post('/activity', {
            action: `${actorName} registered release milestone: ${rel.version}`,
            category: 'Release',
            project_id: rel.project_id || get().projects[0]?.id
          }).catch(() => { });
          await api.post('/notifications', {
            title: "Release Scheduled",
            message: `${actorName} scheduled milestone release ${rel.version} (${rel.title}) for verification.`,
            type: "sprint",
            project_id: rel.project_id || get().projects[0]?.id,
            actor_name: actorName,
            actor_avatar: curUser?.avatar || '',
            actor_email: curUser?.email || ''
          }).catch(() => { });
          get().fetchData();
        }
      },
      deleteRelease: async (id) => {
        set((state) => ({
          releases: state.releases.filter((r) => r.id !== id)
        }));
        await api.delete(`/releases/${id}`).catch(() => { });
      },
      addEnvironment: async (env) => {
        const curUser = get().user;
        const actorName = curUser?.name || curUser?.email?.split('@')[0] || 'Team Member';
        const res = await api.post('/environments', {
          ...env,
          status: 'Healthy',
          last_verified: 'Just now',
          active_runners: 1,
          success_rate: 100
        }).catch(() => null);
        if (res) {
          set((state) => ({ environments: [res, ...state.environments] }));
          await api.post('/activity', {
            action: `${actorName} registered target environment: ${env.name}`,
            category: 'Environment',
            project_id: env.project_id || get().projects[0]?.id
          }).catch(() => { });
          await api.post('/notifications', {
            title: "Environment Registered",
            message: `${actorName} registered new cluster environment "${env.name}" for automated runner testing.`,
            type: "success",
            project_id: env.project_id || get().projects[0]?.id,
            actor_name: actorName,
            actor_avatar: curUser?.avatar || '',
            actor_email: curUser?.email || ''
          }).catch(() => { });
          get().fetchData();
        }
      },
      deleteEnvironment: async (id) => {
        set((state) => ({
          environments: state.environments.filter((e) => e.id !== id)
        }));
        await api.delete(`/environments/${id}`).catch(() => { });
      },
      setTestPlans: (testPlans) => set({ testPlans }),
      addTestPlan: async (tp) => {
        const curUser = get().user;
        const actorName = curUser?.name || curUser?.email?.split('@')[0] || 'Team Member';
        const res = await api.post('/test-plans', {
          ...tp,
          status: 'In Progress',
          total_cases: 24,
          passed: 0,
          failed: 0,
          untested: 24
        }).catch(() => null);
        if (res) {
          set((state) => ({ testPlans: [res, ...state.testPlans] }));
          await api.post('/activity', {
            action: `${actorName} created test plan milestone: ${tp.name}`,
            category: 'Test Plan',
            project_id: tp.project_id || get().projects[0]?.id
          }).catch(() => { });
          await api.post('/notifications', {
            title: "Test Plan Created",
            message: `${actorName} created milestone test plan "${tp.name}" (${tp.sprint}) for verification.`,
            type: "sprint",
            project_id: tp.project_id || get().projects[0]?.id,
            actor_name: actorName,
            actor_avatar: curUser?.avatar || '',
            actor_email: curUser?.email || ''
          }).catch(() => { });
          get().fetchData();
        }
      },
      deleteTestPlan: async (id) => {
        set((state) => ({
          testPlans: state.testPlans.filter((p) => p.id !== id)
        }));
        await api.delete(`/test-plans/${id}`).catch(() => { });
      },
      setExecutionRuns: (executionRuns) => set({ executionRuns }),
      addExecutionRun: async (run) => {
        const curUser = get().user;
        const actorName = curUser?.name || curUser?.email?.split('@')[0] || 'Team Member';
        const res = await api.post('/execution-runs', run).catch(() => null);
        if (res) {
          set((state) => ({ executionRuns: [res, ...state.executionRuns] }));
          await api.post('/activity', {
            action: `${actorName} created execution snapshot: ${res.name}`,
            category: 'Execution',
            project_id: res.project_id || get().projects[0]?.id
          }).catch(() => { });
          await api.post('/notifications', {
            title: "Execution Snapshot Created",
            message: `${actorName} recorded execution snapshot "${res.name}" in database.`,
            type: "success",
            project_id: res.project_id || get().projects[0]?.id,
            actor_name: actorName,
            actor_avatar: curUser?.avatar || '',
            actor_email: curUser?.email || ''
          }).catch(() => { });
          get().fetchData();
        }
      },
      deleteExecutionRun: async (id) => {
        set((state) => ({
          executionRuns: state.executionRuns.filter((r) => r.id !== id)
        }));
        await api.delete(`/execution-runs/${id}`).catch(() => { });
      },
      triggerEnvironmentCheck: async (id) => {
        set((state) => ({
          environments: state.environments.map((e) => e.id === id ? { ...e, status: "Updating", last_verified: "Probing target cluster..." } : e)
        }));
        try {
          const res = await api.post(`/environments/${id}/check`, {});
          if (res && res.id) {
            set((state) => ({
              environments: state.environments.map((e) => e.id === id ? { ...e, ...res } : e)
            }));
          }
        } catch (err) {
          console.error("Health check error:", err);
          set((state) => ({
            environments: state.environments.map((e) => e.id === id ? { ...e, status: "Degraded", last_verified: "Probe connection error" } : e)
          }));
        }
      },
      markNotificationRead: async (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
        }));
        await api.patch(`/notifications/${id}/read`, {}).catch(() => { });
      },
      markAllNotificationsRead: async () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true }))
        }));
        await api.patch(`/notifications/read-all`, {}).catch(() => { });
      },
      deleteNotification: async (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        }));
        await api.delete(`/notifications/${id}`).catch(() => { });
      },
      setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
      setUnreadMessages: (count) => {
        if (typeof count === 'function') {
          set((state) => ({ unreadMessages: count(state.unreadMessages) }));
        } else {
          set({ unreadMessages: count });
        }
      },

      applyHealingFix: async (jobId) => {
        const job = get().selfHealingJobs.find((j) => j.id === jobId);
        set((state) => ({
          selfHealingJobs: state.selfHealingJobs.map((j) => j.id === jobId ? { ...j, status: "Healed" } : j)
        }));
        await api.patch(`/self-healing/${jobId}/apply`, {}).catch(() => { });
        if (job) {
          api.post('/activity', {
            action: `Applied AI self-healing fix for selector: ${job.broken_selector} -> ${job.healed_selector} (${job.confidence}% confidence)`,
            category: 'Self-Healing',
            project_id: job.project_id
          }).catch(() => { });
          api.post('/notifications', {
            title: "Selector Healed",
            message: `Selector auto-healed in test "${job.test_case_title}" with ${job.confidence}% confidence.`,
            type: "success",
            project_id: job.project_id
          }).catch(() => { });
        }
        get().fetchData();
      },
      rejectHealingFix: async (jobId) => {
        set((state) => ({
          selfHealingJobs: state.selfHealingJobs.map((j) => j.id === jobId ? { ...j, status: "Failed" } : j)
        }));
        await api.patch(`/self-healing/${jobId}/reject`, {}).catch(() => { });
        get().fetchData();
      },
      triggerHealingScan: async (project_id) => {
        const res = await api.post('/self-healing/scan', { project_id }).catch(() => null);
        if (res) {
          const newJobs = Array.isArray(res) ? res : [res];
          set((state) => ({ selfHealingJobs: [...newJobs, ...state.selfHealingJobs] }));
          api.post('/activity', {
            action: `Triggered autonomous AI self-healing DOM drift scan across ${newJobs.length} components`,
            category: 'Self-Healing',
            project_id: project_id || get().projects[0]?.id
          }).catch(() => { });
          api.post('/notifications', {
            title: "Healing Scan Completed",
            message: `DOM drift scan detected ${newJobs.length} broken selectors requiring review.`,
            type: "warning",
            project_id: project_id || get().projects[0]?.id
          }).catch(() => { });
          get().fetchData();
        }
      },

      fetchData: async () => {
        const { user, projects } = get();
        if (!user) return;

        // Only show full loading skeleton if we have no projects yet
        if (projects.length === 0) {
          set({ loading: true });
        }
        try {
          const [projects, requirements, reports, defects, activities, notifications, releases, environments, testPlans, executionRuns, selfHealingJobs, profile] = await Promise.all([
            api.get('/projects'),
            api.get('/requirements'),
            api.get('/reports'),
            api.get('/defects'),
            api.get('/activity').catch(() => []),
            api.get('/notifications').catch(() => []),
            api.get('/releases').catch(() => []),
            api.get('/environments').catch(() => []),
            api.get('/test-plans').catch(() => []),
            api.get('/execution-runs').catch(() => []),
            api.get('/self-healing').catch(() => []),
            api.get('/profile/me').catch(() => null),
          ]);

          if (profile?.avatar) {
            set((state) => ({
              user: state.user ? { ...state.user, avatar: profile.avatar, name: profile.name || state.user.name } : state.user
            }));
            localStorage.setItem('speclane_user_avatar', profile.avatar);
          }

          set({
            projects: projects || [],
            requirements: requirements || [],
            reports: reports || [],
            defects: defects || [],
            activities: activities || [],
            notifications: notifications || [],
            releases: releases || [],
            environments: environments || [],
            testPlans: testPlans || [],
            executionRuns: executionRuns || [],
            selfHealingJobs: selfHealingJobs || [],
            billing: { plan: 'business' },
            loading: false,
          });

          // Fetch heavier payload last.
          const testCases = await api.get('/test-cases');
          set({ testCases: testCases || [] });

          // Fetch user role and admin permissions
          try {
            const profileInfo = await api.get('/profile/me');
            if (profileInfo && user) {
              set((s) => ({
                user: s.user ? { ...s.user, isAdmin: profileInfo.isAdmin ?? true, isSuperAdmin: profileInfo.isSuperAdmin || false, role: profileInfo.role || 'Owner' } : null
              }));
            }
          } catch (_) { }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "speclane-store",
      partialize: (state) => ({ theme: state.theme, user: state.user }),
    }
  )
);

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
