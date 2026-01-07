"use client";

import { useState, useEffect } from "react";
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
                <div className="flex items-center gap-1 px-1">
                    <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors relative">
                        <NotificationsNoneIcon className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                    </button>
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
