# Project Structure

This project follows the folder conventions established in
`party-palace-frontend`. Read this before adding new files.

## Layout

```
app/
  (auth)/            # auth surface (staff login) — URL-less route group
    login/
  (protected)/           # staff console — URL-less group, /* URLs preserved
    _components/     # group-level chrome (sidebar, header, auth guard)
    staff/           # pages; page-specific components live in sibling _components/
  (portal)/          # patient portal — /portal/* URLs preserved
    _components/
    portal/
  api/               # route handlers (app/api/auth/[...nextauth])
  layout.tsx         # root layout (root-level providers live in providers/)
  error.tsx          # root error boundary (client)
  not-found.tsx      # root 404
components/
  forms/             # shared domain components (PascalCase files + index.ts barrel)
  ui/                # hand-written primitives (PascalCase + index.ts barrel)
  shadcn/            # shadcn CLI primitives (kebab-case, untouched)
providers/           # top-level providers (ThemeProvider)
stores/              # global zustand stores (session/auth); camelCase file names
lib/
  api/               # high-level API adapters (DTO → UI model) + base client
  store/             # feature-scope zustand stores (kebab-case file names)
  mock/              # mock data / dev delays
schemas/             # zod schemas, kebab-case *-schema.ts
services/            # DTO-level API modules, kebab-case *-services.ts; http.ts = shared base client
types/               # API/DTO types, kebab-case *-types.ts
docs/                # specs & structure docs
public/
```

## Conventions

- **Route groups**: every section lives in a `(group)`; the group name never
  appears in the URL. Keep `page.tsx` files shallow — deep nesting only for
  dynamic segments.
- **Co-location**: a component used by exactly one page lives in that route's
  `_components/` folder (reference: `app/(tenant-admin)/admin/bookings/_components/`).
  Components used by more than one route live in `components/<domain>`.
- **Naming**:
  - Components/providers: `PascalCase.tsx`
  - shadcn CLI output: kebab-case, untouched, in `components/shadcn/`
  - Schemas: `*-schema.ts`, services: `*-services.ts`, types: `*-types.ts`
  - Global stores: `camelCase.ts` in `stores/`; feature stores: kebab-case in `lib/store/`
- **Barrels**: `components/forms/index.ts` and `components/ui/index.ts` re-export
  their files; import primitives via `@/components/ui`. shadcn primitives are
  imported directly (`@/components/shadcn/button`).
- **Alias**: `@/*` maps to the repo root (tsconfig).
- **Env**: `.env` / `.env.local` are git-ignored; document every variable in
  `.env.example` when adding one.
