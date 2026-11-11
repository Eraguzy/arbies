# Listings check

Keep Arbies' pair registries in sync with the perps live on every dex. Every run does the whole check from master: every live pair of every dex, not only the day's new listings.

## Steps

1. For every dex in `AllDexes` in `lib/funding/dexes/arbies.ts`, fetch its live perps with the request in the Live lists table.
2. Compare them with the dex's `PairRegistry`, in its file in `lib/funding/dexes/`, and with `skipped.txt`.
3. Add the missing pairs and remove the delisted ones, following the rules below.
4. If the prompt includes the previous listings PR, carry it over as described in Previous listings PR.
5. Run `npm ci`, then `npm run typecheck`, and fix every error your edits caused.
6. Open the PR described in PR.

Fetch the lists and compute the comparison with a script, not by reading the responses. Write the script outside the repository, for example in `/tmp`, so it is never committed.

## Live lists

| dex | request | symbols | keep only |
|---|---|---|---|
| Hyperliquid | `POST https://api.hyperliquid.xyz/info` with the body `{"type":"meta","dex":""}` | `universe[].name` | `isDelisted` is not `true` |
| Lighter | `GET https://mainnet.zklighter.elliot.ai/api/v1/orderBookDetails` | `order_book_details[].symbol` | `status` is `active` and `market_config.force_reduce_only` is `false`. Ignore `market_flags`: margin mode only |
| Extended | `GET https://api.starknet.extended.exchange/api/v1/info/markets` | `data[].name` | `status` is `ACTIVE` and `type` is `PERPETUAL` |
| Paradex | `GET https://api.prod.paradex.trade/v1/markets` | `results[].symbol` | `asset_kind` is `PERP` and `trading_mode` is `STANDARD` |
| Meridian | `GET https://api.meridian.xyz/v1/product` | `data[].ticker` | `status` is `ACTIVE` |
| Pacifica | `GET https://api.pacifica.fi/api/v1/info` | `data[].symbol` | `instrument_type` is `perpetual` |
| Variational | `GET https://omni-client-api.prod.ap-northeast-1.variational.io/metadata/stats` | `listings[].ticker` | `name` doesn't start with `Swap on` |
| QFEX | `GET https://api.qfex.com/md/contracts` | `data[].ticker_id` | `target_currency` is `USD` |
| 01 | `GET https://zo-mainnet.n1.xyz/info` | `markets[].symbol` | all |
| RISEx | `GET https://api.rise.trade/v1/markets` | `data.markets[].config.name` | `active` is `true` and `reduce_only` is `false` |

- On any dex, a market the API marks as reduce-only is not live, even when the table doesn't name the field.
- A pair this table filters out is not live: don't add it to `skipped.txt`. It comes back by itself if the dex lists it again.
- A dex in `AllDexes` but not in this table: find its markets endpoint in its file, use it, and say so under `Ambiguities`.
- A request that fails, or a list that is empty after filtering: leave that dex untouched and say so under `Ambiguities`. Otherwise every pair of that dex would look delisted.
- A response that says more pages exist: fetch them all.

## Mapping

- The registry key is the exact symbol from the API. The value is `ArbiesAssets.X`, or `ArbiesAssets["0G"]` for a key that starts with a digit.
- One pair per asset per dex. When a dex lists two pairs for the same underlying, keep the one with the bigger open interest and add the other to `skipped.txt`.
- Before mapping a symbol, check how the other registries map it: the same ticker can mean different assets. `SPX` is the SPX6900 memecoin, while the S&P 500 is `SPY500`. When unsure, compare prices across dexes.
- A lowercase `k`, `1000` or `1000000` prefix is a multiplier: `kPEPE` and `1000PEPE` map to `ArbiesAssets.PEPE`. An uppercase `K` belongs to the ticker: `KORU`, `KSM` and `KAITO` are real tickers.
- Extended `_24_5` markets map to the base stock: `NVDA_24_5-USD` maps to `ArbiesAssets.NVDA`.
- Add new registry lines at the end of the `PairRegistry` object.

### New assets

- Add `KEY: "KEY"` to `ArbiesAssets` in `lib/funding/assets.ts`, under `// crypto`, `// forex`, `// stocks` or `// commodities`, in alphabetical order inside that group. Don't move existing lines: the order of `ArbiesAssets` sets the order of assets in the UI.
- Quote a key that starts with a digit: `"0G": "0G"`.
- A key already taken by another asset gets a longer name: `BEAM` is the crypto, so the stock is `BEAMTHERAPEUTICS`.

## skipped.txt

- Format: a `Dex:` line with the dex's `Name`, then one `- SYMBOL: reason` line per pair in alphabetical order, and a blank line between dexes. Reuse the wording of the existing reasons.
- Only for live pairs the API can't rule out, where a judgment call decides. Never add a pair listed there to a registry.
- Add a line for:
  - Unknown underlying, like 01's `TCGXUSD`: don't guess.
  - The second pair of an underlying, as described in Mapping.
- Remove a line when its reason no longer holds.
- Justify every line you add or remove under `Added` or `Removed`.

## Removals

- A registry pair that is no longer live: remove its line.
- An asset that no registry uses anymore: remove it from `ArbiesAssets`.

## Previous listings PR

The prompt may include the previous listings PR: its body, diff, comments and reviews. That PR gets closed when yours opens, and this run starts again from master, so its corrections must be carried over:

1. Apply every correction Eraguzy asked for in its comments and reviews, even the ones the previous session already applied. Eraguzy's corrections override the rules in this file.
2. Start your PR body with `## Recap of #N`: what #N proposed, the corrections Eraguzy asked for, and what stays pending.
3. Copy the `Standing decisions` of #N word for word, then add the new ones: rules from Eraguzy's comments that apply to future runs too.

Without a previous listings PR in the prompt: no recap, and `Standing decisions` is `None`.

## PR

- Title: `listings: YYYY-MM-DD`, with the date of the run in UTC.
- Body: these `##` sections, in this order: `Recap of #N`, `Standing decisions`, `Added`, `Removed`, `Ambiguities`, `Files modified`. Write `None` in an empty section.
- `Added` and `Removed`: one line per change, grouped by dex, with the symbol and its `ArbiesAssets` key, whether the asset is new, or the `skipped.txt` reason.
- `Files modified`: each file and why.
- Open a new PR whenever master is missing a change, even one the previous PR already proposed. With nothing to change, open no PR.
- Never wait for input. Decide, then write every doubt under `Ambiguities`. Where `AGENTS.md` says to ask first, write the question under `Ambiguities` instead.
- Only edit the `ArbiesAssets` object in `lib/funding/assets.ts`, the `PairRegistry` objects in `lib/funding/dexes/*.ts`, and `skipped.txt`. Follow `AGENTS.md`.
- A typecheck error in code you didn't touch: don't fix it, list it under `Ambiguities`.
