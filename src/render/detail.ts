import { caseStudies, groupWorkByYear, workIndex, type WorkIndexRow } from '../data/projects';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderSidebarRow(row: WorkIndexRow, currentSlug?: string): HTMLElement {
  const wrap = el('div', 'detail-sidebar-row');
  const left = el('div', 'detail-sidebar-row-left');
  const titleLine = el('p', 'detail-sidebar-title-line');
  if (row.slug) {
    const a = document.createElement('a');
    a.href = `#/work/${row.slug}`;
    a.className = 'detail-sidebar-title';
    a.textContent = row.title;
    if (currentSlug && row.slug === currentSlug) {
      a.setAttribute('aria-current', 'page');
    }
    titleLine.appendChild(a);
  } else {
    const span = el('span', 'detail-sidebar-title', row.title);
    titleLine.appendChild(span);
  }
  const cat = el('p', 'detail-sidebar-category', row.category);
  left.append(titleLine, cat);

  const client = el(
    'div',
    `detail-sidebar-client detail-sidebar-client--${row.clientColumn}`,
    row.client,
  );
  wrap.append(left, client);
  return wrap;
}

function renderSidebarYearGroup(
  year: string,
  rows: WorkIndexRow[],
  currentSlug?: string,
): HTMLElement {
  const g = el('div', 'detail-year-group');
  g.appendChild(el('p', 'detail-year-label', year));
  const list = el('div', 'detail-year-list');
  for (let i = 0; i < rows.length; i++) {
    list.appendChild(renderSidebarRow(rows[i], currentSlug));
    if (i < rows.length - 1) {
      list.appendChild(el('div', 'detail-sidebar-rule'));
    }
  }
  g.appendChild(list);
  return g;
}

function imageReady(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalHeight > 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    img.addEventListener('load', () => resolve(), { once: true });
    img.addEventListener('error', () => resolve(), { once: true });
  });
}

/** True if any part of the element overlaps the viewport (after layout). */
function isIntersectingViewport(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return r.top < vh && r.bottom > 0;
}

function attachDetailShotScrollAnimation(
  frames: HTMLElement[],
  imgs: HTMLImageElement[],
) {
  if (frames.length === 0) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      }
    },
    { root: null, threshold: 0, rootMargin: '0px' },
  );

  const assign = () => {
    requestAnimationFrame(() => {
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        if (isIntersectingViewport(frame)) {
          continue;
        }
        frame.classList.add('detail-shot-frame--scroll-reveal');
        io.observe(frame);
      }
    });
  };

  void Promise.all(imgs.map(imageReady)).then(assign);
}

export function renderDetail(container: HTMLElement, slug: string) {
  const study = caseStudies[slug];
  container.innerHTML = '';
  container.className = 'view view-detail';

  if (!study) {
    const p = el('p', 'detail-missing', 'Project not found.');
    const back = el('a', 'text-link', 'Back home');
    back.href = '#/';
    container.append(p, back);
    return;
  }

  const grid = el('div', 'detail-grid');

  const main = el('main', 'detail-main');
  const mediaStack = el('div', 'detail-media-stack');
  const shotFrames: HTMLElement[] = [];
  const shotImgs: HTMLImageElement[] = [];
  for (const item of study.gallery) {
    const fig = el('figure', 'detail-figure');
    const frame = el('div', 'detail-shot-frame');
    const img = document.createElement('img');
    img.src = encodeURI(item.src);
    img.alt = '';
    img.className = 'detail-shot';
    frame.appendChild(img);
    shotFrames.push(frame);
    shotImgs.push(img);
    const cap = el('figcaption', 'detail-caption', item.caption);
    fig.append(frame, cap);
    mediaStack.appendChild(fig);
  }
  main.appendChild(mediaStack);

  const aside = el('aside', 'detail-sidebar');

  const back = document.createElement('a');
  back.className = 'detail-back';
  back.href = '#/';
  back.setAttribute('aria-label', 'Back to home');
  const backIcon = document.createElement('img');
  backIcon.className = 'detail-back-icon';
  backIcon.src = encodeURI('/assets/Misc/back-arrow.svg');
  backIcon.alt = '';
  backIcon.setAttribute('aria-hidden', 'true');
  back.appendChild(backIcon);

  const titleStack = el('div', 'detail-title-stack');
  titleStack.append(
    el('p', 'detail-headline', study.headline),
    el('p', 'detail-type', study.type),
  );
  const headBlock = el('div', 'detail-head');
  headBlock.append(titleStack, el('p', 'detail-description', study.description));

  const nav = el('nav', 'detail-work-nav');
  const groups = groupWorkByYear(workIndex);
  for (let gi = 0; gi < groups.length; gi++) {
    nav.appendChild(renderSidebarYearGroup(groups[gi].year, groups[gi].rows, slug));
    if (gi < groups.length - 1) {
      nav.appendChild(el('div', 'detail-year-spacer'));
    }
  }

  aside.append(back, headBlock, nav);
  grid.append(main, aside);
  container.appendChild(grid);

  attachDetailShotScrollAnimation(shotFrames, shotImgs);
}
