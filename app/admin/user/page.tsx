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
  assignUserToChatbot,
  removeUserFromChatbot,
  deleteUser,
  User,
  CreateUserPayload,
} from "@/services/user";
import { getOrganizations, Organization } from "@/services/organization";
import { isAdmin, isSuperAdmin } from "@/services/tokenUtils";
import { useToastContext } from "../../components/ToastProvider";
import PageHeader from "../../components/PageHeader";

const MOCK_TEAM_MEMBERS: User[] = [
  {
    id: "user-1",
    name: "Sarah Jenkins",
    email: "sarah.j@company.com",
    role: "admin",
    organization_id: "org-1",
    organization_name: "Acme Corp",
    created_at: "2024-01-15T10:00:00Z",
    assigned_chatbots: [
      { id: "bot-1", name: "Customer Support Bot" },
      { id: "bot-2", name: "Sales Assistant" }
    ]
  },
  {
    id: "user-2",
    name: "Michael Chen",
    email: "m.chen@company.com",
    role: "user",
    organization_id: "org-1",
    organization_name: "Acme Corp",
    created_at: "2024-02-01T14:30:00Z",
    assigned_chatbots: [
      { id: "bot-1", name: "Customer Support Bot" }
    ]
  },
  {
    id: "user-3",
    name: "Jessica Wu",
    email: "jessica.w@company.com",
    role: "user",
    organization_id: "org-1",
    organization_name: "Acme Corp",
    created_at: "2024-02-10T09:15:00Z",
    assigned_chatbots: [
      { id: "bot-3", name: "HR Policy Bot" }
    ]
  },
  {
    id: "user-4",
    name: "David Miller",
    email: "d.miller@company.com",
    role: "user",
    organization_id: "org-1",
    organization_name: "Acme Corp",
    created_at: "2024-03-05T11:45:00Z",
    assigned_chatbots: []
  },
  {
    id: "user-5",
    name: "Emily Wilson",
    email: "emily.w@company.com",
    role: "admin",
    organization_id: "org-1",
    organization_name: "Acme Corp",
    created_at: "2024-03-20T16:20:00Z",
    assigned_chatbots: [
      { id: "bot-2", name: "Sales Assistant" },
      { id: "bot-3", name: "HR Policy Bot" }
    ]
  }
];

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
      const safeUsers = Array.isArray(data) && data.length > 0 ? data : MOCK_TEAM_MEMBERS;
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

  const handleSubmitForm = async (data: CreateUserPayload, assignedChatbotIds?: string[]) => {
    try {
      let savedUser: User;

      if (selectedUser) {
        // Update existing user
        savedUser = await updateUser(selectedUser.id, {
          name: data.name,
          email: data.email,
          role: data.role,
          organization_id: data.organization_id,
        });
        showToast("User updated successfully", "success");
      } else {
        // Create new user
        savedUser = await createUser(data);
        showToast("User created successfully", "success");
      }

      // Handle Chatbot Assignments
      if (assignedChatbotIds && savedUser.id) {
        // Current assignments
        const currentIds = selectedUser?.assigned_chatbots?.map(b => b.id) || [];

        // Determine additions and removals
        const toAdd = assignedChatbotIds.filter(id => !currentIds.includes(id));
        const toRemove = currentIds.filter(id => !assignedChatbotIds.includes(id));

        // Execute changes
        await Promise.all([
          ...toAdd.map(botId => assignUserToChatbot(savedUser.id, botId)),
          ...toRemove.map(botId => removeUserFromChatbot(savedUser.id, botId))
        ]);

        if (toAdd.length > 0 || toRemove.length > 0) {
          console.log("Updated agent assignments");
        }
      }

      fetchUsers();
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
    <div>

      <PageHeader
        title="Team Management"
        description="Create and manage your team members and their agent assignments"
        breadcrumbItems={[
          { label: "Pages" },
          { label: "Team Management", href: "/admin/user" }
        ]}
      >
        <button
          onClick={() => handleOpenForm()}
          className="px-6 py-3 bg-slate-900 text-white font-inter font-medium rounded-lg hover:bg-black transition flex items-center gap-2 justify-center sm:justify-start"
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
          Add Team Member
        </button>
      </PageHeader>

      {/* Table */}
      <div className="mt-8">
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
        title={selectedUser ? "Edit User" : "Add Team Member"}
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
    </div >
  );
}

