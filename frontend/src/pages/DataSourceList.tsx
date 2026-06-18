import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  listDataSources,
  createDataSource,
  updateDataSource,
  deleteDataSource,
  type DataSource,
  type DataSourceInput,
} from "../api/datasource";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import { DataSourceCard } from "../components/features/DataSourceCard";
import { DataSourceForm } from "../components/features/DataSourceForm";
import { DataSourceCardSkeleton } from "../components/ui/Skeleton";

export function DataSourceList() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | undefined>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["datasources"],
    queryFn: listDataSources,
  });

  const createMutation = useMutation({
    mutationFn: createDataSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasources"] });
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DataSourceInput> }) =>
      updateDataSource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasources"] });
      setDialogOpen(false);
      setEditingSource(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDataSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasources"] });
    },
  });

  const handleSubmit = async (input: DataSourceInput) => {
    if (editingSource) {
      await updateMutation.mutateAsync({ id: editingSource.id, data: input });
    } else {
      await createMutation.mutateAsync(input);
    }
  };

  const handleEdit = (source: DataSource) => {
    setEditingSource(source);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定删除此数据源？相关订阅也会被级联删除。")) {
      deleteMutation.mutate(id);
    }
  };

  const sources = data?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">数据源</h1>
          <p className="mt-1 text-sm text-slate-500">
            管理 API 抓取端点、解析规则和调度策略
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingSource(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          添加数据源
        </Button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
          加载失败：{error.message}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <DataSourceCardSkeleton key={i} />
          ))}
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">😅</p>
          <p className="text-slate-500">还没有数据源</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            点击上方按钮添加第一个监控端点
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((source) => (
            <DataSourceCard
              key={source.id}
              source={source}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingSource(undefined);
        }}
        title={editingSource ? "编辑数据源" : "新建数据源"}
      >
        <DataSourceForm
          source={editingSource}
          onSubmit={handleSubmit}
          onCancel={() => {
            setDialogOpen(false);
            setEditingSource(undefined);
          }}
        />
      </Dialog>
    </div>
  );
}
