"use client";

import PageHeader from "../../../components/PageHeader";
import ConstructionIcon from '@mui/icons-material/Construction';

export default function ConnectorsPage() {
    return (
        <div>
            <PageHeader
                title="Setup Connectors"
                description="Configure AI model connections like OpenAI and Gemini"
                breadcrumbItems={[
                    { label: "Pages" },
                    { label: "Settings" },
                    { label: "Setup Connectors" }
                ]}
            />

            <div className="mt-8 flex flex-col items-center justify-center py-24 bg-gray-50 rounded-lg border border-gray-200">
                <ConstructionIcon className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Still Building</h2>
                <p className="text-gray-500 text-center max-w-md">
                    This feature is currently under development. Check back soon for updates!
                </p>
            </div>
        </div>
    );
}
