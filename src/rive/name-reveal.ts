import { Rive, Layout, Fit, Alignment, RuntimeLoader } from '@rive-app/webgl2';

const baseUrl = import.meta.env.BASE_URL;
RuntimeLoader.setWasmUrl(`${baseUrl}rive.wasm`);

export interface NameRevealControls {
  setDark(isDark: boolean): void;
}

export function initNameReveal(canvas: HTMLCanvasElement): NameRevealControls {
  canvas.width = 240;
  canvas.height = 40;

  let hovered = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let isDarkProp: any = null;

  const r = new Rive({
    src: `${baseUrl}assets/name-reveal.riv`,
    canvas,
    autoplay: false,
    autoBind: true,
    // State Machine 2 drives the color via ViewModel/Data Binding
    stateMachines: 'State Machine 2',
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.CenterLeft }),

    onLoadError: (e) => console.error('[NameReveal] load error:', e),

    onLoad: () => {
      // Size canvas to artboard aspect ratio at 32px tall
      try {
        const b = r.bounds;
        const artW = b.maxX - b.minX;
        const artH = b.maxY - b.minY;
        if (artW > 0 && artH > 0) {
          const h = 32;
          canvas.style.height = `${h}px`;
          canvas.style.width = `${Math.round(artW * (h / artH))}px`;
        }
      } catch { /* keep attribute dimensions */ }
      r.resizeDrawingSurfaceToCanvas();

      // Scrub to end of 'unhover' = resting (unrevealed) state
      r.pause();
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rt = r as any;
        const anim = rt._artboard?.animationByName?.('unhover')
          ?? rt.artboard?.animationByName?.('unhover');
        const duration = (anim?.duration && anim?.fps) ? anim.duration / anim.fps : 1;
        r.scrub('unhover', duration);
      } catch {
        r.scrub('unhover', 1);
      }
      r.drawFrame();

      // ViewModel / Data Binding — access isDark as a bound property
      const vm = r.viewModelInstance;
      if (vm) {
        isDarkProp = vm.boolean('isDark');
        if (isDarkProp) {
          isDarkProp.value = false;
          r.play('State Machine 2');
        }
      }

      if (hovered) r.play('hover');
    },
  });

  canvas.addEventListener('mouseenter', () => {
    hovered = true;
    r.stop('unhover');
    r.play('hover');
  });

  canvas.addEventListener('mouseleave', () => {
    hovered = false;
    r.stop('hover');
    r.play('unhover');
  });

  return {
    setDark(isDark: boolean) {
      if (!isDarkProp) return;
      isDarkProp.value = isDark;
      r.play('State Machine 2');
    },
  };
}
