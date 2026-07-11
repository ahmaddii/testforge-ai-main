import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AuthShell } from "./login";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
  head: () => ({ meta: [{ title: "Signing you in — Speclane" }] }),
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const next = url.searchParams.get("next") || "/app";

        // Supabase email links can be PKCE `code` or `token_hash` + `type` (invite/recovery/magiclink)
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type") as any;

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          if (error) throw error;
        } else {
          // If session already exists, continue
          const { data } = await supabase.auth.getSession();
          if (!data.session) throw new Error("Invalid or expired link");
        }

        navigate({ to: next as any });
      } catch (err: any) {
        toast.error(err?.message || "Failed to sign in from link");
        navigate({ to: "/login" });
      }
    };

    run();
  }, [navigate]);

  return (
    <AuthShell title="Signing you in…" subtitle="Just a moment while we secure your session">
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    </AuthShell>
  );
}

