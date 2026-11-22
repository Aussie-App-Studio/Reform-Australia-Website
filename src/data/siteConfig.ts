export const siteConfig = {
  brandName: 'Christian Reformed Churches of Australia',
  shortName: 'CRCA',
  tagline: 'Reforming to Reach the Lost for Christ',
  establishedYear: 1951,
  adminEmail: 'admin@crca.org.au',
  safeChurch: {
    name: 'Safe Church Unit',
    url: 'https://safechurch.crca.org.au/',
    summary:
      'Dedicated safeguarding, compliance training, and pastoral care support so every CRCA congregation remains a safe place for children and vulnerable people.',
  },
  liveDirectoryUrl: 'https://crca.org.au/find-a-church/',
  logos: {
    landscapeWhite: '/images/logos/crca-logo-landscape-white.png',
    iconTeal: '/images/logos/crca-icon-teal.jpg',
    stackedColor: '/images/logos/crca-logo-stacked.jpg',
  },
  images: {
    heroCommunity: '/images/hero-community.webp',
    heritageSanctuary: '/images/heritage-sanctuary.webp',
    ministryFellowship: '/images/ministry-fellowship.webp',
  },
  quickStats: [
    {
      label: '50+ Congregations Across Australia',
      detail: 'Local churches in cities and regional centres',
    },
    {
      label: 'Bible-Centred Worship',
      detail: 'Clear Scripture preaching and warm community for all ages',
    },
    {
      label: 'Grounded in the Reformed Confessions',
      detail: 'Three Ecumenical Creeds & Three Forms of Unity',
    },
    {
      label: 'Local, National & Global Mission',
      detail: 'Equipping disciples from Australia to the world',
    },
  ],
} as const;
