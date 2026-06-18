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


---

## RESOLVED: /deposit blocker was NOT Vercel — it was a one-line import bug

The stale-bundle symptom (same bundle hash across commits, even on no-cache redeploys and immutable per-deployment URLs) had a simple root cause: in App.tsx the Deposit page was imported with the WRONG path:

  import Deposit from "./pages/Wallet";   // BUG: alias Deposit pointed at the Wallet module

So the /deposit route rendered <Deposit /> which actually WAS the Wallet component, and Deposit.tsx was never referenced (tree-shaken out). Because the real source the bundler saw never changed, Vite produced the identical content hash every build — which looked like a frozen Vercel cache but wasn't.

Fix (commit 7250c59): changed the import to ./pages/Deposit. New bundle index-CcNcfBtm.js now contains the Deposit code and https://jango-us-new.vercel.app/deposit renders the real Add Funds page (crypto BTC/ETH/SOL/USDC selector, amount input + quick chips, Generate Deposit Address CTA, Card/App coming-soon, trust badges). Verified live, interaction works (Bitcoin select -> form), zero console errors. Vercel pipeline is healthy; no account/settings changes were needed.

Lesson: when a bundle hash never changes despite "changed" source, suspect that the source the bundler actually compiles is unchanged (dead/aliased imports) before suspecting the host's build cache.

## STEP 4 STATUS: Deposit DONE (live). Moving to STEP 5 (games playable vs bot).


---

## STEP 5 (games) — audit + first fixes

Audited all 15 games live on jango-us-new.vercel.app/games/<name>. ALL 15 load with ZERO console errors and render proper intro/board screens: minigolf, connect4, rps, dotsboxes, chess, eightball, airhockey, bowling, basketball, football, stacktower, blockblast, tron, cupking, racing. Each has engine.ts (+ chess/minigolf have bot.ts/holes.ts). The codebase was in far better shape than earlier notes implied — none were broken.

Real defect found + fixed: Mini Golf used undefined CSS vars --neon / --neon-2 (7 refs in minigolf.css) for its selected-difficulty pill and Start Match button. Those vars don't exist in the design system, so the gradients collapsed to transparent -> the 'Medium' label and the 'Start Match' button text (dark #04101a on transparent) were INVISIBLE, and the game looked unstartable. Fix (commit 52d2117): defined --neon:#00E5FF and --neon-2:#2D9CFF on .mg-wrap (cyan family, matching existing rgba(0,229,255) shadows). Now buttons render with the cyan gradient.

Verified live AFTER fix: Mini Golf — buttons visible; Start Match launches the canvas (400x560) with green course, hole+flag, wood obstacles, ball; drag-back-release shoots (stroke counter incremented You:1); You/Bot scorecard + Hole 1/3 Par 2 HUD; bot opponent present. Connect Four — goes straight to a 7x6 board, dropping a disc works and the bot replies with its own disc (turn alternation + AI confirmed). Both marquee games are genuinely PLAYABLE vs bot with on-brand visuals.

Game route pattern: /games/<name>. Only minigolf.css used the bad tokens; the other 14 CSS files use correct design-system tokens (which is why they rendered fine).

Remaining Step-5 polish (TODO, no blockers): spot-play the other 13 to confirm each bot loop end-to-end; check mobile/touch responsiveness; ensure win/lose end screens are on-brand. NO real-time multiplayer / wager / escrow (needs backend + owner decisions).


---

## Phase 1 + Phase 2 kickoff — Forensic audit + Arena atmosphere (autonomous)

### Phase 1: Forensic deep-dive of live old site (READ-ONLY reference)
Extracted REAL computed tokens from html.dark and wrote /docs/OLD_SITE_AUDIT.md. Key findings:
- Base bg #0D0E12; display font "Space Grotesk" (hero H1 = 700 / 82px / -2.05px tracking); body Inter; mono JetBrains.
- Premium feel comes from a ~9-layer ARENA ATMOSPHERE: base vertical gradient (#070912 -> #0b0d19 -> #0d0e12) + 4 drifting radial glows (blue/purple/pink/indigo, .05-.09 alpha) + subtle blue GRID overlay (rgba(60,131,246,.024) 1px) + central spotlight (70% 55% at 50% 40%) + bottom vignette.
- Game cards are per-game color-coded (border <hue>/.3, bg <hue>/.10, radius 12px, hover box-shadow glow). Primary CTA = solid blue with colored drop-shadow glow.

### Gap diagnosis (old vs current new build)
- Current new build had ZERO animated atmosphere layers and 0 @keyframes => read as flat/dated. That was the #1 cause of the "looks 15 years older" problem.

### Phase 2 (started): global design-system atmosphere + juice primitives
- Upgraded src/index.css: richer 6-layer arena background, body::before blue grid overlay (masked), body::after spotlight+vignette with arenaGlowDrift animation. Tightened heading tracking to -.02em/700.
- Added reusable JUICE primitives: .j-hover-lift, .j-glow-pulse, .j-float, .j-fade-up, .j-pop, .j-grad-text (animated gradient text), .j-skeleton, plus keyframes; prefers-reduced-motion respected.
- LIVE & verified: arenaGlowDrift active, grid 64px, spotlight rendering, zero console errors. Atmosphere depth now visibly present on landing.

### Next
- Apply .j-* primitives + per-game color-coded cards across Arena grid and all pages.
- Rebuild Play page to exact match (perspective floor, carousel, glowing icon, gradient pill PLAY, mode chips).
- Continue Phase 1 capture of authed Dashboard/Play/Shop/Settings as login allows.

Commits: OLD_SITE_AUDIT.md (create), index.css (arena atmosphere + juice primitives).


---

## UI/UX parity pass — Dashboard, Nav, Settings, global Toast system

### Dashboard polish (dashboard.css)
- Added hover-lift + radial glow + number text-glow to .stat-card; hover-lift to .feature-card and .game-card.
- Gradient .btn-grad now has spring press (translateY/scale) + colored glow; .btn-outline hover tint. Reduced-motion respected.

### Navigation polish (Layout.css)
- .tnl active state now shows a glowing gradient underline; hover lifts + accent tint.
- .balance-pill (Scaps) and .avatar-btn glow on hover; dropdown items slide on hover.

### Settings
- Audited live: already comprehensive (Account/Security/Notifications/Gameplay/Wallet/Privacy/Social/Appearance/Game Modes/Danger Zone), iOS-style toggles, sliders, segmented controls — modern & clean.
- IMPROVEMENT: wired "Save Changes" to a success toast ("Settings saved successfully"). Verified live.

### Global Toast system (reusable) — NEW
- UI.tsx: added toast(msg,type) event-based helper + <Toaster/> (types: success/error/info/reward). No provider needed.
- UI.css: toast styles with per-type colored glowing icon, slide-in animation, mobile full-width, reduced-motion.
- App.tsx: mounted <Toaster/> once globally.
- VERIFIED end-to-end on /settings save (green ✓ toast bottom-right, zero console errors).

### Game lobby (earlier this pass)
- Per-game hue (--gh) drives colored hover glow + top-highlight bar + art zoom on each card (old-site match). Fixed clipped PLAYABLE badge.

### Next (in order)
- Wallet/Scaps UI (balance, add/withdraw placeholders, mock tx history, gated real-money notice, toast on actions).
- Rankings/RankTrack dopamine pass. Shop (5-tier Scaps pricing + buy/equip toasts). Tournaments flow. Then Training/Social/Profile/Story/Admin. Mobile pass throughout.

Reusable primitives now available everywhere: .j-hover-lift/.j-glow-pulse/.j-fade-up/.j-pop/.j-grad-text/.j-skeleton + toast().
