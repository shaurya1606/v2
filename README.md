# Letskraack Multilingual Stack

Letskraack is a teaching-focused monorepo that demonstrates how to wire a multi-language architecture—Go microservice, NestJS gateway, and Next.js frontend—under a single Turborepo + pnpm toolchain. Use this README as a mini-course for reproducing or extending the setup.

## 1. System Overview

- **Services (`apps/services`)**: Go 1.25 API providing `/ping` and `/login` endpoints.
- **Gateway (`apps/api`)**: NestJS 11 server that proxies requests to the Go API via Axios and handles CORS.
- **Frontend (`apps/web`)**: Next.js 16 App Router site consuming the Nest endpoints from the browser.
- **Shared Packages (`packages/*`)**: Centralized ESLint configs, TypeScript bases, and a React UI component library.
- **Repo Tooling**: Turborepo orchestrates tasks, pnpm manages workspaces, Prettier + ESLint enforce style, and Husky runs quality gates.

All projects default to TypeScript (where applicable) and strict lint/type settings.

## 2. Repository Layout

```
apps/
	services/        # Go microservice
	api/             # NestJS gateway
	web/             # Next.js frontend
packages/
	ui/              # Shared React components
	eslint-config/   # Flat ESLint presets
	typescript-config/ # Shared tsconfig bases
```

Additional root files:

- `turbo.json` – task graph definition.
- `pnpm-workspace.yaml` – workspace discovery.
- `.prettierrc`, `.prettierignore`, `.husky/` – formatting and git hook automation.
- `docker-compose.yaml` – multi-service orchestration (requires edit; see [§8](#8-docker--container-workflow)).

## 3. Prerequisites

- **Node.js** ≥ 20 (enforced by `package.json#engines`).
- **pnpm** 9 (`npm install -g pnpm@9`).
- **Go** ≥ 1.25 for local builds of the microservice.
- **Docker Desktop** if you plan to run the stack via containers.
- Recommended: Git, an editor with ESLint + Prettier support (VS Code settings already configured).

## 4. Installing Dependencies

From the repo root:

```sh
pnpm install
```

pnpm installs every workspace in dependency order. Husky hooks are activated automatically via the root `prepare` script.

## 5. Turborepo Commands

- `pnpm dev` – runs each package's `dev` script (non-cached, persistent where defined).
- `pnpm build` – executes `turbo run build` across the graph (cached).
- `pnpm lint` – cascades lint scripts.
- `pnpm format` / `pnpm format:check` – runs Prettier.
- `pnpm check-types` – executes TypeScript checks in participating packages.

You can scope to a specific app or package:

```sh
pnpm dev --filter web
pnpm lint --filter @repo/ui
```

## 6. Application Walkthrough

### 6.1 Go Service (`apps/services`)

- `main.go` registers `/ping` (returns `pong`) and `/login` (validates `admin`/`1234`).
- Simple CORS helper allows browser requests.
- Local dev: `pnpm --filter services exec go run main.go`.
- Dockerfile uses a multi-stage build (Go → Alpine runtime).

### 6.2 NestJS Gateway (`apps/api`)

- `AppController` proxies `/ping` and `/login` to `BACKEND_URL` (defaults `http://localhost:8080`).
- `main.ts` enables CORS and listens on `process.env.PORT ?? 3001`.
- Dev server: `pnpm --filter api start:dev`.
- Testing: `pnpm --filter api test` (Jest + Supertest). Note the generated e2e test still expects `GET /` to return `"Hello World!"`; adjust the controller or test to align with proxy behavior.

### 6.3 Next.js Frontend (`apps/web`)

- `app/page.tsx` renders a login form that posts to the gateway (`NEXT_PUBLIC_GATEWAY_URL`, default `http://localhost:3001`).
- Tailwind CSS v4 is configured through `postcss.config.mjs` and `app/globals.css`.
- Dev server: `pnpm --filter web dev`.
- Build chain: `pnpm --filter web build` → `pnpm --filter web start`.

### 6.4 Shared UI Library (`packages/ui`)

- Contains `Button`, `Card`, and `Code` components.
- Export map lets you import via `@repo/ui/button`. Example usage in Next.js:

  ```tsx
  import { Button } from '@repo/ui/button';

  <Button appName="web" onClick={() => console.log('hi')}>
    Click me
  </Button>;
  ```

- Validate with `pnpm --filter @repo/ui lint` and `pnpm --filter @repo/ui check-types`.

## 7. Linting, Formatting, and Type Checking

- **ESLint** – Flat configs delivered via `@repo/eslint-config`. Each app references its tailored config (Next.js, React, or base). The root `pnpm lint` leverages Turborepo dependencies to run per package.
- **Prettier** – Root `.prettierrc` (single quotes, 100-char width, LF line endings). Prettier runs on staged files through `lint-staged` and Husky.
- **TypeScript** – `@repo/typescript-config` supplies `base.json`, `react-library.json`, and `nextjs.json` for consistent compiler options (strict mode, NodeNext modules, etc.). Use `pnpm check-types` or package-level scripts.

Husky's `pre-commit` hook executes, in order: `lint-staged`, `format`, `format:check`, `lint`, `test`. Expect commits to fail if any command exits non-zero.

## 8. Docker & Container Workflow

- `apps/services/Dockerfile`: multi-stage Go build → Alpine runtime on port 8080.
- `apps/api/Dockerfile` and `apps/web/Dockerfile`: Node 20 Alpine images that run `npm install`, `npm run build`, and start the app. For consistency with pnpm, consider rewriting to use `pnpm install --frozen-lockfile` and `pnpm run build`.
- `docker-compose.yaml` orchestrates `backend`, `gateway`, and `web` containers. **Update `build: ./apps/backend` to `./apps/services`** before running compose:

  ```yaml
  backend:
  	build: ./apps/services
  ```

- After fixing paths:

  ```sh
  docker compose build
  docker compose up
  docker compose down
  ```

- Environment wiring inside compose: `BACKEND_URL=http://backend:8080` for the gateway and `NEXT_PUBLIC_GATEWAY_URL=http://localhost:3001` for the web container.

## 9. Continuous Integration

- Workflow: `.github/workflows/letskraack.yml`.
- Jobs:
  - `Explore-GitHub-Actions` – demo logging job.
  - `build` – installs pnpm 8 (bump to 9 for parity), sets up Node 20, runs `pnpm install`, `pnpm build`, and `pnpm test`.
- Note: A root `test` script is not currently defined; either add one (e.g., `"test": "turbo run test"`) or adjust the workflow to target specific packages.
- Optional: enable Turbo remote caching by exporting `TURBO_TOKEN` and `TURBO_TEAM` secrets and uncommenting the env block.

## 10. Extending the Monorepo

1. **New Service** – create `apps/<service>`, add scripts, update `pnpm-workspace.yaml` and `turbo.json` dependencies.
2. **Shared Utilities** – place reusable code in `packages/` (e.g., `packages/utils`).
3. **Environment Management** – add `.env` files per app; they are gitignored by default. For secrets in Docker/CI, use environment variables or secrets managers.
4. **Cross-Service Communication** – follow the gateway pattern: expose service routes, proxy through Nest, and surface them via the frontend.

## 11. Troubleshooting

- **Compose build fails** – verify the `backend` path in `docker-compose.yaml` is corrected and Docker Desktop is running.
- **Husky commits fail** – run `pnpm lint`, `pnpm format:check`, and package-level tests locally to identify issues.
- **E2E test mismatch** – adjust `apps/api/test/app.e2e-spec.ts` or add a `/` route returning `"Hello World!"`.
- **Missing root test script** – define `"test": "turbo run test"` in the root `package.json` to satisfy CI.
- **Env variable issues** – ensure `BACKEND_URL` and `NEXT_PUBLIC_GATEWAY_URL` are set consistently across local, Docker, and CI environments.

## 12. Suggested Next Steps

1. Add or adapt a root `pnpm test` script to align with the CI workflow.
2. Migrate Dockerfiles to pnpm for parity with local installs.
3. Integrate shared UI components into the Next.js app to highlight reuse.
4. Expand testing (e2e for Next.js, integration for the gateway) to cover the full request flow.

## 13. Resources

- Turborepo docs: <https://turborepo.com/docs>
- NestJS docs: <https://docs.nestjs.com>
- Next.js docs: <https://nextjs.org/docs>
- Go standard library: <https://pkg.go.dev/std>
- pnpm workspace guide: <https://pnpm.io/workspaces>

Happy hacking! Feel free to adapt this blueprint to additional languages or services as your architecture evolves.

# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager

npx turbo login
yarn exec turbo login
pnpm exec turbo login

```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)

turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager

npx turbo link
yarn exec turbo link
pnpm exec turbo link

```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)

```

```
