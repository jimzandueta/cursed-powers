FROM node:22-alpine AS base
WORKDIR /app

# ── Dependencies ──────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN npm install

# ── Dev target (hot reload via tsx watch) ─────────────
FROM deps AS dev
COPY . .
RUN npm run --workspace=@cursed-wishes/shared build
CMD ["npm", "run", "--workspace=@cursed-wishes/api", "dev"]

# ── Build ─────────────────────────────────────────────
FROM deps AS build
COPY . .
RUN npm run --workspace=@cursed-wishes/shared build
RUN npm run --workspace=@cursed-wishes/api build

# ── Production ────────────────────────────────────────
FROM node:22-alpine AS production
RUN addgroup -g 1001 -S app && adduser -S app -u 1001
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/packages/shared/dist ./node_modules/@cursed-wishes/shared/dist
COPY --from=build /app/packages/shared/package.json ./node_modules/@cursed-wishes/shared/package.json

RUN mkdir -p /app/data && chown app:app /app/data
USER app

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s CMD wget --spider -q http://localhost:3001/api/v1/health || exit 1
CMD ["node", "dist/index.js"]
