import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Radio,
  Bell,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { cn } from "../../utils/cn";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "仪表盘" },
  { to: "/datasources", icon: Radio, label: "数据源" },
  { to: "/subscriptions", icon: Bell, label: "订阅管理" },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-40 transition-all duration-200 flex flex-col",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
        {!collapsed && (
          <span className="text-sm font-bold text-indigo-600 tracking-tight">
            订阅通知中台
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title={collapsed ? "展开侧栏" : "收起侧栏"}
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t border-slate-100">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>设置</span>}
        </NavLink>
      </div>
    </aside>
  );
}
