# Todo

- fix extended funding: api returns 403 when the `?market=` url is over ~2.1k chars (~124 markets), registry now has ~330
  - fetch `/info/markets` without filter and filter locally, or chunk the requests
- search bar keywords
- vari swaps: not listed
  - indexes: `US500S`, `US100S`, `US30S`, `US2KS`, `US400S`, `USFNGS`, `CNA50S`, `TWIS`, `VXIP`, `DXIP`
  - commodities: `XAUS`, `XAGS`, `COPPP`, `USOILP`, `UKOILP`, `HOILP`, `GASOLP`, `COCOAP`
- collateral/fx handling: pairs not listed because they are quoted in non-USD with no fx conversion
  - QFEX: `SAMSUNG-KRW`, `SKHYNIX-KRW`, `HYUNDAI-KRW`, `KIOXIA-JPY`, `SOFTBANK-JPY`, `CXMT-CNY`, `UNITREE-CNY`, `SIVE-SEK`
- add history

## AI listings tracker

every day, jules redoes the full listings check from master and opens a new PR with every pending update. that PR recaps the previous one, which then gets closed.

### Decided

- **agent:** jules, started through its api. gemini cli does not support google ai plus, and antigravity cli only runs headless with credentials from an interactive login
- **quota:** 15 jules sessions per day. messages and PR comments don't count
- **trigger:** a github actions cron starts 1 session per day, at 04:00 UTC
- **full job:** every run compares every live pair of every dex with master, never only the day's new listings. no delta, no snapshot, no lock
- **one new PR per run:** always, even if nothing changed. it recaps the previous listings PR, which then gets closed
- **memory:** the daily workflow gives the previous listings PR to the new session, which writes the recap (steps 2 and 4). after a merge there is no previous PR: move the lasting `Standing decisions` into `daily-listings-prompt.md` by hand
- **review:** in the github mobile app. an `@Jules` comment makes jules push a commit to the same PR
- **other people's comments:** jules says it only acts on comments from repo collaborators. not tested, accepted
- **later:** telegram, swapping jules for codex or claude code

### Steps

#### 0. jules setup: done

- jules github app installed on the repo
- `JULES_API_KEY` in the github actions secrets and in `.env`

#### 1. spike: done

- left: close PR #2, delete the branches `hyperliquid-live-count-3407452927553309859` and `jules-spike-4-hyperliquid-perp-4792587438740880025`

#### 2. write `scripts/listings/daily-listings-prompt.md`: done

- left: push it to master, where step 4's sessions read it

#### 3. write `.github/workflows/listings-supersede.yml`

closes the previous listings PR when a new one opens.

- trigger: `pull_request` of type `opened`, title starting with `listings:`
- `gh pr close --delete-branch` every other open `listings:` PR, with the comment `Superseded by #N`. permissions: `pull-requests: write`, `contents: write`
- match on the title: jules opens PRs under `Eraguzy` and names the branches itself
- merge it before the first daily run
- **output:** at most one open listings PR

#### 4. write `.github/workflows/listings-daily.yml`

starts the daily jules session.

- triggers: `schedule` with cron `0 4 * * *`, and `workflow_dispatch` for manual runs
- collect the previous open `listings:` PR with `gh`, authenticated by `github.token`:
  - its number: `gh pr list --state open --json number,title`, keep the title starting with `listings:`
  - its body: `gh pr view N --json body`
  - its diff: `gh pr diff N`
  - its comments and reviews: `gh api` on `repos/Eraguzy/arbies/issues/N/comments`, `repos/Eraguzy/arbies/pulls/N/reviews` and `repos/Eraguzy/arbies/pulls/N/comments`. keep only those whose `user.login` is `Eraguzy` or `google-labs-jules[bot]`
- the prompt, in this order:
  1. `Follow scripts/listings/daily-listings-prompt.md.`
  2. with a previous PR, this context: `Below is the previous listings PR #N, opened by the previous run. Eraguzy's comments are corrections to that run: apply all of them in this run, whether the previous session applied them or not. The comments by google-labs-jules[bot] are the previous session's replies.`
  3. then that PR's body, diff, comments and reviews, each under its own heading
  4. without a previous PR: `No previous listings PR.`
- one request: `POST https://jules.googleapis.com/v1alpha/sessions`, header `x-goog-api-key` from the `JULES_API_KEY` secret. build the body with `jq` so the text is escaped:

```json
{
  "title": "listings: daily check",
  "prompt": "<the prompt above>",
  "sourceContext": {
    "source": "sources/github/Eraguzy/arbies",
    "githubRepoContext": { "startingBranch": "master" }
  },
  "automationMode": "AUTO_CREATE_PR"
}
```

- fail the job if the response is not 200. log only the session id: the repo is public, so its logs are too
- the job doesn't wait for jules: the PR comes by email
- github disables scheduled workflows in public repos after 60 days without activity. re-enable it from the actions tab
- **output:** 1 session per day, so 1 `listings:` PR per day

#### 5. end-to-end test

1. run `listings-daily.yml` manually: PR A
2. comment `@Jules <correction>` on A: a commit lands on A
3. run it again: PR B
4. check: B's title starts with `listings:`, B starts with `Recap of #A` and includes the correction, A is closed with `Superseded by #B`
5. merge B from the github app once its vercel check is green: vercel deploys master
