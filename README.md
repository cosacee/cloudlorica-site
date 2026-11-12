# cloudlorica-site

Personal engineering portfolio — infrastructure, automation and self-hosted systems.
Static site built with **Astro**, deployed to **Cloudflare Pages** at
`https://cloudlorica.uk`.

## How the pipeline works

```
local edit → git push → GitHub → Cloudflare Pages build → cloudlorica.uk
```

A failed build **does not** replace the live deployment, so pushing a broken commit
is recoverable — the previous production deploy keeps serving.

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 22 or newer (set `NODE_VERSION=22` in Pages if the build misbehaves)

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # produces dist/
npm run preview  # serve the built output
```

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
