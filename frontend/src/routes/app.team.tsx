import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { UsersRound, Trash2, FolderGit2, Shield, Check, Clock } from "lucide-react";

export const Route = createFileRoute("/app/team")({
  component: TeamPage,
  head: () => ({ meta: [{ title: "Team Access — Speclane" }] }),
});

function TeamPage() {
  const user = useApp((s) => s.user);
  const projects = useApp((s) => s.projects);
  const fetchData = useApp((s) => s.fetchData);
  const [teamRows, setTeamRows] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Member" | "Manager">("Member");
  const [projectId, setProjectId] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);

  const isWorkspaceOwner = user?.role === 'Owner' && (!user.workspaceOwnerId || user.workspaceOwnerId === user.id);
  const isOwnerOrManager = isWorkspaceOwner || user?.role === 'Manager';

  const loadTeam = async () => {
    try {
      const data = await api.get("/team");
      setTeamRows(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load team");
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const members = useMemo(
    () =>
      teamRows.map((row) => ({
        id: row.id,
        member_id: row.member_id,
        name:
          row.member_id === user?.id
            ? user?.name || "You"
            : row.role === "Owner"
              ? "Workspace Owner"
              : row.owner_id === user?.id
                ? "Invited Employee"
                : "Team Member",
        email: row.email,
        role: row.role || "Member",
        status: row.status,
        project_id: row.project_id || null,
        project_name: row.project_name || "All Projects",
        isSynthetic: !!row.synthetic,
        canAccept: row.status === "pending" && row.email?.toLowerCase() === user?.email?.toLowerCase(),
        ownerEmail: row.owner_email,
      })),
    [teamRows, user]
  );

  const inviteMember = async () => {
    if (!isWorkspaceOwner) return toast.error("Only the workspace owner can invite team members.");
    if (!email.trim()) return toast.error("Please enter member email");
    setSubmitting(true);
    try {
      const payload: any = {
        email: email.trim().toLowerCase(),
        role,
        project_id: projectId === "all" ? null : projectId,
      };
      const resp = await api.post("/team/invite", payload);
      if (resp?.email_sent === false) {
        toast.error(resp?.email_error || "Invite created but email was not sent. Check Supabase email settings.");
      } else {
        toast.success("Invitation email sent successfully");
      }
      setEmail("");
      setProjectId("all");
      await loadTeam();
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite");
    } finally {
      setSubmitting(false);
    }
  };

  const acceptInvite = async (inviteId: string) => {
    try {
      await api.post(`/team/${inviteId}/accept`, {});
      toast.success("Invite accepted. Shared workspace unlocked.");
      await loadTeam();
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept invite");
    }
  };

  const removeMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this workspace?`)) return;
    try {
      await api.delete(`/team/${id}`);
      toast.success("Team member removed from workspace");
      await loadTeam();
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove team member");
    }
  };

  const updateRole = async (id: string, newRole: "Member" | "Manager") => {
    try {
      await api.patch(`/team/${id}`, { role: newRole });
      toast.success(`Role updated to ${newRole === "Member" ? "Employee" : "Manager"}`);
      await loadTeam();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const updateProjectScope = async (id: string, newProjectId: string) => {
    try {
      await api.patch(`/team/${id}`, { project_id: newProjectId === "all" ? null : newProjectId });
      toast.success("Project access scope updated");
      await loadTeam();
    } catch (err: any) {
      toast.error(err.message || "Failed to update project access scope");
    }
  };

  return (
    <div className="relative container mx-auto p-4 sm:p-6 space-y-6 max-w-5xl min-h-[calc(100vh-80px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
            Team Access & Roles
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage who can access and operate your QA workspace and individual projects.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-xs font-semibold rounded-full border-primary/20 bg-primary/5 text-primary">
            <Shield className="w-3 h-3 mr-1" />
            Your Role: {user?.role || "Owner"}
          </Badge>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] shadow-none rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Invite Team Member</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {!isWorkspaceOwner && (
            <p className="text-sm text-muted-foreground">Only the workspace owner can invite team members.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-12 items-end">
            <div className="space-y-1 sm:col-span-5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-white/70">Member Email</Label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isWorkspaceOwner}
                className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
              />
            </div>

            <div className="space-y-1 sm:col-span-3">
              <Label className="text-xs font-semibold text-slate-600 dark:text-white/70">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "Member" | "Manager")}>
                <SelectTrigger disabled={!isWorkspaceOwner} className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#14120B] border-slate-200 dark:border-white/10">
                  <SelectItem value="Member">Employee (Member)</SelectItem>
                  <SelectItem value="Manager">QA Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:col-span-4">
              <Label className="text-xs font-semibold text-slate-600 dark:text-white/70">Project Access Scope</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger disabled={!isWorkspaceOwner} className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#14120B] border-slate-200 dark:border-white/10">
                  <SelectItem value="all">All Projects (Workspace Wide)</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={inviteMember}
              disabled={submitting || !isWorkspaceOwner}
              className="gradient-bg text-primary-foreground font-semibold rounded-full h-10 px-8 shadow-none"
            >
              {submitting ? "Sending Invite..." : "Send Invitation"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] shadow-none rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Workspace Members & Access</CardTitle>
          <Badge variant="outline" className="font-mono text-xs">{members.length} Total</Badge>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 p-4 gap-4 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{member.name}</span>
                  {member.role === "Owner" ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Owner</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      {member.role === "Manager" ? "QA Manager" : "Employee"}
                    </Badge>
                  )}
                  {member.status === "active" ? (
                    <span className="inline-flex items-center text-[10px] text-green-600 dark:text-green-400 font-semibold gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] text-amber-500 font-semibold gap-1">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{member.email}</div>
                {member.ownerEmail && member.role === "Owner" && (
                  <div className="text-[11px] text-muted-foreground">Owner Account: {member.ownerEmail}</div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Project Scope Badge or Select */}
                {isOwnerOrManager && !member.isSynthetic && member.role !== "Owner" ? (
                  <div className="flex items-center gap-2">
                    <Select
                      value={member.project_id || "all"}
                      onValueChange={(val) => updateProjectScope(member.id, val)}
                    >
                      <SelectTrigger className="h-8 text-xs rounded-lg w-40 bg-background">
                        <FolderGit2 className="w-3 h-3 mr-1 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#14120B]">
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={member.role}
                      onValueChange={(val) => updateRole(member.id, val as any)}
                    >
                      <SelectTrigger className="h-8 text-xs rounded-lg w-32 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#14120B]">
                        <SelectItem value="Member">Employee</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-xs flex items-center gap-1.5 py-1">
                    <FolderGit2 className="w-3 h-3 text-primary" />
                    {member.project_name}
                  </Badge>
                )}

                {/* Accept invite if current user is recipient */}
                {member.canAccept && (
                  <Button size="sm" onClick={() => acceptInvite(member.id)} className="h-8 rounded-lg">
                    Accept Invite
                  </Button>
                )}

                {/* Remove / Revoke button */}
                {isOwnerOrManager && !member.isSynthetic && member.role !== "Owner" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeMember(member.id, member.email)}
                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                    title="Remove member from workspace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] shadow-none rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Access Scope & Security Policy</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Role-Based Access Control (RBAC) ensures team members only view and execute test suites according to their assigned scope:
          </p>
          <div className="grid sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <div className="text-xs font-bold text-primary mb-1">Owner</div>
              <div className="text-[11px] text-muted-foreground">Full workspace ownership, member management, project administration, and billing.</div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">QA Manager</div>
              <div className="text-[11px] text-muted-foreground">Manage project requirements, trigger test executions, invite employees, and review reports.</div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">Employee (Member)</div>
              <div className="text-[11px] text-muted-foreground">Execute test cases, view linked repository files, and report defects in assigned projects.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

