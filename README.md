# Mothomeng Village website

A dependency-free, static website for Mothomeng Village in Ga-Modjadji, Limpopo. The design uses a restrained Balobedu-inspired palette and beadwork geometry without invented village or gallery photography.

## Local preview

Requirements: Node.js 20 or newer.

```bash
npm run dev
```

Open `http://localhost:4173`. Run the project checks with:

```bash
npm run build
```

There are no packages to install. The build copies the static files into `dist/` and renders the community notices from `data/notices.json` into `dist/index.html`. `npm run dev` builds first, then serves `dist/`.

## Deploy to Netlify

### From Git

1. Push this folder to a Git repository.
2. In Netlify, choose **Add new project → Import an existing project** and select the repository.
3. Netlify reads `netlify.toml`; the build command is `npm run build` and the publish directory is `dist`.
4. Deploy the project.
5. In Netlify, open **Forms** and select **Enable form detection**, then redeploy. The contact form will appear as `village-enquiry`.
6. Configure a form-submission email notification for the village contact address if required.

### Manual deploy

Run `npm run build` and upload the `dist/` folder to Netlify Drop. Deploying from Git is preferred: it keeps a history of every change and runs the checks on each deploy.

## Connect `mothomeng.co.za`

1. Deploy the site first and confirm the temporary `*.netlify.app` address works.
2. In Netlify, open **Domain management → Add domain → Add a domain you already own**. Enter `mothomeng.co.za`, verify it, and add it to this project before changing DNS.
3. Choose one DNS route:
   - **Netlify DNS:** follow Netlify’s prompts and replace the domain’s name servers at the registrar with the four Netlify name servers shown for the domain.
   - **Keep external DNS:** use the exact records shown under **Pending DNS verification**. For the standard network, the preferred apex record is an `ALIAS`, `ANAME`, or flattened `CNAME` from `@` to `apex-loadbalancer.netlify.com`; if the DNS provider does not support that, use an `A` record from `@` to `75.2.60.5`. Point `www` with a `CNAME` to the project’s current `mothomeng-bolobedu.netlify.app` hostname (or the actual Netlify project hostname if it changes).
4. Set `mothomeng.co.za` as the primary production domain. Netlify will keep the `www` alternative and redirect it to the primary domain.
5. Wait for DNS verification and the automatic TLS certificate. DNS changes can take up to 24–48 hours to propagate.
6. Test both `https://mothomeng.co.za` and `https://www.mothomeng.co.za`, then submit the contact form once and verify it appears in Netlify Forms.

The canonical, Open Graph, sitemap and robots URLs are already set to `https://mothomeng.co.za/`. If another domain becomes primary, update those absolute URLs in `index.html`, `robots.txt` and `sitemap.xml`.

## Content and image updates

- The current Headman’s portrait is stored as `assets/chief-mapolokwane-aubrey-mahasha.jpeg`. Keep the original approved photograph and its meaningful alternative text if the layout is revised.
- Do not add stock or AI-generated people as village documentation. A future gallery should open only after enough authentic, permission-cleared Mothomeng photographs are available.
- The 500-year estimate and early Mahasha lineage are labelled as oral history. Keep that qualification unless documentary sources are added.
- The location section points to the exact Mothomeng Royal House pin supplied by the village: `https://maps.app.goo.gl/37qjnxW5KotMJM6Q8`.
- Confirm leadership names, contact details and administrative information before each major publication.

## Project map

- `index.html` — all public page content and metadata (except notices)
- `data/notices.json` — community notices
- `assets/styles.css` — responsive visual system
- `assets/site.js` — accessible menu, header and in-browser notice expiry
- `assets/og-mothomeng.jpg` — social sharing card
- `assets/chief-mapolokwane-aubrey-mahasha.jpeg` — approved portrait of the current Headman
- `netlify.toml` — build, caching and security headers
- `robots.txt`, `sitemap.xml`, `site.webmanifest` — discovery and install metadata
- `scripts/build.mjs` — builds `dist/`, validates and renders notices
- `scripts/check.mjs` — checks the built site
- `scripts/serve.mjs` — local preview server for `dist/`
- `.github/workflows/daily-rebuild.yml` — daily Netlify rebuild so expired notices are removed

## October 2026 design refinement

The site uses a defined type scale, body text and labels at 16px or larger, an 8px spacing rhythm, and 180ms feedback for menu and button interactions. Content remains visible when JavaScript is unavailable. Brand accents are restricted to forest green, ochre and red alongside warm paper and ink. The existing Headman photograph, leadership names, oral-history qualifications, enquiry form and exact Royal House pin are retained.

Community notices appear below the introduction. The village directory and visit-planning panel connect visitors to notices, residence enquiries and directions. Mobile navigation supports Escape, keyboard focus containment and closing when switching to the desktop layout. Notices are rendered at build time and re-checked in the browser on tab return and every minute.

### Compact spacing and tab icon

Section padding is 40–64px. The village introduction uses two columns on desktop, with its label, heading and facts grouped together beside the copy, and stacks on smaller screens. Desktop portraits and the lineage timeline are constrained to avoid unnecessary vertical space.

The browser-tab favicon is `assets/bright-fusion-favicon.png`, an unchanged copy of the amber icon published by the Bright Fusion at `https://thebrightfusion.co.za/wp-content/uploads/2024/08/2c6952ee-d00e-8160-8004-cdf4fe30cfd9.png`, reused at the site owner's request. All three HTML pages use it; home-screen icons retain the village monogram.

## Community notices

Notices live in `data/notices.json`, not in `index.html`. To post one, add an entry and commit it to `main`:

```json
{
  "id": "water-outage-2026-11",
  "published": "2026-11-03",
  "expires": "2026-11-10",
  "title": "Water supply interruption on 5 November.",
  "body": ["First paragraph.", "Optional second paragraph."]
}
```

- `id`: unique; lowercase letters, numbers and hyphens. It also becomes the notice's link, for example `https://mothomeng.co.za/#notice-water-outage-2026-11`.
- `published`: the date the notice starts showing.
- `expires`: optional. The last day the notice is shown. Leave it out to show the notice for 30 days. For ongoing work, set it to the expected end date and extend it if needed.
- `body`: plain text only; HTML is shown as text.

Each build includes only notices active on that day (Africa/Johannesburg). If the file is invalid, the build fails with a list of problems and the live site stays as it was. A daily rebuild, set up in `.github/workflows/daily-rebuild.yml`, removes expired notices from the published page. The browser also hides a notice once it expires, for pages that are already open.

To preview a notice on a specific date: `BUILD_DATE=2026-11-05 npm run dev`.
