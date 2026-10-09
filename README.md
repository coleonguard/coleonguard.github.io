# colebjohnson.com

Two sites, one repo.

| Folder | Site | Stack |
| --- | --- | --- |
| `main/` | www.colebjohnson.com | Next.js + TypeScript + three.js |
| `portfolio/` | portfolio.colebjohnson.com | Jekyll (Hyde theme) |

## Main site

```bash
cd main
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
```

- Career copy lives in `main/content/` (`chapters.ts`, `research.ts`, `profile.ts`). The résumé is the source of truth.
- The particle scene is in `main/components/scene/`: `shapes.ts` defines the four forms, `engine.ts` runs the simulation and rendering outside React.
- Search for `TODO(confirm)` before launch.

## Portfolio

```bash
cd portfolio
bundle install
bundle exec jekyll serve
```

## Deploying (Vercel)

Two Vercel projects deploy from this repo on every push to `main`:

1. **colebjohnson**: root directory `main`, Next.js. Serves `www.colebjohnson.com`; the apex redirects to `www`.
2. **colebjohnson-portfolio**: root directory `portfolio`, Jekyll. Serves `portfolio.colebjohnson.com`.

Each folder's `vercel.json` skips builds when that folder did not change. DNS is hosted on Vercel.

GitHub Pages can't be disabled for a `username.github.io` repo, so the root `index.html` redirects `coleonguard.github.io` to `www.colebjohnson.com`.
