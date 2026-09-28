import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { VideoCall } from "@/components/VideoCall";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { Video, Users, Shield, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PaywallOverlay } from "@/components/paywall-overlay";

export const Route = createFileRoute("/app/video-call")({
  component: VideoCallPage,
  head: () => ({ meta: [{ title: "Video Call — Speclane" }] }),
});

function VideoCallPage() {
  const user = useApp((s) => s.user);
  const { setOpen, open: isSidebarOpen } = useSidebar();
  const [workspaceOwnerId, setWorkspaceOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [callEnded, setCallEnded] = useState(false);

  useEffect(() => {
    // Auto-collapse sidebar for immersive video experience
    setOpen(false);

    const fetchTeamInfo = async () => {
      try {
        const team = await api.get('/team');
        const owner = team?.find((m: any) => m.role === 'Owner')?.owner_id || user?.id;
        setWorkspaceOwnerId(owner);
      } catch (err) {
        console.error("Failed to fetch team info", err);
        setWorkspaceOwnerId(user?.id || 'public');
      } finally {
        setLoading(false);
      }
    };
    fetchTeamInfo();

    return () => {
      // Always open sidebar when leaving video call
      setOpen(true);
    };
  }, [user?.id, setOpen]);

  // Generate a stable room name for this workspace
  const roomName = workspaceOwnerId
    ? `Speclane-Workspace-${workspaceOwnerId.replace(/[^a-zA-Z0-9]/g, '')}`
    : 'Speclane-Public-Meeting';

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-100px)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent flex items-center gap-2">
            <Video className="h-7 w-7 text-primary" />
            Video Conference
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-xs mt-0.5">
            End-to-end encrypted video calls for your QA team.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-600 dark:text-white/70">
            <Shield className="h-3 w-3 text-green-500" />
            Secure
          </div>
          <div className="h-3 w-px bg-slate-300 dark:bg-white/10" />
          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-600 dark:text-white/70">
            <Globe className="h-3 w-3 text-blue-500" />
            Jitsi Engine
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-none bg-slate-50 dark:bg-white/5">
        {callEnded ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 ring-8 ring-green-500/5">
              <Shield className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Meeting Ended Successfully</h2>
            <p className="text-slate-500 dark:text-white/50 max-w-md mb-8">
              Your video session has been securely closed. All temporary data for this session has been wiped for your privacy.
            </p>
            <Button
              size="lg"
              onClick={() => setCallEnded(false)}
              className="rounded-full px-8 h-12 gradient-bg shadow-none hover:scale-105 transition-all gap-2"
            >
              <Video className="h-5 w-5" />
              Create Meeting Again
            </Button>
          </div>
        ) : !loading ? (
          <VideoCall roomName={roomName} onLeave={() => setCallEnded(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-slate-500">Securing your meeting room...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
