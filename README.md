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

There are no packages to install and no generated build directory. The project is served directly as static files.

## Deploy to Netlify

### From Git

1. Push this folder to a Git repository.
2. In Netlify, choose **Add new project → Import an existing project** and select the repository.
3. Netlify reads `netlify.toml`; the build command is `npm run build` and the publish directory is the project root (`.`).
4. Deploy the project.
5. In Netlify, open **Forms** and select **Enable form detection**, then redeploy. The contact form will appear as `village-enquiry`.
6. Configure a form-submission email notification for the village contact address if required.

### Manual deploy

Because the site has no compiled output, you can also upload the unzipped project folder to Netlify Drop. Keep `netlify.toml` at the uploaded folder root.

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

- `index.html` — all public page content and metadata
- `assets/styles.css` — responsive visual system
- `assets/site.js` — accessible menu, header and notice expiry behaviour
- `assets/og-mothomeng.png` — social sharing card
- `assets/chief-mapolokwane-aubrey-mahasha.jpeg` — approved portrait of the current Headman
- `netlify.toml` — build, caching and security headers
- `robots.txt`, `sitemap.xml`, `site.webmanifest` — discovery and install metadata
- `scripts/` — dependency-free local server and project checks

## October 2026 design refinement

The site uses a defined type scale, body text and labels at 16px or larger, an 8px spacing rhythm, and 180ms feedback for menu and button interactions. Content remains visible when JavaScript is unavailable. Brand accents are restricted to forest green, ochre and red alongside warm paper and ink. The existing Headman photograph, leadership names, oral-history qualifications, enquiry form and exact Royal House pin are retained.

Community notices appear below the introduction. The village directory and visit-planning panel connect visitors to notices, residence enquiries and directions. Mobile navigation supports Escape, keyboard focus containment and closing when switching to the desktop layout. Notices refresh on tab return and every minute.
