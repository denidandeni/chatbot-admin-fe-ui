import { api } from "./api";
import { getLoggedInUserOrganizationId, isAdmin, isSuperAdmin } from "./tokenUtils";

export interface Chatbot {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization_id?: string;
  organization_name?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  chatbots?: Chatbot[];
  assigned_chatbots?: Chatbot[];
  chatbot_count?: number;
  profile_image_url?: string | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  organization_id?: string;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  role: string;
  organization_id?: string;
}

/**
 * Get all users
 * For admin (role='admin'): use /api/admin/users/organization/{org_id}
 * For super admin (role='super_admin'): use /api/admin/all-users
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    let response;

    // Check role instead of just organization_id
    if (isAdmin()) {
      // Admin: Get users from their organization using specific endpoint
      const userOrgId = getLoggedInUserOrganizationId();

      if (userOrgId) {
        console.log("🔒 Admin user - fetching users from organization:", userOrgId);
        response = await api.get(`/api/admin/users/organization/${userOrgId}`);
      } else {
        console.warn("⚠️ Admin user without organization_id - returning empty list");
        return [];
      }
    } else if (isSuperAdmin()) {
      console.log("🌟 Super admin - fetching all users");
      response = await api.get("/api/admin/all-users");
    } else {
      console.warn("⚠️ Non-admin user attempted to fetch users - returning empty list");
      return [];
    }

    // Parse string response if needed
    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;

    console.log("Raw API response for users:", response.data);
    console.log("Parsed data:", data);

    let users: User[] = [];

    // Handle nested structure: { status: 'success', data: { users: [...], total: X } }
    if (data && data.data && data.data.users && Array.isArray(data.data.users)) {
      console.log("Users from data.data.users:", data.data.users);
      if (data.data.users.length > 0) {
        console.log("First user:", data.data.users[0]);
      }
      users = data.data.users;
    }
    // Check if data.data exists as array
    else if (data && data.data && Array.isArray(data.data)) {
      users = data.data;
    }
    else {
      users = Array.isArray(data) ? data : [];
    }

    console.log(`✅ Loaded ${users.length} user(s)`);

    return users;
    return users;
  } catch (error: any) {
    // STATIC DEMO FALLBACK
    console.warn("API Error (getAllUsers), falling back to static mock data");
    return [
      {
        id: "user-1",
        name: "Admin User",
        email: "admin@admin.com",
        role: "admin",
        organization_id: "static-org-123",
        organization_name: "Demo Organization",
        created_at: new Date().toISOString()
      },
      {
        id: "user-2",
        name: "John Doe",
        email: "john@example.com",
        role: "user",
        organization_id: "static-org-123",
        organization_name: "Demo Organization",
        created_at: new Date().toISOString()
      }
    ];
  }
}

/**
 * Get users by organization ID
 * Note: getAllUsers() now automatically uses this endpoint for admins
 * This function is kept for explicit calls if needed
 * 
 * IMPORTANT: This function always fetches fresh data from the backend
 * to avoid stale/cached user IDs
 */
export async function getUsersByOrganization(organizationId: string): Promise<User[]> {
  try {
    console.log("Fetching users for organization:", organizationId);

    // Add cache busting parameter to prevent browser caching stale data
    const timestamp = new Date().getTime();
    const response = await api.get(`/api/admin/users/organization/${organizationId}`, {
      params: { _t: timestamp },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    console.log("getUsersByOrganization raw response:", {
      status: response.status,
      data: response.data,
    });

    // Parse string response if needed
    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;

    console.log("getUsersByOrganization parsed data:", data);

    let users: User[] = [];

    // Handle nested structure: { status: 'success', data: { users: [...] } }
    if (data && data.data && data.data.users && Array.isArray(data.data.users)) {
      console.log("Returning users from data.data.users:", data.data.users);
      users = data.data.users;
    }
    // Check if data.data exists as array
    else if (data && data.data && Array.isArray(data.data)) {
      console.log("Returning users from data.data:", data.data);
      users = data.data;
    }
    else {
      users = Array.isArray(data) ? data : [];
      console.log("Returning users (default):", users);
    }

    // Validate that all users have valid IDs
    const usersWithoutId = users.filter(u => !u.id);
    if (usersWithoutId.length > 0) {
      console.error("⚠️ Some users are missing ID field:", usersWithoutId);
    }

    // Log sample user for debugging
    if (users.length > 0) {
      console.log("Sample user structure:", {
        id: users[0].id,
        email: users[0].email,
        role: users[0].role,
        allKeys: Object.keys(users[0])
      });
    }

    return users;
    return users;
  } catch (error: any) {
    console.warn("API Error (getUsersByOrganization), falling back to static mock data");
    return [
      {
        id: "user-1",
        name: "Admin User",
        email: "admin@admin.com",
        role: "admin",
        organization_id: organizationId || "static-org-123",
        organization_name: "Demo Organization",
        created_at: new Date().toISOString()
      },
      {
        id: "user-2",
        name: "John Doe",
        email: "john@example.com",
        role: "user",
        organization_id: organizationId || "static-org-123",
        organization_name: "Demo Organization",
        created_at: new Date().toISOString()
      }
    ];
  }
}

/**
export async function getUsers(): Promise<User[]> {
  try {
    const response = await api.get("/api/admin/users");
    
    // Parse string response if needed
    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    
    console.log("Raw API response for users:", response.data);
    console.log("Parsed data:", data);
    
    // Handle nested structure: { status: 'success', data: { users: [...], total: X } }
    if (data && data.data && data.data.users && Array.isArray(data.data.users)) {
      console.log("Users from data.data.users:", data.data.users);
      if (data.data.users.length > 0) {
        console.log("First user:", data.data.users[0]);
      }
      return data.data.users;
    }
    
    // Check if data.data exists as array
    if (data && data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error in getUsers:", error);
    throw error;
  }
}

/**
 * Get single user by ID
 */
export async function getUser(userId: string): Promise<User> {
  try {
    const response = await api.get(`/api/admin/users/${userId}`);
    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

/**
 * Create new user
 * Automatically sets organization_id from logged in user if not provided
 */
export async function createUser(payload: CreateUserPayload): Promise<User> {
  try {
    // Auto-set organization_id from logged in user if not provided
    const userOrgId = getLoggedInUserOrganizationId();
    const finalPayload = {
      ...payload,
      organization_id: payload.organization_id || userOrgId || undefined
    };

    console.log("Creating user with organization_id:", finalPayload.organization_id);

    const response = await api.post("/api/admin/users", finalPayload);
    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Update user
 * Automatically sets organization_id from logged in user if not provided
 */
export async function updateUser(
  userId: string,
  payload: UpdateUserPayload
): Promise<User> {
  try {
    // Auto-set organization_id from logged in user if not provided
    const userOrgId = getLoggedInUserOrganizationId();
    const finalPayload = {
      ...payload,
      organization_id: payload.organization_id || userOrgId || undefined
    };

    console.log("Updating user with organization_id:", finalPayload.organization_id);

    const response = await api.put(`/api/admin/users/${userId}`, finalPayload);
    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    return data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<string> {
  try {
    const response = await api.delete(`/api/admin/users/${userId}`);
    const message = typeof response.data === "string" ? response.data : "User deleted successfully";
    return message;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

/**
 * Assign user to chatbot
 */
export async function assignUserToChatbot(
  userId: string,
  chatbotId: string
): Promise<string> {
  try {
    console.log("Assigning user to chatbot:", { userId, chatbotId });
    const response = await api.post(
      `/api/admin/users/${userId}/chatbots/${chatbotId}`
    );
    console.log("Assign user SUCCESS response:", {
      status: response.status,
      data: response.data,
    });
    const message = typeof response.data === "string" ? response.data : "User assigned to chatbot successfully";
    return message;
  } catch (error: any) {
    console.error("Error assigning user to chatbot:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      userId,
      chatbotId,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
    });

    // Log detail error message dari backend
    if (error.response?.data) {
      console.error("Backend error detail:", JSON.stringify(error.response.data, null, 2));
    }

    throw error;
  }
}

/**
 * Remove user from chatbot
 */
export async function removeUserFromChatbot(
  userId: string,
  chatbotId: string
): Promise<string> {
  try {
    console.log("Removing user from chatbot:", { userId, chatbotId });
    const response = await api.delete(
      `/api/admin/users/${userId}/chatbots/${chatbotId}`
    );
    console.log("Remove user SUCCESS response:", {
      status: response.status,
      data: response.data,
    });
    const message = typeof response.data === "string" ? response.data : "User removed from chatbot successfully";
    return message;
  } catch (error: any) {
    console.error("❌ Remove user FAILED - Full error object:", error);
    console.error("Error removing user from chatbot:", {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
      name: error?.name,
      code: error?.code,
      userId,
      chatbotId,
      url: error?.config?.url,
      method: error?.config?.method,
      hasResponse: !!error?.response,
      hasRequest: !!error?.request,
    });

    // Log detail error message dari backend
    if (error?.response?.data) {
      console.error("Backend error detail:", JSON.stringify(error.response.data, null, 2));
    } else if (error?.request) {
      console.error("Request was made but no response received:", error.request);
    } else {
      console.error("Error setting up request:", error?.message);
    }

    throw error;
  }
}

/**
 * Get users for a chatbot
 */
export async function getUsersForChatbot(chatbotId: string): Promise<User[]> {
  try {
    console.log("=== getUsersForChatbot START ===");
    console.log("Fetching users for chatbot:", chatbotId);
    console.log("Endpoint:", `/api/admin/chatbots/${chatbotId}/users`);

    const response = await api.get(`/api/admin/chatbots/${chatbotId}/users`);

    console.log("getUsersForChatbot raw response:", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      dataType: typeof response.data,
    });

    // Log the exact JSON structure
    console.log("Exact response.data:", JSON.stringify(response.data, null, 2));

    // Parse string response if needed
    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;

    console.log("getUsersForChatbot parsed data:", data);
    console.log("data.data exists?", !!data?.data);
    console.log("data.data.users exists?", !!data?.data?.users);

    // Handle nested structure
    if (data && data.data && data.data.users && Array.isArray(data.data.users)) {
      console.log("✅ Returning users from data.data.users:", data.data.users);
      console.log("=== getUsersForChatbot END (path: data.data.users) ===");
      return data.data.users;
    }

    if (data && data.data && Array.isArray(data.data)) {
      console.log("✅ Returning users from data.data:", data.data);
      console.log("=== getUsersForChatbot END (path: data.data) ===");
      return data.data;
    }

    if (Array.isArray(data)) {
      console.log("✅ Returning users directly from data:", data);
      console.log("=== getUsersForChatbot END (path: data) ===");
      return data;
    }

    console.warn("⚠️ No matching data structure found, returning empty array");
    console.log("=== getUsersForChatbot END (empty) ===");
    return [];
  } catch (error: any) {
    console.error("❌ Error fetching users for chatbot:", {
      chatbotId,
      error,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
    });
    console.log("=== getUsersForChatbot END (error) ===");

    // Return empty array instead of throwing to prevent UI break
    return [];
  }
}

/**
 * Upload profile image for user
 */
export async function uploadUserProfile(
  userId: string,
  file: File
): Promise<{ profile_image_url: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      `/api/admin/users/${userId}/upload-profile`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    return data;
  } catch (error) {
    throw error;
  }
}

