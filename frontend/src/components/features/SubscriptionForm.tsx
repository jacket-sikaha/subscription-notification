import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import type { Subscription, SubscriptionInput } from "../../api/subscription";
import type { DataSource } from "../../api/datasource";

interface SubscriptionFormProps {
  subscription?: Subscription;
  sources: DataSource[];
  onSubmit: (data: SubscriptionInput) => Promise<void>;
  onCancel: () => void;
}

const CONDITION_TYPES = [
  { value: "eq", label: "等于 (=)" },
  { value: "gt", label: "大于 (>)" },
  { value: "lt", label: "小于 (<)" },
  { value: "contains", label: "包含" },
];

export function SubscriptionForm({
  subscription,
  sources,
  onSubmit,
  onCancel,
}: SubscriptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(subscription?.user_email ?? "");
  const [sourceId, setSourceId] = useState(subscription?.source_id ?? "");
  const [conditionType, setConditionType] = useState(
    subscription?.condition_type ?? "eq"
  );
  const [conditionValue, setConditionValue] = useState(
    subscription?.condition_value ?? ""
  );
  const [enabled, setEnabled] = useState(subscription?.enabled ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        user_email: userEmail,
        source_id: sourceId,
        condition_type: conditionType,
        condition_value: conditionValue,
        enabled,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="通知邮箱"
        type="email"
        placeholder="user@example.com"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        required
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">数据源</label>
        <select
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        >
          <option value="">选择数据源...</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">条件类型</label>
          <select
            value={conditionType}
            onChange={(e) => setConditionType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {CONDITION_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="条件值"
          placeholder='例："open" 或 "100"'
          value={conditionValue}
          onChange={(e) => setConditionValue(e.target.value)}
          required
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-slate-700">启用此订阅</span>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" loading={loading}>
          {subscription ? "保存" : "创建"}
        </Button>
      </div>
    </form>
  );
}
