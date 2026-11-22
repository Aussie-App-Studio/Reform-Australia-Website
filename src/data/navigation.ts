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
    label: 'Word of Salvation',
    to: 'https://wordofsalvation.crca.org.au/',
    description: 'CRCA reading sermons library for vacant pulpits and local congregations.',
    isExternal: true,
  },
  {
    label: 'Safe Church Unit',
    to: 'https://safechurch.crca.org.au/',
    description: 'Safeguarding policies, screening, training, and pastoral care guidance.',
    isExternal: true,
  },
];

export const whoWeAreNavItems: NavLinkItem[] = [
  {
    label: 'Vision & Values',
    to: '/who-we-are/vision-values',
    description: 'Our mission, vision, and the six biblical core values shaping our churches.',
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
    subtitle: 'Discipling children, youth & young adults',
    items: [
      {
        label: 'Cadets',
        to: '/ministries/cadets',
        description: 'Mentoring boys in Christlike character, outdoor skills, and Scripture.',
      },
      {
        label: 'GEMS',
        to: '/ministries/gems',
        description: 'Helping girls grow in faith, friendship, and service to Jesus.',
      },
      {
        label: 'Youth Convention',
        to: '/ministries/youth-convention',
        description: 'National biennial gathering uniting Reformed youth across Australia.',
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
        description: 'Biblical and Reformed theological training for pastors and church leaders.',
        isExternal: true,
      },
      {
        label: 'Candidacy',
        to: '/ministries/candidacy',
        description: '11-step pathway and examination process for ordained CRCA ministry.',
      },
      {
        label: 'Church Planting Taskforce',
        to: '/ministries/church-planting-taskforce',
        description: 'Research, vision, and support to plant and revitalise Australian churches.',
      },
      {
        label: 'Shift Coaching',
        to: '/ministries/shift-coaching',
        description: 'Intentional peer, elder, and ministry coaching for CRCA pastors.',
      },
      {
        label: 'Local Church Outreach Training',
        to: '/ministries/local-church-outreach-training',
        description: 'Organic Outreach cohorts equipping members to share their faith naturally.',
      },
      {
        label: 'Missional Explorations',
        to: '/ministries/missional-explorations',
        description: 'Matching seed grants up to $2,500 bridging local outreach and church planting.',
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
        to: 'https://worldtransform.org.au/',
        description: 'Gospel transformation and community development across partner nations.',
        isExternal: true,
      },
      {
        label: 'Solomon Islands SWIM',
        to: '/ministries/swim',
        description: 'Supporting Work in Ministry — Solomon Islands mission support and partnerships.',
      },
      {
        label: 'Ecumenical Relations',
        to: '/ministries/ecumenical-relations',
        description: 'Fellowship with sister Reformed churches worldwide and the ICRC.',
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
      { label: 'World Transform', to: 'https://worldtransform.org.au/', isExternal: true },
    ],
  },
  {
    title: 'Church Resources',
    links: [
      { label: 'Leader & Elder Hub', to: '/for-churches' },
      { label: 'Forms & Documents Library', to: '/for-churches/forms-and-documents' },
      {
        label: 'CRCA Church Order',
        to: '/for-churches/forms-and-documents/church-order-01-crca-church-order-2022',
      },
      { label: 'Word of Salvation', to: 'https://wordofsalvation.crca.org.au/', isExternal: true },
      { label: 'Safe Church Unit', to: 'https://safechurch.crca.org.au/', isExternal: true },
    ],
  },
];
