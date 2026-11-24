export interface NavLinkItem {
  label: string;
  to: string;
  description?: string;
  isExternal?: boolean;
}

export interface MinistryMegaMenuColumn {
  id: 'next-gen' | 'training-planting' | 'global-mission';
  heading: string;
  subtitle: string;
  items: NavLinkItem[];
}

export const forChurchesNavItems: NavLinkItem[] = [
  {
    label: 'Forms & Documents Library',
    to: '/for-churches/forms-and-documents',
    description: '43 liturgical forms, creeds, confessions, worship readings & Service Prep.',
  },
  {
    label: 'CRCA Church Order (2022)',
    to: '/for-churches/forms-and-documents/church-order-01-crca-church-order-2022',
    description: 'Searchable 86-article Book of Church Order with cross-references.',
  },
  {
    label: 'Acts of Synod (2024)',
    to: '/for-churches/forms-and-documents/acts-of-synod-01-acts-of-synod-2024',
    description: 'Official Synod 2024 decisions, committee mandates, and resolutions.',
  },
  {
    label: 'Word of Salvation Sermons',
    to: '/sermons',
    description: '2,000+ CRCA reading sermons — search by book, passage, preacher or Lord’s Day.',
  },
  {
    label: 'Safe Church Unit',
    to: '/safe-church',
    description: 'Safeguarding policies, reporting a concern, volunteers, training, forms and posters.',
  },
];

export const whoWeAreNavItems: NavLinkItem[] = [
  {
    label: 'Vision & Values',
    to: '/who-we-are/vision-values',
    description: 'Our mission, vision, core values, four-fold task and strategies.',
  },
  {
    label: 'What We Believe',
    to: '/who-we-are/beliefs',
    description: 'Plain-English gospel summary plus the Ecumenical Creeds and Reformed Confessions.',
  },
  {
    label: 'Our History',
    to: '/who-we-are/history',
    description: 'How God established and grew the CRCA across Australia since 1951.',
  },
];

export const ministryMegaMenuColumns: MinistryMegaMenuColumn[] = [
  {
    id: 'next-gen',
    heading: 'Next Gen',
    subtitle: 'Children, youth and young adults',
    items: [
      {
        label: 'Cadets',
        to: '/ministries/cadets',
        description: 'A club program run by volunteers in local churches for primary school boys aged 9 to 14.',
      },
      {
        label: 'GEMS',
        to: '/ministries/gems',
        description: 'Christian girls’ clubs for girls aged 9 to 15, run by women volunteers from CRCA churches, with Busy Bees for girls aged 6 to 8.',
      },
      {
        label: 'Youth Convention',
        to: '/ministries/youth-convention',
        description: 'A week in God’s Word, worship and community for CRCA young adults aged 16 to 28. Convention 2027 is sold out, with a waitlist open.',
      },
    ],
  },
  {
    id: 'training-planting',
    heading: 'Training & Planting',
    subtitle: 'Equipping leaders & multiplying churches',
    items: [
      {
        label: 'Reformed Theological College (RTC)',
        to: 'https://rtc.edu.au/',
        description: 'The theological college where the CRCA encourages candidates for ordination to study.',
        isExternal: true,
      },
      {
        label: 'Candidacy',
        to: '/ministries/candidacy',
        description: 'How to become a candidate for ordained ministry in the CRCA, from first contact through study, vicariate and ordination.',
      },
      {
        label: 'Church Planting Taskforce',
        to: '/ministries/church-planting-taskforce',
        description: 'The Church Planting Taskforce (CPT) encourages CRCA churches in the task of planting churches throughout Australia.',
      },
      {
        label: 'Shift Coaching',
        to: '/ministries/shift-coaching',
        description: 'A set of coaching questions to help CRCA pastors and church councils grow in love, discipleship, leadership and outreach.',
      },
      {
        label: 'Local Church Outreach Training',
        to: '/ministries/local-church-outreach-training',
        description: 'Organic Outreach training to help every church member share their faith naturally, offered through a partnership with Organic Outreach International.',
      },
      {
        label: 'Missional Explorations',
        to: '/ministries/missional-explorations',
        description: 'Seed funding from the Church Planting Taskforce for local outreach that could one day grow into a church plant.',
      },
    ],
  },
  {
    id: 'global-mission',
    heading: 'Global Mission',
    subtitle: 'Partnering across cultures & denominations',
    items: [
      {
        label: 'World Transform',
        to: '/ministries/world-transform',
        description: 'Christian development for the needy, through partners overseas.',
      },
      {
        label: 'Solomon Islands SWIM',
        to: '/ministries/swim',
        description: 'SWIM (Supporting Work in Mission) is the CRCA’s mission base in Honiara, Solomon Islands, offering Bible teaching, leadership training and practical support.',
      },
      {
        label: 'Ecumenical Relations',
        to: '/ministries/ecumenical-relations',
        description: 'A synodical committee that manages the CRCA’s relationships with Reformed and Presbyterian churches in Australia and around the world.',
      },
    ],
  },
];

export const footerColumns: { title: string; links: NavLinkItem[] }[] = [
  {
    title: 'About the CRCA',
    links: [
      { label: 'Vision & Values', to: '/who-we-are/vision-values' },
      { label: 'What We Believe', to: '/who-we-are/beliefs' },
      { label: 'Our History', to: '/who-we-are/history' },
      { label: 'Find a Church', to: '/find-a-church' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    title: 'Ministries & Partners',
    links: [
      { label: 'Ministries Overview', to: '/ministries' },
      { label: 'Church Planting Taskforce', to: '/ministries/church-planting-taskforce' },
      { label: 'Candidacy & Training', to: '/ministries/candidacy' },
      { label: 'Reformed Theological College', to: 'https://rtc.edu.au/', isExternal: true },
      { label: 'World Transform', to: '/ministries/world-transform' },
    ],
  },
  {
    title: 'Church Resources',
    links: [
      { label: 'For churches', to: '/for-churches' },
      { label: 'Forms & Documents Library', to: '/for-churches/forms-and-documents' },
      {
        label: 'CRCA Church Order',
        to: '/for-churches/forms-and-documents/church-order-01-crca-church-order-2022',
      },
      { label: 'Word of Salvation Sermons', to: '/sermons' },
      { label: 'Safe Church Unit', to: '/safe-church' },
    ],
  },
];

/**
 * Desktop dropdown panels and the mobile menu. Each panel has a short
 * introduction with an overview link, then plain columns of links.
 */
export interface NavMenu {
  id: 'who-we-are' | 'ministries' | 'for-churches';
  label: string;
  /** Route prefixes that mark this menu as the current section. */
  activePrefixes: string[];
  overview: { to: string; label: string; blurb: string };
  columns: { heading: string; items: NavLinkItem[] }[];
}

export const navMenus: NavMenu[] = [
  {
    id: 'who-we-are',
    label: 'Who we are',
    activePrefixes: ['/who-we-are'],
    overview: {
      to: '/who-we-are/vision-values',
      label: 'About the CRCA',
      blurb: 'A family of Reformed churches across Australia since 1951.',
    },
    columns: [
      {
        heading: 'About us',
        items: [
          { label: 'Vision & values', to: '/who-we-are/vision-values' },
          { label: 'Four-fold task', to: '/who-we-are/vision-values#four-fold-task' },
          { label: 'Strategies', to: '/who-we-are/vision-values#strategies' },
          { label: 'What we believe', to: '/who-we-are/beliefs' },
          { label: 'Our history', to: '/who-we-are/history' },
          { label: 'Trowel and Sword', to: '/who-we-are/trowel-and-sword' },
        ],
      },
      {
        heading: 'Visit',
        items: [
          { label: 'Find a church', to: '/find-a-church' },
          { label: 'Contact us', to: '/contact' },
        ],
      },
    ],
  },
  {
    id: 'ministries',
    label: 'Ministries',
    activePrefixes: ['/ministries'],
    overview: {
      to: '/ministries',
      label: 'All ministries',
      blurb: 'The work CRCA churches do together, at home and overseas.',
    },
    columns: ministryMegaMenuColumns.map((c) => ({ heading: c.heading, items: c.items })),
  },
  {
    id: 'for-churches',
    label: 'For churches',
    activePrefixes: ['/for-churches', '/sermons', '/safe-church'],
    overview: {
      to: '/for-churches',
      label: 'All church resources',
      blurb: 'For ministers, elders, deacons and church administrators.',
    },
    columns: [
      {
        heading: 'Documents',
        items: [
          { label: 'Forms & documents', to: '/for-churches/forms-and-documents' },
          { label: 'Church Order (2022)', to: '/for-churches/forms-and-documents/church-order-01-crca-church-order-2022' },
          { label: 'Acts of Synod (2024)', to: '/for-churches/forms-and-documents/acts-of-synod-01-acts-of-synod-2024' },
          { label: 'Reading sermons', to: '/sermons' },
        ],
      },
      {
        heading: 'Support',
        items: [
          { label: 'Safe Church', to: '/safe-church' },
          { label: 'Candidacy', to: '/ministries/candidacy' },
          { label: 'Regional counsellors', to: '/for-churches/regional-counsellors' },
          { label: 'Positions vacant', to: '/for-churches/positions-vacant' },
          { label: 'Contact the office', to: '/contact' },
        ],
      },
    ],
  },
];
