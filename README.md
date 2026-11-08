# House Haul

Move an entire dollhouse through a miniature city. Pull rooms off at checkpoints, choose a low/wide or tall/slim passage, keep useful room functions and deliver as much of the home as possible. Six finite deliveries across Maple Block, Copper Quay and Neon Avenue, a human driver and residents, articulated swaying room stacks, recoverable room removal, three real upgrades and best-only delivery rewards.

## Controls

Hold and drag horizontally on the scene or the large Drive button to steer and move. Release to brake. At automatic fit checkpoints, pull a visible room away (a tap also works), or use Left Wing / Top Floor / Right Wing. Removing a room removes the stack above it. Undo restores the most recent removal operation. The central bottom steering room is protected, so every route remains recoverable.

Green Low / Slim buttons show actual fit, not a guessed success cue. Choose a green gate, then hold Drive. The carrier aligns through that portal before returning steering to the player. On keyboard use Left/Right and hold Space; Enter selects a fitting portal. Escape pauses.

Garage rooms improve steering/grip. A retained gym or purchased springs automatically hops over pits. Fans or the rotor resist crosswind. Magnet pickups work across both lanes. Roads also contain avoidable barriers; bumps can shake an upper room loose. Kept rooms, collected coins and a clean drive determine delivery value. The delivery target and a bump-free route determine gold stars.

## Progress and rewards

The best payout for each route is banked. An improved replay pays only the difference; viewing/reloading a result cannot repeatedly grant currency. Wallet = sum of best payouts minus the cost of permanent fitted kits. Purchases require actual stars and coins. Magnet / Springs / Rotor have visible geometry and real controller effects. Cobalt paint is earned at six stars or by an optional confirmed GameWave like. A crew flag is earned at twelve stars or by an optional confirmed new direct comment. No real money, purchases, prizes, gambling or interaction gates.

Only `house-haul-v1` is read locally. Best medals, payouts, delivered-room records, kits, cosmetics and the active route's room IDs, position, gate, pickups, undo and hazard history save. Restored deliveries are safely parked: held steering, speed and midair animation do not resume automatically. The next real movement or room manipulation starts the restored host session. Original Jawbreaker Yard files, namespace, saves and repository are untouched.

## Run and build

`index.html` and `standalone.html` are identical, self-contained offline entries containing Three.js, all game code and CSS. They do not require a server, SDK, login, fonts, CDN or network. `index-source.html` is the modular entry and should be served with a static HTTP server. `node build.cjs` rebuilds both offline aliases. `node tests.mjs` checks complete slim routes at 30/60/120Hz, alternate low routes, actual room/kit effects, gate commitments, economy, saves and optional SDK behavior.

All game art is original procedural geometry, generated signs and an original SVG icon. The cover is an actual game-rendered screenshot. Generic original mesh and seated-driver helpers and synthetic sound primitives are adapted from our Jawbreaker Yard. No AI-generated images, third-party game models, reference media, source exports or claims of a commercial one-to-one port. Three.js r147 is bundled with its separate MIT notice. Load sway, room removals and debris are an arcade simulation, not a general-purpose rigid-body or structural engineering engine. Six finite routes are replayable; no endless campaign is claimed.

Rendering uses merged scenery, cached meshes, a DPR cap of 1.5 (Light: 1), no real-time shadow maps and bounded debris. Browser viewport tests are not a physical-phone FPS certification.

## GameWave

Official document rechecked November 8, 2026, displaying October 30 revision: https://rg975ojk5z.feishu.cn/wiki/MQg7wMknzieOkukxyWVc4UB0nDh . Gameplay starts without `window.neonlib`. Each optional API is independently guarded, asynchronous failures/timeouts are contained and late APIs can connect. Real accepted drive/room/portal actions start one host session; an actual delivery ends it once. Pausing, reading menus and restoring a parked checkpoint do not fabricate starts or finishes. Abandoning an active trip before selecting another ends that visit.

Only the recognized `{game:'house-haul',v:1,profile}` cloud envelope is merged. Best results/payouts merge monotonically; kit flags are unioned with one derived purchase cost. An active local checkpoint takes precedence. Unknown or rejected cloud data is not overwritten. No other game's localStorage is enumerated, uploaded or cleared.

`onLike` and `onComment` use successful async registrations and SDK-returned unsubscribe functions, including late completion cleanup. Callback fields are read directly: nonempty string project ID, positive like status, direct comment content string (including an empty image-only comment). Unlike and count snapshots do not grant rewards. Explicit saved reward flags guard duplicates. These are browser/recognized-cloud scoped cosmetic claims, not server exactly-once identity verification. Optional prompts appear in the workshop without delaying play or moving a pending Resume button. Viewport width/height are validated separately from density metadata.

Controller/static checks, SDK mocks, native local-browser tests and published-browser checks are separate evidence. Actual GameWave App/import/account/callbacks, physical handsets and platform grading have not been certified.

## License

Original code and procedural assets: MIT, copyright 2026. Permission is granted free of charge to use, copy, modify, merge, publish, distribute, sublicense and sell copies, provided this notice is retained. The software is provided AS IS, without warranty. Third-party Three.js retains its own license in `vendor/THREE-LICENSE.txt`.
