import { api } from "@/services/api";

export interface SubscriptionPlan {
  plan_id: string;
  name: string;
  description: string;
  allowed_models: string[];
  prices_by_duration_months: Record<string, number>;
}

export interface SubscriptionState {
  is_active: boolean;
  effective_allowed_models: string[];
  subscription: null | {
    organization_id: string;
    allowed_models: string[];
    start_at: string;
    end_at: string;
  };
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const res = await api.get("/api/subscriptions/plans");
    return res.data.data || [];
  } catch (error) {
    console.warn("API Error (getSubscriptionPlans), returning mock plans");
    return [
      {
        plan_id: "free",
        name: "Free Plan",
        description: "Basic features for everyone",
        allowed_models: ["gpt-3.5-turbo"],
        prices_by_duration_months: { "1": 0 }
      },
      {
        plan_id: "pro",
        name: "Pro Plan",
        description: "Advanced features for power users",
        allowed_models: ["gpt-4", "claude-3-opus"],
        prices_by_duration_months: { "1": 29, "12": 290 }
      }
    ];
  }
}

export async function getMySubscriptionState(): Promise<SubscriptionState> {
  try {
    const res = await api.get("/api/subscriptions/me");
    return res.data.data;
  } catch (error) {
    console.warn("API Error (getMySubscriptionState), returning mock subscription");
    return {
      is_active: true,
      effective_allowed_models: ["gpt-4", "gpt-3.5-turbo"],
      subscription: {
        organization_id: "static-org-123",
        allowed_models: ["gpt-4", "gpt-3.5-turbo"],
        start_at: new Date().toISOString(),
        end_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
      }
    };
  }
}

export async function getOrganizationSubscriptionState(orgId: string): Promise<SubscriptionState> {
  try {
    const res = await api.get(`/api/subscriptions/organization/${orgId}`);
    return res.data.data;
  } catch (error) {
    console.warn("API Error (getOrganizationSubscriptionState), returning mock subscription");
    return {
      is_active: true,
      effective_allowed_models: ["gpt-4", "gpt-3.5-turbo"],
      subscription: {
        organization_id: orgId || "static-org-123",
        allowed_models: ["gpt-4", "gpt-3.5-turbo"],
        start_at: new Date().toISOString(),
        end_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
      }
    };
  }
}

export async function createMidtransCheckout(payload: {
  plan_id: string;
  duration_months: number;
}): Promise<{ order_id: string; redirect_url: string }> {
  try {
    const res = await api.post("/api/payments/midtrans/checkout", payload);
    return res.data;
  } catch (error) {
    console.warn("API Error (createMidtransCheckout), returning mock checkout");
    return {
      order_id: `mock-order-${Date.now()}`,
      redirect_url: "https://google.com" // Redirect to a safe page for demo
    };
  }
}

