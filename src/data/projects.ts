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
    title: 'Design system update',
    category: 'Design system',
    client: 'Pfizer',
    clientColumn: 'narrow',
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
    title: 'AI Stipple Card Generator',
    category: 'AI Exploration  ↗',
    client: 'Self',
    clientColumn: 'wide',
  },
  {
    year: '',
    title: 'Link Hover Generator',
    category: 'AI Exploration  ↗',
    client: 'Self',
    clientColumn: 'wide',
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
  gallery: { src: string; caption: string }[];
};

const tnfBase = '/assets/TNF';

export const caseStudies: Record<string, CaseStudy> = {
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
