"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Chatbot, CreateChatbotPayload } from "@/services/chatbot";
import { Organization, getOrganizations } from "@/services/organization";
import { User, getUsersByOrganization } from "@/services/user";
import IngestionSection from "./IngestionSection";
import UserAccessSection from "./UserAccessSection";
import { useToastContext } from "./ToastProvider";
import { generateApiKey, ApiKeyResponse } from "@/services/apiKey";
import { FEATURES } from "@/config/features";
import { getLoggedInUser, isSuperAdmin, getAccessToken, decodeToken } from "@/services/tokenUtils";
import { getMySubscriptionState, getOrganizationSubscriptionState, SubscriptionState } from "@/services/subscription";

interface CreateChatbotFormProps {
  createdChatbot?: Chatbot | null;
  isLoading: boolean;
  onSubmit: (data: CreateChatbotPayload) => Promise<void>;
  onClose: () => void;
}

export default function CreateChatbotForm({
  createdChatbot,
  isLoading,
  onSubmit,
  onClose,
}: CreateChatbotFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateChatbotPayload>({
    name: "",
    description: "",
    personality: "",
    organization_id: "",
    model: ""
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationAdmins, setOrganizationAdmins] = useState<User[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generatingApiKey, setGeneratingApiKey] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<ApiKeyResponse | null>(null);
  const [userAccessKey, setUserAccessKey] = useState(0); // Add key for forcing UserAccessSection refresh
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [isOrgFieldDisabled, setIsOrgFieldDisabled] = useState(false);
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const { showToast } = useToastContext();

  const requiredPlanByModel: Record<string, string | undefined> = {
    "llama3.2-3b": "pintar",
    mistral: "jenius",
    "gpt-4o-mini": "superior",
  };

  const [allowedModels, setAllowedModels] = useState<string[]>([]);

  // Update allowedModels when subscriptionState changes
  useEffect(() => {
    const newAllowedModels = subscriptionState?.effective_allowed_models || [];
    setAllowedModels(newAllowedModels);
    console.log("🔄 Subscription state updated:", subscriptionState);
    console.log("🔓 Updated allowed models:", newAllowedModels);
  }, [subscriptionState]);

  useEffect(() => {
    setError("");
    
    // Auto-set organization_id from logged in user (only if NOT super admin)
    const loggedInUser = getLoggedInUser();
    const isSuper = isSuperAdmin();
    
    console.log("👤 Create form - User info:", {
      email: loggedInUser?.email,
      role: loggedInUser?.role,
      organization_id: loggedInUser?.organization_id,
      isSuperAdmin: isSuper
    });
    
    if (loggedInUser?.organization_id && !isSuper) {
      setFormData(prev => ({
        ...prev,
        organization_id: loggedInUser.organization_id || ""
      }));
      // Disable org field if user has organization_id AND is NOT super admin
      setIsOrgFieldDisabled(true);
      // Don't fetch organizations if field is disabled
      console.log("🔒 Admin user has organization_id, skipping organization list fetch");
    } else {
      // Super admin OR user without organization_id
      setIsOrgFieldDisabled(false);
      fetchOrganizations();
    }
    
    fetchCurrentUserRole();
  }, []);

  // Fetch subscription state when organization changes
  useEffect(() => {
    console.log("🔄 Organization changed:", formData.organization_id);
    if (formData.organization_id) {
      fetchSubscriptionState(formData.organization_id);
    } else {
      setSubscriptionState(null);
    }
  }, [formData.organization_id]);

  const fetchCurrentUserRole = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        const decoded = decodeToken(token);
        setCurrentUserRole(decoded?.role || "");
        console.log("🔐 Create Chatbot - Current user role:", decoded?.role);
      }
    } catch (error) {
      console.error("Error fetching current user role:", error);
    }
  };

  const fetchOrganizationAdmins = async (organizationId: string) => {
    if (!organizationId) {
      setOrganizationAdmins([]);
      return;
    }
    
    try {
      setLoadingAdmins(true);
      console.log("👥 Fetching users for organization:", organizationId);
      const users = await getUsersByOrganization(organizationId);
      
      // Filter hanya admin dari organization tersebut
      const admins = users.filter(user => user.role === 'admin');
      console.log("👔 Found admins:", admins.length, admins.map(a => ({ 
        id: a.id, 
        name: a.name, 
        email: a.email,
        // Log all keys to see what fields are available
        allKeys: Object.keys(a)
      })));
      
      // Validate that all admins have an ID
      const adminsWithoutId = admins.filter(a => !a.id);
      if (adminsWithoutId.length > 0) {
        console.error("❌ Some admins are missing ID field:", adminsWithoutId);
        showToast("Warning: Some admins don't have valid IDs", "warning");
      }
      
      setOrganizationAdmins(admins);
    } catch (err) {
      console.error("Error fetching organization admins:", err);
      setOrganizationAdmins([]);
      showToast("Failed to load organization admins", "error");
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Fetch admins when organization changes
  useEffect(() => {
    if (formData.organization_id) {
      fetchOrganizationAdmins(formData.organization_id);
    } else {
      setOrganizationAdmins([]);
    }
  }, [formData.organization_id]);

  const fetchSubscriptionState = async (organizationId: string) => {
    console.log("📡 Fetching subscription for org:", organizationId);
    if (!organizationId) {
      setSubscriptionState(null);
      return;
    }

    try {
      setLoadingSubscription(true);
      // For super admin, use organization-specific endpoint
      // For regular admin, use /me endpoint (which uses their organization)
      const isSuper = isSuperAdmin();
      console.log("👤 Is super admin:", isSuper);
      const state = isSuper 
        ? await getOrganizationSubscriptionState(organizationId)
        : await getMySubscriptionState();
      setSubscriptionState(state);
      console.log("📊 Create Chatbot - Subscription state received:", state);
      console.log("🔓 Allowed models:", state?.effective_allowed_models || []);
    } catch (error) {
      console.error("❌ Error fetching subscription state:", error);
      setSubscriptionState(null);
    } finally {
      setLoadingSubscription(false);
    }
  };

  useEffect(() => {
    // Auto-generate API key when chatbot is created (for any role)
    // Since only users who can create chatbot can access this form,
    // they should be able to generate API key automatically
    if (FEATURES.API_KEYS && createdChatbot && !generatedApiKey && !generatingApiKey) {
      console.log("🔑 Auto-generating API key for chatbot:", createdChatbot.name, "ID:", createdChatbot.id);
      handleGenerateApiKey(createdChatbot.id, createdChatbot.name);
    }
    // Force refresh UserAccessSection when createdChatbot changes
    if (createdChatbot) {
      setUserAccessKey(prev => prev + 1);
    }
  }, [createdChatbot]);

  const handleGenerateApiKey = async (chatbotId: string, chatbotName: string) => {
    try {
      setGeneratingApiKey(true);
      console.log("🔑 Starting API key generation for chatbot:", chatbotName, "ID:", chatbotId);
      const apiKeyData = await generateApiKey(chatbotId, `${chatbotName}-key`); // Default: 1 year expiry
      setGeneratedApiKey(apiKeyData);
      showToast("API Key generated successfully!", "success");
      console.log("✅ API key generation completed");
    } catch (err: any) {
      console.error("❌ API key generation failed:", {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        detail: err?.response?.data?.detail,
        data: err?.response?.data,
        message: err?.message,
      });
      
      // Check if it's a 404 or 400 error (endpoint not implemented)
      if (err?.response?.status === 404 || err?.response?.status === 400) {
        console.log("⚠️ API Key endpoint not available yet - skipping");
        showToast("API Key feature not available yet", "warning");
      } else if (err?.response?.status === 500) {
        // Backend error - show detailed message
        const errorMsg = err?.response?.data?.detail || "Backend error while generating API key";
        console.error("🔥 Backend error 500:", errorMsg);
        showToast(`Failed to generate API key: ${errorMsg}`, "error");
      } else if (err?.response?.status === 422) {
        // Validation error
        const errorMsg = err?.response?.data?.detail?.[0]?.msg || "Validation error";
        showToast(`Validation error: ${errorMsg}`, "error");
      } else {
        // Other errors
        const errorMsg = err?.response?.data?.detail || err?.message || "Failed to generate API key";
        showToast(errorMsg, "error");
      }
    } finally {
      setGeneratingApiKey(false);
    }
  }
  
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
    if (!formData.model){
      setError("chatbot type is required");
      return;
    }

    try {
      setSubmitting(true);
      
      // Re-fetch fresh admin data before creating chatbot to avoid stale data
      console.log("🔄 Re-fetching organization admins before chatbot creation...");
      await fetchOrganizationAdmins(formData.organization_id);
      
      await onSubmit(formData);
      // After successful creation, form will stay open
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to save chatbot");
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold font-inter text-gray-900 mb-6">
        Create New Chatbot
      </h2>

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
          {loadingAdmins && (
            <p className="text-xs text-blue-600 mt-1 font-inter">
              ⏳ Loading organization admins...
            </p>
          )}
          {!loadingAdmins && organizationAdmins.length > 0 && (
            <p className="text-xs text-green-600 mt-1 font-inter">
              ✅ Found {organizationAdmins.length} admin(s) who will be auto-assigned to this chatbot
            </p>
          )}
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
                showToast("Organisasi ini tidak memiliki akses ke tipe chatbot tersebut. Silakan upgrade subscription terlebih dahulu.", "warning");
                router.push(`/admin/subscription${requiredPlan ? `?plan=${requiredPlan}` : ""}`);
                return;
              }

              setFormData((prev) => ({ ...prev, model: nextModel }));
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            disabled={submitting || loadingOrgs || loadingSubscription}
          >
            <option value="">Select chatbot</option>
            <option value="llama3.2-3b" disabled={!!formData.organization_id && !allowedModels.includes("llama3.2-3b")}>
              Chatbot Pintar{formData.organization_id && !allowedModels.includes("llama3.2-3b") ? " (Locked)" : ""}
            </option>
            <option value="mistral" disabled={!!formData.organization_id && !allowedModels.includes("mistral")}>
              Chatbot Jenius{formData.organization_id && !allowedModels.includes("mistral") ? " (Locked)" : ""}
            </option>
            <option value="gpt-4o-mini" disabled={!!formData.organization_id && !allowedModels.includes("gpt-4o-mini")}>
              Chatbot Superior{formData.organization_id && !allowedModels.includes("gpt-4o-mini") ? " (Locked)" : ""}
            </option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-inter text-red-600">{error}</p>
          </div>
        )}

        {/* Ingestion Section - Show when chatbot is being created or after creation */}
        {createdChatbot && (
          <IngestionSection chatbotId={createdChatbot.id} />
        )}

        {/* User Access Section - Show when chatbot is being created or after creation */}
        {createdChatbot && (
          <UserAccessSection 
            key={`user-access-create-${createdChatbot.id}-${userAccessKey}`}
            chatbotId={createdChatbot.id} 
            chatbotName={formData.name}
            organizationId={formData.organization_id}
            autoAssignAdmins={organizationAdmins}
          />
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-900 font-inter font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-inter font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {createdChatbot ? "Done" : "Create Chatbot"}
          </button>
        </div>
      </form>
    </div>
  );
}
