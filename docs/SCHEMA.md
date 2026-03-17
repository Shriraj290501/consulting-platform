# Database Schema Reference

## ERD relationships
User          ──< Consultation     (one user → many consultations)
User          ──< Enrollment       (one user → many enrollments)
User          ──< Upload           (one user → many uploads)
User          ──< RefreshToken     (one user → many refresh tokens)
Service       ──< Consultation     (one service → many consultations)
Course        ──< Enrollment       (one course → many enrollments)

## Index decisions
- Consultation: index on userId, index on serviceId, index on status
- Enrollment: unique constraint on (userId, courseId) — no double enrollment
- RefreshToken: index on token (for fast lookup), index on userId
- Upload: index on userId

## Key design decisions

### Why cuid() not uuid()?
Shorter, URL-safe, monotonically increasing for better index performance.

### Why store RefreshToken in DB?
Enables token revocation (logout, suspicious activity).
Pure JWT refresh tokens cannot be invalidated without a blocklist.

### Why separate Message model?
Contact form submissions are not linked to a user account.
Allows anonymous enquiries before account creation.

### Why Enrollment is a join table?
Course ↔ User is many-to-many.
Enrollment is the join table, also records enrollment date.
Future: add completionDate, progress tracking.

### Why scheduledDate on Consultation?
Allows admin to confirm and manage time slots.
Future: integrate with calendar API.

## Migrations
All migrations live in: apps/api/prisma/migrations/
Never edit migration files manually after they are committed.
Always use: pnpm prisma migrate dev --name <description>

## Seed data
Admin user credentials come from environment variables:
SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD
Never hardcode credentials in seed.ts.