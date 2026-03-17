# Next.js Frontend Rules

## Architecture
- App Router only — no pages/ directory
- Server Components by default for all data fetching
- Client Components only for: interactivity, hooks, browser APIs, forms
- Always mark client components explicitly with "use client" at top of file

## Folder structure
apps/web/
├── app/
│   ├── layout.tsx              → Root layout (Navbar, Footer, fonts)
│   ├── page.tsx                → Home page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── services/page.tsx
│   ├── courses/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── admin/
│       ├── layout.tsx          → Admin layout with auth guard
│       ├── page.tsx
│       ├── services/page.tsx
│       ├── courses/page.tsx
│       └── consultations/page.tsx
├── components/
│   ├── ui/                     → shadcn/ui components (auto-generated)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── ServicesOverview.tsx
│   │   ├── ClassesPreview.tsx
│   │   ├── ProcessSection.tsx
│   │   ├── TrustSection.tsx
│   │   └── CtaSection.tsx
│   ├── cards/
│   │   ├── ServiceCard.tsx
│   │   └── CourseCard.tsx
│   └── forms/
│       ├── ContactForm.tsx
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts           → Base fetch wrapper
│   │   ├── auth.ts             → Auth API calls
│   │   ├── services.ts         → Services API calls
│   │   ├── courses.ts          → Courses API calls
│   │   └── consultations.ts    → Consultations API calls
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   └── useUser.ts
└── types/
    └── index.ts                → Frontend-only types (import shared from @consulting/shared)

## Data fetching rules
- Server components: fetch directly using lib/api/ wrappers (no useEffect)
- Client components: use SWR for GET requests
- Mutations: use React state + fetch, or server actions
- Never call the API directly inside a component — always go through lib/api/

## Component rules
- One component per file, always
- Props interface defined above the component, exported
- Named exports for all components (no default export except page.tsx and layout.tsx)
- No inline styles — Tailwind classes only
- No hardcoded colors — use CSS custom properties or Tailwind config tokens

## Design implementation
- Font headings: font-space-grotesk (configured in tailwind.config.ts)
- Font body: font-inter
- Spacing: 8px base grid (use Tailwind spacing scale)
- All pages have max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 container
- Cards: rounded-2xl border border-[#E2E8F0] shadow-sm
- Primary button: bg-[#0B3C5D] text-white hover:bg-[#0a3554]
- Secondary button: border border-[#0B3C5D] text-[#0B3C5D] hover:bg-[#0B3C5D] hover:text-white

## Auth handling
- Store access token in memory (not localStorage)
- Refresh token handled via httpOnly cookie (automatic)
- Use middleware.ts for protecting /dashboard and /admin routes
- Redirect unauthenticated users to /login
- Redirect non-admin users away from /admin to /dashboard