# Todo

- fix extended funding: api returns 403 when the `?market=` url is over ~2.1k chars (~124 markets), registry now has ~330
  - fetch `/info/markets` without filter and filter locally, or chunk the requests
- search bar keywords
- vari swaps: not listed
  - indexes: `US500S`, `US100S`, `US30S`, `US2KS`, `US400S`, `USFNGS`, `CNA50S`, `TWIS`, `VXIP`, `DXIP`
  - commodities: `XAUS`, `XAGS`, `COPPP`, `USOILP`, `UKOILP`, `HOILP`, `GASOLP`, `COCOAP`
- collateral/fx handling: pairs not listed because they are quoted in non-USD with no fx conversion
  - QFEX: `SAMSUNG-KRW`, `SKHYNIX-KRW`, `HYUNDAI-KRW`, `KIOXIA-JPY`, `SOFTBANK-JPY`, `CXMT-CNY`, `UNITREE-CNY`, `SIVE-SEK`

## AI listings tracker

A daily github action detects new/delisted pairs, an ai agent opens a PR, review and merge happen on telegram.

- **agent:** jules (google's cloud coding agent), driven by api key. google ai plus includes "limited" jules access (exact quota unpublished; the base tier is 15 tasks/day, 3 concurrent)
- **why not gemini directly:** gemini cli does not support google ai plus, and antigravity cli headless only reuses credentials from an interactive login. neither fits github actions

### Flow

```
daily cron: open bot PR? stop -> fetch live lists -> diff vs last snapshot -> nothing new? stop
new or removed symbols -> agent start() -> PR -> telegram report
reply on telegram -> poller -> reply posted as a PR comment -> agent followUp() -> same PR updated -> telegram report (loop)
/merge on telegram -> poller -> merge -> vercel deploys master
```

### Open decisions (settle before step 2)

- **gate:** daily delta vs the last snapshot, the agent runs only when something changed (recommended)
  - or: the agent gets the full lists every day and compares them itself (1 jules task daily, less reliable)
- **replies:** poll telegram every 5 min from github actions (recommended, nothing on vercel)
  - or: a webhook route in the next app (instant, but adds a public endpoint that can merge PRs)

### Step 0 (manual, no code): jules setup

- install the jules github app on arbies (jules.google)
- create an api key at `jules.google.com/settings#api`
- **output:** `JULES_API_KEY`, added as a github actions secret and to the local gitignored `.env`
- **next:** step 1 needs it

### Step 1: spike, verify jules on plus (no repo files, throwaway branch `jules-spike`)

- **check 1:** `GET /v1alpha/sources` lists the repo. proves plus can use the api
- **check 2:** create a session with `automationMode: AUTO_CREATE_PR`, task: "curl hyperliquid meta, report the count, add one line to `skipped.txt`". proves the vm has internet access and that jules opens a PR
- **check 3:** `:sendMessage` after the PR exists ("change that line"). proves a correction lands as a new commit in the same PR
- **check 4:** the prompt says "never wait for input, put questions in the PR body". proves the session never gets stuck in `AWAITING_USER_FEEDBACK`
- **check 5:** quota. does 1 session = 1 task, do messages count (read from the jules ui if it shows usage)
- **output:** pass/fail table + sample session/activity json, then delete the spike branch and PR
- **next:** check 2 decides who fetches the live lists (the action or jules), check 3 decides the loop design, check 4 sets the prompt rules, check 5 sets the budget
- **if check 1 or 2 fails:** stop. fallback = gemini cli github action (`run-gemini-cli`) with a paid gemini api key (plus unused), then re-plan

### Step 2: live-list getters, `scripts/listings/fetch.ts` (new)

10 dexes, verified endpoints and filters, no matching, no regex:

| dex | endpoint | symbols | filter |
|---|---|---|---|
| hyperliquid | `POST https://api.hyperliquid.xyz/info` body `{"type":"meta","dex":""}` | `universe[].name` | `!isDelisted` |
| lighter | `GET https://mainnet.zklighter.elliot.ai/api/v1/orderBooks` | `order_books[].symbol` | `status "active"` and `market_type "perp"` (11 spot markets otherwise) |
| extended | `GET https://api.starknet.extended.exchange/api/v1/info/markets` | `data[].name` | `status "ACTIVE"` and `type "PERPETUAL"` (the `active` flag is true even for delisted markets) |
| paradex | `GET https://api.prod.paradex.trade/v1/markets` | `results[].symbol` | `asset_kind "PERP"` (9k+ options otherwise) |
| meridian | `GET https://api.meridian.xyz/v1/product` | `data[].ticker` | `status "ACTIVE"` |
| pacifica | `GET https://api.pacifica.fi/api/v1/info` | `data[].symbol` | `instrument_type "perpetual"` |
| variational | `GET https://omni-client-api.prod.ap-northeast-1.variational.io/metadata/stats` | `listings[].ticker` | no filter |
| qfex | `GET https://api.qfex.com/md/contracts` | `data[].ticker_id` | no filter |
| 01 | `GET https://zo-mainnet.n1.xyz/info` | `markets[].symbol` | no filter |
| risex | `GET https://api.rise.trade/v1/markets` | `data.markets[].config.name` | `active` |

- **output:** `live.json` = `{ "lighter": ["BTC", ...], ... }` plus an error field per dex, so one dead api does not block the others
- **test:** run locally. every dex returns a list with no error, and every live pair is either in a registry or in `skipped.txt`
- **constraint:** tsconfig includes `**/*.ts`, so vercel's `next build` typechecks this file. it must compile, and the scripts must not import each other (`.ts` imports need a tsconfig change)
- **next:** step 3 diffs it

### Step 3: daily run, `.github/workflows/listings-daily.yml` + `scripts/listings/agent.ts` + `scripts/listings/prompt.md` (new)

- **triggers:** daily cron + manual run (`workflow_dispatch`) with mode `delta` | `full`
- `agent.ts` hides the agent behind 2 functions, so it can be swapped later (see [swapping agents later](#swapping-agents-later-codex-claude-code)):
  - `start(task) => { pr, reply }`: the agent edits the code and opens a PR, or opens none and says why
  - `followUp(pr, message) => { reply }`: the agent adds commits to that PR's branch and returns its answer
  - jules version: start = create session on master + poll until done + read the PR url from `outputs`. followUp = `:sendMessage` + poll until idle + read the reply from activities
- **sequence:**
  1. an open PR labeled `listings-bot` exists: stop. this is the lock. it replaces the 6h idea: jules keeps the conversation server-side, and the PR comments keep a copy
  2. run `fetch.ts`, restore the previous `live.json` from the actions cache
  3. delta mode: added/removed symbols per dex. empty, or first run: save the snapshot, stop. full mode: the agent gets every live list (tests and audits)
  4. call `start()` with `prompt.md` + the delta
  5. label the PR `listings-bot`. jules only: post the session id as a PR comment, so `followUp()` can find the session
  6. save the new snapshot only now, so a failed run retries the same delta the next day
- **`prompt.md` contains:**
  - allowed files: `lib/funding/assets.ts` and the `PairRegistry` blocks in `lib/funding/dexes/*.ts`
  - asset conventions: grouping comments in `assets.ts`, quoted numeric keys like `ArbiesAssets["0G"]`
  - the `skipped.txt` rule: never add those pairs
  - "never wait for input": questions go in the PR body
  - fixed PR body: Added / Removed / Ambiguities / Files modified and why
  - naming the files keeps it compatible with `AGENTS.md`, which jules reads
- **output:** one PR by the agent with that body, or no PR plus the agent's reason
- **test:** manual full run, expect a PR for any missing pair
- **next:** step 4 reports this PR, step 5 finds it through the label

### Step 4: telegram report (in `agent.ts`)

- **manual:** create the bot with `@BotFather` and send it one message. the chat id is then read with `getUpdates`
- **secrets:** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- after each `start()` or `followUp()`, send: PR link, PR body, the agent's reply, the vercel preview check status, and "reply to correct, /merge, /close". cut at 4096 chars (telegram limit)
- **output:** one telegram message per agent turn
- **next:** step 5 reads the reply

### Step 5: reply poller, `.github/workflows/listings-poll.yml` (new)

- cron every 5 min. github delays scheduled runs, so expect a 5-15 min pickup
- **sequence:**
  1. no open `listings-bot` PR: exit
  2. `getUpdates`. ignore every chat except `TELEGRAM_CHAT_ID`, then ack the offset so no message runs twice (telegram stores the offset, no state file)
  3. `/merge`: squash-merge with `GITHUB_TOKEN`, only if the checks are green, then vercel deploys master. `/close`: close the PR
  4. any other text: post it as a PR comment (the PR is the memory), then call `followUp(pr, message)`
  5. send a new step 4 report with the agent's reply
- both workflows share one concurrency group, so they never race
- the repo is public, so those PR comments are public
- **output:** corrections land in the same PR, the loop runs until `/merge` or `/close`
- **next:** merge/close removes the lock. the next daily run diffs against the snapshot saved in step 3.6

### Step 6: end-to-end test

- manual full run, one correction via telegram, then `/merge`
- **expect:** a new commit in the same PR, an updated telegram report, the merge, a vercel deploy, and the poller exiting at step 5.1

### Security

- anyone can message a telegram bot. the chat id filter (step 5.2) is what stops a stranger from instructing the agent or merging
- public repo = public actions logs. log ids and states only, never message text
- secrets live only in github actions secrets and the local `.env`

### Risks

- the jules api is v1alpha, and jules is in beta with no guaranteed capacity
- github disables cron workflows in public repos after 60 days without repo activity

### Swapping agents later (codex, claude code)

- **stays the same:** `fetch.ts`, the delta gate, the PR lock, the telegram report + poller, `/merge`, `prompt.md`
- **changes:** rewrite `start()` and `followUp()` in `agent.ts`, change 1 secret
- codex cli and claude code run on the github runner: the workflow checks out the branch, runs `codex exec` or `claude -p`, then pushes and opens the PR itself
- they forget everything when the job ends, so `followUp()` resends `prompt.md` + the PR diff + the PR comment thread every turn (this is why step 5.4 posts replies as PR comments)
- claude code reads `CLAUDE.md`: add a 1-line `CLAUDE.md` containing `@AGENTS.md`
- subscription use in CI differs per vendor, check it at swap time
- switching between codex and claude code later is cheaper still (same shape)

### Planned files (all new, no existing file touched)

- `scripts/listings/fetch.ts`
- `scripts/listings/agent.ts`
- `scripts/listings/prompt.md`
- `.github/workflows/listings-daily.yml`
- `.github/workflows/listings-poll.yml`

### Refs

- jules api: https://jules.google/docs/api/reference/
- jules sessions: https://jules.google/docs/api/reference/sessions/
- jules limits: https://jules.google/docs/usage-limits/

## Ignore

- add history
