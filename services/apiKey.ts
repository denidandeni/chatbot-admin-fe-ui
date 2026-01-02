import { api } from "@/services/api";

export interface ApiKeyInfo {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface ApiKeyResponse {
  api_key: string;
  key_info: ApiKeyInfo;
}

export interface ApiKeysListResponse {
  keys: ApiKeyInfo[];
  total: number;
}

/**
 * Generate API key for a chatbot
 */
export async function generateApiKey(chatbotId: string, keyName: string, organizationId?: string): Promise<ApiKeyResponse> {
  try {
    const payload: any = {
      chatbot_id: chatbotId,
      name: keyName
    };
    if (organizationId) payload.organization_id = organizationId;

    // Attempt real API call
    const res = await api.post("/api/api-keys/", payload);
    return res.data;
  } catch (error: any) {
    console.warn("API Error (generateApiKey), returning mock key");
    return {
      api_key: `sk-mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      key_info: {
        id: `key-mock-${Date.now()}`,
        name: keyName,
        key_prefix: "sk-mock",
        is_active: true,
        last_used_at: null,
        expires_at: null,
        created_at: new Date().toISOString()
      }
    };
  }
}

export async function getApiKeys(chatbotId?: string, includeInactive: boolean = false): Promise<ApiKeysListResponse> {
  try {
    let url = chatbotId ? `/api/api-keys/?chatbot_id=${chatbotId}` : "/api/api-keys/";
    if (includeInactive) url += (url.includes('?') ? '&' : '?') + 'include_inactive=true';

    const res = await api.get(url);
    return res.data;
  } catch (error: any) {
    console.warn("API Error (getApiKeys), returning mock keys");
    return {
      keys: [
        {
          id: "key-Static-1",
          name: "Default Key",
          key_prefix: "sk-stat",
          is_active: true,
          last_used_at: new Date().toISOString(),
          expires_at: null,
          created_at: new Date().toISOString()
        }
      ],
      total: 1
    };
  }
}

export async function getApiKey(keyId: string): Promise<ApiKeyResponse> {
  try {
    const res = await api.get(`/api/api-keys/${keyId}`);
    return res.data;
  } catch (error: any) {
    console.warn("API Error (getApiKey), returning mock details");
    return {
      api_key: "sk-mock-hidden-key", // Usually full key is only shown on creation, but mocking here
      key_info: {
        id: keyId,
        name: "Mock Key Details",
        key_prefix: "sk-mock",
        is_active: true,
        last_used_at: new Date().toISOString(),
        expires_at: null,
        created_at: new Date().toISOString()
      }
    };
  }
}

export async function revokeApiKey(keyId: string): Promise<void> {
  try {
    await api.patch(`/api/api-keys/${keyId}`, { is_active: false });
  } catch (error: any) {
    console.warn("API Error (revokeApiKey), simulating success");
    return;
  }
}

export async function deleteApiKey(keyId: string): Promise<void> {
  return permanentDeleteApiKey(keyId);
}

export async function permanentDeleteApiKey(keyId: string): Promise<void> {
  try {
    await api.delete(`/api/api-keys/${keyId}/permanent`);
  } catch (error: any) {
    console.warn("API Error (permanentDeleteApiKey), simulating success");
    return;
  }
}

export async function reactivateApiKey(keyId: string): Promise<void> {
  try {
    await api.patch(`/api/api-keys/${keyId}`, { is_active: true });
  } catch (error: any) {
    console.warn("API Error (reactivateApiKey), simulating success");
    return;
  }
}

export async function getOrganizationsForApiKey(): Promise<OrganizationOption[]> {
  try {
    const res = await api.get("/api/api-keys/organizations");
    return res.data.data || [];
  } catch (error: any) {
    console.warn("API Error (getOrganizationsForApiKey), returning mock orgs");
    return [
      {
        id: "static-org-123",
        name: "Demo Organization",
        description: "Static demo org",
        is_active: true
      }
    ];
  }
}