"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import PageHeader from "@/app/components/PageHeader";
import { getChatbotById, updateChatbot, Chatbot } from "@/services/chatbot";
import { useToastContext } from "@/app/components/ToastProvider";
import {
    User,
    MessageSquare,
    ShieldCheck,
    BrainCircuit,
    Database,
    Info,
    RotateCcw,
    Send,
    ChevronRight,
    Sparkles,
    Bot,
    Check,
    Globe,
    Code2,
    LayoutDashboard,
    Save,
    UserPlus,
    Trash2,
    Plus,
    Settings2
} from "lucide-react";
import SlideSheet from "@/app/components/SlideSheet";

// Mock Knowledge Base Data
const MOCK_KB = [
    { id: "kb-1", name: "Product Catalog 2024", size: "12.5 MB", updated: "2 days ago", sources: "12 PDF + 1 database member Connection" },
    { id: "kb-2", name: "Company Policy (HR)", size: "4.2 MB", updated: "5 days ago", sources: "5 PDF + 1 Google Drive" },
    { id: "kb-3", name: "Technical Documentation", size: "45.1 MB", updated: "1 day ago", sources: "24 PDF + 2 database Connection" },
    { id: "kb-4", name: "FAQ Database", size: "1.2 MB", updated: "Just now", sources: "100+ FAQ + 1 Member Database" },
    { id: "kb-5", name: "Data Warehouse Connector", size: "Database", updated: "Real-time", sources: "Direct PostgreSQL Connection" },
];

// Mock Organization Users
const MOCK_ORG_USERS = [
    { id: "u-1", name: "Deni Surya", email: "deni@example.com", avatar: "DS" },
    { id: "u-2", name: "Sarah Brown", email: "sarah@example.com", avatar: "SB" },
    { id: "u-3", name: "Mike Johnson", email: "mike@example.com", avatar: "MJ" },
    { id: "u-4", name: "Alicia Keys", email: "alicia@example.com", avatar: "AK" },
];

export default function AgentDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showToast } = useToastContext();
    const [agent, setAgent] = useState<Chatbot | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // States for Agent Settings
    const [personality, setPersonality] = useState("");
    const [guardrails, setGuardrails] = useState("");
    const [selectedKB, setSelectedKB] = useState("kb-1");
    const [toneOfVoice, setToneOfVoice] = useState(2); // 0: Humorous, 1: Casual, 2: Normal, 3: Professional
    const [assignedUsers, setAssignedUsers] = useState<string[]>(["u-1", "u-2"]);

    // States for Chat Preview
    const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
    const [isToneSheetOpen, setIsToneSheetOpen] = useState(false);
    const [isConfigDBOpen, setIsConfigDBOpen] = useState(false);
    const [isDBConnected, setIsDBConnected] = useState(true);
    const [currentTime, setCurrentTime] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, []);

    useEffect(() => {
        if (id) {
            fetchAgent();
        }
    }, [id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchAgent = async () => {
        try {
            setIsLoading(true);
            const data = await getChatbotById(id as string);
            if (data) {
                setAgent(data);
                setPersonality(data.personality || "");
            } else {
                showToast("Agent not found", "error");
                router.push("/admin/chatbot");
            }
        } catch (error) {
            console.error("Error fetching agent:", error);
            showToast("Failed to load agent", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        const newMessages = [...messages, { role: "user" as const, content: inputMessage }];
        setMessages(newMessages);
        setInputMessage("");
        setIsTyping(true);

        const currentTone = ["humorous", "casual", "normal", "professional"][toneOfVoice];

        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: "bot",
                content: `I am ${agent?.name}. I'm responding in a ${currentTone} tone using the knowledge from "${MOCK_KB.find(k => k.id === selectedKB)?.name}". How else can I assist you?`
            }]);
            setIsTyping(false);
        }, 1500);
    };

    const resetChat = () => {
        setMessages([]);
        showToast("Chat has been reset", "success");
    };

    const handleUpdateConfig = async () => {
        if (!agent) return;

        try {
            setIsLoading(true);
            await updateChatbot(agent.id, {
                name: agent.name,
                description: agent.description,
                personality: personality,
            });
            showToast("Configuration updated successfully", "success");
            await fetchAgent();
        } catch (error) {
            console.error("Error updating agent:", error);
            showToast("Failed to update configuration", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
            `}</style>
            <PageHeader
                title={`Edit Agent: ${agent?.name}`}
                description="Configuration and live preview of your AI assistant"
                breadcrumbItems={[
                    { label: "AI Agents", href: "/admin/chatbot" },
                    { label: agent?.name || "Agent Detail" }
                ]}
            >
                <div className="flex flex-wrap items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:text-primary hover:bg-primary/5 transition-all text-sm font-medium border border-slate-200 hover:border-primary/20 bg-white shadow-sm">
                        <Globe size={16} />
                        Embed
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:text-primary hover:bg-primary/5 transition-all text-sm font-medium border border-slate-200 hover:border-primary/20 bg-white shadow-sm">
                        <Code2 size={16} />
                        Code
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:text-primary hover:bg-primary/5 transition-all text-sm font-medium border border-slate-200 hover:border-primary/20 bg-white shadow-sm">
                        <LayoutDashboard size={16} />
                        Widget
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
                    <button
                        onClick={handleUpdateConfig}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl bg-slate-900 border border-slate-900 text-white font-semibold hover:bg-black hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
                    >
                        <Save size={16} />
                        Update
                    </button>
                </div>
            </PageHeader>

            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[700px] items-start mt-8">

                {/* Left Column - 70% */}
                <div className="lg:w-[70%] space-y-6">

                    {/* Section 1: Agent Description */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden group hover:border-slate-300 transition-all duration-300">
                        <div className="p-1 px-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                            <User size={16} className="text-slate-500" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">Agent Description</span>
                        </div>
                        <div className="p-6 flex items-start gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex flex-col items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300 shadow-inner">
                                    <Bot size={40} className="mb-1" />
                                    <span className="text-[10px] font-bold opacity-60">AGENT</span>
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-lg border border-slate-100 text-slate-500 hover:text-primary hover:scale-110 transition-all">
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Agent Name</label>
                                    <input
                                        type="text"
                                        value={agent?.name || ""}
                                        onChange={(e) => setAgent(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50/50"
                                        placeholder="Enter agent name..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Description</label>
                                    <textarea
                                        rows={2}
                                        value={agent?.description || ""}
                                        onChange={(e) => setAgent(prev => prev ? { ...prev, description: e.target.value } : null)}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50/50"
                                        placeholder="Describe what this agent does..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: AI Personality */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden group hover:border-slate-300 transition-all duration-300">
                        <div className="p-1 px-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                            <BrainCircuit size={16} className="text-slate-500" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">AI Personality</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-slate-500">Define the tone, style, and identity of your AI agent.</p>
                                <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium border border-primary/20 animate-pulse-slow">
                                    <Sparkles size={12} />
                                    Best with detailed prompts
                                </div>
                            </div>
                            <textarea
                                rows={4}
                                value={personality}
                                onChange={(e) => setPersonality(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[120px]"
                                placeholder="Example: You are a professional support agent for Luminara. You are friendly, concise, and always provide accurate information..."
                            />

                            {/* Tone of Voice Radio Cards */}
                            <div className="mt-8 space-y-4 pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Sparkles size={16} className="text-primary" />
                                            Tone of Voice
                                        </label>
                                        <button
                                            onClick={() => setIsToneSheetOpen(true)}
                                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-all group"
                                            title="View Tone Guide"
                                        >
                                            <Info size={16} />
                                        </button>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase tracking-tight italic">
                                        Impacts AI Persona
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                                    {["Humorous", "Casual", "Normal", "Professional"].map((label, i) => (
                                        <label
                                            key={label}
                                            className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${toneOfVoice === i
                                                ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                                                : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="tone-selection"
                                                className="sr-only"
                                                checked={toneOfVoice === i}
                                                onChange={() => setToneOfVoice(i)}
                                            />
                                            <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${toneOfVoice === i ? "text-primary" : "text-slate-500 group-hover:text-slate-700"}`}>
                                                {label}
                                            </span>

                                            {toneOfVoice === i && (
                                                <div className="bg-primary text-white rounded-full p-1 animate-in zoom-in duration-300">
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Guardrails */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden group hover:border-slate-300 transition-all duration-300">
                        <div className="p-1 px-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-slate-500" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">Guardrails</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-slate-500">Specify rules and boundaries for the AI's behavior.</p>
                            </div>
                            <textarea
                                rows={3}
                                value={guardrails}
                                onChange={(e) => setGuardrails(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Example: Do not provide financial advice. Do not discuss competitors. If unsure, tell the user to wait for a human agent."
                            />
                        </div>
                    </div>

                    {/* Section 4: Knowledge Base Selection */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden group hover:border-slate-300 transition-all duration-300">
                        <div className="p-1 px-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                            <Database size={16} className="text-slate-500" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">Select Knowledge Base</span>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-500 mb-6">Choose the data source this agent should use for its responses.</p>
                            <div className="grid grid-cols-1 gap-4">
                                {MOCK_KB.map((kb) => (
                                    <label
                                        key={kb.id}
                                        className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedKB === kb.id
                                            ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="kb-selection"
                                            className="sr-only"
                                            checked={selectedKB === kb.id}
                                            onChange={() => setSelectedKB(kb.id)}
                                        />
                                        <div className={`p-2 rounded-lg mr-4 ${selectedKB === kb.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400 font-bold"}`}>
                                            <Database size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-slate-800">{kb.name}</div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">{kb.sources}</div>
                                            <div className="text-[10px] text-slate-400 opacity-60 mt-1 uppercase tracking-tighter">{kb.size} • Updated {kb.updated}</div>
                                        </div>
                                        {selectedKB === kb.id && (
                                            <div className="bg-primary text-white rounded-full p-1">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>

                            {/* New Connection Sub-Section */}
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <h5 className="text-sm font-bold text-slate-800">New Connection</h5>
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Database Only</span>
                                    </div>
                                    {isDBConnected && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            Connected
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {isDBConnected ? (
                                        <div className="flex items-center p-5 rounded-2xl border border-primary/20 bg-primary/5 group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-110"></div>

                                            <div className="p-3 rounded-xl bg-primary text-white mr-5 shadow-lg shadow-primary/20">
                                                <Globe size={24} />
                                            </div>
                                            <div className="flex-1 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-[14px] font-bold text-slate-800">Production E-commerce DB</div>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-bold uppercase">PostgreSQL</span>
                                                </div>
                                                <div className="text-[12px] text-slate-500 mt-1">db.production-mani.ai • Port 5432</div>
                                            </div>
                                            <div className="flex items-center gap-2 relative z-10">
                                                <button
                                                    onClick={() => setIsConfigDBOpen(true)}
                                                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                                                    title="Edit Connection"
                                                >
                                                    <Settings2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setIsDBConnected(false)}
                                                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                                                    title="Disconnect"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsConfigDBOpen(true)}
                                            className="flex items-center p-5 rounded-xl border border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 transition-all text-left bg-slate-50/10 group"
                                        >
                                            <div className="p-3 rounded-xl bg-orange-50 text-orange-600 mr-5 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Globe size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[14px] font-bold text-slate-700 group-hover:text-primary transition-colors">Setup Database Connector</div>
                                                <div className="text-[12px] text-slate-400 mt-1">Configure PostgreSQL, MySQL, or API endpoints as real-time knowledge sources.</div>
                                            </div>
                                            <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 group-hover:border-primary group-hover:text-primary transition-all">
                                                <Settings2 size={18} />
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button className="px-6 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-all duration-200 border border-slate-200">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateConfig}
                                    className="px-8 py-2.5 rounded-xl bg-slate-900 border border-slate-900 text-white font-semibold hover:bg-black hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Assigned User */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden group hover:border-slate-300 transition-all duration-300">
                        <div className="p-1 px-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                            <UserPlus size={16} className="text-slate-500" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">Assigned User</span>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h5 className="text-sm font-bold text-slate-800">Manage Access</h5>
                                    <p className="text-xs text-slate-500 mt-1">Select team members who can manage and monitor this agent.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {MOCK_ORG_USERS.map((user) => {
                                        const isAssigned = assignedUsers.includes(user.id);
                                        return (
                                            <div
                                                key={user.id}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 group ${isAssigned ? 'border-primary/20 bg-primary/5' : 'border-slate-100 hover:border-slate-200 bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${isAssigned ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                                        }`}>
                                                        {user.avatar}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                                                        <div className="text-[11px] text-slate-400">{user.email}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (isAssigned) {
                                                            setAssignedUsers(prev => prev.filter(id => id !== user.id));
                                                        } else {
                                                            setAssignedUsers(prev => [...prev, user.id]);
                                                        }
                                                    }}
                                                    className={`p-2 rounded-lg transition-all ${isAssigned
                                                        ? 'text-red-400 hover:text-red-500 hover:bg-red-50'
                                                        : 'text-slate-400 hover:text-primary hover:bg-primary/5'
                                                        }`}
                                                >
                                                    {isAssigned ? <Trash2 size={16} /> : <UserPlus size={16} />}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - 30% */}
                <div className="lg:w-[30%] flex flex-col h-fit sticky top-2 lg:h-[calc(100vh-140px)] rounded-2xl border border-slate-200 bg-white overflow-hidden relative border-t-4 border-t-primary">

                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">{agent?.name}</h4>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-[10px] font-medium text-slate-500">Live Preview</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={resetChat}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                            title="Reset Chat"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 no-scrollbar"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-60">
                                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center border border-slate-100">
                                    <MessageSquare size={32} className="text-primary/40" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-slate-700">Start a Conversation</h5>
                                    <p className="text-xs text-slate-500 mt-2">Test your agent's personality and knowledge base here.</p>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 px-4 shadow-sm relative group ${msg.role === "user"
                                        ? "bg-slate-900 text-white rounded-tr-none"
                                        : "bg-white border border-slate-100 text-slate-700 rounded-tl-none ring-1 ring-slate-200/50"
                                        }`}>
                                        {msg.role === "bot" && (
                                            <button
                                                onClick={() => setIsInfoSheetOpen(true)}
                                                className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                                title="View Token Info"
                                            >
                                                <Info size={16} />
                                            </button>
                                        )}
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        <div className={`text-[9px] mt-1.5 font-medium opacity-50 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                                            {currentTime}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3 px-6 shadow-sm ring-1 ring-slate-200/50">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white border-t border-slate-100 pb-6 rounded-b-2xl">
                        <div className="relative group">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                placeholder="Type a message..."
                                className="w-full pl-5 pr-14 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary transition-all duration-300 text-sm shadow-inner"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim()}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all duration-300 ${inputMessage.trim()
                                    ? "bg-primary text-white hover:scale-105 active:scale-95"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    }`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-1.5 opacity-40">
                            <Bot size={12} />
                            <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Amani AI Preview Mode</p>
                        </div>
                    </div>

                </div>

            </div>

            {/* Info Sidesheet */}
            <SlideSheet
                isOpen={isInfoSheetOpen}
                onClose={() => setIsInfoSheetOpen(false)}
                title="Session Information"
                width="400px"
            >
                <div className="p-6 space-y-8">

                    <div className="space-y-4">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} className="text-primary" />
                            Token Consumption
                        </h5>
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                <Bot size={80} />
                            </div>
                            <div className="relative z-10 flex flex-col gap-1">
                                <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">Total Usage This Session</span>
                                <span className="text-3xl font-black">1.2k <span className="text-sm font-normal opacity-50">tokens</span></span>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[35%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-60">35% of Limit</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Input</div>
                                <div className="text-lg font-bold text-slate-700">842</div>
                            </div>
                            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Output</div>
                                <div className="text-lg font-bold text-slate-700">358</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Database size={14} className="text-primary" />
                            Active Knowledge Base
                        </h5>
                        <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-4">
                            <div className="p-3 bg-primary text-white rounded-xl">
                                <Database size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{MOCK_KB.find(k => k.id === selectedKB)?.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{MOCK_KB.find(k => k.id === selectedKB)?.size} of indexed data</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 px-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    <span className="text-xs font-medium text-slate-600">Model Used</span>
                                </div>
                                <span className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors">Claude 3.5 Sonnet</span>
                            </div>
                            <div className="flex items-center justify-between p-3 px-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    <span className="text-xs font-medium text-slate-600">Context Window</span>
                                </div>
                                <span className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors">200k tokens</span>
                            </div>
                        </div>
                    </div>

                </div>
            </SlideSheet>

            {/* Tone of Voice Samples Sidesheet */}
            <SlideSheet
                isOpen={isToneSheetOpen}
                onClose={() => setIsToneSheetOpen(false)}
                title="Tone of Voice Guide"
                width="450px"
            >
                <div className="p-6 space-y-8">
                    <div className="space-y-2">
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Adjusting the tone of voice changes how the AI interacts with your users. Higher levels increase formality, while lower levels allow for more personality.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                title: "Humorous",
                                desc: "Playful, witty, and uses emojis/jokes. Best for brand personification.",
                                sample: "Oh! You caught me there! 😅 I'm totally ready to help, but first, did you hear the one about the AI who walked into a bar? Just kidding! How can I make your day brighter?"
                            },
                            {
                                title: "Casual",
                                desc: "Friendly, relaxed, and approachable. Feels like talking to a helpful friend.",
                                sample: "Hey there! 👋 Happy to help you out with that. Let's see what we can find in the database. What's on your mind?"
                            },
                            {
                                title: "Normal",
                                desc: "Balanced, polite, and direct. Suitable for most business applications.",
                                sample: "Hello. I am ready to assist you. What specific information or task can I help you with today?"
                            },
                            {
                                title: "Professional",
                                desc: "Formal, authoritative, and sophisticated. Best for legal, medical, or corporate use.",
                                sample: "Greetings. I am at your service to provide comprehensive assistance and detailed information regarding our systems and policies. How may I facilitate your request?"
                            }
                        ].map((tone, i) => (
                            <div
                                key={tone.title}
                                className={`p-5 rounded-2xl border transition-all duration-300 ${toneOfVoice === i
                                    ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                                    : "border-slate-100 hover:border-slate-200 bg-white"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${toneOfVoice === i ? 'bg-primary' : 'bg-slate-300'}`}></div>
                                        <h6 className={`text-sm font-bold ${toneOfVoice === i ? 'text-primary' : 'text-slate-800'}`}>{tone.title}</h6>
                                    </div>
                                    {toneOfVoice === i && (
                                        <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Selected</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{tone.desc}</p>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 italic text-[11px] text-slate-600 leading-relaxed relative">
                                    {tone.sample}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <button
                            onClick={() => setIsToneSheetOpen(false)}
                            className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-black transition-all"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </SlideSheet>

            {/* Database Configuration Sidesheet */}
            <SlideSheet
                isOpen={isConfigDBOpen}
                onClose={() => setIsConfigDBOpen(false)}
                title="Configure Database Connection"
                width="600px"
            >
                <div className="p-8 space-y-8">
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">Connection Details</h4>
                        <p className="text-sm text-slate-500 mt-1">Provide credentials for your database to allow Amani AI to sync data in real-time.</p>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Database Type</label>
                                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium">
                                    <option>PostgreSQL</option>
                                    <option>MySQL</option>
                                    <option>MongoDB</option>
                                    <option>Microsoft SQL Server</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Connection Name</label>
                                <input type="text" placeholder="e.g., Production E-commerce" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Host / IP Address</label>
                                <input type="text" placeholder="db.example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Port</label>
                                <input type="text" placeholder="5432" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
                                <input type="text" placeholder="admin" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Database Name</label>
                            <input type="text" placeholder="main_production" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm" />
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={20} className="text-green-600" />
                            <div>
                                <div className="text-xs font-bold text-slate-800">Secure SSL Connection</div>
                                <div className="text-[10px] text-slate-500">Your credentials are encrypted at rest.</div>
                            </div>
                        </div>
                        <button className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                            Test Connection
                        </button>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex gap-3">
                        <button
                            onClick={() => setIsConfigDBOpen(false)}
                            className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-2 px-12 py-3 rounded-xl bg-slate-900 border border-slate-900 text-white text-sm font-bold hover:bg-black hover:-translate-y-0.5 transition-all shadow-sm"
                        >
                            Save Connection
                        </button>
                    </div>
                </div>
            </SlideSheet>
        </div>
    );
}
