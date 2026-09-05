Codebase Exploration Report — Merline
Scope: c:\Users\kyc\Desktop\merline2\merline (medium thoroughness)
Stack: Next.js 16.3, React 19, Supabase, Stripe, Remotion, Tailwind 4, TypeScript
Source files: ~191 .ts/.tsx files (excluding node_modules, .next)

1. Project Structure Overview
Folder	Role	File count (approx.)
app/
Next.js App Router: pages, layouts, API routes, server actions
43
components/
React UI, grouped by domain
105
lib/
Shared server/client utilities, types, Supabase/Stripe helpers
33
supabase/migrations/
PostgreSQL schema (36 migrations)
36
remotion/
Ad video compositions for admin library
4 (+ config)
public/
Static assets (GIFs, SVGs, profile images)
—
scripts/
One-off tooling (recolor-merline-gif.mjs)
1
app/ routes (high level)
Marketing: /, /tarifs, /agents, /guide, /pro/hormozi
Auth: /login, /login/setup/*, /auth/callback, /auth/google/*
Listings: /vendre, /vendre/plan, /vendre/paiement, /annonce/[src]/[id]
Dashboard: /dashboard/* (redirects root → /dashboard/annonces)
Profiles: /profil/[username]
Payments: /paiement, /paiement/success
Legal: /termes-conditions, /politique-confidentialite
Admin: /admin
API: /api/stripe/*, /api/checkout/complete, /api/analytics/collect, /api/admin/*
components/ organization (16 subfolders)
components/
├── admin/        (7)   Admin dashboard + ad library
├── agents/       (2)   Agent search/grid
├── analytics/    (4)   Site tracker, view/favorite counts
├── auth/         (6)   Login, setup flows, auth dialog
├── catalog/      (5)   Catalog browser, cards, product section
├── guide/        (3)   Agent guide viewer
├── layout/       (14)  Header, footer, shells, motion wrappers
├── legal/        (1)   Legal page shell
├── listings/     (18)  Largest domain — forms, dashboard, checkout
├── marketing/    (19)  Landing + pricing sections
├── messages/     (9)   DMs + group messaging (recent)
├── pro/          (2)   Pro checkout demo page
├── profiles/     (7)   Profile UI, reviews, contact
├── settings/     (4)   Profile/subscription settings
└── ui/           (6)   Shared primitives (SelectDropdown, motion, etc.)
lib/ patterns
Flat domain modules: auth.ts, catalog.ts, plans.ts, subscription.ts, stripe-checkout.ts, analytics.ts, favorites.ts, categories.ts, form-draft.ts, types.ts
Profile split across 7 files: profile.ts, profile-type.ts, profile-bank.ts, profile-contact.ts, profile-reviews.ts, profile-listings.ts, agent-profiles.ts (+ thin agents.ts re-export/fetch layer)
Supabase subfolder: lib/supabase/{client,server,admin,middleware,env}.ts
Integrations: stripe.ts, google-oauth.ts, email-otp.ts, admin-auth.ts, admin-ads.ts, admin-stats.ts
2. Potential Duplicate Components / Similar Files
Exact duplicate file content
Files	Evidence
c:\Users\kyc\Desktop\merline2\merline\app\paiement\success\route.ts
Identical 9-line redirect to /api/checkout/complete
c:\Users\kyc\Desktop\merline2\merline\app\vendre\paiement\success\route.ts
Same content as above
Also redundant: next.config.ts lines 14–26 define the same redirects for /paiement/success and /vendre/paiement/success — three mechanisms doing the same job.

Near-duplicate components (copy-pasted patterns)
Pair	Evidence
components\auth\UsernameSetupForm.tsx vs components\auth\SetupAccountForm.tsx
Both call setupUsername / checkUsernameAvailability from @/app/auth/actions. SetupAccountForm adds step UI ("Étape 1 sur 3"); UsernameSetupForm is a stripped-down form. Only SetupAccountForm is imported (app\login\setup\page.tsx).
components\marketing\PricingSection.tsx vs components\marketing\TarifsPageContent.tsx
Both map PLANS into cards with AnimatedPlanCard + PricingAmount. PricingSection uses CheckoutButton; TarifsPageContent uses direct links. Only TarifsPageContent is mounted (via TarifsPage).
components\marketing\FaqSection.tsx vs components\marketing\PricingFaq.tsx
Both render FAQ accordions with overlapping forfait questions. TarifsPage uses PricingFaq; FaqSection has no importers.
components\messages\ConvReplyForm.tsx vs components\messages\GroupReplyForm.tsx
Shared resizeTextarea, useActionState, auto-resize textarea, send button pattern. Group version is simpler (no phone/bank share menu).
components\analytics\ViewCount.tsx + FavoriteCount.tsx vs inline logic in ListingPageHeader.tsx
ListingPageHeader imports formatViewCount/formatFavoriteCount from @/lib/analytics directly; wrapper components are only used by unused ListingEngagementStats.
Same filename, different paths (expected, not bugs)
Name	Locations	Notes
middleware.ts
Root + lib/supabase/middleware.ts
Root wraps updateSession from lib — intentional split
actions.ts
app/actions.ts + app/auth/actions.ts
Split by domain (app vs auth)
page.tsx (×27), route.ts (×11), layout.tsx (×3)
Throughout app/
Normal App Router convention
3. Files That Appear Unused
Method: Grep for import … from "@/components/…" / @/lib/… across all .ts/.tsx. Entry points (pages, layouts, routes, middleware) excluded.

High-confidence unused components
File	Evidence
components\auth\UsernameSetupForm.tsx
Zero imports; superseded by SetupAccountForm
components\marketing\FaqSection.tsx
No import.*FaqSection matches
components\marketing\PricingSection.tsx
No importers; only imports CheckoutButton internally
components\marketing\CheckoutButton.tsx
Only imported by unused PricingSection
components\marketing\AudienceSection.tsx
No importers
components\marketing\AgentsDirectory.tsx
No importers (/agents page uses AgentsSearchPanel directly)
components\marketing\IndigoIntroSection.tsx
No importers
components\marketing\ContactSection.tsx
No importers
components\marketing\ContactForm.tsx
Only imported by unused ContactSection
components\marketing\TypewriterStatsColumn.tsx
Only imported by unused IndigoIntroSection
components\listings\ListingStat.tsx
No import.*ListingStat matches
components\listings\ListingFavoriteButton.tsx
No importers; favorite logic inlined in ListingPageHeader.tsx
components\analytics\ListingEngagementStats.tsx
No importers
components\analytics\ViewCount.tsx
Only imported by unused ListingEngagementStats
components\analytics\FavoriteCount.tsx
Only imported by unused ListingEngagementStats
Likely cause: Homepage was refactored from a multi-section landing page (PricingSection, AudienceSection, AgentsDirectory, ContactSection, IndigoIntroSection) to a slimmer layout in app\page.tsx (Hero + ProductCatalog + Features + MarketingCta only).

Possibly redundant route files
File	Evidence
app\paiement\success\route.ts
Duplicates next.config.ts redirect
app\vendre\paiement\success\route.ts
Same
All lib/ modules appear used
Every file under lib/ has at least one @/lib/... import. No dead lib modules found.

Stale build artifacts (not source)
Git status shows .next/dev/server/app/forfait/page.js and catalogue/page.js, but no app/forfait/ or app/catalogue/ in source. Catalog lives at /#catalogue anchor in components\catalog\ProductCatalog.tsx.

4. Folder Structure Issues
Empty route groups
app\dashboard\(main)\     — exists, no files
app\dashboard\(messages)\ — exists, no files
These add noise without affecting routing. Safe to remove or populate.

Inconsistent / overlapping payment routes
Route	Purpose
/paiement?plan=…
Subscription plan checkout (app\paiement\page.tsx)
/vendre/paiement?listing=…
Per-listing checkout (app\vendre\paiement\page.tsx)
/vendre/plan
Plan selection during sell flow
Naming overlap (paiement in two places) can confuse navigation and redirects.

Deep nesting (acceptable but notable)
app\dashboard\annonces\[intent]\[id]\modifier\page.tsx — 5 levels
app\dashboard\messages\groupes\[id]\page.tsx — 4 levels
Consistent with App Router conventions; not inherently wrong.

Split server actions
app\actions.ts — 1,484 lines (listings, messages, favorites, contact, subscriptions, groups)
app\auth\actions.ts — auth, setup, listing delete/status
Large monolith in app/actions.ts is a maintainability concern.

Duplicate type definition
ListingStatus is defined in both:

lib\types.ts (line 7)
app\auth\actions.ts (line 399)
DashboardListingCard imports the type from @/app/auth/actions instead of @/lib/types.

Naming conventions
French URL segments (profil, annonce, vendre, tarifs) — consistent
English code (components/, lib/, dashboard) — consistent
Mixed: header-menu-links.ts uses kebab-case among PascalCase component files in layout/
5. Simple Optimization Opportunities
A. Remove or consolidate dead marketing components (~15 files)
The unused marketing chain above is ~2,000+ lines of dead UI. Either wire it back into pages or delete.

B. Consolidate FAQ / pricing UI
Merge FaqSection into PricingFaq, or delete FaqSection
Merge PricingSection patterns into TarifsPageContent (shared plan-card renderer)
C. Extract shared message reply form
ConvReplyForm and GroupReplyForm share ~70% structure. A shared MessageReplyForm with optional share-menu props would reduce duplication.

D. Consolidate profile lib modules
Seven profile-* files could become a lib/profile/ folder:

lib/profile/
  index.ts          (re-exports)
  types.ts
  fetch.ts          (getUserProfile)
  bank.ts
  contact.ts
  reviews.ts
  listings.ts
Current split is workable but scatters related logic.

E. Split app/actions.ts
At 1,484 lines, consider domain files:

app/actions/listings.ts
app/actions/messages.ts
app/actions/favorites.ts
Re-export from app/actions.ts for backward compatibility.

F. Deduplicate payment success handling
Keep one mechanism:

Either next.config.ts redirects or route handlers — not both.
G. Use ListingFavoriteButton or delete it
ListingPageHeader.tsx reimplements favorite toggle inline. Either adopt the component or remove it.

H. app/globals.css size
8,129 lines — likely contains accumulated page-specific styles. Consider splitting by domain (catalog.css, dashboard.css, etc.) or leaning more on Tailwind utilities.

I. lib/agents.ts as thin facade
lib/agents.ts re-exports from agent-profiles.ts and adds fetch functions. Consumers import from both paths (getAgentDisplayName from agent-profiles, getAgentProfiles from agents). A single lib/agents/ entry point would simplify imports.

J. Duplicate username setup forms
Delete UsernameSetupForm.tsx if SetupAccountForm.tsx is the canonical version.

Summary Table: Dead Code Candidates
Category	Count	Paths
Unused marketing sections
9
FaqSection, PricingSection, CheckoutButton, AudienceSection, AgentsDirectory, IndigoIntroSection, ContactSection, ContactForm, TypewriterStatsColumn
Unused listing/analytics
4
ListingStat, ListingFavoriteButton, ListingEngagementStats, (+ ViewCount, FavoriteCount as transitive)
Superseded auth form
1
UsernameSetupForm
Redundant routes
2
app/paiement/success/route.ts, app/vendre/paiement/success/route.ts
Empty folders
2
app/dashboard/(main)/, app/dashboard/(messages)/
Total estimated removable/unused source: ~16 component files + 2 route files, without touching active features.

Active Architecture Notes (for context)
Homepage (app\page.tsx): HeroSection → ProductCatalog → FeaturesSection → MarketingCtaSection
Pricing lives at /tarifs via TarifsPage → TarifsPageContent + PricingFaq
Messages: Recent group messaging in components/messages/ with migrations 20260829180300–80500
Remotion: Used by admin ad library (components/admin/library/* + remotion/*)
All lib modules are actively imported — no dead utilities detected
No changes were made to the codebase.