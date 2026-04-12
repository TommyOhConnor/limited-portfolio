export type WorkIndexRow = {
  year: string;
  title: string;
  category: string;
  client: string;
  /** Narrow client column (104px in Figma) vs wide (160px) */
  clientColumn: 'narrow' | 'wide';
  /** Which landing section this row belongs to */
  section: 'ai' | 'product';
  /** In-page stacked-image case study */
  slug?: string;
  /** External URL — opens in new tab instead of detail page */
  externalUrl?: string;
};

/** AI Stuffs section rows */
export const aiWorkIndex: WorkIndexRow[] = [
  {
    year: '',
    title: 'Meraki DS Update',
    category: 'Design system',
    client: 'Pfizer',
    clientColumn: 'narrow',
    section: 'ai',
    slug: 'meraki-ds-update',
  },
  {
    year: '',
    title: 'Motel Key Card Generator',
    category: 'AI Exploration',
    client: 'Fun',
    clientColumn: 'wide',
    section: 'ai',
    slug: 'motel-key-card-generator',
  },
  {
    year: '',
    title: 'Link Hover Interaction',
    category: 'AI Exploration',
    client: 'Fun',
    clientColumn: 'wide',
    section: 'ai',
    slug: 'link-hover-interaction',
  },
];

/** Product Design section rows */
export const productWorkIndex: WorkIndexRow[] = [
  {
    year: '2025',
    title: 'Post-op Internal Bleed Monitor',
    category: 'Healthcare product design',
    client: 'Hemasense',
    clientColumn: 'wide',
    section: 'product',
    slug: 'post-op-bleed-monitor',
  },
  {
    year: '2025',
    title: 'Wear tester dashboard',
    category: 'Product design',
    client: 'The North Face',
    clientColumn: 'wide',
    section: 'product',
    slug: 'tnf-wear-tester',
  },
  {
    year: '2020–22',
    title: 'Various brand marks',
    category: 'Brand identity',
    client: 'n/a',
    clientColumn: 'wide',
    section: 'product',
    slug: 'brand-marks',
  },
];

/** Combined list (for detail page nav, preserves order) */
export const workIndex: WorkIndexRow[] = [...aiWorkIndex, ...productWorkIndex];

/** Single still in the case-study gallery */
export type CaseStudyGalleryStill = {
  src: string;
  caption: string;
  /** Override object-fit; defaults to 'cover' */
  fit?: 'cover' | 'contain';
  /** Override object-position; defaults to 'top center' */
  align?: 'left' | 'center' | 'right';
};

/** Two frames alternating on a timer (detail page only) */
export type CaseStudyGalleryCycle = {
  caption: string;
  cycleFrames: [string, string];
  /** ms each frame stays visible before switching; default 2000 */
  cycleIntervalMs?: number;
};

/** Looping mp4 video */
export type CaseStudyGalleryVideo = {
  videoSrc: string;
  caption: string;
  fit?: 'cover' | 'contain';
  align?: 'left' | 'center' | 'right';
};

export type CaseStudyGalleryItem = CaseStudyGalleryStill | CaseStudyGalleryCycle | CaseStudyGalleryVideo;

export type CaseStudy = {
  slug: string;
  headline: string;
  type: string;
  description: string;
  /** Optional live demo / product link (shown after description on detail page) */
  tryItUrl?: string;
  tryItLabel?: string;
  gallery: CaseStudyGalleryItem[];
};

const assetsBase = `${import.meta.env.BASE_URL}assets`;
const tnfBase = `${assetsBase}/TNF`;
const bmBase = `${assetsBase}/Brandmarks`;
const hoverBase = `${assetsBase}/Hover`;
const cardsBase = `${assetsBase}/Cards`;
const merakiBase = `${assetsBase}/meraki`;
const hemasenseBase = `${assetsBase}/Hemasense`;

export const caseStudies: Record<string, CaseStudy> = {
  'post-op-bleed-monitor': {
    slug: 'post-op-bleed-monitor',
    headline: 'Post-op Internal Bleed Monitor - Hemasense',
    type: 'Product Design',
    description:
      "HemaSense is an early bleed detection patch for post-surgical recovery — and this is the tablet interface that talks to it. Designed for clinical environments where information has to land at a glance from varying distances, and where accidental touches to critical functions aren't an option. Currently in clinical trials.",
    gallery: [
      {
        src: `${hemasenseBase}/Base - One Patch.png`,
        caption:
          'The base state — vitals monitored, patch connected, nothing demanding attention.',
        fit: 'contain',
        align: 'left',
      },
      {
        src: `${hemasenseBase}/Alarm On - High Severity.png`,
        caption:
          'A disconnected patch triggers a staged warning sequence designed to be read instantly from across the room.',
        fit: 'contain',
        align: 'right',
      },
      {
        src: `${hemasenseBase}/Histogram.png`,
        caption:
          'Histogram of recent readings — a quick way to see how values cluster and whether anything is drifting out of range.',
        fit: 'contain',
        align: 'left',
      },
      {
        src: `${hemasenseBase}/Alarm Off - High Severity.png`,
        caption: '',
        fit: 'contain',
        align: 'left',
      },
    ],
  },
  'meraki-ds-update': {
    slug: 'meraki-ds-update',
    headline: 'Meraki DS Update - Pfizer',
    type: 'Design System',
    description:
      "A design system update with a twist. After refreshing Meraki's 60+ component library, I used Cursor to convert everything into React components and packaged the system as an npm module — making it instantly consumable by AI-native tools like Figma Make and Cursor. Design systems built for how work actually happens now.",
    gallery: [
      {
        src: `${merakiBase}/Cards - FIN.png`,
        caption:
          'Card components built to flex across layout contexts without losing visual consistency.',
      },
      {
        src: `${merakiBase}/Form - FIN.png`,
        caption:
          'Form elements designed for clarity under pressure — inputs, selects, and states that just work.',
      },
      {
        src: `${merakiBase}/Storybook 1 - FIN.png`,
        caption:
          'The full component library living in Storybook, documented and ready to build with.',
      },
      {
        src: `${merakiBase}/Storybook 2 - FIN.png`,
        caption:
          'Design tokens exposed in Storybook — the single source of truth for color, type, and spacing.',
      },
    ],
  },
  'motel-key-card-generator': {
    slug: 'motel-key-card-generator',
    headline: 'Motel Key Card Generator - Self',
    type: 'AI Exploration',
    description:
      "This one started as a stipple pattern generator — a visual experiment for my portfolio that didn't quite land. Rather than scrap it, I repurposed the tool into a guest card generator for a fictitious hotel called The Motel. Built with Cursor and Claude Code, it's a small example of how AI-assisted builds make pivoting cheap and exploration worth it.",
    tryItUrl: 'https://guest-card-generator.vercel.app/',
    tryItLabel: 'Try it out',
    gallery: [
      { src: `${cardsBase}/Landing Page - FIN.png`, caption: '', fit: 'contain', align: 'left' },
      { src: `${cardsBase}/Cards - FIN.png`, caption: '', fit: 'contain', align: 'right' },
    ],
  },
  'link-hover-interaction': {
    slug: 'link-hover-interaction',
    headline: 'Link Hover Interaction - Self',
    type: 'AI Exploration',
    description:
      'An AI-assisted experiment exploring how small variables shape the feel of a single interaction. Built with Cursor, this playground lets you tweak font, color, size, and speed in real time — a fast way to feel the difference between a link that whispers and one that snaps.',
    tryItUrl: 'https://hover-effect-generator.vercel.app/',
    tryItLabel: 'Try it out',
    gallery: [
      { src: `${hoverBase}/Landing Page - FIN.png`, caption: '', fit: 'contain', align: 'left' },
    ],
  },
  'brand-marks': {
    slug: 'brand-marks',
    headline: 'Various brand marks',
    type: 'Brand identity',
    description:
      'A collection of brand marks created between 2020 and 2022. Each mark started with a problem — a name, a feeling, a market position — and ended somewhere unexpected.',
    gallery: [
      { src: `${bmBase}/BM - 1.png`, caption: '', fit: 'contain', align: 'left' },
      { src: `${bmBase}/BM - 2.png`, caption: '', fit: 'contain', align: 'left' },
      { src: `${bmBase}/BM - 3.png`, caption: '', fit: 'contain', align: 'left' },
      { src: `${bmBase}/BM - 4.png`, caption: '', fit: 'contain', align: 'right' },
      { src: `${bmBase}/BM - 5.png`, caption: '', fit: 'contain', align: 'right' },
    ],
  },
  'tnf-wear-tester': {
    slug: 'tnf-wear-tester',
    headline: 'Wear tester dashboard - The North Face',
    type: 'Product design',
    description:
      "Designed an internal tool for The North Face's wear tester team to track athlete performance and surface actionable insights from Apple Watch data. Previously reliant on manual surveys and spreadsheets, the new platform streamlined data collection and gave the team a real-time view of how gear performed in the field. The project proved successful enough that leadership began exploring how key features could be adapted for a broader customer loyalty program.",
    gallery: [
      {
        src: `${tnfBase}/Landing Page - FIN.png`,
        caption:
          'Program member growth tracked over time — a key metric for gauging loyalty program adoption and momentum.',
        fit: 'contain',
        align: 'left',
      },
      {
        src: `${tnfBase}/Athletes - FIN.png`,
        caption:
          'A filterable data table giving the wear tester team a detailed view of each athlete and their performance data, with advanced filtering to cut through the noise.',
        fit: 'contain',
        align: 'left',
      },
      {
        src: `${tnfBase}/Graphs - FIN.png`,
        caption:
          'Dual data visualizations — activity by sport and program member growth — surfacing how gear performs across disciplines.',
        fit: 'contain',
        align: 'right',
      },
    ],
  },
};
