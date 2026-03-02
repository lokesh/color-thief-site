export default function initScrollLinks() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('.nav-link, .mobile-nav-link');
    if (!link) return;

    event.preventDefault();
    const hash = link.hash;
    const target = document.querySelector(hash);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      history.replaceState(null, '', hash);
    }, 600);
  });

  initMobileNavSpy();
}

function initMobileNavSpy() {
  const mobileNavs = document.querySelectorAll('.mobile-nav');
  if (!mobileNavs.length) return;

  // Build a map from each mobile nav to its links and target sections
  const navDataMap = new Map();
  mobileNavs.forEach(nav => {
    const links = Array.from(nav.querySelectorAll('.mobile-nav-link'));
    const sections = links
      .map(link => ({ link, section: document.querySelector(link.hash) }))
      .filter(entry => entry.section);
    navDataMap.set(nav, sections);
  });

  const setActive = (nav, activeLink) => {
    const links = nav.querySelectorAll('.mobile-nav-link');
    links.forEach(l => l.classList.remove('active'));
    if (activeLink) {
      activeLink.classList.add('active');
      // Scroll the active link into view within the nav
      activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const observer = new IntersectionObserver(
    () => {
      // On any intersection change, find the topmost visible section for each nav
      navDataMap.forEach((entries, nav) => {
        // Skip hidden navs (e.g. the inactive version tab)
        if (nav.offsetParent === null) return;

        let best = null;
        for (const { link, section } of entries) {
          const rect = section.getBoundingClientRect();
          // Section is "in view" if its top is above the bottom half of the viewport
          // and its bottom is still below the nav bar
          if (rect.top < window.innerHeight * 0.5 && rect.bottom > 60) {
            best = link;
          }
        }
        setActive(nav, best);
      });
    },
    { threshold: 0, rootMargin: '-60px 0px -50% 0px' }
  );

  // Observe all target sections
  navDataMap.forEach(entries => {
    entries.forEach(({ section }) => observer.observe(section));
  });
}
