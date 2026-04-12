import { caseStudies, workIndex, type CaseStudyGalleryVideo } from '../data/projects';

const IMAGE_HEIGHT_STEP = 50;
const SCROLL_PER_IMAGE = 200;
const DISMISS_THRESHOLD = 150; // px of upward overscroll to trigger exit

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

export function renderDetail(container: HTMLElement, slug: string) {
  const study = caseStudies[slug];
  container.innerHTML = '';
  container.className = 'view view-cs';

  if (!study) {
    const wrap = el('div', 'cs-not-found');
    wrap.append(
      el('p', undefined, 'Project not found.'),
      (() => { const a = el('a', 'text-link', 'Back home'); a.href = '#/'; return a; })(),
    );
    container.appendChild(wrap);
    return;
  }

  // ── Images ───────────────────────────────────────────────────
  const imageHeightFirst = Math.round(window.innerHeight * 0.8);
  const heights = study.gallery.map((_, i) => imageHeightFirst - i * IMAGE_HEIGHT_STEP);

  const isVideo = (item: (typeof study.gallery)[number]): item is CaseStudyGalleryVideo =>
    'videoSrc' in item;

  const imgEls: HTMLDivElement[] = study.gallery.map((item, i) => {
    const wrapper = el('div', 'cs-img-wrapper') as HTMLDivElement;
    wrapper.style.height = `${heights[i]}px`;
    wrapper.style.zIndex = String(i + 1);
    wrapper.style.transform = `translateY(${heights[i] + 1}px)`;

    if (isVideo(item)) {
      const video = document.createElement('video');
      video.src = encodeURI(item.videoSrc);
      video.className = 'cs-img';
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      if (item.fit) video.style.objectFit = item.fit;
      if (item.align) video.style.objectPosition = `${item.align} bottom`;
      wrapper.appendChild(video);
    } else {
      const src = 'cycleFrames' in item ? item.cycleFrames[0] : item.src;
      const img = document.createElement('img');
      img.src = encodeURI(src);
      img.alt = '';
      img.className = 'cs-img';
      if (!('cycleFrames' in item)) {
        if (item.fit) img.style.objectFit = item.fit;
        if (item.align) img.style.objectPosition = `${item.align} bottom`;
      }
      wrapper.appendChild(img);
    }

    container.appendChild(wrapper);
    return wrapper;
  });

  // ── White background panel ───────────────────────────────────
  const bgPanel = el('div', 'cs-bg-panel');
  container.appendChild(bgPanel);
  requestAnimationFrame(() => { bgPanel.style.opacity = '1'; });

  // ── Sidebar ──────────────────────────────────────────────────
  const sidebar = el('div', 'cs-sidebar');
  sidebar.style.opacity = '0';

  const backBtn = el('button', 'cs-back-btn');
  backBtn.type = 'button';
  backBtn.setAttribute('aria-label', 'Back to work');
  const backIcon = document.createElement('img');
  backIcon.src = `${import.meta.env.BASE_URL}assets/Misc/back-arrow.svg`;
  backIcon.alt = '';
  backIcon.setAttribute('aria-hidden', 'true');
  backIcon.className = 'cs-back-icon';
  backBtn.appendChild(backIcon);

  const infoBlock = el('div', 'cs-info');
  const headWrap = el('div', 'cs-info-head');
  headWrap.append(
    el('p', 'cs-info-title', study.headline),
    el('p', 'cs-info-type', study.type),
  );
  infoBlock.appendChild(headWrap);
  infoBlock.appendChild(el('p', 'cs-info-desc', study.description));
  if (study.tryItUrl) {
    const tryRow = el('p', 'cs-info-try');
    const tryLink = el('a', 'text-link', study.tryItLabel ?? 'Try it out') as HTMLAnchorElement;
    tryLink.href = study.tryItUrl;
    tryLink.target = '_blank';
    tryLink.rel = 'noopener noreferrer';
    tryRow.appendChild(tryLink);
    infoBlock.appendChild(tryRow);
  }

  const captionEl = el('p', 'cs-caption');
  const counterEl = el('p', 'cs-counter');
  const counterNumEl = el('span', 'cs-counter-num', '1');
  counterEl.appendChild(counterNumEl);
  counterEl.appendChild(document.createTextNode(` / ${study.gallery.length}`));

  sidebar.append(backBtn, infoBlock, el('div', 'cs-sidebar-spacer'), captionEl, counterEl);
  container.appendChild(sidebar);

  // ── Layout ───────────────────────────────────────────────────
  const updateLayout = () => {
    // Align sidebar + bg panel to top of first (tallest) image
    const top = window.innerHeight - Math.round(window.innerHeight * 0.8);
    sidebar.style.top = `${top}px`;
    bgPanel.style.top = `${top - 16}px`;

    // Hide caption/counter if there isn't enough room to show them cleanly
    requestAnimationFrame(() => {
      const sidebarRect = sidebar.getBoundingClientRect();
      const infoRect = infoBlock.getBoundingClientRect();
      // Available space = from bottom of info block to bottom of sidebar, minus gaps and counter height
      const available = sidebarRect.bottom - infoRect.bottom - counterEl.offsetHeight - 48;
      const crowded = available < 80; // need at least 80px for a caption to breathe
      captionEl.style.display = crowded ? 'none' : '';
      counterEl.style.display = crowded ? 'none' : '';
    });
  };

  updateLayout();
  window.addEventListener('resize', updateLayout);

  // ── Animations ───────────────────────────────────────────────
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const riseImage = (wrapper: HTMLDivElement, delay: number) => {
    wrapper.style.transition = `transform 0.75s cubic-bezier(0.22, 1, 0.32, 1) ${delay}ms`;
    wrapper.style.transform = 'translateY(0)';
  };

  const lowerImage = (wrapper: HTMLDivElement, delay: number) => {
    wrapper.style.transition = `transform 0.5s ease-in ${delay}ms`;
    wrapper.style.transform = 'translateY(110vh)';
  };

  // ── Virtual scroll ───────────────────────────────────────────
  const maxVirtualScroll = (study.gallery.length - 1) * SCROLL_PER_IMAGE;
  let virtualScroll = 0;
  let dismissAccum = 0;
  let dismissed = false;
  const peeked = new Set<number>([0]);

  // ── Caption + counter ────────────────────────────────────────
  const CAPTION_DELAY = 800; // ms of stillness before caption fades in
  let captionTimer: ReturnType<typeof setTimeout> | null = null;
  let activeIdx = 0;

  const getCaptionText = (idx: number) =>
    (study.gallery[idx] as { caption?: string }).caption ?? '';

  const scheduleCaption = (idx: number) => {
    if (captionTimer) clearTimeout(captionTimer);
    captionEl.style.opacity = '0';

    const text = getCaptionText(idx);
    if (!text) return;

    captionTimer = setTimeout(() => {
      captionEl.textContent = text;
      captionEl.style.opacity = '1';
    }, CAPTION_DELAY);
  };

  let counterAnimating = false;
  let scrollDirection: 1 | -1 = 1; // 1 = forward/down, -1 = backward/up

  const animateCounter = (num: number, dir: 1 | -1) => {
    if (counterAnimating) {
      counterNumEl.style.transition = 'none';
      counterNumEl.textContent = String(num);
      counterNumEl.style.transform = 'translateY(0)';
      counterNumEl.style.opacity = '1';
      return;
    }
    counterAnimating = true;

    // Exit: slide in the direction of travel, fade out
    const exitY = dir === 1 ? '-7px' : '7px';
    const enterY = dir === 1 ? '5px' : '-5px';

    counterNumEl.style.transition = 'transform 0.18s ease-in, opacity 0.18s ease-in';
    counterNumEl.style.transform = `translateY(${exitY})`;
    counterNumEl.style.opacity = '0';

    setTimeout(() => {
      counterNumEl.style.transition = 'none';
      counterNumEl.textContent = String(num);
      counterNumEl.style.transform = `translateY(${enterY})`;
      counterNumEl.style.opacity = '0';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          counterNumEl.style.transition = 'transform 0.38s cubic-bezier(0.22, 1, 0.32, 1), opacity 0.25s ease-out';
          counterNumEl.style.transform = 'translateY(0)';
          counterNumEl.style.opacity = '1';
          setTimeout(() => { counterAnimating = false; }, 420);
        });
      });
    }, 160);
  };

  const updateActiveIdx = () => {
    const newIdx = Math.min(
      Math.round(virtualScroll / SCROLL_PER_IMAGE),
      study.gallery.length - 1,
    );
    if (newIdx === activeIdx) return;
    activeIdx = newIdx;
    animateCounter(newIdx + 1, scrollDirection);
    scheduleCaption(newIdx);
  };

  const peekImage = (idx: number) => {
    if (peeked.has(idx) || idx >= imgEls.length) return;
    peeked.add(idx);
    imgEls[idx].style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.32, 1)';
    imgEls[idx].style.transform = `translateY(${heights[idx] - 20}px)`;
  };

  const updateImages = () => {
    for (let i = 1; i < imgEls.length; i++) {
      const phaseStart = (i - 1) * SCROLL_PER_IMAGE;
      const phaseEnd = i * SCROLL_PER_IMAGE;
      imgEls[i].style.transition = 'none';
      if (virtualScroll >= phaseEnd) {
        imgEls[i].style.transform = 'translateY(0)';
      } else if (virtualScroll > phaseStart) {
        const progress = (virtualScroll - phaseStart) / SCROLL_PER_IMAGE;
        imgEls[i].style.transform = `translateY(${(heights[i] - 20) * (1 - progress)}px)`;
        peekImage(i + 1);
      } else if (peeked.has(i)) {
        // Reverse back to peek position when scrolling back up
        imgEls[i].style.transform = `translateY(${heights[i] - 20}px)`;
      }
    }
    updateActiveIdx();
  };

  const triggerBack = () => {
    if (dismissed) return;
    dismissed = true;
    window.removeEventListener('resize', updateLayout);
    sidebar.style.transition = 'opacity 0.2s ease';
    sidebar.style.opacity = '0';
    bgPanel.style.opacity = '0';
    if (reduced) {
      location.hash = '#/';
      return;
    }
    [...imgEls].reverse().forEach((w, i) => lowerImage(w, i * 80));
    const exitDuration = (imgEls.length - 1) * 80 + 520;
    setTimeout(() => { location.hash = '#/'; }, exitDuration);
  };

  // ── Project swipe navigation ─────────────────────────────────
  // Use workIndex order so swipe direction matches the landing page list
  const slugs = workIndex
    .filter(row => row.slug && caseStudies[row.slug]?.gallery?.length)
    .map(row => row.slug!);
  const currentIdx = slugs.indexOf(slug);
  const prevSlug = currentIdx > 0 ? slugs[currentIdx - 1] : null;
  const nextSlug = currentIdx < slugs.length - 1 ? slugs[currentIdx + 1] : null;

  const triggerSwipe = (direction: 'left' | 'right') => {
    if (dismissed) return;
    const targetSlug = direction === 'left' ? nextSlug : prevSlug;
    if (!targetSlug) return;
    dismissed = true;
    window.removeEventListener('resize', updateLayout);
    sidebar.style.transition = 'opacity 0.2s ease';
    sidebar.style.opacity = '0';
    bgPanel.style.opacity = '0';
    [...imgEls].reverse().forEach((w, i) => lowerImage(w, i * 80));
    const exitDuration = (imgEls.length - 1) * 80 + 520;
    setTimeout(() => { location.hash = `#/work/${targetSlug}`; }, exitDuration);
  };

  const HORIZONTAL_SWIPE_THRESHOLD = 120; // accumulated deltaX to trigger project switch
  let horizontalAccum = 0;

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (dismissed) return;

    // Horizontal trackpad/Magic Mouse swipe — accumulate and switch projects.
    // Only count events where horizontal intent is clear and movement is deliberate.
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      const MIN_DELTA = 12; // ignore small incidental movements
      if (Math.abs(e.deltaX) >= MIN_DELTA) {
        horizontalAccum += e.deltaX * 0.6; // dampen so it needs a committed flick
      }
      if (horizontalAccum >= HORIZONTAL_SWIPE_THRESHOLD) {
        horizontalAccum = 0;
        triggerSwipe('left');
      } else if (horizontalAccum <= -HORIZONTAL_SWIPE_THRESHOLD) {
        horizontalAccum = 0;
        triggerSwipe('right');
      }
      return;
    }

    horizontalAccum = 0; // reset if user goes vertical
    scrollDirection = e.deltaY >= 0 ? 1 : -1;
    const proposed = virtualScroll + e.deltaY;
    if (proposed < 0) {
      // Upward overscroll past the start — accumulate toward dismiss
      dismissAccum += -proposed;
      virtualScroll = 0;
      updateImages();
      if (dismissAccum >= DISMISS_THRESHOLD) triggerBack();
    } else {
      if (e.deltaY > 0) dismissAccum = 0; // reset on downward scroll
      virtualScroll = Math.min(maxVirtualScroll, proposed);
      updateImages();
    }
  };

  const SWIPE_THRESHOLD = 72; // px of horizontal travel to trigger project switch
  let touchStartY = 0;
  let touchStartX = 0;
  let touchIntent: 'unknown' | 'vertical' | 'horizontal' = 'unknown';

  const handleTouchMove = (e: TouchEvent) => {
    if (dismissed) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;

    // Lock intent on first meaningful movement
    if (touchIntent === 'unknown') {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        touchIntent = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
      }
    }

    if (touchIntent === 'horizontal') return; // let touchend handle it

    e.preventDefault();
    const delta = touchStartY - e.touches[0].clientY;
    touchStartY = e.touches[0].clientY;
    scrollDirection = delta >= 0 ? 1 : -1;
    const proposed = virtualScroll + delta;
    if (proposed < 0) {
      dismissAccum += -proposed;
      virtualScroll = 0;
      updateImages();
      if (dismissAccum >= DISMISS_THRESHOLD) triggerBack();
    } else {
      if (delta > 0) dismissAccum = 0;
      virtualScroll = Math.min(maxVirtualScroll, proposed);
      updateImages();
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (dismissed) return;
    if (touchIntent === 'horizontal') {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        triggerSwipe(dx < 0 ? 'left' : 'right');
      }
    }
    touchIntent = 'unknown';
  };

  container.addEventListener('wheel', handleWheel, { passive: false });
  container.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    touchIntent = 'unknown';
  }, { passive: true });
  container.addEventListener('touchmove', handleTouchMove, { passive: false });
  container.addEventListener('touchend', handleTouchEnd, { passive: true });

  // ── Entry animation ──────────────────────────────────────────
  if (reduced) {
    imgEls.forEach(w => { w.style.transform = 'translateY(0)'; });
    sidebar.style.opacity = '1';
    scheduleCaption(0);
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        riseImage(imgEls[0], 0);
        sidebar.style.transition = 'opacity 0.4s ease 600ms';
        sidebar.style.opacity = '1';
        if (imgEls.length > 1) setTimeout(() => peekImage(1), 700);
        // Seed first caption after entry animation settles
        scheduleCaption(0);
      });
    });
  }

  // ── Back button ──────────────────────────────────────────────
  backBtn.addEventListener('click', triggerBack);
}
