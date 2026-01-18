"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import KeyboardCommandKeyIcon from "@mui/icons-material/KeyboardCommandKey";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import SettingsIcon from "@mui/icons-material/Settings";
import LightModeIcon from "@mui/icons-material/LightMode";
import TranslateIcon from "@mui/icons-material/Translate";

import LogoutIcon from "@mui/icons-material/Logout";

interface TopBarProps {
    onLogout?: () => void;
}

export default function TopBar({ onLogout }: TopBarProps) {
    const [userName, setUserName] = useState("User");
    const [userEmail, setUserEmail] = useState("user@example.com");
    const [userAvatar, setUserAvatar] = useState("U");
    const [orgName, setOrgName] = useState("AMANI AI");
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    useEffect(() => {
        const userData = sessionStorage.getItem("user");
        if (userData) {
            try {
                const user = JSON.parse(userData);
                const name = user.name || user.username || user.email?.split("@")[0] || "User";
                const email = user.email || "user@example.com";
                setUserName(name);
                setUserEmail(email);
                setUserAvatar(name.charAt(0).toUpperCase());
            } catch (error) {
                console.error("Error parsing user data in TopBar:", error);
            }
        }
    }, []);

    const handleToggleSidebar = () => {
        window.dispatchEvent(new CustomEvent("toggleSidebar"));
    };

    return (
        <header className="bg-white flex items-center justify-between pb-4 border-b border-gray-200">
            {/* Left Section: Sidebar Toggle & Team Selector */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleToggleSidebar}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-500"
                    title="Toggle Navigation"
                >
                    <span className="material-symbols-outlined text-[20px] text-gray-500">dock_to_left</span>
                </button>
                <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

            </div>


            {/* Middle Section: Search Bar */}
            <div className="flex-1 max-w-xl px-8 hidden md:block">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <SearchIcon className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search documents, bots, or settings..."
                        className="w-full pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-inter placeholder:text-gray-600"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded border border-gray-200 bg-white text-[10px] font-semibold text-gray-400 flex items-center gap-0.5">
                            <KeyboardCommandKeyIcon className="w-2 h-2" /> K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right Section: Actions & User */}
            <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-1 px-1 relative">
                    <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors relative"
                    >
                        <NotificationsNoneIcon className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                    </button>

                    {/* Notification Popup */}
                    {isNotificationOpen && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-100 ring-1 ring-black/5 z-50">
                            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                                <h6 className="font-semibold text-sm text-gray-900">Notifications</h6>
                                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">3 New</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600">Database Connection Successful</p>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">Just now</span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">Your &apos;Production E-commerce DB&apos; has been successfully connected.</p>
                                </div>
                                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600">Agent Deployment Complete</p>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">2h ago</span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">Customer Support Agent v2.4 has been deployed to all channels.</p>
                                </div>
                                <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600">Token Usage Alert</p>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">5h ago</span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">You have reached 80% of your monthly token limit.</p>
                                </div>
                            </div>
                            <div className="p-2 bg-gray-50 border-t border-gray-200/50">
                                <Link
                                    href="/admin/notifications"
                                    className="block w-full text-center py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                    onClick={() => setIsNotificationOpen(false)}
                                >
                                    See all notifications
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                <div className="relative">
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-3 pl-2 sm:pl-4 group"
                    >
                        <div className="flex flex-col items-end hidden lg:flex">
                            <span className="text-sm font-semibold text-gray-900 leading-none group-hover:text-blue-600 transition-colors">
                                {userName}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">{userEmail}</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-transparent ring-offset-2 group-hover:ring-blue-500/20 transition-all">
                            {userAvatar}
                        </div>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-100 py-1">
                            <div className="px-4 py-2 border-b border-gray-50 lg:hidden">
                                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                            </div>
                            <button
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <SettingsIcon className="w-4 h-4 text-gray-400" />
                                Settings
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogoutIcon className="w-4 h-4 text-red-500" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
