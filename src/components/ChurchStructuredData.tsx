import churchesRaw from '../data/churches.json';
import type { ChurchRecord } from '../utils/churchRecord';
import { SITE_URL } from '../utils/usePageTitle';

/**
 * schema.org data for every congregation, so search engines (and Google Maps) can show each
 * church's name, address, location and website. Saved into the pre-rendered Find a church page.
 */
export function ChurchStructuredData() {
  const churches = churchesRaw as ChurchRecord[];
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Christian Reformed Churches of Australia congregations',
    numberOfItems: churches.length,
    itemListElement: churches.map((c, i) => {
      const street = c.address.includes(',') ? c.address.slice(0, c.address.lastIndexOf(',')).trim() : c.address;
      const sameAs = [c.facebook, c.youtube].filter(Boolean);
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Church',
          '@id': `${SITE_URL}/find-a-church#${c.id}`,
          name: c.name,
          ...(c.website ? { url: c.website } : {}),
          ...(sameAs.length ? { sameAs } : {}),
          address: {
            '@type': 'PostalAddress',
            streetAddress: street,
            addressLocality: c.suburb,
            addressRegion: c.state,
            postalCode: c.postcode,
            addressCountry: 'AU',
          },
          geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng },
          ...(c.serviceTimes ? { description: `Sunday services: ${c.serviceTimes}` } : {}),
          parentOrganization: { '@type': 'Organization', name: 'Christian Reformed Churches of Australia', url: `${SITE_URL}/` },
        },
      };
    }),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
