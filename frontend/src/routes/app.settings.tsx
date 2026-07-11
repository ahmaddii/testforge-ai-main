import { createFileRoute, Link } from "@tanstack/react-router";
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
import { Camera, Loader2, User as UserIcon } from "lucide-react";

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

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [billing, setBilling] = useState<any>(null);

  useEffect(() => {
    // Ensure storage is initialized on the server
    api.post("/profile/init-storage", {}).catch(console.error);
    api.get("/billing/subscription").then(setBilling).catch(console.error);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Image must be less than 2MB");
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // 3. Update User Metadata in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      // 4. Update Local State
      setUser({ ...user, avatar: publicUrl });
      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
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
                  Click to upload a new photo. PNG, JPG or WEBP (Max 2MB).
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 dark:text-white/60 font-medium">Full Name</Label>
              <Input 
                defaultValue={user?.name || ""} 
                onBlur={(e) => user && setUser({ ...user, name: e.target.value })} 
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
            <Button onClick={() => toast.success("Profile updated successfully")} className="gradient-bg text-primary-foreground shadow-none rounded-full h-11 px-8 font-bold">
              Save Profile Changes
            </Button>
          </CardContent>
        </Card>


        <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] shadow-none rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Subscription & Billing</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 gap-4">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Current Plan: <span className="capitalize text-primary ml-1">{billing ? billing.plan : 'Loading...'}</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-white/40 max-w-md">
                Manage your billing details, update payment methods, and view your usage limits.
              </div>
            </div>
            <Link to="/app/billing">
              <Button variant="outline" className="rounded-full h-10 px-6 border-slate-200 dark:border-white/10">
                Manage Subscription
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] shadow-none rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Workspace Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
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
            <div className="space-y-2">
              <Label className="text-slate-500 dark:text-white/60 font-medium">Quick Actions</Label>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full h-10 px-6 font-bold"
                >
                  Refresh Workspace Data
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.info("More advanced workspace controls can be added here.")}
                  className="text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white rounded-full"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
