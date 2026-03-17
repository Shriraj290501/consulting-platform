# Project: Consulting & Education Platform

## Stack (locked — no changes without updating this file)
- Frontend: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Radix UI
- Backend: NestJS 10, Prisma, PostgreSQL
- Cache: Redis via Upstash
- Storage: Cloudflare R2
- Auth: JWT access tokens (15min) + refresh tokens (7 days, httpOnly cookies)
- Package manager: pnpm workspaces
- Monorepo tool: pnpm

## Monorepo structure
consulting-platform/
├── apps/
│   ├── web/        → Next.js 14 frontend
│   └── api/        → NestJS 10 backend
├── packages/
│   └── shared/     → Shared TypeScript types, enums, DTOs
├── docs/
├── CLAUDE.md
├── AGENTS.md
├── docker-compose.yml
├── .env.example
└── package.json

## Business domain
A professional consulting and education platform offering:
- Logo Analysis and improvement guidance
- Wristwatch Design and brand perception analysis
- Signature and Handwriting Analysis with actionable feedback
- Stock Market Education classes

### Critical constraint
This platform provides ANALYSIS and EDUCATION only.
It does NOT provide predictions, astrology, numerology, or superstition.
All copy must reflect professional consulting language.

## Naming conventions
- NestJS classes: PascalCase
- NestJS methods: camelCase
- Database columns: snake_case (use @map() in Prisma)
- Database tables: plural snake_case (use @@map() in Prisma)
- API routes: kebab-case
- React components: PascalCase, one per file
- TypeScript interfaces: PascalCase prefixed with I (e.g. IUser)
- Enums: PascalCase, values UPPER_SNAKE_CASE

## API response shape (all endpoints must follow this)
Success:
{
  "data": <payload>,
  "meta": { "timestamp": "", "version": "1" }
}

Error:
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  },
  "meta": { "timestamp": "", "version": "1" }
}

## Non-negotiables
- TypeScript strict mode everywhere — zero use of `any`
- Never expose password_hash in any API response
- All environment variables validated at startup using Joi
- Redis cache TTL must always be explicit — no library defaults
- All DB writes that touch multiple tables use prisma.$transaction()
- No business logic in controllers — services only
- All routes protected by JwtAuthGuard unless explicitly marked public with @Public()

## Design system
- Headlines font: Space Grotesk
- Body font: Inter
- Background: #FFFFFF
- Primary text: #0F172A
- Accent: #0B3C5D
- Secondary text: #334155
- Borders: #E2E8F0
- Design style: Minimalist professional, Swiss modern grid
