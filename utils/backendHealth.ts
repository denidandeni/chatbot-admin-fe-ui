/**
 * Backend Health Check Utilities
 */

export async function checkBackendHealth(): Promise<{
  isAlive: boolean;
  url: string;
  error?: string;
}> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  try {
    // Try to reach backend health endpoint or root
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    return {
      isAlive: response.ok,
      url: backendUrl,
    };
  } catch (error: any) {
    console.error("Backend health check failed:", error);
    return {
      isAlive: false,
      url: backendUrl,
      error: error.message,
    };
  }
}

export async function testUploadEndpoint(orgId: string): Promise<{
  exists: boolean;
  url: string;
  error?: string;
}> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const endpoint = `${backendUrl}/api/admin/organizations/${orgId}/upload-profile`;
  
  try {
    // Try OPTIONS request to check if endpoint exists
    const response = await fetch(endpoint, {
      method: 'OPTIONS',
    });
    
    return {
      exists: response.status !== 404,
      url: endpoint,
    };
  } catch (error: any) {
    return {
      exists: false,
      url: endpoint,
      error: error.message,
    };
  }
}
