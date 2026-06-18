import type { ApiResponse } from "../types/api";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export interface Subscription {
  id: string;
  user_email: string;
  source_id: string;
  condition_type: string;
  condition_value: string;
  last_triggered_value: string;
  enabled: boolean;
  created_at: string;
}

export interface SubscriptionInput {
  user_email: string;
  source_id: string;
  condition_type: string;
  condition_value: string;
  enabled: boolean;
}

export async function listSubscriptions(): Promise<ApiResponse<Subscription[]>> {
  const res = await fetch(`${BASE}/subscriptions`);
  return res.json();
}

export async function getSubscription(id: string): Promise<ApiResponse<Subscription>> {
  const res = await fetch(`${BASE}/subscriptions/${id}`);
  return res.json();
}

export async function createSubscription(data: SubscriptionInput): Promise<ApiResponse<Subscription>> {
  const res = await fetch(`${BASE}/subscriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateSubscription(
  id: string,
  data: Partial<SubscriptionInput>
): Promise<ApiResponse<null>> {
  const res = await fetch(`${BASE}/subscriptions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteSubscription(id: string): Promise<ApiResponse<null>> {
  const res = await fetch(`${BASE}/subscriptions/${id}`, { method: "DELETE" });
  return res.json();
}
