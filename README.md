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

Create two Vercel projects from this repo:

1. **main**: root directory `main`, framework Next.js. Domain `www.colebjohnson.com` (redirect the apex to `www`).
2. **portfolio**: root directory `portfolio`, framework Jekyll. Domain `portfolio.colebjohnson.com`.

Each folder's `vercel.json` skips builds when that folder did not change.

DNS cutover, after both preview deployments look right:

1. Add both domains in Vercel.
2. Point `www` and `portfolio` CNAME records to `cname.vercel-dns.com`, and the apex A record to `76.76.21.21`.
3. Disable GitHub Pages on `coleonguard.github.io` and `coleonguard/portfolio`, then delete the `CNAME` files in this repo.
4. Archive `coleonguard/portfolio`.
