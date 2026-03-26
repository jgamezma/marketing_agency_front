# Marketing Agency Front

Frontend application for the Marketing Agency platform.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Package Manager:** pnpm
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Base UI)
- **Authentication:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **API Communication:** Native `fetch` with JWT-authenticated wrapper

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.local` and fill in your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx        # Email/password sign-in
│   │   ├── register/page.tsx     # Company registration
│   │   └── layout.tsx
│   ├── dashboard/
│   │   ├── page.tsx              # Overview (plan & company context)
│   │   ├── layout.tsx            # Dashboard nav with sign-out
│   │   └── projects/
│   │       ├── page.tsx          # Project listing
│   │       └── new/page.tsx      # Project creation form
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Redirects to /dashboard
│   └── globals.css
├── components/ui/                # shadcn/ui components
├── lib/
│   ├── api.ts                    # API wrapper (auto-attaches Supabase JWT)
│   ├── supabase.ts               # Supabase browser client
│   ├── supabase-server.ts        # Supabase server client
│   └── utils.ts                  # cn() utility
└── middleware.ts                  # Auth guard (redirects to /login)
```

## API Integration

The frontend communicates with a FastAPI backend. All requests are authenticated via Supabase JWT tokens attached as `Authorization: Bearer <token>`.

### Endpoints

| Domain | Endpoint | Method |
|--------|----------|--------|
| Auth | `/api/v1/auth/register-company` | POST |
| Companies | `/api/v1/companies/{id}/plan` | GET |
| Companies | `/api/v1/companies/{id}/context` | GET |
| Projects | `/api/v1/companies/{id}/projects` | GET, POST |
| Projects | `/api/v1/companies/{id}/projects/{pid}` | GET |
| Projects | `/api/v1/companies/{id}/projects/squad-types` | GET |
| Plans | `/api/v1/plans` | GET |
| Plans | `/api/v1/plans/{id}` | GET |

## Adding UI Components

```bash
pnpm dlx shadcn@latest add <component-name>
```
