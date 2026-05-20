[![EOSC Beyond Logo][eosc-logo]]()

# EOSC Node Endpoint UI

Angular front-end for registering and updating an EOSC Node's advertised capabilities.

This repository contains the front-end only. Capability data is read from and written to the EOSC Node Endpoint backend 
service, which stores the document in its configured `capabilities.json` file.

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

The production build writes a placeholder base href into `index.html`. That placeholder is patched at deployment time, 
so the same static build can be served at `/`, `/admin/`, or another reverse-proxy path.

## Docker

Build the image:

```bash
make docker-build
```

The Dockerfile builds the production Angular configuration by default:

```text
src/environments/environment.prod.ts
```

The image supports runtime configuration through environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `APP_BASE_HREF` | `/` | Public path where the app is mounted, for example `/admin/` |
| `API_BASE_URL` | `/api` | Public backend base URL used by Angular requests |
| `LOGIN_URL` | `${API_BASE_URL}/oauth2/authorization/eosc` | Optional explicit login endpoint |
| `LOGOUT_URL` | `${API_BASE_URL}/logout` | Optional explicit logout endpoint |

Run the image behind a reverse proxy:

```bash
IMAGE_TAG="$(node -p "require('./package.json').version")"
docker run --rm \
  -p 4200:80 \
  -e APP_BASE_HREF=/ \
  -e API_BASE_URL=/api \
  docker.madgik.di.uoa.gr/eosc-node-endpoint-ui:"${IMAGE_TAG}"
```

The container serves only the static Angular application. It does not proxy backend requests; production backend 
routing belongs in the external reverse proxy or ingress.
With the default `API_BASE_URL=/api`, that proxy or ingress must route `/api/`
to the backend service.

Docker Compose example:

```bash
make docker-compose
```

The local Compose file mounts `docker/nginx/nginx.local.conf`, which proxies
same-origin `/api` requests from `http://localhost:4200` to the backend service
on the shared Docker network. The backend service is not exposed on the host in
that setup; start the backend stack first so `eosc-node-endpoint-net` exists and
the backend is reachable as `node-endpoint:8080`.

## Configuration

Front-end API URLs are loaded at runtime from `config.json`. The checked-in
default runtime config is:

```json
{
  "apiBaseUrl": "/api"
}
```

In Docker, `docker-entrypoint.d/99-runtime-config.sh` rewrites `config.json` from environment variables and patches 
the built `<base href>`.

For direct web-server deployment without Docker, edit the deployed `index.html`
base href and `config.json` beside it:

```html
<base href="/">
```

```json
{
  "apiBaseUrl": "/api"
}
```

## Production Deployment

This README documents the front-end component. It is not a complete production deployment guide for the full application.

The backend service is maintained in a separate repository and is not included here. In production, deploy this UI 
together with the backend and your reverse proxy or ingress configuration in an environment-specific stack.

For production, provide at least:

| Concern | Production responsibility |
|---------|---------------------------|
| UI routing | Expose the UI at the public root path `/` and run the container with `APP_BASE_HREF=/` |
| Backend routing | Route the public backend base path `/api/` to the backend service and run the UI with `API_BASE_URL=/api` |
| TLS and public routing | Terminate HTTPS and configure the public host and paths used by browsers |
| OAuth2 callback | Configure the OAuth2 provider/backend callback URL to use the public backend callback path, for example `/api/login/oauth2/code/eosc` when the backend is published under `/api` |
| Login/logout flow | Configure backend post-login and logout redirects to return users to the public UI URL |
| Images | Pin released image tags rather than deploying floating local builds |

In this default layout, the UI container serves only the static application at
`/`. The external reverse proxy or ingress routes `/api/` to the backend; the UI
container does not proxy backend requests in production.

### Deploying Under a Path Prefix

If the UI is published below a path prefix such as `/admin/`, the external
reverse proxy must strip that prefix before forwarding to the UI container. Use
matching UI runtime values for that public path:

```bash
IMAGE_TAG="$(node -p "require('./package.json').version")"
docker run --rm \
  -p 4200:80 \
  -e APP_BASE_HREF=/admin/ \
  -e API_BASE_URL=/node \
  docker.madgik.di.uoa.gr/eosc-node-endpoint-ui:"${IMAGE_TAG}"
```

For this layout, route `/node/` to the backend service and configure the OAuth2
provider/backend callback URL with the public backend callback path, for example
`/node/login/oauth2/code/eosc`.

The recommended reverse-proxy shape is to strip the UI prefix before forwarding
to the container. For example, `/admin/` should reach the UI container as `/`.
The container should still receive `APP_BASE_HREF=/admin/`, so browser asset and
router URLs are generated under the public UI path.

## Useful Commands

```bash
npm run lint
npm run test
```

[eosc-logo]: https://eosc.eu/wp-content/uploads/2024/02/EOSC-Beyond-logo.png
