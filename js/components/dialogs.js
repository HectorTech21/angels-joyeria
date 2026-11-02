import { gsap, canAnimate } from '../lib/motion.js';
let active = null;

export function closeDialog({ instant = false } = {}) {
  if (!active) return;
  const dialog = active;
  active = null;
  const inner = dialog.querySelector('.sheet-inner');
  gsap?.killTweensOf([inner, dialog]);
  const finish = () => { dialog.close(); document.body.classList.toggle('dialog-open', Boolean(document.querySelector('dialog[open]'))); };
  if (instant || !canAnimate()) { finish(); return; }
  gsap.to(dialog, { '--backdrop-alpha': 0, duration: .25 });
  gsap.to(inner, { xPercent: 102, duration: .3, ease: 'power3.in', onComplete: finish });
}

export function openDialog(name) {
  const dialog = document.querySelector(`#${name}-dialog`);
  if (!dialog) return;
  if (active === dialog) return;
  closeDialog({ instant: true });
  // Finish any previous closing animation before opening another modal.
  document.querySelectorAll('dialog[open]').forEach((other) => { gsap?.killTweensOf([other, other.querySelector('.sheet-inner')]); other.close(); });
  active = dialog;
  const inner = dialog.querySelector('.sheet-inner');
  const menuLinks = inner.querySelectorAll('.mobile-nav a');
  gsap?.killTweensOf([inner, dialog]);
  if (gsap) {
    gsap.set(dialog, { '--backdrop-alpha': canAnimate() ? 0 : .38 });
    gsap.set(inner, { xPercent: canAnimate() ? 102 : 0 });
    if (menuLinks.length) gsap.set(menuLinks, { clearProps: 'transform,opacity' });
  } else {
    dialog.style.setProperty('--backdrop-alpha', '.38');
    inner.style.transform = 'none';
  }
  dialog.showModal();
  document.body.classList.add('dialog-open');
  if (canAnimate()) {
    gsap.to(dialog, { '--backdrop-alpha': .38, duration: .4 });
    gsap.to(inner, { xPercent: 0, duration: .55, ease: 'power3.out' });
    if (name === 'menu') gsap.fromTo(inner.querySelectorAll('.mobile-nav a'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: .045, delay: .15, duration: .45, ease: 'power2.out' });
  }
  if (name === 'search') document.querySelector('#search-input').focus({ preventScroll: true });
}

export function initDialogs() {
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (event) => {
    if (!event.matches || !gsap) return;
    document.querySelectorAll('dialog[open]').forEach((dialog) => {
      const inner = dialog.querySelector('.sheet-inner');
      gsap.killTweensOf([dialog, inner, ...inner.querySelectorAll('.mobile-nav a')]);
      gsap.set(inner, { xPercent: 0 });
      const menuLinks = inner.querySelectorAll('.mobile-nav a');
      if (menuLinks.length) gsap.set(menuLinks, { clearProps: 'transform,opacity' });
      gsap.set(dialog, { '--backdrop-alpha': .38 });
      if (active !== dialog) dialog.close();
    });
  });
  document.addEventListener('click', (event) => {
    const open = event.target.closest('[data-open]');
    if (open) openDialog(open.dataset.open);
    if (event.target.closest('[data-close]')) closeDialog();
    const link = event.target.closest('dialog a[href]');
    if (link) closeDialog({ instant: true });
  });
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeDialog(); });
    let downOnBackdrop = false;
    dialog.addEventListener('pointerdown', (event) => { downOnBackdrop = event.target === dialog; });
    dialog.addEventListener('click', (event) => { if (downOnBackdrop && event.target === dialog) closeDialog(); });
    dialog.addEventListener('close', () => { if (active === dialog) active = null; document.body.classList.toggle('dialog-open', Boolean(document.querySelector('dialog[open]'))); });
  });
}
