# Prisma Schema Rules

## Conventions
- All column names: snake_case using @map("column_name")
- All table names: plural snake_case using @@map("table_name")
- Every model must have: id (cuid), createdAt, updatedAt
- All foreign keys must have explicit @@index()
- Use enums for all finite-value fields

## Enums (define in schema.prisma)
Role:               USER | ADMIN
CourseLevel:        BEGINNER | INTERMEDIATE | ADVANCED
ConsultationStatus: PENDING | CONFIRMED | COMPLETED | CANCELLED

## Models required
- User (id, email, passwordHash, role, createdAt, updatedAt)
- Service (id, title, description, price, imageUrl, createdAt, updatedAt)
- Course (id, title, description, price, duration, level, imageUrl, createdAt, updatedAt)
- Enrollment (id, userId, courseId, createdAt)
- Consultation (id, userId, serviceId, status, scheduledDate, notes, createdAt, updatedAt)
- Message (id, name, email, message, createdAt)
- Upload (id, userId, fileUrl, fileType, createdAt)
- RefreshToken (id, token, userId, expiresAt, createdAt)

## Relationships
- User → Consultation: one-to-many
- User → Enrollment: one-to-many
- User → Upload: one-to-many
- User → RefreshToken: one-to-many
- Course → Enrollment: one-to-many
- Service → Consultation: one-to-many

## Commands reference
Development:
  pnpm prisma generate              → Regenerate Prisma client after schema change
  pnpm prisma migrate dev --name    → Create and apply migration
  pnpm prisma studio                → Open DB GUI
  pnpm prisma db seed               → Run seed file

Production:
  pnpm prisma migrate deploy        → Apply pending migrations (NEVER db push)

## Seed file location
apps/api/prisma/seed.ts

Seed must create:
- 1 admin user (email from env, password hashed)
- 3 services (Logo Analysis, Wristwatch Analysis, Signature Analysis)
- 2 courses (Stock Market Basics, Advanced Technical Analysis)

## Critical rules
- NEVER use prisma db push in production — migrations only
- NEVER expose passwordHash in service layer — use explicit Prisma select
- ALWAYS use prisma.$transaction() for multi-table writes