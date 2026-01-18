import { api } from "@/services/api";

export interface LLMProvider {
    id: string;
    name: string;
    logo: string;
    defaultBaseUrl?: string;
    requiresModelId: boolean;
    models?: string[];
}

export interface LLMConfig {
    id: string;
    providerId: string;
    providerName: string;
    apiKey: string; // In a real app, this would be masked or not returned fully
    baseUrl?: string;
    modelId?: string;
    isActive: boolean;
    createdAt: string;
}

const MOCK_PROVIDERS: LLMProvider[] = [
    {
        id: "openai",
        name: "OpenAI",
        logo: "/providers/openai.svg", // Placeholder path
        defaultBaseUrl: "https://api.openai.com/v1",
        requiresModelId: true,
        models: ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"]
    },
    {
        id: "anthropic",
        name: "Anthropic",
        logo: "/providers/anthropic.svg",
        defaultBaseUrl: "https://api.anthropic.com",
        requiresModelId: true,
        models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"]
    },
    {
        id: "gemini",
        name: "Google Gemini",
        logo: "/providers/google.svg",
        requiresModelId: true,
        models: ["gemini-1.5-pro", "gemini-1.0-pro"]
    },
    {
        id: "ollama",
        name: "Ollama (Local)",
        logo: "/providers/ollama.svg",
        defaultBaseUrl: "http://localhost:11434",
        requiresModelId: true,
        models: ["llama3", "mistral", "gemma"]
    },
    {
        id: "deepseek",
        name: "DeepSeek",
        logo: "/providers/deepseek.svg",
        defaultBaseUrl: "https://api.deepseek.com",
        requiresModelId: true,
        models: ["deepseek-chat", "deepseek-coder"]
    }
];

// Mock storage
let mockConfigs: LLMConfig[] = [];

export async function getLLMProviders(): Promise<LLMProvider[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PROVIDERS;
}

export async function getLLMConfigs(): Promise<LLMConfig[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockConfigs;
}

export async function saveLLMConfig(config: Omit<LLMConfig, "id" | "createdAt" | "providerName">): Promise<LLMConfig> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const provider = MOCK_PROVIDERS.find(p => p.id === config.providerId);
    const newConfig: LLMConfig = {
        ...config,
        id: `llm-config-${Date.now()}`,
        providerName: provider?.name || config.providerId,
        createdAt: new Date().toISOString()
    };

    // Check if config for this provider already exists, if so update/replace
    const existingIndex = mockConfigs.findIndex(c => c.providerId === config.providerId);
    if (existingIndex >= 0) {
        mockConfigs[existingIndex] = { ...mockConfigs[existingIndex], ...config };
        return mockConfigs[existingIndex];
    } else {
        mockConfigs.push(newConfig);
        return newConfig;
    }
}

export async function deleteLLMConfig(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockConfigs = mockConfigs.filter(c => c.id !== id);
}
