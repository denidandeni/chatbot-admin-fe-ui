"use client";

import PageHeader from "../../../components/PageHeader";
import { getChatbots, Chatbot } from "@/services/chatbot";
import { FileText, Database, User, Calendar, HardDrive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { format } from "date-fns";

// Theme configuration matching ChatbotCard
const THEME_COLORS = [
    { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', bgSoft: 'bg-blue-50' },
    { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-200', bgSoft: 'bg-purple-50' },
    { bg: 'bg-pink-500', text: 'text-pink-700', border: 'border-pink-200', bgSoft: 'bg-pink-50' },
    { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200', bgSoft: 'bg-orange-50' },
    { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', bgSoft: 'bg-emerald-50' },
    { bg: 'bg-cyan-500', text: 'text-cyan-700', border: 'border-cyan-200', bgSoft: 'bg-cyan-50' },
];

const MOCK_CREATORS = ["John Doe", "Sarah Smith", "Michael Brown", "Emma Wilson", "Admin User"];

// Mock mock stats generator
const getMockKBStats = (id: string) => {
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Status
    const statusRoll = seed % 10;
    let status = 'active';
    if (statusRoll > 7) status = 'draft';
    else if (statusRoll > 5) status = 'inactive';

    return {
        docCount: Math.floor((seed * 7) % 50) + 1,
        tokens: Math.floor((seed * 123) % 100000) + 50000,
        creator: MOCK_CREATORS[seed % MOCK_CREATORS.length],
        status,
        theme: THEME_COLORS[seed % THEME_COLORS.length]
    };
};

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'active':
            return (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30">
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-green-600 dark:bg-green-400"></span>
                    Active
                </div>
            );
        case 'inactive':
            return (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-500 dark:bg-slate-400"></span>
                    Inactive
                </div>
            );
        case 'draft':
            return (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-amber-600 dark:bg-amber-400"></span>
                    Draft
                </div>
            );
        default:
            return null;
    }
};

export default function KnowledgeBasePage() {
    const [chatbots, setChatbots] = useState<Chatbot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const data = await getChatbots();
                setChatbots(data);
            } catch (error) {
                console.error("Failed to fetch chatbots:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAgents();
    }, []);

    return (
        <div>
            <PageHeader
                title="Knowledge Base"
                description="Manage knowledge sources for your AI agents"
                breadcrumbItems={[
                    { label: "Pages" },
                    { label: "AI Agent" },
                    { label: "Knowledge Base" }
                ]}
            />

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    // Loading skeletons
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-card p-5 rounded-xl border h-48 animate-pulse">
                            <div className="h-6 bg-muted w-3/4 rounded mb-4"></div>
                            <div className="h-4 bg-muted w-1/2 rounded mb-8"></div>
                            <div className="mt-auto h-4 bg-muted w-full rounded"></div>
                        </div>
                    ))
                ) : chatbots.length > 0 ? (
                    chatbots.map((agent) => {
                        const stats = getMockKBStats(agent.id);
                        const formattedDate = format(new Date(agent.updated_at), 'MMM d, yyyy');

                        return (
                            <div
                                key={agent.id}
                                onClick={() => router.push(`/admin/ai-agent/knowledge-base/${agent.id}`)}
                                className="group bg-card text-card-foreground rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer overflow-hidden"
                            >
                                {/* Header & Content */}
                                <div className="p-5 flex-1 space-y-2">
                                    {/* Title Row */}
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center flex-wrap">
                                                <h3 className="font-semibold text-lg leading-tight text-foreground" title={agent.name}>
                                                    {agent.name}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            <StatusBadge status={stats.status} />
                                        </div>
                                    </div>

                                    {/* Stats / Consume */}
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <p className="text-xs">Name of AI Agent Consume</p>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="text-xs font-medium whitespace-nowrap">
                                            {stats.docCount} Sources
                                        </span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-3 bg-muted/30 border-t flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <User size={12} />
                                        <span>Created by <span className="font-medium text-foreground/80">{stats.creator}</span></span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <span>Last updated {formattedDate}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                        No agents found.
                    </div>
                )}
            </div>
        </div>
    );
}
