# Nest Gateway (apps/api)

The Nest Gateway is a lightweight proxy that exposes a clean REST interface for the Letskraack stack. It forwards requests to the Go microservice, handles cross-origin access for the Next.js frontend, and centralizes environment-driven configuration.

## 1. Responsibilities

- Provide `/ping` and `/login` endpoints to the web app.
- Forward calls to the Go backend (`BACKEND_URL`) using Axios.
- Standardize response shapes for the frontend.
- Apply CORS rules so browser clients can call the gateway directly.

## 2. Tech Stack

- Node.js 20 runtime (see root `package.json#engines`).
- NestJS 11 with the default Express adapter.
- TypeScript (strict mode, decorators enabled).
- Axios for outbound HTTP calls.

## 3. Getting Started

### Prerequisites

- Install dependencies at the repo root: `pnpm install`.
- Ensure the Go service is reachable on `http://localhost:8080` (default).

### Local Development

```sh
pnpm --filter api start:dev
```

The server listens on `PORT` or `3001`. By default it proxies to `http://localhost:8080`. Adjust `BACKEND_URL` to target another host.

### Environment Variables

| Variable      | Purpose                                        | Default                 |
| ------------- | ---------------------------------------------- | ----------------------- |
| `PORT`        | Port for the gateway HTTP server               | `3001`                  |
| `BACKEND_URL` | Base URL of the Go service (`/ping`, `/login`) | `http://localhost:8080` |

Define values in `.env`, `.env.local`, or container environment; they are gitignored.

## 4. Project Structure

```
src/
  main.ts          # Bootstraps Nest application and CORS
  app.module.ts    # Registers controller/service
  app.controller.ts# Maps routes and proxies to Go service
  app.service.ts   # Placeholder service (extend as needed)
test/
  app.e2e-spec.ts  # Example e2e test (update to match current routes)
```

## 5. Available Scripts

Run scripts with `pnpm --filter api <script>` from the repo root.

| Script        | Description                                |
| ------------- | ------------------------------------------ |
| `build`       | Compile TS to JS (`dist/`).                |
| `start`       | Run compiled app (`node dist/main`).       |
| `start:dev`   | Watch mode with hot reload via Nest CLI.   |
| `start:debug` | Start with Node inspector.                 |
| `start:prod`  | Production run from build artifacts.       |
| `lint`        | ESLint with project-aware parser settings. |
| `test`        | Jest unit tests.                           |
| `test:e2e`    | End-to-end tests (Supertest).              |
| `test:cov`    | Coverage report.                           |

## 6. HTTP Endpoints

| Method | Path     | Description                                    |
| ------ | -------- | ---------------------------------------------- |
| `GET`  | `/ping`  | Calls Go `/ping` and returns `{ goResponse }`. |
| `POST` | `/login` | Forwards credentials to Go `/login`.           |

Extend `AppController` to add new routes or transform responses before returning to clients.

## 7. Testing

- Unit tests: `pnpm --filter api test`.
- E2E tests: `pnpm --filter api test:e2e`. Update `test/app.e2e-spec.ts` to mirror the current API (default template expects `/`).
- Coverage: `pnpm --filter api test:cov`.

## 8. Docker

The service includes a Node 20 Alpine Dockerfile:

```sh
docker build -t letskraack-api .
docker run -p 3001:3001 --env BACKEND_URL=http://host.docker.internal:8080 letskraack-api
```

Within `docker-compose.yaml`, update the `gateway` service if you change ports or environment settings.

## 9. Extending the Gateway

1. Add new proxies by creating methods in `AppController` and wiring additional services if needed.
2. Use Nest modules to organize complex domains or add middleware (logging, auth, rate limiting).
3. Integrate validation pipes or DTOs to enforce request/response schemas.

## 10. Troubleshooting

- **CORS errors**: Ensure `app.enableCors` is configured for the domains you expect.
- **Proxy failures**: Confirm `BACKEND_URL` and the Go service are reachable; Axios errors bubble up to the caller.
- **E2E failures**: Align tests with implemented routes or mock remote services.
- **Docker networking**: When running via compose, reference services by container name (e.g., `http://backend:8080`).

## 11. Helpful References

- NestJS docs: https://docs.nestjs.com
- Axios docs: https://axios-http.com
- Letskraack root README for stack-wide instructions.

This README focuses on the gateway. For cross-stack guidance, refer to the monorepo documentation at the root of the project.
