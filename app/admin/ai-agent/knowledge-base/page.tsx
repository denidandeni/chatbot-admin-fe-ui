"use client";

import PageHeader from "../../../components/PageHeader";
import ConstructionIcon from '@mui/icons-material/Construction';

export default function KnowledgeBasePage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Knowledge Base"
                description="Manage knowledge sources for your AI agents"
                breadcrumbItems={[
                    { label: "Pages" },
                    { label: "AI Agent" },
                    { label: "Knowledge Base" }
                ]}
            />

            <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-lg border border-gray-200">
                <ConstructionIcon className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Still Building</h2>
                <p className="text-gray-500 text-center max-w-md">
                    This feature is currently under development. Check back soon for updates!
                </p>
            </div>
        </div>
    );
}
