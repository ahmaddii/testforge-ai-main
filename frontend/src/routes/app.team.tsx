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
import { PaywallOverlay } from "@/components/paywall-overlay";
import { UsersRound } from "lucide-react";

export const Route = createFileRoute("/app/team")({
  component: TeamPage,
  head: () => ({ meta: [{ title: "Team Access — Speclane" }] }),
});

function TeamPage() {
  const user = useApp((s) => s.user);
  const projects = useApp((s) => s.projects);
  const fetchData = useApp((s) => s.fetchData);
  const billing = useApp((s) => s.billing);
  
  const canUseTeam = billing?.plan === 'pro' || billing?.plan === 'business';
  const [teamRows, setTeamRows] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Member" | "Manager">("Member");
  const [submitting, setSubmitting] = useState(false);

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
        canAccept: row.status === "pending" && row.email?.toLowerCase() === user?.email?.toLowerCase(),
        ownerEmail: row.owner_email,
      })),
    [teamRows, user]
  );

  const inviteMember = async () => {
    if (!email.trim()) return toast.error("Please enter member email");
    setSubmitting(true);
    try {
      const resp = await api.post("/team/invite", { email: email.trim().toLowerCase(), role });
      if (resp?.email_sent === false) {
        toast.error(resp?.email_error || "Invite created but email was not sent. Check Supabase email settings.");
      } else {
        toast.success("Invitation email sent");
      }
      setEmail("");
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

  return (
    <div className="relative container mx-auto p-4 sm:p-6 space-y-6 max-w-5xl min-h-[calc(100vh-80px)]">
      <div>
        <h1 className="text-3xl font-bold">Team Access</h1>
        <p className="text-muted-foreground text-sm">Manage who can access and operate your QA workspace.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-12 items-end">
            <div className="space-y-1 sm:col-span-7">
              <Label>Invite by email</Label>
              <Input
                type="email"
                placeholder="partner@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1 sm:col-span-3">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "Member" | "Manager")}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Member">Employee</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Button onClick={inviteMember} disabled={submitting} className="w-full h-11 rounded-xl">
                {submitting ? "Sending..." : "Invite"}
              </Button>
            </div>
          </div>

          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-xs text-muted-foreground">{member.email}</div>
                {member.ownerEmail && member.name === "Workspace Owner" && (
                  <div className="text-[11px] text-muted-foreground mt-1">Owner: {member.ownerEmail}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{member.status}</Badge>
                <Badge>{member.role === "Member" ? "Employee" : member.role}</Badge>
                {member.canAccept && (
                  <Button size="sm" onClick={() => acceptInvite(member.id)}>
                    Accept Invite
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Scope</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Team members with accepted invites can log in and collaborate on all {projects.length} shared projects.
          </p>
          <Badge variant="outline">Live Collaboration Enabled</Badge>
        </CardContent>
      </Card>
      {!canUseTeam && (
        <PaywallOverlay 
          title="Team Management"
          description="Scale your QA operations by inviting teammates and setting up manager roles."
          planRequired="Pro"
          icon={<UsersRound className="h-10 w-10 text-primary" />}
        />
      )}
    </div>
  );
}
