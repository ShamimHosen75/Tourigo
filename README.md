# Tourigo — Bangladesh Treks & Tours Website

A Next.js + Supabase travel booking website for Bangladesh. It has an animated weather hero, 3D flip trek cards, a drag-to-spin 3D photo sphere, marquee testimonials, a searchable FAQ, and package pages with dated itineraries and an Express Checkout booking flow. Prices are in BDT (৳).

The full analysis and plan are in [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md).

> The site runs **without any setup** on built-in demo data. Connect Supabase whenever you’re ready, and pages read from your database instead.

## 1. Run it locally

Requires Node.js 20 or newer.

```bash
git clone https://github.com/ShamimHosen75/Tourigo.git
cd Tourigo
npm install
npm run dev          # http://localhost:3000
```

Other commands: `npm run build`, `npm start`, `npm run typecheck`, `npm run db:seed-sql`.

## 2. Change brand name, logo and contact details

Edit **`src/config/site.ts`**:

* `name`, `tagline`: shown in the navbar, footer and page titles
* `logo`: put your file in `public/` (e.g. `public/logo.png`) and set `logo: '/logo.png'`
* `contact`: phone, WhatsApp number (digits only, e.g. `8801XXXXXXXXX`), email, address
* `social`: Facebook, Instagram and YouTube links
* `announcements`: the scrolling top ticker
* `heroImages`: optional photos for the rain / bloom / snow hero modes (default: the illustrated mountain scene)

## 3. Connect your Supabase database

1. Create a project at [supabase.com](https://supabase.com). The free tier is fine.
2. Open **SQL Editor → New query**, paste the whole of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**. This creates:
   * `categories`, `packages`, `package_batches`, `testimonials`, `faqs`, `gallery_items`, `blog_posts`: public read
   * `bookings`, `enquiries`: visitors can insert only; you read them in the dashboard
   * A trigger that reserves seats, blocks overbooking and recalculates the total price
   * A public storage bucket called `travel-images`
3. In a new query, paste [`supabase/seed.sql`](supabase/seed.sql) and **Run** it to load the demo packages, FAQs and other content.
4. Open **Project Settings → API** and copy the *Project URL* and the *anon public* key.
5. In the project folder, copy `.env.example` to `.env.local` and fill it in:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

6. Restart `npm run dev`. Content now comes from Supabase, and bookings and contact messages appear in **Table Editor → bookings / enquiries**.

**Managing content.** Use the Supabase **Table Editor**:

* Add a package: a row in `packages` plus one or more rows in `package_batches`. `itinerary`, `pickup_points` and the other list fields are JSON; copy the format from an existing row.
* Confirm a booking: change `status` to `confirmed` or `paid`. Setting it to `cancelled` returns the seats.
* Add photos: Storage → `travel-images` → upload, then *Copy URL*. Paste it into `packages.images` (a JSON list such as `["https://…jpg"]`), `categories.image_url` or `gallery_items.image_url`. Any record without a photo shows the built-in illustrated artwork.

Pages refresh from the database every 60 seconds.

## 4. Continue in Antigravity (with Claude or Gemini)

1. Clone `https://github.com/ShamimHosen75/Tourigo` and open the folder as the workspace.
2. Create `.env.local` as in step 3.
3. Useful prompts:

   * *“Read `README.md` and `docs/PROJECT_PLAN.md`. Then replace the brand in `src/config/site.ts` with name `<NAME>`, phone `<PHONE>`, email `<EMAIL>`, and use `public/logo.png` as the logo.”*
   * *“Add a new package to Supabase for `<PLACE>`, 3 days / 2 nights, price ৳`<X>`, with an itinerary in the same JSON format as `sajek-valley-tour`. Give me the SQL insert for `packages` and `package_batches`.”*
   * *“Build a password-protected `/admin` page using Supabase Auth that lists `bookings` and `enquiries` and lets me change booking status. Use the service-role key only on the server.”*
   * *“Add a Supabase Edge Function that emails me (via Resend) whenever a row is inserted into `bookings`.”*
   * *“Later: integrate SSLCommerz payments. Create a `payments` table, an API route to start a payment, and a callback that sets `bookings.status = 'paid'`.”*

## 5. Deploy

**Vercel:** import the `Tourigo` GitHub repo (no root-directory change needed) and add the three environment variables. Deploy.

## Project structure (short)

```
src/app/            pages + server actions (actions.ts)
src/components/     layout/, home/, packages/, ui/
src/lib/data.ts     every database read (falls back to src/data when Supabase isn't configured)
src/lib/scene.ts    generated placeholder artwork
src/data/           demo content
supabase/           schema.sql + seed.sql
```
