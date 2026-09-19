# Jobert Apparels — E-Commerce + Custom Uniform Platform

A production-grade Next.js 16 + Supabase application for Jobert Apparels Pvt. Ltd., built from
`Jobert_Apparels_Master_Spec_Updated.docx`. This is the **MVP slice** of that spec — Phase 1
(Foundation) + Phase 2 (E-Commerce) + a working, simplified **Custom Requirement Engine** covering
both custom uniforms and bulk orders — with every flow wired to a real database, not mock data.

## What's actually built (verified working)

- **Storefront**: homepage, category/product listing with filters & sort, product detail pages
  (variants, size charts, reviews), search, cart, wishlist.
- **Checkout & payments**: 3-step checkout, Razorpay order creation + signature verification +
  webhook backstop, server-computed totals (price/GST/discount/shipping are *never* trusted from
  the browser), inventory decremented only after confirmed payment.
- **Orders**: order numbers, status timeline, order tracking (number + email/phone), downloadable
  tax invoice with CGST/SGST/IGST split, customer account area.
- **Custom Requirement Engine**: one reusable 8-step wizard powering both `/custom-uniforms` and
  `/bulk-orders` — customization options, file/logo upload (private Supabase Storage bucket,
  validated server-side), dynamic garments, size/quantity matrix with gender columns, standard vs.
  custom measurements, branding, and a review + submit step. Generates a request ID, emails the
  customer and admin, and gives a "Continue on WhatsApp" pre-filled link.
- **Admin panel** (role-gated, separate from the storefront layout): dashboard with real stats
  (no fake numbers), product CRUD with variants/images/stock, order management with status updates
  (customer is emailed on change), custom/bulk request management with quoting, site settings.
- **Communication**: WhatsApp click-to-chat with pre-filled messages throughout (product page,
  bulk/custom flows, order help); transactional email via Resend for order confirmation, custom
  request confirmation, quote-sent, admin notifications — every send/skip/failure is logged to
  `email_logs`.
- **SEO**: per-product structured data, Organization JSON-LD, `sitemap.xml`, `robots.txt`,
  clean slugs (`/shop/school-uniforms`, `/product/school-uniform-shirt`).
- **Security**: Postgres Row Level Security on every table (see `supabase/migrations/0002_rls.sql`),
  a service-role client used only inside server routes/actions that have already checked
  authorization, file type/size validation on all uploads, Razorpay secret key and webhook secret
  never exposed to the client.

The original 3 SQL migrations and the seed script were executed end-to-end against a real local Postgres
instance during development (with `auth`/`storage` schemas stubbed to match Supabase) to confirm
they apply cleanly, the document-numbering triggers work, RLS policies compile, and `updated_at`
triggers fire correctly. A 4th migration (`0004_order_delay_note.sql`, adding `orders.delay_note`)
was added later as a simple additive `alter table` and has not been separately re-verified against
a live/stubbed Postgres instance — run it and confirm it applies cleanly before relying on it.
`npm run build` and `npx tsc --noEmit` both pass with zero errors.

**What I could not verify**: I don't have credentials for a live Supabase project, Razorpay
account, Resend account, or WhatsApp number, so the actual signed-in browser flows (place a real
order, receive a real email, open a real Razorpay checkout) have not been click-tested end-to-end.
Once you connect real credentials (steps below), that's the first thing to do.

## What's deliberately out of scope for this pass

Per the spec's own phased approach (§60) and the "gaps" section (§61.1: ship an MVP first), these
are fast-follows, not oversights:

- Coupons are modeled and validated server-side but there's no admin UI to create them yet (use
  SQL/the Supabase table editor for now).
- Blog, testimonials, FAQs, homepage banner scheduling (Phase 7 — CMS/marketing).
- Native WhatsApp Business API (current: click-to-chat links, which is the correct MVP choice per
  spec §61.8 — upgrade only once volume justifies it).
- Google Analytics/GTM wiring and the event taxonomy in spec §46 (Phase 7).
- Native iOS/Android app — this is a PWA-ready, mobile-first responsive web app; a React
  Native/Expo app can reuse the same Supabase backend and API routes (spec §40 explicitly allows
  this fallback path).
- Full Custom Requirement Engine breadth (spec's 13-step version) — this ships a genuinely
  complete 8-step version covering every data field, condensed for a better completion rate.
- CSV/Excel product bulk import/export.
- Uniform-type/fabric/branding-method option lists are static constants (`src/lib/custom-wizard-options.ts`)
  rather than admin-configurable tables — customization options and garments *are* fully
  admin-configurable (`customization_options` / `garment_options` tables), matching the highest
  business value first.

## Tech stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind v4 · shadcn/ui (Base UI-based "base-nova"
style — see note below) · Supabase (Postgres + Auth + Storage + RLS) · Razorpay · Resend · Zod v4.

> **Note for future AI-assisted work on this repo**: this shadcn registry uses **Base UI**, not
> Radix — there is no `asChild` prop anywhere in `src/components/ui/*`. Composition uses
> `render={<Link href="/x" />}` instead. See `AGENTS.md` for Next.js 16-specific conventions
> (`proxy.ts` not `middleware.ts`, fully async `params`/`cookies()`, etc.) — that file is
> auto-maintained by `next dev` and points at the bundled version-matched docs.

## Getting started

### 1. Create a Supabase project

At [supabase.com](https://supabase.com), create a project, then in the SQL Editor run the four
files in `supabase/migrations/` **in order** (0001 → 0002 → 0003 → 0004). Optionally run
`supabase/seed.sql` for browsable demo data — **never run seed.sql against production**, it's
placeholder content only (see spec §54: real prices/GSTIN/photography must come from Jobert).

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page — **server-only, never commit or expose to the client** |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Settings → Webhooks (point it at `/api/webhooks/razorpay`, events `payment.captured` + `payment.failed`) |
| `RESEND_API_KEY` / `EMAIL_FROM` / `ADMIN_NOTIFICATION_EMAIL` | resend.com |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | E.164 without `+`, e.g. `919876543210` — can also be set later in Admin → Settings |

The app runs without Razorpay/Resend configured: checkout falls back to "we'll contact you to
collect payment" instead of opening the payment widget, and emails are logged (not sent) with a
clear console warning — useful for local development, not for production.

### 3. Create your first admin user

There's intentionally no public sign-up path to the admin panel. After running the app once and
registering a normal customer account with the email you want to use as admin, promote it via the
Supabase SQL Editor:

```sql
insert into public.admin_users (id, full_name, role)
values ('<the user''s auth.users id>', 'Your Name', 'super_admin');
```

Then log in at `/admin/login`.

### 4. Run it

```bash
npm install
npm run dev
```

Storefront: `http://localhost:3000` · Admin: `http://localhost:3000/admin/login`

## Architecture notes

- **Route groups**: `src/app/(site)/*` is the storefront (shares header/footer/mobile nav/WhatsApp
  button); `src/app/admin/(protected)/*` is the guarded admin panel with its own sidebar shell;
  `src/app/admin/login` sits outside the guard; `src/app/invoice/[id]` is a standalone printable
  route with neither chrome.
- **Data access pattern**: public catalog reads go through the RLS-bound client
  (`src/lib/supabase/server.ts`). Anything involving pricing, stock, document numbering, or
  authorization checks goes through the service-role client (`src/lib/supabase/admin.ts`) inside a
  server-only route/action that has already verified the caller — see `src/lib/admin/guard.ts` and
  the comment at the top of `supabase/migrations/0002_rls.sql`.
- **One Custom Requirement Engine**: `src/components/custom-wizard/wizard.tsx` powers both request
  types via a `requestType` prop, per the spec's own architectural recommendation ("don't build
  separate disconnected forms"). Both `custom_requests` rows share one table with a
  `request_type` enum.
- **Pricing**: `src/lib/pricing.ts` is the single source of truth for subtotal/GST/shipping/total,
  called identically by the cart display and the checkout API — so what the customer sees is
  always what they're charged, and the charge is always computed server-side from fresh DB prices.

## Suggested next steps (in priority order)

1. Connect real Supabase/Razorpay/Resend credentials and run a full manual click-test of all three
   purchase paths (retail, bulk, custom) end to end.
2. Have the Jobert team fill in real product photography, pricing, and GSTIN via the admin panel
   before removing `supabase/seed.sql` demo data.
3. Admin UI for coupon management.
4. Wire Google Analytics/GTM + the event list from spec §46.
5. Move the remaining static option lists (uniform types, fabrics, branding methods) into
   admin-configurable tables, matching the pattern already used for garments/customization options.
