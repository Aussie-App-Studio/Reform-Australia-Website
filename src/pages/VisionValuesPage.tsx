import {
  BookOpen,
  Church,
  Compass,
  Globe2,
  GraduationCap,
  HandHeart,
  Handshake,
  HeartPulse,
  type LucideIcon,
  Map,
  Route,
  Scroll,
  Sprout,
  Users,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import identity from '../data/identity.json';

const ICONS: Record<string, LucideIcon> = {
  // core values
  'contemporary-reformed': Scroll,
  'word-based': BookOpen,
  'gospel-focused': Globe2,
  'local-church-empowering': Church,
  'prayerful-urgency': HandHeart,
  // four-fold task
  pray: HandHeart,
  grow: Sprout,
  train: GraduationCap,
  align: Compass,
  // strategies
  mentoring: Users,
  training: GraduationCap,
  'ministry-pathways': Route,
  'church-health': HeartPulse,
  'church-planting': Sprout,
  mission: Globe2,
  'church-strategy': Map,
  prayer: HandHeart,
  partnerships: Handshake,
};

function IconBadge({ id, size = 'md' }: { id: string; size?: 'md' | 'lg' }) {
  const Icon = ICONS[id] ?? BookOpen;
  const box = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  const icon = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  return (
    <span className={`flex ${box} shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700`}>
      <Icon className={icon} aria-hidden="true" />
    </span>
  );
}

function Section({ id, title, intro, tone = 'white', children }: { id: string; title: string; intro?: string; tone?: 'white' | 'paper'; children: React.ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-28 border-t border-stone-200 ${tone === 'paper' ? 'bg-stone-50' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <h2 className="font-serif text-3xl font-semibold text-navy-900">{title}</h2>
          {intro && <p className="mt-3 text-lg leading-relaxed text-stone-700">{intro}</p>}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export function VisionValuesPage() {
  const { missionAndVision, coreValues, fourFoldTask, strategies } = identity;
  return (
    <>
      <PageHeader
        title="Vision and values"
        description={missionAndVision.intro}
        breadcrumbs={[{ label: 'Who we are' }, { label: 'Vision and values' }]}
      />

      {/* Mission and vision */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-teal-100">{missionAndVision.missionLabel}</p>
            <p className="mt-3 font-serif text-3xl leading-snug sm:text-4xl">{missionAndVision.mission}</p>
          </div>
          <div className="lg:border-l lg:border-white/15 lg:pl-16">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-teal-100">{missionAndVision.visionLabel}</p>
            <p className="mt-3 font-serif text-2xl leading-snug sm:text-3xl">{missionAndVision.vision}</p>
          </div>
        </div>
      </section>

      <Section id="core-values" title="Our core values" intro={coreValues.intro}>
        <ul className="grid gap-px overflow-hidden rounded-md border border-stone-200 bg-stone-200 md:grid-cols-2 lg:grid-cols-3">
          {coreValues.items.map((v) => (
            <li key={v.id} className="flex flex-col bg-white p-6">
              <IconBadge id={v.id} size="lg" />
              <h3 className="mt-4 font-serif text-xl font-semibold text-navy-900">{v.title}</h3>
              <p className="mt-2 leading-relaxed text-stone-700">{v.summary}</p>
              <p className="mt-auto pt-4 text-sm text-stone-500">{v.scriptures}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="four-fold-task" title="Our four-fold task" intro={fourFoldTask.intro} tone="paper">
        <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {fourFoldTask.items.map((t) => (
            <li key={t.id}>
              <IconBadge id={t.id} size="lg" />
              <h3 className="mt-4 font-serif text-2xl font-semibold text-navy-900">{t.title}</h3>
              <p className="mt-2 leading-relaxed text-stone-700">{t.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="strategies" title="Our strategies" intro={strategies.intro}>
        <ul className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {strategies.items.map((s) => (
            <li key={s.id} className="flex gap-4">
              <IconBadge id={s.id} />
              <div>
                <h3 className="font-semibold text-navy-900">{s.title}</h3>
                <p className="mt-1 text-[0.95rem] leading-relaxed text-stone-700">{s.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
