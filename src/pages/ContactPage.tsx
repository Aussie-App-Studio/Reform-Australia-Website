import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle2, Copy, ExternalLink, Mail, Phone, Send } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { MinistryIcon } from '../components/MinistryIcon';
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

export function ContactPage() {
  const topics = contactTopics as ContactTopic[];
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic') ?? topics[0].id;
  const [selectedId, setSelectedId] = useState<string>(
    topics.some((t) => t.id === initialTopic) ? initialTopic : topics[0].id
  );

  const [name, setName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [churchOrSuburb, setChurchOrSuburb] = useState('');
  const [message, setMessage] = useState('');
  const [submittedTo, setSubmittedTo] = useState<ContactTopic | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  // 'sent' = delivered by the form service; 'prepared' = visitor sends via their email app.
  const [delivery, setDelivery] = useState<'sent' | 'prepared'>('prepared');
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    const param = searchParams.get('topic');
    if (param && topics.some((t) => t.id === param)) {
      setSelectedId(param);
    }
  }, [searchParams, topics]);

  const activeTopic = topics.find((t) => t.id === selectedId) ?? topics[0];

  function handleSelectTopic(id: string) {
    setSelectedId(id);
    setSubmittedTo(null);
    setCopied(false);
    setSearchParams({ topic: id }, { replace: true });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setCopied(false);
    setSendError(null);
    if (!FORM_ENDPOINT) {
      setDelivery('prepared');
      setSubmittedTo(activeTopic);
      return;
    }
    setSending(true);
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          topic: activeTopic.title,
          to: activeTopic.email,
          cc: activeTopic.secondaryEmail ?? '',
          name,
          email: senderEmail,
          church: churchOrSuburb,
          message,
          _subject: `[${activeTopic.title}] Enquiry from ${name}`,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDelivery('sent');
    } catch {
      // Fall back to the email-app flow so the enquiry is never lost.
      setDelivery('prepared');
      setSendError('We couldn’t send your message automatically, but you can still send it from your email app below.');
    } finally {
      setSending(false);
      setSubmittedTo(activeTopic);
    }
  }

  async function handleCopyEnquiry(topic: ContactTopic) {
    const ccLine = topic.secondaryEmail ? `\nCC: ${topic.secondaryEmail}` : '';
    const payload = `To: ${topic.routeToLabel} <${topic.email}>${ccLine}\nSubject: [${topic.title}] Enquiry from ${name}\nFrom: ${name} (${senderEmail})\nCongregation / Suburb: ${churchOrSuburb || 'Not specified'}\n\n${message}`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Contact Us"
        title="Connect With the Right CRCA Team"
        description="Choose a topic below to reach the right ministry coordinator, committee chair, or support office directly."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <section className="bg-stone-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Step 1: Topic Selector Grid */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-stone-600">
                  Step 1 — Select Topic
                </span>
                <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900">
                  How can we help you?
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {topics.map((topic) => {
                  const selected = topic.id === activeTopic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleSelectTopic(topic.id)}
                      className={`flex items-start gap-4 rounded-lg border p-4 text-left transition-all ${
                        selected
                          ? 'border-teal-600 bg-white ring-2 ring-teal-500/20'
                          : 'border-stone-200 bg-white/80 hover:border-stone-300 hover:bg-white'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${
                          selected
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'bg-teal-50 border-teal-100 text-teal-700'
                        }`}
                      >
                        <MinistryIcon name={topic.iconName} className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-serif text-base font-bold text-navy-900">
                          {topic.title}
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
                          {topic.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Routed Contact Card + Form */}
            <div className="lg:col-span-6 space-y-6">
              {/* Direct Routing Card */}
              <div className="rounded-lg bg-navy-900 p-6 text-white sm:p-7">
                <div className="text-xs font-bold uppercase tracking-[0.08em] text-teal-100">
                  Direct Contact
                </div>
                <h3 className="mt-1.5 font-serif text-2xl font-bold text-white">
                  {activeTopic.routeToLabel}
                </h3>
                {activeTopic.contactName && (
                  <p className="mt-1 text-sm font-semibold text-teal-100">
                    {activeTopic.contactName}
                  </p>
                )}
                <p className="mt-2 text-sm leading-relaxed text-navy-100">
                  {activeTopic.responseNote}
                </p>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-white/15 pt-4 text-sm">
                  <a
                    href={`mailto:${activeTopic.email}?subject=${encodeURIComponent(
                      `[CRCA Website] ${activeTopic.title}`
                    )}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 font-semibold text-white hover:bg-white/20"
                  >
                    <Mail className="h-4 w-4 text-teal-400" />
                    <span>{activeTopic.email}</span>
                  </a>

                  {activeTopic.secondaryEmail && (
                    <a
                      href={`mailto:${activeTopic.secondaryEmail}?subject=${encodeURIComponent(
                        `[CRCA Website] ${activeTopic.title}`
                      )}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 font-semibold text-white hover:bg-white/20"
                    >
                      <Mail className="h-4 w-4 text-teal-400" />
                      <span>{activeTopic.secondaryEmail}</span>
                    </a>
                  )}

                  {activeTopic.phone && (
                    <a
                      href={`tel:${activeTopic.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 font-semibold text-white hover:bg-white/20"
                    >
                      <Phone className="h-4 w-4 text-teal-100" />
                      <span>{activeTopic.phone}</span>
                    </a>
                  )}

                  {activeTopic.externalUrl && activeTopic.externalUrl.startsWith('/') && (
                    <Link
                      to={activeTopic.externalUrl}
                      className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3.5 py-2 font-semibold text-white hover:bg-teal-500"
                    >
                      <span>{activeTopic.externalLabel ?? 'Open'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {activeTopic.externalUrl && !activeTopic.externalUrl.startsWith('/') && (
                    <a
                      href={activeTopic.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3.5 py-2 font-semibold text-white hover:bg-teal-500"
                    >
                      <span>{activeTopic.externalLabel ?? 'Open Portal'}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Enquiry Form */}
              <div className="rounded-lg border border-stone-200 bg-white p-6 sm:p-7">
                <div className="text-xs font-bold uppercase tracking-[0.08em] text-teal-700">
                  Step 2 — Send an Enquiry
                </div>
                <h3 className="mt-1 font-serif text-xl font-bold text-navy-900">
                  Message {activeTopic.routeToLabel}
                </h3>

                {submittedTo ? (
                  <div className="mt-5 rounded-md border border-teal-500/40 bg-teal-50 p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                      <div>
                        <h4 className="font-serif text-base font-bold text-navy-900">
                          {delivery === 'sent' ? `Thank you — your message was sent to ${submittedTo.routeToLabel}` : `Enquiry Prepared for ${submittedTo.routeToLabel}`}
                        </h4>
                        {sendError && <p className="mt-1 text-sm font-medium text-rose-800">{sendError}</p>}
                        {delivery === 'sent' ? (
                          <p className="mt-1 text-sm text-stone-700">
                            We’ll reply to <strong>{senderEmail}</strong>. {submittedTo.responseNote}
                          </p>
                        ) : (
                        <p className="mt-1 text-sm text-stone-700">
                          Your enquiry details are formatted and ready to send directly to{' '}
                          <strong>{submittedTo.email}</strong>
                          {submittedTo.secondaryEmail
                            ? ` (cc ${submittedTo.secondaryEmail})`
                            : ''}
                          . Open your email client below or copy the message details to paste into
                          any webmail service.
                        </p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-3">
                          {delivery === 'prepared' && (
                          <>
                          <a
                            href={`mailto:${submittedTo.email}?${
                              submittedTo.secondaryEmail
                                ? `cc=${encodeURIComponent(submittedTo.secondaryEmail)}&`
                                : ''
                            }subject=${encodeURIComponent(
                              `[${submittedTo.title}] Enquiry from ${name}`
                            )}&body=${encodeURIComponent(
                              `From: ${name} (${senderEmail})\nChurch/Suburb: ${churchOrSuburb}\n\n${message}`
                            )}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-4 py-2 text-xs font-semibold text-white hover:bg-navy-800"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            <span>Open in Email Client</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => void handleCopyEnquiry(submittedTo)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-navy-900 hover:bg-stone-50"
                          >
                            {copied ? (
                              <Check className="h-3.5 w-3.5 text-teal-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-teal-600" />
                            )}
                            <span>{copied ? 'Copied' : 'Copy Message Details'}</span>
                          </button>
                          </>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSendError(null);
                              setSubmittedTo(null);
                              setCopied(false);
                              setMessage('');
                            }}
                            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-navy-900 hover:bg-stone-50"
                          >
                            Send Another Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-xs font-semibold text-navy-900"
                        >
                          Your Name *
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full name"
                          className="mt-1.5 w-full rounded-md border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-base text-navy-900 sm:text-sm focus:border-teal-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-xs font-semibold text-navy-900"
                        >
                          Email Address *
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          placeholder="you@example.com.au"
                          className="mt-1.5 w-full rounded-md border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-base text-navy-900 sm:text-sm focus:border-teal-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-church"
                        className="block text-xs font-semibold text-navy-900"
                      >
                        Local Congregation / Suburb (Optional)
                      </label>
                      <input
                        id="contact-church"
                        type="text"
                        value={churchOrSuburb}
                        onChange={(e) => setChurchOrSuburb(e.target.value)}
                        placeholder="e.g., Scoresby, VIC or visiting enquiry"
                        className="mt-1.5 w-full rounded-md border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-base text-navy-900 sm:text-sm focus:border-teal-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-xs font-semibold text-navy-900"
                      >
                        Message *
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Write your enquiry for ${activeTopic.routeToLabel}...`}
                        className="mt-1.5 w-full rounded-md border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-base text-navy-900 sm:text-sm focus:border-teal-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                      <span>Send Enquiry to {activeTopic.routeToLabel}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
