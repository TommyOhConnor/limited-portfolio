import './style.css';
import { inject } from '@vercel/analytics';
import { renderLanding } from './render/landing';
import { renderDetail } from './render/detail';
import { renderDetailMobile } from './render/detail-mobile';
import { caseStudies } from './data/projects';

const MOBILE_BREAKPOINT = 768;

let root: HTMLElement;
{
  const el = document.querySelector<HTMLElement>('#app');
  if (!el) throw new Error('#app missing');
  root = el;
}

// Landing is rendered once and stays in the DOM permanently.
renderLanding(root);

// Detail pages mount as a fixed overlay on top and are removed on back navigation.
let detailEl: HTMLElement | null = null;

type Route = { name: 'landing' } | { name: 'detail'; slug: string };

function parseHash(): Route {
  const raw = location.hash.replace(/^#\/?/, '').trim();
  if (!raw) return { name: 'landing' };
  const work = raw.match(/^work\/(.+)$/);
  if (work) return { name: 'detail', slug: work[1] };
  return { name: 'landing' };
}

function render() {
  const route = parseHash();

  if (route.name === 'landing') {
    if (detailEl) {
      detailEl.remove();
      detailEl = null;

      // If the section label is above the viewport after dismissing the
      // portfolio, smooth-scroll it back into view with a 48px top buffer.
      requestAnimationFrame(() => {
        const label = document.querySelector<HTMLElement>('.landing-section-label');
        if (label) {
          const { top } = label.getBoundingClientRect();
          if (top < 48) {
            window.scrollBy({ top: top - 48, behavior: 'smooth' });
          }
        }
      });
    }
    document.title = "Tommy O'Connor — Portfolio";
  } else {
    if (detailEl) detailEl.remove();
    detailEl = document.createElement('div');
    document.body.appendChild(detailEl);
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      detailEl.style.cssText = 'position: fixed; inset: 0; z-index: 10; overflow-y: auto; background: #fff;';
      renderDetailMobile(detailEl, route.slug);
    } else {
      detailEl.style.cssText = 'position: fixed; inset: 0; z-index: 10;';
      renderDetail(detailEl, route.slug);
    }

    const study = caseStudies[route.slug];
    document.title = study
      ? `${study.headline} — Tommy O'Connor`
      : "Project — Tommy O'Connor";
  }
}

if (location.hostname.endsWith('.vercel.app')) {
  inject();
}
window.addEventListener('hashchange', render);
render();
