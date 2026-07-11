import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#14120B] text-white font-sans selection:bg-primary selection:text-black">
      <Outlet />
    </div>
  );
}
