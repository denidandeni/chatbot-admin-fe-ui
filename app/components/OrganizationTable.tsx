"use client";

import { Organization } from "@/services/organization";
import { formatDate } from "@/utils/dateFormat";
import Image from "next/image";
import { useToastContext } from "./ToastProvider";

interface OrganizationTableProps {
  organizations: Organization[];
  isLoading: boolean;
  onEdit?: (organization: Organization) => void;
  onDelete?: (organization: Organization) => void;
  onRefresh?: () => void;
}

export default function OrganizationTable({
  organizations,
  isLoading,
  onEdit,
  onDelete,
  onRefresh,
}: OrganizationTableProps) {
  const { showToast } = useToastContext();

  const getStatusInfo = (org: Organization) => {
    if (!org.expiry_date) {
      return { status: "active", label: "Active", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-100" };
    }

    const expiryDate = new Date(org.expiry_date);
    const today = new Date();
    const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0 || org.is_active === false) {
      return { status: "inactive", label: "Inactive", color: "bg-gray-400", textColor: "text-gray-700", bgColor: "bg-gray-100", daysRemaining: 0 };
    }

    return { status: "active", label: "Active", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-100", daysRemaining };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading organizations...</div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No organizations found</p>
          <p className="text-sm text-gray-400">Create your first organization to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter">Profile</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter">Name</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter">Status</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter">Expiry Info</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter">Description</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter">Created At</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter">Actions</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => {
            console.log("📊 Rendering organization in table:", {
              id: org.id,
              name: org.name,
              expiry_date: org.expiry_date,
              expired_date: org.expired_date,
              profile_image_url: org.profile_image_url,
              profile_picture_url: org.profile_picture_url,
            });
            const statusInfo = getStatusInfo(org);
            return (
              <tr key={org.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                {/* Profile Image */}
                <td className="py-4 px-6">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                    {(org.profile_image_url || org.profile_picture_url) ? (
                      <Image
                        src={org.profile_image_url || org.profile_picture_url || ''}
                        alt={org.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                  </div>
                </td>

                {/* Name */}
                <td className="py-4 px-6 text-gray-900 font-inter font-medium">{org.name}</td>

                {/* Status */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${statusInfo.color}`}></span>
                    <span className={`text-sm font-medium font-inter ${statusInfo.textColor}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </td>

                {/* Expiry Info */}
                <td className="py-4 px-6">
                  {org.expiry_date ? (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600 font-inter">
                        {formatDate(org.expiry_date)}
                      </div>
                      {statusInfo.status === "active" && statusInfo.daysRemaining !== undefined && (
                        <div className={`text-xs font-medium ${statusInfo.daysRemaining < 30 ? 'text-orange-600' : 'text-gray-500'}`}>
                          {statusInfo.daysRemaining} days remaining
                        </div>
                      )}
                      {statusInfo.status === "inactive" && (
                        <div className="text-xs font-medium text-red-600">
                          Expired
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic font-inter">No expiry</span>
                  )}
                </td>

                {/* Description */}
                <td className="py-4 px-6 text-gray-600 font-inter text-sm max-w-xs truncate">
                  {org.description || "-"}
                </td>

                {/* Created At */}
                <td className="py-4 px-6 text-gray-600 font-inter text-sm">
                  {(org.created_at || org.createdAt) ? formatDate(org.created_at || org.createdAt || "") : "-"}
                </td>

                {/* Actions */}
                <td className="py-4 px-6">
                  <div className="flex gap-2 flex-wrap">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(org)}
                        className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition font-inter font-medium"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(org)}
                        className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition font-inter font-medium"
                      >
                        Delete
                      </button>
                    )}
                    {!onEdit && !onDelete && (
                      <span className="text-sm text-gray-500 font-inter">View only</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
