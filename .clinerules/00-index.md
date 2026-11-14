# Cline Rules Index — OUTARCH

**Version:** 2026-11-07
**App repo:** `D:\Downloads\Mission-Control-2.19.0-Full-App-UI-Redesign\nvkh-main` (git repo)
**Canonical memory:** `../docs/OUTARCH_PROJECT_MEMORY.md`

## How to use this

1. Read `docs/OUTARCH_PROJECT_MEMORY.md` first for the full picture. It is the
   authoritative migrated record of the Claude Code memory (source: 53 Markdown
   notes dated 2026-08-31 → 2026-09-26).
2. Then read the rule file for the domain you are changing.
3. **Every dated claim may be stale.** The notes are a 2026-09 snapshot; the repo
   has moved on (Dodo Payments live, version 2.19.1). Re-read the current source
   before acting on a number (test counts, CSS ceilings, prices, store IDs).

## Rule files

| File | Covers |
|---|---|
| `architecture-and-naming.md` | Electron/React/Ink topology, OUTARCH vs `mission-control` identifiers, userData move, project-memory file rules |
| `ui-ux-decisions.md` | Obsidian palette, single theme, cascade authority, CSS ratchets, property seams, canvas/dialog/composer/first-run decisions, visual sign-off rule |
| `testing-and-baselines.md` | 986/986 baseline @2026-09-26, source-string test coupling, CSS ceilings, LF/CRLF trap, visual harness + fixtures |
| `build-and-packaging.md` | Node floor 22.12, MSIX/Store pipeline, asar:false + RunAsNode, VSIX packager, brand assets, launchers |
| `services-auth-payments-mobile.md` | Supabase schema/migrations, plan enforcement, AI key pools, Cashfree→Dodo, assistant workbench, notifications, mobile companion, website |
| `do-not-repeat.md` | Rejected/reverted work, non-negotiable user rules, secrets policy, outstanding user obligations |

## The five rules that override everything else

1. **Never test-message a BYOK model.** It spends the user's money.
2. **Never ship a visual change without rendered proof** — show screenshots and
   get an explicit "yes, better" before the next increment.
3. **Never state a capability the code doesn't have.** False privacy/feature
   claims were the user's most repeated complaint.
4. **Never add a new renderer stylesheet or spend `!important` budget** — the
   ratchets sit at zero headroom.
5. **Never read, copy, or commit credentials, keys, tokens, or `settings.json`.**
