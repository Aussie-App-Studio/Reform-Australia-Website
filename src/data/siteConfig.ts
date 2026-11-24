export const siteConfig = {
  brandName: 'Christian Reformed Churches of Australia',
  shortName: 'CRCA',
  tagline: 'Reforming to Reach the Lost for Christ',
  establishedYear: 1951,
  adminEmail: 'admin@crca.org.au',
  safeChurch: {
    name: 'Safe Church Unit',
    /** Internal route — the full Safe Church site now lives inside this site. */
    url: '/safe-church',
    summary:
      'Dedicated safeguarding, compliance training, and pastoral care support so every CRCA congregation remains a safe place for children and vulnerable people.',
    /** Shown in the "Need help now?" panel on every Safe Church page. */
    urgent: {
      emergency: '000',
      primaryPhone: '0436 304 451',
      primaryLabel: 'Safe Church Unit (24/7 for abuse-related reports)',
      backupPhone: '0419 330 003',
      backupLabel: 'If there is no response',
      email: 'scu@crca.org.au',
      childReportPath: '/safe-church/children/reporting/how-to-report',
      adultReportPath: '/safe-church/adults/how-to-report',
    },
  },
  /**
   * Contact form delivery. Leave endpoint empty to keep the current behaviour
   * (the form prepares an email for the visitor's own mail app).
   * To send directly from the site, create a form at a service such as Formspree
   * (https://formspree.io) or Web3Forms and paste its POST URL here — the form
   * sends JSON: { topic, to, cc, name, email, church, message }.
   */
  contactForm: {
    endpoint: '',
  },
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
