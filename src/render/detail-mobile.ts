import {
  caseStudies,
  workIndex,
  aiWorkIndex,
  productWorkIndex,
  type CaseStudyGalleryItem,
  type CaseStudyGalleryRive,
  type CaseStudyGalleryVideo,
} from '../data/projects';
import { renderWorkSection } from './landing';
import { Rive, Layout, Fit, Alignment } from '@rive-app/webgl2';

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

const isVideo = (item: CaseStudyGalleryItem): item is CaseStudyGalleryVideo =>
  'videoSrc' in item;
const isRive = (item: CaseStudyGalleryItem): item is CaseStudyGalleryRive =>
  'riveSrc' in item;

export function renderDetailMobile(container: HTMLElement, slug: string) {
  const study = caseStudies[slug];
  container.innerHTML = '';
  container.className = 'csm-root';

  if (!study) {
    container.append(
      el('p', undefined, 'Project not found.'),
      (() => { const a = el('a', 'text-link', 'Back home'); a.href = '#/'; return a; })(),
    );
    return;
  }

  // ── Slug navigation ──────────────────────────────────────────
  const slugs = workIndex
    .filter(row => row.slug && caseStudies[row.slug]?.gallery?.length)
    .map(row => row.slug!);
  const currentIdx = slugs.indexOf(slug);
  const prevSlug = currentIdx > 0 ? slugs[currentIdx - 1] : null;
  const nextSlug = currentIdx < slugs.length - 1 ? slugs[currentIdx + 1] : null;

  // ── Static info block (sits behind images) ─────────────────
  const infoBlock = el('div', 'csm-info');

  const row = workIndex.find(r => r.slug === slug);
  const header = el('div', 'csm-header');
  if (row) {
    const titleWrap = el('div', 'csm-header-titles');
    titleWrap.append(
      el('span', 'csm-header-title', row.title),
      el('span', 'csm-header-category', row.category),
    );
    const client = el('span', 'csm-header-client', row.client);
    header.append(titleWrap, client);
  }
  infoBlock.appendChild(header);

  const desc = el('div', 'csm-description');
  desc.appendChild(el('p', 'csm-desc-text', study.description));
  if (study.tryItUrl) {
    const tryLink = el('a', 'text-link csm-try-link', study.tryItLabel ?? 'Try it out') as HTMLAnchorElement;
    tryLink.href = study.tryItUrl;
    tryLink.target = '_blank';
    tryLink.rel = 'noopener noreferrer';
    desc.appendChild(tryLink);
  }
  infoBlock.appendChild(desc);
  container.appendChild(infoBlock);

  // ── Images + captions (scroll over the info block) ──────────
  const images = el('div', 'csm-images');

  for (const item of study.gallery) {
    const wrap = el('div', 'csm-img-wrap');

    if (isRive(item)) {
      const panel = el('div', 'csm-rive-panel');
      const panelWidth = item.panelWidth ?? 840;
      const panelHeight = item.panelHeight ?? 860;
      panel.style.background = item.panelBg ?? '#D1471B';
      panel.style.width = `min(100%, ${panelWidth}px)`;
      panel.style.height = `min(100%, ${panelHeight}px)`;

      const canvas = document.createElement('canvas');
      canvas.className = 'csm-rive-canvas';
      const artboardW = 638;
      const artboardH = 424;
      canvas.style.width = `${artboardW}px`;
      canvas.style.height = `${artboardH}px`;
      canvas.style.maxWidth = '100%';
      const dpr = window.devicePixelRatio || 1;
      canvas.width = artboardW * dpr;
      canvas.height = artboardH * dpr;
      panel.appendChild(canvas);
      wrap.appendChild(panel);

      const rive = new Rive({
        src: encodeURI(item.riveSrc),
        canvas,
        autoplay: true,
        autoBind: true,
        stateMachines: item.stateMachine ?? undefined,
        isTouchScrollEnabled: true,
        layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
        onLoad: () => {
          rive.resizeDrawingSurfaceToCanvas();
        },
      });
    } else if (isVideo(item)) {
      const video = document.createElement('video');
      video.src = encodeURI(item.videoSrc);
      video.className = 'csm-media';
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      wrap.appendChild(video);
    } else {
      const src = 'cycleFrames' in item ? item.cycleFrames[0] : item.src;
      const img = document.createElement('img');
      img.src = encodeURI(src);
      img.alt = '';
      img.className = 'csm-media';
      wrap.appendChild(img);
    }

    const caption = (item as { caption?: string }).caption;
    if (caption) {
      wrap.appendChild(el('p', 'csm-caption', caption));
    }

    images.appendChild(wrap);
  }

  container.appendChild(images);

  // Spacer so content isn't hidden behind fixed bottom bar
  container.appendChild(el('div', 'csm-scroll-pad'));

  // ── Bottom bar ───────────────────────────────────────────────
  const bottomBar = el('div', 'csm-bottom-bar');

  const nav = el('div', 'csm-nav');
  const prevBtn = el('button', `csm-nav-btn${prevSlug ? '' : ' csm-nav-btn--disabled'}`) as HTMLButtonElement;
  prevBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  prevBtn.setAttribute('aria-label', 'Previous project');
  if (!prevSlug) prevBtn.disabled = true;

  const nextBtn = el('button', `csm-nav-btn${nextSlug ? '' : ' csm-nav-btn--disabled'}`) as HTMLButtonElement;
  nextBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  nextBtn.setAttribute('aria-label', 'Next project');
  if (!nextSlug) nextBtn.disabled = true;

  nav.append(prevBtn, nextBtn);

  const menuBtn = el('button', 'csm-menu-btn', 'Menu');
  menuBtn.type = 'button';

  bottomBar.append(nav, menuBtn);
  document.body.appendChild(bottomBar);

  // ── Navigation ───────────────────────────────────────────────
  prevBtn.addEventListener('click', () => {
    if (prevSlug) location.hash = `#/work/${prevSlug}`;
  });
  nextBtn.addEventListener('click', () => {
    if (nextSlug) location.hash = `#/work/${nextSlug}`;
  });

  // ── Menu overlay ─────────────────────────────────────────────
  const overlay = el('div', 'csm-menu-overlay');
  const menuContent = el('div', 'csm-menu-content');
  menuContent.appendChild(renderWorkSection('AI Stuffs', aiWorkIndex, false));
  menuContent.appendChild(renderWorkSection('Design', productWorkIndex, true));
  overlay.appendChild(menuContent);

  document.body.appendChild(overlay);

  menuContent.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('a.work-title-link');
    if (!link) return;
    e.preventDefault();
    const href = link.getAttribute('href');
    if (href) location.hash = href;
  });

  let menuOpen = false;

  const openMenu = () => {
    menuOpen = true;
    overlay.classList.add('csm-menu-overlay--open');
    menuBtn.textContent = 'Close';
  };

  const closeMenu = () => {
    menuOpen = false;
    overlay.style.transform = '';
    overlay.classList.remove('csm-menu-overlay--open');
    menuBtn.textContent = 'Menu';
  };

  menuBtn.addEventListener('click', () => {
    if (menuOpen) closeMenu();
    else openMenu();
  });

  // Pull-down to dismiss menu
  let menuTouchStartY = 0;
  let menuDragY = 0;
  const MENU_DISMISS_THRESHOLD = 100;

  overlay.addEventListener('touchstart', (e) => {
    if (!menuOpen) return;
    menuTouchStartY = e.touches[0].clientY;
    menuDragY = 0;
  }, { passive: true });

  overlay.addEventListener('touchmove', (e) => {
    if (!menuOpen) return;
    if (menuContent.scrollTop > 0) return;
    menuDragY = e.touches[0].clientY - menuTouchStartY;
    if (menuDragY > 0) {
      overlay.style.transition = 'none';
      overlay.style.transform = `translateY(${menuDragY}px)`;
    }
  }, { passive: true });

  overlay.addEventListener('touchend', () => {
    if (!menuOpen) return;
    overlay.style.transition = '';
    if (menuDragY >= MENU_DISMISS_THRESHOLD) {
      closeMenu();
    } else {
      overlay.style.transform = '';
    }
    menuDragY = 0;
  }, { passive: true });

  // ── Touch swipe for project navigation + pull-to-dismiss ─────
  // Pull-to-dismiss is touch-only here; keep native vertical scrolling intact.
  const SWIPE_THRESHOLD = 72;
  const DISMISS_PULL_THRESHOLD = 100;
  let touchStartX = 0;
  let touchStartY = 0;
  let pullDismissY = 0;
  let isPulling = false;
  let pointerStartY = 0;
  let pointerPullY = 0;
  let pointerPulling = false;
  let wheelPullY = 0;
  let wheelPullResetTimer: number | null = null;
  let dismissed = false;

  const animateOut = () => {
    if (dismissed) return;
    dismissed = true;
    images.style.transition = 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease';
    images.style.transform = 'translateY(100%)';
    images.style.opacity = '0';
    setTimeout(() => { location.hash = '#/'; }, 300);
  };

  const onTouchStart = (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    pullDismissY = 0;
    isPulling = false;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (menuOpen) return;
    const dy = e.touches[0].clientY - touchStartY;
    const dx = e.touches[0].clientX - touchStartX;

    // Only pull when we're at the top and net movement is downward
    if (!isPulling && container.scrollTop <= 0 && dy > 8 && dy > Math.abs(dx)) {
      isPulling = true;
    }

    if (isPulling) {
      e.preventDefault();
      pullDismissY = dy;
      // Rubber-band resistance: images follow at 40%, capped at 60px
      const pull = Math.min(pullDismissY * 0.4, 60);
      images.style.transition = 'none';
      images.style.transform = `translateY(${pull}px)`;
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (isPulling) {
      if (pullDismissY >= DISMISS_PULL_THRESHOLD) {
        animateOut();
      } else {
        // Snap back
        images.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
        images.style.transform = '';
      }
    } else {
      // Horizontal swipe for project navigation
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        const target = dx < 0 ? nextSlug : prevSlug;
        if (target) location.hash = `#/work/${target}`;
      }
    }
    isPulling = false;
    pullDismissY = 0;
  };

  // Pointer fallback (desktop Chrome / device emulation)
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (menuOpen) return;
    if (container.scrollTop > 2) return;
    pointerStartY = e.clientY;
    pointerPullY = 0;
    pointerPulling = false;
  };

  const onPointerMove = (e: PointerEvent) => {
    if (menuOpen) return;
    if (pointerStartY === 0) return;
    const dy = e.clientY - pointerStartY;
    if (!pointerPulling && container.scrollTop <= 2 && dy > 8) {
      pointerPulling = true;
    }
    if (!pointerPulling) return;
    pointerPullY = dy;
    const pull = Math.min(pointerPullY * 0.4, 60);
    images.style.transition = 'none';
    images.style.transform = `translateY(${pull}px)`;
  };

  const onPointerUp = () => {
    if (pointerPulling && pointerPullY >= DISMISS_PULL_THRESHOLD) {
      animateOut();
    } else if (pointerPulling) {
      images.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
      images.style.transform = '';
    }
    pointerStartY = 0;
    pointerPullY = 0;
    pointerPulling = false;
  };

  // Wheel / trackpad fallback
  const onWheel = (e: WheelEvent) => {
    if (menuOpen || dismissed) return;
    if (container.scrollTop > 2) return;
    if (e.deltaY >= 0) return;

    wheelPullY += Math.abs(e.deltaY);
    const pull = Math.min(wheelPullY * 0.2, 60);
    images.style.transition = 'none';
    images.style.transform = `translateY(${pull}px)`;

    if (wheelPullY >= DISMISS_PULL_THRESHOLD) {
      animateOut();
      return;
    }

    if (wheelPullResetTimer !== null) {
      window.clearTimeout(wheelPullResetTimer);
    }
    wheelPullResetTimer = window.setTimeout(() => {
      wheelPullY = 0;
      images.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
      images.style.transform = '';
      wheelPullResetTimer = null;
    }, 160);
  };

  container.addEventListener('touchstart', onTouchStart, { passive: true });
  container.addEventListener('touchmove', onTouchMove, { passive: false });
  container.addEventListener('touchend', onTouchEnd, { passive: true });
  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);
  container.addEventListener('wheel', onWheel, { passive: true });

  // ── Cleanup on hashchange ────────────────────────────────────
  const cleanup = () => {
    bottomBar.remove();
    overlay.remove();
    container.removeEventListener('touchstart', onTouchStart);
    container.removeEventListener('touchmove', onTouchMove);
    container.removeEventListener('touchend', onTouchEnd);
    container.removeEventListener('pointerdown', onPointerDown);
    container.removeEventListener('pointermove', onPointerMove);
    container.removeEventListener('pointerup', onPointerUp);
    container.removeEventListener('pointercancel', onPointerUp);
    container.removeEventListener('wheel', onWheel);
    if (wheelPullResetTimer !== null) {
      window.clearTimeout(wheelPullResetTimer);
    }
    window.removeEventListener('hashchange', cleanup);
  };
  window.addEventListener('hashchange', cleanup);
}
