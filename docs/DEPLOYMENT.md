# Deployment Guide

## Prerequisites
- Supabase account (PostgreSQL)
- Upstash account (Redis)
- Cloudflare account (R2 bucket created)
- Vercel account
- Railway account
- GitHub repo connected to both Vercel and Railway

## Step 1 — Environment variables

### Backend (Railway)
Set these in Railway dashboard → Variables:
DATABASE_URL=           → Supabase pooled connection string (port 6543)
DIRECT_URL=             → Supabase direct connection string (port 5432)
REDIS_URL=              → Upstash Redis connection string
JWT_SECRET=             → Random 64-char string (use: openssl rand -hex 32)
JWT_REFRESH_SECRET=     → Different random 64-char string
JWT_EXPIRY=             → 15m
JWT_REFRESH_EXPIRY=     → 7d
R2_ACCOUNT_ID=          → Cloudflare account ID
R2_ACCESS_KEY_ID=       → R2 API token access key
R2_SECRET_ACCESS_KEY=   → R2 API token secret
R2_BUCKET_NAME=         → Your R2 bucket name
R2_PUBLIC_URL=          → Public R2 bucket URL
FRONTEND_URL=           → Your Vercel frontend URL (for CORS)
NODE_ENV=               → production

### Frontend (Vercel)
Set these in Vercel dashboard → Settings → Environment Variables:
NEXT_PUBLIC_API_URL=    → Your Railway backend URL
NODE_ENV=               → production

## Step 2 — Database setup
# Get connection strings from:
# Supabase dashboard → Project → Settings → Database → Connection string
# Copy both "Transaction" (port 6543) and "Direct" (port 5432) strings
# Run from apps/api locally with production DATABASE_URL set
# Verify schema.prisma has both:
# url = env("DATABASE_URL")      ← port 6543
# directUrl = env("DIRECT_URL")  ← port 5432
# Then run:
pnpm prisma migrate deploy
pnpm prisma db seed

## Step 3 — Backend deploy (Railway)
1. Connect GitHub repo to Railway
2. Set root directory to apps/api
3. Set build command: pnpm install && pnpm build
4. Set start command: pnpm start:prod
5. Add all backend environment variables
6. Deploy

## Step 4 — Frontend deploy (Vercel)
1. Connect GitHub repo to Vercel
2. Set root directory to apps/web
3. Set build command: pnpm build
4. Set output directory: .next
5. Add NEXT_PUBLIC_API_URL environment variable
6. Deploy

## Step 5 — Cloudflare R2 setup
1. Create bucket in Cloudflare dashboard
2. Set CORS policy on bucket:
   AllowedOrigins: [your frontend URL, your backend URL]
   AllowedMethods: [GET, PUT, POST]
   AllowedHeaders: [*]
3. Create API token with R2 read/write permissions
4. Add credentials to Railway environment variables

## Step 6 — Verify deployment
[ ] POST /auth/register returns 201
[ ] POST /auth/login returns access token and sets cookie
[ ] GET /services returns service list
[ ] GET /courses returns course list (check Redis cache hit on second request)
[ ] POST /contact saves message to DB
[ ] Admin login redirects to /admin dashboard
[ ] R2 presigned URL upload works end-to-end

## Rollback procedure
Backend: Railway → Deployments → click previous deployment → Redeploy
Frontend: Vercel → Deployments → click previous deployment → Promote to Production
Database: Supabase dashboard → Settings → Database → copy connection strings if rotated