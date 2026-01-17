"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ApiKeyTable from "@/app/components/ApiKeyTable";
import LLMProviderConfig from "@/app/components/LLMProviderConfig";
import { useToastContext } from "@/app/components/ToastProvider";
import PageHeader from "@/app/components/PageHeader";

export default function ApiKeyPage() {
  const router = useRouter();
  const { showToast } = useToastContext();

  return (
    <div>
      <PageHeader
        title="API Key Management"
        description="Manage API keys for all chatbots in your organization"
        breadcrumbItems={[
          { label: "Pages" },
          { label: "API Keys", href: "/admin/api-key" }
        ]}
      />
      <div className="mt-8">
        <div className="mb-8">
          <LLMProviderConfig />
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2">System API Keys</h2>
          <p className="text-slate-500 mb-6">Manage API keys for accessing the Chatbot API programmatically.</p>
          <ApiKeyTable isReadOnly={false} />
        </div>
      </div>
    </div>
  );
}
