import { api } from "@/services/api";
import { ApiKeyInfo, getApiKeys } from "./apiKey";
import { FEATURES } from "@/config/features";
import { getLoggedInUserOrganizationId, isAdmin } from "./tokenUtils";

export interface Chatbot {
  id: string;
  name: string;
  description: string;
  personality?: string;
  organization_id?: string;
  model?: string;
  created_at: string;
  updated_at: string;
  api_keys?: ApiKeyInfo[];
  // New fields from FastAPI response
  contexts?: any[];
  connector_contexts?: any[];
}

export interface CreateChatbotPayload {
  name: string;
  description: string;
  personality: string;
  organization_id?: string;
  model: string;
}

export interface UpdateChatbotPayload {
  name: string;
  description: string;
  personality?: string;
  organization_id?: string;
  model?: string;
}

/**
 * Get all chatbots with their API keys
 * Uses the new FastAPI endpoint: GET /api/users/chatbots
 */
export async function getChatbots(): Promise<Chatbot[]> {
  try {
    // Use the new FastAPI endpoint
    const res = await api.get("/api/users/chatbots");
    let chatbots = res.data.data || res.data || [];

    console.log("✅ Fetched chatbots from /api/users/chatbots:", chatbots.length);

    // Skip API key fetching if feature is disabled
    if (!FEATURES.API_KEYS) {
      return chatbots.map((chatbot: Chatbot) => ({
        ...chatbot,
        api_keys: []
      }));
    }

    // Try to fetch API keys for each chatbot (optional, won't fail if endpoint not available)
    const chatbotsWithKeys = await Promise.all(
      chatbots.map(async (chatbot: Chatbot) => {
        try {
          const apiKeysData = await getApiKeys(chatbot.id);
          return {
            ...chatbot,
            api_keys: apiKeysData.keys || []
          };
        } catch (error: any) {
          // Silently handle API key fetch errors (endpoint might not be implemented yet)
          // Only log warning for non-404 and non-400 errors
          if (error.response?.status && error.response.status !== 404 && error.response.status !== 400) {
            console.warn(`Failed to fetch API keys for chatbot ${chatbot.id}:`, error.response?.status);
          }
          return {
            ...chatbot,
            api_keys: []
          };
        }
      })
    );

    return chatbotsWithKeys;
  } catch (error: any) {
    // STATIC DEMO FALLBACK
    console.warn("API Error, falling back to static mock data");
    return [
      {
        id: "mock-bot-1",
        name: "Customer Support Bot",
        description: "Handles general inquiries",
        model: "gpt-4",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        personality: "Friendly and helpful",
        organization_id: "static-org-123"
      },
      {
        id: "mock-bot-2",
        name: "Sales Assistant",
        description: "Helps with product recommendations",
        model: "gpt-3.5-turbo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        personality: "Professional and persuasive",
        organization_id: "static-org-123"
      },
      {
        id: "mock-bot-3",
        name: "Technical Support",
        description: "Provides technical assistance",
        model: "gpt-4",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        personality: "Technical and precise",
        organization_id: "static-org-123"
      },
      {
        id: "mock-bot-4",
        name: "Billing Assistant",
        description: "Handles billing questions",
        model: "gpt-3.5-turbo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        personality: "Clear and efficient",
        organization_id: "static-org-123"
      }
    ];
  }
}

/**
 * Get single chatbot by ID
 */
export async function getChatbotById(id: string): Promise<Chatbot | null> {
  // Handle mock IDs directly
  if (id.startsWith("mock-bot-")) {
    const mockBots = [
      {
        id: "mock-bot-1",
        name: "Customer Support Bot",
        description: "Handles general inquiries",
        model: "gpt-4",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        personality: "Friendly and helpful",
        organization_id: "static-org-123"
      },
      {
        id: "mock-bot-2",
        name: "Sales Assistant",
        description: "Helps with product recommendations",
        model: "gpt-3.5-turbo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        personality: "Professional and persuasive",
        organization_id: "static-org-123"
      },
      {
        id: "mock-bot-3",
        name: "Technical Support",
        description: "Provides technical assistance",
        model: "gpt-4",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        personality: "Technical and precise",
        organization_id: "static-org-123"
      },
      {
        id: "mock-bot-4",
        name: "Billing Assistant",
        description: "Handles billing questions",
        model: "gpt-3.5-turbo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        personality: "Clear and efficient",
        organization_id: "static-org-123"
      }
    ];
    return mockBots.find(b => b.id === id) || null;
  }

  try {
    const res = await api.get(`/api/chatbots/${id}`);
    // Handle both direct return and nested structure
    const data = res.data.data || res.data;
    return data;
  } catch (error: any) {
    console.error("Error fetching chatbot:", {
      status: error.response?.status,
      message: error.message,
    });
    return null;
  }
}

/**
 * Create new chatbot
 */
export async function createChatbot(
  payload: CreateChatbotPayload
): Promise<Chatbot> {
  try {
    const res = await api.post("/api/chatbots", payload);
    // Handle both direct return and nested structure
    const data = res.data.data || res.data;
    return data;
  } catch (error: any) {
    console.error("Error creating chatbot:", {
      status: error.response?.status,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Update existing chatbot
 */
export async function updateChatbot(
  id: string,
  payload: UpdateChatbotPayload
): Promise<Chatbot> {
  try {
    const res = await api.put(`/api/chatbots/${id}`, payload);
    const data = res.data.data || res.data;
    return data;
  } catch (error: any) {
    console.error("Error updating chatbot:", {
      status: error.response?.status,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Delete chatbot and its associated API keys
 */
export async function deleteChatbot(id: string): Promise<string> {
  try {
    console.log("🗑️ [DELETE CHATBOT] Starting deletion for ID:", id);

    // Skip API key deletion if feature is disabled
    if (FEATURES.API_KEYS) {
      // First, try to get and delete all API keys associated with the chatbot
      try {
        const apiKeysData = await getApiKeys(id);
        if (apiKeysData.keys && apiKeysData.keys.length > 0) {
          console.log(`🔑 [DELETE CHATBOT] Found ${apiKeysData.keys.length} API keys to delete`);
          const { deleteApiKey } = await import("./apiKey");
          await Promise.all(
            apiKeysData.keys.map(key => deleteApiKey(key.id).catch(err => {
              // Ignore errors for individual key deletion
              console.warn(`⚠️ [DELETE CHATBOT] Failed to delete API key ${key.id}:`, err?.response?.status);
            }))
          );
        }
      } catch (error: any) {
        // Silently handle API key errors (endpoint might not be implemented)
        // Only log for unexpected errors
        if (error.response?.status && error.response.status !== 404 && error.response.status !== 400) {
          console.warn("⚠️ [DELETE CHATBOT] Failed to delete API keys:", error.response?.status);
        }
        // Continue with chatbot deletion even if API key deletion fails
      }
    }

    // Then delete the chatbot
    console.log("🗑️ [DELETE CHATBOT] Calling backend DELETE /api/chatbots/" + id);
    const res = await api.delete(`/api/chatbots/${id}`);

    console.log("✅ [DELETE CHATBOT] Backend response status:", res.status);
    console.log("✅ [DELETE CHATBOT] Backend response data:", res.data);
    console.log("✅ [DELETE CHATBOT] Response data type:", typeof res.data);

    // Handle different response formats from backend
    // Expected format: { status: "success", message: "Chatbot deleted successfully" }
    if (res.data) {
      // Check for status = success and message
      if (res.data.status === "success" && res.data.message) {
        console.log("✅ [DELETE CHATBOT] Success - returning message:", res.data.message);
        return res.data.message;
      }
      // Check for nested message
      if (res.data.message) {
        console.log("✅ [DELETE CHATBOT] Success - found message field:", res.data.message);
        return res.data.message;
      }
      // Check for nested data
      if (res.data.data && typeof res.data.data === 'string') {
        console.log("✅ [DELETE CHATBOT] Success - found data field:", res.data.data);
        return res.data.data;
      }
      // If it's a string response
      if (typeof res.data === 'string') {
        console.log("✅ [DELETE CHATBOT] Success - data is string:", res.data);
        return res.data;
      }
    }

    console.log("✅ [DELETE CHATBOT] Success - using default message");
    return "Chatbot deleted successfully";
  } catch (error: any) {
    console.error("❌ [DELETE CHATBOT] ERROR - Full details:", {
      chatbotId: id,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      responseDetail: error.response?.data?.detail,
      responseMessage: error.response?.data?.message,
      responseData: error.response?.data,
      fullError: error,
    });

    // Pretty print the error response
    if (error.response?.data) {
      console.error("❌ [DELETE CHATBOT] Backend Error Response:", JSON.stringify(error.response.data, null, 2));
    }

    // Handle specific error cases
    let errorMessage = "Failed to delete chatbot";

    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;

      // Check for database constraint violations
      if (detail.includes("chatbot_contexts") && detail.includes("not-null constraint")) {
        errorMessage = "Cannot delete chatbot: Please delete all associated contexts and data first. This chatbot has documents or contexts that need to be removed.";
      } else if (detail.includes("ForeignKeyViolation") || detail.includes("foreign key constraint")) {
        errorMessage = "Cannot delete chatbot: This chatbot has associated data that must be deleted first.";
      } else if (detail.includes("psycopg2.errors")) {
        errorMessage = "Database error: Unable to delete chatbot. Please contact administrator.";
      } else {
        errorMessage = detail;
      }
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error("❌ [DELETE CHATBOT] Throwing error:", errorMessage);
    throw new Error(errorMessage);
  }
}
