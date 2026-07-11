import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/")({
  component: AdminIndexRedirect,
});

function AdminIndexRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("speclane_super_admin_token");
    if (token) {
      navigate({ to: "/admin/inquiries", replace: true });
    } else {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#14120B] flex items-center justify-center text-white font-mono text-sm">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Redirecting Super Admin...</span>
      </div>
    </div>
  );
}
