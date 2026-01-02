import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/refresh
 * Refresh access token menggunakan refresh token dari cookie
 */
export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found' },
        { status: 401 }
      );
    }
    
    // Call backend untuk refresh token
    const apiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `refresh_token=${refreshToken}`,
        },
        credentials: 'include',
      }
    );
    
    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 401 }
      );
    }
    
    const data = await apiResponse.json();
    
    // Set token ke cookie
    const response = NextResponse.json({ success: true });
    
    if (data.token?.access_token) {
      response.cookies.set({
        name: 'access_token',
        value: data.token.access_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      });
    }
    
    if (data.token?.refresh_token) {
      response.cookies.set({
        name: 'refresh_token',
        value: data.token.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }
    
    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
