import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { PageSkeleton } from "@/components/page-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { useEffect, useState, useRef } from "react";
import { Camera, Loader2, User as UserIcon, Building2, Copy, Check, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Speclane" }] }),
});

function SettingsPage() {
  const user = useApp((s) => s.user);
  const setUser = useApp((s) => s.setUser);
  const loading = useApp((s) => s.loading);
  const projects = useApp((s) => s.projects);
  const requirements = useApp((s) => s.requirements);
  const testCases = useApp((s) => s.testCases);
  const defects = useApp((s) => s.defects);
  const reports = useApp((s) => s.reports);
  const fetchData = useApp((s) => s.fetchData);

  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [workspaceName, setWorkspaceName] = useState(() => {
    return localStorage.getItem("speclane_workspace_name") || "Speclane Main Workspace";
  });
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setFullName(user.name);
    }
  }, [user?.name]);

  useEffect(() => {
    // Ensure storage is initialized on the server
    api.post("/profile/init-storage", {}).catch(console.error);

    // Check if workspace name was saved in user metadata
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      const metaName = authUser?.user_metadata?.workspace_name;
      if (metaName) {
        setWorkspaceName(metaName);
        localStorage.setItem("speclane_workspace_name", metaName);
      }
      if (authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.avatar) {
        const av = authUser.user_metadata.avatar_url || authUser.user_metadata.avatar;
        if (user && !user.avatar) {
          setUser({ ...user, avatar: av });
        }
      }
    });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image must be less than 5MB");
    }

    setUploading(true);
    try {
      // 1. Read file as base64 Data URL
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const dataUrl = await base64Promise;

      // 2. Upload via backend endpoint (service role ensures reliable upload and Auth sync)
      let publicUrl = '';
      try {
        const res = await api.post('/profile/avatar', {
          image: dataUrl,
          name: file.name
        });
        publicUrl = res.avatar || res.avatar_url;
      } catch (backendErr) {
        // Fallback: direct upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        publicUrl = urlData.publicUrl;
      }

      if (!publicUrl) throw new Error("Could not retrieve image URL");

      // 3. Sync User Metadata in Supabase Auth
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl, avatar: publicUrl }
      }).catch(() => {});

      // 4. Update Local Caches and Global Store
      localStorage.setItem(`speclane_avatar_${user.id}`, publicUrl);
      localStorage.setItem("speclane_user_avatar", publicUrl);
      setUser({ ...user, avatar: publicUrl });

      // 5. Notify workspace
      await api.post('/notifications', {
        title: "Profile Picture Updated",
        message: `${user.name || 'Team member'} updated their workspace profile photo.`,
        type: "info",
        actor_name: user.name,
        actor_avatar: publicUrl,
        actor_email: user.email
      }).catch(() => {});

      toast.success("Profile photo updated successfully!");
      fetchData().catch(() => {});
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url: user.avatar, avatar: user.avatar }
      });
      setUser({ ...user, name: fullName });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile changes");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return <PageSkeleton cards={3} rows={5} />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-3xl relative">

      <div className="relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1">Settings</h1>
        <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">Configure your professional workspace and security preferences.</p>
      </div>

      <div className="space-y-6 relative z-10">
        <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] shadow-none rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col items-center sm:flex-row gap-6 pb-2">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full border-2 border-slate-100 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-white/5 flex items-center justify-center shadow-inner">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name || "Avatar"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <UserIcon className="w-10 h-10 text-slate-300 dark:text-white/20" />
                  )}

                  {uploading && (
                    <div className="absolute inset-0 bg-[#14120B]/60 rounded-full flex items-center justify-center z-10">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-[#14120B]/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full flex items-center justify-center z-20">
                    <Camera className="w-6 h-6 text-white transform scale-90 group-hover:scale-100 transition-transform" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white">Profile Photo</h3>
                <p className="text-xs text-slate-500 dark:text-white/40 max-w-[200px]">
                  Click to upload a new photo. PNG, JPG or WEBP (Max 5MB).
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 dark:text-white/60 font-medium">Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-11 focus:ring-primary/20 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-500 dark:text-white/60 font-medium">Email Address</Label>
              <Input
                defaultValue={user?.email || ""}
                disabled
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 h-11 rounded-xl cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 dark:text-white/20 px-1">Email cannot be changed in the preview environment.</p>
            </div>
            <Button onClick={saveProfile} disabled={savingProfile} className="gradient-bg text-primary-foreground shadow-none rounded-full h-11 px-8 font-bold flex items-center gap-2">
              {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Profile Changes
            </Button>
          </CardContent>
        </Card>



        <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] shadow-none rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Workspace Management</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
              Role: {user?.role || "Owner"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-500 dark:text-white/60 font-medium">Workspace Name</Label>
                <Input
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Engineering QA"
                  className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-11 focus:ring-primary/20 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500 dark:text-white/60 font-medium">Workspace ID</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`ws-${user?.id?.substring(0, 12) || "main-org"}`}
                    className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 h-11 rounded-xl font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(`ws-${user?.id || "main"}`);
                      setCopiedId(true);
                      toast.success("Workspace ID copied to clipboard");
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="h-11 w-11 rounded-xl shrink-0 border-slate-200 dark:border-white/10"
                    title="Copy Workspace ID"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-start">
              <Button
                onClick={async () => {
                  if (!workspaceName.trim()) return toast.error("Workspace name cannot be empty");
                  setSavingWorkspace(true);
                  try {
                    localStorage.setItem("speclane_workspace_name", workspaceName.trim());
                    await supabase.auth.updateUser({
                      data: { workspace_name: workspaceName.trim() }
                    }).catch(() => { });
                    toast.success("Workspace configuration saved successfully!");
                  } catch (err: any) {
                    toast.error(err.message || "Failed to update workspace configuration");
                  } finally {
                    setSavingWorkspace(false);
                  }
                }}
                disabled={savingWorkspace}
                className="gradient-bg text-primary-foreground shadow-none rounded-full h-10 px-7 font-bold text-sm"
              >
                {savingWorkspace ? "Saving..." : "Save Workspace Name"}
              </Button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
              <Label className="text-slate-500 dark:text-white/60 font-medium text-xs uppercase tracking-wider">
                Workspace Health & Resource Metrics
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40">Projects</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{projects.length}</div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40">Requirements</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{requirements.length}</div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40">Test Cases</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{testCases.length}</div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40">Reports</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{reports.length}</div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40">Open Defects</div>
                  <div className="text-xl font-bold text-red-500 dark:text-red-400">
                    {defects.filter((d) => d.status === "Open").length}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-slate-500 dark:text-white/60 font-medium text-xs">Workspace Sync</Label>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await fetchData();
                    toast.success("Workspace data synchronized");
                  }}
                  className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full h-10 px-6 font-bold flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync Workspace Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
