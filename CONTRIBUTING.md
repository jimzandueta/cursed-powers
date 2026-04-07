# Contributing to Cursed Powers

Thanks for wanting to make superpowers even more cursed! Here's how to contribute.

## Getting Started

1. Fork the repo
2. Clone your fork
3. Install dependencies: `npm install`
4. Copy env: `cp .env.example .env` and add your API key(s)
5. Start dev: `npm run dev`

## Development

This is a monorepo with npm workspaces + Turborepo:

- `apps/web` — Next.js frontend (port 3000)
- `apps/api` — Fastify backend (port 3001)
- `packages/shared` — Shared Zod schemas & types

### Commands

```bash
npm run dev        # Run both frontend + backend
npm run build      # Production build
npm run clean      # Clean build artifacts
```

## Making Changes

1. Create a branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes
3. Test locally with `npm run build` to ensure everything compiles
4. Commit with a clear message (see below)
5. Push and open a PR

### Commit Messages

Use clear, descriptive commit messages:

- `feat: add share button to wish results`
- `fix: spinner not centered on mobile`
- `chore: update dependencies`
- `docs: add deployment guide`

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Fill out the PR template
- Make sure the build passes
- Add a brief description of what changed and why

## Reporting Bugs

Use the **Bug Report** issue template. Include:

- Steps to reproduce
- Expected vs actual behavior
- Browser/OS info if relevant
- Screenshots if it's a UI issue

## Suggesting Features

Use the **Feature Request** issue template. We love creative ideas for making wishes more cursed.

## Code Style

- TypeScript everywhere
- No `any` types unless absolutely necessary
- Tailwind for styling (no custom CSS files beyond `globals.css`)
- Framer Motion for animations

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
