export const gsap = window.gsap || null;
export const ScrollTrigger = window.ScrollTrigger || null;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const canAnimate = () => Boolean(gsap && ScrollTrigger) && !reducedMotion();
export const refreshMotion = () => { if (gsap && ScrollTrigger) ScrollTrigger.refresh(); };

export function animatePage(root, { initial = false, home = false } = {}) {
  if (!gsap || !ScrollTrigger) return () => {};
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    if (home) {
      const hero = root.matches('.hero') ? root : root.querySelector('.hero');
      if (hero) {
      const entry = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (initial) entry.from(document.querySelectorAll('.header-main .brand-logo, .desktop-nav a, .header-actions'), { y: -10, opacity: 0, stagger: .045, duration: .55 });
      entry.from(root.querySelectorAll('.hero .eyebrow'), { y: 10, opacity: 0, duration: .5 }, initial ? '-=.3' : 0)
        .from(root.querySelectorAll('.text-mask > *'), { yPercent: 110, rotate: 2, duration: .95, stagger: .14 }, '-=.3')
        .from(root.querySelector('.hero-photo'), { clipPath: 'inset(0 0 100% 0)', duration: 1.05, ease: 'power3.inOut' }, '-=.95')
        .from(root.querySelector('.hero-photo img'), { scale: 1.09, duration: 1.2 }, '-=.85')
        .from(root.querySelectorAll('.hero-description, .hero .button, .hero-bottom, .hero-image-footer, .hero-side-label'), { y: 12, opacity: 0, duration: .55, stagger: .065 }, '-=.6')
        .from(root.querySelector('.hero-seal'), { scale: .7, rotate: -30, opacity: 0, duration: .7, ease: 'back.out(1.4)' }, '-=.5');
      }
      root.querySelectorAll('[data-image-reveal]').forEach((element) => {
        gsap.from(element, { clipPath: 'inset(9% 0 9% 0)', duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
      });
      root.querySelectorAll('[data-carousel]').forEach((carousel) => {
        gsap.from(carousel.querySelectorAll('.carousel-slide'), {
          y: 30, opacity: 0, duration: .75, stagger: .075, ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: carousel, start: 'top 92%', once: true },
        });
      });
      root.querySelectorAll('[data-reveal]').forEach((element) => {
        gsap.from(element, { y: 28, opacity: 0, clipPath: 'inset(0 0 100% 0)', duration: .85, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
      });
      const statement = root.matches('.statement') ? root : root.querySelector('.statement');
      if (statement) {
        gsap.fromTo(statement.querySelector('.statement-photo'), { y: 40, rotate: 8 }, { y: -24, rotate: -4, ease: 'none', scrollTrigger: { trigger: statement, start: 'top bottom', end: 'bottom top', scrub: .7 } });
        statement.querySelectorAll('[data-statement-word]').forEach((element, index) => gsap.fromTo(element, { x: index ? 20 : -20 }, { x: index ? -15 : 15, ease: 'none', scrollTrigger: { trigger: statement, start: 'top bottom', end: 'bottom top', scrub: 1 } }));
      }
      const categoryRail = root.querySelector('.category-rail');
      if (categoryRail) gsap.from(categoryRail.querySelectorAll('.category-link'), { y: 16, opacity: 0, stagger: .08, duration: .6, scrollTrigger: { trigger: categoryRail, start: 'top 94%', once: true } });
    } else {
      gsap.from(root, { opacity: 0, y: 10, duration: .4, clearProps: 'transform,opacity' });
    }
  }, root);
  return () => media.revert();
}
