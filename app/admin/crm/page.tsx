"use client";

import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import CustomerTable from "../../components/CustomerTable";
import SlideSheet from "../../components/SlideSheet";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import GroupsIcon from "@mui/icons-material/Groups";
import ForumIcon from "@mui/icons-material/Forum";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import BlockIcon from "@mui/icons-material/Block";

export default function CRMPage() {
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [viewCustomer, setViewCustomer] = useState<any>(null);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Customer Data"
                description="Manage your customer interactions, tags, and status in one place."
                breadcrumbItems={[
                    { label: "Pages" },
                    { label: "CRM", href: "/admin/crm" }
                ]}
            >
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-inter font-medium rounded-xl hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        <FileUploadIcon className="w-5 h-5 text-gray-400" />
                        Import CSV
                    </button>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="px-4 py-2.5 bg-blue-600 text-white font-inter font-medium rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <AddIcon className="w-5 h-5" />
                        Add Customer
                    </button>
                </div>
            </PageHeader>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Customer */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white">
                        <GroupsIcon className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col items-end flex-1">
                        <p className="text-3xl font-bold text-gray-900 font-inter leading-none mb-1">1,284</p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Customer</p>
                    </div>
                </div>

                {/* Total Conversation */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center text-white">
                        <ForumIcon className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col items-end flex-1">
                        <p className="text-3xl font-bold text-gray-900 font-inter leading-none mb-1">8,432</p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Conversation</p>
                    </div>
                </div>

                {/* Active Tickets */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center text-white">
                        <ConfirmationNumberIcon className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col items-end flex-1">
                        <p className="text-3xl font-bold text-gray-900 font-inter leading-none mb-1">42</p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Tickets</p>
                    </div>
                </div>

                {/* Blacklist */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white">
                        <BlockIcon className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col items-end flex-1">
                        <p className="text-3xl font-bold text-gray-900 font-inter leading-none mb-1">12</p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Blacklist</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <CustomerTable onView={(customer) => setViewCustomer(customer)} />
            </div>

            {/* SlideSheets */}
            <SlideSheet
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                title="Import Customers"
                width="500px"
            >
                <div className="p-6">
                    <div className="p-12 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50">
                        <FileUploadIcon className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-sm text-gray-600 font-inter text-center">
                            Drag and drop your CSV file here, or <span className="text-blue-600 font-medium cursor-pointer">browse</span>
                        </p>
                    </div>
                </div>
            </SlideSheet>

            <SlideSheet
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add New Customer"
                width="500px"
            >
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. John Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                            <option>Premium</option>
                            <option>Enterprise</option>
                            <option>Standard</option>
                            <option>Trial</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                        <textarea className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" rows={4} placeholder="Additional info..." />
                    </div>
                    <button className="w-full py-3 bg-blue-600 text-white font-inter font-medium rounded-xl hover:bg-blue-700 transition">
                        Save Customer
                    </button>
                </div>
            </SlideSheet>

            <SlideSheet
                isOpen={!!viewCustomer}
                onClose={() => setViewCustomer(null)}
                title="Customer Details"
                width="500px"
            >
                {viewCustomer && (
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                {viewCustomer.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 leading-tight">{viewCustomer.name}</h3>
                                <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">{viewCustomer.id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white border border-gray-100 rounded-xl">
                                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Status</p>
                                <p className="font-semibold text-gray-900">{viewCustomer.status}</p>
                            </div>
                            <div className="p-4 bg-white border border-gray-100 rounded-xl">
                                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Tag</p>
                                <p className="font-semibold text-gray-900">{viewCustomer.tag}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase mb-2">About Customer</p>
                            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                                "{viewCustomer.detail}"
                            </p>
                        </div>
                    </div>
                )}
            </SlideSheet>
        </div>
    );
}
