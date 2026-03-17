# NestJS Backend Rules

## Module structure
Every feature module must contain exactly:
src/modules/<name>/
├── <name>.module.ts
├── <name>.controller.ts
├── <name>.service.ts
├── dto/
│   ├── create-<name>.dto.ts
│   └── update-<name>.dto.ts
└── <name>.service.spec.ts    → unit test file

## Folder structure
apps/api/src/
├── main.ts
├── app.module.ts
├── modules/
│   ├── auth/
│   ├── users/
│   ├── services/
│   ├── courses/
│   ├── consultations/
│   ├── messages/
│   ├── uploads/
│   └── admin/
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   └── response.interceptor.ts   → Wraps all responses in {data, meta} shape
│   ├── filters/
│   │   └── http-exception.filter.ts  → Global error handler
│   └── decorators/
│       ├── public.decorator.ts       → @Public() marks route as open
│       ├── roles.decorator.ts        → @Roles(Role.ADMIN)
│       └── current-user.decorator.ts → @CurrentUser() extracts user from JWT
├── config/
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── jwt.config.ts
│   └── r2.config.ts
└── database/
    └── database.module.ts            → Global PrismaService

## Rules
- Never do business logic in controllers — services only
- All DB access through PrismaService injected into services
- Use class-validator decorators on ALL DTOs — no unvalidated input
- Use class-transformer with @Exclude() on sensitive fields (password_hash)
- Never return password_hash in any response — use Prisma select explicitly
- All config values come from ConfigService — never process.env directly in code
- Use @UseInterceptors(ResponseInterceptor) globally in main.ts

## Error handling
- Throw NestJS HttpException subclasses (NotFoundException, UnauthorizedException, etc.)
- Global HttpExceptionFilter catches all errors and formats them
- Log every caught error with: module name, method name, error message
- Never swallow errors silently

## Guards on routes
- Public routes: @Public() decorator only
- Authenticated routes: protected by default via global JwtAuthGuard
- Admin routes: @Roles(Role.ADMIN) + @UseGuards(RolesGuard)

## Redis caching
- Cache GET /courses with key 'courses:all', TTL 300 seconds
- Cache GET /services with key 'services:all', TTL 600 seconds
- Invalidate relevant cache keys on any create/update/delete mutation
- Never cache user-specific data globally

## Rate limiting
- Apply to POST /auth/login: max 5 requests per 60 seconds per IP
- Apply to POST /contact: max 3 requests per 60 seconds per IP
- Apply to POST /consultations: max 10 requests per 60 seconds per user

## Swagger
- Every controller decorated with @ApiTags()
- Every endpoint decorated with @ApiOperation() and @ApiResponse()
- Swagger available at /api/docs in development only