import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import type { DataSource, DataSourceInput } from "../../api/datasource";

interface DataSourceFormProps {
  source?: DataSource;
  onSubmit: (data: DataSourceInput) => Promise<void>;
  onCancel: () => void;
}

const METHODS = ["GET", "POST", "PUT"];

export function DataSourceForm({ source, onSubmit, onCancel }: DataSourceFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(source?.name ?? "");
  const [endpoint, setEndpoint] = useState(source?.endpoint ?? "");
  const [method, setMethod] = useState(source?.method ?? "GET");
  const [parsePath, setParsePath] = useState(source?.parse_path ?? "");
  const [cronSchedule, setCronSchedule] = useState(source?.cron_schedule ?? "0 */5 * * * *");
  const [headers, setHeaders] = useState(source?.headers ?? "{}");
  const [bodyTemplate, setBodyTemplate] = useState(source?.body_template ?? "");
  const [isActive, setIsActive] = useState(source?.is_active ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        endpoint,
        method,
        parse_path: parsePath,
        cron_schedule: cronSchedule,
        headers,
        body_template: bodyTemplate,
        is_active: isActive,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="名称"
        placeholder="例：QDII基金限购状态"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="API 端点"
        placeholder="https://api.example.com/status"
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">请求方法</label>
          <div className="flex gap-1">
            {METHODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  method === m
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <Input
          label="Cron 表达式"
          placeholder="0 */5 * * * *"
          value={cronSchedule}
          onChange={(e) => setCronSchedule(e.target.value)}
          required
        />
      </div>
      <Input
        label="解析路径 (GJSON syntax)"
        placeholder="data.status"
        value={parsePath}
        onChange={(e) => setParsePath(e.target.value)}
        required
      />
      <Input
        label="Headers (JSON)"
        placeholder='{"Authorization": "Bearer xxx"}'
        value={headers}
        onChange={(e) => setHeaders(e.target.value)}
      />
      <Input
        label="Body 模板"
        placeholder="请求体（GET请求可留空）"
        value={bodyTemplate}
        onChange={(e) => setBodyTemplate(e.target.value)}
      />
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-slate-700">启用此数据源</span>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" loading={loading}>
          {source ? "保存" : "创建"}
        </Button>
      </div>
    </form>
  );
}
