# JWT Authentication Flow

## Overview
Sistem authentication menggunakan JWT dengan HTTP-only cookies untuk keamanan maksimal. Token disimpan di server-side cookies dan tidak bisa diakses dari JavaScript (kecuali user info).

## Flow Diagram

```
User Login
    ↓
[Frontend] POST /api/auth/login (email, password)
    ↓
[Next.js API Route] Validasi & Forward ke Backend FastAPI
    ↓
[FastAPI] POST /api/users/login → Return token
    ↓
[Next.js API Route] Simpan token ke HTTP-only cookie
    ↓
[Frontend] Redirect ke /admin
    ↓
[Middleware] Validasi token dari cookie
    ↓
[API Calls] Token otomatis ditambahkan ke Authorization header
```

## File Structure

### Client-side Services
- `services/auth.ts` - Login, logout, refresh token functions
- `services/api.ts` - Axios instance dengan interceptor untuk token
- `services/tokenUtils.ts` - Token decode, validation, utilities

### Next.js API Routes
- `app/api/auth/login/route.ts` - Handle login & set token cookie
- `app/api/auth/token/route.ts` - Get token dari cookie
- `app/api/auth/refresh/route.ts` - Refresh expired token
- `app/api/auth/logout/route.ts` - Clear cookies

### Pages & Components
- `app/login/page.tsx` - Login page
- `app/admin/page.tsx` - Protected admin dashboard
- `app/components/ProtectedRoute.tsx` - Protected route wrapper

### Server-side Protection
- `middleware.ts` - Route protection & auto-redirect

## Token Storage

### ✅ HTTP-only Cookie (Secure)
- `access_token`: Token JWT untuk API calls
- Tidak bisa diakses dari JavaScript
- Otomatis dikirim dengan request
- Protection dari XSS attacks

### ⚠️ Regular Cookie (For UX)
- `user`: User info (name, email, role)
- Bisa diakses dari JavaScript
- Untuk display user info di UI
- **Jangan simpan sensitive data di sini**

### ℹ️ SessionStorage (Temporary)
- User data untuk session saja
- Clear otomatis saat tab ditutup
- Backup data jika cookie belum siap

## API Response Format

Backend return token seperti ini:
```json
{
  "message": "Login berhasil",
  "token": {
    "access_token": "eyJhbGc...",
    "token_type": "bearer",
    "expires_in": 1800
  },
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

## How It Works

### 1. Login Process
```typescript
// User login
const result = await loginRequest({ email, password });
// ↓
// Frontend hits /api/auth/login
// ↓
// API route sends to FastAPI backend
// ↓
// Backend returns token
// ↓
// API route saves token to HTTP-only cookie
// ↓
// User data saved to sessionStorage
// ↓
// Redirect to /admin
```

### 2. Protected Routes
```typescript
// Access /admin
// ↓
// Middleware checks for access_token cookie
// ↓
// If no token → redirect to /login
// ↓
// If token exists → allow access
```

### 3. API Calls
```typescript
// Make API request
const res = await api.get('/api/chatbot');
// ↓
// Interceptor gets token from cookie
// ↓
// Adds Authorization: Bearer {token} header
// ↓
// Sends request to backend
```

### 4. Logout Process
```typescript
// User clicks logout
await logoutRequest();
// ↓
// Clears cookies
// ↓
// Redirects to /login
```

## Security Features

✅ **HTTP-only Cookies**: Token tidak bisa diakses via JavaScript  
✅ **SameSite Strict**: Protection dari CSRF attacks  
✅ **Secure Flag**: Cookie hanya dikirim via HTTPS (production)  
✅ **Server-side Validation**: Middleware melindungi routes  
✅ **Auto Token Management**: Refreshing & expiration handling  
✅ **No localStorage**: Aman dari XSS attacks  

## Backend Integration

Backend FastAPI harus:

1. **Accept login request**
```python
@app.post("/api/users/login")
async def login(email: str, password: str):
    # Validate credentials
    token = create_jwt_token(user_id, expiry=1800)
    return {
        "message": "Login berhasil",
        "token": {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 1800
        },
        "user": user_data
    }
```

2. **Accept token in Authorization header**
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.get("/api/chatbot")
async def get_chatbot(token: str = Depends(security)):
    # Verify token
    user = verify_token(token)
    return {...}
```

3. **Return proper HTTP status codes**
- 200: Success
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (no permission)
- 500: Server error

## Testing with Postman

1. **Login Request**
   - URL: `http://localhost:3000/api/auth/login`
   - Method: POST
   - Body: `{"email": "user@example.com", "password": "password"}`
   - Check Cookies tab untuk melihat token

2. **Get Token**
   - URL: `http://localhost:3000/api/auth/token`
   - Method: GET
   - Should return: `{"token": "eyJhbGc..."}`

3. **API Request with Token**
   - Token akan otomatis ditambahkan ke Authorization header
   - Atau manually: `Authorization: Bearer {token}`

## Troubleshooting

### Token tidak disimpan ke cookie
- Check di browser DevTools → Application → Cookies
- Ensure credentials: 'include' dalam fetch calls

### 401 Unauthorized error
- Token expired atau invalid
- Check token expiry time
- Try logout & login again

### CORS error
- Ensure backend accepts requests dari frontend origin
- Check CORS headers di backend

### Cookie tidak dikirim dengan request
- Ensure withCredentials: true di axios
- Check SameSite cookie policy
- Verify secure flag di production

## Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Token expiry times (configured in backend)
# Access token: 30 minutes
# Refresh token: 7 days (jika menggunakan)
```
