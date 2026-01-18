"use client";

import { useState, useEffect } from "react";
import { generateApiKey, getApiKeys, deleteApiKey, ApiKeyInfo, getOrganizationsForApiKey, OrganizationOption } from "@/services/apiKey";
import { useToastContext } from "./ToastProvider";
import DeleteModal from "./DeleteModal";

interface ApiKeyTableProps {
  isReadOnly?: boolean;
}

export default function ApiKeyTable({ isReadOnly = false }: ApiKeyTableProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyName, setKeyName] = useState<string>("");
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("");
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ApiKeyInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToastContext();

  useEffect(() => {
    fetchAllApiKeys();
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setIsLoadingOrganizations(true);
      console.log("🏢 Fetching organizations for dropdown...");
      const orgs = await getOrganizationsForApiKey();
      setOrganizations(orgs);
      // Auto-select first organization if available
      if (orgs.length > 0) {
        setSelectedOrganizationId(orgs[0].id);
      } else {
        setSelectedOrganizationId("");
      }
      console.log("✅ Organizations loaded:", orgs.length);
    } catch (error: any) {
      console.error("❌ Error loading organizations:", error);
      setOrganizations([]);
      setSelectedOrganizationId("");
      // For regular admin, this might fail, but they should still be able to create API keys
      // The backend will handle organization assignment
    } finally {
      setIsLoadingOrganizations(false);
    }
  };

  const fetchAllApiKeys = async () => {
    try {
      setIsLoading(true);
      console.log("📋 Fetching all API keys from organization...");

      // Fetch API keys for entire organization (no chatbot_id filter)
      const response = await getApiKeys();

      console.log("📊 API Keys received:", {
        total: response.total,
        keysCount: response.keys?.length || 0,
      });

      setApiKeys(response.keys || []);
    } catch (error: any) {
      console.error("❌ Error loading API keys:", error);
      if (error?.response?.status !== 404) {
        showToast("Failed to load API keys", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!keyName.trim()) {
      showToast("Please enter a key name", "error");
      return;
    }

    // Only require organization selection if organizations were loaded and user has multiple options
    if (organizations.length > 1 && !selectedOrganizationId) {
      showToast("Please select an organization", "error");
      return;
    }

    try {
      setIsGenerating(true);
      // Generate API key - only send organization_id if it's selected
      const orgId = selectedOrganizationId || undefined;
      await generateApiKey("", keyName, orgId);
      showToast("API Key generated successfully", "success");

      // Reset form
      setKeyName("");

      // Refresh list
      await fetchAllApiKeys();
    } catch (error: any) {
      console.error("Error generating API key:", error);
      const errorMsg = error?.response?.data?.detail || "Failed to generate API key";
      showToast(errorMsg, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteClick = (apiKey: ApiKeyInfo) => {
    setDeleteTarget(apiKey);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await deleteApiKey(deleteTarget.id);
      showToast("API Key deleted successfully", "success");
      setDeleteTarget(null);
      await fetchAllApiKeys();
    } catch (error: any) {
      console.error("Error deleting API key:", error);
      const errorMsg = error?.response?.data?.detail || "Failed to delete API key";
      showToast(errorMsg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Generate API Key Form */}
      {!isReadOnly && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New API Key</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Name
              </label>
              <input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g., production-key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Only show organization dropdown if multiple organizations are available (superadmin) */}
            {organizations.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization
                </label>
                <select
                  value={selectedOrganizationId}
                  onChange={(e) => setSelectedOrganizationId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoadingOrganizations}
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} {org.is_active ? "" : "(Inactive)"}
                    </option>
                  ))}
                </select>
                {isLoadingOrganizations && (
                  <p className="text-sm text-gray-500 mt-1">Loading organizations...</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={handleGenerateApiKey}
              disabled={isGenerating || !keyName.trim() || (organizations.length > 1 && !selectedOrganizationId)}
              className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? "Generating..." : "Generate API Key"}
            </button>
          </div>
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-white border-0">
        <div className="px-0 py-4 border-b border-gray-200 hidden">

          <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading API keys...</div>
        ) : apiKeys.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No API keys found. Generate one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
                    Key Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
                    API Key
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
                    Expires
                  </th>
                  {!isReadOnly && (
                    <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white">
                {apiKeys.map((apiKey) => (
                  <tr key={apiKey.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {apiKey.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {apiKey.key_prefix}...
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {apiKey.is_active ? (
                        isExpired(apiKey.expires_at) ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Expired
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(apiKey.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {apiKey.expires_at ? formatDate(apiKey.expires_at) : "Never"}
                    </td>
                    {!isReadOnly && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteClick(apiKey)}
                          className="text-red-600 hover:text-red-800 font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        title="Delete API Key"
        message={`Are you sure you want to delete the API key "${deleteTarget?.name}"? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
