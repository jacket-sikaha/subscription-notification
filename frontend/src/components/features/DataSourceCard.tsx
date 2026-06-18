import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import type { DataSource } from "../../api/datasource";
import { Globe, Clock, Trash2, Edit3 } from "lucide-react";

interface DataSourceCardProps {
  source: DataSource;
  onEdit: (source: DataSource) => void;
  onDelete: (id: string) => void;
}

export function DataSourceCard({ source, onEdit, onDelete }: DataSourceCardProps) {
  return (
    <Card className="group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {source.name}
            </h3>
            <Badge variant={source.is_active ? "success" : "default"}>
              {source.is_active ? "启用" : "禁用"}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <Globe className="w-3 h-3" />
            <span className="truncate">{source.endpoint}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {source.cron_schedule}
            </span>
            <span className="font-mono text-slate-400">
              {source.parse_path}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(source)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
            title="编辑"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(source.id)}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
