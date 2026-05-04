# DealClick Japan Real Data

Full-stack MVP website for Japan deal/coupon discovery.

## Features

- Real product/deal data from Rakuten Ichiba Item Search API
- Backend route: `/api/deals`
- Click tracking route: `/api/click`
- Search by keyword
- Category filters
- Featured deals
- Product detail view
- Affiliate URL support via `RAKUTEN_AFFILIATE_ID`
- TikTok content scripts included in `content/tiktok-scripts.md`

## Data source

This project uses Rakuten Web Service / Rakuten Ichiba Item Search API.

## Local setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```bash
RAKUTEN_APP_ID=your_real_rakuten_application_id
RAKUTEN_AFFILIATE_ID=optional_affiliate_id
```

Run:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## API

```bash
GET /api/deals
GET /api/deals?category=fashion
GET /api/deals?keyword=コスメ%20クーポン
POST /api/click
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel
vercel env add RAKUTEN_APP_ID
vercel env add RAKUTEN_AFFILIATE_ID
vercel --prod
```

Or import the repository/folder into Vercel and add environment variables in:

Project Settings → Environment Variables.

## Next monetization steps

1. Add Rakuten Affiliate ID.
2. Add Google Analytics or Plausible.
3. Save click events to Supabase / Vercel Postgres.
4. Start posting TikTok videos from `content/tiktok-scripts.md`.
5. Add SEO pages for high-intent keywords:
   - `/search?keyword=コスメ クーポン`
   - `/search?keyword=家電 セール`
   - `/search?keyword=食品 送料無料`
