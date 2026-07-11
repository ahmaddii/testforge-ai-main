import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AuthShell } from "./login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/set-password")({
  component: SetPasswordPage,
  head: () => ({ meta: [{ title: "Set password — Speclane" }] }),
});

import { Lock, ArrowRight, Loader2 } from "lucide-react";

function SetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ensureSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/login" });
      }
    };
    ensureSession();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // Best-effort: auto-accept any pending team invite for this user
      try {
        const team = await api.get("/team");
        const { data: { user } } = await supabase.auth.getUser();
        const email = user?.email?.toLowerCase();
        const pending = (team || []).find((t: any) => t.status === "pending" && (t.email || "").toLowerCase() === email);
        if (pending?.id) {
          await api.post(`/team/${pending.id}/accept`, {});
        }
      } catch {
        // Non-blocking
      }

      toast.success("Password set successfully");
      navigate({ to: "/app/team" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to set password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthShell title="Set your password" subtitle="One-time setup for your invited account">
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-white/90">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-3 h-4 w-4 text-white/40 pointer-events-none" />
            <Input 
              type="password" 
              required 
              placeholder="Enter your password (min 8 char)"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 h-10 text-sm rounded-xl bg-[#12131A]/60 border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-white/90">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-3 h-4 w-4 text-white/40 pointer-events-none" />
            <Input 
              type="password" 
              required 
              placeholder="Re-enter your password"
              value={confirm} 
              onChange={(e) => setConfirm(e.target.value)}
              className="pl-11 h-10 text-sm rounded-xl bg-[#12131A]/60 border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-10 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-[#14120B] shadow-sm hover:shadow-md active:scale-[0.96] active:translate-y-[1px] transition-all duration-150 mt-3"
          disabled={saving}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Save Password & Access Workspace"}
        </Button>
      </form>
    </AuthShell>
  );
}

