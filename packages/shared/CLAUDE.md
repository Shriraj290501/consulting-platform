# Shared Package Rules

## Purpose
Single source of truth for types, enums, and interfaces
shared between the frontend (apps/web) and backend (apps/api).

## What belongs here
- TypeScript enums (Role, CourseLevel, ConsultationStatus)
- Interface definitions for API response payloads
- Shared DTO types used by both frontend and backend
- API response wrapper types

## What does NOT belong here
- Business logic of any kind
- NestJS decorators, modules, or dependencies
- React components, hooks, or browser APIs
- Prisma client or DB-specific types
- Anything that imports from apps/web or apps/api

## Folder structure
packages/shared/
├── src/
│   ├── enums/
│   │   ├── role.enum.ts
│   │   ├── course-level.enum.ts
│   │   └── consultation-status.enum.ts
│   ├── interfaces/
│   │   ├── user.interface.ts
│   │   ├── service.interface.ts
│   │   ├── course.interface.ts
│   │   ├── consultation.interface.ts
│   │   └── api-response.interface.ts
│   └── index.ts                    → Re-exports everything
├── package.json
└── tsconfig.json

## Import path (configured via pnpm workspace)
import { Role, CourseLevel, IApiResponse } from '@consulting/shared'

## Enums to define

### role.enum.ts
export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

### course-level.enum.ts
export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

### consultation-status.enum.ts
export enum ConsultationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

## API response interfaces to define

### api-response.interface.ts
export interface IApiResponse<T> {
  data: T
  meta: {
    timestamp: string
    version: string
  }
}

export interface IApiError {
  error: {
    code: string
    message: string
  }
  meta: {
    timestamp: string
    version: string
  }
}