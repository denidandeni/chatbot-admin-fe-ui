/**
 * Feature Flags Configuration
 * 
 * Toggle features on/off based on backend readiness
 */

export const FEATURES = {
  /**
   * API Keys Management in Edit Chatbot Form (SlideSheet)
   * Set to false - API Key management moved to dedicated page /admin/api-key
   * 
   * Endpoints required:
   * - POST /api/api-keys/ (with CORS enabled)
   * - GET /api/api-keys/?chatbot_id={id}
   * - DELETE /api/api-keys/{key_id}
   * 
   * Note: Use dedicated API Key Management page instead of SlideSheet section
   */
  API_KEYS: false, // Disabled - use /admin/api-key page instead
};
