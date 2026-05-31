# Deploying with Docker Compose (Linux)

This app is a Vite + React SPA. On a Linux server, build and run it with **Docker Compose** using the repo `Dockerfile`.

## Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/) on the target Linux machine
- Supabase URL and anon key for production

## 1. Configure environment

From the repo root on the server:

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

These values are baked into the client at **image build time**. After changing them, rebuild the image (see below).

Optional: set `PORT` in `.env` to change the host port (default `8081`). The app inside the container always listens on `8080`.

## 2. Build and run

```bash
docker compose build
docker compose up -d
```

The app is available at `http://<server-ip>:8081` (or your chosen `PORT`).

## 3. View logs and stop

```bash
docker compose logs -f
docker compose down
```

## 4. Update after code or env changes

Pull the latest code, then:

```bash
docker compose build
docker compose up -d
```

If you only changed `.env` (Supabase values), you must run `docker compose build` again so Vite picks up the new build args.

## Local development (without Docker)

Use a `.env` file in the project root (same variables as above). Vite loads it for `npm run dev` and `npm run build`:

```bash
npm install
npm run dev
```

## Troubleshooting

- **Blank page or Supabase errors**  
  Confirm `.env` has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then run `docker compose build` and `docker compose up -d` again.

- **404 on refresh or direct URLs**  
  The container serves the SPA with `serve -s dist`. If routes fail, confirm the image built successfully and you are using this repo’s `Dockerfile`.

- **Port already in use**  
  Set a different `PORT` in `.env` and run `docker compose up -d` again.

## Production tips

- Put **nginx** or **Caddy** in front of the container for HTTPS and a custom domain.
- Open only the ports you need in the host firewall (e.g. `ufw allow 8081/tcp` if exposing the app directly).
