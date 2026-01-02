"use client";

import { useState, useEffect } from "react";
import { User, getAllUsers, getUsersByOrganization, getUsersForChatbot, assignUserToChatbot, removeUserFromChatbot } from "@/services/user";
import { useToastContext } from "./ToastProvider";
import { getAccessToken, decodeToken, getLoggedInUser } from "@/services/tokenUtils";

interface UserAccessSectionProps {
  chatbotId: string;
  chatbotName?: string;
  organizationId?: string;
  autoAssignAdmins?: User[]; // List of admin users to auto-assign
}

export default function UserAccessSection({
  chatbotId,
  chatbotName = "Chatbot",
  organizationId: propOrganizationId,
  autoAssignAdmins = [],
}: UserAccessSectionProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [allAssignedUsers, setAllAssignedUsers] = useState<User[]>([]); // Store ALL assigned users
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const { showToast } = useToastContext();

  // Get effective organization ID - use logged in user's org if chatbot doesn't have one
  const getEffectiveOrganizationId = (): string | undefined => {
    if (propOrganizationId) return propOrganizationId;
    
    // Fallback: if admin user, use their organization_id
    const loggedInUser = getLoggedInUser();
    if (loggedInUser?.role?.toLowerCase() === 'admin' && loggedInUser?.organization_id) {
      console.log("⚠️ Using admin's organization_id as fallback:", loggedInUser.organization_id);
      return loggedInUser.organization_id;
    }
    
    return propOrganizationId;
  };
  
  const organizationId = getEffectiveOrganizationId();

  // Get role immediately - ALWAYS use sessionStorage for most up-to-date value
  const getUserRole = (): string => {
    // ALWAYS check sessionStorage first (most reliable)
    const user = getLoggedInUser();
    const roleFromStorage = user?.role?.toLowerCase() || "";
    
    // Use state as fallback only if sessionStorage is empty
    if (roleFromStorage) {
      return roleFromStorage;
    }
    
    return currentUserRole || "";
  };

  useEffect(() => {
    console.log("=== UserAccessSection MOUNTED/UPDATED ===");
    console.log("Props:", { 
      chatbotId, 
      chatbotName,
      organizationId 
    });
    
    // Get current logged in user for comparison
    const loggedInUser = getLoggedInUser();
    console.log("🔍 DETAILED USER & ORG CHECK:");
    console.log("Logged in user:", {
      email: loggedInUser?.email,
      role: loggedInUser?.role,
      organization_id: loggedInUser?.organization_id
    });
    console.log("Chatbot organizationId prop:", organizationId);
    console.log("Effective organizationId:", getEffectiveOrganizationId());
    
    // Check if organizationId matches logged in user
    if (loggedInUser?.organization_id && organizationId) {
      const match = loggedInUser.organization_id === organizationId;
      console.log(`${match ? '✅' : '❌'} Organization comparison:`, {
        userOrgId: loggedInUser.organization_id,
        chatbotOrgId: organizationId,
        typesMatch: typeof loggedInUser.organization_id === typeof organizationId,
        exactMatch: match,
        userOrgType: typeof loggedInUser.organization_id,
        chatbotOrgType: typeof organizationId
      });
    } else {
      console.warn("⚠️ Missing organization_id:", {
        userHasOrgId: !!loggedInUser?.organization_id,
        chatbotHasOrgId: !!organizationId,
        userOrgValue: loggedInUser?.organization_id,
        chatbotOrgValue: organizationId
      });
    }
    
    fetchCurrentUserRole();
    fetchData();
  }, [chatbotId, organizationId]); // Only depend on props, not state
  
  // Separate effect for debug function
  useEffect(() => {
    // Make debug function available in console
    if (typeof window !== 'undefined') {
      (window as any).debugUserAccess = () => {
        const role = getUserRole();
        console.group('🔍 UserAccessSection Debug');
        console.log('Current User Role (state):', currentUserRole);
        console.log('Current User Role (computed):', role);
        console.log('Chatbot Organization ID:', organizationId);
        console.log('All Assigned Users:', allAssignedUsers);
        console.log('Available Users:', allUsers);
        
        console.log('\n--- Button State Analysis ---');
        allAssignedUsers.forEach(user => {
          const loggedInUser = getLoggedInUser();
          const userOrgIdFromSession = loggedInUser?.organization_id;
          const isFromLoggedInUserOrg = userOrgIdFromSession && user.organization_id === userOrgIdFromSession;
          const isSuperAdmin = role === 'super_admin' || role === 'superadmin';
          const isAdmin = role === 'admin';
          // CORRECT: Admin can remove (if same org), Superadmin cannot (read-only)
          const canRemove = isAdmin && isFromLoggedInUserOrg && !isSuperAdmin;
          
          console.log(`\nUser: ${user.name}`);
          console.log(`  - User Org: ${user.organization_id}`);
          console.log(`  - Logged In User Org: ${userOrgIdFromSession}`);
          console.log(`  - isFromLoggedInUserOrg: ${isFromLoggedInUserOrg}`);
          console.log(`  - isSuperAdmin: ${isSuperAdmin}`);
          console.log(`  - isAdmin: ${isAdmin}`);
          console.log(`  - canRemove: ${canRemove} ${canRemove ? '✅' : '❌'}`);
        });
        
        console.groupEnd();
      };
      console.log('💡 Debug available: Run window.debugUserAccess() in console');
    }
  }, []); // Run once on mount

  const fetchCurrentUserRole = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        const decoded = decodeToken(token);
        console.log("🔐 Current user decoded token:", decoded);
        console.log("🔐 Current user role (raw):", decoded?.role);
        const role = decoded?.role?.toLowerCase() || "";
        setCurrentUserRole(role);
        console.log("🔐 Current user role (processed/lowercase):", role);
        console.log("🔐 Is Superadmin:", role === 'super_admin' || role === 'superadmin');
        console.log("🔐 Is Admin:", role === 'admin');
      } else {
        console.warn("⚠️ No access token found, trying getLoggedInUser()...");
        // Fallback: try to get from sessionStorage
        const user = getLoggedInUser();
        if (user?.role) {
          const role = user.role.toLowerCase();
          setCurrentUserRole(role);
          console.log("🔐 Got role from sessionStorage:", role);
        } else {
          console.error("❌ Cannot get user role from anywhere!");
        }
      }
    } catch (error) {
      console.error("Error fetching current user role:", error);
      // Try fallback
      try {
        const user = getLoggedInUser();
        if (user?.role) {
          const role = user.role.toLowerCase();
          setCurrentUserRole(role);
          console.log("🔐 Fallback: Got role from sessionStorage:", role);
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    console.log("=== UserAccessSection fetchData START ===");
    console.log("chatbotId:", chatbotId);
    console.log("organizationId:", organizationId);
    
    let assignedUsersData: User[] = [];
    let availableUsersData: User[] = [];
    
    try {
      // Step 1: Fetch users assigned to this chatbot
      // Endpoint: GET /api/admin/chatbots/{chatbot_id}/users
      console.log("Step 1: Fetching assigned users...");
      console.log("Calling getUsersForChatbot with chatbotId:", chatbotId);
      
      assignedUsersData = await getUsersForChatbot(chatbotId);
      
      console.log("✅ Assigned users received:", assignedUsersData);
      console.log("Assigned users count:", assignedUsersData.length);
      
      // Store ALL assigned users (for display and checking)
      setAllAssignedUsers(assignedUsersData);
      
    } catch (error) {
      console.error("❌ Error in Step 1 (fetching assigned users):", error);
      // Continue to next step even if this fails
      setAllAssignedUsers([]);
    }
    
    try {
      // Step 2: Fetch available users based on organization
      // Endpoint: GET /api/admin/users (filtered by organization_id on frontend)
      // OR: GET /api/admin/users/organization/{organizationId}
      
      if (organizationId) {
        // If organization is selected, fetch users from that organization
        console.log("Step 2: Fetching users by organization:", organizationId);
        availableUsersData = await getUsersByOrganization(organizationId);
        console.log("✅ Users from organization received:", availableUsersData);
        console.log("Available users count:", availableUsersData.length);
      } else {
        // If no organization selected, fetch all users
        console.log("Step 2: No organization selected, fetching all users");
        availableUsersData = await getAllUsers();
        console.log("✅ All users received:", availableUsersData);
        console.log("All users count:", availableUsersData.length);
      }
      
      setAllUsers(availableUsersData);
      
    } catch (error) {
      console.error("❌ Error in Step 2 (fetching available users):", error);
      setAllUsers([]);
    }
    
    // For backward compatibility, also set assignedUsers (filtered by organization)
    const filteredAssignedUsers = organizationId
      ? assignedUsersData.filter(user => user.organization_id === organizationId)
      : assignedUsersData;
    
    console.log("All assigned users data:", assignedUsersData);
    console.log("Filtered assigned users for display:", filteredAssignedUsers);
    console.log("=== UserAccessSection fetchData END ===");
    
    setAssignedUsers(filteredAssignedUsers);
    setLoading(false);
  };

  // Auto-assign admins when provided and chatbot has no assigned users yet
  useEffect(() => {
    if (autoAssignAdmins.length > 0 && allAssignedUsers.length === 0 && !loading) {
      console.log("🤖 Auto-assigning admins to chatbot:", autoAssignAdmins.map(a => ({
        email: a.email,
        id: a.id,
        allFields: a
      })));
      
      // Validate admin IDs before attempting assignment
      const validAdmins = autoAssignAdmins.filter(admin => {
        if (!admin.id) {
          console.error("❌ Admin missing ID:", admin);
          return false;
        }
        // Check if ID looks valid (UUID format)
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(admin.id);
        if (!isValidUUID) {
          console.error("❌ Admin has invalid UUID format:", admin.id, admin);
          return false;
        }
        return true;
      });
      
      if (validAdmins.length === 0) {
        console.error("❌ No valid admins to assign");
        showToast("No valid admins found to assign", "error");
        return;
      }
      
      if (validAdmins.length < autoAssignAdmins.length) {
        console.warn(`⚠️ Only ${validAdmins.length} out of ${autoAssignAdmins.length} admins are valid`);
      }
      
      // Assign each admin sequentially
      const assignAdmins = async () => {
        let successCount = 0;
        let failCount = 0;
        
        for (const admin of validAdmins) {
          try {
            console.log("➕ Auto-assigning admin:", admin.email, "ID:", admin.id, "to chatbot:", chatbotId);
            await assignUserToChatbot(admin.id, chatbotId);
            successCount++;
          } catch (err: any) {
            failCount++;
            console.error("❌ Failed to auto-assign admin:", admin.email, "ID:", admin.id, err);
            
            // Show specific error message
            if (err.response?.status === 404) {
              showToast(`Admin ${admin.email} not found in database. Data may be stale.`, "error");
            }
          }
        }
        
        // Refresh the assigned users list
        console.log("🔄 Refreshing assigned users after auto-assign");
        await fetchData();
        
        if (successCount > 0) {
          showToast(`Successfully assigned ${successCount} admin(s) to chatbot`, "success");
        }
        if (failCount > 0) {
          showToast(`Failed to assign ${failCount} admin(s). Please try manually.`, "warning");
        }
      };
      
      assignAdmins();
    }
  }, [autoAssignAdmins, allAssignedUsers, loading]);

  const handleAssignUser = async () => {
    if (!selectedUserId) {
      showToast("Please select a user", "warning");
      return;
    }

    // Check if user is already assigned
    if (allAssignedUsers.some((u) => u.id === selectedUserId)) {
      showToast("User is already assigned to this chatbot", "warning");
      return;
    }

    try {
      setAssignLoading(true);
      console.log("Attempting to assign user:", { 
        selectedUserId, 
        chatbotId,
        organizationId 
      });
      
      await assignUserToChatbot(selectedUserId, chatbotId);
      console.log("User assigned successfully, now fetching updated data...");
      showToast("User assigned to chatbot successfully", "success");
      setSelectedUserId("");
      
      // Wait a bit for backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchData();
      console.log("Data refreshed after assign");
    } catch (error: any) {
      console.error("Assign user error details:", {
        error,
        response: error?.response,
        data: error?.response?.data,
        status: error?.response?.status,
      });
      
      // Handle error - prioritize backend error messages
      let errorMessage = "Failed to assign user";
      
      // First, check if backend provides a detailed error message
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 403) {
        errorMessage = "Permission denied. You don't have access to assign users to this chatbot.";
      } else if (error?.response?.status === 404) {
        errorMessage = "User or chatbot not found";
      } else if (error?.response?.status === 401) {
        errorMessage = "Authentication required. Please login again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, "error");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string, userName?: string) => {
    // Confirm before removing
    const confirmed = window.confirm(
      `Are you sure you want to remove ${userName || 'this user'} from ${chatbotName}?\n\nThis action will revoke their access to this chatbot.`
    );
    
    if (!confirmed) {
      console.log("Remove cancelled by user");
      return;
    }
    
    try {
      console.log("=== REMOVE USER START ===");
      console.log("Attempting to remove user:", { 
        userId, 
        chatbotId,
        userName,
        organizationId 
      });
      
      const result = await removeUserFromChatbot(userId, chatbotId);
      console.log("✅ User removed successfully!");
      console.log("Remove result:", result);
      
      showToast("User removed from chatbot successfully", "success");
      
      // Wait a bit for backend to process
      console.log("Waiting 500ms before refreshing data...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("Now fetching updated user list...");
      await fetchData();
      console.log("=== REMOVE USER END ===");
    } catch (error: any) {
      console.error("❌ Remove user FAILED");
      console.error("Remove user error details:", {
        error,
        response: error?.response,
        data: error?.response?.data,
        status: error?.response?.status,
      });
      
      // Handle specific error codes - prioritize backend error messages
      let errorMessage = "Failed to remove user";
      
      // First, check if backend provides a detailed error message
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 403) {
        errorMessage = "Permission denied. You don't have access to remove users from this chatbot.";
      } else if (error?.response?.status === 404) {
        errorMessage = "User or chatbot not found";
      } else if (error?.response?.status === 401) {
        errorMessage = "Authentication required. Please login again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, "error");
      console.log("=== REMOVE USER END (ERROR) ===");
    }
  };

  const availableUsers = allUsers.filter(
    (user) => !allAssignedUsers.some((assigned) => assigned.id === user.id)
  );

  // Check if there are assigned users from other organizations
  const hasUsersFromOtherOrgs = organizationId && allAssignedUsers.some(
    (user) => user.organization_id !== organizationId
  );

  // Get users from other organizations
  const usersFromOtherOrgs = organizationId 
    ? allAssignedUsers.filter(user => user.organization_id !== organizationId)
    : [];

  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <h3 className="text-lg font-semibold font-inter text-gray-900 mb-4">
        User Access Management
      </h3>

      {!organizationId ? (
        <div className="flex flex-col items-center justify-center py-12 bg-yellow-50 border border-yellow-200 rounded-lg">
          <svg className="w-12 h-12 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-yellow-800 font-inter font-medium">
            Please select an organization first
          </p>
          <p className="text-xs text-yellow-600 mt-2 font-inter">
            User access management requires an organization to be selected
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-gray-500 font-inter">Loading user data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Organization Info */}
          {organizationId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-inter text-blue-800">
                  <strong>Note:</strong> Only showing users from the selected organization
                </p>
                <button
                  onClick={() => {
                    const role = getUserRole();
                    const loggedInUser = getLoggedInUser();
                    console.group('🐛 DEBUG INFO');
                    console.log('Logged in user:', loggedInUser);
                    console.log('Current role:', role);
                    console.log('Chatbot organizationId:', organizationId);
                    console.log('User organizationId:', loggedInUser?.organization_id);
                    console.log('Match:', loggedInUser?.organization_id === organizationId);
                    console.log('All assigned users:', allAssignedUsers);
                    console.groupEnd();
                    
                    alert(`Debug Info:
Role: ${role}
Logged in user org: ${loggedInUser?.organization_id}
Chatbot org: ${organizationId}
Match: ${loggedInUser?.organization_id === organizationId}
Check console for more details.`);
                  }}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Debug
                </button>
              </div>
            </div>
          )}

          {/* Warning for users from other organizations */}
          {hasUsersFromOtherOrgs && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-inter font-semibold text-orange-800 mb-1">
                    Warning: Users from different organization detected
                  </p>
                  <p className="text-xs font-inter text-orange-700">
                    Some assigned users belong to a different organization than the one currently selected. 
                    They are not shown in the list below but remain assigned to this chatbot.
                    Consider removing them if they should not have access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Assign User Section */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium font-inter text-gray-900 mb-4">
              Assign User to {chatbotName}
            </label>
            
            {/* Superadmin read-only warning */}
            {currentUserRole === 'superadmin' && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs font-inter text-yellow-800">
                  <strong>Note:</strong> Superadmin has read-only access. Please login as an organization admin to assign/unassign users.
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={assignLoading || availableUsers.length === 0 || currentUserRole === 'superadmin'}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {currentUserRole === 'superadmin'
                    ? "Superadmin cannot assign users (read-only)"
                    : availableUsers.length === 0
                      ? allUsers.length === 0
                        ? "No users found in this organization"
                        : "All users already assigned"
                      : "Select a user to assign"}
                </option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignUser}
                disabled={assignLoading || !selectedUserId || currentUserRole === 'superadmin'}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-inter font-medium text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {assignLoading ? "Assigning..." : "+ Assign User"}
              </button>
            </div>
          </div>

          {/* Assigned Users List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium font-inter text-gray-900">
                Assigned Users
              </label>
              <span className="text-xs font-inter px-3 py-1 bg-gray-200 text-gray-700 rounded-full">
                {allAssignedUsers.length} user{allAssignedUsers.length !== 1 ? "s" : ""}
              </span>
            </div>
            
            {(() => {
              console.log("Rendering assigned users list:", {
                allAssignedUsersCount: allAssignedUsers.length,
                assignedUsersCount: assignedUsers.length,
                allAssignedUsers,
                assignedUsers,
              });
              return null;
            })()}
            
            {allAssignedUsers.length === 0 ? (
              <div className="flex items-center justify-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500 italic font-inter">
                  No users assigned yet. Assign a user to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Show ALL assigned users, grouped by organization match */}
                {allAssignedUsers.map((user) => {
                  // Get current role (with fallback) - FIRST!
                  const role = getUserRole();
                  const loggedInUser = getLoggedInUser();
                  
                  console.log(`\n========================================`);
                  console.log(`🔍 CHECKING: ${user.name} (${user.email})`);
                  console.log(`========================================`);
                  
                  // Get organization IDs
                  const userOrgId = user.organization_id;
                  const loggedInUserOrgId = loggedInUser?.organization_id;
                  
                  console.log(`📊 Raw Data:`);
                  console.log(`  - User Org ID: "${userOrgId}"`);
                  console.log(`  - Logged In User Org ID: "${loggedInUserOrgId}"`);
                  console.log(`  - Chatbot Org ID: "${organizationId}"`);
                  console.log(`  - Current Role: "${role}"`);
                  
                  console.log(`\n🔬 Type Check:`);
                  console.log(`  - User Org ID type: ${typeof userOrgId}`);
                  console.log(`  - Logged In User Org ID type: ${typeof loggedInUserOrgId}`);
                  
                  // Simple direct comparison
                  const orgIdsMatch = userOrgId === loggedInUserOrgId;
                  
                  console.log(`\n✅ Direct Comparison:`);
                  console.log(`  - user.organization_id === loggedInUser.organization_id: ${orgIdsMatch}`);
                  console.log(`  - Both exist: ${!!userOrgId && !!loggedInUserOrgId}`);
                  
                  // Role checks
                  const isSuperAdmin = role === 'super_admin' || role === 'superadmin';
                  const isAdmin = role === 'admin';
                  
                  console.log(`\n🎭 Role Check:`);
                  console.log(`  - Is Admin: ${isAdmin}`);
                  console.log(`  - Is SuperAdmin: ${isSuperAdmin}`);
                  
                  // SIMPLE LOGIC: Admin can remove if user is from same org
                  let canRemove = false;
                  
                  if (isSuperAdmin) {
                    console.log(`\n❌ RESULT: SuperAdmin cannot remove (read-only)`);
                    canRemove = false;
                  } else if (!isAdmin) {
                    console.log(`\n❌ RESULT: Not admin role, cannot remove`);
                    canRemove = false;
                  } else if (!loggedInUserOrgId) {
                    console.log(`\n❌ RESULT: Admin missing organization_id`);
                    canRemove = false;
                  } else if (!userOrgId) {
                    // User doesn't have org_id - admin can remove them (they might be orphaned users)
                    console.log(`\n⚠️ RESULT: User has no organization_id, admin can remove`);
                    canRemove = true;
                  } else if (orgIdsMatch) {
                    console.log(`\n✅ RESULT: Admin + Same Org = CAN REMOVE!`);
                    canRemove = true;
                  } else {
                    console.log(`\n❌ RESULT: Different organization`);
                    canRemove = false;
                  }
                  
                  console.log(`\n🎯 FINAL DECISION: canRemove = ${canRemove}`);
                  console.log(`========================================\n`);
                  
                  // For backward compatibility
                  const isFromChatbotOrg = !organizationId || user.organization_id === organizationId;
                  const isFromLoggedInUserOrg = orgIdsMatch;
                  const isFromCurrentOrg = isFromChatbotOrg || isFromLoggedInUserOrg;
                  
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 border rounded-lg hover:border-gray-300 transition shadow-sm ${
                        isFromCurrentOrg 
                          ? 'bg-white border-gray-200' 
                          : 'bg-orange-50 border-orange-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium font-inter text-gray-900">
                            {user.name}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded font-inter ${
                            isFromCurrentOrg
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-200 text-orange-800'
                          }`}>
                            {isFromCurrentOrg ? 'Current Org' : 'Different Org'}
                          </span>
                          {/* Debug badge */}
                          <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                            canRemove
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}>
                            {canRemove ? '✓ Can Remove' : '✗ Cannot Remove'}
                          </span>
                          {/* Debug button per user */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const debugInfo = `
🔍 DEBUG INFO for ${user.name}
========================================
📧 Email: ${user.email}
🏢 User Org ID: ${user.organization_id || 'NULL'}
🏢 Your Org ID: ${loggedInUser?.organization_id || 'NULL'}
🎭 Your Role: ${role || 'NULL'}

✅ Match: ${user.organization_id === loggedInUser?.organization_id}
✅ Is Admin: ${role === 'admin'}
✅ Not SuperAdmin: ${role !== 'super_admin' && role !== 'superadmin'}

🎯 CAN REMOVE: ${canRemove ? 'YES ✅' : 'NO ❌'}
========================================`;
                              
                              alert(debugInfo);
                              console.log(debugInfo);
                            }}
                            className="text-xs px-1.5 py-0.5 bg-gray-600 text-white rounded hover:bg-gray-700"
                            title="Debug this user"
                          >
                            🐛
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                          {user.role && (
                            <p className="text-xs text-gray-400">Role: {user.role}</p>
                          )}
                          <p className="text-xs text-gray-400">|</p>
                          <p className="text-xs text-gray-400" title={user.organization_id}>Org: {user.organization_id?.substring(0, 8)}...</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveUser(user.id, user.name)}
                        disabled={!canRemove}
                        title={
                          !canRemove && !isFromCurrentOrg 
                            ? 'Can only remove users from your organization' 
                            : ''
                        }
                        className={`ml-4 px-4 py-2 text-sm border rounded-lg transition font-inter font-medium whitespace-nowrap ${
                          canRemove
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 cursor-pointer'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                        }`}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
