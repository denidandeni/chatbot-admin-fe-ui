"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in cookies
    const hasToken = document.cookie
      .split(";")
      .some((cookie) => cookie.trim().startsWith("access_token="));

    if (hasToken) {
      // Token exists, redirect to admin
      router.push("/admin");
    } else {
      // No token, redirect to login
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}
