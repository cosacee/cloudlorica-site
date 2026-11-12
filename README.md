# cloudlorica-site

Personal engineering portfolio — infrastructure, automation and self-hosted systems.
Static site built with **Astro**, deployed to **Cloudflare Pages** at
`https://cloudlorica.uk`.

## How the pipeline works

```
git push origin main
   └─ GitHub Actions: .github/workflows/deploy.yml
        ├─ npm ci
        ├─ npm run build      → dist/
        └─ wrangler pages deploy dist --project-name=cloudlorica-site
             └─ live at https://cloudlorica.uk
```

Push-to-deploy is handled by **GitHub Actions**, not Cloudflare's Git integration.
This is deliberate: Cloudflare's Pages GitHub App requires a browser OAuth + 2FA
flow that cannot be completed over the API (`error 8000011`). The Actions route
needs no dashboard interaction and lives entirely in this repo.

**Required repo secrets** (Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Token with **Cloudflare Pages: Edit** on the account |
| `CLOUDFLARE_ACCOUNT_ID` | The Cloudflare account ID |

A failed build never replaces the live deployment — the previous production
deploy keeps serving.

Manual deploy (still works, useful for testing before pushing):

```bash
npm run deploy     # build + wrangler pages deploy
```

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # produces dist/
npm run preview  # serve the built output
```

Note: the CI runner uses **Node 22 LTS**. The local machine may be newer; both build fine.

## Where the content lives

| File | What it controls |
|---|---|
| `src/data/site.js` | Name, role, headline, contact links, hero stats |
| `src/data/caseStudies.js` | Every case study — the substance of the site |
| `src/pages/index.astro` | Home page layout and the stack section |
| `src/pages/case-studies/[slug].astro` | Case study page template |
| `src/styles/global.css` | All styling, no external dependencies |
| `public/cv.pdf` | CV download — **replace the placeholder** |

## Adding a case study

Append an object to `caseStudies` in `src/data/caseStudies.js`. The route is
generated automatically from `slug`; no other file needs editing. Required shape:

```js
{
  slug, title, summary, metric, stack: [],
  role, context, constraints: [], decisions: [{ title, body }],
  outcome: [], lessons
}
```

## Content rules — read before publishing

A public homelab write-up is also a reconnaissance document. **Do not** commit:

- internal IP addresses or subnets (use `10.x.x.x`, `docker-host`, `edge-proxy`)
- service hostnames that are not already public
- tokens, API keys, account IDs, tunnel IDs, or `.env` contents
- screenshots of live dashboards (they expose hostnames, addresses and keys)

Prefer diagrams over screenshots — more legible to a reader, and nothing to leak.
Commit history is public too: check before pushing, not after.

## Placeholders still to replace

- [ ] `PLACEHOLDER NAME` in `src/data/site.js`
- [ ] hero stats (`years in infrastructure`)
- [ ] `public/cv.pdf` — currently a stub
- [ ] `hello@cloudlorica.uk` — confirm this mailbox exists
- [ ] LinkedIn URL once available
- [ ] Review all five case studies for accuracy and for anything too specific
- [ ] Remove the "Placeholder build" note in `src/layouts/Layout.astro`
