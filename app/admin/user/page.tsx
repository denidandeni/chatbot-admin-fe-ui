"use client";

import UserTable from "../../components/UserTable";
import UserForm from "../../components/UserForm";
import SlideSheet from "../../components/SlideSheet";
import DeleteModal from "../../components/DeleteModal";
import { useEffect, useState } from "react";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
  CreateUserPayload,
} from "@/services/user";
import { getOrganizations, Organization } from "@/services/organization";
import { isAdmin, isSuperAdmin } from "@/services/tokenUtils";
import { useToastContext } from "../../components/ToastProvider";

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const { showToast } = useToastContext();

  // Load users and organizations
  useEffect(() => {
    fetchUsers();
    if (isSuperAdmin()) {
      fetchOrganizations();
    }
  }, []);

  const normalizeRole = (role: string | undefined) => (role || "").toLowerCase();

  const filterUsersForCurrentLogin = (allUsers: User[]) => {
    if (isSuperAdmin()) {
      return allUsers.filter((user) => normalizeRole(user.role) === "admin");
    }

    if (isAdmin()) {
      return allUsers.filter((user) => normalizeRole(user.role) === "user");
    }

    return [];
  };

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const data = await getAllUsers();
      console.log("Users fetched:", data);
      if (data.length > 0) {
        console.log("First user with chatbots:", data[0]);
      }
      const safeUsers = Array.isArray(data) ? data : [];
      setUsers(filterUsersForCurrentLogin(safeUsers));
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
      showToast("Failed to load users", "error");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const data = await getOrganizations();
      console.log("Organizations fetched:", data);
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading organizations:", error);
      setOrganizations([]);
    }
  };

  const handleOpenForm = (user?: User) => {
    setSelectedUser(user || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const handleSubmitForm = async (data: CreateUserPayload) => {
    try {
      if (selectedUser) {
        // Update existing user
        await updateUser(selectedUser.id, {
          name: data.name,
          email: data.email,
          role: data.role,
          organization_id: data.organization_id,
        });
        showToast("User updated successfully", "success");
      } else {
        // Create new user - organization_id will be auto-set in service
        await createUser(data);
        showToast("User created successfully", "success");
      }
      // Refresh users list
      await fetchUsers();
      handleCloseForm();
    } catch (error: any) {
      showToast(error?.response?.data?.detail || "Failed to save user", "error");
      throw error;
    }
  };

  const handleDelete = (user: User) => {
    setDeleteTarget(user);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleteLoading(true);
      await deleteUser(deleteTarget.id);
      await fetchUsers();
      setDeleteTarget(null);
      showToast("User deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("Failed to delete user", "error");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <div className="bg-white rounded-xl p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-inter text-gray-900">
              User Management
            </h1>
            <p className="text-sm text-gray-600 mt-2 font-inter">
              Create and manage user accounts
            </p>
          </div>

          <button
            onClick={() => handleOpenForm()}
            className="px-6 py-3 bg-blue-600 text-white font-inter font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2 justify-center sm:justify-start"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create New User
          </button>
        </div>

        {/* Table */}
        <UserTable
          users={users}
          isLoading={isLoadingUsers}
          onEdit={handleOpenForm}
          onDelete={handleDelete}
        />
      </div>

      {/* Slide Sheet for Form */}
      <SlideSheet 
        isOpen={isFormOpen} 
        onClose={handleCloseForm}
        title={selectedUser ? "Edit User" : "Create New User"}
        width="400px"
        orientation="right"
      >
        <UserForm
          user={selectedUser}
          isLoading={isFormOpen}
          onSubmit={handleSubmitForm}
          onClose={handleCloseForm}
          isCreate={!selectedUser}
          organizations={organizations}
        />
      </SlideSheet>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        isLoading={isDeleteLoading}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
