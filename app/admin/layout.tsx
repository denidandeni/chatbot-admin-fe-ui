"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import TopBar from "@/app/components/TopBar";

import ToastProvider, { useToastContext } from "@/app/components/ToastProvider";
import { logoutRequest } from "@/services/auth";
import { setupTokenRefreshInterval } from "@/services/tokenUtils";

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { showToast } = useToastContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Setup automatic token refresh
  useEffect(() => {
    console.log('🔧 Setting up automatic token refresh...');
    const cleanup = setupTokenRefreshInterval();

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up token refresh interval');
      cleanup();
    };
  }, []);

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleToggle = () => {
      setIsCollapsed(prev => !prev);
    };
    window.addEventListener('toggleSidebar', handleToggle);
    return () => window.removeEventListener('toggleSidebar', handleToggle);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutRequest();
      showToast("Logout berhasil", "success");
      setTimeout(() => {
        router.push("/login");
      }, 500);
    } catch (error) {
      showToast("Logout gagal", "error");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onLogout={handleLogout} isCollapsed={isCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 bg-[#FBFBFB] relative py-2 md:py-4">
        <div className="bg-white rounded-3xl flex-1 flex flex-col border border-slate-200 shadow-sm overflow-hidden">
          {/* Fixed TopBar */}
          <div className="flex-shrink-0 p-4 md:p-6">
            <TopBar onLogout={handleLogout} />
          </div>
          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <ProtectedRoute>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </ProtectedRoute>
    </ToastProvider>
  );
}
