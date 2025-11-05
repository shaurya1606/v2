# Go Backend (apps/services)

This service provides the core API for the Letskraack stack. It is a small Go 1.25 HTTP server that offers health and authentication stubs the Nest gateway consumes.

## 1. Capabilities

- `GET /ping` responds with `pong` for uptime monitoring.
- `POST /login` validates demo credentials and returns JSON `{ "message": "login success" }` (or an error).
- CORS support for browser-based clients (used by the Nest gateway and Next.js frontend).

## 2. Tech Stack

- Go 1.25 (see `go.mod`).
- Standard library net/http, encoding/json.
- No external dependencies.

## 3. Local Development

### Prerequisites

- Install Go ≥ 1.25.
- Install repo dependencies with `pnpm install` at the monorepo root (enables lint/test hooks, though Go itself has none).

### Running the Server

From the repo root:

```sh
pnpm --filter services exec go run main.go
```

The server listens on `:8080` and logs the address to stdout. Update ports in `main.go` if you need a different binding.

## 4. Project Structure

```
main.go  # Defines HTTP routes, CORS helper, and entry point
go.mod   # Module metadata
```

Extend `main.go` with additional handlers or split into packages as the service grows.

## 5. HTTP API

| Method | Path     | Description                              |
| ------ | -------- | ---------------------------------------- |
| GET    | `/ping`  | Returns plain-text `pong`.               |
| POST   | `/login` | Accepts JSON body `{username, password}` |

Accepted credentials: `admin` / `1234`. Invalid credentials return HTTP 401, malformed JSON returns HTTP 400, unsupported methods return HTTP 405.

## 6. CORS Behaviour

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`
- Automatically handles OPTIONS preflight by returning HTTP 204.

Adjust `enableCORS` in `main.go` if you need stricter policies.

## 7. Docker Usage

The service ships with a multi-stage Dockerfile:

```sh
docker build -t letskraack-backend .
docker run -p 8080:8080 letskraack-backend
```

Stage breakdown:

1. `golang:1.23-alpine` builder (consider updating to 1.25) compiles the binary.
2. `alpine:latest` runtime copies the binary and exposes port 8080.

When orchestrated with `docker-compose.yaml`, rename the service path from `apps/backend` to `apps/services` if you have not already.

## 8. Extending the Service

1. Add handlers with `http.HandleFunc` or migrate to a router like chi/gorilla if routing complexity increases.
2. Replace the hard-coded credential check with real authentication (database, external provider, etc.).
3. Introduce structured logging or observability as needed.
4. Add tests using Go's `testing` package and wire them into the Turborepo graph via custom scripts.

## 9. Troubleshooting

- **CORS issues**: Ensure OPTIONS requests hit the handler and `enableCORS` sets headers before writing responses.
- **Docker build failures**: Run `go mod tidy` locally and confirm the builder image version matches `go.mod`.
- **Timeouts from Nest gateway**: Verify the service is reachable at `BACKEND_URL` (default `http://localhost:8080`).
- **Port conflicts**: Modify `http.ListenAndServe` in `main.go` to bind a different port and update dependent services.

## 10. Useful Links

- Go docs: https://go.dev/doc/
- net/http package: https://pkg.go.dev/net/http
- Letskraack root README for cross-stack context.
