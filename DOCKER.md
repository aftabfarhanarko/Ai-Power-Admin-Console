# SquadCart Console — Docker Guide 🐳

This repository is fully containerized for both local development and production. It uses a clean Node 20 environment to build the Vite bundle and serve it.

---

## 👨‍💻 For Developers (Local Setup)

You can spin up the console independently via Docker Compose.

### 1. Configure the `.env` file

```bash
cp .env.example .env
```

Ensure you have set `VITE_API_URL`. If you are running the `squadcart-backend` Docker stack locally, set it to:

```env
VITE_API_URL=http://localhost:8000
```

### 2. Start the Stack

This spins up the production preview server on port `4173`.

```bash
docker compose up -d
```

_(If you want hot-reloading in development, check the commented `command` and `ports` section in `docker-compose.yml` to switch to `npm run dev` mapping port `5173`)_

### 3. Check Logs

```bash
docker compose logs -f console
```

### 4. Stop the Stack

```bash
docker compose down
```

---

## 🛠 For DevOps (Production Deployment)

The `Dockerfile` is structured to satisfy Railway.app requirements out of the box.

- **Base Image**: `node:20-alpine`
- **Output Port**: `4173`
- **Start Command**: `npm run preview -- --host 0.0.0.0 --port 4173`

> **Critical**: Vite's `preview` command must be bound to `--host 0.0.0.0`, otherwise the app cannot be exposed outside the container in strictly configured environments like AWS/Railway.

### Build & Run Manually

```bash
docker build -t squadcart/console:latest .

docker run -d \
  --name squadcart-console-prod \
  -p 4173:4173 \
  -e VITE_API_URL="https://squadcart-backend.up.railway.app" \
  squadcart/console:latest
```
