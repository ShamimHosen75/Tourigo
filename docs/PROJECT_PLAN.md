# Project Plan — Bangladesh Treks & Tours Website

A Bangladesh-focused rebuild of the layout, features and animations shown in the screen recording of the reference site (trekbirds.in). Prices are in BDT, all destinations are in Bangladesh, and there is no payment gateway: bookings are saved as enquiries and the team confirms them by phone.

---

## 1. Analysis of the reference site (from the screen recording)

| # | Section | What it does | Animation / interaction |
|---|---------|--------------|-------------------------|
| 1 | **Announcement ticker** | Dark strip at the very top: “Treks from X are now open”, a yellow `SPECIAL` badge, phone and email on the right | Infinite horizontal marquee |
| 2 | **Navbar** | Logo + tagline on the left; Home, Packages, Blogs, About, Contact | Sticky; blue underline on the active link |
| 3 | **Hero** | Full-screen photo of a trekker looking at mountains. “Adventure Starts With” in white, “Your Journey” in blue | Slow zoom (Ken Burns). A 3-button pill switches the weather between **rain**, **falling petals** and **clear/snow**, each with its own background. The headline lifts and fades as you scroll. “Scroll to explore” mouse indicator |
| 4 | **Explore Categories** | “Find Your Perfect Adventure Style”, a grid of poster-style cards (big black lettering on top, photo, package count, description, Explore →) | Fade-up on scroll, image zoom and card lift on hover |
| 5 | **Featured Adventures** | “Discover Popular Treks & Tour Packages”, stats (6+, 50+, 100%), trek cards with level/duration chips, title, starting price and age group | **3D card flip on hover** to a dark back face with description, Duration / Altitude / Level / Gender and an “Explore Adventure” button. Count-up stats |
| 6 | **Adventure Gallery** | “Moments That Inspire Every Adventure”, stats (10K+, 500+, 50+) | **3D photo sphere**: rounded-square photos on a rotating globe that you can drag |
| 7 | **Testimonials** | Star rating, quote, name, trip | Two rows of cards scrolling in opposite directions with faded edges |
| 8 | **FAQ** | “Got Questions? We’ve Got Answers”, search box, category chips with counts (General, Booking, Safety, Gear, Cancellation), accordion; “Still Have Questions?” card with a Contact button | Animated accordion and live filtering |
| 9 | **Footer** | Logo, about text, social icons, Quick Links, Featured Treks, Contact Support, legal links | A small trekker **walks along the footer’s top line** |
| 10 | **Floating WhatsApp** | Green button with a red “1” badge | Pulse ring |
| 11 | **Package page** | Sticky breadcrumb with Back; category/level/duration chips; title; age and gender chips; main photo + thumbnails (“PHOTO 1 OF n”) | Tabs: **Overview, Itinerary, Route Map, Amenities & Gear, FAQs & Policies** |
| 12 | **Itinerary tab** | “Day-by-Day Trek Itinerary”, Expand All / Collapse All, timeline (D1, D2…) where each day shows the **real date of the selected batch**, pickup times, stay and duration | Accordion timeline |
| 13 | **Booking card** (sticky) | BEST PRICE GUARANTEED, Save ₹X, price with the old price struck through, departure batches with “12 slots left” / “Filling fast”, traveller stepper, estimated total, “Proceed to Book (N Trekkers)” | Live total |
| 14 | **Express Checkout modal** | Choose a pickup point (with Google Maps links and extra fees), price breakdown, primary traveller name/email/phone, “Confirm & Submit Booking Inquiry” | Spring-in modal, success screen |

## 2. Adapting it for Bangladesh

* **Currency:** BDT (`৳`), set once in `src/config/site.ts`.
* **Departure cities:** Dhaka, Chattogram and Sylhet in place of Mumbai, Nashik and Pune. Pickups are Arambagh, Kalabagan, Sayedabad, GEC Circle, Ambarkhana and others.
* **Categories:** Tour from Dhaka / Chattogram / Sylhet, Domestic Trips, Customized, Campus, Heritage, Family, Adventure Trek, Corporate, Honeymoon.
* **12 packages:** Sajek, Saint Martin, Nafakhum, Keokradong, Sundarbans, Sreemangal, Ratargul + Bichanakandi, Tanguar Haor, Khoiyachora, Kaptai Lake, Bagerhat, Kuakata.
* **Photo sphere:** 36 famous spots, from Cox’s Bazar, Sajek and Nilgiri to Ratargul, Jaflong, Paharpur, Lalbagh Fort and Tetulia.
* **No payment gateway:** the booking is stored as **pending** and the team calls the customer for bKash, Nagad or bank payment. A gateway (SSLCommerz, bKash PGW or aamarPay) can be added later; see §6.
* **Branding:** the name, logo, phone and socials are placeholders in `src/config/site.ts`.

## 3. Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 15 (App Router) + React 19 + TypeScript** | Server rendering for SEO, static pages with 60 s revalidation, server actions for forms |
| Styling | **Tailwind CSS 3.4** | Fast to build the reference’s look, and easy for AI tools to edit |
| Animation | **Framer Motion 11** plus CSS keyframes and Canvas 2D | Scroll reveals, spring flips, shared-layout tabs; canvas for the rain, petals and snow |
| Icons | lucide-react | |
| Database | **Supabase (Postgres + RLS + Storage)** | Free tier, SQL, row-level security, image storage |
| Hosting | Vercel (or Netlify) | Zero-config Next.js |

## 4. Architecture

```
Tourigo/
├─ src/app/                     routes
│  ├─ page.tsx                  home (hero → categories → packages → sphere → testimonials → FAQ)
│  ├─ packages/page.tsx         list with search / level / duration / sort / category filters
│  ├─ packages/[slug]/page.tsx  detail + booking
│  ├─ blogs/, about/, contact/, terms/, cancellation-policy/, privacy-policy/
│  └─ actions.ts                server actions: submitBooking, submitEnquiry → Supabase
├─ src/components/
│  ├─ layout/   TopTicker, Navbar, Footer (walking hiker), WhatsAppButton, Logo
│  ├─ home/     Hero, HeroArt, WeatherCanvas, Categories, PopularPackages,
│  │            DomeGallery (3D sphere), GallerySection, Testimonials, FaqSection
│  ├─ packages/ PackageFlipCard, PackagesExplorer, PackageGallery, PackageDetail, BookingModal
│  └─ ui/       Reveal, CountUp, Accordion, SectionBadge, Breadcrumb, PageHero, SmartImage
├─ src/lib/
│  ├─ data.ts       all reads: Supabase when configured, otherwise demo data
│  ├─ supabase.ts   client
│  ├─ scene.ts      generated landscape artwork (placeholder until real photos are uploaded)
│  └─ types.ts
├─ src/data/        demo content (categories, packages, FAQs, testimonials, gallery, blogs)
├─ src/config/site.ts   brand name, logo, contact, currency, ticker, menu
└─ supabase/
   ├─ schema.sql   tables, RLS, seat-reservation trigger, storage bucket
   └─ seed.sql     generated from src/data (npm run db:seed-sql)
```

**Data flow:** pages are server components that call `src/lib/data.ts`. Without Supabase keys they serve `src/data/*`, so the site always works. With keys, they read the Supabase tables. Forms call server actions that insert into `bookings` and `enquiries`.

**Booking safety:** a `BEFORE INSERT` trigger:
1. Reserves seats atomically and rejects overbooking.
2. Recalculates the total from the batch price and pickup fee, so a tampered browser can’t change the price.
3. Forces `status = 'pending'`.

Cancelling a booking in the dashboard gives the seats back. Visitors can insert bookings and enquiries but can **never read** them.

## 5. Build phases (done ✅)

1. ✅ Scaffold Next.js + Tailwind + Framer Motion; design tokens (sky-blue brand, Outfit/Inter fonts)
2. ✅ Layout: ticker, sticky navbar, footer with walking hiker, WhatsApp button
3. ✅ Hero with three weather modes, canvas particles, Ken Burns zoom, scroll parallax
4. ✅ Categories grid, flip cards, count-up stats
5. ✅ 3D drag-to-spin photo sphere with lightbox
6. ✅ Testimonials double marquee, FAQ search + filters + accordion
7. ✅ Packages list with filters (URL-synced category)
8. ✅ Package detail: gallery, tabs, dated itinerary timeline, map, amenities, FAQs/policies, sticky booking card
9. ✅ Express Checkout modal → server action → Supabase
10. ✅ Blogs, About, Contact (form → Supabase), legal pages, 404
11. ✅ Supabase schema, RLS, triggers, storage bucket, seed

## 6. Next steps (after you connect Supabase)

* **Real photos:** upload them to the `travel-images` bucket and paste the public URLs into `packages.images`, `categories.image_url` and `gallery_items.image_url`.
* **Logo and name:** edit `src/config/site.ts`.
* **Admin panel** (optional): Supabase Auth + an `/admin` route using the service-role key, to manage packages, batches and bookings. You can also use the Supabase Table Editor directly.
* **Email/SMS on booking:** a Supabase Database Webhook on `bookings` that calls an Edge Function sending email (Resend) or SMS (SSL Wireless or BulkSMSBD).
* **Payment gateway later:** add a `payments` table and an `/api/payment/*` route for SSLCommerz or bKash. When a payment is verified, set `bookings.status = 'paid'`.
