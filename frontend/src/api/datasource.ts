import type { ApiResponse } from "../types/api";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export interface DataSource {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  headers: string;
  body_template: string;
  parse_path: string;
  cron_schedule: string;
  is_active: boolean;
  created_at: string;
}

export interface DataSourceInput {
  name: string;
  endpoint: string;
  method: string;
  headers?: string;
  body_template?: string;
  parse_path: string;
  cron_schedule: string;
  is_active: boolean;
}

export async function listDataSources(): Promise<ApiResponse<DataSource[]>> {
  const res = await fetch(`${BASE}/datasources`);
  return res.json();
}

export async function getDataSource(id: string): Promise<ApiResponse<DataSource>> {
  const res = await fetch(`${BASE}/datasources/${id}`);
  return res.json();
}

export async function createDataSource(data: DataSourceInput): Promise<ApiResponse<DataSource>> {
  const res = await fetch(`${BASE}/datasources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateDataSource(
  id: string,
  data: Partial<DataSourceInput>
): Promise<ApiResponse<null>> {
  const res = await fetch(`${BASE}/datasources/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteDataSource(id: string): Promise<ApiResponse<null>> {
  const res = await fetch(`${BASE}/datasources/${id}`, { method: "DELETE" });
  return res.json();
}
