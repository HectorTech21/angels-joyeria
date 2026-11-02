import { reducedMotion } from '../lib/motion.js';

// Native scroll inertia and snapping keep touch interaction under browser control.
export function initCarousels(root) {
  const cleanups = [];
  root.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const viewport = carousel.querySelector('.carousel-viewport');
    const slides = [...carousel.querySelectorAll('.carousel-slide')];
    const previous = carousel.querySelector('[data-prev]');
    const next = carousel.querySelector('[data-next]');
    const progress = carousel.querySelector('.carousel-progress span');
    const count = carousel.querySelector('.carousel-count');
    viewport.style.overflowX = 'auto';
    const step = () => slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : slides[0].clientWidth;
    const update = () => {
      const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      previous.disabled = viewport.scrollLeft < 2;
      next.disabled = viewport.scrollLeft >= max - 2;
      const index = Math.min(slides.length - 1, Math.round(viewport.scrollLeft / step()));
      count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      progress.style.width = `${max === 0 ? 100 : 22 + viewport.scrollLeft / max * 78}%`;
    };
    const scroll = (direction) => viewport.scrollBy({ left: step() * direction, behavior: reducedMotion() ? 'instant' : 'smooth' });
    previous.addEventListener('click', () => scroll(-1));
    next.addEventListener('click', () => scroll(1));
    viewport.addEventListener('scroll', update, { passive: true });
    viewport.addEventListener('keydown', (event) => {
      if (event.target !== viewport) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); scroll(event.key === 'ArrowRight' ? 1 : -1); }
    });
    let startX = 0, scrollStart = 0, dragging = false, moved = false;
    const onMove = (event) => {
      if (!dragging) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 5) { moved = true; viewport.style.scrollSnapType = 'none'; }
      if (moved) { event.preventDefault(); viewport.scrollLeft = scrollStart - delta; }
    };
    const onUp = () => { if (!dragging) return; dragging = false; viewport.style.scrollSnapType = ''; };
    viewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button')) return;
      dragging = true; moved = false; startX = event.clientX; scrollStart = viewport.scrollLeft;
    });
    viewport.addEventListener('dragstart', (event) => event.preventDefault());
    viewport.addEventListener('click', (event) => { if (moved) { event.preventDefault(); event.stopPropagation(); moved = false; } }, true);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('blur', onUp);
    const observer = new ResizeObserver(update); observer.observe(viewport); update();
    cleanups.push(() => {
      observer.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('blur', onUp);
    });
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
