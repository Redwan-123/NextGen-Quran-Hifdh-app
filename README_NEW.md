# NextGen Quran — Hifdh App

A modern UI prototype for a Quran learning and hifdh companion app — built with Vite + React.

This repository contains the UI prototype, components, and a small dataset for demo purposes.

## Features
- Component library and UI patterns
- Surah / Ayah browsing and enhanced hifdh dashboard
- Motion-enabled interactions (framer-motion)
- Ready for Vercel deployment

## Quick Start

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment
This project is configured to build with Vite. Pushing `main` to GitHub will trigger your CI/CD (for example, Vercel) if connected. I pushed a cleanup branch `fix/vercel-cleanup` with import fixes — create a PR from that branch and merge to `main` or merge it directly to update `main`.

## Repo hygiene notes
- `dist/` should be ignored and not committed (build artifacts). I've added it to `.gitignore` and removed tracked `dist/` in this branch.
- Consider adding branch protection for `main` and enabling required checks in your repo settings.

## Contributing
Open an issue or create a PR. Keep changes small and include a short description for reviewers.

---

If you'd like, I can also tidy the project `package.json`, remove the committed `dist/` files from history, and create a proper PR description.
