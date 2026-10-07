# Jaindev — Annadanam register

Public roster and seva desk for Prestige West Woods Annadanam Jain Sangh.

## Vercel

Import this repo. Framework is TanStack Start (Nitro, Vercel preset). Build command: `npm run build`.

Paid status is stored in Postgres when `DATABASE_URL` is set (Neon). Without it the app falls back to in-memory PGLite, which does not share toggles across serverless instances.

Admin desk passcode is set in `src/lib/admin-pin.server.ts`.
