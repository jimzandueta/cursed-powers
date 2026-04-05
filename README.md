# Cursed Wishes 🧞

**Every superpower has a catch.**

A web app where you rub a magic lamp, summon a genie, wish for a superpower, and Gemini AI returns a hilariously cursed version.

## Stack

- **Frontend**: Next.js 15 + Tailwind CSS v4 + Framer Motion
- **Backend**: Fastify 5 + Drizzle ORM + SQLite
- **AI**: Google Gemini 2.0 Flash
- **Monorepo**: npm workspaces + Turborepo

## Setup

```bash
# Clone and install
npm install

# Copy env and add your Gemini API key
cp .env.example .env

# Build shared package
npm run --workspace=@cursed-wishes/shared build

# Run both frontend + backend
npm run dev
```

### With Docker

```bash
cp .env.example .env
# Edit .env with your GEMINI_API_KEY
docker compose up
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health check: http://localhost:3001/api/v1/health

## Project Structure

```
├── apps/
│   ├── api/          # Fastify backend
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Shared Zod schemas & types
├── docker-compose.yml
└── turbo.json
```

## API Endpoints

| Method | Path                    | Description            |
| ------ | ----------------------- | ---------------------- |
| POST   | `/api/v1/wishes`        | Generate a cursed wish |
| GET    | `/api/v1/wishes/:id`    | Get a wish by ID       |
| GET    | `/api/v1/wishes`        | Gallery listing        |
| GET    | `/api/v1/wishes/random` | Random wish            |
| GET    | `/api/v1/health`        | Health check           |

## Environment Variables

See `.env.example` for all required variables. The only required secret is `GEMINI_API_KEY`.
