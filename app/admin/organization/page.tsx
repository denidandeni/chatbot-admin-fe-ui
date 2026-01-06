"use client";

import OrganizationTable from "../../components/OrganizationTable";
import OrganizationForm from "../../components/OrganizationForm";
import SlideSheet from "../../components/SlideSheet";
import DeleteModal from "../../components/DeleteModal";
import AdminCredentialsModal from "../../components/AdminCredentialsModal";
import { useEffect, useState } from "react";
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  Organization,
  CreateOrganizationPayload,
  CreateOrganizationResponse,
} from "@/services/organization";
import { useToastContext } from "../../components/ToastProvider";
import { getLoggedInUser, isSuperAdmin } from "@/services/tokenUtils";
import PageHeader from "../../components/PageHeader";

export default function OrganizationPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<{ orgName: string; admin: any } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh trigger
  const { showToast } = useToastContext();

  // Load organizations
  useEffect(() => {
    console.log("🔄 useEffect triggered with refreshKey:", refreshKey);

    // Check if user is super admin based on role
    const userIsSuperAdmin = isSuperAdmin();
    setIsSuper(userIsSuperAdmin);

    const user = getLoggedInUser();
    console.log("Organization page - User info:", {
      role: user?.role,
      isSuperAdmin: userIsSuperAdmin,
      hasOrgId: !!user?.organization_id,
      orgId: user?.organization_id
    });

    fetchOrganizations();
  }, [refreshKey]); // Re-fetch when refreshKey changes

  // Log organizations whenever they change
  useEffect(() => {
    console.log("📊 Organizations state changed:", organizations.length, "items");
    if (organizations.length > 0) {
      console.log("📊 Organizations to render in table:", organizations.map(o => ({
        id: o.id,
        name: o.name,
        expiry_date: o.expiry_date,
        expired_date: o.expired_date,
      })));
    }
  }, [organizations]);

  const fetchOrganizations = async () => {
    try {
      setIsLoadingOrganizations(true);
      console.log("🔄 Fetching organizations... (refreshKey:", refreshKey, ")");
      const data = await getOrganizations();
      console.log("📋 Organizations data fetched:", data);
      if (data.length > 0) {
        console.log("📌 First organization:", data[0]);
        console.log("📸 First org profile_image_url:", data[0].profile_image_url);
        console.log("� First org profile_picture_url:", data[0].profile_picture_url);
        console.log("�📅 First org expiry_date:", data[0].expiry_date);
        console.log("📅 First org expired_date:", data[0].expired_date);
      }
      // Ensure data is an array and force new reference
      setOrganizations([...data]);
      console.log("✅ Organizations state updated, length:", data.length);
    } catch (error) {
      console.error("Error loading organizations:", error);
      setOrganizations([]);
      showToast("Failed to load organizations", "error");
    } finally {
      setIsLoadingOrganizations(false);
    }
  };

  const handleOpenForm = (organization?: Organization) => {
    setSelectedOrganization(organization || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedOrganization(null);
  };

  const handleRefreshOrganization = async () => {
    console.log("🔄 handleRefreshOrganization called");

    // Force re-fetch by incrementing refreshKey
    setRefreshKey(prev => {
      console.log("🔑 Setting refreshKey from", prev, "to", prev + 1);
      return prev + 1;
    });

    // Wait for backend and state to update
    console.log("⏳ Waiting 500ms for backend to complete...");
    await new Promise(resolve => setTimeout(resolve, 500));

    // If editing an organization, refresh its data too
    if (selectedOrganization?.id) {
      console.log("📌 Refreshing selected organization:", selectedOrganization.id);
      const updatedOrgs = await getOrganizations();
      console.log("📋 All organizations after refresh:", updatedOrgs);

      const updatedOrg = updatedOrgs.find((org: Organization) => org.id === selectedOrganization.id);
      if (updatedOrg) {
        console.log("✅ Found updated organization:", {
          id: updatedOrg.id,
          name: updatedOrg.name,
          profile_image_url: updatedOrg.profile_image_url,
          profile_picture_url: updatedOrg.profile_picture_url,
          expiry_date: updatedOrg.expiry_date,
        });
        // Create new object reference to trigger React re-render
        setSelectedOrganization({ ...updatedOrg });
        console.log("🎯 selectedOrganization updated");
      } else {
        console.warn("⚠️ Organization not found in updated list");
      }
    } else {
      console.log("ℹ️ No selected organization to refresh");
    }
  };

  const handleSubmitForm = async (data: CreateOrganizationPayload) => {
    try {
      if (selectedOrganization) {
        // Update existing organization
        console.log("📝 Updating organization:", selectedOrganization.id);
        await updateOrganization(selectedOrganization.id, data);
        showToast("Organization updated successfully", "success");

        // Refresh list and close form
        console.log("🔄 Refreshing organizations after update...");
        setRefreshKey(prev => prev + 1); // Trigger refresh
        console.log("✅ Refresh triggered");
        handleCloseForm();
      } else {
        // Create new organization
        const response = await createOrganization(data);

        // If admin was created, show credentials modal
        if (response.admin) {
          setAdminCredentials({
            orgName: response.organization.name,
            admin: response.admin,
          });

          // Also log to console for easy copy
          console.log("=".repeat(60));
          console.log("🎉 ORGANIZATION & ADMIN CREATED SUCCESSFULLY");
          console.log("=".repeat(60));
          console.log("Organization:", response.organization.name);
          console.log("Admin Name:", response.admin.name);
          console.log("Admin Email:", response.admin.email);
          if (response.admin.password) {
            console.log("Admin Password:", response.admin.password);
            console.log("⚠️  IMPORTANT: Save this password - it will not be shown again!");
          }
          console.log("=".repeat(60));
        } else {
          showToast("Organization created successfully", "success");
        }

        // Refresh list and close form
        console.log("🔄 Refreshing organizations after create...");
        setRefreshKey(prev => prev + 1); // Trigger refresh
        console.log("✅ Refresh triggered");
        handleCloseForm();
      }
    } catch (error: any) {
      console.error("Error saving organization:", error);
      console.error("Error response:", error?.response);
      console.error("Error response data:", error?.response?.data);
      console.error("Error response detail:", error?.response?.data?.detail);

      // Handle validation errors (422)
      let errorMessage = "Failed to save organization";

      if (error?.response?.status === 422) {
        // FastAPI validation error format
        const detail = error.response.data?.detail;
        console.log("📋 Validation errors:", detail);
        console.log("📋 Validation errors (JSON):", JSON.stringify(detail, null, 2));

        if (Array.isArray(detail)) {
          // Extract field errors
          const fieldErrors = detail.map((err: any) => {
            const field = err.loc?.[1] || err.loc?.[0] || 'field';
            return `${field}: ${err.msg}`;
          }).join(', ');
          errorMessage = `Validation error: ${fieldErrors}`;
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, "error");
      throw error;
    }
  };

  const handleDelete = (organization: Organization) => {
    setDeleteTarget(organization);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleteLoading(true);
      await deleteOrganization(deleteTarget.id);
      await fetchOrganizations();
      setDeleteTarget(null);
      showToast("Organization deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting organization:", error);
      showToast("Failed to delete organization", "error");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div>

      {/* Header */}
      <PageHeader
        title="Tenant Management"
        description={isSuper
          ? "Create and manage organizations"
          : "View your organization details"}
        breadcrumbItems={[
          { label: "Pages" },
          { label: "Organization", href: "/admin/organization" }
        ]}
      >
        {/* Only show Create button for super admin */}
        {isSuper && (
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
            Create New Organization
          </button>
        )}
      </PageHeader>

      {/* Table */}
      <OrganizationTable
        organizations={organizations}
        isLoading={isLoadingOrganizations}
        onEdit={isSuper ? handleOpenForm : undefined}
        onDelete={isSuper ? handleDelete : undefined}
        onRefresh={fetchOrganizations}
      />


      {/* Slide Sheet for Form */}
      <SlideSheet
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={selectedOrganization ? "Edit Organization" : "Create New Organization"}
        width="400px"
        orientation="right"
      >
        <OrganizationForm
          key={selectedOrganization?.id || 'new'}
          organization={selectedOrganization}
          isLoading={isFormOpen}
          onSubmit={handleSubmitForm}
          onClose={handleCloseForm}
          onRefresh={handleRefreshOrganization}
        />
      </SlideSheet>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        isLoading={isDeleteLoading}
        title="Delete Organization"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Admin Credentials Modal */}
      {adminCredentials && (
        <AdminCredentialsModal
          isOpen={true}
          onClose={() => {
            setAdminCredentials(null);
            handleCloseForm();
          }}
          organizationName={adminCredentials.orgName}
          admin={adminCredentials.admin}
        />
      )}
    </div>
  );
}
