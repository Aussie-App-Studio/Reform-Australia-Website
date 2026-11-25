// Content editor for the CRCA website (Sveltia CMS, Decap-compatible), at <site>/admin.
// Editors sign in through Cloudflare Access (email code or Google); functions/api/cms-auth.js then
// lets the editor save to GitHub. Every save is a commit to `main`, which republishes the site
// automatically (.github/workflows/deploy.yml, about 6 minutes). `npm run verify` runs first, so a
// broken edit stops the publish and the live site stays as it was.
// Field lists mirror src/lib/ministryPages.ts and src/lib/contentPages.ts: keep them in step.

const image = [
  { label: 'Photo', name: 'src', widget: 'image' },
  { label: 'Description for screen readers (alt text)', name: 'alt', widget: 'string', hint: 'Say what the photo shows, in a sentence.' },
  { label: 'Caption', name: 'caption', widget: 'string', required: false },
  { label: 'Photo credit', name: 'credit', widget: 'string', required: false },
];
const paragraphs = (label = 'Paragraphs') => ({ label, name: 'paragraphs', widget: 'list', required: false, field: { label: 'Paragraph', name: 'paragraph', widget: 'text' } });

/** The shared page layout used by ministry pages and general pages. */
const pageFields = [
  { label: 'Summary (under the title, and in search results)', name: 'summary', widget: 'text' },
  { label: 'Main photo', name: 'hero', widget: 'object', required: false, collapsed: true, fields: image },
  {
    label: 'Sections',
    name: 'body',
    widget: 'list',
    summary: '{{heading}}',
    fields: [
      { label: 'Heading', name: 'heading', widget: 'string', required: false },
      { name: 'id', widget: 'hidden' },
      paragraphs(),
      { label: 'Bullet list', name: 'list', widget: 'list', required: false, field: { label: 'Item', name: 'item', widget: 'text' } },
      { label: 'Photo', name: 'image', widget: 'object', required: false, collapsed: true, fields: image },
    ],
  },
  {
    label: 'Steps',
    name: 'steps',
    widget: 'object',
    required: false,
    collapsed: true,
    fields: [
      { label: 'Heading', name: 'heading', widget: 'string' },
      { label: 'Steps', name: 'items', widget: 'list', summary: '{{title}}', fields: [{ label: 'Title', name: 'title', widget: 'string' }, { label: 'Text', name: 'text', widget: 'text' }] },
    ],
  },
  { label: 'Key facts (sidebar)', name: 'facts', widget: 'list', required: false, summary: '{{label}}: {{value}}', fields: [{ label: 'Label', name: 'label', widget: 'string' }, { label: 'Value', name: 'value', widget: 'string' }] },
  {
    label: 'Contact (sidebar)',
    name: 'contact',
    widget: 'object',
    required: false,
    collapsed: true,
    fields: [
      { label: 'Name', name: 'name', widget: 'string', required: false },
      { label: 'Role', name: 'role', widget: 'string', required: false },
      { label: 'Email', name: 'email', widget: 'string', required: false },
      { label: 'Phone', name: 'phone', widget: 'string', required: false },
      { label: 'Contact form topic', name: 'topic', widget: 'string', required: false },
    ],
  },
  {
    label: 'Buttons',
    name: 'actions',
    widget: 'list',
    required: false,
    summary: '{{label}}',
    fields: [
      { label: 'Button text', name: 'label', widget: 'string' },
      { label: 'Link (a page here such as /contact, or a full web address)', name: 'url', widget: 'string' },
      { label: 'Style', name: 'kind', widget: 'select', options: ['primary', 'secondary'], default: 'secondary' },
    ],
  },
  {
    label: 'Downloads and links',
    name: 'resources',
    widget: 'list',
    required: false,
    summary: '{{label}}',
    fields: [
      { label: 'Name', name: 'label', widget: 'string' },
      { label: 'Link or file', name: 'url', widget: 'file', media_folder: '/public/ministry-resources', public_folder: '/ministry-resources', hint: 'Upload a PDF, or type a web address.' },
      { label: 'Type', name: 'type', widget: 'select', options: ['pdf', 'link', 'video'], default: 'link' },
      { label: 'Note', name: 'note', widget: 'string', required: false },
    ],
  },
  {
    label: 'People',
    name: 'team',
    widget: 'list',
    required: false,
    summary: '{{name}}',
    fields: [
      { label: 'Name', name: 'name', widget: 'string' },
      { label: 'Role', name: 'role', widget: 'string', required: false },
      { label: 'About', name: 'text', widget: 'text', required: false },
      { label: 'Photo', name: 'photo', widget: 'image', required: false },
    ],
  },
  { label: 'Photo gallery', name: 'gallery', widget: 'list', required: false, summary: '{{caption}}', fields: image },
  {
    label: 'News',
    name: 'news',
    widget: 'list',
    required: false,
    summary: '{{date}}: {{title}}',
    fields: [
      { label: 'Title', name: 'title', widget: 'string' },
      { label: 'Web address name', name: 'id', widget: 'string', hint: 'Lower case with hyphens, e.g. newsletter-2027-q1. Don’t change it once published.' },
      { label: 'Date', name: 'date', widget: 'datetime', time_format: false, format: 'YYYY-MM-DD' },
      { label: 'Summary', name: 'summary', widget: 'text', required: false },
      { label: 'Photo', name: 'image', widget: 'image', required: false },
      paragraphs(),
    ],
  },
  {
    label: 'Video',
    name: 'video',
    widget: 'object',
    required: false,
    collapsed: true,
    fields: [
      { label: 'YouTube video ID (the part after watch?v=)', name: 'youtubeId', widget: 'string' },
      { label: 'Video title', name: 'title', widget: 'string' },
    ],
  },
  { label: 'Logo', name: 'logo', widget: 'object', required: false, collapsed: true, fields: [{ label: 'Logo image', name: 'src', widget: 'image' }, { label: 'Description', name: 'alt', widget: 'string' }] },
  { label: 'Sources (for reviewers; not shown on the site)', name: 'sources', widget: 'list', required: false, field: { label: 'Source', name: 'source', widget: 'string' } },
  { label: 'Still to check (for reviewers; not shown on the site)', name: 'needsChecking', widget: 'list', required: false, field: { label: 'Note', name: 'note', widget: 'text' } },
];

const generalPageFields = [
  { label: 'Page title', name: 'title', widget: 'string' },
  { name: 'path', widget: 'hidden' },
  { name: 'slug', widget: 'hidden' },
  { name: 'section', widget: 'hidden' },
  { label: 'Icon', name: 'icon', widget: 'hidden' },
  ...pageFields,
];

window.CMS_CONFIG = {
  load_config_file: false,
  backend: {
    name: 'github',
    repo: 'crca-web/crca-website',
    branch: 'main',
    // Sign-in goes through this site's own /api/cms-auth (behind Cloudflare Access).
    base_url: window.location.origin,
    auth_endpoint: 'api/cms-auth',
    commit_messages: {
      create: 'Admin: add {{collection}} “{{slug}}”',
      update: 'Admin: update {{collection}} “{{slug}}”',
      delete: 'Admin: delete {{collection}} “{{slug}}”',
      uploadMedia: 'Admin: upload “{{path}}”',
      deleteMedia: 'Admin: delete “{{path}}”',
    },
  },
  site_url: window.location.origin,
  display_url: window.location.origin,
  logo: { src: '/images/logos/apple-touch-icon.png' },
  media_folder: 'public/images/uploads',
  public_folder: '/images/uploads',
  publish_mode: 'simple',
  output: { omit_empty_optional_fields: true, json: { indent_style: 'space', indent_size: 2 } },
  collections: [
    {
      name: 'vacancies',
      label: 'Positions vacant',
      description: 'The first list (“Current vacancies”) is also shown on the home page. Take a vacancy off both the list and its section when it closes.',
      files: [{ name: 'positions-vacant', label: 'Positions vacant page', file: 'src/data/pages/positions-vacant.json', format: 'json', fields: generalPageFields }],
    },
    {
      name: 'churches',
      label: 'Churches',
      description: 'Public details only: never add membership numbers or pastors’ personal details.',
      files: [
        {
          name: 'churches',
          label: 'All congregations',
          file: 'src/data/churches.json',
          format: 'json',
          fields: [
            {
              label: 'Congregations',
              name: 'churches',
              widget: 'list',
              root: true,
              summary: '{{name}} ({{suburb}} {{state}})',
              fields: [
                { label: 'Name', name: 'name', widget: 'string' },
                { label: 'ID (don’t change)', name: 'id', widget: 'string', hint: 'Lower case with hyphens; used in links.' },
                { label: 'Suburb or town', name: 'suburb', widget: 'string' },
                { label: 'State', name: 'state', widget: 'select', options: ['NSW', 'ACT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'] },
                { label: 'Postcode', name: 'postcode', widget: 'string' },
                { label: 'Classis', name: 'classis', widget: 'select', options: ['NSW & ACT', 'Queensland', 'South Australia', 'Tasmania', 'Gippsland Victoria', 'Maroondah Victoria', 'Western Australia'] },
                { label: 'Street address', name: 'address', widget: 'string', hint: 'e.g. 3 Renwick Close, Blaxland NSW 2774' },
                { label: 'Latitude', name: 'lat', widget: 'number', value_type: 'float', hint: 'In Google Maps, right-click the church and click the numbers to copy them.' },
                { label: 'Longitude', name: 'lng', widget: 'number', value_type: 'float' },
                { label: 'Service times', name: 'serviceTimes', widget: 'string', required: false, hint: 'e.g. 9:30am & 5:00pm' },
                { label: 'Website', name: 'website', widget: 'string', required: false },
                { label: 'Facebook page', name: 'facebook', widget: 'string', required: false },
                { label: 'YouTube channel', name: 'youtube', widget: 'string', required: false },
                { label: 'Video or livestream link', name: 'videoUrl', widget: 'string', required: false },
                { label: 'Livestreams on Facebook', name: 'livestreamOnFacebook', widget: 'boolean', default: false },
                { label: 'Podcast', name: 'podcast', widget: 'string', required: false },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'ministries',
      label: 'Ministry pages',
      description: 'One page per ministry, all with the same layout. News items show on the ministry page and get their own page.',
      folder: 'src/data/ministry-pages',
      format: 'json',
      extension: 'json',
      identifier_field: 'name',
      slug: '{{fields.slug}}',
      create: false,
      delete: false,
      summary: '{{name}}',
      fields: [
        { label: 'Ministry name', name: 'name', widget: 'string' },
        { name: 'slug', widget: 'hidden' },
        {
          label: 'Menu group',
          name: 'group',
          widget: 'select',
          options: [
            { label: 'Next generation', value: 'next-gen' },
            { label: 'Training and church planting', value: 'training-planting' },
            { label: 'Mission and partnerships', value: 'global-mission' },
          ],
        },
        ...pageFields,
      ],
    },
    {
      name: 'pages',
      label: 'Other pages',
      description: 'Regional counsellors, Trowel and Sword, Church health check and similar pages.',
      folder: 'src/data/pages',
      format: 'json',
      extension: 'json',
      identifier_field: 'title',
      slug: '{{fields.slug}}',
      create: false,
      delete: false,
      summary: '{{title}}',
      fields: generalPageFields,
    },
  ],
};
