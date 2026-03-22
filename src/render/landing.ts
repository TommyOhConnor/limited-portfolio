import { site } from '../data/site';
import { workIndex, type WorkIndexRow } from '../data/projects';

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

function appendChildren(parent: HTMLElement, children: (Node | string)[]) {
  for (const c of children) {
    if (typeof c === 'string') parent.appendChild(document.createTextNode(c));
    else parent.appendChild(c);
  }
}

function renderWorkRow(row: WorkIndexRow): HTMLElement {
  const wrap = el('div', 'work-row');

  const main = el('div', 'work-row-main');
  const year = el('span', 'work-year', row.year || '\u00a0');

  const titles = el('div', 'work-titles');
  if (row.slug) {
    const a = document.createElement('a');
    a.className = 'work-title-link';
    a.href = `#/work/${row.slug}`;
    a.textContent = row.title;
    titles.appendChild(a);
  } else {
    titles.appendChild(document.createTextNode(row.title));
  }
  titles.appendChild(el('span', 'work-category', row.category));

  main.append(year, titles);

  const client = el('div', `work-client work-client--${row.clientColumn}`, row.client);

  wrap.append(main, client);
  return wrap;
}

export function renderLanding(container: HTMLElement) {
  container.innerHTML = '';
  container.className = 'view view-landing';

  const inner = el('div', 'landing-inner');

  const introBlock = el('div', 'landing-intro');
  const nameBlock = el('div', 'landing-name-block');
  nameBlock.append(
    el('p', 'landing-name', site.name),
    el('p', 'landing-role', site.role),
  );

  const bio = el('div', 'landing-bio');
  for (const p of site.bioParagraphs) {
    bio.appendChild(el('p', 'landing-bio-p', p));
  }
  const closing = el('p', 'landing-bio-p');
  appendChildren(closing, [
    site.closingLineBeforeEmail,
    (() => {
      const a = document.createElement('a');
      a.href = `mailto:${site.email}`;
      a.className = 'text-link';
      a.textContent = site.email;
      return a;
    })(),
    site.closingLineAfterEmail,
  ]);
  bio.appendChild(closing);

  introBlock.append(nameBlock, bio);

  const logos = el('div', 'landing-logos');
  const logoItems: [string, string, string][] = [
    ['/logos/pfizer.svg', 'Pfizer', 'landing-logo landing-logo--pfizer'],
    ['/logos/ge.svg', 'GE', 'landing-logo landing-logo--ge'],
    ['/logos/tnf.svg', 'The North Face', 'landing-logo landing-logo--tnf'],
    ['/logos/brooks.svg', 'Brooks', 'landing-logo landing-logo--brooks'],
    ['/logos/dashlx.svg', 'DashLX', 'landing-logo landing-logo--dashlx'],
  ];
  for (const [src, alt, cls] of logoItems) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.className = cls;
    logos.appendChild(img);
  }

  const workSection = el('div', 'landing-work');
  const introLine = el('p', 'work-sampling-intro');
  const b = el('span', 'work-sampling-bold', site.workSamplingNote.leadBold);
  introLine.append(
    b,
    document.createTextNode(site.workSamplingNote.mid),
    el('span', 'work-sampling-date', site.workSamplingNote.updated),
    document.createTextNode(site.workSamplingNote.tail),
    (() => {
      const a = document.createElement('a');
      a.href = site.legacyPortfolioUrl;
      a.className = 'text-link';
      a.rel = 'noopener noreferrer';
      a.target = '_blank';
      a.textContent = 'tommy-oconnor.com';
      return a;
    })(),
  );

  const table = el('div', 'work-table');
  for (let i = 0; i < workIndex.length; i++) {
    table.appendChild(renderWorkRow(workIndex[i]));
    if (i < workIndex.length - 1) {
      table.appendChild(el('div', 'work-rule'));
    }
  }

  workSection.append(introLine, table);

  inner.append(introBlock, logos, workSection);
  container.appendChild(inner);
}
