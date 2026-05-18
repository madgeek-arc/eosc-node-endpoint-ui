[![EOSC Beyond Logo][eosc-logo]]()

# EOSC Node Endpoint UI

Angular front-end for registering and updating an EOSC Node's advertised capabilities.

This repository contains the front-end only. Capability data is read from and written to the EOSC Node Endpoint backend service, which stores the document in its configured `capabilities.json` file.

## Prerequisites

- Node.js 20
- npm
- Angular CLI 20, or use the local CLI through `npm run ...`

## Install

```bash
npm install
```

## Run Locally

```bash
npm run start
```

The development server is served under:

```text
http://localhost:4200/admin/
```

The local environment uses `/api` as the backend base path:

| Setting | Value |
|---------|-------|
| API base URL | `/api` |
| Login URL | `/api/oauth2/authorization/eosc` |
| Logout URL | `/api/logout` |

The Angular dev server uses `proxy.conf.json`, which currently forwards `/api` to `http://localhost:8080/`.

## Build

Development build:

```bash
npm run build:dev
```

Production build:

```bash
npm run build:prod
```

The production build uses `/admin/` as the Angular base href.

## Docker

Build the image:

```bash
docker build -t eosc-node-endpoint-ui .
```

The Dockerfile builds the production Angular configuration by default:

```text
src/environments/environment.prod.ts
```

The current production configuration sends API, login, and logout requests to `/node`. In that layout, an external reverse proxy or ingress must route `/node` to the backend service.

The bundled Nginx template also contains a `/api` proxy that uses `API_ENDPOINT`:

```bash
docker run --rm -p 8080:80 \
  -e API_ENDPOINT=http://backend.example.org \
  eosc-node-endpoint-ui
```

At startup, `env_variables.sh` renders `nginx.conf` with the `API_ENDPOINT` environment variable. This proxy is only used by browser requests sent to `/api`; update the Angular environment or the Nginx routing if your production backend path is different.

When this UI and the backend run in the same Compose project, set `API_ENDPOINT` to the backend service name and container port, for example `http://endpoint:8080`. Do not use the backend's published host port for container-to-container traffic.

## Configuration

Build-time front-end URLs are defined in:

| File | Purpose |
|------|---------|
| `src/environments/environment.ts` | Local development settings |
| `src/environments/environment.prod.ts` | Production build settings |

Runtime container proxy configuration:

| Variable | Description |
|----------|-------------|
| `API_ENDPOINT` | Backend origin used by Nginx for proxied `/api` requests |

The current production environment points the Angular client at `/node` for API, login, and logout requests. If your public backend path differs, update `src/environments/environment.prod.ts` before building.

## Production Deployment

This README documents the front-end component. It is not a complete production deployment guide for the full application.

The backend service is maintained in a separate repository and is not included here. In production, deploy this UI together with the backend and your reverse proxy or ingress configuration in an environment-specific stack.

For production, provide at least:

| Concern | Production responsibility |
|---------|---------------------------|
| Backend integration | Route the public backend base path used by the UI to the backend service |
| TLS and public routing | Terminate HTTPS and expose the UI at the expected public `/admin/` path |
| OAuth2 redirects | Configure the backend login/logout redirects to point back to the public UI URL |
| Runtime proxy | Set `API_ENDPOINT` for the provided `/api` Nginx proxy, or adapt Nginx to the backend path configured in the Angular environment |
| Images | Pin released image tags rather than deploying floating local builds |

## Useful Commands

```bash
npm run lint
npm run test
```

[eosc-logo]: https://eosc.eu/wp-content/uploads/2024/02/EOSC-Beyond-logo.png
