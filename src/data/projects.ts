export type WorkIndexRow = {
  year: string;
  title: string;
  category: string;
  client: string;
  /** Narrow client column (104px in Figma) vs wide (160px) */
  clientColumn: 'narrow' | 'wide';
  /** In-page case study */
  slug?: string;
};

/** Landing list: year + title/category on one line (Figma landing). */
export const workIndex: WorkIndexRow[] = [
  {
    year: '2026',
    title: 'Meraki DS Update',
    category: 'Design system',
    client: 'Pfizer',
    clientColumn: 'narrow',
    slug: 'meraki-ds-update',
  },
  {
    year: '',
    title: 'Post-op bleed monitor',
    category: 'Mobile product design',
    client: 'Hemasense',
    clientColumn: 'wide',
  },
  {
    year: '',
    title: 'Motel Key Card Generator',
    category: 'AI Exploration  ↗',
    client: 'Self',
    clientColumn: 'wide',
    slug: 'motel-key-card-generator',
  },
  {
    year: '',
    title: 'Link Hover Interaction',
    category: 'AI Exploration  ↗',
    client: 'Self',
    clientColumn: 'wide',
    slug: 'link-hover-interaction',
  },
  {
    year: '2025',
    title: 'Wear tester dashboard',
    category: 'Product design',
    client: 'The North Face',
    clientColumn: 'wide',
    slug: 'tnf-wear-tester',
  },
];

export type CaseStudy = {
  slug: string;
  headline: string;
  type: string;
  description: string;
  /** Optional live demo / product link (shown after description on detail page) */
  tryItUrl?: string;
  tryItLabel?: string;
  gallery: { src: string; caption: string }[];
};

const tnfBase = '/assets/TNF';
const hoverBase = '/assets/Hover';
const cardsBase = '/assets/Cards';
const merakiBase = '/assets/meraki';

export const caseStudies: Record<string, CaseStudy> = {
  'meraki-ds-update': {
    slug: 'meraki-ds-update',
    headline: 'Meraki DS Update - Pfizer',
    type: 'Design system',
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
      {
        src: `${cardsBase}/Landing Page - FIN.png`,
        caption:
          'Landing view of the generator: configure and preview guest key cards for The Motel.',
      },
      {
        src: `${cardsBase}/Cards - FIN.png`,
        caption: 'So many room keys!',
      },
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
      {
        src: `${hoverBase}/Landing Page - FIN.png`,
        caption:
          'The playground UI: adjust typography, color, circle size, transition speed, and growth to compare hover treatments side by side.',
      },
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
          'A dashboard overview surfacing participation numbers, garment tracking, recent activity, and demographic and device breakdowns at a glance.',
      },
      {
        src: `${tnfBase}/Athletes - FIN.png`,
        caption:
          'A filterable data table giving the wear tester team a detailed view of each athlete and their performance data, with advanced filtering to cut through the noise.',
      },
      {
        src: `${tnfBase}/Graphs - FIN.png`,
        caption: 'Various Data Visualizations',
      },
      {
        src: `${tnfBase}/Mobile - FIN.png`,
        caption:
          'The landing page and athlete table adapted for mobile, keeping the full data experience accessible in the field.',
      },
    ],
  },
};

export function groupWorkByYear(rows: WorkIndexRow[]): { year: string; rows: WorkIndexRow[] }[] {
  const out: { year: string; rows: WorkIndexRow[] }[] = [];
  let current: { year: string; rows: WorkIndexRow[] } | null = null;
  for (const row of rows) {
    if (row.year) {
      current = { year: row.year, rows: [row] };
      out.push(current);
    } else if (current) {
      current.rows.push(row);
    }
  }
  return out;
}
