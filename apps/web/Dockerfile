FROM node:22-alpine AS base
WORKDIR /app

# ── Dependencies ──────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN npm install

# ── Dev target (next dev with hot reload) ─────────────
FROM deps AS dev
COPY . .
RUN npm run --workspace=@cursed-wishes/shared build
CMD ["npm", "run", "--workspace=@cursed-wishes/web", "dev"]

# ── Build ─────────────────────────────────────────────
FROM deps AS build
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run --workspace=@cursed-wishes/shared build
RUN npm run --workspace=@cursed-wishes/web build

# ── Production ────────────────────────────────────────
FROM node:22-alpine AS production
RUN addgroup -g 1001 -S app && adduser -S app -u 1001
WORKDIR /app

COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./.next/static
COPY --from=build /app/apps/web/public ./public

USER app
EXPOSE 3000
CMD ["node", "server.js"]
