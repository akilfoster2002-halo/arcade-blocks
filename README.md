# Arcade — ten classic games, a few blocks each

A bare-bones arcade cabinet built on the same block framework as Bug Squad / Dino Run (MESACS 0.2a).
Pick a game from the row of icons, press **▶ RUN** (or Enter), and open **▦ BLOCKS** (or click any
character) to read the code that makes it work. Every rule is in blocks; change a number and run again.
**↺** puts a game's code back. EN / ES.

| # | Game | Stripped down to |
|---|---|---|
| 1 | 🏓 Pong | two paddles (W/S, ↑/↓), a ball that bounces, a point when it gets past |
| 2 | 🐍 Snake | moves on a grid, arrows turn, apple makes the tail longer (tail = clones that wait, then vanish); the wall resets |
| 3 | 🧱 Breakout | bat, ball, one row of 7 bricks |
| 4 | 👾 Space Invaders | cannon, one row of 6 invaders marching side to side, laser |
| 5 | 🟨 Tetris | only the O-piece: falls, ← →, stacks (a landed piece is a clone left behind); no rotation, no line clears |
| 6 | 🐸 Frogger | hop across a road with one car and one truck |
| 7 | 🟡 Pac-Man | Pac-Man, one dot, Blinky gliding after you; no maze walls inside |
| 8 | 🪨 Asteroids | ship flies with arrows (no rotation), one rock drifting and wrapping, shots |
| 9 | 🐝 Galaga | fighter, three bees that swoop down at you |
| 10 | 🐛 Centipede | 8 segments, each turning and dropping at walls and mushrooms; shoot segments and mushrooms |

## Play it online

- **https://arcade-blocks.onrender.com** (its own Render site, redeploys on every push to
  github.com/akilfoster2002-halo/arcade-blocks)
- **https://mesacs-0-2.onrender.com/6/**

Worked on in MESACS_0.2 (`6/`); update the arcade repo with `git subtree push --prefix=6 arcade main`.

Run locally: `python3 -m http.server 8798` in this folder, or open `index.html`.
