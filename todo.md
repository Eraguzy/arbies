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

every day, claude redoes the full listings check from master and opens a new PR with every pending update. that PR recaps the previous one, which then gets closed.

### Decided

- **agent:** claude code github action `anthropics/claude-code-action@v1`, on the github runner. jules is read-only after 2026-11-11 and closes on 2026-12-31. gemini cli does not support google ai plus, and antigravity cli only runs headless with credentials from an interactive login
- **trigger:** a github actions cron at 04:00 UTC
- **full job:** every run compares every live pair of every dex with master, never only the day's new listings. no delta, no snapshot, no lock
- **one new PR per run:** always, even if nothing changed. it recaps the previous listings PR, which then gets closed
- **memory:** the daily workflow gives the previous listings PR to the new run, which writes the recap. after a merge there is no previous PR: move the lasting `Standing decisions` into `daily-listings-prompt.md` by hand
- **review:** in the github mobile app. an `@claude` comment makes claude push a commit to the same PR
- **who can trigger claude:** only users with write access to the repo
- **later:** telegram

### Files

- `scripts/listings/daily-listings-prompt.md`: done. the rules claude follows on every run
- `.github/workflows/listings-supersede.yml`: done. closes every older open `listings:` PR when a new one opens, with the comment `Superseded by #N`
  - left: push it to master before the first daily run
- `.github/workflows/listings-daily.yml`: todo. the daily run
  - triggers: `schedule` with cron `0 4 * * *`, and `workflow_dispatch`
  - collects the previous open `listings:` PR with `gh`, authenticated by `github.token`:
    - its number: `gh pr list --state open --json number,title`, keep the title starting with `listings:`
    - its body: `gh pr view N --json body`
    - its diff: `gh pr diff N`
    - its comments and reviews: `gh api` on `repos/Eraguzy/arbies/issues/N/comments`, `repos/Eraguzy/arbies/pulls/N/reviews` and `repos/Eraguzy/arbies/pulls/N/comments`. keep only those whose `user.login` is `Eraguzy` or `claude[bot]`
  - runs `anthropics/claude-code-action@v1` with this `prompt`, in this order:
    1. `Follow scripts/listings/daily-listings-prompt.md.`
    2. with a previous PR: `Below is the previous listings PR #N, opened by the previous run. Eraguzy's comments are corrections to that run: apply all of them in this run, whether the previous session applied them or not. The comments by claude[bot] are the previous session's replies.`
    3. that PR's body, diff, comments and reviews, each under its own heading
    4. without a previous PR: `No previous listings PR.`
  - allows in `claude_args` the commands the prompt needs: `curl`, `node`, `npm`, `git`, `gh`. bash is off by default
  - never pushes to master: claude works on a new branch
  - the PR must not be opened with `GITHUB_TOKEN`, or `listings-supersede.yml` doesn't run
  - github disables scheduled workflows in public repos after 60 days without activity. re-enable it from the actions tab
- `.github/workflows/listings-claude.yml`: todo. the replies
  - triggers: `issue_comment`, `pull_request_review_comment` and `pull_request_review` containing `@claude`
  - claude rereads the PR, pushes commits to its branch and replies in a comment
  - on a `listings:` PR, claude follows `daily-listings-prompt.md`

### Setup

- github: install the claude github app on the repo
- github: add the secret `CLAUDE_CODE_OAUTH_TOKEN`, made by `claude setup-token` and valid one year, or `ANTHROPIC_API_KEY`. to choose
- jules: delete `JULES_API_KEY` from the github secrets and `.env`, uninstall the jules github app
- nothing runs on claude.ai

### Test

1. run `listings-daily.yml` manually: PR A
2. comment `@claude <correction>` on A: a commit lands on A
3. run it again: PR B
4. check: B's title starts with `listings:`, B starts with `Recap of #A` and includes the correction, A is closed with `Superseded by #B`
5. merge B from the github app once its vercel check is green: vercel deploys master
