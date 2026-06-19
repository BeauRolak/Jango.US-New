# Jango.US — Game QA Log

Per-game functional integrity tracking for Track P. "Done" = the game can be
played fully, start to finish, vs a bot, with zero broken states. Loop logic is
verified by deterministic headless tests (no foreground browser needed); visual
feel / physics-tuning / mobile-touch polish still needs foreground QA on the live
site and is called out explicitly below.

## Harness note

In the automation browser the game tab is treated as `document.hidden = true`, so
`requestAnimationFrame` and `setInterval` are throttled to ~0 — a real-time canvas
playthrough cannot be observed there. The fix: the loop/turn/hole/score/win logic
is extracted into a PURE, rAF-free state machine (`match.ts`) that is driven by
deterministic tests (`match.test.ts`). This proves correctness without watching
frames. Look/feel still needs a real foreground browser.

---

## Mini Golf — loop VERIFIED (code + tests). Feel: needs foreground QA.

### What was wrong
- The bot aimed straight at the cup every shot with no obstacle awareness. On
  hole 2 (index 1) the walls fully block the straight line, so the cup was
  unreachable by a straight aim. The MORE accurate the bot, the worse it did:
  measured medium/hard bots failed to sink hole 2 in 200+ strokes — an effective
  soft-lock (the match could never end vs medium/hard).
- Earlier work had already fixed React state-machine hazards (side effects inside
  setState updaters, stale closures in the rAF loop): commits fa609bc, 558a7ee.

### What was fixed this pass
- `bot.ts` rewritten as a LOOK-AHEAD bot (commit ebd1692): it simulates a coarse
  grid of candidate shots against the real physics and picks one that sinks the
  ball or gets it closest to the cup, then applies difficulty-scaled jitter.
  Result: every hole is sinkable by every difficulty in a sane stroke count.
- `match.ts` added (commit e7e6d0d): a pure, framework-free state machine for the
  whole loop — phases aiming -> rolling -> settling -> hole-done -> match-over,
  pure turn/hole/score/win/rematch transitions, and a MAX_ROLL_TICKS safety cap
  so a stuck ball can never hang the match. No React, no rAF, no wall-clock.
- `match.test.ts` added (commit afffe63): headless integration tests that drive
  the loop deterministically (seeded RNG).

### P4 checklist (verified via headless tests + measurement)
1. Loads without blank/error state — PASS (live, prior sessions; 0 console errors).
2. Ball physics settle (never stuck) — PASS (MAX_ROLL_TICKS safety cap forces rest).
3. Bot always takes its turn (no soft-lock) — PASS (test: bot took >=1 shot every
   pairing/seed; turn passes via afterSettle, never waits forever).
4. Sub-round / hole advances — PASS (test: all 3 holes visited every run).
5. Score accumulates correctly — PASS (test: totals equal scorecard sum).
6. Final hole produces a scorecard — PASS (test: holeScores.length === HOLES.length).
7. Win condition reachable — PASS (test: human win found, hard vs easy).
8. Loss condition reachable — PASS (test: human loss found, easy vs hard).
9. Result screen resolves a winner (you/bot/tie) — PASS (test: winner always decided).
10. Rematch fully resets, no carry-over — PASS (test: holeIdx/scores/strokes/done/
    turn/phase/winner/matchOver all reset).
11. Obstacle-nav regression — PASS (test: hole 2 sinkable by easy/medium/hard < 40
    strokes; previously medium/hard failed at 200+).

Run the tests: `npx tsx src/games/minigolf/match.test.ts`

### Still needs foreground QA (cannot verify in hidden-tab automation)
- Visual feel at 60fps, drag-aim trajectory smoothness, sink/celebration polish.
- Mobile touch (drag-to-aim, lift-to-shoot) on a real device.
- That the live MiniGolf.tsx render loop matches the tested match.ts behavior
  frame-for-frame. FOLLOW-UP: refactor MiniGolf.tsx to consume match.ts directly
  so the shipped game and the tested logic are literally the same code (currently
  match.ts mirrors the component's logic; sharing it removes any drift risk).

---

## Next games (Track P queue)
- Pool (eightball): apply look-ahead bot + pure-loop + headless test pass.
- One more (Connect Four already alternates turns correctly vs bot — candidate for
  a quick loop test; or Air Hockey for a second physics game).
