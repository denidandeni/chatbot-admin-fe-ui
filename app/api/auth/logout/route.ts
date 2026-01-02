import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clear authentication cookies
 */
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear cookies
    response.cookies.set({
      name: 'access_token',
      value: '',
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set({
      name: 'refresh_token',
      value: '',
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
