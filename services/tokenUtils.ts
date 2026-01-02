/**
 * Utility functions untuk JWT token management
 */

import { DEV_CONFIG, isDevMode } from '@/config/dev';

export interface TokenPayload {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organization_id?: string;
}

export interface LoginResponse {
  message: string;
  token: TokenPayload;
  user: User;
}

/**
 * Decode JWT token tanpa verifikasi (untuk client-side)
 * PERINGATAN: Jangan gunakan untuk security-sensitive operations
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

/**
 * Cek apakah token masih valid (belum expired)
 */
export function isTokenValid(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;

  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  return Date.now() < expiryTime;
}

/**
 * Cek apakah token akan expired dalam waktu dekat (5 menit)
 */
export function isTokenExpiringSoon(token: string, minutesThreshold: number = 5): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  const thresholdTime = minutesThreshold * 60 * 1000; // Convert to milliseconds

  return Date.now() > (expiryTime - thresholdTime);
}

/**
 * Get token dari cookie via API route (client-side)
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token', {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
    return null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    console.log('🔄 Attempting to refresh access token...');
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      console.log('✅ Access token refreshed successfully');
      return true;
    } else {
      console.warn('⚠️ Token refresh failed (API), assuming static mode');
      return true; // Return true to prevent loops/errors in static mode
    }
  } catch (error) {
    console.warn('⚠️ Error refreshing token (Network), assuming static mode');
    return true; // Return true to prevent loops/errors in static mode
  }
}

/**
 * Get access token with automatic refresh if expired
 */
export async function getAccessTokenWithRefresh(): Promise<string | null> {
  try {
    // Try to get current token
    let token = await getAccessToken();

    if (!token) {
      console.warn('⚠️ No access token found, attempting refresh...');
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        token = await getAccessToken();
        if (token) {
          console.log('✅ Got new access token after refresh');
          return token;
        }
      }

      console.error('❌ Failed to get token even after refresh');
      return null;
    }

    // Check if token is expired or expiring soon
    if (!isTokenValid(token) || isTokenExpiringSoon(token)) {
      console.warn('⚠️ Access token expired or expiring soon, attempting refresh...');
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        token = await getAccessToken();
        if (token) {
          console.log('✅ Got new access token after refresh');
          return token;
        }
      }

      console.error('❌ Failed to refresh expired token');
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error in getAccessTokenWithRefresh:', error);
    return null;
  }
}

/**
 * Setup automatic token refresh interval
 * Checks token every minute and refreshes if expiring within 5 minutes
 */
let refreshIntervalId: NodeJS.Timeout | null = null;

export function setupTokenRefreshInterval() {
  // Clear existing interval if any
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }

  console.log('⏰ Setting up automatic token refresh interval');

  // Check token every minute
  refreshIntervalId = setInterval(async () => {
    try {
      const token = await getAccessToken();

      if (token && isTokenExpiringSoon(token, 5)) {
        console.log('⚠️ Token expiring soon, proactively refreshing...');
        await refreshAccessToken();
      }
    } catch (error) {
      console.error('Error in token refresh interval:', error);
    }
  }, 60 * 1000); // Check every minute

  return () => {
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
    }
  };
}

/**
 * Clear cookies (logout)
 */
export async function clearAuthCookies(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Error clearing cookies:', error);
  }
}

/**
 * Get logged in user from sessionStorage
 */
export function getLoggedInUser(): User | null {
  try {
    if (typeof window === 'undefined') return null;

    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
      console.warn('⚠️ No user data found in sessionStorage');
      return null;
    }

    const user = JSON.parse(userStr);

    // TEMPORARY WORKAROUND: Apply organization_id mapping if enabled
    if (isDevMode() && DEV_CONFIG.ENABLE_ORG_MAPPING && !user.organization_id) {
      console.warn('🔧 DEV MODE: Applying organization_id mapping');

      // Try to get org_id from mapping
      const mappedOrgId = DEV_CONFIG.USER_ORG_MAPPING[user.email];

      if (mappedOrgId) {
        user.organization_id = mappedOrgId;
        console.log('✅ Mapped organization_id from email:', mappedOrgId);
      } else if (DEV_CONFIG.DEFAULT_ORG_ID) {
        user.organization_id = DEV_CONFIG.DEFAULT_ORG_ID;
        console.log('✅ Using default organization_id:', DEV_CONFIG.DEFAULT_ORG_ID);
      }

      // Update sessionStorage with mapped org_id
      sessionStorage.setItem('user', JSON.stringify(user));
    }

    console.log('👤 Logged in user:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization_id: user.organization_id || 'NOT SET'
    });

    return user;
  } catch (error) {
    console.error('Error getting logged in user:', error);
    return null;
  }
}

/**
 * Get organization_id from logged in user
 */
export function getLoggedInUserOrganizationId(): string | null {
  const user = getLoggedInUser();
  const orgId = user?.organization_id || null;

  if (orgId) {
    console.log('🏢 User organization_id:', orgId);
  } else {
    console.warn('⚠️ User does not have organization_id');
  }

  return orgId;
}

/**
 * Check if current user is super admin
 * Super admin has role 'super_admin' or 'superadmin'
 */
export function isSuperAdmin(): boolean {
  const user = getLoggedInUser();
  if (!user) return false;

  const role = user.role?.toLowerCase();
  const isSuper = role === 'super_admin' || role === 'superadmin';

  console.log('🎭 Role check:', {
    role: user.role,
    isSuperAdmin: isSuper
  });

  return isSuper;
}

/**
 * Check if current user is admin (not super admin)
 * Admin has role 'admin' and should have organization_id
 */
export function isAdmin(): boolean {
  const user = getLoggedInUser();
  if (!user) return false;

  const role = user.role?.toLowerCase();
  const isAdminRole = role === 'admin';

  console.log('🎭 Admin check:', {
    role: user.role,
    isAdmin: isAdminRole,
    hasOrgId: !!user.organization_id
  });

  return isAdminRole;
}

/**
 * Debug function to check user data in sessionStorage
 * Can be called from browser console: window.debugUser()
 */
export function debugUserData() {
  console.group('🔍 User Data Debug Info');

  const userStr = sessionStorage.getItem('user');
  console.log('Raw sessionStorage value:', userStr);

  if (!userStr) {
    console.error('❌ No user data in sessionStorage!');
    console.log('💡 Try logging in again');
    console.groupEnd();
    return;
  }

  try {
    const user = JSON.parse(userStr);
    console.log('✅ Parsed user object:', user);
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🎭 Role:', user.role);
    console.log('🏢 Organization ID:', user.organization_id || '⚠️ NOT SET');
    console.log('🆔 User ID:', user.id);

    if (!user.organization_id) {
      console.warn('⚠️ WARNING: organization_id is missing!');
      console.log('This might be because:');
      console.log('1. You are logged in as super admin');
      console.log('2. Backend did not return organization_id');
      console.log('3. User account does not have organization assigned');
    }
  } catch (e) {
    console.error('❌ Failed to parse user data:', e);
  }

  console.groupEnd();
}

// Make it available in browser console
if (typeof window !== 'undefined') {
  (window as any).debugUser = debugUserData;
  console.log('💡 Debug helper available: Run window.debugUser() in console');
}

