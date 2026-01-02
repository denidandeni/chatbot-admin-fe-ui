"use client";

import { useState, useEffect } from "react";
import { Chatbot, CreateChatbotPayload } from "@/services/chatbot";
import { Organization, getOrganizations } from "@/services/organization";
import IngestionSection from "./IngestionSection";
import UserAccessSection from "./UserAccessSection";
import { useToastContext } from "./ToastProvider";
import { generateApiKey, getApiKeys, deleteApiKey, ApiKeyInfo } from "@/services/apiKey";
import { FEATURES } from "@/config/features";
import { getLoggedInUser, isSuperAdmin } from "@/services/tokenUtils";
import { useRouter } from "next/navigation";
import { getMySubscriptionState, getOrganizationSubscriptionState, SubscriptionState } from "@/services/subscription";

interface ChatbotFormProps {
  chatbot: Chatbot;
  isLoading: boolean;
  onSubmit: (data: CreateChatbotPayload) => Promise<void>;
  onClose: () => void;
}

export default function ChatbotForm({
  chatbot,
  isLoading,
  onSubmit,
  onClose,
}: ChatbotFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateChatbotPayload>({
    name: "",
    description: "",
    personality: "",
    organization_id: "",
    model: "",
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [loadingApiKeys, setLoadingApiKeys] = useState(false);
  const [generatingApiKey, setGeneratingApiKey] = useState(false);
  const [userAccessKey, setUserAccessKey] = useState(0); // Add key for forcing UserAccessSection refresh
  const [isOrgFieldDisabled, setIsOrgFieldDisabled] = useState(false);
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const { showToast } = useToastContext();

  const requiredPlanByModel: Record<string, string | undefined> = {
    "llama3.2-3b": "pintar",
    mistral: "jenius",
    "gpt-4o-mini": "superior",
  };

  const allowedModels = subscriptionState?.effective_allowed_models || [];

  useEffect(() => {
    console.log("=== ChatbotForm useEffect START ===");
    // Get logged in user's organization_id and check if super admin
    const loggedInUser = getLoggedInUser();
    const userOrgId = loggedInUser?.organization_id;
    const isSuper = isSuperAdmin();
    
    console.log("👤 Logged in user info:", {
      email: loggedInUser?.email,
      role: loggedInUser?.role,
      organization_id: userOrgId,
      isSuperAdmin: isSuper
    });
    
    // Disable org field if user has organization_id AND is NOT super admin
    // Super admin should always be able to select organization
    if (userOrgId && !isSuper) {
      setIsOrgFieldDisabled(true);
    } else {
      setIsOrgFieldDisabled(false);
    }
    
    if (chatbot) {
      console.log("📦 Chatbot data received:", {
        id: chatbot.id,
        name: chatbot.name,
        organization_id: chatbot.organization_id,
        hasOrgId: !!chatbot.organization_id
      });
      
      // For super admin: use chatbot's org_id
      // For admin: use chatbot's org_id, or fallback to user's org_id
      const finalOrgId = isSuper 
        ? (chatbot.organization_id || "")
        : (chatbot.organization_id || userOrgId || "");
      
      console.log("🎯 Organization ID resolution:", {
        chatbotOrgId: chatbot.organization_id,
        userOrgId: userOrgId,
        finalOrgId: finalOrgId,
        isSuper: isSuper,
        source: chatbot.organization_id ? "chatbot" : (userOrgId ? "user" : "none")
      });
      
      setFormData({
        name: chatbot.name,
        description: chatbot.description,
        personality: chatbot.personality || "",
        organization_id: finalOrgId,
        model: chatbot.model || "",
      });
      
      console.log("✅ FormData set with organization_id:", finalOrgId);
      
      // Load API keys for the chatbot (only if feature is enabled)
      if (FEATURES.API_KEYS) {
        fetchApiKeys();
      }
      // Force refresh UserAccessSection when chatbot changes
      setUserAccessKey(prev => prev + 1);
    } else if (userOrgId && !isSuper) {
      // For new chatbot, auto-set organization_id from logged in user (only if NOT super admin)
      console.log("🆕 New chatbot - setting user's organization_id:", userOrgId);
      setFormData(prev => ({
        ...prev,
        organization_id: userOrgId
      }));
    }
    setError("");
    
    // Fetch organizations if super admin OR if user doesn't have organization_id
    if (isSuper || !userOrgId) {
      fetchOrganizations();
    } else {
      console.log("🔒 Admin user with organization_id, skipping organization list fetch");
    }
    console.log("=== ChatbotForm useEffect END ===");
  }, [chatbot]);

  const fetchSubscriptionState = async (organizationId: string | undefined) => {
    console.log("📡 Fetching subscription for org:", organizationId);
    if (!organizationId) {
      setSubscriptionState(null);
      return;
    }

    try {
      setLoadingSubscription(true);
      const isSuper = isSuperAdmin();
      const state = isSuper 
        ? await getOrganizationSubscriptionState(organizationId)
        : await getMySubscriptionState();
      setSubscriptionState(state);
    } catch (error) {
      console.error("❌ Error fetching subscription state:", error);
      setSubscriptionState(null);
    } finally {
      setLoadingSubscription(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionState(formData.organization_id);
  }, [formData.organization_id]);

  const fetchApiKeys = async () => {
    if (!chatbot?.id) return;
    try {
      setLoadingApiKeys(true);
      const data = await getApiKeys(chatbot.id);
      setApiKeys(data.keys || []);
    } catch (err) {
      console.error("Error fetching API keys:", err);
    } finally {
      setLoadingApiKeys(false);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!chatbot?.id || !chatbot?.name) return;
    try {
      setGeneratingApiKey(true);
      console.log("🔑 Starting API key generation...");
      console.log("📝 Chatbot name:", chatbot.name);
      console.log("📝 Chatbot ID:", chatbot.id);
      
      await generateApiKey(chatbot.id, `${chatbot.name}-key`); // Default: 1 year expiry
      
      console.log("✅ API key generated, refreshing list...");
      showToast("API Key generated successfully", "success");
      await fetchApiKeys();
    } catch (err: any) {
      console.error("❌ handleGenerateApiKey - Error caught:", {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        detail: err?.response?.data?.detail,
        fullData: err?.response?.data,
        message: err?.message,
      });
      
      // Check if it's a 404 or 400 error (endpoint not implemented)
      if (err?.response?.status === 404 || err?.response?.status === 400) {
        showToast("API Key feature is not available yet", "warning");
      } else if (err?.response?.status === 500) {
        const errorDetail = err?.response?.data?.detail || err?.response?.data?.message || "Backend internal error";
        console.error("🔥 Backend 500 Error Detail:", errorDetail);
        showToast(`Failed to generate API key: ${errorDetail}`, "error");
      } else if (err?.response?.status === 422) {
        // Validation error from FastAPI
        const validationErrors = err?.response?.data?.detail;
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          const firstError = validationErrors[0];
          const errorMsg = `${firstError.loc?.join('.')}: ${firstError.msg}`;
          showToast(`Validation error: ${errorMsg}`, "error");
        } else {
          showToast("Validation error occurred", "error");
        }
      } else {
        const errorMsg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Failed to generate API key";
        showToast(errorMsg, "error");
      }
    } finally {
      setGeneratingApiKey(false);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteApiKey(keyId);
      showToast("API Key deleted successfully", "success");
      await fetchApiKeys();
    } catch (err) {
      console.error("Error deleting API key:", err);
      showToast("Failed to delete API key", "error");
    }
  };

  const fetchOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const data = await getOrganizations();
      setOrganizations(data);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      // Only show error toast if super admin or user without organization_id
      const isSuper = isSuperAdmin();
      const loggedInUser = getLoggedInUser();
      if (isSuper || !loggedInUser?.organization_id) {
        showToast("Failed to load organizations", "error");
      }
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Chatbot name is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }
    if (!formData.personality.trim()) {
      setError("Personality is required");
      return;
    }
    if (!formData.organization_id) {
      setError("Organization is required");
      return;
    }
    if (!formData.model) {
      setError("Chatbot type is required");
      return;
    }

    if (!isSuperAdmin() && formData.model && !allowedModels.includes(formData.model)) {
      const requiredPlan = requiredPlanByModel[formData.model];
      showToast("Tipe chatbot ini membutuhkan upgrade atau subscription aktif", "warning");
      router.push(`/admin/subscription${requiredPlan ? `?plan=${requiredPlan}` : ""}`);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to save chatbot");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
            Chatbot Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter chatbot name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            disabled={submitting}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Enter chatbot description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            disabled={submitting}
          />
        </div>

        {/* Personality */}
        <div>
          <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
            Personality
          </label>
          <textarea
            name="personality"
            placeholder="Describe the chatbot's personality and behavior"
            value={formData.personality}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            disabled={submitting}
          />
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
            Organization <span className="text-red-500">*</span>
          </label>
          <select
            name="organization_id"
            value={formData.organization_id}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                organization_id: e.target.value,
              }))
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={submitting || loadingOrgs || isOrgFieldDisabled}
          >
            <option value="">Select an organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          {isOrgFieldDisabled && (
            <p className="text-xs text-gray-500 mt-1 font-inter">
              Organization is automatically set based on your account
            </p>
          )}
          {!isOrgFieldDisabled && isSuperAdmin() && (
            <p className="text-xs text-blue-600 mt-1 font-inter">
              As super admin, you can select any organization
            </p>
          )}
        </div>

        {/* model */}
        <div>
          <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
            Tipe Chatbot <span className="text-red-500">*</span>
          </label>
          
          {/* Upgrade Banner for Admin Users */}
          {!isSuperAdmin() && formData.organization_id && allowedModels.length > 0 && (
            (() => {
              const lockedModels = Object.keys(requiredPlanByModel).filter(model => !allowedModels.includes(model));
              if (lockedModels.length > 0) {
                return (
                  <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-yellow-800 font-inter">
                          Upgrade untuk Model Premium
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1 font-inter">
                          Ada model chatbot yang lebih canggih tersedia dengan upgrade subscription. 
                          Model yang terkunci: {lockedModels.map(model => {
                            const plan = requiredPlanByModel[model];
                            return `${model} (${plan})`;
                          }).join(", ")}
                        </p>
                        <button
                          type="button"
                          onClick={() => router.push('/subscription')}
                          className="mt-3 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition font-inter"
                        >
                          Lihat Paket Subscription
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()
          )}
          
          {formData.organization_id && (
            <div className="mb-2 p-3 rounded-lg border border-gray-200 bg-gray-50">
              <div className="text-sm font-inter text-gray-800">
                Subscription:{" "}
                {subscriptionState?.is_active ? (
                  <span className="text-green-700 font-semibold">Active</span>
                ) : (
                  <span className="text-red-600 font-semibold">No Active Subscription</span>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Tipe yang tersedia: {allowedModels.length > 0 ? allowedModels.join(", ") : "Tidak ada"}
              </div>
            </div>
          )}
          <select
            name="model"
            value={formData.model}
            onChange={(e) => {
              const nextModel = e.target.value;
              if (!nextModel) {
                setFormData((prev) => ({ ...prev, model: "" }));
                return;
              }

              if (formData.organization_id && !allowedModels.includes(nextModel)) {
                const requiredPlan = requiredPlanByModel[nextModel];
                showToast("Tipe chatbot ini membutuhkan upgrade atau subscription aktif", "warning");
                router.push(`/admin/subscription${requiredPlan ? `?plan=${requiredPlan}` : ""}`);
                return;
              }

              setFormData((prev) => ({ ...prev, model: nextModel }));
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            disabled={submitting || loadingOrgs || loadingSubscription}
          >
            <option value="">Select chatbot</option>
            <option value="llama3.2-3b" disabled={!!(formData.organization_id && !allowedModels.includes("llama3.2-3b"))}>Chatbot Pintar{!!(formData.organization_id && !allowedModels.includes("llama3.2-3b")) ? " (Locked)" : ""}</option>
            <option value="mistral" disabled={!!(formData.organization_id && !allowedModels.includes("mistral"))}>Chatbot Jenius{!!(formData.organization_id && !allowedModels.includes("mistral")) ? " (Locked)" : ""}</option>
            <option value="gpt-4o-mini" disabled={!!(formData.organization_id && !allowedModels.includes("gpt-4o-mini"))}>Chatbot Superior{!!(formData.organization_id && !allowedModels.includes("gpt-4o-mini")) ? " (Locked)" : ""}</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-inter text-red-600">{error}</p>
          </div>
        )}

        {/* API Keys Management Section - Only show if feature is enabled */}
        {FEATURES.API_KEYS && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold font-inter text-gray-900">API Keys</h3>
              <p className="text-sm text-gray-600 mt-1">Manage API keys for this chatbot</p>
            </div>
            <button
              type="button"
              onClick={handleGenerateApiKey}
              disabled={generatingApiKey}
              className="px-4 py-2 bg-green-600 text-white text-sm font-inter font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {generatingApiKey ? "Generating..." : "+ Generate New Key"}
            </button>
          </div>

          {loadingApiKeys ? (
            <div className="text-center py-4 text-gray-500 text-sm">Loading API keys...</div>
          ) : apiKeys.length > 0 ? (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <code className="text-sm bg-white px-3 py-1 rounded border border-gray-300 font-mono">
                        {key.key_prefix}...
                      </code>
                      <span className={`text-xs px-2 py-1 rounded ${key.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <p><strong>Name:</strong> {key.name}</p>
                      <p><strong>Created:</strong> {new Date(key.created_at).toLocaleString()}</p>
                      {key.last_used_at && (
                        <p><strong>Last Used:</strong> {new Date(key.last_used_at).toLocaleString()}</p>
                      )}
                      {key.expires_at && (
                        <p><strong>Expires:</strong> {new Date(key.expires_at).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteApiKey(key.id)}
                    className="ml-4 px-3 py-2 bg-red-50 text-red-600 text-sm font-inter rounded-lg hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <p className="text-gray-500 text-sm">No API keys generated yet</p>
              <p className="text-gray-400 text-xs mt-1">Click "Generate New Key" to create one</p>
            </div>
          )}
        </div>
        )}

        {/* Ingestion Section - Show for edit chatbot */}
        <IngestionSection chatbotId={chatbot.id} />

        {/* User Access Section - Show for edit chatbot */}
        <UserAccessSection 
          key={`user-access-${chatbot.id}-${userAccessKey}`}
          chatbotId={chatbot.id} 
          chatbotName={formData.name}
          organizationId={formData.organization_id}
        />
        
        {(() => {
          console.log('🔍 UserAccessSection Props:', {
            chatbotId: chatbot.id,
            chatbotName: formData.name,
            organizationId: formData.organization_id,
            formData: formData
          });
          return null;
        })()}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-900 font-inter font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-inter font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Update Chatbot"}
          </button>
        </div>
      </form>
    </div>
  );
}
