"use client";

import { useState } from "react";
import {
    Bell,
    CheckCircle2,
    AlertTriangle,
    Info,
    Clock,
    Trash2,
    Check
} from "lucide-react";
import PageHeader from "@/app/components/PageHeader";

// Mock Notification Data
const MOCK_NOTIFICATIONS = [
    {
        id: "1",
        title: "Database Connection Successful",
        message: "Your 'Production E-commerce DB' has been successfully connected and verified.",
        type: "success",
        timestamp: "Just now",
        read: false
    },
    {
        id: "2",
        title: "Agent Deployment Complete",
        message: "Customer Support Agent v2.4 has been deployed to all channels.",
        type: "info",
        timestamp: "2 hours ago",
        read: false
    },
    {
        id: "3",
        title: "Token Usage Alert",
        message: "You have reached 80% of your monthly token limit. Upgrade to ensure uninterrupted service.",
        type: "warning",
        timestamp: "5 hours ago",
        read: true
    },
    {
        id: "4",
        title: "New Team Member",
        message: "Sarah Brown has joined your organization.",
        type: "info",
        timestamp: "1 day ago",
        read: true
    },
    {
        id: "5",
        title: "System Maintenance Scheduled",
        message: "Scheduled maintenance for Jan 20th at 02:00 UTC. Expect potential downtime.",
        type: "warning",
        timestamp: "2 days ago",
        read: true
    }
];

export default function NotificationPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle2 size={20} className="text-green-500" />;
            case "warning": return <AlertTriangle size={20} className="text-orange-500" />;
            case "info": return <Info size={20} className="text-blue-500" />;
            default: return <Bell size={20} className="text-slate-500" />;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <PageHeader
                title="Notifications"
                description="Stay updated with system alerts and activity logs."
                breadcrumbItems={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Notifications" }
                ]}
            >
                <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                    <Check size={16} />
                    Mark all as read
                </button>
            </PageHeader>

            <div className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Bell size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No notifications</h3>
                        <p className="text-slate-400 mt-2">You're all caught up! Check back later.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-6 flex gap-5 hover:bg-slate-50 transition-colors group ${!notification.read ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className={`p-3 rounded-full h-fit flex-shrink-0 ${!notification.read ? 'bg-white shadow-sm ring-1 ring-slate-100' : 'bg-slate-50'}`}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className={`text-sm font-bold ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                {notification.title}
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-3 text-[11px] font-medium text-slate-400">
                                        <Clock size={12} />
                                        {notification.timestamp}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
