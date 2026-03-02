export default function initScrollLinks() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('.nav-link');
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
}
