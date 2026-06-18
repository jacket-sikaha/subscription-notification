import { useQuery } from "@tanstack/react-query";
import { Plus, Radio, Bell, Activity } from "lucide-react";
import { listDataSources } from "../api/datasource";
import { listSubscriptions } from "../api/subscription";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";

export function Dashboard() {
  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ["datasources"],
    queryFn: listDataSources,
  });

  const { data: subs, isLoading: subsLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: listSubscriptions,
  });

  const sourceCount = sources?.data?.length ?? 0;
  const subCount = subs?.data?.length ?? 0;
  const activeSourceCount =
    sources?.data?.filter((s) => s.is_active).length ?? 0;

  const stats = [
    {
      label: "数据源总数",
      value: sourceCount,
      icon: Radio,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "活跃数据源",
      value: activeSourceCount,
      icon: Activity,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "订阅总数",
      value: subCount,
      icon: Bell,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
        <p className="mt-1 text-sm text-slate-500">
          实时掌握数据源和订阅的整体概况
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {sourcesLoading || subsLoading ? (
                    <Skeleton className="h-8 w-12 inline-block" />
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            最近数据源
          </h3>
          {sourcesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : sourceCount === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">😅</p>
              <p className="text-sm text-slate-400">还没有数据源</p>
              <p className="text-xs text-slate-300 mt-1">
                前往数据源页面添加第一个
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {sources?.data?.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-700 truncate">{s.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      s.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {s.is_active ? "启用" : "禁用"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            最近订阅
          </h3>
          {subsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ) : subCount === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📬</p>
              <p className="text-sm text-slate-400">还没有订阅</p>
              <p className="text-xs text-slate-300 mt-1">
                前往订阅管理页面创建
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {subs?.data?.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-700 truncate">
                    {s.user_email}
                  </span>
                  <span className="text-xs text-slate-400">
                    {s.condition_type} {s.condition_value}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
