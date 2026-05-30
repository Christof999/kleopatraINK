# Kleopatra INK

Website for **Kleopatra INK** — a tattoo & piercing studio in Gunzenhausen.
Single-page React app (Vite) with a Firebase backend for the customer area,
gallery, wanna-dos, piercing prices and the customer loyalty wheel, plus a
serverless Instagram proxy.

## Tech stack

| Area            | Choice                                             |
| --------------- | -------------------------------------------------- |
| Framework       | React 18 + Vite 6                                  |
| 3D              | three.js via `@react-three/fiber` / `drei` (lazy)  |
| Auth & data     | Firebase Authentication + Cloud Firestore + Storage|
| Instagram feed  | Serverless function (`api/instagram.js`, Vercel)   |
| i18n            | Context-based, DE / EN / TR (`src/i18n.jsx`)       |
| Styling         | Hand-written CSS (`src/styles.css`)                |

## Getting started

Requires **Node ≥ 20** (see `.nvmrc`).

```bash
npm install
cp .env.example .env   # then fill in the Firebase values
npm run dev            # start the dev server
```

### Scripts

| Script             | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start the Vite dev server                |
| `npm run build`    | Production build to `dist/`              |
| `npm run preview`  | Preview the production build locally     |
| `npm run lint`     | Run ESLint                               |
| `npm run lint:fix` | Run ESLint with autofix                  |

## Environment variables

Firebase web config (safe to expose — these are public identifiers; access is
enforced by the Firestore/Storage security rules). Set them in `.env` locally
and in your host's environment for production. See `.env.example`.

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

If Firebase is not configured, the app degrades gracefully: auth-dependent
areas show a "not configured" notice instead of crashing.

The Instagram proxy needs a server-side (non-`VITE_`) token:

```
IG_ACCESS_TOKEN   # long-lived Instagram Graph API token, set on the host
```

Without it, the Instagram page falls back to a static "follow us" card.

## Project structure

```
src/
  App.jsx              # Page router + loyalty-wheel orchestration
  main.jsx             # Entry; mounts <AuthProvider><App/></AuthProvider>
  context/
    AuthContext.jsx    # Single Firebase auth listener, shared via context
  pages/               # One module per screen (Landing, Gallery, Booking, …)
  components/          # Reusable UI (PageHead, ErrorBoundary, modals, 3D, …)
  data/                # Structural content (nav layout, slots, piercing ids, …)
  hooks/               # Firestore data hooks (gallery, wannados, prices)
  i18n.jsx             # LanguageProvider/useI18n + DE/EN/TR translation strings
  lib/format.js        # Shared formatting/helpers (currency, dates, auth errors)
  firebase.js          # Firebase initialisation (guarded by env presence)
api/
  instagram.js         # Serverless Instagram proxy (keeps the token server-side)
```

## Firebase

Security rules live in `firestore.rules` and `storage.rules`; `firebase.json`
wires them up. Admin-only writes are restricted to an email allowlist inside the
rules. Public collections (`gallery`, `wannados`, `piercingPrices`) are
read-only for visitors; `users/{uid}` is private to its owner (and admins).

Deploy rules with the Firebase CLI:

```bash
firebase deploy --only firestore:rules,storage
```

## Deployment

`npm run build` outputs a static bundle to `dist/`. The `api/` directory is a
Vercel-style serverless function. Any static host works for the SPA; the
Instagram proxy needs a serverless/Node runtime with `IG_ACCESS_TOKEN` set.

three.js and the GLTF loader are lazy-loaded only when a 3D viewer is shown, and
firebase is split into its own cache-friendly chunk, so the initial load stays
lean.

## Known limitations / roadmap

- **Booking form** collects the request and shows a confirmation, but does not
  yet send it anywhere (no email/CRM backend wired up). Add a serverless
  endpoint + transactional email provider before relying on it in production.
- **Booking slots** (`src/data/booking.js`) and the displayed date are static
  placeholders — wire them to real availability when a backend exists.
- The full-resolution studio photos in `public/` are large; run them through an
  image optimiser (or serve responsive sizes) for best Lighthouse scores.
