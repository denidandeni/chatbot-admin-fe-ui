"use client";

import { useState } from "react";
import { formatDate } from "@/utils/dateFormat";

interface Customer {
    id: string;
    name: string;
    tag: string;
    lastContact: string; // ISO date string
    status: "Active" | "Inactive" | "Lead" | "Pending";
    detail: string;
}

const dummyCustomers: Customer[] = [
    {
        id: "CUST-001",
        name: "Alex Johnson",
        tag: "Premium",
        lastContact: new Date().toISOString(),
        status: "Active",
        detail: "Interested in AI automation",
    },
    {
        id: "CUST-002",
        name: "Sarah Miller",
        tag: "Enterprise",
        lastContact: new Date(Date.now() - 86400000).toISOString(),
        status: "Active",
        detail: "Evaluation phase",
    },
    {
        id: "CUST-003",
        name: "Michael Chen",
        tag: "Trial",
        lastContact: new Date(Date.now() - 172800000).toISOString(),
        status: "Lead",
        detail: "Webinar attendee",
    },
    {
        id: "CUST-004",
        name: "Emma Wilson",
        tag: "Standard",
        lastContact: new Date(Date.now() - 432000000).toISOString(),
        status: "Inactive",
        detail: "Subscription expired",
    },
];

interface CustomerTableProps {
    onView?: (customer: Customer) => void;
}

export default function CustomerTable({ onView }: CustomerTableProps) {
    const [customers] = useState<Customer[]>(dummyCustomers);

    const getStatusColor = (status: Customer["status"]) => {
        switch (status) {
            case "Active":
                return "bg-green-50 text-green-700 border-green-200";
            case "Lead":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "Inactive":
                return "bg-gray-50 text-gray-700 border-gray-200";
            case "Pending":
                return "bg-amber-50 text-amber-700 border-amber-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                        <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
                            ID
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
                            Customer Name
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
                            Tag
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
                            Last Contact
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
                            Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
                            Detail
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold font-inter text-gray-900">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr
                            key={customer.id}
                            className="border-b border-gray-200 hover:bg-gray-50/80 transition-colors"
                        >
                            <td className="px-6 py-4 text-sm font-medium font-inter text-gray-500">
                                {customer.id}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold font-inter text-gray-900">
                                {customer.name}
                            </td>
                            <td className="px-6 py-4 text-sm font-inter">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium border border-slate-200">
                                    {customer.tag}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-inter text-gray-600">
                                {formatDate(customer.lastContact)}
                            </td>
                            <td className="px-6 py-4 text-sm font-inter text-gray-600">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(customer.status)}`}>
                                    {customer.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-inter text-gray-600">
                                <div className="truncate max-w-xs">{customer.detail}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => onView?.(customer)}
                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-inter font-medium text-xs hover:bg-blue-100 transition-colors"
                                    >
                                        View
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
