// Checks the built site in dist/. Run through `npm run build`, which builds first.
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const fail = (message) => { throw new Error(message); };

export const runChecks = async (dir = 'dist') => {
  const required = ['index.html','404.html','thank-you.html','robots.txt','sitemap.xml','site.webmanifest','assets/styles.css','assets/site.js','assets/og-mothomeng.jpg','assets/favicon-32.png','assets/apple-touch-icon.png','assets/icon-192.png','assets/icon-512.png','assets/chief-mapolokwane-aubrey-mahasha.jpeg'];
  const missing = [];
  for (const file of required) { try { await access(join(dir, file)); } catch { missing.push(file); } }
  if (missing.length) fail(`Missing required files in ${dir}/:\n- ${missing.join('\n- ')}`);

  const html = await readFile(join(dir, 'index.html'), 'utf8');
  const checks = ['https://mothomeng.co.za/','data-netlify="true"','id="lineage"','id="leadership"','id="notices"','data-notices-list','data-notices-empty','id="contact"','https://maps.app.goo.gl/37qjnxW5KotMJM6Q8','-23.640432, 30.377490'];
  const absent = checks.filter((value) => !html.includes(value));
  if (absent.length) fail(`Required markup not found:\n- ${absent.join('\n- ')}`);

  if (html.includes('notices:start') || html.includes('notices:end')) fail('Notice placeholders were not replaced by the build.');
  if (html.includes('−')) fail('index.html contains a Unicode minus sign (U+2212). Use an ASCII hyphen so coordinates can be pasted into map apps.');

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  const hashLinks = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
  const brokenHashLinks = [...new Set(hashLinks.filter((target) => !ids.has(target)))];
  if (brokenHashLinks.length) fail(`Navigation targets not found:\n- ${brokenHashLinks.join('\n- ')}`);

  const expectedMenuTargets = ['village','heritage','lineage','leadership','today','notices','living','location','contact'];
  const missingMenuTargets = expectedMenuTargets.filter((target) => !hashLinks.includes(target) || !ids.has(target));
  if (missingMenuTargets.length) fail(`Required menu routes are missing:\n- ${missingMenuTargets.join('\n- ')}`);

  if (!html.includes('Mr. Mapolokwane Aubrey Mahasha') || !html.includes('Current Headman') || !html.includes('assets/chief-mapolokwane-aubrey-mahasha.jpeg')) {
    fail('The current Headman’s full name, title or portrait is missing from the page.');
  }

  if (!html.includes('mailto:info@mothomeng.co.za') || html.includes('molozwi@gmail.com')) {
    fail('The official village email address is missing or the former address is still present.');
  }

  console.log(`Verified ${hashLinks.length} in-page links against ${ids.size} section and page targets.`);
  console.log('Site check passed.');
};

if (import.meta.url === `file://${process.argv[1]}`) {
  runChecks(process.argv[2]).catch((error) => { console.error(error.message); process.exit(1); });
}
