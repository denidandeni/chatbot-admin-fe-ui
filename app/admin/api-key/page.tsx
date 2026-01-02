"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ApiKeyTable from "@/app/components/ApiKeyTable";
import { useToastContext } from "@/app/components/ToastProvider";

export default function ApiKeyPage() {
  const router = useRouter();
  const { showToast } = useToastContext();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API Key Management</h1>
        <p className="text-gray-600 mt-1">
          Manage API keys for all chatbots in your organization
        </p>
      </div>

      <ApiKeyTable isReadOnly={false} />
    </div>
  );
}
