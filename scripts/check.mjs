import { access, readFile } from 'node:fs/promises';
const required = ['index.html','404.html','thank-you.html','robots.txt','sitemap.xml','site.webmanifest','netlify.toml','assets/styles.css','assets/site.js','assets/og-mothomeng.png','assets/favicon-32.png','assets/apple-touch-icon.png','assets/icon-192.png','assets/icon-512.png','assets/chief-mapolokwane-aubrey-mahasha.jpeg'];
const missing = [];
for (const file of required) { try { await access(file); } catch { missing.push(file); } }
if (missing.length) { console.error(`Missing required files:\n- ${missing.join('\n- ')}`); process.exit(1); }
const html = await readFile('index.html','utf8');
const checks = ['https://mothomeng.co.za/','data-netlify="true"','id="lineage"','id="leadership"','id="contact"','https://maps.app.goo.gl/37qjnxW5KotMJM6Q8','−23.640432, 30.377490'];
const absent = checks.filter((value) => !html.includes(value));
if (absent.length) { console.error(`Required markup not found:\n- ${absent.join('\n- ')}`); process.exit(1); }

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
const hashLinks = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
const brokenHashLinks = [...new Set(hashLinks.filter((target) => !ids.has(target)))];
if (brokenHashLinks.length) {
  console.error(`Navigation targets not found:\n- ${brokenHashLinks.join('\n- ')}`);
  process.exit(1);
}

const expectedMenuTargets = ['village','heritage','lineage','leadership','today','location','contact'];
const missingMenuTargets = expectedMenuTargets.filter((target) => !hashLinks.includes(target) || !ids.has(target));
if (missingMenuTargets.length) {
  console.error(`Required menu routes are missing:\n- ${missingMenuTargets.join('\n- ')}`);
  process.exit(1);
}

if (!html.includes('Mr. Mapolokwane Aubrey Mahasha') || !html.includes('assets/chief-mapolokwane-aubrey-mahasha.jpeg')) {
  console.error('The current Chief’s full name or portrait is missing from the page.');
  process.exit(1);
}

console.log(`Verified ${hashLinks.length} in-page links against ${ids.size} section and page targets.`);
console.log('Site check passed.');
