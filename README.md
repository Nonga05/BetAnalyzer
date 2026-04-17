# BetAnalyzer PRO 2026

BetAnalyzer PRO is a professional football betting analysis dashboard built with Next.js App Router.

## What is included
- Search bar for specific matches
- Daily recommendations: singles and multiples
- Bankroll management with local history
- Live games panel
- Dashboard stats and performance
- Demo mode that works immediately
- Real data mode ready for API-Football

## Run locally
```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Deploy on Vercel
1. Upload this folder to a GitHub repository
2. Import the repository into Vercel
3. Add the environment variables from `.env.example`
4. Deploy

## Real data
This app supports API-Football via route handlers. If `API_FOOTBALL_KEY` is missing, the app uses demo data so it still works.

According to Next.js official documentation, interactive UI should live in Client Components using the `'use client'` directive, and route handlers should be implemented inside the `app` directory using `route.ts` files. citeturn432727search1turn432727search19

API-Football documents coverage for fixtures, odds, live scores, and predictions, making it suitable for the search, daily matches, and recommendation features used here. citeturn432727search2turn432727search5turn432727search8

## Icon
I preserved the app name as **BetAnalyzer**. I could not preserve your exact existing icon because the source icon asset was not provided, so `public/icon.png` is a placeholder slot you can replace directly.
