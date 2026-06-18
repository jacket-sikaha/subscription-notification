import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useSidebarStore } from "../../stores/sidebarStore";
import { cn } from "../../utils/cn";

export function AppLayout() {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <main
        className={cn(
          "transition-all duration-200 min-h-screen",
          collapsed ? "ml-16" : "ml-60"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
