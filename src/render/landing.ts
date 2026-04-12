import { site } from '../data/site';
import { aiWorkIndex, productWorkIndex, type WorkIndexRow } from '../data/projects';
import { initNameReveal } from '../rive/name-reveal';

function smoothScrollTo(targetY: number, duration: number, onNearEnd?: () => void): Promise<void> {
  return new Promise(resolve => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();
    const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    let nearEndFired = false;
    function step(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * ease(progress));
      // At 85% of the time budget the scroll is ~99% visually complete —
      // fire early so the image rise overlaps with the imperceptible tail.
      if (!nearEndFired && progress >= 0.55 && onNearEnd) {
        nearEndFired = true;
        onNearEnd();
      }
      if (progress < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

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

export function renderWorkRow(row: WorkIndexRow, showYear: boolean): HTMLElement {
  const wrap = el('div', 'work-row');

  const main = el('div', 'work-row-main');

  if (showYear) {
    main.appendChild(el('span', 'work-year', row.year || '\u00a0'));
  }

  const titles = el('div', 'work-titles');
  if (row.externalUrl) {
    const a = document.createElement('a');
    a.className = 'work-title-link';
    a.href = row.externalUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = row.title;
    titles.appendChild(a);
  } else if (row.slug) {
    const a = document.createElement('a');
    a.className = 'work-title-link';
    a.href = `#/work/${row.slug}`;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const slug = row.slug!;
      smoothScrollTo(document.documentElement.scrollHeight, 900, () => {
        location.hash = `#/work/${slug}`;
      });
    });
    a.textContent = row.title;
    titles.appendChild(a);
  } else {
    titles.appendChild(document.createTextNode(row.title));
  }
  titles.appendChild(el('span', 'work-category', row.category));
  main.appendChild(titles);

  const client = el('div', `work-client work-client--${row.clientColumn}`, row.client);
  wrap.append(main, client);
  return wrap;
}

export function renderWorkSection(
  label: string,
  rows: WorkIndexRow[],
  showYear: boolean,
): HTMLElement {
  const section = el('div', 'landing-section');
  section.appendChild(el('p', 'landing-section-label', label));

  const table = el('div', 'work-table');
  for (let i = 0; i < rows.length; i++) {
    table.appendChild(renderWorkRow(rows[i], showYear));
    if (i < rows.length - 1) {
      table.appendChild(el('div', 'work-rule'));
    }
  }
  section.appendChild(table);
  return section;
}

function renderAboutPanel(): HTMLElement {
  const panel = el('div', 'landing-about-panel');
  panel.setAttribute('aria-hidden', 'true');

  const bio = el('div', 'landing-about-bio');

  for (const p of site.aboutBio.paragraphs) {
    if (p === null) {
      const { before, italic, after } = site.aboutBio.aiParagraph;
      const para = el('p', 'about-bio-p');
      para.appendChild(document.createTextNode(before));
      const em = document.createElement('em');
      em.textContent = italic;
      para.appendChild(em);
      para.appendChild(document.createTextNode(after));
      bio.appendChild(para);
    } else {
      bio.appendChild(el('p', 'about-bio-p', p));
    }
  }

  const contact = el('div', 'landing-about-contact');

  const emailLink = document.createElement('a');
  emailLink.href = `mailto:${site.email}`;
  emailLink.className = 'about-contact-email';
  emailLink.textContent = site.email;
  contact.appendChild(emailLink);

  const xLink = document.createElement('a');
  xLink.href = site.xUrl;
  xLink.target = '_blank';
  xLink.rel = 'noopener noreferrer';
  xLink.className = 'about-contact-x';
  const xIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  xIcon.setAttribute('viewBox', '0 0 24 24');
  xIcon.setAttribute('width', '24');
  xIcon.setAttribute('height', '24');
  xIcon.setAttribute('aria-hidden', 'true');
  xIcon.setAttribute('class', 'about-x-icon');
  xIcon.innerHTML =
    '<path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>';
  const xHandle = el('span', 'about-x-handle', site.xHandle);
  xLink.append(xIcon, xHandle);
  contact.appendChild(xLink);

  panel.append(bio, contact);
  return panel;
}

export function renderLanding(container: HTMLElement) {
  container.innerHTML = '';
  container.className = 'view view-landing';

  // Header
  const header = el('header', 'landing-header');
  const nameCanvas = document.createElement('canvas');
  nameCanvas.className = 'landing-name-abbr';
  nameCanvas.width = 240;
  nameCanvas.height = 32;
  const nameText = el('span', 'landing-name-text', site.name);
  header.append(nameCanvas, nameText);
  container.appendChild(header);

  // Inner
  const inner = el('div', 'landing-inner');

  // Hero
  const hero = el('div', 'landing-hero');
  const assetsBase = `${import.meta.env.BASE_URL}assets`;

  const photo = document.createElement('img');
  photo.src = `${assetsBase}/profile.png`;
  photo.alt = site.name;
  photo.className = 'landing-hero-photo';

  const photoDark = document.createElement('img');
  photoDark.src = `${assetsBase}/profile-dark.png`;
  photoDark.alt = site.name;
  photoDark.className = 'landing-hero-photo landing-hero-photo--dark';

  const photoWrap = el('div', 'landing-hero-photo-wrap');
  photoWrap.append(photo, photoDark);

  const heroText = el('div', 'landing-hero-text');
  const headline = el('p', 'landing-headline');
  headline.appendChild(document.createTextNode(site.heroHeadline));

  const moreBtn = el('button', 'landing-more-btn', 'MORE');
  moreBtn.type = 'button';
  moreBtn.setAttribute('aria-expanded', 'false');
  headline.appendChild(moreBtn);

  heroText.appendChild(headline);
  hero.append(photoWrap, heroText);
  inner.appendChild(hero);

  // Work sections
  const workWrap = el('div', 'landing-work');
  workWrap.appendChild(renderWorkSection('AI Stuffs', aiWorkIndex, false));
  workWrap.appendChild(renderWorkSection('Design', productWorkIndex, true));
  inner.appendChild(workWrap);

  // About panel
  const aboutPanel = renderAboutPanel();
  inner.appendChild(aboutPanel);

  container.appendChild(inner);

  // Rive name animation
  const nameReveal = initNameReveal(nameCanvas);

  const handleNameClick = () => {
    if (container.classList.contains('is-about')) {
      moreBtn.click();
    }
  };

  nameCanvas.addEventListener('click', handleNameClick);
  nameText.addEventListener('click', handleNameClick);

  // Toggle
  moreBtn.addEventListener('click', () => {
    const isAbout = container.classList.toggle('is-about');
    nameReveal.setDark(isAbout);
    moreBtn.setAttribute('aria-expanded', String(isAbout));
    moreBtn.textContent = isAbout ? 'LESS' : 'MORE';
    workWrap.setAttribute('aria-hidden', String(isAbout));
    aboutPanel.setAttribute('aria-hidden', String(!isAbout));
    if (!isAbout) {
      moreBtn.classList.add('no-hover');
      setTimeout(() => moreBtn.classList.remove('no-hover'), 2000);
    }
  });
}
