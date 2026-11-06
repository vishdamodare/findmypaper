# FindMyPaper

Student resource finder: filter by university → course → branch → pattern → year → semester → subject → type, preview PDFs in-browser, download, bookmark. Admin panel for uploads and academic master data.

Stack: Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn/ui, Prisma 7 + PostgreSQL, NextAuth v5 (credentials + optional Google), Supabase Storage (local-disk fallback), react-pdf.

## Run locally
```bash
npm install
cp .env.example .env        # set DATABASE_URL and AUTH_SECRET (openssl rand -base64 32)
createdb findmypaper
npx prisma migrate deploy
npx prisma db seed          # dev only: demo data + admin@findmypaper.local / Admin@12345
npm run dev
```

## Configuration
- **Google login**: set `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`; the button appears automatically.
- **File storage**: set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET` (private bucket). Without them files go to `.storage/` on local disk. Files are never public; they are streamed through `/api/resources/[id]/file` (preview) and `/download` (counted).
- **Forgot password**: no mail transport is configured. In development the reset link is shown on the page and logged; in production it is not revealed, so wire up an email sender in `requestPasswordReset` (`src/lib/actions/auth.ts`) before launch.

## Notes
- Demo resources are generated placeholder PDFs, marked `[DEMO]`; they are not real university papers.
- Academic hierarchy: Resource → Subject → (Branch → Course → University, Regulation, Semester). A resource's university/branch/semester are derived from its subject, so they cannot disagree.
- Admin access is checked against the `Admin` table on every admin page and action, not just the session token.
