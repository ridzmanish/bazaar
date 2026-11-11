# Bazaar storefront

A responsive shopping storefront built with Vite and Supabase, ready to deploy on Netlify.

## Run locally

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set your Supabase project URL and **anon/public** key.
4. Run `npm run dev`.

Without Supabase credentials the shop runs on its built-in demo products. With credentials configured, it reads active products from the `products` table.

## Supabase setup

Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor. Add products to `public.products`; the storefront expects the columns in that schema. Keep Row Level Security enabled and never put a `service_role` key in this frontend.

## Deploy to Netlify

Import the GitHub repository into Netlify. The included `netlify.toml` configures `npm run build` and `dist`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Site configuration → Environment variables**, then redeploy.

The cart is stored in the shopper's browser. The checkout and newsletter buttons are UI demos; connect a payment provider and a server-side/Edge Function before accepting orders or collecting customer information.
