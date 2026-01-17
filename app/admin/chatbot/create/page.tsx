"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import PageHeader from "@/app/components/PageHeader";
import { createChatbot } from "@/services/chatbot";
import { useToastContext } from "@/app/components/ToastProvider";
import {
    User,
    MessageSquare,
    ShieldCheck,
    BrainCircuit,
    Sparkles,
    Bot,
    Check,
    Info,
    RotateCcw,
    Send,
    Plus,
    Save
} from "lucide-react";
import SlideSheet from "@/app/components/SlideSheet";

export default function CreateAgentPage() {
    const router = useRouter();
    const { showToast } = useToastContext();
    const [isCreating, setIsCreating] = useState(false);

    // Form States
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [personality, setPersonality] = useState("");
    const [guardrails, setGuardrails] = useState("");
    const [toneOfVoice, setToneOfVoice] = useState(2); // 0: Humorous, 1: Casual, 2: Normal, 3: Professional

    // Chat Preview States
    const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isToneSheetOpen, setIsToneSheetOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
                content: `I am ${name || "your new agent"}. I'm responding in a ${currentTone} tone. Once you create me, I'll be able to connect to your data!`
            }]);
            setIsTyping(false);
        }, 1500);
    };

    const resetChat = () => {
        setMessages([]);
        showToast("Chat has been reset", "success");
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            showToast("Please enter an agent name", "error");
            return;
        }

        try {
            setIsCreating(true);
            const newAgent = await createChatbot({
                name,
                description,
                personality: personality || "Helpful assistant", // Provide default if empty
                model: "gpt-4-turbo" // Default model
            });

            showToast("Agent created successfully!", "success");
            // Redirect to the edit page of the new agent
            router.push(`/admin/chatbot/${newAgent.id}`);
        } catch (error) {
            console.error("Error creating agent:", error);
            showToast("Failed to create agent", "error");
        } finally {
            setIsCreating(false);
        }
    };

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
                title="Create New Agent"
                description="Configure the personality and basics of your new AI assistant"
                breadcrumbItems={[
                    { label: "AI Agents", href: "/admin/chatbot" },
                    { label: "Create New" }
                ]}
            >
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push("/admin/chatbot")}
                        className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-sm font-medium border border-transparent hover:border-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isCreating || !name.trim()}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-black hover:-translate-y-0.5 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Plus size={18} />
                        )}
                        Create Agent
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
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">Agent Details</span>
                        </div>
                        <div className="p-6 flex items-start gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex flex-col items-center justify-center text-indigo-600 shadow-inner">
                                    <Bot size={40} className="mb-1" />
                                    <span className="text-[10px] font-bold opacity-60">NEW</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Agent Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-slate-50/50"
                                        placeholder="e.g. Customer Support Bot"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Description</label>
                                    <textarea
                                        rows={2}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-slate-50/50"
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
                                <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-medium border border-indigo-100">
                                    <Sparkles size={12} />
                                    Define personality
                                </div>
                            </div>
                            <textarea
                                rows={4}
                                value={personality}
                                onChange={(e) => setPersonality(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all min-h-[120px]"
                                placeholder="Example: You are a professional support agent. You are friendly, concise, and always provide accurate information..."
                            />

                            {/* Tone of Voice Radio Cards */}
                            <div className="mt-8 space-y-4 pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Sparkles size={16} className="text-indigo-600" />
                                            Tone of Voice
                                        </label>
                                        <button
                                            onClick={() => setIsToneSheetOpen(true)}
                                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-all group"
                                            title="View Tone Guide"
                                        >
                                            <Info size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                                    {["Humorous", "Casual", "Normal", "Professional"].map((label, i) => (
                                        <label
                                            key={label}
                                            className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${toneOfVoice === i
                                                ? "border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50"
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
                                            <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${toneOfVoice === i ? "text-indigo-600" : "text-slate-500 group-hover:text-slate-700"}`}>
                                                {label}
                                            </span>

                                            {toneOfVoice === i && (
                                                <div className="bg-indigo-600 text-white rounded-full p-1 animate-in zoom-in duration-300">
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
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                                placeholder="Example: Do not provide financial advice. Do not discuss competitors..."
                            />
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                        <Info className="flex-shrink-0 text-blue-600 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-sm font-bold text-blue-900">Configure Data Later</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                Knowledge base, Database connections, and Assigned Users can be configured after the agent is created.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Right Column - 30% (Preview) */}
                <div className="lg:w-[30%] flex flex-col h-fit sticky top-2 lg:h-[calc(100vh-140px)] rounded-2xl border border-slate-200 bg-white overflow-hidden relative border-t-4 border-t-indigo-600">

                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">{name || "New Agent"}</h4>
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
                                    <MessageSquare size={32} className="text-indigo-200" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-slate-700">Preview Conversation</h5>
                                    <p className="text-xs text-slate-500 mt-2">Test your agent's personality here.</p>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 px-4 shadow-sm relative group ${msg.role === "user"
                                        ? "bg-slate-900 text-white rounded-tr-none"
                                        : "bg-white border border-slate-100 text-slate-700 rounded-tl-none ring-1 ring-slate-200/50"
                                        }`}>
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
                                className="w-full pl-5 pr-14 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-600 transition-all duration-300 text-sm shadow-inner"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim()}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all duration-300 ${inputMessage.trim()
                                    ? "bg-slate-900 text-white hover:scale-105 active:scale-95"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    }`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>

                </div>

            </div>

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
                                sample: "Oh! You caught me there! 😅 I'm totally ready to help, but first, did you hear the one about the AI who walked into a bar?"
                            },
                            {
                                title: "Casual",
                                desc: "Friendly, relaxed, and approachable. Feels like talking to a helpful friend.",
                                sample: "Hey there! 👋 Happy to help you out with that. What's on your mind?"
                            },
                            {
                                title: "Normal",
                                desc: "Balanced, polite, and direct. Suitable for most business applications.",
                                sample: "Hello. I am ready to assist you. What specific information or task can I help you with today?"
                            },
                            {
                                title: "Professional",
                                desc: "Formal, authoritative, and sophisticated. Best for legal, medical, or corporate use.",
                                sample: "Greetings. I am at your service to provide comprehensive assistance and detailed information regarding our systems."
                            }
                        ].map((tone, i) => (
                            <div
                                key={tone.title}
                                className={`p-5 rounded-2xl border transition-all duration-300 ${toneOfVoice === i
                                    ? "border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50"
                                    : "border-slate-100 hover:border-slate-200 bg-white"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${toneOfVoice === i ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                                        <h6 className={`text-sm font-bold ${toneOfVoice === i ? 'text-indigo-600' : 'text-slate-800'}`}>{tone.title}</h6>
                                    </div>
                                    {toneOfVoice === i && (
                                        <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Selected</span>
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
        </div>
    );
}
