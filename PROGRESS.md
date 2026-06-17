# Jango.US-New - Build Progress Log

Rebuild to match the old site (jangous-jangous-pr-1.up.railway.app). Live: https://jango-us-new-beaurolaks-projects.vercel.app/

## Context / decisions
- The /docs/JANGO_BUILD_SPEC.md and /docs/jango-play-reference.html in the brief are NOT in the repo. Used the full spec text from chat + real tokens extracted from the live old site's computed CSS.
- Old site needs sign-in for app pages, so tokens were pulled from its :root/.dark custom properties + rendered gradients (authoritative).
- No backend wired: all pages use stub/mock data.
- CSS strategy: ONE design-system layer in src/index.css (tokens + .ds-* primitives); per-page CSS files compose from it.

## Extracted tokens (real, from old site)
- bg 222 18% 6%, fg 0 0% 98%, card 222 15% 10%, border 0 0% 18%, muted 222 12% 16%, muted-fg 0 0% 48%
- primary(blue) 217 91% 60%, secondary(purple) 270 75% 65%, accent(pink) 320 85% 60%, success 142 80% 50%, warning 38 92% 55%, destructive 0 85% 62%
- radius .5rem; fonts Inter / Space Grotesk / JetBrains Mono
- ambient bg: radial blue(.08) top-left + purple(.07) top-right + pink(.05) bottom over linear #070912 -> #0b0d19 -> #0d0e12
- hero gradient #FF2D78 -> #FF6A2C -> #FF3D3D; neon amber logo glow

## Done (committed + verified live)
- [x] Design system rewritten in src/index.css: tokens + .ds-card, .ds-btn-gradient, .ds-chip (color-coded modes), .ds-grad-text, .ds-glow-ring, .ds-arena-floor, .ds-vignette, neon .jango-logo override
- [x] PLAY page rebuilt (Play.tsx + play.css): perspective arena floor, ambient glows + vignette, rotating game carousel (glow-ring 3D icon + gradient title + dots), glowing gradient PLAY pill with play icon, color-coded mode chips, player card, bottom status strip. Verified live, 0 console errors.
- [x] Global shell: neon JANGO logo now renders in top nav (verified). Nav/dropdowns/bell/balance/avatar/footer already existed and work.
- [x] Wallet rebuilt (Wallet.tsx + wallet.css) with .ds-card depth: balance card w/ glow, mini-stats, Performance grid, transactions w/ colored in/out icons, trust strip, 18+ responsible-gaming note. Verified live.

## Audited - already high quality (no change needed)
- Shop: rarity cards w/ colored glows, featured banner, tabs, countdown - on brand.
- Social, Settings, Dashboard, Leaderboard, Tournaments, Clans, Battle Pass, Rank Progression, Training: built in prior sessions, render on-brand.

## IMPORTANT process note (cost me 2 silent failures)
- GitHub commit dialog must be FULLY rendered before clicking 'Commit changes' - if you click during its fade-in animation the click misses and the commit silently does NOT happen. Always wait ~2s, screenshot, then click, then VERIFY via the contents API (size/content changed).
- The web CodeMirror editor TRUNCATES files >~4KB on load; never append - always full-rewrite via execCommand, or use a fresh per-page file.

## Remaining
- [ ] Profile: audit for flatness; apply .ds-card depth if needed.
- [ ] Deposit page (/deposit) per spec 5.12 (crypto options, trust badges).
- [ ] Sweep remaining pages for any flat sections; align to design system.
- [ ] Stretch: games load + playable vs simple bot; TODOs for multiplayer/escrow.

## Blockers needing your input
- Real-time multiplayer + wager/escrow + auth need backend decisions (reuse Railway backend vs new). Not attempted per brief.

## Update 2026-06-17

### Done
- Built standalone **/deposit** page (Deposit.tsx + deposit.css) matching the design system:
  crypto deposit options (BTC/ETH/SOL/USDC) with color-coded coin tiles, amount input + quick amounts,
  Generate Deposit Address CTA, Card/App payments marked Coming Soon, trust badges (Secure/Instant/Protected),
  Min $1.00 / Max $10,000 limits, and 18+ responsible-gaming legal footer with spending-limit links.
- Wired the /deposit route in App.tsx to the new Deposit component (was previously aliased to Wallet).
- Fixed a TSX build error (inline `as React.CSSProperties` casts) by introducing a typed `toneStyle()` helper.

### BLOCKER (needs your input) -- Vercel build serving a STALE bundle
- All Deposit source is correct and committed to main (Deposit.tsx, deposit.css, App.tsx route).
- `tsc -b && vite build` PASSES (deployments show Ready/Production).
- HOWEVER: every production deployment since commit abb8624 (`Create profile.css`) keeps serving the
  SAME old JS bundle `index-B4GQ8QYq.js`, which contains the earlier Play/Wallet/Profile rebuilds but
  NOT the Deposit page. Verified on the canonical domain AND on the immutable per-deployment URLs, so it
  is not browser/edge cache -- the built dist/ itself references the old bundle.
- Tried: 3 fresh commits + a no-build-cache Redeploy. Vercel reports each as Ready/Current but the output
  never changes (bundle hash never updates despite real source changes).
- Likely a Vercel build-cache / project-settings issue restoring a cached dist/. Resolving it touches
  account/project settings (build cache purge, or reconnect Git), which I am not making changes to without
  your go-ahead.
- SUGGESTED FIXES (your call): in Vercel project Settings, (1) clear/disable Build Cache and redeploy, or
  (2) Settings > Git -> disconnect & reconnect the repo, or (3) check the Production Branch / Root Directory
  is set to main / repo root. Once the pipeline rebuilds, /deposit will render correctly with zero code changes.
