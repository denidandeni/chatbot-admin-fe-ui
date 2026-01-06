"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAdmin, isSuperAdmin } from "@/services/tokenUtils";
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import ContactsIcon from '@mui/icons-material/Contacts';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

interface SidebarSubItem {
  id: string;
  label: string;
  href: string;
}

interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SidebarSubItem[];
  superAdminOnly?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: DashboardIcon,
  },
  {
    id: "crm",
    label: "CRM",
    href: "/admin/crm",
    icon: ContactsIcon,
  },
  {
    id: "support",
    label: "User Management",
    href: "/admin/user",
    icon: SupportAgentIcon,
  },
  {
    id: "ai-agent",
    label: "AI Agent",
    icon: SmartToyIcon,
    children: [
      { id: "all-agents", label: "All Agents", href: "/admin/chatbot" },
      { id: "knowledge-base", label: "Knowledge Base", href: "/admin/ai-agent/knowledge-base" },
      { id: "platforms", label: "Connected Platform", href: "/admin/ai-agent/platforms" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: SettingsIcon,
    children: [
      { id: "connectors", label: "Setup Connectors", href: "/admin/settings/connectors" },
      { id: "api-keys", label: "API Keys", href: "/admin/api-key" },
    ],
  },
  {
    id: "help",
    label: "Help / Guide",
    href: "/admin/help",
    icon: HelpOutlineIcon,
  },
  {
    id: "organization",
    label: "Tenant Management",
    href: "/admin/organization",
    icon: BusinessIcon,
    superAdminOnly: true,
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
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [filteredSidebarItems, setFilteredSidebarItems] = useState<SidebarItem[]>(sidebarItems);
  const pathname = usePathname();

  useEffect(() => {
    const userIsSuperAdmin = isSuperAdmin();
    if (userIsSuperAdmin) {
      setFilteredSidebarItems(sidebarItems);
    } else {
      setFilteredSidebarItems(sidebarItems.filter(item => !item.superAdminOnly));
    }

    // Auto-expand sections based on current path
    sidebarItems.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child => pathname.startsWith(child.href));
        if (isChildActive && !expandedSections.includes(item.id)) {
          setExpandedSections(prev => [...prev, item.id]);
        }
      }
    });
  }, [pathname]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
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
        className={`bg-[#FBFBFB] text-slate-600 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-56'
          } ${isOpen ? "fixed inset-y-0 left-0 z-40 translate-x-0" : "hidden lg:flex"}`}
      >
        {/* Logo Section */}
        <div className={`${isCollapsed ? 'p-4' : 'p-4'}`}>
          {isCollapsed ? (
            <h1 className="text-2xl font-bold font-inter text-center text-slate-900">AI</h1>
          ) : (
            <>
              <h1 className="text-2xl font-bold font-inter text-slate-900">AMANI AI</h1>
              <p className="text-slate-500 text-sm mt-1">Futuristic AI Agent</p>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-2'} py-2 overflow-y-auto`}>
          <ul className="space-y-1">
            {filteredSidebarItems.map((item) => {
              const IconComponent = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedSections.includes(item.id);
              const active = item.href ? isActive(item.href) : item.children?.some(c => isActive(c.href));

              return (
                <li key={item.id}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleSection(item.id)}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg font-inter font-medium transition-all duration-200 ${active
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                          <IconComponent className={`w-5 h-5 ${active ? "text-slate-900" : "text-slate-400"}`} />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!isCollapsed && (
                          isExpanded
                            ? <ExpandMoreIcon className="w-4 h-4 text-slate-400" />
                            : <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      {!isCollapsed && isExpanded && (
                        <ul className="ml-6 mt-1 space-y-1 border-l border-slate-200 pl-4">
                          {item.children?.map(child => {
                            const childActive = isActive(child.href);
                            return (
                              <li key={child.id}>
                                <Link
                                  href={child.href}
                                  className={`block px-3 py-2 rounded-lg text-sm font-inter transition-all duration-200 ${childActive
                                    ? "bg-slate-900 text-white shadow-md"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                  onClick={() => setIsOpen(false)}
                                >
                                  <span className="truncate">{child.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg font-inter font-medium transition-all duration-200 ${active
                        ? "bg-slate-900 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      onClick={() => setIsOpen(false)}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <IconComponent className={`w-5 h-5 ${active ? "text-white" : "text-slate-400"}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
