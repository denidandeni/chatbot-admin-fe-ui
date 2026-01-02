"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import Footer from "@/app/components/Footer";
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
    <div className="flex h-screen">
      <Sidebar onLogout={handleLogout} isCollapsed={isCollapsed} />
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <main className="min-h-screen">{children}</main>
        <Footer />
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
