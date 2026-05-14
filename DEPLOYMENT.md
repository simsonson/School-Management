# Jaiganesh project deployment

# Deployment Guide (Vercel + Render + MongoDB Atlas)

## 1) MongoDB Atlas

1. Create a cluster in Atlas.
2. Create a database user (Database Access).
3. In Network Access, allow:
   - `0.0.0.0/0` (quick start), or
   - Render outbound IPs (recommended for stricter security).
4. Copy connection string and set it as `MONGODB_URI` on Render.

## 2) Backend on Render

Create a **Web Service** from this repo:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Set environment variables:

- `PORT` = `5000` (Render may override automatically)
- `MONGODB_URI` = your Atlas URI
- `JWT_SECRET` = long random secret
- `CORS_ORIGINS` = `http://localhost:5173,https://<your-vercel-domain>`
- `CORS_ALLOW_VERCEL_PREVIEWS` = `true` (optional)
- OAuth vars (`GOOGLE_*`, `MICROSOFT_*`, `APPLE_*`, etc.)

Health check endpoint:

- `GET /api/health`

## 3) Frontend on Vercel

Create project from this repo:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:

- `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`

`frontend/vercel.json` already rewrites all routes to `index.html`.

## 4) OAuth callback URLs

In OAuth provider consoles, add **exact** redirect URIs:

- Google: `https://<your-vercel-domain>/auth/callback/google`
- Microsoft: `https://<your-vercel-domain>/auth/callback/microsoft`
- Apple: `https://<your-vercel-domain>/auth/callback/apple`

Also add localhost callbacks for local testing:

- `http://localhost:5173/auth/callback/google`
- `http://localhost:5173/auth/callback/microsoft`
- `http://localhost:5173/auth/callback/apple`

## 5) Post-deploy checklist

1. Open frontend and test normal login.
2. Test Google/Microsoft/Apple login.
3. Confirm API works from frontend (no CORS errors).
4. Confirm `https://<render-url>/api/health` returns `{ success: true, status: "ok" }`.
