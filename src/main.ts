import './style.css';
import { renderLanding } from './render/landing';
import { renderDetail } from './render/detail';
import { caseStudies } from './data/projects';

let root: HTMLElement;
{
  const el = document.querySelector<HTMLElement>('#app');
  if (!el) {
    throw new Error('#app missing');
  }
  root = el;
}

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
    renderLanding(root);
    document.title = "Tommy O'Connor — Portfolio";
  } else {
    renderDetail(root, route.slug);
    const study = caseStudies[route.slug];
    document.title = study
      ? `${study.headline} — Tommy O'Connor`
      : "Project — Tommy O'Connor";
  }
}

window.addEventListener('hashchange', render);
render();
