# FastAPI Integration Guide

## 🔄 Perubahan yang Telah Dilakukan

### 1. **Login Integration** ✅
Sudah terintegrasi dengan endpoint FastAPI: `POST /api/users/login`

**Flow:**
1. User submit form di `/app/login/page.tsx`
2. Request dikirim ke Next.js API route: `/api/auth/login/route.ts`
3. API route forward request ke FastAPI: `POST /api/users/login`
4. Response dari FastAPI berisi:
   ```json
   {
     "message": "string",
     "token": {
       "access_token": "string",
       "token_type": "string",
       "expires_in": 0
     },
     "user": {
       "id": "uuid",
       "email": "user@example.com",
       "name": "string",
       "role": "string",
       "organization_id": "uuid"
     }
   }
   ```
5. Token disimpan di HTTP-only cookie
6. User info disimpan di cookie biasa untuk akses client-side
7. Redirect ke `/admin`

### 2. **Get Chatbots Integration** ✅
Sudah terintegrasi dengan endpoint FastAPI: `GET /api/users/chatbots`

**Flow:**
1. Component call `getChatbots()` dari `/services/chatbot.ts`
2. Request ke FastAPI: `GET /api/users/chatbots` dengan Bearer token
3. Response dari FastAPI:
   ```json
   {
     "status": "string",
     "data": [
       {
         "id": "uuid",
         "name": "string",
         "description": "string",
         "personality": "string",
         "model": "llama3.2-3b",
         "organization_id": "string",
         "created_at": "string",
         "updated_at": "string",
         "contexts": [],
         "connector_contexts": []
       }
     ]
   }
   ```
4. Data chatbot ditampilkan di UI

### 3. **Authentication Flow**

**Token Management:**
- Access token disimpan di HTTP-only cookie (secure)
- Token otomatis di-attach ke setiap request via interceptor di `services/api.ts`
- Token diambil via `/api/auth/token` endpoint untuk client-side requests

**Protected Routes:**
- Middleware di `middleware.ts` check cookie `access_token`
- Jika tidak ada token → redirect ke `/login`
- Jika sudah ada token di `/login` → redirect ke `/admin`

## 📝 File yang Diubah

1. **`/app/login/page.tsx`**
   - ✅ Uncomment import `loginRequest`
   - ✅ Replace static login dengan real API call
   - ✅ Handle error response dari FastAPI (422 validation error)

2. **`/services/chatbot.ts`**
   - ✅ Update `getChatbots()` untuk use endpoint `/api/users/chatbots`
   - ✅ Remove filtering by organization_id (handled by backend)
   - ✅ Add new fields: `contexts` dan `connector_contexts`

3. **`/.env.local`**
   - ✅ Fix URL dari `https://localhost:8000` → `http://localhost:8000`

## 🚀 Cara Testing

### 1. Jalankan FastAPI Backend
```bash
# Di terminal backend
uvicorn main:app --reload --port 8000
```

### 2. Jalankan Next.js Frontend
```bash
# Di terminal frontend
npm run dev
```

### 3. Test Login
1. Buka browser: `http://localhost:3000/login`
2. Input credentials yang valid di FastAPI
3. Klik "Sign In"
4. Jika berhasil → redirect ke `/admin`
5. Check browser DevTools:
   - Cookie `access_token` harus ada
   - Cookie `user` harus berisi user info

### 4. Test Get Chatbots
1. Setelah login, navigate ke chatbot page
2. Check Network tab di DevTools:
   - Request ke `/api/users/chatbots`
   - Header `Authorization: Bearer <token>`
   - Response data chatbot

## 🔍 Debugging

### Jika Login Gagal
```bash
# Check console untuk error detail
# Periksa Network tab → Response dari /api/auth/login
```

**Common Issues:**
- ❌ CORS error → Pastikan FastAPI allow origin `http://localhost:3000`
- ❌ 422 error → Check format email/password
- ❌ Connection refused → Pastikan FastAPI running di port 8000

### Jika Get Chatbots Gagal
```bash
# Check console untuk error detail
# Periksa Network tab → Request headers harus ada Authorization
```

**Common Issues:**
- ❌ 401 Unauthorized → Token expired atau invalid
- ❌ Token tidak ter-attach → Check interceptor di `services/api.ts`
- ❌ Empty response → User belum punya chatbot

## 🔐 Security Notes

1. **HTTP-Only Cookies** ✅
   - Token tidak bisa diakses via JavaScript
   - Protected dari XSS attacks

2. **CORS Configuration**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`
   - Production: Update to use HTTPS

3. **Token Expiration**
   - Cookie maxAge sesuai dengan `expires_in` dari backend
   - Auto logout when token expired

## 📚 API Endpoints Used

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/users/login` | User authentication | ✅ Integrated |
| GET | `/api/users/chatbots` | Get user's chatbots | ✅ Integrated |
| POST | `/api/users/refresh` | Refresh access token | ⏳ TODO |
| POST | `/api/users/logout` | User logout | ⏳ TODO |

## ⏭️ Next Steps

1. **Implement Refresh Token**
   - Update `/api/auth/refresh/route.ts`
   - Handle token refresh in interceptor

2. **Implement Logout**
   - Update `/api/auth/logout/route.ts`
   - Clear all cookies

3. **Error Handling**
   - Better error messages untuk user
   - Retry logic untuk failed requests

4. **Loading States**
   - Add skeleton loading
   - Better UX during API calls
