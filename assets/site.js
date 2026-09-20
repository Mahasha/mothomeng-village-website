const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('#mobile-menu');
const year = document.querySelector('[data-year]');
const noticeList = document.querySelector('[data-notices-list]');
const notices = [...document.querySelectorAll('[data-notice]')];
const noticesEmpty = document.querySelector('[data-notices-empty]');
const noticeCounts = document.querySelectorAll('[data-notice-count]');

const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const closeMenu = () => {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  mobileMenu.hidden = true;
  document.body.classList.remove('menu-open');
};

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  mobileMenu.hidden = isOpen;
  document.body.classList.toggle('menu-open', !isOpen);
});

mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

if (year) year.textContent = String(new Date().getFullYear());

const noticeLifetime = 30 * 24 * 60 * 60 * 1000;
const noticeDateFormatter = new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Johannesburg',
});

const updateNotices = (now = Date.now()) => {
  let activeCount = 0;

  notices.forEach((notice) => {
    const published = notice.dataset.published;
    const publishedAt = new Date(`${published}T00:00:00+02:00`).getTime();
    const expiresAt = publishedAt + noticeLifetime;
    const isActive = Number.isFinite(publishedAt) && now >= publishedAt && now < expiresAt;

    notice.hidden = !isActive;
    if (!isActive) return;

    activeCount += 1;
    const expiry = notice.querySelector('[data-notice-expiry]');
    if (expiry) {
      const lastVisibleDay = new Date(expiresAt - 1);
      expiry.textContent = `Available through ${noticeDateFormatter.format(lastVisibleDay)}.`;
    }
  });

  if (noticeList) noticeList.hidden = activeCount === 0;
  if (noticesEmpty) noticesEmpty.hidden = activeCount > 0;
  noticeCounts.forEach((count) => {
    count.textContent = String(activeCount);
    count.hidden = activeCount === 0;
  });
};

updateNotices();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      instance.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealItems.forEach((item) => observer.observe(item));
}
