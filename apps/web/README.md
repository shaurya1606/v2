# Next.js Frontend (apps/web)

The web app is the user-facing entry point of the Letskraack stack. It provides a simple login form that interacts with the Nest gateway and Go backend while showcasing a Turborepo-managed Next.js 16 project with Tailwind CSS v4.

## 1. Responsibilities

- Collect user credentials and send them to the Nest gateway (`/login`).
- Display responses from the backend (success or error messages).
- Expose a UI for testing the `/ping` endpoint if desired (extendable).
- Demonstrate usage of the shared UI package (`@repo/ui`).

## 2. Tech Stack

- Next.js 16 with the App Router.
- React 19 and the new `next/font` Geist family.
- Tailwind CSS v4 via `@tailwindcss/postcss` and CSS Modules.
- Strict TypeScript configuration (`moduleResolution: bundler`, `jsx: react-jsx`).

## 3. Getting Started

### Prerequisites

- Install dependencies at the repo root: `pnpm install`.
- Ensure the Nest gateway is running on `http://localhost:3001` (or set `NEXT_PUBLIC_GATEWAY_URL`).

### Development Server

```sh
pnpm --filter web dev
```

Visit <http://localhost:3000>. Edits to `app/page.tsx` hot-reload automatically.

### Environment Variables

| Variable                  | Purpose                                       | Default                 |
| ------------------------- | --------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_GATEWAY_URL` | Browser-visible base URL for the Nest gateway | `http://localhost:3001` |

Add `.env.local` to override values in development. These files are ignored by git.

## 4. Project Structure

```
app/
	layout.tsx   # Root layout, fonts, metadata
	page.tsx     # Login UI and fetch logic
	globals.css  # Tailwind + theme tokens
public/
	...          # Static assets
```

Tailwind is configured through `postcss.config.mjs` and inline `@theme` definitions in `app/globals.css`.

## 5. Available Scripts

Run with `pnpm --filter web <script>` from the monorepo root.

| Script  | Description                                     |
| ------- | ----------------------------------------------- |
| `dev`   | Next.js development server (port 3000).         |
| `build` | Production build output under `.next/`.         |
| `start` | Serve the built app.                            |
| `lint`  | Next.js ESLint configuration (core web vitals). |

## 6. UI Flow

`app/page.tsx` implements:

```tsx
const gatewayURL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3001';
const res = await fetch(`${gatewayURL}/login`, { ... });
```

- On success, displays the returned message.
- On failure, surfaces either the backend error message or a generic fallback.
- Extend the component to call `/ping` for diagnostics or integrate shared components from `@repo/ui`.

## 7. Docker Usage

Dockerfile uses Node 20 Alpine. To build manually:

```sh
docker build -t letskraack-web .
docker run -p 3000:3000 -e NEXT_PUBLIC_GATEWAY_URL=http://host.docker.internal:3001 letskraack-web
```

When orchestrated via `docker-compose`, ensure `NEXT_PUBLIC_GATEWAY_URL` points to the gateway container name.

## 8. Extending the Frontend

1. Import shared UI components: `import { Button } from '@repo/ui/button';`.
2. Introduce routing or layouts using the App Router's nested structure.
3. Add data fetching via React Server Components or server actions as your UX grows.
4. Implement proper form validation or authentication flows.

## 9. Troubleshooting

- **Network errors**: Confirm the gateway is reachable and CORS is configured (`localhost` vs Docker host). Use browser DevTools to inspect requests.
- **Environment issues**: Remember that `NEXT_PUBLIC_` variables must be defined at build/runtime. Restart the dev server after changing `.env.local`.
- **Tailwind styles missing**: Ensure `@tailwindcss/postcss` is installed and `globals.css` imports Tailwind directives.
- **ESLint errors**: Run `pnpm --filter web lint` for detailed output; fix issues before committing (Husky runs lint pre-commit).

## 10. References

- Next.js docs: https://nextjs.org/docs
- Tailwind CSS v4 docs: https://tailwindcss.com/docs
- Root Letskraack README for stack-wide details.
