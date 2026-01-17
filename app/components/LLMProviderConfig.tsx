"use client";

import { useState, useEffect } from "react";
import {
    LLMConfig,
    LLMProvider,
    getLLMConfigs,
    getLLMProviders,
    saveLLMConfig,
    deleteLLMConfig
} from "@/services/llmProvider";
import { useToastContext } from "./ToastProvider";
import { Trash, Edit, Check, Plus, Save } from "lucide-react";
import DeleteModal from "./DeleteModal";

export default function LLMProviderConfig() {
    const [providers, setProviders] = useState<LLMProvider[]>([]);
    const [configs, setConfigs] = useState<LLMConfig[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToastContext();

    // Form State
    const [selectedProviderId, setSelectedProviderId] = useState<string>("");
    const [apiKey, setApiKey] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [modelId, setModelId] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    // Delete State
    const [deleteTarget, setDeleteTarget] = useState<LLMConfig | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // When provider changes, populate default base URL if empty
        if (selectedProviderId) {
            const provider = providers.find(p => p.id === selectedProviderId);
            if (provider && !baseUrl && !isEditing) {
                setBaseUrl(provider.defaultBaseUrl || "");
            }
        }
    }, [selectedProviderId, providers]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [providersData, configsData] = await Promise.all([
                getLLMProviders(),
                getLLMConfigs()
            ]);
            setProviders(providersData);
            setConfigs(configsData);

            // Select first provider by default if none selected
            if (!selectedProviderId && providersData.length > 0) {
                setSelectedProviderId(providersData[0].id);
            }
        } catch (error) {
            console.error("Error fetching LLM data:", error);
            showToast("Failed to load LLM configuration", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setApiKey("");
        setBaseUrl("");
        setModelId("");
        setIsEditing(false);
        // Reset to first provider or keep current
        if (providers.length > 0) {
            const provider = providers.find(p => p.id === selectedProviderId);
            if (provider) {
                setBaseUrl(provider.defaultBaseUrl || "");
            }
        }
    };

    const handleSave = async () => {
        if (!selectedProviderId || !apiKey) {
            showToast("Please fill in all required fields", "error");
            return;
        }

        try {
            setIsSaving(true);
            const provider = providers.find(p => p.id === selectedProviderId);

            await saveLLMConfig({
                providerId: selectedProviderId,
                apiKey,
                baseUrl: baseUrl || undefined,
                modelId: modelId || undefined,
                isActive: true
            });

            showToast(`Successfully saved ${provider?.name} configuration`, "success");
            await fetchData();
            resetForm();
        } catch (error) {
            console.error("Error saving config:", error);
            showToast("Failed to save configuration", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (config: LLMConfig) => {
        setIsEditing(true);
        setSelectedProviderId(config.providerId);
        setApiKey(config.apiKey);
        setBaseUrl(config.baseUrl || "");
        setModelId(config.modelId || "");

        // Scroll to form
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            await deleteLLMConfig(deleteTarget.id);
            showToast("Configuration removed", "success");
            setDeleteTarget(null);
            await fetchData();
        } catch (error) {
            console.error("Error deleting config:", error);
            showToast("Failed to delete configuration", "error");
        }
    };

    const selectedProvider = providers.find(p => p.id === selectedProviderId);

    return (
        <div className="space-y-8">
            {/* Configuration Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    {isEditing ? 'Edit LLM Provider' : 'Configure LLM Provider'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Provider</label>
                            <select
                                value={selectedProviderId}
                                onChange={(e) => {
                                    setSelectedProviderId(e.target.value);
                                    if (!isEditing) {
                                        const provider = providers.find(p => p.id === e.target.value);
                                        setBaseUrl(provider?.defaultBaseUrl || "");
                                    }
                                }}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                disabled={isLoading}
                            >
                                {providers.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                API Key <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Base URL <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                placeholder={selectedProvider?.defaultBaseUrl || "https://api..."}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            />
                        </div>

                        {selectedProvider?.requiresModelId && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Default Model ID <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={modelId}
                                        onChange={(e) => setModelId(e.target.value)}
                                        placeholder="e.g. gpt-4"
                                        list="model-suggestions"
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                    />
                                    <datalist id="model-suggestions">
                                        {selectedProvider.models?.map(m => (
                                            <option key={m} value={m} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !apiKey}
                        className="flex-1 w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>Saving...</>
                        ) : (
                            <>
                                <Save size={18} />
                                {isEditing ? 'Update Configuration' : 'Save Configuration'}
                            </>
                        )}
                    </button>

                    {isEditing && (
                        <button
                            onClick={resetForm}
                            className="px-5 py-2.5 bg-white text-slate-700 text-sm font-semibold border border-slate-300 rounded-xl hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Configured Providers List */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 px-1">Active Connections</h3>

                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Loading configurations...</div>
                ) : configs.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
                        <p className="text-slate-500 text-sm">No LLM providers configured yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {configs.map(config => (
                            <div key={config.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        {/* Placeholder for Logo */}
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 font-bold text-lg">
                                            {config.providerName.substring(0, 1)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{config.providerName}</h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className={`w-2 h-2 rounded-full ${config.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                <span className="text-xs text-slate-500">{config.isActive ? 'Active' : 'Inactive'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(config)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(config)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs text-slate-600">
                                    <div className="flex justify-between py-1 border-b border-slate-50">
                                        <span className="text-slate-400">API Key</span>
                                        <span className="font-mono">{config.apiKey.substring(0, 3)}...{config.apiKey.substring(config.apiKey.length - 4)}</span>
                                    </div>
                                    {config.modelId && (
                                        <div className="flex justify-between py-1 border-b border-slate-50">
                                            <span className="text-slate-400">Model</span>
                                            <span className="font-medium">{config.modelId}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-400">Added</span>
                                        <span>{new Date(config.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <DeleteModal
                isOpen={!!deleteTarget}
                title="Remove Configuration"
                message={`Are you sure you want to remove the configuration for ${deleteTarget?.providerName}?`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                isLoading={false}
            />
        </div>
    );
}
