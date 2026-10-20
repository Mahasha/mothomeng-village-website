document.documentElement.classList.add('has-js');
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

const menuContent = [document.querySelector('main'), document.querySelector('.site-footer')];

const closeMenu = (restoreFocus = false) => {
  if (!menuButton || !mobileMenu) return;
  const wasOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  mobileMenu.hidden = true;
  document.body.classList.remove('menu-open');
  menuContent.forEach((element) => { if (element) element.inert = false; });
  if (wasOpen && restoreFocus) menuButton.focus();
};

menuButton?.addEventListener('click', () => {
  if (!mobileMenu) return;
  if (menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu(true);
    return;
  }
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Close navigation');
  mobileMenu.hidden = false;
  document.body.classList.add('menu-open');
  menuContent.forEach((element) => { if (element) element.inert = true; });
  mobileMenu.querySelector('a')?.focus();
});

mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  closeMenu();
  const target = document.querySelector(link.getAttribute('href'));
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}));
document.querySelector('.brand')?.addEventListener('click', () => closeMenu());
window.addEventListener('keydown', (event) => {
  if (menuButton?.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') closeMenu(true);
  if (event.key !== 'Tab') return;
  const links = [...mobileMenu.querySelectorAll('a')];
  const last = links.at(-1);
  if (event.shiftKey && (document.activeElement === links[0] || document.activeElement === menuButton)) {
    event.preventDefault();
    (document.activeElement === links[0] ? menuButton : last)?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    menuButton.focus();
  } else if (!event.shiftKey && document.activeElement === menuButton) {
    event.preventDefault();
    links[0]?.focus();
  }
});
window.matchMedia('(min-width: 1201px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});

if (year) year.textContent = String(new Date().getFullYear());

// The build renders only notices that are active on the build date.
// This hides any that expire before the next rebuild, for pages already open or cached.
// data-expires is the last day a notice is shown, in Africa/Johannesburg time.
const startOfDay = (isoDate) => new Date(`${isoDate}T00:00:00+02:00`).getTime();
const dayMs = 24 * 60 * 60 * 1000;

const updateNotices = (now = Date.now()) => {
  let activeCount = 0;

  notices.forEach((notice) => {
    const publishedAt = startOfDay(notice.dataset.published);
    const endsAt = startOfDay(notice.dataset.expires) + dayMs;
    const isActive = Number.isFinite(publishedAt) && Number.isFinite(endsAt) && now >= publishedAt && now < endsAt;

    notice.hidden = !isActive;
    if (isActive) activeCount += 1;
  });

  if (noticeList) noticeList.hidden = activeCount === 0;
  if (noticesEmpty) noticesEmpty.hidden = activeCount > 0;
  noticeCounts.forEach((count) => {
    count.textContent = String(activeCount);
    count.hidden = activeCount === 0;
  });
};

updateNotices();

// Refresh notices when a long-lived tab returns to the foreground.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) updateNotices();
});
setInterval(updateNotices, 60_000);
