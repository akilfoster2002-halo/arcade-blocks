# Arcade — ten classic games, every rule in blocks

A bare-bones arcade cabinet built on the MESACS 0.2a block framework (same editor as Bug Squad /
Dino Run). The menu (`index.html`) shows a card per game, drawn from the game's own sprites. A card
opens `play.html?g=<id>`: the machine's title screen, **Enter** (or a click) to start, and
**GAME OVER** when the lives run out. **▦ BLOCKS** (or clicking any character) shows the code that
makes it work — every rule is in blocks. **↺** puts a game's code back. EN / ES.

Each game uses the original machine's screen shape and pixel sprites (1 art pixel = 1 arcade pixel,
8 pixels = 1 square), so it looks like the real thing.

| # | Game | What the blocks do |
|---|---|---|
| 1 | 🏓 Pong | you (↑ ↓) vs. a computer paddle; the hit spot sets the angle; each hit is faster; first to 11 |
| 2 | 🐍 Snake | grid steps; can't reverse; apple = +1 length (body = clones that live `length` steps); wall or self = game over |
| 3 | 🧱 Breakout | 8 rows of 14 bricks (7/5/3/1 points); paddle angle; walls and roof; 3 balls |
| 4 | 👾 Space Invaders | 55 invaders march on a beat that speeds up as they die, drop at the edges, bomb you; 4 bunkers that erode; one shot at a time; mystery ship |
| 5 | 🟦 Tetris | NES rules: 7 pieces, rotation, hold-to-slide, soft drop, line clears, 40/100/300/1200 × level, speed by level, top-out |
| 6 | 🐸 Frogger | 5 lanes of traffic, 5 river lanes of logs and turtles you ride (water kills), 5 bays (a filled bay kills), edges kill |
| 7 | 🟡 Pac-Man | the real maze, 240 dots + 4 energizers, Pac-Man keeps moving and buffers turns, 4 ghosts (Blinky chases hardest), blue ghosts, tunnel |
| 8 | 🪨 Asteroids | rotate, thrust and drift (no brakes), wrap-around, rocks split big → medium → small; waves start at 3 rocks and add one each wave, up to 8; the ship comes back only when the middle is clear |
| 9 | 🐝 Galaga | 40-ship formation that sways; dives that fire at you; boss Galagas take two hits; stages |
| 10 | 🐛 Centipede | 12-segment centipede turns at mushrooms and walls; a shot segment becomes a mushroom (so it splits); mushrooms take 4 hits; spider |

How it is built:

- `costumes.js` — every sprite (with animation frames, facing, palettes) and the Pac-Man maze.
- `games.js` — each game's screen size, scenery, cast, block code, score display and title screen.
- `vm.js` — the block language. Two changes for the arcade: `point in direction` is Scratch's
  compass (0 up, 90 right), and a *hidden* object's `repeat` runs in one go (so a hidden template
  lays out 112 bricks or 240 dots instantly).

## Play it online

- **https://arcade-blocks.onrender.com** (its own Render site, redeploys on every push to
  github.com/akilfoster2002-halo/arcade-blocks)
- **https://mesacs-0-2.onrender.com/6/**

Worked on in MESACS_0.2 (`6/`); update the arcade repo with `git subtree push --prefix=6 arcade main`.

Run locally: `python3 -m http.server 8798` in this folder, or open `index.html`.
