import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import beliefsData from '../data/beliefs.json';
import { DOC_IDS } from '../lib/crcaDocs/client';

interface StandardDoc {
  title: string;
  note: string;
  docId: string;
  pdfUrl?: string;
}

const reader = (id: string) => `/for-churches/forms-and-documents/${id}`;
const pdfOf = (id: string) => beliefsData.reformedConfessions.find((c) => c.readerDocId === id)?.pdfUrl;

const GROUPS: { title: string; intro: string; docs: StandardDoc[] }[] = [
  {
    title: 'The ecumenical creeds',
    intro: 'Shared with the Christian church around the world and throughout the ages.',
    docs: [
      { title: 'The Apostles’ Creed', note: 'The early church’s baptismal creed.', docId: DOC_IDS.apostlesCreed },
      { title: 'The Nicene Creed', note: 'From the councils of Nicaea (325) and Constantinople (381).', docId: DOC_IDS.niceneCreed },
      { title: 'The Athanasian Creed', note: 'On the Trinity and the person of Christ.', docId: DOC_IDS.athanasianCreed },
    ],
  },
  {
    title: 'The Reformed confessions',
    intro: 'Known together as the Three Forms of Unity.',
    docs: [
      {
        title: 'The Belgic Confession',
        note: '1561. Written by Guido de Brès, in 37 articles.',
        docId: DOC_IDS.belgicConfession,
        pdfUrl: pdfOf(DOC_IDS.belgicConfession),
      },
      {
        title: 'The Heidelberg Catechism',
        note: '1563. 129 questions and answers, arranged in 52 Lord’s Days.',
        docId: DOC_IDS.heidelbergCatechism,
        pdfUrl: pdfOf(DOC_IDS.heidelbergCatechism),
      },
      {
        title: 'The Canons of Dort',
        note: '1618–1619. The Synod of Dort’s answer to the Remonstrants, in five main points of doctrine.',
        docId: DOC_IDS.canonsOfDort,
        pdfUrl: pdfOf(DOC_IDS.canonsOfDort),
      },
    ],
  },
  {
    title: 'Also held in high regard',
    intro: '',
    docs: [
      {
        title: 'The Westminster Confession of Faith',
        note: '1646. Included in the CRCA Form of Subscription alongside the Three Forms of Unity.',
        docId: DOC_IDS.westminsterConfession,
      },
      {
        title: 'Our World Belongs to God',
        note: 'A contemporary testimony from the Christian Reformed Church in North America.',
        docId: DOC_IDS.contemporaryTestimony,
      },
    ],
  },
];

const OVERVIEW = beliefsData.overview.split('. ');

export function BeliefsPage() {
  return (
    <>
      <PageHeader
        title="What we believe"
        description={`${OVERVIEW.slice(0, 2).join('. ')}.`}
        photo={{ src: `${import.meta.env.BASE_URL}images/ministries/candidacy/rtc-students.webp`, alt: 'Three students talking over open Bibles on a lawn', credit: 'Reformed Theological College (used with permission)' }}
        breadcrumbs={[{ label: 'Who we are' }, { label: 'What we believe' }]}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 [&>*]:max-w-3xl">
          <p className="mb-14 text-xl leading-relaxed text-stone-700">{OVERVIEW.slice(2).join('. ')}</p>
          {GROUPS.map((group, gi) => (
            <div key={group.title} className={gi > 0 ? 'mt-14' : ''}>
              <h2 className="font-serif text-3xl font-semibold text-navy-900">{group.title}</h2>
              {group.intro && <p className="mt-2 text-lg leading-relaxed text-stone-700">{group.intro}</p>}
              <ul className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
                {group.docs.map((doc) => (
                  <li key={doc.docId} className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                    <div>
                      <Link
                        to={reader(doc.docId)}
                        className="font-serif text-xl font-semibold text-navy-900 underline-offset-4 hover:text-teal-700 hover:underline"
                      >
                        {doc.title}
                      </Link>
                      <p className="mt-1 leading-relaxed text-stone-600">{doc.note}</p>
                    </div>
                    <div className="flex shrink-0 gap-2 font-semibold">
                      <Link to={reader(doc.docId)} className="inline-flex min-h-11 items-center rounded-md border border-stone-300 px-4 text-teal-700 hover:border-teal-500 hover:text-navy-900">
                        Read
                      </Link>
                      {doc.pdfUrl && (
                        <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-md border border-stone-300 px-4 text-teal-700 hover:border-teal-500 hover:text-navy-900">
                          PDF
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <h2 className="mt-14 font-serif text-3xl font-semibold text-navy-900">For office bearers</h2>
          <p className="mt-3 text-lg leading-relaxed text-stone-700">
            Ministers, elders and deacons sign the{' '}
            <Link to={reader(DOC_IDS.formOfSubscription)} className="font-semibold text-teal-700 underline-offset-4 hover:underline">
              Form of Subscription
            </Link>
            , declaring that the teaching of these confessions agrees with the Word of God and promising to teach and defend it.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-stone-700">
            All of these documents, with the liturgical forms and the Church Order, are in the{' '}
            <Link to="/for-churches/forms-and-documents" className="font-semibold text-teal-700 underline-offset-4 hover:underline">
              Forms and documents library
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
