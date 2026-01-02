import { NextRequest, NextResponse } from 'next/server';

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * POST /api/auth/login
 * Handle login dan simpan token ke HTTP-only cookie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LoginRequest;

    // Call backend login endpoint
    const apiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!apiResponse.ok) {
      const error = await apiResponse.json();
      return NextResponse.json(error, { status: apiResponse.status });
    }

    const data = await apiResponse.json();

    // Log untuk debugging
    console.log('🔐 Backend login response:', {
      message: data.message,
      user: data.user,
      has_token: !!data.token?.access_token
    });
    
    if (data.user) {
      console.log('👤 User info:', {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        organization_id: data.user.organization_id || 'NOT SET'
      });
    }

    // Ambil token dari response
    const accessToken = data.token?.access_token;
    const expiresIn = data.token?.expires_in || 1800; // default 30 menit

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token in response' },
        { status: 500 }
      );
    }

    // Create response
    const response = NextResponse.json({
      message: data.message,
      user: data.user,
    });

    // Simpan access token ke HTTP-only cookie
    response.cookies.set({
      name: 'access_token',
      value: accessToken,
      httpOnly: true, // Tidak bisa diakses dari JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only di production
      sameSite: 'strict',
      maxAge: expiresIn, // Sesuai dengan expires_in dari backend
      path: '/',
    });

    // Opsional: Simpan user info ke cookie (bukan sensitive data)
    response.cookies.set({
      name: 'user',
      value: JSON.stringify(data.user),
      httpOnly: false, // Bisa diakses dari JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresIn,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
