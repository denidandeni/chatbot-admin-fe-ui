"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loginRequest } from "../../services/auth";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/app/components/ToastContainer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call real API via Next.js API route
      const data = await loginRequest({ email, password });
      
      console.log("✅ Login successful!", data);

      // Simpan user data ke sessionStorage (untuk UX)
      if (data.user) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
      }

      showToast(data.message || "Login berhasil!", "success");

      setTimeout(() => {
        router.push("/admin");
      }, 500);
    } catch (err: any) {
      console.error("❌ Login error:", err);
      
      const errorMessage = err?.detail?.[0]?.msg || 
                          err?.error || 
                          err?.message || 
                          "Invalid email or password";
      
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 px-4">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Left Side - Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
        <div className="max-w-md">
          <Image
            src="/images/loginimg.png"
            alt="Security Illustration"
            width={400}
            height={400}
            className="w-full"
            priority
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full max-w-md lg:w-1/2 lg:flex lg:justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4 text-black font-jakarta">Welcome to Chatbot AI</h1>
            <p className="text-black text-sm font-jakarta">
              Today is a new day. It's your day. You shape it.
              <br />
              Sign in to start managing your projects.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Enter your id"
                className="w-full px-6 py-3 rounded-xl border-2 border-[#EEF6FF] bg-[#EEF6FF] placeholder-[#9CA3AC] font-inter text-[#9CA3AC] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-6 py-3 rounded-xl border-2 border-[#EEF6FF] bg-[#EEF6FF] placeholder-[#9CA3AC] font-inter text-[#9CA3AC] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-70"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
