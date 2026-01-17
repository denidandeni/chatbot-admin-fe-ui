"use client";

import { useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import { CreditCard, Check, Star, Shield, Zap } from 'lucide-react';
import { isSuperAdmin } from '@/services/tokenUtils';

// Mock Data
const PLANS = [
    {
        id: "starter",
        name: "Starter",
        price: "$0",
        period: "/month",
        description: "Perfect for individuals and hobbyists.",
        features: [
            "1 AI Agent",
            "100 Messages/month",
            "Basic Analytics",
            "Community Support"
        ],
        current: false,
        color: "bg-slate-50 border-slate-200"
    },
    {
        id: "pro",
        name: "Pro",
        price: "$49",
        period: "/month",
        description: "For growing teams and businesses.",
        features: [
            "5 AI Agents",
            "Unlimited Messages",
            "Advanced Analytics",
            "Priority Support",
            "Custom Knowledge Base",
            "API Access"
        ],
        current: true,
        color: "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "For large organizations with specific needs.",
        features: [
            "Unlimited AI Agents",
            "Dedicated Infrastructure",
            "SSO & Advanced Security",
            "24/7 Dedicated Support",
            "Custom Integration",
            "SLA Agreement"
        ],
        current: false,
        color: "bg-purple-50 border-purple-200"
    }
];

export default function SubscriptionPage() {
    const currentPlan = PLANS.find(p => p.current);

    return (
        <div className="flex flex-col h-full">
            <PageHeader
                title="Subscription"
                description="Manage your billing and plan"
                breadcrumbItems={[
                    { label: "Settings" },
                    { label: "Subscription" }
                ]}
            />

            <div className="mt-8 space-y-10">
                {/* Current Plan Section */}
                <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${currentPlan?.name === 'Pro' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-1">Current Plan: {currentPlan?.name}</h2>
                            <p className="text-slate-500 text-sm">
                                Your next billing date is <span className="font-medium text-slate-700">February 17, 2026</span>
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                                <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold uppercase tracking-wide">
                                    Active
                                </span>
                                <span className="text-xs text-slate-400">
                                    • Visa ending in 4242
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Billing Actions */}
                    <div className="flex gap-3 pt-2">
                        {isSuperAdmin() ? (
                            <button className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                                Manage Billing
                            </button>
                        ) : (
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                                Contact superadmin (superadmin@chatbot.com) to manage this subscription
                            </div>
                        )}
                        <button className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm">
                            Upgrade Plan
                        </button>
                    </div>
                </section>

                {/* Available Plans Section */}
                <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Available Plans</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl p-6 border flex flex-col h-full transition-all duration-200 hover:shadow-md ${plan.color}`}
                            >
                                {plan.current && (
                                    <div className="absolute top-4 right-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
                                            Current Plan
                                        </span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                                        <span className="text-sm font-medium text-slate-500">{plan.period}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-2 min-h-[40px]">{plan.description}</p>
                                </div>

                                <div className="flex-1">
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm">
                                                <Check size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                                <span className="text-slate-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-colors ${plan.current
                                        ? 'bg-slate-200 text-slate-400 cursor-default'
                                        : plan.name === 'Enterprise'
                                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    disabled={plan.current}
                                >
                                    {plan.current ? 'Current Plan' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
