# API Reference

Base URL (production): https://api.yourdomain.com
Base URL (local): http://localhost:3001

All responses follow the shape defined in /packages/shared/src/interfaces/api-response.interface.ts

## Authentication

### POST /auth/register
Public. Creates a new user account.
Body: { email: string, password: string, name: string }
Response 201: { data: { id, email, role } }
Response 409: Email already exists

### POST /auth/login
Public. Returns access token, sets httpOnly refresh token cookie.
Body: { email: string, password: string }
Response 200: { data: { accessToken: string, user: { id, email, role } } }
Response 401: Invalid credentials

### POST /auth/refresh
Public. Uses httpOnly cookie to issue new access token.
Response 200: { data: { accessToken: string } }
Response 401: Invalid or expired refresh token

### POST /auth/logout
Authenticated. Invalidates refresh token.
Response 200: { data: { message: 'Logged out' } }

## Users

### GET /users/me
Authenticated. Returns current user profile.
Response 200: { data: { id, email, role, createdAt } }

## Services

### GET /services
Public. Returns all active services.
Response 200: { data: Service[], meta: { ... } }

### GET /services/:id
Public. Returns single service.
Response 200: { data: Service }
Response 404: Service not found

### POST /admin/services
Admin only. Creates a new service.
Body: { title, description, price, imageUrl }
Response 201: { data: Service }

### PATCH /admin/services/:id
Admin only. Updates a service.
Response 200: { data: Service }

### DELETE /admin/services/:id
Admin only. Deletes a service.
Response 200: { data: { message: 'Deleted' } }

## Courses

### GET /courses
Public. Returns all courses. Cached in Redis (TTL 300s).
Response 200: { data: Course[], meta: { ... } }

### GET /courses/:id
Public. Returns single course.
Response 200: { data: Course }
Response 404: Course not found

### POST /admin/courses
Admin only. Creates a new course.
Body: { title, description, price, duration, level, imageUrl }
Response 201: { data: Course }

### PATCH /admin/courses/:id
Admin only. Updates a course.
Response 200: { data: Course }

### DELETE /admin/courses/:id
Admin only. Deletes a course.
Response 200: { data: { message: 'Deleted' } }

## Consultations

### POST /consultations
Authenticated. Books a consultation.
Body: { serviceId: string, scheduledDate: string, notes?: string }
Response 201: { data: Consultation }

### GET /consultations/my
Authenticated. Returns current user's consultations.
Response 200: { data: Consultation[] }

### GET /admin/consultations
Admin only. Returns all consultations.
Query params: status?, page?, limit?
Response 200: { data: Consultation[], meta: { total, page, limit } }

### PATCH /admin/consultations/:id
Admin only. Updates consultation status.
Body: { status: ConsultationStatus }
Response 200: { data: Consultation }

## Messages

### POST /contact
Public. Submits contact form.
Body: { name: string, email: string, message: string }
Response 201: { data: { message: 'Message received' } }

## Uploads

### POST /uploads/presigned-url
Authenticated. Generates R2 presigned upload URL.
Body: { fileName: string, fileType: string }
Response 200: { data: { uploadUrl: string, fileUrl: string } }