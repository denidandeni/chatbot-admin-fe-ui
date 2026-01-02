"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAdmin } from "@/services/tokenUtils";
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: DashboardIcon,
  },
  {
    id: "organization",
    label: "Tenant Management",
    href: "/admin/organization",
    icon: BusinessIcon,
  },
  {
    id: "user",
    label: "User Management",
    href: "/admin/user",
    icon: PeopleIcon,
  },
  {
    id: "chatbot",
    label: "Agent",
    href: "/admin/chatbot",
    icon: SmartToyIcon,
  },
  {
    id: "api-key",
    label: "API Keys",
    href: "/admin/api-key",
    icon: VpnKeyIcon,
  },
];

interface SidebarProps {
  onLogout: () => void;
  isCollapsed: boolean;
}

export default function Sidebar({
  onLogout,
  isCollapsed,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [filteredSidebarItems, setFilteredSidebarItems] = useState<SidebarItem[]>(sidebarItems);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Get user data dari sessionStorage terlebih dahulu
    let userData = sessionStorage.getItem("user");

    // Jika tidak ada di sessionStorage, coba ambil dari cookie
    if (!userData) {
      // Coba parse dari document.cookie
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'user') {
          userData = decodeURIComponent(value);
          break;
        }
      }
    }

    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Handle different response structures from backend
        const name = user.name || user.username || user.email?.split("@")[0] || "User";
        const email = user.email || "user@example.com";

        setUserName(name);
        setUserEmail(email);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUserName("User");
        setUserEmail("user@example.com");
      }
    }

    // Filter sidebar items based on user role
    const userIsAdmin = isAdmin();
    if (userIsAdmin) {
      // Hide organization tab for admin users
      setFilteredSidebarItems(sidebarItems.filter(item => item.id !== 'organization'));
    } else {
      // Show all items for super admin
      setFilteredSidebarItems(sidebarItems);
    }
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition"
        >
          {isOpen ? (
            <CloseIcon className="w-6 h-6 text-gray-700" />
          ) : (
            <MenuIcon className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen ${isCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-br from-[#004BB5] to-[#1C84EE] text-white transition-all duration-300 z-40 lg:translate-x-0 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo Section */}
        <div className={`${isCollapsed ? 'p-4' : 'p-8'}`}>
          {isCollapsed ? (
            <h1 className="text-2xl font-bold font-inter text-center">AI</h1>
          ) : (
            <>
              <h1 className="text-2xl font-bold font-inter">AMANI AI</h1>
              <p className="text-blue-100 text-sm mt-1">Futuristic AI Agent</p>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} py-2`}>
          <ul className="space-y-2">
            {filteredSidebarItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg font-inter font-medium transition-all duration-200 ${isActive(item.href)
                      ? "bg-white text-[#004BB5] shadow-lg"
                      : "text-blue-100 hover:bg-blue-500 hover:text-white"
                      }`}
                    onClick={() => setIsOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <IconComponent className="w-5 h-5" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section with Dropdown */}
        <div className="mt-auto p-4 relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#004BB5] to-[#1C84EE] flex items-center justify-center text-black font-bold text-sm shadow-md border border-white border-opacity-20">
              {userName.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold truncate font-inter text-gray-900">
                    {userName}
                  </p>
                  <p className="text-xs text-blue-200 truncate">{userEmail}</p>
                </div>
                <ExpandMoreIcon
                  className={`w-5 h-5 text-blue-200 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 border border-gray-100">
              <div className="py-1">
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-inter"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <SettingsIcon className="w-5 h-5 text-gray-400" />
                  Settings
                </Link>
                <div className="h-px bg-gray-100 my-1 confirm-logout-separator"></div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-inter"
                >
                  <LogoutIcon className="w-5 h-5 text-red-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Spacer for Desktop */}
      <div className={`hidden lg:block ${isCollapsed ? 'w-20' : 'w-64'}`} />
    </>
  );
}
