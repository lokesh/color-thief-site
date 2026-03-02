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

  initNavSpy();
}

function initNavSpy() {
  // Collect every section referenced by any nav link (mobile or desktop)
  const allLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sectionIds = new Set();
  allLinks.forEach(link => {
    const id = link.hash?.slice(1);
    if (id) sectionIds.add(id);
  });

  // Resolve to elements, keep DOM order
  const sections = Array.from(sectionIds)
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length) return;

  function update() {
    // Find the most specific visible section (last in DOM order whose top
    // is above the viewport center and whose bottom is still on screen)
    let currentId = null;
    for (const section of sections) {
      if (section.offsetParent === null) continue;
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.5 && rect.bottom > 60) {
        currentId = section.id;
      }
    }

    updateMobileNavs(currentId);
    updateDesktopNavs(currentId);
  }

  const observer = new IntersectionObserver(update, {
    threshold: 0,
    rootMargin: '-60px 0px -50% 0px',
  });

  sections.forEach(s => observer.observe(s));
}

function updateMobileNavs(currentId) {
  document.querySelectorAll('.mobile-nav').forEach(nav => {
    if (nav.offsetParent === null) return;

    const links = nav.querySelectorAll('.mobile-nav-link');
    links.forEach(l => l.classList.remove('active'));

    if (!currentId) return;

    // Direct match or walk up the DOM to find a parent section with a nav link
    let activeLink = nav.querySelector(`.mobile-nav-link[href="#${currentId}"]`);
    if (!activeLink) {
      const section = document.getElementById(currentId);
      let parent = section?.parentElement;
      while (parent) {
        if (parent.id) {
          activeLink = nav.querySelector(`.mobile-nav-link[href="#${parent.id}"]`);
          if (activeLink) break;
        }
        parent = parent.parentElement;
      }
    }

    if (activeLink) {
      activeLink.classList.add('active');
      // Scroll only the inner scroll container horizontally — avoid
      // scrollIntoView which scrolls all ancestors and causes sticky-nav jank.
      const scroller = nav.querySelector('.mobile-nav-scroll');
      if (scroller) {
        const scrollerLeft = scroller.getBoundingClientRect().left;
        const scrollerWidth = scroller.offsetWidth;
        const linkLeft = activeLink.getBoundingClientRect().left;
        const linkWidth = activeLink.offsetWidth;
        const targetScroll = scroller.scrollLeft + (linkLeft - scrollerLeft) - (scrollerWidth - linkWidth) / 2;
        scroller.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }
  });
}

function updateDesktopNavs(currentId) {
  document.querySelectorAll('.nav').forEach(nav => {
    if (nav.offsetParent === null) return;

    nav.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    if (!currentId) return;

    // Find the exact link for this section
    let activeLink = nav.querySelector(`.nav-link[href="#${currentId}"]`);

    if (activeLink) {
      activeLink.classList.add('active');

      // If it's a sub-link, also activate its parent top-level link
      if (activeLink.classList.contains('nav-link-sub')) {
        const parentItem = activeLink.closest('.nav-list-item');
        const parentLink = parentItem?.querySelector(':scope > .nav-link');
        if (parentLink) parentLink.classList.add('active');
      }
    } else {
      // Walk up the DOM to find a parent section that has a desktop nav link
      const section = document.getElementById(currentId);
      let parent = section?.parentElement;
      while (parent) {
        if (parent.id) {
          activeLink = nav.querySelector(`.nav-link[href="#${parent.id}"]`);
          if (activeLink) {
            activeLink.classList.add('active');
            break;
          }
        }
        parent = parent.parentElement;
      }
    }
  });
}
