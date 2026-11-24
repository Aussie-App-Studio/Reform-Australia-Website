import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, CheckCircle2, Copy, Mail, Phone, Send } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import contactTopics from '../data/contactTopics.json';
import { siteConfig } from '../data/siteConfig';

const FORM_ENDPOINT: string = siteConfig.contactForm.endpoint;

interface ContactTopic {
  id: string;
  title: string;
  subtitle: string;
  routeToLabel: string;
  contactName?: string;
  email: string;
  secondaryEmail?: string;
  phone?: string;
  externalUrl?: string;
  externalLabel?: string;
  responseNote: string;
  iconName: string;
}

const topics = contactTopics as ContactTopic[];
const tel = (n: string) => `tel:${n.replace(/\s+/g, '')}`;
const field =
  'mt-1.5 w-full rounded-md border border-stone-300 bg-white px-3.5 py-2.5 text-base text-navy-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/25';

export function ContactPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = searchParams.get('topic');
  const [topicId, setTopicId] = useState(topics.some((t) => t.id === initial) ? initial! : topics[0].id);
  const [name, setName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [church, setChurch] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<null | { topic: ContactTopic; delivery: 'sent' | 'prepared'; error?: string }>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = searchParams.get('topic');
    if (t && topics.some((x) => x.id === t)) setTopicId(t);
  }, [searchParams]);

  const topic = topics.find((t) => t.id === topicId) ?? topics[0];
  const urgent = siteConfig.safeChurch.urgent;

  function chooseTopic(id: string) {
    setTopicId(id);
    setResult(null);
    setSearchParams({ topic: id }, { replace: true });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!FORM_ENDPOINT) {
      setResult({ topic, delivery: 'prepared' });
      return;
    }
    setSending(true);
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          topic: topic.title,
          to: topic.email,
          cc: topic.secondaryEmail ?? '',
          name,
          email: senderEmail,
          church,
          message,
          _subject: `[${topic.title}] Enquiry from ${name}`,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult({ topic, delivery: 'sent' });
    } catch {
      setResult({ topic, delivery: 'prepared', error: 'We couldn’t send your message automatically, but you can send it from your email app below.' });
    } finally {
      setSending(false);
    }
  }

  const mailto = (t: ContactTopic) =>
    `mailto:${t.email}?${t.secondaryEmail ? `cc=${encodeURIComponent(t.secondaryEmail)}&` : ''}subject=${encodeURIComponent(
      `[${t.title}] Enquiry from ${name}`
    )}&body=${encodeURIComponent(`From: ${name} (${senderEmail})\nChurch / suburb: ${church || 'Not given'}\n\n${message}`)}`;

  async function copyMessage(t: ContactTopic) {
    const text = `To: ${t.email}${t.secondaryEmail ? `\nCC: ${t.secondaryEmail}` : ''}\nSubject: [${t.title}] Enquiry from ${name}\nFrom: ${name} (${senderEmail})\nChurch / suburb: ${church || 'Not given'}\n\n${message}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      <PageHeader title="Contact us" description="Send us a message, or contact the right person directly." breadcrumbs={[{ label: 'Contact' }]} />

      {/* Urgent safeguarding line */}
      <div className="border-b border-rose-200 bg-rose-50">
        <p className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 text-[0.95rem] text-rose-950 sm:px-6 lg:px-8">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
          <span className="font-semibold">Reporting abuse or a safeguarding concern?</span>
          <span>
            Call the Safe Church Unit on{' '}
            <a href={tel(urgent.primaryPhone)} className="font-semibold underline underline-offset-2">
              {urgent.primaryPhone}
            </a>{' '}
            at any time. If someone is in immediate danger, call {urgent.emergency}.
          </span>
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-16">
        {/* Form */}
        <section aria-labelledby="send" className="scroll-mt-28 lg:col-span-7">
          <h2 id="send" className="font-serif text-2xl font-semibold text-navy-900">
            Send a message
          </h2>

          {result ? (
            <div className="mt-6 border-l-4 border-teal-500 bg-teal-50 p-5" role="status">
              <p className="flex items-center gap-2 font-semibold text-navy-900">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-700" aria-hidden="true" />
                {result.delivery === 'sent' ? `Thank you. Your message was sent to ${result.topic.routeToLabel}.` : 'Your message is ready to send.'}
              </p>
              {result.error && <p className="mt-2 text-rose-800">{result.error}</p>}
              {result.delivery === 'sent' ? (
                <p className="mt-2 text-stone-700">We’ll reply to {senderEmail}.</p>
              ) : (
                <>
                  <p className="mt-2 text-stone-700">
                    Open it in your email app to send it to <strong className="font-semibold text-navy-900">{result.topic.email}</strong>, or copy
                    it into any email.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a href={mailto(result.topic)} className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 font-semibold text-white hover:bg-navy-800">
                      <Mail className="h-4 w-4" aria-hidden="true" /> Open in email app
                    </a>
                    <button
                      type="button"
                      onClick={() => void copyMessage(result.topic)}
                      className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2.5 font-semibold text-navy-900 hover:border-navy-900"
                    >
                      {copied ? <Check className="h-4 w-4 text-teal-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                      {copied ? 'Copied' : 'Copy message'}
                    </button>
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setMessage('');
                }}
                className="mt-4 text-sm font-semibold text-teal-700 underline underline-offset-4"
              >
                Write another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label htmlFor="c-topic" className="font-semibold text-navy-900">
                  What is it about?
                </label>
                <select id="c-topic" value={topicId} onChange={(e) => chooseTopic(e.target.value)} className={field}>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                  Goes to {topic.contactName ?? topic.routeToLabel}. {topic.responseNote}
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-name" className="font-semibold text-navy-900">
                    Your name
                  </label>
                  <input id="c-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
                </div>
                <div>
                  <label htmlFor="c-email" className="font-semibold text-navy-900">
                    Your email
                  </label>
                  <input id="c-email" type="email" required autoComplete="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} className={field} />
                </div>
              </div>
              <div>
                <label htmlFor="c-church" className="font-semibold text-navy-900">
                  Your church or suburb <span className="font-normal text-stone-500">(optional)</span>
                </label>
                <input id="c-church" value={church} onChange={(e) => setChurch(e.target.value)} className={field} />
              </div>
              <div>
                <label htmlFor="c-message" className="font-semibold text-navy-900">
                  Message
                </label>
                <textarea id="c-message" required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className={field} />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-navy-900 px-5 py-3 font-semibold text-white hover:bg-navy-800 disabled:opacity-60 sm:w-auto"
              >
                <Send className="h-4 w-4" aria-hidden="true" /> {sending ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </section>

        {/* Office */}
        <aside aria-labelledby="office" className="lg:col-span-5">
          <h2 id="office" className="font-serif text-2xl font-semibold text-navy-900">
            National office
          </h2>
          <p className="mt-3 leading-relaxed text-stone-700">
            For general enquiries, Synod matters, church directory corrections and anything you’re not sure about.
          </p>
          <a href={`mailto:${siteConfig.adminEmail}`} className="mt-4 inline-flex items-center gap-2 text-lg font-semibold text-teal-700 underline-offset-4 hover:underline">
            <Mail className="h-5 w-5" aria-hidden="true" /> {siteConfig.adminEmail}
          </a>
          <p className="mt-6 text-stone-700">
            Looking for a local church?{' '}
            <Link to="/find-a-church" className="font-semibold text-teal-700 underline-offset-4 hover:underline">
              Find a church near you
            </Link>
            .
          </p>
        </aside>
      </div>

      {/* Directory */}
      <section aria-labelledby="directory" className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <h2 id="directory" className="font-serif text-2xl font-semibold text-navy-900">
            Who to contact
          </h2>
          <ul className="mt-6 grid gap-x-12 border-t border-stone-200 md:grid-cols-2">
            {topics.map((t) => (
              <li key={t.id} className="border-b border-stone-200 py-5">
                <p className="font-semibold text-navy-900">{t.title}</p>
                <p className="text-sm text-stone-600">{t.contactName ?? t.routeToLabel}</p>
                <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                  <a href={`mailto:${t.email}`} className="inline-flex items-center gap-1.5 break-all text-teal-700 underline-offset-4 hover:underline">
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {t.email}
                  </a>
                  {t.phone && (
                    <a href={tel(t.phone)} className="inline-flex items-center gap-1.5 text-teal-700 underline-offset-4 hover:underline">
                      <Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> {t.phone}
                    </a>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    chooseTopic(t.id);
                    document.getElementById('send')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-2 text-sm font-semibold text-navy-800 hover:text-teal-700"
                >
                  Write to {t.contactName ? 'them' : 'this team'} using the form →
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
