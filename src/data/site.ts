export const site = {
  name: 'Tommy O\'Connor',
  nameAbbreviation: 'T..... O\'',
  heroHeadline: 'I\'m a dev-curious product designer with 25+ years of figuring things out.',
  email: 'me@tommy-oconnor.com',
  xHandle: '@DadBodTrlRnnr',
  xUrl: 'https://x.com/DadBodTrlRnnr',
  /** Bio shown in the dark "About" state (MORE expanded) */
  aboutBio: {
    paragraphs: [
      `I'm a designer — and I've been doing that, in some form for well over two decades. I wasn't an artist who became a designer, I don't even remember drawing much as a kid. I was always more of a builder and a tinkerer who loved shape and movement.`,
      `I'm self-taught, coming up through illustration, motion, and branding before *product design* was even a job title. That path gave me something I've leaned on ever since: the ability to move fluidly between visual craft and technical thinking, and a deep comfort with figuring things out as I go.`,
      `Most of my recent work has been in enterprise product design and design systems — leading Figma library architecture projects, contributing to clinical mobile apps, and designing across healthcare, insurance, and retail for companies ranging from early-stage startups to Fortune 100s.`,
      `But what's got me really excited right now is AI — and this feeling isn't new. I taught myself Flash ActionScript back in the day because I wanted to make things that design tools alone couldn't. That was my first taste of _design meets code_ — and I loved it. Modern AI tools like Claude Code, Codex, Cursor, along with Shadcn, and Rive I feel like I'm reliving those moments, and I can't be more excited.`,
      `If this resonates with you, feel free to reach out using one of the links below.`,
    ] as (string | null)[],
    /** Legacy italic paragraph payload (unused when no null paragraphs are present) */
    aiParagraph: {
      before: `But what's got me excited right now is AI — and this feeling isn't new. I taught myself Flash ActionScript back in the day because I wanted to make things that design tools alone couldn't. That was my first taste of `,
      italic: `design meets code`,
      after: ` — and I loved it. Tools like Claude Code, Cursor, and AI-augmented workflows feel like I'm reliving those moments, and I can't be more excited.`,
    },
  },
};
