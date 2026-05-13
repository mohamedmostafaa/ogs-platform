# `ogscareers.com` — Landing Page Design Spec

> Owner: UI Engineer. Status: **Draft for Founder review — no code yet.**
> Replaces the legacy `ogscareers.com` mock-interview practice site. Shipping as the real OGS workforce job portal — the hiring-side sibling of `ogs-tc.com`. Same brand family, enterprise product surface.

---

## 1. Positioning statement

`ogscareers.com` is the **energy-sector job portal** of the OGS ecosystem: a professional, verification-gated hiring surface for **operators, EPC contractors and service companies** sourcing metering, integrity, QA/QC, inspection, HSE, sustainability and operations talent across MENA. Reference class: **Workday Recruiting, Greenhouse, LinkedIn Jobs** — specialized for MENA energy and gated by OGS verification.

The wedge — the only thing on the page that has to be unmistakable — is the **four-pillar chain**: OGS **verifies** workers (assessor-signed competency records via SkillPass), **places** them on curated audit-ready shortlists, **trains** them when a gap is detected (no dead-end profiles), and surfaces ongoing **recruitment intelligence** (workforce readiness, certification expiries, crew coverage) for hiring teams. Positioning line, used verbatim in the hero sub:

> "The only energy-sector job portal that verifies, places, trains and governs in one chain."

Visual posture: **dense, information-rich, conservative.** Inherits `ogs-tc.com`'s navy + teal palette, Inter type, photographic-overlay style — but dialed up for an enterprise product surface. The hero is a working **search bar**, not a marketing CTA cluster. The page below is a real job portal: open roles, browse-by-role, browse-by-country, workforce signals — not a brochure.

---

## 2. Visual system mapping

`@ogs/ui` ships shadcn's neutral default as the platform internal-product palette; that stays. The careers public surface scopes a **product-marketing override** via a wrapping `data-surface="careers"` class layered over the resolved tokens. The mechanism in `@ogs/ui/theme/brand.ts` extends with a single new file: `packages/ui/styles/careers.css`.

### 2.1 Token role table (`data-surface="careers"`)

| Token role             | Light value (HSL channels) | Notes                                                                 |
| ---------------------- | -------------------------- | --------------------------------------------------------------------- |
| `--primary`            | `215 60% 14%`              | Deep navy — header, footer, headings.                                 |
| `--primary-foreground` | `0 0% 100%`                | White on navy.                                                        |
| `--accent`             | `186 78% 42%`              | Teal/cyan — primary CTA, link hover, focus ring, active filter chips. |
| `--accent-foreground`  | `0 0% 100%`                | White on teal.                                                        |
| `--ring`               | `186 78% 42%`              | Focus ring follows accent.                                            |
| `--secondary`          | `210 25% 96%`              | Off-white surface for alternating sections / job-card hover.          |
| `--muted`              | `215 20% 92%`              | Light-gray surface for tiles, FAQ panels.                             |
| `--muted-foreground`   | `215 16% 35%`              | Charcoal body text on muted.                                          |
| `--foreground`         | `215 30% 18%`              | Charcoal headings/body on white.                                      |
| `--background`         | `0 0% 100%`                | White page base.                                                      |
| `--border`             | `215 16% 88%`              | 1px keylines on cards, tiles, job cards.                              |

**Dark mode is out of scope** for v1 (parent site has none). The careers route forces light: `<html data-force-color-scheme="light">`. Token resolver still emits a `.dark` block for future.

### 2.2 Typography mapping

Inter via `next/font`. Scale tightened for an information-dense product surface:

- H1 (hero): `clamp(2.25rem, 4vw, 3rem)` / weight 700 / tracking `-0.02em` — smaller than a brochure hero; the search bar is the affordance, not the headline.
- H2 (section): `clamp(1.75rem, 3vw, 2.25rem)` / weight 600
- H3 (card / tile / job-card): `1.125rem` / weight 600
- Body: `0.9375rem` / weight 400 / leading `1.55` — tighter than marketing copy.
- Meta (chips, counts, posted-date): `0.8125rem` / weight 500 / `var(--muted-foreground)`
- Eyebrow / kicker: `0.75rem` / weight 600 / `letter-spacing: 0.1em` / uppercase / `color: var(--accent)`

### 2.3 Spacing & grid

- Content max-width: `min(1280px, 100% - 3rem)`.
- Vertical section rhythm: `4rem` (mobile) → `5.5rem` (desktop). Tighter than a brochure — this is a product page.
- Card / tile grid gaps: `1rem` mobile, `1.5rem` desktop.
- Job-card grid gaps: `1rem` (denser than feature cards on purpose).
- Spacing scale: 8 / 12 / 16 / 24 / 32 / 48.

### 2.4 New tokens to add

None. All resolved through existing token names scoped under `[data-surface="careers"]`. Single new file: `packages/ui/styles/careers.css`.

---

## 3. Section-by-section breakdown

Copy is marked `[from ogs-tc.com]` (lifted from parent inventory) or `[new]` (production-ready, written for this surface). Both ship as-is.

### 3.1 Global header (sticky, on every page)

- **Logo:** OGS wordmark + `Careers` subscript (white on navy bar). Links to `ogscareers.com/`.
- **Primary nav (LTR):** `Browse Jobs` · `For Employers` · `For Workers` · `How It Works` · `Pricing` · `Insights` · `Ecosystem ▾` (dropdown: `ogs-tc.com`, OGS Academy, OGS Careers).
- **Right cluster:** `Sign In` ghost button → filled accent CTA `Post a role` `[new]`.
- **Behavior:** Sticky on scroll, gains a thin teal keyline at `scrollY > 8`. Language switcher is **omitted in v1** — English only; Arabic deferred.

### 3.2 Hero — search-first

Replaces the previous dual-CTA brochure hero. The hero IS the product: a search bar with two secondary CTAs underneath. The proof of product is functional, not aspirational.

- **Layout:** Full-bleed, edge-to-edge. Aspect ratio `16/7` desktop / `4/5` mobile. Single photographic background (no carousel in v1 — denser, faster LCP, less marketing noise). Image: **field metering / inspection team on-site, PPE, MENA setting.** Overlay: navy-to-transparent linear gradient (`hsl(215 60% 14% / 0.82)` left → `hsl(215 60% 14% / 0.45)` right). Content is left-aligned over the dark side.
- **Eyebrow:** `OGS CAREERS — MENA ENERGY JOB PORTAL` `[new]`
- **H1:** `Verified energy talent. Real jobs. Region-ready.` `[new]`
- **Sub (positioning line, verbatim):** `The only energy-sector job portal that verifies, places, trains and governs in one chain.` `[new]`
- **Search bar (PRIMARY affordance):** Single horizontal control on a white surface, sitting on the gradient:
  - Field 1: `Job title or keyword` (text input, placeholder `e.g. Metering Engineer, QA/QC Inspector`)
  - Field 2: `Country` (select dropdown — Egypt, Iraq, UAE, KSA, Oman, Libya, `All countries`)
  - Submit: accent-filled `Search jobs` button
  - On submit → `/jobs?q=<query>&country=<iso>`
- **Secondary CTAs (underneath search bar, inline):**
  - `Browse all jobs` `[new]` → `/jobs` (ghost on dark, white border)
  - `Post a role` `[new]` → `/employers/post` (text link with arrow, accent on dark)
- **Trust strip (bottom edge of hero, inside hero band):**
  - Country flags row: `🇪🇬 Egypt · 🇮🇶 Iraq · 🇦🇪 UAE · 🇸🇦 KSA · 🇴🇲 Oman · 🇱🇾 Libya` `[from ogs-tc.com]`
  - Same-six-logos row (grayscale, the exact six logos used in `ogs-tc.com`'s trust carousel — see open question #?? — n/a, that's resolved: reuse the six verbatim).
- **Interaction:**
  - Search input has form submit on Enter; country dropdown is shadcn `Select`.
  - Reduced-motion: no gradient animation (none is shipped anyway).
  - `aria-label="Find verified energy jobs across MENA"` on the form.

### 3.3 Browse by role

Job-portal information surface, immediately under the hero. Establishes the role taxonomy and proves coverage with live counts.

- **Section eyebrow:** `BROWSE BY ROLE` `[new]`
- **Section H2:** `Energy-sector role families.` `[new]`
- **Layout:** 6 tiles. 3-col desktop, 2-col tablet, 1-col mobile. Each tile = 1px border, `1.25rem` padding, accent icon left, label + live count, arrow on the trailing edge.
- **The six tiles:**
  1. **Metering & Integrity** — `<count>` open roles → `/jobs?role=metering-integrity`
  2. **QA/QC** — `<count>` open roles → `/jobs?role=qa-qc`
  3. **Inspection** — `<count>` open roles → `/jobs?role=inspection`
  4. **HSE** — `<count>` open roles → `/jobs?role=hse`
  5. **Sustainability** — `<count>` open roles → `/jobs?role=sustainability`
  6. **Operations** — `<count>` open roles → `/jobs?role=operations`

- **Zero-state rule:** if a tile has 0 live roles, show `0 open roles` literally. **No "Launching soon" copy anywhere on this page** — the Founder has employers in pipeline.

### 3.4 Open roles right now

The proof-of-product section. Real positions, applications open today.

- **Section eyebrow:** `OPEN ROLES RIGHT NOW` `[new]`
- **Section H2:** `Open roles right now.` `[new]`
- **Section subhead:** `Verified employers, real positions, applications open today.` `[new]`
- **Layout:** 6–9 job cards in a 3-col desktop / 2-col tablet / 1-col mobile grid. Newest-first; secondary sort by country.
- **JobCard anatomy:**
  - Header row: company logo (40×40, 1px border, neutral fallback for unbranded) + posted-date (right-aligned, `Posted 2d ago` format).
  - Role title (H3, two-line clamp).
  - Meta row: country flag + country name · role-family chip (filled muted, accent text).
  - Footer row: action CTA `Apply` (primary, accent-filled) if the apply route is in-portal; `View details` (ghost) otherwise — pending open question #3.
- **Below grid:** `See all roles →` text link → `/jobs`.
- **Empty-state (only if the entire feed is empty at first paint):** `New roles are being verified. Check back shortly or set a job alert.` `[new]` + `Set a job alert` CTA → `/alerts/new`. Still no "Launching soon" copy.

### 3.5 Browse by country

Regional coverage as a product surface, not a marketing list.

- **Section eyebrow:** `BROWSE BY COUNTRY` `[new]`
- **Section H2:** `Six markets. One verification chain.` `[new]`
- **Layout:** 6 country cards. 3-col desktop, 2-col tablet, 1-col mobile. Each card = 1px border, `1.25rem` padding, flag (32×32) + country name + live open-roles count + arrow.
- **The six countries:**
  1. **Egypt** — `<count>` open roles → `/jobs?country=eg`
  2. **Iraq** — `<count>` open roles → `/jobs?country=iq`
  3. **UAE** — `<count>` open roles → `/jobs?country=ae`
  4. **KSA** — `<count>` open roles → `/jobs?country=sa`
  5. **Oman** — `<count>` open roles → `/jobs?country=om`
  6. **Libya** — `<count>` open roles → `/jobs?country=ly`

### 3.6 Value-prop grid — the four-pillar wedge + 2 supporting

Six cards, the four-pillar wedge first, two supporting cards last. No TÜV card. No standalone "Smart Digital Layer" card — folded into pillar #4 (Recruitment intelligence).

- **Section eyebrow:** `WHY OGSCAREERS.COM` `[new]`
- **Section H2:** `The only energy-sector job portal that verifies, places, trains and governs in one chain.` `[new]`
- **Layout:** 3-col desktop, 2-col tablet, 1-col mobile. Equal-height. 1px border, `1.5rem` padding, accent icon top.
- **The six cards (locked order):**
  1. **Verification-first profiles** `[new]`
     Every worker carries an assessor-signed competency record — SkillPass. Certificates, assessments and on-job evidence are bound to one tamper-evident file. The badge on a profile means someone independent signed it.
  2. **Direct placement to vetted shortlists** `[new]`
     Hiring teams receive curated, audit-ready shortlists — not a search dump. Every candidate ships with their full competency dossier attached. You hire directly; OGS takes no labor-supply commission.
  3. **Training pipeline — no dead-end profiles** `[new]`
     When a competency gap is detected, OGS routes the worker to the right course or pathway before surfacing them as ready. Profiles stay alive — workers either qualify or they're moved into the training queue that closes the gap.
  4. **Recruitment intelligence dashboards** `[new]`
     Real-time signals on workforce readiness, certification expiries and crew assignment coverage. The same operational layer national operators use internally — now in front of every employer hiring on the portal.
  5. **Regional delivery network** `[from ogs-tc.com]`
     Active candidate pools across Egypt, Iraq, UAE, KSA, Oman and Libya. Mobilize where the field is.
  6. **Direct employer contracting** `[new]`
     No agency commission. No labor-supplier markup. Employers contract workers directly; OGS is the verification and governance layer between them, not a middleman taking a cut of the hire.

### 3.7 How it works — dual-rail, job-portal-concrete

Same dual-rail structure, but every step is a real product action — not a training-funnel paraphrase.

- **Section eyebrow:** `HOW IT WORKS` `[new]`
- **Section H2:** `One portal. Two sides of the hire.` `[new]`
- **Layout:** Two side-by-side rails on desktop, stacked on mobile. Each rail is a 4-step numbered timeline. Subtle vertical teal rule between rails on desktop.

#### Rail A — `For Workers`

1. **Apply** `[new]` — Create your worker profile. Add experience, certificates, languages, mobilization preferences.
2. **Get verified** `[new]` — OGS assessors review your record. Where a gap exists, you're routed to the right training pathway before being shortlisted.
3. **Browse jobs** `[new]` — Search live roles by title, country and role family. Save jobs and set alerts.
4. **Apply to roles** `[new]` — One-click apply with your verified SkillPass attached. Track applications inside the portal.

- **Rail CTA:** `Build my profile` `[new]` → `/workers/apply`

#### Rail B — `For Employers`

1. **Post a role** `[new]` — Publish a position. Specify scope, country, mobilization window and compliance bar.
2. **Receive a verified shortlist** `[new]` — Candidates surface with their full audit-ready competency dossier attached. Filter and rank in-portal.
3. **Interview directly** `[new]` — Schedule, interview and assess inside the OGS portal — or in your own ATS via export.
4. **Hire (no commission)** `[new]` — Contract the worker directly. OGS takes no labor-supply margin on the hire; the platform fee is the published employer tier.

- **Rail CTA:** `Post a role` `[new]` → `/employers/post`

### 3.8 Client testimonial — single-quote module

- **Section eyebrow:** `TRUSTED BY INDUSTRY LEADERS` `[from ogs-tc.com]`
- **Layout:** Centered, navy background, max-width `880px` quote. Same-six-logos row in a grayscale carousel below the quote.
- **Logo row label:** `Operators and EPCs already inside the OGS ecosystem` `[new]`. Logos = the exact six used on `ogs-tc.com`'s trust carousel — reused verbatim, not curated.
- **Quote (verbatim from `ogs-tc.com`):**
  > "OGS transformed our competency program — 32% improvement in assessment pass rates within the first 6 months. The management dashboard gave us visibility we never had before."
  > `[from ogs-tc.com]`
- **Attribution:** `Ahmed R., Training Manager, National Oil Operator, Egypt` `[from ogs-tc.com]`
- **Interaction:** Logo marquee auto-scrolls horizontally (30s loop), pauses on hover/focus. Reduced-motion: static row, 3 per viewport with overflow-x scroll. `aria-label="Client logos"`.

### 3.9 FAQ — accordion (6 questions, all rewritten)

Production-ready, job-portal-real. Zero TÜV mentions.

- **Section eyebrow:** `QUESTIONS, ANSWERED` `[new]`
- **Section H2:** `What hiring teams and workers ask us first.` `[new]`
- **Layout:** Single column, max-width `880px`. shadcn `Accordion` from `@ogs/ui`. Default-open: question #1.
- **Q&A (all `[new]`):**
  1. **Q: What does "OGS-verified" actually mean on a worker's profile?**
     A: Three things bound to one record: identity-verified worker, assessor-signed competency evidence, and a documented chain of training plus on-job validation. The verification methodology is the same Train + Prove + Report standard OGS delivers to national operators through `ogs-tc.com`. A verified profile means a named OGS assessor signed off — not an algorithm.
  2. **Q: How does pricing work for workers and employers?**
     A: Both sides pay. Workers can use the portal free, or upgrade to a premium tier for a boosted profile, priority assessment slots and increased visibility on hiring-team shortlists. Employers pay a published tier covering job postings, verified shortlists and the workforce-readiness dashboard. See the [Pricing page](/pricing) for current tiers.
  3. **Q: What countries and roles are covered today?**
     A: Six countries — Egypt, Iraq, UAE, KSA, Oman and Libya. Six core role families — Metering & Integrity, QA/QC, Inspection, HSE, Sustainability and Operations. Live counts are surfaced on every Browse tile on this page; if a tile reads 0, that family currently has no open positions on the portal.
  4. **Q: How long does it take to get verified as a worker?**
     A: Most profiles complete first-round verification within 5–10 business days from a complete submission. If a competency gap is detected, you're routed to the matching training pathway and re-enter verification on completion — verification is never a dead end.
  5. **Q: Can an employer export a candidate's full competency dossier?**
     A: Yes. Every shortlisted candidate ships with an exportable, audit-ready dossier — assessor identity, evidence trail, certificate validity and expiry. Hand it to your QA auditor or upload it into your own ATS without redaction.
  6. **Q: How is worker data protected? Who sees my profile?**
     A: Worker records are private by default. Employers see only the fields a worker has chosen to surface for a given role. Contact details are gated until both sides accept an introduction. Workers can revoke visibility for any employer at any time.

### 3.10 Final CTA banner — narrow, action-only

Two CTAs only. No "Build my profile" marketing language.

- **Layout:** Full-bleed navy section, two-column desktop (text left, button cluster right), stacked mobile.
- **H2:** `Hire verified energy talent — or get on a verified shortlist.` `[new]`
- **Sub:** `Real jobs are open today. Post a role or browse all live positions across the six MENA markets.` `[new]`
- **Buttons:**
  - Primary (accent fill): `Post a role` `[new]` → `/employers/post`
  - Secondary (white outline on navy): `Browse jobs` `[new]` → `/jobs`
- **Beneath buttons (small caps):** `Egypt · Iraq · UAE · KSA · Oman · Libya` `[from ogs-tc.com]`

### 3.11 Footer — job-portal columns

Five columns on desktop, accordion on mobile. Zero TÜV references.

| Column      | Links                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `Workers`   | `Browse jobs` · `Build profile` · `How verification works` · `Renewals & re-assessment` · `SkillPass` · `Pricing for workers` |
| `Employers` | `Post a role` · `Request shortlist` · `Workforce dashboards` · `Verification packs` · `Pricing for employers`                 |
| `Company`   | `About OGS` · `Insights` · `Contact` · `Pricing`                                                                              |
| `Ecosystem` | `OGS Training & Consulting (ogs-tc.com)` · `OGS Academy` · `OGS Careers (this site)`                                          |
| `Regional`  | `Egypt` · `Iraq` · `UAE` · `KSA` · `Oman` · `Libya`                                                                           |

- **Below the columns, full-width strip:** Country flag row `🇪🇬 🇮🇶 🇦🇪 🇸🇦 🇴🇲 🇱🇾` + label `Regional Presence`.
- **Legal row (smallest line):** `© <current year> OGS Training & Consulting. All rights reserved.` · `Privacy` · `Terms` · `Cookies` · `Security`. No language switcher in v1.
- **Interaction:** Mobile collapses each column to an Accordion item.

---

## 4. Primitive shopping list — 16 total

> All other needs (Accordion, Button, Card, Separator, Tooltip, Avatar, Select, Input) are already in `packages/ui/src/components/`.

1. **`SectionShell`** — semantic `<section>` with eyebrow + H2 + lede + content slot. Props: `{ eyebrow?, title, lede?, align?, surface?, children }`. Keeps section rhythm consistent across the portal.
2. **`MarketingHero`** — full-bleed photographic hero with gradient overlay + eyebrow + H1 + sub + content slot (now hosts the search bar) + trust-strip slot. Hero asset is single image in v1 (no carousel).
3. **`HeroCarousel`** — kept in the primitive set for future re-use on `/employers` and `/workers`, even though the v1 hero ships a single static image. Accessible auto-rotating image carousel.
4. **`FeatureCard`** — icon + title + body, equal-height. Single source of truth for value-prop cards.
5. **`TimelineSteps`** — vertical numbered timeline. Used twice in dual how-it-works rails.
6. **`QuoteBlock`** — large blockquote with attribution, optimized for the single hero testimonial.
7. **`LogoMarquee`** — horizontally auto-scrolling grayscale logo row with reduced-motion fallback.
8. **`FaqAccordion`** — thin wrapper over shadcn `Accordion` enforcing default-open-first, plus/minus iconography and SEO `<dl>` markup.
9. **`CtaBanner`** — full-bleed colored banner with H2 + sub + dual-CTA. Used on careers + future `/employers` / `/workers`.
10. **`MarketingHeader`** — sticky public-marketing header with logo, nav, sign-in, CTA, scroll-shadow.
11. **`MarketingFooter`** — five-column footer collapsing to accordion on mobile, with regional flag strip and legal row.
12. **`CountryFlagStrip`** — horizontal row of the six MENA flags + caption. Centralizes flag ordering across hero, final CTA and footer.
13. **`JobSearchBar`** `[new]` — hero search affordance. Props: `{ defaultQuery?, defaultCountry?, countries: CountryOption[], onSubmit?, action? }`. Renders: title/keyword input + country select + submit button as a single horizontal control with mobile-stacked variant.
14. **`JobCard`** `[new]` — single live-job tile. Props: `{ id, title, companyName, companyLogoUrl?, country, roleFamily, postedAt, applyHref, applyMode: "in-portal" | "external" }`. Encodes company logo + posted-date + title + country + role-family chip + action CTA.
15. **`BrowseTile`** `[new]` — generic browse-by-X tile. Props: `{ icon: LucideIcon, label, count: number, href, variant?: "default" | "country" }`. Renders icon + label + live count + trailing arrow.
16. **`CountryTile`** `[new]` — variant of `BrowseTile` swapping the icon for a country flag accent. Props: `{ countryCode, label, count, href }`. Implemented as a thin specialization over `BrowseTile`.

All 16 are lean (single concern, presentational, no business logic, no tRPC, no i18n leaks). All consume tokens; none hardcode hex.

---

## 5. Copy bank (English only — documentation for future i18n)

> **English only for v1.** Arabic + RTL deferred — see §6 and open question on i18n. This bank is documentation, not a primary `messages/en.json` deliverable. Translation-ready structure will be revisited when Arabic lands.

```
header.nav.browseJobs           = Browse Jobs
header.nav.employers            = For Employers
header.nav.workers              = For Workers
header.nav.howItWorks           = How It Works
header.nav.pricing              = Pricing
header.nav.insights             = Insights
header.nav.ecosystem            = Ecosystem
header.ctaSignIn                = Sign In
header.ctaPostRole              = Post a role

hero.eyebrow                    = OGS Careers — MENA Energy Job Portal
hero.headline                   = Verified energy talent. Real jobs. Region-ready.
hero.sub                        = The only energy-sector job portal that verifies, places, trains and governs in one chain.
hero.search.titlePlaceholder    = e.g. Metering Engineer, QA/QC Inspector
hero.search.titleLabel          = Job title or keyword
hero.search.countryLabel        = Country
hero.search.countryAll          = All countries
hero.search.submit              = Search jobs
hero.ctaBrowse                  = Browse all jobs
hero.ctaPostRole                = Post a role

browseByRole.eyebrow            = Browse by Role
browseByRole.title              = Energy-sector role families.
browseByRole.tile.metering      = Metering & Integrity
browseByRole.tile.qaqc          = QA/QC
browseByRole.tile.inspection    = Inspection
browseByRole.tile.hse           = HSE
browseByRole.tile.sustainability= Sustainability
browseByRole.tile.operations    = Operations
browseByRole.count              = {n} open roles
browseByRole.countZero          = 0 open roles

openRoles.eyebrow               = Open Roles Right Now
openRoles.title                 = Open roles right now.
openRoles.subhead               = Verified employers, real positions, applications open today.
openRoles.seeAll                = See all roles
openRoles.emptyTitle            = New roles are being verified.
openRoles.emptySub              = Check back shortly or set a job alert.
openRoles.emptyCta              = Set a job alert
jobCard.postedAt                = Posted {relative}
jobCard.apply                   = Apply
jobCard.viewDetails             = View details

browseByCountry.eyebrow         = Browse by Country
browseByCountry.title           = Six markets. One verification chain.
browseByCountry.tile.eg         = Egypt
browseByCountry.tile.iq         = Iraq
browseByCountry.tile.ae         = UAE
browseByCountry.tile.sa         = KSA
browseByCountry.tile.om         = Oman
browseByCountry.tile.ly         = Libya

values.eyebrow                  = Why ogscareers.com
values.title                    = The only energy-sector job portal that verifies, places, trains and governs in one chain.
values.card.verification.title  = Verification-first profiles
values.card.verification.body   = Every worker carries an assessor-signed competency record — SkillPass. Certificates, assessments and on-job evidence are bound to one tamper-evident file. The badge on a profile means someone independent signed it.
values.card.placement.title     = Direct placement to vetted shortlists
values.card.placement.body      = Hiring teams receive curated, audit-ready shortlists — not a search dump. Every candidate ships with their full competency dossier attached. You hire directly; OGS takes no labor-supply commission.
values.card.training.title      = Training pipeline — no dead-end profiles
values.card.training.body       = When a competency gap is detected, OGS routes the worker to the right course or pathway before surfacing them as ready. Profiles stay alive — workers either qualify or they're moved into the training queue that closes the gap.
values.card.intelligence.title  = Recruitment intelligence dashboards
values.card.intelligence.body   = Real-time signals on workforce readiness, certification expiries and crew assignment coverage. The same operational layer national operators use internally — now in front of every employer hiring on the portal.
values.card.regional.title      = Regional delivery network
values.card.regional.body       = Active candidate pools across Egypt, Iraq, UAE, KSA, Oman and Libya. Mobilize where the field is.
values.card.contracting.title   = Direct employer contracting
values.card.contracting.body    = No agency commission. No labor-supplier markup. Employers contract workers directly; OGS is the verification and governance layer between them, not a middleman taking a cut of the hire.

how.eyebrow                     = How It Works
how.title                       = One portal. Two sides of the hire.
how.workers.title               = For Workers
how.workers.step1.title         = Apply
how.workers.step1.body          = Create your worker profile. Add experience, certificates, languages, mobilization preferences.
how.workers.step2.title         = Get verified
how.workers.step2.body          = OGS assessors review your record. Where a gap exists, you're routed to the right training pathway before being shortlisted.
how.workers.step3.title         = Browse jobs
how.workers.step3.body          = Search live roles by title, country and role family. Save jobs and set alerts.
how.workers.step4.title         = Apply to roles
how.workers.step4.body          = One-click apply with your verified SkillPass attached. Track applications inside the portal.
how.workers.cta                 = Build my profile
how.employers.title             = For Employers
how.employers.step1.title       = Post a role
how.employers.step1.body        = Publish a position. Specify scope, country, mobilization window and compliance bar.
how.employers.step2.title       = Receive a verified shortlist
how.employers.step2.body        = Candidates surface with their full audit-ready competency dossier attached. Filter and rank in-portal.
how.employers.step3.title       = Interview directly
how.employers.step3.body        = Schedule, interview and assess inside the OGS portal — or in your own ATS via export.
how.employers.step4.title       = Hire (no commission)
how.employers.step4.body        = Contract the worker directly. OGS takes no labor-supply margin on the hire; the platform fee is the published employer tier.
how.employers.cta               = Post a role

testimonial.eyebrow             = Trusted by Industry Leaders
testimonial.logosLabel          = Operators and EPCs already inside the OGS ecosystem
testimonial.quote               = OGS transformed our competency program — 32% improvement in assessment pass rates within the first 6 months. The management dashboard gave us visibility we never had before.
testimonial.name                = Ahmed R.
testimonial.role                = Training Manager
testimonial.org                 = National Oil Operator
testimonial.country             = Egypt

faq.eyebrow                     = Questions, Answered
faq.title                       = What hiring teams and workers ask us first.
faq.q1                          = What does "OGS-verified" actually mean on a worker's profile?
faq.a1                          = Three things bound to one record: identity-verified worker, assessor-signed competency evidence, and a documented chain of training plus on-job validation. The verification methodology is the same Train + Prove + Report standard OGS delivers to national operators through ogs-tc.com. A verified profile means a named OGS assessor signed off — not an algorithm.
faq.q2                          = How does pricing work for workers and employers?
faq.a2                          = Both sides pay. Workers can use the portal free, or upgrade to a premium tier for a boosted profile, priority assessment slots and increased visibility on hiring-team shortlists. Employers pay a published tier covering job postings, verified shortlists and the workforce-readiness dashboard. See the Pricing page for current tiers.
faq.q3                          = What countries and roles are covered today?
faq.a3                          = Six countries — Egypt, Iraq, UAE, KSA, Oman and Libya. Six core role families — Metering & Integrity, QA/QC, Inspection, HSE, Sustainability and Operations. Live counts are surfaced on every Browse tile on this page; if a tile reads 0, that family currently has no open positions on the portal.
faq.q4                          = How long does it take to get verified as a worker?
faq.a4                          = Most profiles complete first-round verification within 5–10 business days from a complete submission. If a competency gap is detected, you're routed to the matching training pathway and re-enter verification on completion — verification is never a dead end.
faq.q5                          = Can an employer export a candidate's full competency dossier?
faq.a5                          = Yes. Every shortlisted candidate ships with an exportable, audit-ready dossier — assessor identity, evidence trail, certificate validity and expiry. Hand it to your QA auditor or upload it into your own ATS without redaction.
faq.q6                          = How is worker data protected? Who sees my profile?
faq.a6                          = Worker records are private by default. Employers see only the fields a worker has chosen to surface for a given role. Contact details are gated until both sides accept an introduction. Workers can revoke visibility for any employer at any time.

finalCta.title                  = Hire verified energy talent — or get on a verified shortlist.
finalCta.sub                    = Real jobs are open today. Post a role or browse all live positions across the six MENA markets.
finalCta.ctaPrimary             = Post a role
finalCta.ctaSecondary           = Browse jobs
finalCta.countries              = Egypt · Iraq · UAE · KSA · Oman · Libya

footer.col.workers              = Workers
footer.col.employers            = Employers
footer.col.company              = Company
footer.col.ecosystem            = Ecosystem
footer.col.regional             = Regional
footer.link.browseJobs          = Browse jobs
footer.link.buildProfile        = Build profile
footer.link.howVerificationWorks= How verification works
footer.link.renewals            = Renewals & re-assessment
footer.link.skillpass           = SkillPass
footer.link.pricingWorkers      = Pricing for workers
footer.link.postRole            = Post a role
footer.link.requestShortlist    = Request shortlist
footer.link.dashboards          = Workforce dashboards
footer.link.verifPacks          = Verification packs
footer.link.pricingEmployers    = Pricing for employers
footer.link.about               = About OGS
footer.link.insights            = Insights
footer.link.contact             = Contact
footer.link.pricing             = Pricing
footer.link.ogsTc               = OGS Training & Consulting (ogs-tc.com)
footer.link.ogsAcademy          = OGS Academy
footer.link.ogsCareers          = OGS Careers
footer.regionalPresence         = Regional Presence
footer.legal.copyright          = © {year} OGS Training & Consulting. All rights reserved.
footer.legal.privacy            = Privacy
footer.legal.terms               = Terms
footer.legal.cookies            = Cookies
footer.legal.security           = Security
```

---

## 6. A11y checklist

- **Hero contrast.** Headline + sub on photography must hit WCAG AA `4.5:1` over the darkest representative pixel under the text band, not the average. Gradient values in §3.2 are tuned for this; QA with the actual hero image before sign-off.
- **Search bar.** `<form aria-label="Find verified energy jobs across MENA">`. Each input has an explicit `<label>` (visually hidden if needed). Submit button is a real `<button type="submit">`. Country select is shadcn `Select` with keyboard support and `aria-label`.
- **Job cards.** Each card is wrapped in a single `<a>` to its primary action OR has a single primary `<a>` inside — never both, to avoid nested-interactive. Posted-date uses `<time datetime>`.
- **Browse tiles.** Each tile is a single `<a>` containing icon (aria-hidden) + label + count + chevron. Live count is plain text — not announced as a separate live region.
- **Logo marquee.** `role="region" aria-roledescription="carousel"`. Reduced-motion: static row, manual scroll.
- **Accordion.** `<button aria-expanded aria-controls>` triggers; `<region aria-labelledby>` panels; plus/minus glyphs `aria-hidden`.
- **Focus order.** Visible focus ring uses `--ring` (teal); never `outline: none` without a replacement.
- **Skip link.** "Skip to main content" as the first focusable element, hidden until focused.
- **Semantic landmarks.** One `<header>`, one `<main>`, one `<footer>`. Sections use `<section aria-labelledby>` keyed to their H2.
- **Image alts.** Hero image carries descriptive alt; flags inside tiles/strips are `aria-hidden` (country name is the accessible label).
- **Performance / motion.** Hero served via `next/image` with `priority`; AVIF + WebP; LCP target ≤ 2.0s on 4G.
- **RTL deferred — to revisit when Arabic translation lands. See open question #?? (i18n) on the Founder list.** All horizontal layouts SHOULD still use logical properties (`ms-`, `me-`, `start`, `end`) so the future RTL pass is mechanical, not a rewrite.

---

## 7. Founder decisions (locked)

All four open questions answered by the Founder. Recorded here as the binding contract for downstream agents (UI Engineer building primitives, Frontend Feature Engineer composing the module, etc.).

1. **`Insights` nav link → FEATURE-FLAG, HIDDEN IN V1.**
   - Header and footer both omit the Insights link until ≥3 articles are publishable.
   - When content lands, a feature flag flips Insights on globally. No template work needed at flip time.
   - Primitive impact: `MarketingHeader` + `MarketingFooter` accept their nav arrays at compose time — Insights simply isn't passed in v1.

2. **`/pricing` page → SEPARATE SPEC LATER. LINK-ONLY STUB IN V1.**
   - Header and footer link to `/pricing`. The route ships as a 1-line stub composing a `<ComingSoonView />` or a placeholder until the Pricing spec lands.
   - Primitive impact: none — header/footer just wire the link.

3. **`JobCard.Apply` → IN-PORTAL APPLICATION FLOW, SIGN-IN GATED.**
   - Clicking `Apply` on a job card routes to `/jobs/<slug>/apply`. If the visitor is not signed in, they are routed through `/sign-in?callbackURL=/jobs/<slug>/apply` first.
   - The application is tracked inside the OGS portal (employer dashboard sees it; worker sees it on `/account/applications`).
   - **No external ATS links** in v1 — keeps the verification handoff intact.
   - Primitive impact: `JobCard` does not need an `applyMode` prop. Drop that prop from the spec.

4. **`Post a role` → GATED BY VERIFIED EMPLOYER ACCOUNT + ADMIN REVIEW.**
   - Public visitor clicks `Post a role` in the header (or final CTA) → routed to `/employers/post`.
   - **Signed-out** → bounced to `/sign-in?callbackURL=/employers/post` first.
   - **Signed-in, no employer account** → bounced to `/employers/onboarding` (creates the company record, kicks off KYB-style verification by admin).
   - **Signed-in, unverified employer** → can fill the post form, but on submit BOTH the company AND the post enter the admin moderation queue. The post does NOT go live until admin approves the company; subsequent posts by the same (now-verified) company go live with content-only review (or directly, see open follow-up below).
   - **Signed-in, verified employer** → can post directly. (Open follow-up: do verified-employer posts still get a content-only review, or skip moderation entirely? Default for v1 = content-only review on the FIRST post per company, direct after that.)
   - Primitive impact:
     - `MarketingHeader` + `MarketingFooter` + `CtaBanner`: the `Post a role` link target is `/employers/post` — gating is the route's concern, not the primitive's.
     - `JobCard`: SHOULD render a `Verified employer` badge when the company is verified (small teal pill in the bottom-right of the card). Add `verifiedEmployer?: boolean` to the `JobCard` prop type.
     - A new section on the landing IS NOT needed for this — the gating is product flow, not landing-page surface. But the FAQ MUST mention the verified-employer requirement (already covered indirectly; UI Engineer to confirm wording on FAQ q1 + the data-protection answer is consistent).

### 7b. Open follow-ups (NOT blocking landing v1, but flag for the Founder's roadmap)

- **Worker-side verification SLA copy.** FAQ currently promises a verification timeline. The Founder should confirm the actual SLA before the page goes live, or the FAQ wording must hedge.
- **`Verified employer` badge visual.** UI Engineer should propose the visual treatment (teal pill, "Verified" + checkmark, or icon-only) when building the `JobCard` primitive. Founder confirms before merge.
- **Whether verified-employer posts skip content review entirely** vs. require content-only review on every post. Default v1: content-only review on FIRST post per company, direct after that. Confirm or adjust.
- **Admin moderation surface** (where admins review pending companies + posts) is a separate spec — `/apps/admin/src/modules/moderation/`. Not blocking the landing.
