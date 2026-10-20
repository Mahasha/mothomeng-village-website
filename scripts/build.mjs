// Builds the publishable site into dist/.
//
// The source files are copied unchanged, except index.html, which receives the
// community notices from data/notices.json. Only notices that are active on the
// build date (Africa/Johannesburg) are rendered, so crawlers, link previews and
// visitors without JavaScript never see an expired notice. assets/site.js applies
// the same rule in the browser for notices that expire between rebuilds.
//
// If data/notices.json is invalid the build fails and Netlify keeps the last
// good deploy live.

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { runChecks } from './check.mjs';

const OUT = 'dist';
const TIME_ZONE = 'Africa/Johannesburg';
const DEFAULT_LIFETIME_DAYS = 30;
const PUBLISH = [
  'index.html', '404.html', 'thank-you.html',
  'robots.txt', 'sitemap.xml', 'site.webmanifest',
  'assets',
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Today's date in the village's time zone, as YYYY-MM-DD.
// BUILD_DATE overrides it so the expiry rules can be tested for any date.
const today = () => process.env.BUILD_DATE
  ?? new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date());

const addDays = (isoDate, days) => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const isRealDate = (value) => ISO_DATE.test(value)
  && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const formatDate = (isoDate) => new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${isoDate}T00:00:00Z`));

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export const validateNotices = (data) => {
  const errors = [];
  if (!data || !Array.isArray(data.notices)) {
    return ['data/notices.json must contain a "notices" list.'];
  }
  const seen = new Set();
  data.notices.forEach((notice, index) => {
    const at = `notice ${index + 1}${notice?.id ? ` (${notice.id})` : ''}`;
    if (typeof notice?.id !== 'string' || !ID.test(notice.id)) errors.push(`${at}: "id" must use lowercase letters, numbers and hyphens.`);
    else if (seen.has(notice.id)) errors.push(`${at}: "id" is used more than once.`);
    else seen.add(notice.id);
    if (typeof notice?.title !== 'string' || !notice.title.trim()) errors.push(`${at}: "title" is required.`);
    if (!Array.isArray(notice?.body) || !notice.body.length || notice.body.some((p) => typeof p !== 'string' || !p.trim())) {
      errors.push(`${at}: "body" must be a list of one or more paragraphs.`);
    }
    if (!isRealDate(notice?.published)) errors.push(`${at}: "published" must be a real date written as YYYY-MM-DD.`);
    if (notice?.expires !== undefined) {
      if (!isRealDate(notice.expires)) errors.push(`${at}: "expires" must be a real date written as YYYY-MM-DD.`);
      else if (isRealDate(notice.published) && notice.expires < notice.published) errors.push(`${at}: "expires" is before "published".`);
    }
  });
  return errors;
};

// Last day the notice is shown (inclusive).
export const lastDay = (notice) => notice.expires ?? addDays(notice.published, DEFAULT_LIFETIME_DAYS - 1);

export const activeNotices = (notices, onDate) => notices
  .filter((notice) => notice.published <= onDate && onDate <= lastDay(notice))
  .sort((a, b) => b.published.localeCompare(a.published));

const renderNotice = (notice) => {
  const headingId = `notice-${notice.id}-title`;
  const until = lastDay(notice);
  const paragraphs = notice.body.map((p) => `              <p>${escapeHtml(p.trim())}</p>`).join('\n');
  return `
          <article class="community-notice" id="notice-${notice.id}" data-notice data-published="${notice.published}" data-expires="${until}" aria-labelledby="${headingId}">
            <div>
              <p class="eyebrow">Posted · <time datetime="${notice.published}">${formatDate(notice.published)}</time></p>
              <h3 id="${headingId}">${escapeHtml(notice.title.trim())}</h3>
            </div>
            <div class="notice-body">
${paragraphs}
              <p class="notice-expiry">Available through <time datetime="${until}">${formatDate(until)}</time>.</p>
            </div>
          </article>
        `;
};

const replaceOnce = (html, from, to) => {
  if (!html.includes(from)) throw new Error(`index.html is missing the expected markup: ${from}`);
  return html.replace(from, to);
};

export const renderIndex = (html, active) => {
  const count = active.length;
  let out = replaceOnce(html, '<!-- notices:start --><!-- notices:end -->', active.map(renderNotice).join(''));
  if (count === 0) {
    out = replaceOnce(out, '<div class="notices-list" data-notices-list>', '<div class="notices-list" data-notices-list hidden>');
    out = replaceOnce(out, 'data-notices-empty role="status" hidden>', 'data-notices-empty role="status">');
  } else {
    out = out.replaceAll('<span class="notice-count" data-notice-count hidden></span>', `<span class="notice-count" data-notice-count>${count}</span>`);
  }
  return out;
};

const main = async () => {
  const data = JSON.parse(await readFile('data/notices.json', 'utf8'));
  const errors = validateNotices(data);
  if (errors.length) {
    console.error(`data/notices.json has problems:\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }

  const date = today();
  const active = activeNotices(data.notices, date);

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  for (const entry of PUBLISH) await cp(entry, `${OUT}/${entry}`, { recursive: true });

  const html = await readFile('index.html', 'utf8');
  await writeFile(`${OUT}/index.html`, renderIndex(html, active));

  console.log(`Build date ${date} (${TIME_ZONE}): ${active.length} of ${data.notices.length} notice(s) active${active.length ? `: ${active.map((n) => n.id).join(', ')}` : ''}.`);
  await runChecks(OUT);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => { console.error(error.message); process.exit(1); });
}
