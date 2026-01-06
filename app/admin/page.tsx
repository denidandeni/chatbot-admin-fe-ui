"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import PageHeader from "../components/PageHeader";
import { useEffect, useState } from "react";
import { getChatbots } from "@/services/chatbot";
import { getOrganizations } from "@/services/organization";
import { getAllUsers } from "@/services/user";
import { useToastContext } from "../components/ToastProvider";


export default function AdminDashboard() {
  const [chatbotCount, setChatbotCount] = useState(0);
  const [organizationCount, setOrganizationCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [conversationCount, setConversationCount] = useState(0);
  const [dateFilter, setDateFilter] = useState("7days");
  const { showToast } = useToastContext();

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const chatbots = await getChatbots();
      setChatbotCount(chatbots.length);

      const organizations = await getOrganizations();
      setOrganizationCount(organizations.length);

      const users = await getAllUsers();
      setUserCount(users.length);

      // Mock conversation count
      setConversationCount(1247);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div>
        <PageHeader
          title="Dashboard"
          breadcrumbItems={[
            { label: "Pages" },
            { label: "Dashboard", href: "/admin" }
          ]}
        />

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Chatbots Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4 transition-shadow duration-300">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12h-8v-2h8v2zm0-3h-8V9h8v2zm0-3h-8V6h8v2z" />
              </svg>
            </div>
            <div className="flex flex-col items-end flex-1">
              <p className="text-3xl font-bold text-gray-900 font-inter leading-none mb-1">{chatbotCount}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">AI Agents</p>
            </div>
          </div>

          {/* Organizations Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4 transition-shadow duration-300">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center text-white">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M16 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4M9 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
              </svg>
            </div>
            <div className="flex flex-col items-end flex-1">
              <p className="text-3xl font-bold text-gray-900 font-inter leading-none mb-1">{organizationCount}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Organization</p>
            </div>
          </div>

          {/* Conversations Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4 transition-shadow duration-300">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center text-white">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="flex flex-col items-end flex-1">
              <p className="text-3xl font-bold text-gray-900 font-inter leading-none mb-1">{conversationCount}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Conversations</p>
            </div>
          </div>

          {/* Chat Resolved Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4 transition-shadow duration-300">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center text-white">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="flex flex-col items-end flex-1">
              <p className="text-3xl font-bold text-gray-900 font-inter leading-none mb-1">65%</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Chat Resolved</p>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Credit Usage Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-8 pb-2 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-inter">Credit Usage</h3>
              <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                This Month
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 font-inter">Current Usage</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 font-inter">
                    47,250 / 100,000 credits
                  </span>
                  <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                    Buy Credits
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: '47.25%' }}
                ></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500 font-inter mb-1">Used</p>
                <p className="text-lg font-semibold text-gray-900 font-inter">47.3K</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-inter mb-1">Remaining</p>
                <p className="text-lg font-semibold text-green-600 font-inter">52.7K</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-inter mb-1">Max Credits</p>
                <p className="text-lg font-semibold text-blue-600 font-inter">100K</p>
              </div>
            </div>
          </div>

          {/* Topic Analysis Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-8 pb-2 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-inter">Topic Analysis</h3>
              <div className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                This Month
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column: Word Cloud */}
              <div className="flex flex-col">
                <p className="text-xs text-gray-500 font-inter mb-2">Word Cloud</p>
                <div className="flex flex-wrap gap-2 items-center justify-start flex-1">
                  <span className="text-blue-700 rounded-full text-lg font-medium">Product Info</span>
                  <span className="text-purple-700 rounded-full text-sm">Pricing</span>
                  <span className="text-green-700 rounded-full text-xl font-semibold">Support</span>
                  <span className="text-orange-700 rounded-full text-sm">Features</span>
                  <span className="text-pink-700 rounded-full text-base">Account</span>
                  <span className="text-indigo-700 rounded-full text-sm">Integration</span>
                  <span className="text-cyan-700 rounded-full text-lg">Billing</span>
                </div>
              </div>

              {/* Right Column: Top Topics with Progress Bars */}
              <div className="flex flex-col">
                <p className="text-xs text-gray-500 font-inter mb-4">Top 3 Topics</p>
                <div className="space-y-4 flex-1">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 font-inter">Support</span>
                      <span className="text-sm font-semibold text-gray-900">28%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 font-inter">Product Info</span>
                      <span className="text-sm font-semibold text-gray-900">22%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 font-inter">Billing</span>
                      <span className="text-sm font-semibold text-gray-900">18%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Agents Performance Section */}
        <div className="mt-8">
          {/* Section Header with Date Filters */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 font-inter">AI Agents Performance</h2>

            {/* Date Filter Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDateFilter("7days")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${dateFilter === "7days"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateFilter("30days")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${dateFilter === "30days"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setDateFilter("custom")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${dateFilter === "custom"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Agent Performance Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Agent Card 1 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 font-inter mb-2">Customer Support Bot</h3>
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-600 font-inter mb-4 line-clamp-2">
                Handles general inquiries and provides customer support assistance
              </p>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-inter">Total Conversations</span>
                  <span className="text-lg font-semibold text-blue-600 font-inter">342</span>
                </div>
              </div>
            </div>

            {/* Agent Card 2 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 font-inter mb-2">Sales Assistant</h3>
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-600 font-inter mb-4 line-clamp-2">
                Helps with product recommendations and sales inquiries
              </p>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-inter">Total Conversations</span>
                  <span className="text-lg font-semibold text-blue-600 font-inter">289</span>
                </div>
              </div>
            </div>

            {/* Agent Card 3 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 font-inter mb-2">Technical Support</h3>
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  Inactive
                </span>
              </div>
              <p className="text-sm text-gray-600 font-inter mb-4 line-clamp-2">
                Provides technical assistance and troubleshooting guidance
              </p>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-inter">Total Conversations</span>
                  <span className="text-lg font-semibold text-blue-600 font-inter">156</span>
                </div>
              </div>
            </div>

            {/* Agent Card 4 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 font-inter mb-2">Billing Assistant</h3>
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-600 font-inter mb-4 line-clamp-2">
                Handles billing questions and payment-related inquiries
              </p>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-inter">Total Conversations</span>
                  <span className="text-lg font-semibold text-blue-600 font-inter">203</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
