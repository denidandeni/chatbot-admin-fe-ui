"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ApiKeyTable from "@/app/components/ApiKeyTable";
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

      <ApiKeyTable isReadOnly={false} />
    </div>
  );
}
