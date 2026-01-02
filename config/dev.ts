/**
 * Development Configuration
 * Temporary workarounds for development environment
 */

/**
 * TEMPORARY WORKAROUND: 
 * If backend doesn't send organization_id in login response,
 * you can enable this mapping to manually assign organization_id by email
 */
export const DEV_CONFIG = {
  // Set to true to enable manual organization_id mapping
  ENABLE_ORG_MAPPING: false,
  
  // Map user emails to organization IDs
  // Only used if ENABLE_ORG_MAPPING is true
  USER_ORG_MAPPING: {
    'admin1@example.com': 'c6283dbb-f21a-4184-b124-b18639ab83f8',
    'admin2@example.com': 'another-org-id',
    // Add more mappings as needed
  } as Record<string, string>,
  
  // Default organization_id for testing
  // Will be used if user email not found in mapping
  DEFAULT_ORG_ID: 'c6283dbb-f21a-4184-b124-b18639ab83f8',
};

/**
 * Check if dev workarounds are enabled
 */
export function isDevMode(): boolean {
  return process.env.NODE_ENV === 'development';
}
