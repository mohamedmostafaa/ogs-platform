/**
 * `/ui-smoke/careers` — visual regression smoke route for the 16
 * careers-landing primitives in `@ogs/ui`.
 *
 * Server component, no auth, no real data. Renders every primitive at
 * least once inside a `data-surface="careers"` wrapper so the careers
 * token override applies. NOT a production surface — it exists to let
 * a UI engineer eyeball the design system end-to-end.
 *
 * @see docs/design/careers-landing.md §3 (sections) + §4 (primitives).
 */
import type { Metadata } from "next";
import {
  Award,
  Briefcase,
  Globe2,
  HardHat,
  Leaf,
  Network,
  Server,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import {
  BrowseTile,
  CountryFlagStrip,
  CountryTile,
  CtaBanner,
  FaqAccordion,
  FeatureCard,
  JobCard,
  JobSearchBar,
  LogoMarquee,
  MarketingFooter,
  MarketingHeader,
  MarketingHero,
  QuoteBlock,
  SectionShell,
  TimelineSteps,
} from "@ogs/ui/primitives";

export const metadata: Metadata = {
  title: "UI smoke — careers",
  robots: { index: false, follow: false },
};

// =====================================================================
// Inline mock data (smoke route only — never used in production paths).
// =====================================================================

const NAV = [
  { label: "Browse Jobs", href: "/jobs" },
  { label: "For Employers", href: "/employers" },
  { label: "For Workers", href: "/workers" },
  { label: "How It Works", href: "/how" },
  { label: "Pricing", href: "/pricing" },
];

const FOOTER_COLUMNS = [
  {
    id: "workers",
    label: "Workers",
    links: [
      { label: "Browse jobs", href: "/jobs" },
      { label: "Build profile", href: "/workers/apply" },
      { label: "SkillPass", href: "/skillpass" },
    ],
  },
  {
    id: "employers",
    label: "Employers",
    links: [
      { label: "Post a role", href: "/employers/post" },
      { label: "Request shortlist", href: "/employers/shortlist" },
    ],
  },
  {
    id: "company",
    label: "Company",
    links: [
      { label: "About OGS", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    id: "ecosystem",
    label: "Ecosystem",
    links: [
      { label: "OGS Training & Consulting", href: "https://ogs-tc.com" },
      { label: "OGS Academy", href: "https://academy.ogs.com" },
    ],
  },
  {
    id: "regional",
    label: "Regional",
    links: [
      { label: "Egypt", href: "/jobs?country=eg" },
      { label: "Iraq", href: "/jobs?country=iq" },
      { label: "UAE", href: "/jobs?country=ae" },
      { label: "KSA", href: "/jobs?country=sa" },
      { label: "Oman", href: "/jobs?country=om" },
      { label: "Libya", href: "/jobs?country=ly" },
    ],
  },
];

// Simple SVG placeholders for the logo marquee — data URIs so the
// smoke route has no external asset dependencies.
function placeholderLogo(label: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 40'><rect width='160' height='40' rx='6' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, sans-serif' font-size='14' fill='%23475569'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

const LOGOS = ["Aramco", "Halliburton", "ADNOC", "Petrofac", "Schlumberger", "Baker Hughes"].map(
  (name) => ({ src: placeholderLogo(name), alt: name }),
);

const FAQ_ITEMS = [
  {
    id: "q1",
    q: 'What does "OGS-verified" actually mean on a worker\'s profile?',
    a: "Three things bound to one record: identity-verified worker, assessor-signed competency evidence, and a documented chain of training plus on-job validation.",
  },
  {
    id: "q2",
    q: "How does pricing work for workers and employers?",
    a: "Both sides pay. Workers can use the portal free, or upgrade to a premium tier; employers pay a published tier covering job postings and verified shortlists.",
  },
  {
    id: "q3",
    q: "What countries and roles are covered today?",
    a: "Six countries — Egypt, Iraq, UAE, KSA, Oman and Libya. Six core role families — Metering & Integrity, QA/QC, Inspection, HSE, Sustainability and Operations.",
  },
  {
    id: "q4",
    q: "How long does it take to get verified as a worker?",
    a: "Most profiles complete first-round verification within 5–10 business days from a complete submission.",
  },
  {
    id: "q5",
    q: "Can an employer export a candidate's full competency dossier?",
    a: "Yes. Every shortlisted candidate ships with an exportable, audit-ready dossier — assessor identity, evidence trail, certificate validity and expiry.",
  },
  {
    id: "q6",
    q: "How is worker data protected? Who sees my profile?",
    a: "Worker records are private by default. Employers see only the fields a worker has chosen to surface for a given role.",
  },
];

const NOW = Date.now();
const DAY = 86_400_000;

export default function UiSmokeCareersPage() {
  return (
    <div data-surface="careers" className="bg-background text-foreground min-h-screen">
      <MarketingHeader
        nav={NAV}
        rightCluster={
          <>
            <a
              href="/sign-in"
              className="text-primary-foreground/85 hover:text-accent text-sm font-medium"
            >
              Sign In
            </a>
            <a
              href="/employers/post"
              className="bg-accent text-accent-foreground hover:bg-accent/90 inline-flex h-9 items-center rounded-md px-4 text-sm font-semibold"
            >
              Post a role
            </a>
          </>
        }
      />

      <main>
        <MarketingHero
          slides={[
            {
              src: placeholderLogo("Hero"),
              alt: "Field metering crew on-site",
            },
          ]}
          eyebrow="OGS CAREERS — MENA ENERGY JOB PORTAL"
          headline="Verified energy talent. Real jobs. Region-ready."
          sub="The only energy-sector job portal that verifies, places, trains and governs in one chain."
          searchBar={<JobSearchBar />}
          primaryCta={
            <a
              href="/jobs"
              className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 inline-flex h-10 items-center rounded-md border px-4 text-sm font-semibold"
            >
              Browse all jobs
            </a>
          }
          secondaryCta={
            <a href="/employers/post" className="text-accent text-sm font-semibold">
              Post a role →
            </a>
          }
          trustStrip={
            <CountryFlagStrip
              countries={["EG", "IQ", "AE", "SA", "OM", "LY"]}
              label="Regional Presence"
            />
          }
        />

        <SectionShell eyebrow="BROWSE BY ROLE" title="Energy-sector role families.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BrowseTile
              icon={Wrench}
              label="Metering & Integrity"
              count={12}
              href="/jobs?role=metering"
            />
            <BrowseTile icon={ShieldCheck} label="QA/QC" count={8} href="/jobs?role=qa-qc" />
            <BrowseTile
              icon={Briefcase}
              label="Inspection"
              count={5}
              href="/jobs?role=inspection"
            />
            <BrowseTile icon={HardHat} label="HSE" count={11} href="/jobs?role=hse" />
            <BrowseTile
              icon={Leaf}
              label="Sustainability"
              count={3}
              href="/jobs?role=sustainability"
            />
            <BrowseTile icon={Network} label="Operations" count={0} href="/jobs?role=operations" />
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="OPEN ROLES RIGHT NOW"
          title="Open roles right now."
          lede="Verified employers, real positions, applications open today."
          surface="muted"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <JobCard
              id="job-1"
              title="Senior Metering Engineer"
              company="Aramco"
              companyLogoSrc={placeholderLogo("A")}
              country="SA"
              roleFamily="metering"
              postedAt={new Date(NOW - 3 * DAY)}
              href="/jobs/senior-metering-engineer"
              verifiedEmployer
            />
            <JobCard
              id="job-2"
              title="QA/QC Inspector — Onshore"
              company="Petrofac"
              companyLogoSrc={placeholderLogo("P")}
              country="AE"
              roleFamily="qa-qc"
              postedAt={new Date(NOW - 10 * DAY)}
              href="/jobs/qa-qc-inspector"
            />
            <JobCard
              id="job-3"
              title="HSE Lead — Iraq Operations"
              company="Independent Operator"
              country="IQ"
              roleFamily="hse"
              postedAt={new Date(NOW - 1 * DAY)}
              href="/jobs/hse-lead-iraq"
              verifiedEmployer={false}
            />
          </div>
        </SectionShell>

        <SectionShell eyebrow="BROWSE BY COUNTRY" title="Six markets. One verification chain.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CountryTile country="EG" name="Egypt" count={14} href="/jobs?country=eg" />
            <CountryTile country="IQ" name="Iraq" count={6} href="/jobs?country=iq" />
            <CountryTile country="AE" name="UAE" count={9} href="/jobs?country=ae" />
            <CountryTile country="SA" name="KSA" count={11} href="/jobs?country=sa" />
            <CountryTile country="OM" name="Oman" count={4} href="/jobs?country=om" />
            <CountryTile country="LY" name="Libya" count={2} href="/jobs?country=ly" />
          </div>
        </SectionShell>

        <SectionShell eyebrow="WHY OGSCAREERS.COM" title="The four-pillar chain.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={ShieldCheck}
              title="Verification-first profiles"
              body="Every worker carries an assessor-signed competency record — SkillPass."
            />
            <FeatureCard
              icon={Briefcase}
              title="Direct placement"
              body="Hiring teams receive curated, audit-ready shortlists — not a search dump."
            />
            <FeatureCard
              icon={Award}
              title="Training pipeline"
              body="When a gap is detected, OGS routes the worker to the right pathway."
            />
            <FeatureCard
              icon={Server}
              title="Recruitment intelligence"
              body="Real-time signals on workforce readiness and certification expiries."
              accent="navy"
            />
            <FeatureCard
              icon={Globe2}
              title="Regional delivery"
              body="Active candidate pools across the six MENA markets."
              accent="navy"
            />
            <FeatureCard
              icon={Sparkles}
              title="Direct employer contracting"
              body="No agency commission. No labor-supplier markup."
            />
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="HOW IT WORKS"
          title="One portal. Two sides of the hire."
          surface="muted"
        >
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <TimelineSteps
              aria-label="For workers"
              steps={[
                { title: "Apply", body: "Create your worker profile." },
                { title: "Get verified", body: "OGS assessors review your record." },
                { title: "Browse jobs", body: "Search live roles by title and country." },
                { title: "Apply to roles", body: "One-click apply with your SkillPass." },
              ]}
            />
            <TimelineSteps
              aria-label="For employers"
              accent="navy"
              steps={[
                { title: "Post a role", body: "Publish a position." },
                { title: "Receive a shortlist", body: "Verified candidates surface." },
                { title: "Interview directly", body: "Schedule inside the portal." },
                { title: "Hire (no commission)", body: "Contract the worker directly." },
              ]}
            />
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="TRUSTED BY INDUSTRY LEADERS"
          title="Operators and EPCs already inside the OGS ecosystem."
          align="center"
          surface="navy"
        >
          <div className="flex flex-col items-center gap-10">
            <QuoteBlock
              quote="OGS transformed our competency program — 32% improvement in assessment pass rates within the first 6 months. The management dashboard gave us visibility we never had before."
              name="Ahmed R."
              role="Training Manager"
              org="National Oil Operator"
              country="Egypt"
            />
            <LogoMarquee logos={LOGOS} ariaLabel="Client logos" />
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="QUESTIONS, ANSWERED"
          title="What hiring teams and workers ask us first."
        >
          <FaqAccordion items={FAQ_ITEMS} ariaLabel="Careers landing FAQ" />
        </SectionShell>

        <CtaBanner
          surface="navy"
          title="Hire verified energy talent — or get on a verified shortlist."
          sub="Real jobs are open today. Post a role or browse all live positions across the six MENA markets."
          primaryCta={
            <a
              href="/employers/post"
              className="bg-accent text-accent-foreground hover:bg-accent/90 inline-flex h-10 items-center rounded-md px-5 text-sm font-semibold"
            >
              Post a role
            </a>
          }
          secondaryCta={
            <a
              href="/jobs"
              className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 inline-flex h-10 items-center rounded-md border px-5 text-sm font-semibold"
            >
              Browse jobs
            </a>
          }
          footnote="Egypt · Iraq · UAE · KSA · Oman · Libya"
        />
      </main>

      <MarketingFooter
        columns={FOOTER_COLUMNS}
        legal={{
          copyright: `© ${new Date().getFullYear()} OGS Training & Consulting. All rights reserved.`,
          links: [
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Cookies", href: "/cookies" },
            { label: "Security", href: "/security" },
          ],
        }}
      >
        <CountryFlagStrip
          countries={["EG", "IQ", "AE", "SA", "OM", "LY"]}
          label="Regional Presence"
        />
      </MarketingFooter>
    </div>
  );
}
