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

## Session update — Wallet, Rank Progression, Shop

- **Wallet** (/wallet): full premium mock rebuild. Fixed "Scalps" -> "Scaps" everywhere. Add Scaps / Withdraw modals with preset chips + slider, payment-method placeholders (card/bank/crypto, disabled), gated "no real money" notice, live balance + transaction updates, toast feedback on every action (processing/success/error). Mobile layout. Zero console errors.
- **Rank Progression** (/rank-progression): high-dopamine rebuild. Glowing current-rank badge, animated gradient progress bar, next-rank preview card, claimable reward cards per tier (locked/unlocked/claimed) with reward toast, pulsing tier ladder. Mobile + reduced-motion. Zero errors.
- **Shop** (/shop): rebuilt with exact 5-tier Scaps pricing (Common 5 / Uncommon 10 / Rare 15 / Epic 20 / Legendary 25). Rarity-colored glow cards + tags, preview modal (floating 3D icon), buy confirm modal, owned/equip flow, buy success (reward toast), not-enough-Scaps error toast. Created shop.css. Cosmetics only, no pay-to-win. Mobile grid. Zero errors.
- All three pages now use the shared global toast system for consistent reactive feedback.
- Verified live on jango-us-new.vercel.app with full buy/claim/deposit flows working.


## Session update — Tournaments

- **Tournaments** (/tournaments): rebuilt with Scaps (Ⓢ) branding throughout (prize pools, entry fees). Added "Completed" filter. Status badges with live-pulse animation (live/registering/upcoming/completed). Join confirmation modal showing entry fee + prize pool + field size + mock-money note + register reward toast. Bracket preview modal: full Quarterfinals -> Semifinals -> Final -> Champion tree with winners highlighted. Winner/completed card state, Watch (live) / Registered states. Created/replaced tournaments.css. Mobile + reduced-motion. Zero console errors. Verified join + bracket flows live.

### Status of confirmed priorities: Wallet ✓, Rank Progression ✓, Shop ✓, Tournaments ✓ — all live with consistent toast feedback.

## Training rebuild (Priority: Training)
Full rebuild of /training (src/pages/Training.tsx + training.css) as a real onboarding/progression system using the shared toast system.
- Training hub header with live stats: Drills mastered (count/total), Training XP, Player level.
- Animated overall-mastery progress bar (aggregates per-drill progress).
- Practice Bot Difficulty selector (Easy/Medium/Hard/Expert/Champion) with toast on change.
- Game-specific training PACKS (8-Ball Pool, Mini Golf, Chess, Air Hockey & Reflex), each with emoji, accent color, blurb, requiredLevel and a done-count badge.
- Per-drill cards: tag, game, title, desc, star difficulty, best score, per-drill progress bar.
- Drill statuses: locked / ready / in-progress / complete. Locked packs (requiredLevel > player level) render disabled with a lock badge; completed drills show 'Mastered' + Scaps reward.
- Start Training flow: opens a mock practice modal (Run Rep advances 25% each, gated 'no Scaps wagered' note, Claim Reward at 100%).
- Completion toast (+XP, success) followed by reward toast (+Scaps training credit, reward type). Difficulty + start emit info toasts; locked start emits error toast.
- Mobile-responsive grid + modal, prefers-reduced-motion support.
- FIX: first commit failed Vercel build (TS1351/TS1381) because emoji/symbol escape sequences were written literally (\u{...}) into JSX, where {...} parsed as a numeric-literal expression. Re-authored using real unicode characters; build now Ready/Production.
- Currency corrected to Scaps (old file had 'Scalps'). Zero console errors. Verified live: ran drill to 100%, claimed reward -> card flips to Mastered +10, hero XP 40->100, overall mastery 29%->42%, both toasts fired.

### Status of confirmed priorities: Wallet ✓, Rank Progression ✓, Shop ✓, Tournaments ✓, Training ✓ — all live with consistent toast feedback.

## Social / Messages rebuild
Full rebuild of /social (src/pages/Social.tsx + social.css) using the shared toast system. Three tabs: Feed, Messages, Friends.
- Feed: trending bar, post composer (empty-state error toast / posted success toast), auto-generated community posts with Like/Comment/Challenge/Share actions (each emits a toast).
- Messages: two-pane layout (conversation list + chat) on desktop. Thread list shows presence dot, last preview, time, unread badge. Chat view: header with presence status + Invite, message bubbles (me/them with timestamps), rounded composer with send button. Sending appends a bubble, updates the list preview, and fires a success toast. Opening a thread clears its unread count.
- MOBILE FIX (old site's messaging was hard to reach on mobile): at <=720px the messages view becomes single-pane and SWAPS between the conversation list and the open chat, with a back arrow in the chat header to return to the list. Verified the @media(max-width:720px) swap + .so-chat-back rules are present in the live CSSOM.
- Friends: live search filter, online/in-game/offline presence states with colored dots, 'N of M online' summary, Message (jumps to that thread in Messages tab) + Invite buttons. Invite -> 'Invited' state + reward toast. Offline friends have Invite disabled. Empty-state with clear-search when no match.
- Notification badges: Messages tab shows total unread; Friends tab shows online count.
- Currency corrected to Scaps (old file had 'Scalps'). Mobile-responsive, prefers-reduced-motion. Zero console errors. Verified live: opened Nova chat, sent a message (bubble + preview + toast), filtered friends to 'gho', invited Ghost (reward toast + Invited state).

### Status: Wallet ✓, Rank Progression ✓, Shop ✓, Tournaments ✓, Training ✓, Social ✓ — all live with consistent toast feedback.

## Profile rebuild
Full rebuild of /profile (src/pages/Profile.tsx + profile.css) using the shared toast system; carried over the strong existing structure and improved it.
- Header: glowing avatar + presence dot, username + 'You' badge, editable title, rank/level/streak/behavior-score tags, animated level XP bar with 'X to next level'.
- Stat cards: Matches, Wins (green), Losses (red), Win Rate (computed from match history).
- Match History: W/L record, per-match rows (result badge, game, vs opponent + score + time, rating delta in green/red).
- Achievements: unlocked vs locked grid (locked shows lock icon, dimmed); clicking unlocked fires a reward toast, locked fires an error toast.
- Equipped Cosmetics: rarity-colored cards (Avatar Frame / Cue Trail / Title) with a Shop link.
- Edit Profile mock modal: username + title fields, gated 'mock-only, nothing saved to a server' note, Save -> success toast (empty username -> error toast). Verified live: changed title to 'King of the Table', got 'Profile updated' toast.
- Mobile-responsive (header stacks/centers, 2-col stats, single-col grid), prefers-reduced-motion. Zero console errors.

### Status: Wallet ✓, Rank Progression ✓, Shop ✓, Tournaments ✓, Training ✓, Social ✓, Profile ✓.

## Story rebuild (cinematic Jango lore)
Full rebuild of /story (src/pages/Story.tsx + new story.css). Original branded lore (not generic filler).
- Hero: 'MARULA CITY LEGENDS' kicker, huge gradient JANGO wordmark + 'The King of the Table' subtitle, Skill/Risk/Swagger tagline, neon-framed mascot portrait (8-ball + floating crown), purple/blue glow background, 'Enter the Arena' (-> /games) + 'Pay Respects' (reward toast) CTAs.
- Pillars: Skill, Risk, Swagger, Dominance cards.
- Chapter timeline: 4 chapters (Born in the Back Rooms -> The Hustle Becomes a Craft -> Crowned at the Table -> The Arena Opens) with numbered glowing rail nodes, era labels, narrative, and concept-art placeholder areas.
- Marula City lore band with neon skyline art placeholder; finale CTA ('Your story starts now.' -> Start Competing -> /games).
- Uses react-router-dom useNavigate + shared toast. Mobile-responsive (hero stacks, pillars reflow), prefers-reduced-motion. Zero console errors.
- NOTE: Story.tsx commit briefly errored on Vercel because it imported ./story.css before that file existed; adding story.css (next commit) restored a green Ready/Production build.

### Status: Wallet ✓, Rank Progression ✓, Shop ✓, Tournaments ✓, Training ✓, Social ✓, Profile ✓, Story ✓.

---

## Visual Parity + Dopamine Pass — Page Redesign Wave

### CRITICAL ROOT-CAUSE FIX: Design tokens were undefined
pages.css referenced ~20 custom tokens (--panel, --neon, --gold, --green, --text,
--line, --text-dim, --panel-2, --blue, --purple, --amber, --grad-blue, --maxw, etc.)
that were NOT defined in any CSS file. Every page using them rendered with broken/
fallback colors — the main reason the site felt 'generic / placeholder'. Defined a full
dark-neon arena palette in index.css :root (commit b18149f). This brings the whole
app's intended palette alive at once.

### Dashboard (landing) rebuilt as competitive arena hub
- Replaced all emoji game/feature icons with the custom Icon system (Crown/Target/Dice/
  Bolt/Swords/List/Trophy/Building + Chart/Shield). ARENA/FEATURES arrays typed as IconName.
- Live StatusPill ('1,247 players online now') instead of emoji dot.
- Neon hero with animated glow backdrop, blue->purple->pink gradient headline word.
- Gradient 'Start Playing' pill (orange->pink) + outline 'View Games', glow stat cards,
  glassy game cards with hover-lift + corner glow + arrow, purple feature cards,
  ARENA ORIGINS band, final CTA, branded footer.
- Added full landing CSS to pages.css (commit 7009f34). Build Ready/Production, 0 console errors.
- Note: base Icon component takes name + SVG props only (no `size` prop) — size via CSS containers.

### Commits: d3e43d5 (Dashboard tsx), b18149f (index.css tokens), 7009f34 (landing css)

### Play Lobby rebuilt as competitive arena grid (commits 4bf53aa, 1517db3)
- Replaced single rotating carousel with a premium game-card grid (10 games).
- Each card has a color-identity hue (--hue) driving icon container, hover-lift glow, and play arrow.
- Real Icon system (Crown/Target/Bolt/Swords/List/Dice/Building), no emoji.
- Status pills (LIVE pulse / READY / NEW), difficulty chips (Easy/Medium/Advanced color-coded).
- Mode chips with icons (Casual/Ranked/vs Bot/Tournament/Private), feedback() on tap.
- Cards route to real /games/* paths. Mobile single-column grid. New play.css.

### Shop brought to new standard (commits ada54c1, 365c0ae)
- Replaced all 18 emoji (item icons + preview/equip) with real Icon system; Item.icon typed IconName.
- Kept ALL existing logic intact: balance, owned/equipped, preview modal, confirm dialog,
  buy/equip flow, not-enough-Scaps error toast, reward toast, correct Scaps pricing (5/10/15/20/25).
- shop.css: rarity-glow icon containers (color-mix on --rar) + SVG sizing for card/preview/confirm.
- Verified live: rarity-coded cards, preview modal with floating glow icon, buy/equip states. 0 console errors.

### Rankings / RankTrack brought to new standard (commits c4920df, e8b5443, ab762c2/a648673)
- RankTrack (/rank-progression): full rebuild to highest-dopamine standard matching old "Climb the Ladder".
  - Current-rank card: glowing tier-colored badge (pulse anim), ProgressGlow bar, "% to next tier".
  - Next-reward banner (links to /shop), full Rank Ladder grid (17 tiers) with YOU tag + unlocked/locked icons.
  - Reward Track: category filter chips w/ counts, reward cards with tier-gradient banners, rarity tags,
    floating icon art, Unlocked/locked status pills. All real Icon system, no emoji (was 16 emoji).
  - New ranktrack.css fully rewritten (palette tokens + color-mix + reduced-motion + mobile).
- Rankings (/rankings + /leaderboard): full rebuild to premium leaderboard matching old site.
  - Gradient headline, Rank-Progression banner, Season 1 LIVE card (StatusPill), game tabs,
    period + scope segmented toggles, filter chips, board with top-3 medals, tier-colored ratings,
    win-rate bars, YOU-highlighted row, QUICK STATS + YOUR STANDING sidebar with Play Now.
  - New rankings.css. Note: Rankings.tsx commit alone errored (css not yet present); rankings.css commit fixed it (Production Ready).
  - Verified live: both pages render, 0 console errors.
  - Minor polish TODO: leaderboard header eyebrow/subtitle layout could be widened (cosmetic, non-breaking).

## CURRENCY GATE FIX (CRITICAL) — done
- User clarified: currency is "Scalps"/"Scalp" (1 Scalp = $1 USD), NOT "Scaps". My earlier work used "Scaps" — wrong.
- Repo-wide search+replace Scap->Scalp (case-preserving: Scap/scap/SCAP) across 9 files:
  Juice.tsx, juice.css, Deposit.tsx, Shop.tsx, Social.tsx, Story.tsx, Tournaments.tsx, Training.tsx, Wallet.tsx.
  Renamed ScapsBalance->ScalpsBalance (Juice only), j-scaps-bump->j-scalps-bump (css+tsx in sync).
  Re-scanned 95 code files: 0 remaining "Scap". All 9 commits built green; latest Production Ready.
  (PROGRESS.md retains historical "Scap" in old log lines; that is documentation only.)

## Wallet / Scalps brought to new standard — done
- Surgical transform (kept all logic + 6 useState modals): Add Scalps / Withdraw / Payment Methods modals intact.
- Replaced all 8 emojis with Icon system: Lock (trust + gate), Shield (18+/real), Scale (fair play), Card, Bank.
- wallet.css: added SVG sizing for .trust-item/.wm-gate/method spans.
- Gated real-money notice intact ("Demo only — no charge will be made"; "Scalps are in-platform credits, not cash").
- Verified live: balance card, Deposited/Won/Withdrawn, Performance cards, Transactions w/ filters, Add Scalps modal. 0 console errors.

## Tournaments — DONE (queue item 1)
- Page already had polished card grid + join-confirm modal + bracket preview + winner state; brought to spec.
- Removed all 3 emoji (header trophy, register check, winner trophy) -> Icon system (Trophy, Check).
- Added Icon import; tournaments.css gets inline-svg sizing block for .trn-header/.trn-title/.trn-winner/.btn.
- Verified live: status pills (LIVE/REGISTERING/UPCOMING/COMPLETED), entry fee + prize pool in Scalps,
  join-confirm modal with gated 'mock Scalps - no real money moves' notice, Registered toast/state,
  champion 'Winner: ShadowAce' with gold Trophy icon. 0 console errors, Vercel build green.
- Commits: 751dbf5 (Tournaments.tsx emoji->Icon), 228c945 (tournaments.css icon sizing).

## Shop — DONE (queue item 2, verified to spec, no rebuild needed)
- Page already at Dashboard/Wallet bar: premium rarity cards, glow by tier, item-detail/3D-preview modal,
  buy-confirm modal w/ 'Balance after' mock update, owned/unowned/equipped states.
- Verified live: previewed Inferno Frame -> buy-confirm -> balance 117->92 (mock state), card flips to Equip;
  Classic Ring shows checked Equipped. 0 emojis (header is Gem SVG Icon), 0 console errors.
- Source confirms: not-enough-Scalps error toast + purchase success toast both present; balance state mock-only.
- Pricing matches locked tiers: Common 5 / Uncommon 10 / Rare 15 / Epic 20 / Legendary 25 Scalps. Cosmetics only.
- shop.css responsive: auto-fill grid + media queries @1200/640/420/380px. No changes required -> no commit.

## Profile — DONE (queue item 3)
- Strong layout kept (identity header, avatar+online dot, rank/level/streak pills, XP bar, 4 stat cards,
  match history W/L + rating deltas, achievements 3/6 locked/unlocked, equipped cosmetics, edit modal).
- Removed all 10 emoji -> Icon system: achievement data icons now IconName strings (Flame/Target/Trophy/
  Bolt/Crown/Medal), rendered <Icon name={a.icon as IconName}/>; locked -> <Icon name=Lock/>; streak Flame;
  Edit-Profile pencil -> Edit; modal close -> Close. Added Icon import.
- profile.css: inline-svg sizing for .pf-ach-icon/.streak/.pf-edit-btn/.pf-modal-close.
- Verified live: all icons crisp, 0 emoji, 0 console errors, Vercel green. Commits 7a6dbc (tsx), 647563 (css).
- Note (juice pass): unlocked achievement icons could get a tier color/glow for extra dopamine.


### Wave status: Dashboard, Play, Rankings/RankTrack, Wallet, Tournaments, Shop, Profile DONE + currency GATE fixed.
### Next queue: Clans/Social, Battle Pass, Settings, Training, Deposit, Story, Admin, then global shell + juice + QA.

## Premium Quality Bar Pass

### Foundation (motion + atmosphere)
- Added Jango motion system to index.css: reusable classes page-enter, section-enter, slide-in, stagger-list, motion-card, shine-sweep, motion-art, idle-glow, selected-pulse, motion-button, btn-loading, count-up, reward-pop, glow-pulse, unlock-pulse, progress-fill, modal-enter, modal-backdrop-enter, modal-icon-pop, toast-enter, nav-link underline, balance-pulse, avatar-glow, dropdown-enter.
- Added animated arena atmosphere (.j-arena): drifting blue/purple neon (jArenaDrift) + panning grid (jGridPan) + vignette, mounted globally in Layout. z-index behind content.
- All heavy motion gated behind prefers-reduced-motion. 0 console errors. Vercel green (cd2a026 index.css, 9208c7b Layout).
- Aesthetic locked: faithful blue->purple neon on near-black, executed at higher craft (deeper blacks, cleaner gradients, more depth/glass/glow).
- Scope: deep & slow. Order: foundation -> shared card/button/modal/header -> juice -> Dashboard -> Play -> Tournaments -> Shop -> Wallet -> Profile -> remaining.

### Product model + rake (Play, Tournaments)
- Play hero copy now rake-aware: 'Play Skill Games. Compete for Scalps.' / 'Skill-based 1v1 & tournaments - Winner takes the pot - 3% platform rake'. Added page-enter + stagger-list motion; premium hover/shine/press on .glaunch cards, mode chips, play button.
- Tournaments entry modal now shows Prize Breakdown: Entry fee, Total prize pool, Jango rake (3%), Winner takes (pot*0.97). Styled .trn-rake block (amber rake, gradient winner payout). Gated 'mock Scalps, no real money moves' notice kept. Verified live: 420 pool -> -13 rake -> 407 winner. 0 console errors.
- Model represented visually/structurally (entry fees, pots, 3% rake, payouts) while all money movement stays mocked per instruction.
- Commits: Play d827f4f, play.css 2e41780, Tournaments 557f0e6, tournaments.css 760a8fb. All Vercel green.

### Effects + Sounds + Haptics engine (global)
- Rewrote feedback() in Juice.tsx into full engine: playSound, triggerHaptic, triggerEffect, useFeedback hook, plus getFeedbackSettings/setFeedbackSetting.
- Sound: WebAudio synthesized premium UI tones (ui_click/ui_hover/success/error/reward_claim/purchase/equip/tournament_join/rank_up/notification). SOUND_FILES map left empty so real assets can be dropped in later (takes priority over synth). Respects sound toggle + intensity (low/normal/high volume).
- Haptics: navigator.vibrate patterns (light/medium/confirm/success/error/reward/rank_up). Respects haptics toggle, off at intensity low, fails silently if unsupported.
- Effects: reward-pop/count-up/j-pop element classes; respects prefers-reduced-motion.
- Unified feedback(kind) maps each event to sound+haptic; backward compatible with existing feedback('tap') calls.
- Settings keys in localStorage: jango_sound, jango_haptics, jango_intensity. (Settings UI wiring next.)
- Build hiccups fixed: unused FeedbackKind/settingOn (noUnusedLocals); Tone name clash -> SoundTone; AudioContext ctor typing; _ctx null guard; broke rewardPop<->feedback recursion. Final commit 7db855f Ready/green, 0 console errors.


## MEGATASK v2 (The Leap) — session start

### OPEN DECISIONS FOR BEAU (pinned — do not guess)
1. Two-currency: separate soft currency (Coins) for cosmetics vs Scalps for wagering? (Recommended: yes.)
2. Eligible jurisdictions/states for real-money play? (drives geo-compliance)
3. KYC/AML provider + thresholds (deposit? withdrawal over $X?)
4. Deposit rails: crypto only, or add card/bank on-ramp?
5. Rake: 3% everywhere or per-mode/tournament?
6. Responsible-gaming defaults (limits, reality-check cadence, cool-off length)
7. Backend plan: reuse/port Railway backend or rebuild? (gates real money, real-time PvP, KYC, geo, result validation)
8. Bonus balance + wagering-requirement multiplier?
9. VIP/loyalty/rakeback?
10. Confirm soft-currency name (Coins) + cosmetics are Coins-only.
11. PWA-first vs native apps? (Recommended: PWA-first.)
12. Promotions posture (deposit bonus / daily spin / referral) in or out for launch?
13. Admin/ops console: when, and separate app?
14. Music + mascot, or SFX-only?
15. Icon strategy: reuse old-site extracted SVGs (recommended) or fresh set?
16. Confirm exact display/headline font from old site for self-hosting.

### TRACK P — Game Functional Integrity: MiniGolf (DONE in code, see harness note)
- Full rewrite of MiniGolf.tsx turn/hole state machine (commit fa609bc), then a stale-closure fix (commit 558a7ee). Both Vercel green.
- Root causes removed that previously caused the hole-advance soft-lock:
  - Side effects (setTurn / scheduleBot / finishHole) were nested INSIDE setState updater callbacks (impure, double-invoke risk). Now: updaters are pure; all transitions run via window.setTimeout(...) and dedicated useEffects.
  - Bot turn now scheduled by a dedicated useEffect watching [turn, done, holeIdx, started, matchOver, difficulty] with re-entry guards (clearBotTimer, sunk/moving checks) so the bot ALWAYS takes its turn and never double-fires.
  - transitionRef guard prevents double advance from one settle.
  - strokesRef snapshots the live score so finishHole records correct strokes even across re-renders.
  - onBallStopped routed through onBallStoppedRef so the rAF loop (deps [hole,draw]) always calls the LATEST closure -> no stale holeIdx/score on holes 2 and 3.
  - Hole-advance flow: ball sinks (engine sets moving=false+sunk=true same step) -> onBallStopped records + setTimeout(advanceTurn,650) -> advanceTurn: if both done -> finishHole; else pass/keep turn -> finishHole records hole scores, then 900ms later either setMatchOver(true) on last hole or setHoleIdx+1 with full reset (strokes/done/turn/banner) + resetBall via useEffect([holeIdx]).
- Verified: start screen (difficulty chips + Start Match), play screen (Hole x/3, Par, You/Bot scores, felt+walls+cup+flag+ball render), input increments strokes, 0 console errors, build green.
- HARNESS LIMITATION (cannot fully auto-QA real-time canvas games): in this automation browser the game tab is treated as document.hidden=true, so requestAnimationFrame AND setInterval are throttled to ~0. The physics loop literally cannot advance frames while automated, so a full vs-bot playthrough (sink -> auto-advance hole -> final scorecard -> result) cannot be observed here. A ball mid-flight reads moving=true frozen ONLY because rAF is paused by the hidden tab; on a real visible tab the loop runs normally. The fix is verified by code logic + clean compile/deploy; full P4 playthrough QA needs a real foreground browser (Beau or a headed test run). Logged in /docs/GAME_QA.md.
- NOTE: Play grid icons are already clean inline SVGs (Chess/crown, Pool/target, etc.) — NOT emoji — contrary to the brief's assumption. Will still grep repo-wide for any emoji stragglers (Track O1) in a later batch.
