![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/vickythtaa-ux/gta6-trophy-guide/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/vickythtaa-ux/gta6-trophy-guide/reward.svg)

# Leonida Trophy Guide — Grand Theft Auto VI

A guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for make.fun's [Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01) bounty.

## What it does

- **Every trophy, with a real guide.** All 55 trophies with their official name, description and grade, plus a guide written for this app: what to do, where and how, and when it can be missed. Every guide cites its source beside it — and where a method is still unconfirmed, the guide says so instead of inventing one.
- **A road to the platinum.** Eight phases in the order to earn them in: the Chapter 1 meditation to do first, the story, the stranger strands, activities, collectibles, crime and money, then clean-up and the platinum.
- **A tracker that remembers.** Tick trophies off and your progress saves in localStorage. Export it to a file and import it back on another machine.
- **Filters and a spoiler setting.** Filter by story, missable, collectibles, activities or online (there are no online trophies — all 55 are offline), filter by grade, and search. The spoiler setting hides the names and descriptions of story trophies until you earn them.
- **28 hidden, 1 missable.** 28 trophies are hidden on PSN until earned; the only possibly missable one is Positive Mental Attitude, and the guide flags it.

## Run it

No build step, no network requests, desktop Chrome (or any modern browser):

```sh
node serve.ts
# then open http://localhost:8080
```

Or open `app/index.html` directly. The entry program copies `app/` and `screenshots/` to the output directory and writes `dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide itself.
- `app/data/trophies.json` — the 55 trophies: official name, description and grade, plus kind, hidden and missable flags, a guide and its source.
- `app/data/roadmap.json` — the eight phases of the road to the platinum.
- `screenshots/` — screenshots of the guide (first by name is the cover).
- `main.ts` — copies the app and screenshots to `$MAKEFUN_OUTPUT_DIR` and writes `dossier.json`.
- `serve.ts` — a tiny static server for local testing.

## Sources

Trophy names, descriptions and grades are the official PlayStation trophy list. Methods come from EGamers, Push Square, KeenGamer, PowerPyx, GTABase and TechWiser, each cited beside the guide it supports. An unofficial fan guide — not affiliated with Rockstar Games, Sony or PlayStation, and using no Rockstar artwork, logos, characters or fonts.
