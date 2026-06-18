# Jango.US — Old Site Forensic Audit (source of truth)

Live reference: https://jangous-jangous-pr-1.up.railway.app (READ-ONLY)
Captured from rendered computed styles. Active theme: `html.dark`.

## 1. Core foundation

- Base page background: `rgb(13, 14, 18)` (#0D0E12)
- Font sans/body: Inter (weights 200–900 loaded)
- Font display/headings: "Space Grotesk", Inter, sans-serif
- Font mono: JetBrains Mono / Geist Mono
- Radius base: 0.5rem (cards use 12px = rounded-xl)
- Spacing unit: 0.25rem

### Hero H1
- font: "Space Grotesk", weight 700, size 82px, line-height 82px
- letter-spacing: -2.05px, color rgb(250,250,250)

## 2. Design tokens (dark theme, HSL triplets)

- --background: 222 18% 6%
- --foreground: 0 0% 98%
- --card: 222 15% 10%  | --card-border: 222 12% 18%
- --sidebar: 222 15% 10% | --sidebar-border: 222 15% 18%
- --primary: 217 91% 60% (blue #3C83F6) | --primary-foreground: 0 0% 100%
- --secondary: 270 75% 65% (purple) | --accent: 320 85% 60% (pink)
- --success: 142 80% 50% | --warning: 38 92% 55% | --destructive: 0 85% 62%
- --muted: 222 12% 16% | --muted-foreground: 0 0% 48%
- --border: 0 0% 18% | --input: 222 8% 30% | --ring: 217 91% 60%
- chart palette: blue / purple / green / red / amber

### Shadows
- sm: 0 1px 2px hsl(0 0% 0% / .3), 0 1px 3px hsl(0 0% 0% / .4)
- md: 0 4px 6px -1px /.4, 0 6px 10px -1px /.5
- lg: 0 10px 15px -3px /.5
- xl: 0 20px 25px -5px /.55
- 2xl: 0 25px 50px -12px /.7

## 3. THE ARENA ATMOSPHERE (the premium feel — must replicate exactly)

Layered fixed/absolute background stack over #0D0E12:

1. Base vertical gradient: linear-gradient(rgb(7,9,18), rgb(11,13,25), rgb(13,14,18))
2. Blue radial glow:   radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%) @ opacity 0.70
3. Purple radial glow: radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%) @ opacity 0.60
4. Pink radial glow:   radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%) @ opacity 0.50
5. Indigo radial glow: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%) @ opacity 0.55
6. Subtle blue GRID overlay: linear-gradient(rgba(60,131,246,0.024) 1px, transparent 1px) + 90deg variant
7. Central spotlight: radial-gradient(70% 55% at 50% 40%, rgba(60,131,246,0.055), transparent)
8. Bottom vignette: linear-gradient(to top, rgb(13,14,18), transparent)
9. Faint star dots scattered (low-opacity white points)

These glows animate/drift subtly. ~20 layered gradient nodes total.

## 4. Components

### Game card (per-game color-coded)
- class pattern: group rounded-xl border border-<color>-500/30 bg-<color>-500/10
- radius 12px, border 1px <color>/0.3, bg <color>/0.10
- transition: box-shadow 0.3s cubic-bezier(.4,0,.2,1)
- hover: ring/glow intensifies (box-shadow appears), slight lift
- each game has its own accent hue (Chess=blue, MiniGolf=green, etc.)

### Primary CTA button ("Start Playing")
- bg solid rgb(60,131,246), radius 6px, color #fff, font-weight 500, padding 0 40px
- colored glow shadow: rgba(60,131,246,0.3) 0 20px 25px -5px, rgba(60,131,246,0.3) 0 8px 10px -6px

### Ghost/text button
- transparent bg, muted text rgb(122,122,122), radius 6px

## 5. Routes / pages discovered
- Public: / (Landing: "Bet on Skill, Not Luck." hero + "The Arena" game grid), /arena-origins, /terms, /privacy, /contact
- Auth app (behind login): Dashboard, Play, Wallet/Deposit, Shop, Profile, Leaderboard, Tournaments, Clans, Battle Pass, Rank, Training, Social, Settings (sub-tabs)

### Landing game lineup (The Arena)
Chess, Mini Golf, Connect 4, Air Hockey, Rock Paper Scissors, Dots & Boxes, 8-Ball Pool, Bowling, Cup King, Stack Tower (+ more)

## TODO (continue Phase 1)
- Capture authed Dashboard/Play page atmosphere + carousel + mode chips
- Shop item modal, Tournaments/Clans modals, Settings sub-tabs
- Catalog all hover/press/transition animations + count-ups + confetti
