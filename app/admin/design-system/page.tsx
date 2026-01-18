"use client";

import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";

export default function DesignSystemPage() {
    // Initial state matches globals.css defaults
    const [tokens, setTokens] = useState({
        "--color-primary": "#2563EB",
        "--color-surface": "#ffffff",
        "--color-border": "#e2e8f0",
        "--radius-card": "1.5rem",
        "--padding-page": "2rem",
    });

    // Load current values on mount
    useEffect(() => {
        const root = document.documentElement;
        const computed = getComputedStyle(root);

        setTokens({
            "--color-primary": computed.getPropertyValue("--color-primary").trim() || "#2563EB",
            "--color-surface": computed.getPropertyValue("--color-surface").trim() || "#ffffff",
            "--color-border": computed.getPropertyValue("--color-border").trim() || "#e2e8f0",
            "--radius-card": computed.getPropertyValue("--radius-card").trim() || "1.5rem",
            "--padding-page": computed.getPropertyValue("--padding-page").trim() || "2rem",
        });
    }, []);

    const updateToken = (key: string, value: string) => {
        setTokens(prev => ({ ...prev, [key]: value }));
        document.documentElement.style.setProperty(key, value);
    };

    const resetTokens = () => {
        const defaults = {
            "--color-primary": "#2563EB",
            "--color-surface": "#ffffff",
            "--color-border": "#e2e8f0",
            "--radius-card": "1.5rem",
            "--padding-page": "2rem",
        };
        setTokens(defaults);
        Object.entries(defaults).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
    };

    return (
        <div>
            <PageHeader
                title="Design System"
                description="Manage global design tokens and styles"
                breadcrumbItems={[
                    { label: "Pages" },
                    { label: "Design System" }
                ]}
            >
                <button
                    onClick={resetTokens}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                    Reset to Defaults
                </button>
            </PageHeader>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Colors Section */}
                <div className="bg-white rounded-[var(--radius-card)] border border-[var(--color-border)] p-[var(--padding-page)] shadow-sm">
                    <h2 className="text-xl font-bold font-inter text-gray-900 mb-6">Color Tokens</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={tokens["--color-primary"]}
                                    onChange={(e) => updateToken("--color-primary", e.target.value)}
                                    className="h-10 w-20 rounded cursor-pointer"
                                />
                                <div className="flex-1">
                                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                        {tokens["--color-primary"]}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">Buttons, Highlights, Links</p>
                                </div>
                                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg transition-colors">
                                    Preview Button
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100"></div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Surface Color</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={tokens["--color-surface"]}
                                    onChange={(e) => updateToken("--color-surface", e.target.value)}
                                    className="h-10 w-20 rounded cursor-pointer border border-gray-200"
                                />
                                <div className="flex-1">
                                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                        {tokens["--color-surface"]}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">Card backgrounds, Modals</p>
                                </div>
                                <div className="p-4 bg-surface border border-border rounded-lg shadow-sm">
                                    <span className="text-sm text-surface-foreground">Preview Surface</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100"></div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Border Color</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={tokens["--color-border"]}
                                    onChange={(e) => updateToken("--color-border", e.target.value)}
                                    className="h-10 w-20 rounded cursor-pointer"
                                />
                                <div className="flex-1">
                                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                        {tokens["--color-border"]}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">Dividers, Inputs, Card borders</p>
                                </div>
                                <div className="w-16 h-10 border border-border bg-gray-50 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Spacing & Radius Section */}
                <div className="bg-white rounded-[var(--radius-card)] border border-[var(--color-border)] p-[var(--padding-page)] shadow-sm">
                    <h2 className="text-xl font-bold font-inter text-gray-900 mb-6">Shape & Spacing</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Card Radius</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="48"
                                    value={parseFloat(tokens["--radius-card"]) * 16} // Convert rem to px approx
                                    onChange={(e) => updateToken("--radius-card", `${e.target.value}px`)}
                                    className="w-full"
                                />
                                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded w-20 text-center">
                                    {tokens["--radius-card"]}
                                </span>
                            </div>
                            <div className="mt-4 p-8 bg-gray-100 rounded-card border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <div className="w-24 h-24 bg-primary rounded-card shadow-lg flex items-center justify-center text-white text-xs">
                                    Radius
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100"></div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Page Padding</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="64"
                                    value={parseFloat(tokens["--padding-page"]) * 16}
                                    onChange={(e) => updateToken("--padding-page", `${e.target.value}px`)}
                                    className="w-full"
                                />
                                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded w-20 text-center">
                                    {tokens["--padding-page"]}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Adjusts padding inside this card and other layout containers.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Preview Section */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Components Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-2">Card Component</h4>
                        <p className="text-sm text-gray-600 mb-4">This card uses the surface, border, and radius tokens.</p>
                        <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                            Primary Action
                        </button>
                    </div>

                    <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-700">Status</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
