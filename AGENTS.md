# Build Agent Instructions

## Purpose
This file controls build order and prevents Claude Code / Antigravity from
drifting, regenerating finished files, or making unilateral stack decisions.
Read this at the start of every session.

## Locked decisions (do not change mid-build)
- ORM: Prisma (not Drizzle)
- Database host: Supabase (Postgres only — see database rules below)
- Redis host: Upstash
- Frontend deploy: Vercel
- Backend deploy: Railway
- Package manager: pnpm

## Database rules (critical)
- Supabase is used as a dumb PostgreSQL host ONLY
- Never install @supabase/supabase-js — it is banned from this project
- Never use Supabase Auth, Supabase Storage, Supabase Realtime, or any Supabase SDK feature
- Connect exclusively via Prisma using two connection strings:
    DATABASE_URL  → port 6543 (PgBouncer pooled) — runtime queries
    DIRECT_URL    → port 5432 (direct) — migrations only
- Supabase dashboard is used only for: getting connection strings, inspecting data
- All auth, storage, caching, and API logic is built manually in this codebase

## Absolute rules
1. Never skip a step — each step depends on the previous
2. Never regenerate a file that already exists unless explicitly instructed
3. Always read the relevant CLAUDE.md before starting any module
4. When in doubt about a shared type, check /packages/shared first
5. Never install a new dependency without stating why
6. Never use `any` in TypeScript
7. Never add placeholder comments like "// implement later" — write real code
8. Never use Supabase SDK or any Supabase client library for any reason
9. All environment variables must be validated at startup via Joi — no raw process.env in code
10. All multi-table DB writes must use prisma.$transaction()

## Tool assignment
- Claude Code: Phases 1, 2, 3, 4, 6 (complex, interdependent, security-critical work)
- Antigravity: Phase 5 Steps 30–35 (frontend pages — independent, parallelizable)
- Claude Code: Phase 5 Steps 36–37 (dashboard + admin — depend on auth context)

## Claude Code session startup
Before writing any code each Claude Code session:
1. Read /CLAUDE.md
2. Read /AGENTS.md (this file)
3. Read the relevant app-level CLAUDE.md (/apps/web/CLAUDE.md or /apps/api/CLAUDE.md)
4. Read /apps/api/prisma/CLAUDE.md if touching DB layer
5. Check which steps below are marked complete [x]
6. Continue from the next unchecked step [ ]
7. Mark each step [x] immediately upon completion

## Antigravity setup (do once before starting Phase 5)
Add these as Knowledge Items in Antigravity dashboard before running any page agent:

1. "Project Stack"    → paste full contents of /CLAUDE.md
2. "Frontend Rules"   → paste full contents of /apps/web/CLAUDE.md
3. "API Reference"    → paste full contents of /docs/API.md
4. "Design System"    → paste this block:

   Fonts: Space Grotesk (headings), Inter (body)
   Colors:
     Background:     #FFFFFF
     Primary text:   #0F172A
     Accent:         #0B3C5D
     Secondary text: #334155
     Borders:        #E2E8F0
   Cards:            rounded-2xl border border-[#E2E8F0] shadow-sm
   Container:        max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
   Primary button:   bg-[#0B3C5D] text-white hover:bg-[#0a3554]
   Secondary button: border border-[#0B3C5D] text-[#0B3C5D] hover:bg-[#0B3C5D] hover:text-white

## Antigravity task prompt template
Use this structure for every page task in Antigravity Planning Mode:

  Context: Read Knowledge Items "Project Stack", "Frontend Rules",
           "Design System", "API Reference".

  Task: Build [PAGE NAME] at app/[route]/page.tsx

  Requirements:
  - Server component for data fetching
  - Fetch from [relevant API endpoint] using /lib/api/[wrapper].ts
  - Components: [list components needed]
  - Follow design system exactly — no custom colors, no inline styles
  - No placeholder content — use real consulting domain copy

  Do not touch any files outside app/[route]/ and components/[relevant folder]/

## Cross-tool consistency check (mandatory after Phase 5)
After Antigravity completes Steps 30–35, run this in Claude Code before Phase 6:

  "Review all files generated in apps/web/app/ during Phase 5.
  Check for: TypeScript errors, design system violations, missing
  lib/api/ usage, hardcoded colors, inline styles, or any `any` types.
  Fix all issues found. Do not regenerate files — patch only."

This is non-negotiable. Antigravity parallel agents do not share context
and will drift from conventions. Catch it here before deployment.

## Build order (follow exactly)

### Phase 1 — Foundation (Claude Code)
[x] Step 1:  Monorepo scaffold ← completed, do not regenerate
[x] Step 2:  Root .env.example with ALL required variables ← completed, do not regenerate
[x] Step 3:  Prisma schema ← completed, do not regenerate
[x] Step 4:  Shared package ← completed, do not regenerate
[x] Step 5:  NestJS main.ts ← completed, do not regenerate
[x] Step 6:  DatabaseModule ← completed, do not regenerate
[x] Step 7:  CacheModule ← completed, do not regenerate
[x] Step 8:  Config validation ← completed, do not regenerate

### Phase 2 — Authentication (Claude Code)
[x] Step 9:  AuthModule ← completed, do not regenerate
[x] Step 10: JWT strategy ← completed, do not regenerate
[x] Step 11: Refresh token strategy ← completed, do not regenerate
[x] Step 12: JwtAuthGuard ← completed, do not regenerate
[x] Step 13: RolesGuard ← completed, do not regenerate
[x] Step 14: @CurrentUser() decorator ← completed, do not regenerate
[x] Step 15: @Roles() decorator ← completed in Step 13, do not regenerate
[x] Step 16: @Public() decorator ← completed in Step 9, do not regenerate

### Phase 3 — Backend feature modules (Claude Code)
[x] Step 17: UsersModule ← completed, do not regenerate
[x] Step 18: ServicesModule ← completed, do not regenerate
[x] Step 19: CoursesModule ← completed, do not regenerate
[ ] Step 20: ConsultationsModule (user POST /consultations, GET /consultations/my, admin GET all + PATCH status)
[ ] Step 21: MessagesModule (public POST /contact, rate limited)
[ ] Step 22: UploadsModule (generate R2 presigned URL, client uploads directly to R2)
[ ] Step 23: AdminModule (aggregated admin-only endpoints with RolesGuard)

### Phase 4 — Frontend foundation (Claude Code)
[ ] Step 24: Tailwind config (custom colors, Space Grotesk + Inter fonts)
[ ] Step 25: shadcn/ui init with custom theme matching design system
[ ] Step 26: Root layout (Navbar, Footer, font setup, metadata)
[ ] Step 27: middleware.ts (protect /dashboard and /admin routes)
[ ] Step 28: /lib/api/ base fetch wrapper (error handling, token injection)
[ ] Step 29: /lib/api/ per-domain wrappers (auth, services, courses, consultations)

### Phase 5 — Frontend pages
[ ] Step 30: Home page → Antigravity Agent 1 (HeroSection, ServicesOverview, ClassesPreview, ProcessSection, TrustSection, CtaSection)
[ ] Step 31: Services page → Antigravity Agent 2 (3 service cards with detail, CTA per card)
[ ] Step 32: Courses page → Antigravity Agent 3 (course cards, level badge, duration, enrollment CTA)
[ ] Step 33: About page → Antigravity Agent 4 (bio, expertise, consulting philosophy)
[ ] Step 34: Contact/Booking page → Antigravity Agent 5 (form with service selector, confirmation message)
[ ] Step 35: Auth pages → Antigravity Agent 6 (login, register)
[ ] Step 35.5: Cross-tool consistency check → Claude Code (review + fix all Phase 5 output)
[ ] Step 36: Dashboard → Claude Code (user bookings, enrolled courses — requires auth context)
[ ] Step 37: Admin dashboard → Claude Code (manage services, courses, consultations, messages — requires auth + role guard context)

### Phase 6 — Deployment (Claude Code)
[ ] Step 38: apps/api/Dockerfile (multi-stage, production-optimized)
[ ] Step 39: docker-compose.yml (local dev: postgres + redis + api together)
[ ] Step 40: vercel.json (frontend config)
[ ] Step 41: .github/workflows/deploy.yml (CI/CD for Railway backend + Vercel frontend)
[ ] Step 42: Run prisma migrate deploy against Supabase production DB
[ ] Step 43: Run prisma db seed against production DB
[ ] Step 44: DEPLOYMENT.md verification checklist

## Step completion format
When marking a step complete, update this file like so:
[x] Step 1: Monorepo scaffold ← completed, do not regenerate