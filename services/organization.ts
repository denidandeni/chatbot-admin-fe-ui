import { api } from "./api";
import { getLoggedInUserOrganizationId, isAdmin } from "./tokenUtils";

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  user_count?: number;
  chatbot_count?: number;
  profile_image_url?: string | null; // Frontend uses this
  profile_picture_url?: string | null; // Backend returns this
  tenant_name?: string | null;
  expiry_date?: string | null; // Frontend uses this
  expired_date?: string | null; // Backend returns this
  is_active?: boolean;
  current_plan_id?: string | null;
  current_duration_months?: number | null;
}

export interface CreateOrganizationPayload {
  name: string;
  description: string;
  tenant_name?: string;
  // subscription selection — backend should persist subscription state instead of expired_date
  plan_id?: string;
  duration_months?: number;
  // Auto-create admin fields
  auto_create_admin?: boolean;
  admin_name?: string;
  admin_email?: string;
  admin_password?: string;
}

export interface UpdateOrganizationPayload {
  name: string;
  description: string;
  tenant_name?: string;
  plan_id?: string;
  duration_months?: number;
}

export interface CreateOrganizationResponse {
  organization: Organization;
  admin?: {
    id: string;
    name: string;
    email: string;
    password?: string; // Only included if auto-generated
    role: string;
  };
  message?: string;
}

/**
 * Get all organizations
 * For admin (role='admin'): only return their organization
 * For super admin (role='super_admin'): return all organizations
 */
export async function getOrganizations(): Promise<Organization[]> {
  try {
    // Check role instead of just organization_id
    if (isAdmin()) {
      // Admin: No need to fetch organizations for user management page
      console.log("🔒 Admin user - skipping organization fetch for user management");
      return [];
    }

    // Super admin: Get all organizations
    console.log("🌟 Super admin - fetching all organizations");
    const response = await api.get("/api/admin/organizations");

    // Parse string response if needed
    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;

    // Handle nested structure: { status: 'success', data: { organizations: [...], total: 3 } }
    if (data && data.data && data.data.organizations && Array.isArray(data.data.organizations)) {
      console.log("Raw organizations from API:", data.data.organizations);
      // Normalize field naming
      const normalized = data.data.organizations.map((org: any) => {
        const normalizedOrg = { ...org };

        // Normalize profile field
        if (org.profile_picture_url && !org.profile_image_url) {
          normalizedOrg.profile_image_url = org.profile_picture_url;
        }

        // Normalize expiry date field - backend uses expired_date, frontend uses expiry_date
        if (org.expired_date !== undefined && org.expiry_date === undefined) {
          normalizedOrg.expiry_date = org.expired_date;
        }

        return normalizedOrg;
      });
      console.log("Normalized organizations:", normalized);
      return normalized;
    }

    // Check if data.data exists as array (nested structure)
    if (data && data.data && Array.isArray(data.data)) {
      // Normalize field naming
      const normalized = data.data.map((org: any) => {
        const normalizedOrg = { ...org };

        // Normalize profile field
        if (org.profile_picture_url && !org.profile_image_url) {
          normalizedOrg.profile_image_url = org.profile_picture_url;
        }

        // Normalize expiry date field
        if (org.expired_date !== undefined && org.expiry_date === undefined) {
          normalizedOrg.expiry_date = org.expired_date;
        }

        return normalizedOrg;
      });
      return normalized;
    }

    // Direct array response
    if (Array.isArray(data)) {
      const normalized = data.map((org: any) => {
        const normalizedOrg = { ...org };

        // Normalize profile field
        if (org.profile_picture_url && !org.profile_image_url) {
          normalizedOrg.profile_image_url = org.profile_picture_url;
        }

        // Normalize expiry date field
        if (org.expired_date !== undefined && org.expiry_date === undefined) {
          normalizedOrg.expiry_date = org.expired_date;
        }

        return normalizedOrg;
      });
      return normalized;
    }

    return [];
    return [];
  } catch (error: any) {
    // STATIC DEMO FALLBACK
    console.warn("API Error (getOrganizations), falling back to static mock data");
    return [
      {
        id: "static-org-123",
        name: "Demo Organization",
        description: "A static demo organization",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_count: 5,
        chatbot_count: 2
      }
    ];
  }
}

/**
 * Get single organization by ID
 * Used by admin to get their own organization
 */
export async function getOrganization(
  orgId: string
): Promise<Organization> {
  try {
    console.log("Fetching organization by ID:", orgId);
    const response = await api.get(`/api/admin/organizations/${orgId}`);

    // Parse string response if needed
    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;

    // Handle nested structure: { status: 'success', data: { organization: {...} } }
    if (data && data.data && data.data.organization) {
      const org = data.data.organization;
      console.log("📦 Organization from API (nested):", org);
      console.log("📸 profile_image_url in response:", org.profile_image_url);
      console.log("📸 profile_picture_url in response:", org.profile_picture_url);
      console.log("📅 expiry_date in response:", org.expiry_date);
      console.log("📅 expired_date in response:", org.expired_date);

      // Normalize: backend uses profile_picture_url, frontend uses profile_image_url
      if (org.profile_picture_url && !org.profile_image_url) {
        org.profile_image_url = org.profile_picture_url;
      }

      // Normalize: backend uses expired_date, frontend uses expiry_date
      if (org.expired_date !== undefined && org.expiry_date === undefined) {
        org.expiry_date = org.expired_date;
      }

      return org;
    }

    // Handle direct data structure
    if (data && data.data) {
      const org = data.data;
      console.log("📦 Organization from data:", org);
      console.log("📸 profile_image_url in response:", org.profile_image_url);
      console.log("📸 profile_picture_url in response:", org.profile_picture_url);
      console.log("📅 expiry_date in response:", org.expiry_date);
      console.log("📅 expired_date in response:", org.expired_date);

      // Normalize: backend uses profile_picture_url, frontend uses profile_image_url
      if (org.profile_picture_url && !org.profile_image_url) {
        org.profile_image_url = org.profile_picture_url;
      }

      // Normalize: backend uses expired_date, frontend uses expiry_date
      if (org.expired_date !== undefined && org.expiry_date === undefined) {
        org.expiry_date = org.expired_date;
      }

      return org;
    }

    // Direct response
    console.log("📦 Organization direct:", data);
    console.log("📸 profile_image_url in response:", data.profile_image_url);
    console.log("📸 profile_picture_url in response:", data.profile_picture_url);
    console.log("📅 expiry_date in response:", data.expiry_date);
    console.log("📅 expired_date in response:", data.expired_date);

    // Normalize: backend uses profile_picture_url, frontend uses profile_image_url
    if (data.profile_picture_url && !data.profile_image_url) {
      data.profile_image_url = data.profile_picture_url;
    }

    // Normalize: backend uses expired_date, frontend uses expiry_date
    if (data.expired_date !== undefined && data.expiry_date === undefined) {
      data.expiry_date = data.expired_date;
    }

    return data;
  } catch (error: any) {
    console.error("Error in getOrganization:", {
      orgId,
      status: error.response?.status,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Create new organization
 */
export async function createOrganization(
  payload: CreateOrganizationPayload
): Promise<CreateOrganizationResponse> {
  try {
    // Clean up payload - remove undefined/empty fields
    const cleanPayload: any = {
      name: payload.name,
      description: payload.description,
    };

    // Add optional fields only if they have values
    if (payload.tenant_name) {
      cleanPayload.tenant_name = payload.tenant_name;
    }

    if (payload.auto_create_admin !== undefined) {
      cleanPayload.auto_create_admin = payload.auto_create_admin;
    }

    // Only add admin fields if they have non-empty values
    if (payload.admin_name && payload.admin_name.trim() !== '') {
      cleanPayload.admin_name = payload.admin_name;
    }

    if (payload.admin_email && payload.admin_email.trim() !== '') {
      cleanPayload.admin_email = payload.admin_email;
    }

    if (payload.admin_password && payload.admin_password.trim() !== '') {
      cleanPayload.admin_password = payload.admin_password;
    }
    // Include subscription selection if provided
    if ((payload as any).plan_id) {
      cleanPayload.plan_id = (payload as any).plan_id;
    }
    if ((payload as any).duration_months !== undefined && (payload as any).duration_months !== null) {
      cleanPayload.duration_months = (payload as any).duration_months;
    }

    console.log("📤 Creating organization with payload:", cleanPayload);

    const response = await api.post("/api/admin/organizations", cleanPayload);

    console.log("📥 Create organization response:", response.data);

    // Parse string response if needed
    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;

    // Handle nested response structure
    if (data.data) {
      return data.data;
    }

    return data;
  } catch (error: any) {
    console.error("❌ Create organization error:", error);
    console.error("❌ Error response data:", error?.response?.data);
    console.error("❌ Error response status:", error?.response?.status);
    throw error;
  }
}

/**
 * Update organization
 */
export async function updateOrganization(
  orgId: string,
  payload: UpdateOrganizationPayload
): Promise<Organization> {
  try {
    // Clean up payload - remove undefined/empty fields
    const cleanPayload: any = {
      name: payload.name,
      description: payload.description,
    };

    // Add optional fields only if they have values
    if (payload.tenant_name && payload.tenant_name.trim() !== '') {
      cleanPayload.tenant_name = payload.tenant_name;
    }
    // Include plan/duration for updating subscription
    if ((payload as any).plan_id) {
      cleanPayload.plan_id = (payload as any).plan_id;
    }
    if ((payload as any).duration_months !== undefined && (payload as any).duration_months !== null) {
      cleanPayload.duration_months = (payload as any).duration_months;
    }

    console.log("📤 Updating organization with payload:", cleanPayload);

    const response = await api.put(
      `/api/admin/organizations/${orgId}`,
      cleanPayload
    );

    console.log("📥 Update organization response:", response.data);

    // Parse string response if needed
    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;

    // Handle nested response structure
    if (data.data) {
      return data.data;
    }

    return data;
  } catch (error: any) {
    console.error("❌ Update organization error:", error);
    console.error("❌ Error response data:", error?.response?.data);
    throw error;
  }
}

/**
 * Delete organization
 */
export async function deleteOrganization(orgId: string): Promise<string> {
  try {
    const response = await api.delete(`/api/admin/organizations/${orgId}`);
    // API returns string directly
    const message = typeof response.data === "string" ? response.data : "Organization deleted successfully";
    return message;
  } catch (error) {
    throw error;
  }
}

/**
 * Upload profile image for organization
 */
export async function uploadOrganizationProfile(
  orgId: string,
  file: File
): Promise<{ profile_image_url: string }> {
  try {
    console.log("📤 Starting upload for organization:", orgId);
    console.log("📁 File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + " MB"
    });

    // Validate file size (max 10MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size (10MB)`);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported. Please use JPG, PNG, GIF, or WebP.`);
    }

    const formData = new FormData();
    formData.append("file", file);

    console.log("🌐 Uploading to:", `/api/admin/organizations/${orgId}/upload-profile`);
    console.log("📦 FormData entries:", Array.from(formData.entries()).map(([key, value]) => ({
      key,
      value: value instanceof File ? `File: ${value.name}` : value
    })));

    const response = await api.post(
      `/api/admin/organizations/${orgId}/upload-profile`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 seconds timeout for file upload
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📊 Upload progress: ${percentCompleted}%`);
          }
        },
      }
    );

    console.log("✅ Upload response received:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    const responseData = typeof response.data === "string" ? JSON.parse(response.data) : response.data;

    console.log("📦 Full upload response:", responseData);

    // Backend returns: { status: 'success', message: '...', data: { profile_picture_url: '...' } }
    // Note: Backend uses profile_picture_url (not profile_image_url)
    if (responseData.data && responseData.data.profile_picture_url) {
      console.log("✅ Found profile_picture_url in nested data:", responseData.data.profile_picture_url);
      return { profile_image_url: responseData.data.profile_picture_url };
    }

    // Fallback for direct structure with profile_picture_url
    if (responseData.profile_picture_url) {
      console.log("✅ Found profile_picture_url in direct response:", responseData.profile_picture_url);
      return { profile_image_url: responseData.profile_picture_url };
    }

    // Legacy: Check for profile_image_url (old naming)
    if (responseData.data && responseData.data.profile_image_url) {
      console.log("✅ Found profile_image_url in nested data:", responseData.data.profile_image_url);
      return { profile_image_url: responseData.data.profile_image_url };
    }

    if (responseData.profile_image_url) {
      console.log("✅ Found profile_image_url in direct response:", responseData.profile_image_url);
      return { profile_image_url: responseData.profile_image_url };
    }

    console.error("❌ Profile URL not found in response. Available keys:", Object.keys(responseData.data || responseData));
    throw new Error("Profile image URL not found in response");
  } catch (error: any) {
    console.error("❌ Upload organization profile failed:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      isNetworkError: error.message === 'Network Error',
      isTimeout: error.code === 'ECONNABORTED',
    });

    // Provide more helpful error messages
    if (error.message === 'Network Error') {
      throw new Error('Network error: Unable to connect to server. Please check your internet connection or try again later.');
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timeout: The file is taking too long to upload. Please try with a smaller file.');
    }

    if (error.response?.status === 413) {
      throw new Error('File too large: The server rejected the file because it\'s too large.');
    }

    if (error.response?.status === 415) {
      throw new Error('Unsupported file type: Please use JPG, PNG, GIF, or WebP images.');
    }

    if (error.response?.status === 404) {
      throw new Error('Endpoint not found: The upload endpoint may not be available on the backend.');
    }

    throw error;
  }
}

/**
 * Extend organization expiry date
 */
export async function extendOrganization(
  orgId: string,
  expiryDate: string
): Promise<Organization> {
  try {
    const response = await api.put(
      `/api/admin/organizations/${orgId}/extended`,
      { expiry_date: expiryDate }
    );

    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    return data;
  } catch (error) {
    throw error;
  }
}

