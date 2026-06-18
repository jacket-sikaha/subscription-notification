import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Mail, Trash2, Edit3, Circle, CircleCheck } from "lucide-react";
import {
  listSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  type Subscription,
  type SubscriptionInput,
} from "../api/subscription";
import { listDataSources } from "../api/datasource";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Dialog } from "../components/ui/Dialog";
import { SubscriptionForm } from "../components/features/SubscriptionForm";
import { Skeleton } from "../components/ui/Skeleton";

export function SubscriptionManage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | undefined>();

  const { data: sources } = useQuery({
    queryKey: ["datasources"],
    queryFn: listDataSources,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: listSubscriptions,
  });

  const createMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SubscriptionInput>;
    }) => updateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setDialogOpen(false);
      setEditingSub(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });

  const handleSubmit = async (input: SubscriptionInput) => {
    if (editingSub) {
      await updateMutation.mutateAsync({ id: editingSub.id, data: input });
    } else {
      await createMutation.mutateAsync(input);
    }
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setDialogOpen(true);
  };

  const handleToggle = (sub: Subscription) => {
    updateMutation.mutate({
      id: sub.id,
      data: { enabled: !sub.enabled } as SubscriptionInput,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定删除此订阅？")) {
      deleteMutation.mutate(id);
    }
  };

  const sourceMap = new Map(
    (sources?.data ?? []).map((s) => [s.id, s.name])
  );

  const subs = data?.data ?? [];

  const CONDITION_LABELS: Record<string, string> = {
    eq: "=",
    gt: ">",
    lt: "<",
    contains: "包含",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">订阅管理</h1>
          <p className="mt-1 text-sm text-slate-500">
            配置条件通知规则，当数据源值满足条件时自动发送邮件
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingSub(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          添加订阅
        </Button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
          加载失败：{error.message}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <Skeleton className="h-5 w-1/3 mb-3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : subs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📬</p>
          <p className="text-slate-500">还没有订阅</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            创建订阅来监控数据源的状态变化
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map((sub) => (
            <Card key={sub.id} className="group">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-900 truncate">
                      {sub.user_email}
                    </span>
                    <Badge variant={sub.enabled ? "success" : "default"}>
                      {sub.enabled ? "启用" : "禁用"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 ml-7">
                    <span className="text-slate-400">
                      {sourceMap.get(sub.source_id) ?? sub.source_id}
                    </span>
                    <span className="font-mono">
                      {CONDITION_LABELS[sub.condition_type] ?? sub.condition_type}{" "}
                      {sub.condition_value}
                    </span>
                    {sub.last_triggered_value && (
                      <span className="text-slate-300">
                        | 上次值: {sub.last_triggered_value}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => handleToggle(sub)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
                    title={sub.enabled ? "禁用" : "启用"}
                  >
                    {sub.enabled ? (
                      <Circle className="w-4 h-4" />
                    ) : (
                      <CircleCheck className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(sub)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="编辑"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingSub(undefined);
        }}
        title={editingSub ? "编辑订阅" : "新建订阅"}
      >
        <SubscriptionForm
          subscription={editingSub}
          sources={sources?.data ?? []}
          onSubmit={handleSubmit}
          onCancel={() => {
            setDialogOpen(false);
            setEditingSub(undefined);
          }}
        />
      </Dialog>
    </div>
  );
}
