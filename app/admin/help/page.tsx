"use client";

import PageHeader from "../../components/PageHeader";
import ConstructionIcon from '@mui/icons-material/Construction';

export default function HelpPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Help / Guide Hub"
                description="Find documentation and support resources"
                breadcrumbItems={[
                    { label: "Pages" },
                    { label: "Help / Guide" }
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
