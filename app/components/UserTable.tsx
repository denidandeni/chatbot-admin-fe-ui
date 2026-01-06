"use client";

import { User } from "@/services/user";
import { formatDate } from "@/utils/dateFormat";
import { isAdmin } from "@/services/tokenUtils";
import Image from "next/image";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserTable({
  users,
  isLoading,
  onEdit,
  onDelete,
}: UserTableProps) {
  // Hide organization column for admin users (not superadmin) since all users are from the same org
  const showOrganizationColumn = !isAdmin();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No users found</p>
          <p className="text-sm text-gray-400">Create your first user to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative">
      <table className="w-full min-w-max">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {/* TODO: Enable profile column when backend endpoint is ready */}
            {false && <th className="text-left py-4 px-4 font-semibold text-gray-900 font-inter whitespace-nowrap sticky left-0 bg-white z-10 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)]">Profile</th>}
            <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter whitespace-nowrap sticky left-0 bg-gray-50 z-10 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)]">Name</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter whitespace-nowrap">Email</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter whitespace-nowrap">Role</th>
            {showOrganizationColumn && (
              <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter whitespace-nowrap w-48">Organization</th>
            )}
            <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter whitespace-nowrap w-80">Chatbots Assigned</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter whitespace-nowrap">Created At</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900 font-inter whitespace-nowrap sticky right-0 bg-gray-50 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.1)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
              {/* Profile Image - TODO: Enable when backend endpoint is ready */}
              {false && (
                <td className="py-4 px-4 sticky left-0 bg-white z-10">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                    {user.profile_image_url && typeof user.profile_image_url === 'string' ? (
                      <Image
                        src={user.profile_image_url as string}
                        alt={user.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </td>
              )}

              {/* Name */}
              <td className="py-4 px-6 text-gray-900 font-inter whitespace-nowrap sticky left-0 bg-white z-10">{user.name}</td>
              <td className="py-4 px-6 text-gray-600 font-inter text-sm whitespace-nowrap">{user.email}</td>
              <td className="py-4 px-6 text-gray-600 font-inter text-sm whitespace-nowrap">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {user.role}
                </span>
              </td>
              {showOrganizationColumn && (
                <td className="py-4 px-6 text-gray-600 font-inter text-sm w-48">
                  <div className="max-w-[12rem] truncate" title={user.organization_name}>
                    {(user.organization_name)}
                  </div>
                </td>
              )}
              <td className="py-4 px-6 text-gray-600 font-inter text-sm">
                {user.assigned_chatbots && user.assigned_chatbots.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {user.assigned_chatbots.map((chatbot) => (
                      <span
                        key={chatbot.id}
                        className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                      >
                        {chatbot.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 italic">No chatbots assigned</span>
                )}
              </td>
              <td className="py-4 px-6 text-gray-600 font-inter text-sm whitespace-nowrap">
                {(user.created_at || user.createdAt) ? formatDate(user.created_at || user.createdAt || "") : "-"}
              </td>
              <td className="py-4 px-6 sticky right-0 bg-white z-10">
                <div className="flex gap-2 whitespace-nowrap">
                  <button
                    onClick={() => onEdit(user)}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition font-inter font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition font-inter font-medium"
                  >
                    Delete
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
