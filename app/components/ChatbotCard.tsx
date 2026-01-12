import { Chatbot } from '@/services/chatbot';
import { format } from 'date-fns';
import { MoreHorizontal, MessageSquare, Database, Calendar, Instagram, Globe, MessageCircle } from 'lucide-react';

interface ChatbotCardProps {
    chatbot: Chatbot;
    onEdit: (chatbot: Chatbot) => void;
    onDelete: (chatbot: Chatbot) => void;
    onClick?: (chatbot: Chatbot) => void;
    isSuperAdmin?: boolean;
}

// Theme configuration with static Tailwind classes to ensure they are generated
const THEME_COLORS = [
    { bg: 'bg-blue-500', gradient: 'bg-gradient-to-r from-blue-500/20 to-blue-500/5' },
    { bg: 'bg-purple-500', gradient: 'bg-gradient-to-r from-purple-500/20 to-purple-500/5' },
    { bg: 'bg-pink-500', gradient: 'bg-gradient-to-r from-pink-500/20 to-pink-500/5' },
    { bg: 'bg-orange-500', gradient: 'bg-gradient-to-r from-orange-500/20 to-orange-500/5' },
    { bg: 'bg-emerald-500', gradient: 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5' },
    { bg: 'bg-cyan-500', gradient: 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/5' },
];

// Mock data generator for display purposes as requested
const getMockStats = (id: string, name: string) => {
    // Deterministic mock based on ID char codes
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Status distribution
    const statusRoll = seed % 10;
    let status = 'active';
    if (statusRoll > 6) status = 'draft';
    else if (statusRoll > 4) status = 'inactive';

    // Connectors distribution
    const connectors = [];
    if (seed % 2 === 0) connectors.push('whatsapp');
    if (seed % 3 === 0) connectors.push('instagram');
    if (connectors.length === 0 || seed % 5 === 0) connectors.push('website');

    // Theme color
    const theme = THEME_COLORS[seed % THEME_COLORS.length];

    return {
        tokens: Math.floor((seed * 123) % 1000000),
        conversations: Math.floor((seed * 45) % 5000),
        status,
        connectors,
        theme
    };
};

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'active':
            return (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30">
                    <span className="w-2 h-2 rounded-full mr-1.5 bg-green-600 dark:bg-green-400"></span>
                    Active
                </div>
            );
        case 'inactive':
            return (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <span className="w-2 h-2 rounded-full mr-1.5 bg-slate-500 dark:bg-slate-400"></span>
                    Inactive
                </div>
            );
        case 'draft':
            return (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                    <span className="w-2 h-2 rounded-full mr-1.5 bg-amber-600 dark:bg-amber-400"></span>
                    Draft
                </div>
            );
        default:
            return null;
    }
};

const ConnectorIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'instagram':
            return <Instagram size={14} className="text-pink-600 dark:text-pink-400" />;
        case 'whatsapp':
            return <MessageCircle size={14} className="text-emerald-600 dark:text-emerald-400" />;
        case 'website':
            return <Globe size={14} className="text-blue-600 dark:text-blue-400" />;
        default:
            return null;
    }
};

export default function ChatbotCard({ chatbot, onEdit, onDelete, onClick, isSuperAdmin }: ChatbotCardProps) {
    const stats = getMockStats(chatbot.id, chatbot.name);
    const formattedDate = format(new Date(chatbot.updated_at), 'MMM d, yyyy');

    const initials = chatbot.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div
            onClick={() => onClick?.(chatbot)}
            className="group/card bg-card text-card-foreground rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full cursor-pointer relative overflow-hidden"
        >
            {/* 1. Header Banner */}
            <div className={`h-24 w-full relative ${stats.theme.gradient}`}>
                {/* Status Badge (Top Right) */}
                <div className="absolute top-3 right-12 z-10">
                    <StatusBadge status={stats.status} />
                </div>

                {/* Menu Button (Top Right) */}
                <div className="absolute top-2 right-2 z-20">
                    <div className="relative group/menu">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            className="p-1.5 rounded-full hover:bg-white/50 text-muted-foreground/80 hover:text-foreground transition-colors backdrop-blur-sm"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full mt-1 w-32 bg-popover text-popover-foreground rounded-md shadow-lg border hidden group-hover/menu:block">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(chatbot);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(chatbot);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 pb-5 pt-0 flex-1 flex flex-col relative">
                {/* 2. Overlapping Avatar */}
                <div className="-mt-8 mb-3 self-start">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm border-[3px] border-card ${stats.theme.bg}`}>
                        {initials}
                    </div>
                </div>

                {/* 3. Title */}
                <h3 className="font-semibold text-lg leading-tight tracking-tight line-clamp-1 mb-1" title={chatbot.name}>
                    {chatbot.name}
                </h3>

                {/* 4. Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 h-[2.5em] leading-snug mb-1">
                    {chatbot.description || "No description provided."}
                </p>

                {/* 5. Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mt-auto pt-3 border-t border-border/50">
                    <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Database size={12} />
                            <span>Consume</span>
                        </div>
                        <p className="text-sm font-medium">{stats.tokens.toLocaleString()} T</p>
                    </div>
                    <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <MessageSquare size={12} />
                            <span>Conversation</span>
                        </div>
                        <p className="text-sm font-medium">{stats.conversations.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* 6. Footer */}
            <div className="px-5 py-3 bg-muted/30 border-t flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                    {/* Connectors */}
                    <div className="flex items-center gap-2">
                        {stats.connectors.map(c => <ConnectorIcon key={c} type={c} />)}
                    </div>
                </div>

                <div className="flex items-center gap-1.5" title="Last Updated">
                    <span>Last updated {formattedDate}</span>
                </div>
            </div>
        </div>
    );
}
