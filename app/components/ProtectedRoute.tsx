"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cek apakah user memiliki token via API route
    const checkAuth = async () => {
      // STATIC AUTH CHECK
      if (typeof window !== "undefined") {
        const mockUser = sessionStorage.getItem("user");
        if (mockUser) {
          try {
            const userObj = JSON.parse(mockUser);
            if (userObj.email === "admin@admin.com") {
              setIsLoading(false);
              return;
            }
          } catch (e) {
            // ignore
          }
        }
      }

      try {
        const response = await fetch('/api/auth/token', {
          credentials: 'include',
        });

        if (!response.ok) {
          // Tidak ada token, redirect ke login
          router.replace("/login");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
