
# Arbies

A dashboard for tracking funding arbitrage opportunities across multiple DEXs.

Vercel deployment : https://arbies.vercel.app

## Listings per DEX

A [Github Action](https://github.com/Eraguzy/arbies/actions/workflows/listings-daily-run.yml) runs every day, using Claude to update the listings of each DEX. Reduce-only and non-USD-settled pairs are not provided by Arbies.

Since there can be ticker name collisions or misinterpretations, Claude will open a PR with suggested listings, which will require human verification before merging. Claude can read replies in this PR and adjust.


## Dev Setup

```bash
npm install
npm run dev
```
Go to https://localhost:3000

## Notes

- Designed to quickly list new exchanges
- Built entirely in Next.js

PM for inquiries on Telegram : https://t.me/eragyoza