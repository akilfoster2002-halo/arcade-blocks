/* =====================================================================
   COSTUMES — the arcade's sprites, pixel for pixel.

   Every costume is drawn the way the original machine drew it: one art
   pixel is one arcade pixel, and 8 arcade pixels are one square (one
   tile), so the games keep their real proportions. A costume may have

     frames   pictures it flips between (legs, wings, a chomping mouth)
     anim     when it flips: 'walk' while moving, 'loop' always,
              'step' once per move, 'hop' for a moment after a jump
     face     'r' or 'u': the way the art faces; the other three ways
              are turned from it and picked by the way the object moves
     views    the four ways drawn by hand (a ghost's eyes)
     hit      a box {w,h} used for touching instead of the picture
     mask     a picture used for touching instead of the art
     below    art pixels hanging below the object's position
     spin     false: never turned by `point in direction`

   Letters are colours: each costume's `pal`, then the shared palette.
   `.` is nothing. A costume's position is the middle of its bottom
   edge (or its middle, with `below` set to half its height).
   ===================================================================== */
window.COSTUMES = (function(){
  const PX = 0.125;                              // one arcade pixel, in squares
  const SCREEN = '#000000', INK = '#ffffff', PAPER = '#ffffff';
  const PAL = {
    w:'#ffffff', k:'#000000', r:'#ff2020', R:'#b81010', g:'#20e020', G:'#108a10',
    b:'#2121ff', B:'#0058f8', c:'#00ffff', C:'#3cbcfc', y:'#ffff20', Y:'#d8c020',
    o:'#ffffff', p:'#ffb8ff', P:'#ff40e0', n:'#ff9020', u:'#2121de', m:'#b040ff',
    e:'#d8d0a8', s:'#ffb8ae', t:'#a0601c', T:'#5a3410', v:'#7020b0', x:'#ffffff'
  };

  /* ============================================================ helpers */
  const A = s => s.trim().split(/\s+/);                    // a block of rows
  const flipH = a => a.map(r=>[...r].reverse().join(''));
  const flipV = a => a.slice().reverse();
  const turnL = a => { const h=a.length, w=a[0].length, o=[];               // ↺ 90°
    for(let x=w-1;x>=0;x--){ let s=''; for(let y=0;y<h;y++) s+=a[y][x]; o.push(s); } return o; };
  const turnR = a => { const h=a.length, w=a[0].length, o=[];               // ↻ 90°
    for(let x=0;x<w;x++){ let s=''; for(let y=h-1;y>=0;y--) s+=a[y][x]; o.push(s); } return o; };
  const swap = (a, map) => a.map(r=>[...r].map(ch=>map[ch]!==undefined?map[ch]:ch).join(''));
  function pad(a, w, h){
    const aw=a[0].length, ah=a.length, l=Math.floor((w-aw)/2), t=Math.floor((h-ah)/2);
    const out=[];
    for(let y=0;y<h;y++){
      const src=a[y-t];
      out.push(src===undefined ? '.'.repeat(w) : '.'.repeat(l)+src+'.'.repeat(w-aw-l));
    }
    return out;
  }
  function art(w, h, f){
    const out=[];
    for(let y=0;y<h;y++){ let s=''; for(let x=0;x<w;x++) s+=f(x,y)||'.'; out.push(s); }
    return out;
  }
  /* lay rows side by side, `gap` apart */
  const beside = (list, gap) => list[0].map((_,y)=>list.map(a=>a[y]).join('.'.repeat(gap||0)));
  /* draw straight lines into a w×h picture (for the vector games) */
  function lines(w, h, pts, ch){
    const g=Array.from({length:h},()=>Array(w).fill('.'));
    for(let i=0;i<pts.length;i++){
      let [x0,y0]=pts[i], [x1,y1]=pts[(i+1)%pts.length];
      x0=Math.round(x0); y0=Math.round(y0); x1=Math.round(x1); y1=Math.round(y1);
      const dx=Math.abs(x1-x0), dy=-Math.abs(y1-y0), sx=x0<x1?1:-1, sy=y0<y1?1:-1;
      let e=dx+dy;
      for(;;){ if(x0>=0&&y0>=0&&x0<w&&y0<h) g[y0][x0]=ch||'#';
        if(x0===x1&&y0===y1) break; const e2=2*e;
        if(e2>=dy){ e+=dy; x0+=sx; } if(e2<=dx){ e+=dx; y0+=sy; } }
    }
    return g.map(r=>r.join(''));
  }

  /* =============================================================== PONG */
  const PADDLE = Array(24).fill('####');
  const PBALL  = Array(4).fill('####');

  /* ============================================================== SNAKE */
  const S_HEAD = A(`
    ggggggg. ggggggg. gkgggkg. ggggggg. ggggggg. ggggggg. ggggggg. ........`);
  const S_BODY = A(`
    GGGGGGG. GgggggG. GgggggG. GgggggG. GgggggG. GgggggG. GGGGGGG. ........`);
  const APPLE = A(`
    ...G.... ..G..... .rr.rr.. rrrrrrr. rwrrrrr. rrrrrrr. .rrrrr.. ........`);

  /* =========================================================== BREAKOUT */
  const BRICK = Array(5).fill('x'.repeat(15));
  const BAT   = Array(4).fill('x'.repeat(16));
  const BBALL = Array(4).fill('####');

  /* ===================================================== SPACE INVADERS */
  const SQUID = [A(`
    ...##... ..####.. .######. ##.##.## ######## ..#..#.. .#.##.#. #.#..#.#`), A(`
    ...##... ..####.. .######. ##.##.## ######## .#.##.#. #......# .#....#.`)];
  const CRAB = [A(`
    ..#.....#.. ...#...#... ..#######.. .##.###.##. ########### #.#######.# #.#.....#.# ...##.##...`), A(`
    ..#.....#.. #..#...#..# #.#######.# ###.###.### ########### .#########. ..#.....#.. .#.......#.`)];
  const OCTO = [A(`
    ....####.... .##########. ############ ###..##..### ############ ...##..##... ..##.##.##.. ##........##`), A(`
    ....####.... .##########. ############ ###..##..### ############ ..###..###.. .##..##..##. ..##....##..`)];
  const CANNON = A(`
    ......#...... .....###..... .....###..... .###########. ############# ############# ############# #############`);
  const ABOOM = A(`
    ....#...#.... .#...#.#...#. ..#.......#.. ...#.....#... ##.........## ...#.....#... ..#.#...#.#.. .#...#.#...#.`);
  const CBOOM = [A(`
    .....#.......... ........#....#.. ...#..#..#...... ....#........#.. #...###..#..#... ..#####.#....... .#######..#..... ################`), A(`
    #.......#....#.. .....#.......... ..#.....#..#.... ......#......#.. ...#.##..#...... #..####......#.. ..######.#..#... ################`)];
  const UFO = A(`
    .....######..... ...##########... ..############.. .##.##.##.##.##. ################ ..###..##..###.. ...#........#...`);
  const UBOOM = A(`
    #...#..##..#...# .#..#......#..#. ..#.#.####.#.#.. ....########.... ..#.#.####.#.#.. .#..#......#..#. #...#..##..#...#`);
  const BOMB = [A(`.#. #.. .#. ..# .#. #.. .#.`), A(`.#. ..# .#. #.. .#. ..# .#.`)];
  const LASER = Array(4).fill('#');
  const CHUNK = Array(4).fill('######');

  /* ============================================================= TETRIS */
  const T_SOLID = A(`wxxxxxx. xwwxxxx. xwxxxxx. xxxxxxx. xxxxxxx. xxxxxxx. xxxxxxx. ........`);
  const T_HOLLOW= A(`wxxxxxx. xwwwwwx. xwwwwwx. xwwwwwx. xwwwwwx. xwwwwwx. xxxxxxx. ........`);
  const T_OX = [-1,0,1,0, -1,0,-1,0, -2,-1,0,1, -1,0,1,1, -1,0,1,-1, 0,1,-1,0, -1,0,0,1];
  const T_OY = [0,0,0,-1, 0,0,-1,-1, 0,0,0,0, 0,0,0,-1, 0,0,0,-1, 0,0,-1,-1, 0,0,-1,-1];
  const T_LOOK = ['a','a','a','b','c','b','c'];
  function piece(s){
    const cells=[0,1,2,3].map(i=>[T_OX[s*4+i], T_OY[s*4+i]]);
    const x0=Math.min(...cells.map(c=>c[0])), x1=Math.max(...cells.map(c=>c[0]));
    const y0=Math.min(...cells.map(c=>c[1])), y1=Math.max(...cells.map(c=>c[1]));
    const blk=T_LOOK[s]==='a'?T_HOLLOW:T_SOLID, ch=T_LOOK[s]==='c'?'z':'x';
    return art((x1-x0+1)*8, (y1-y0+1)*8, (x,y)=>{
      const cx=x0+Math.floor(x/8), cy=y1-Math.floor(y/8);
      if(!cells.some(c=>c[0]===cx&&c[1]===cy)) return null;
      const p=blk[y%8][x%8]; return p==='x' ? ch : p;
    });
  }

  /* ============================================================ FROGGER */
  const FROG = [pad(A(`
    ..g.........g.. .gg..ggggg..gg. .g..grgggrg..g. ...ggggggggg... ...gyygggyyg...
    ..ggggygygggg.. .g.gggyyyggg.g. .g..ggggggg..g. .gg..ggggg..gg. ..g...ggg...g.. .......g.......`),15,15),
    pad(A(`
    .g...........g. .gg.........gg. ..g..ggggg..g.. ....grgggrg.... ...ggggggggg... ...gyygggyyg...
    ..ggggygygggg.. ...gggyyyggg... ....ggggggg.... .....ggggg..... ....g.ggg.g.... ...gg.....gg... ...g.......g...`),15,15)];
  const SPLAT = pad(A(`
    w.............w .w.....w.....w. ..w...www...w.. ...w..www..w... ....wwwwwww.... ...wwkwwwkww...
    ...wwwwwwwww... ....wwwwwww.... .....w.w.w..... ....w.....w.... ...w.......w...`),15,15);
  const CAR = A(`
    ..ww.......ww... ..ww.......ww... .xxxxxxxxxxxxx.. xxxxxkkkxxxxxxx. xxxxkkkkxxxxxxxx xxxxkkkkxxxxxxxx
    xxxxkkkkxxxxxxxx xxxxxkkkxxxxxxx. .xxxxxxxxxxxxx.. ..ww.......ww... ..ww.......ww... ................`);
  const RACER = pad(A(`
    .ww........ww... .ww........ww... ..xxxxxxxxxxx... xxxxxxkkxxxxxxxx xxxxxxkkxxxxxxxx ..xxxxxxxxxxx... .ww........ww... .ww........ww...`),16,12);
  const DOZER = pad(A(`
    .www.....www.... .www.....www.... ..gggggggg..y... ..ggkkkgggg.y... ..ggkkkgggggy... ..ggkkkgggggy...
    ..ggkkkgggg.y... ..gggggggg..y... .www.....www.... .www.....www....`),16,12);
  const TRUCK = pad(A(`
    ..ww......ww..........ww...ww... ..ww......ww..........ww...ww... eeeeeeeeeeeeeeeeeeeeee.wwwwwww..
    eeeeeeeeeeeeeeeeeeeeee.wwwwkkww. eeeeeeeeeeeeeeeeeeeeeeewwwwkkwww eeeeeeeeeeeeeeeeeeeeeeewwwwkkwww
    eeeeeeeeeeeeeeeeeeeeeeewwwwkkwww eeeeeeeeeeeeeeeeeeeeee.wwwwkkww. eeeeeeeeeeeeeeeeeeeeee.wwwwwww..
    ..ww......ww..........ww...ww... ..ww......ww..........ww...ww...`),32,12);
  const log = w => art(w, 12, (x,y)=>{
    if(y===0||y===11) return (x>1&&x<w-2) ? 'T' : null;
    if(x===0||x===w-1) return (y>1&&y<10) ? 'n' : null;
    if(x===1||x===w-2) return 'n';
    if(x===2||x===w-3) return 'T';
    return ((x*5+y*11)%13===0 || (y===4&&x%9<4) || (y===8&&(x+4)%11<3)) ? 'T' : 't';
  });
  const TURTLE = [A(`
    ..y........y.... ...rrrrrrrr..... ..rrkkrrkkrr.... yrrrrrrrrrrrr... yrrkkrrrrkkrrgg. yrrrrrrrrrrrrggk
    yrrkkrrrrkkrrgg. yrrrrrrrrrrrr... ..rrkkrrkkrr.... ...rrrrrrrr..... ..y........y.... ................`), A(`
    .y..........y... ...rrrrrrrr..... ..rrkkrrkkrr.... .rrrrrrrrrrrr... yrrkkrrrrkkrrgg. yrrrrrrrrrrrrggk
    yrrkkrrrrkkrrgg. .rrrrrrrrrrrr... ..rrkkrrkkrr.... ...rrrrrrrr..... .y..........y... ................`)];
  const BAY = Array(16).fill('#'.repeat(16));
  const SAFE = (()=>{ const f=pad(FROG[0],16,16); return BAY.map((r,y)=>[...r].map((c,x)=>f[y][x]!=='.'?f[y][x]:c).join('')); })();

  /* ============================================================ PAC-MAN */
  function pac(open){
    return art(13,13,(x,y)=>{
      const dx=x-6, dy=y-6;
      if(dx*dx+dy*dy>42.25) return null;
      if(open && dx>0 && Math.abs(Math.atan2(dy,dx))*180/Math.PI<open) return null;
      return '#';
    });
  }
  const GBODY = A(`
    .....####..... ...########... ..##########.. .############. .############. .############.
    ############## ############## ############## ############## ############## ##############`);
  const SKIRT = [A(`##.###..###.## #...##..##...#`), A(`####.####.####  .##...##...##.`)];
  const EYE = A(`.ww. wwww wwww wwww .ww.`);
  const LOOKS = { r:[1,0,2,2], l:[-1,0,0,2], u:[0,-1,1,0], d:[0,1,1,3] };
  function ghost(f, way){
    const g=GBODY.concat(SKIRT[f]).map(r=>[...r]);
    const [sx,sy,px,py]=LOOKS[way];
    [2,8].forEach(ex=>{
      EYE.forEach((row,j)=>[...row].forEach((ch,i)=>{ if(ch==='w') g[3+sy+j][ex+sx+i]='w'; }));
      for(let j=0;j<2;j++) for(let i=0;i<2;i++) g[3+sy+py+j][ex+sx+px+i]='u';
    });
    return g.map(r=>r.join(''));
  }
  function scaredGhost(f, body, face){
    const g=GBODY.concat(SKIRT[f]).map(r=>[...r].map(c=>c==='#'?body:c));
    [[4,5],[8,5]].forEach(([x,y])=>{ for(let j=0;j<2;j++) for(let i=0;i<2;i++) g[y+j][x+i]=face; });
    [[1,10],[2,9],[3,9],[4,10],[5,10],[6,9],[7,9],[8,10],[9,10],[10,9],[11,9],[12,10]]
      .forEach(([x,y])=>g[y][x]=face);
    return g.map(r=>r.join(''));
  }
  const ghostViews = () => ({ r:[ghost(0,'r'),ghost(1,'r')], l:[ghost(0,'l'),ghost(1,'l')],
                              u:[ghost(0,'u'),ghost(1,'u')], d:[ghost(0,'d'),ghost(1,'d')] });
  /* THE MAZE, tile for tile: # wall, . dot, o energizer, space open,
     = solid (outside, or inside the ghost house), - the ghost-house door */
  const MAZE_MAP = [
    '############################',
    '#............##............#',
    '#.####.#####.##.#####.####.#',
    '#o####.#####.##.#####.####o#',
    '#.####.#####.##.#####.####.#',
    '#..........................#',
    '#.####.##.########.##.####.#',
    '#.####.##.########.##.####.#',
    '#......##....##....##......#',
    '######.##### ## #####.######',
    '=====#.##### ## #####.#=====',
    '=====#.##          ##.#=====',
    '=====#.## ###--### ##.#=====',
    '######.## #======# ##.######',
    '      .   #======#   .      ',
    '######.## #======# ##.######',
    '=====#.## ######## ##.#=====',
    '=====#.##          ##.#=====',
    '=====#.## ######## ##.#=====',
    '######.## ######## ##.######',
    '#............##............#',
    '#.####.#####.##.#####.####.#',
    '#.####.#####.##.#####.####.#',
    '#o..##.......  .......##..o#',
    '###.##.##.########.##.##.###',
    '###.##.##.########.##.##.###',
    '#......##....##....##......#',
    '#.##########.##.##########.#',
    '#.##########.##.##########.#',
    '#..........................#',
    '############################'
  ];
  const solidTile = (c,r) => {
    if(r<0||r>=MAZE_MAP.length) return true;
    const row=MAZE_MAP[r];
    if(c<0||c>=row.length) return !(row[0]===' '||row[row.length-1]===' ');   // the tunnel runs off the edge
    return '#=-'.includes(row[c]);
  };
  const MAZE_MASK = art(224,248,(x,y)=>solidTile(x>>3,y>>3)?'#':null);
  const MAZE_ART = (function(){
    const W=224, H=248;
    const open=(x,y)=>!solidTile(Math.floor(x/8), Math.floor(y/8));
    return art(W,H,(x,y)=>{
      const c=x>>3, r=y>>3;
      if(MAZE_MAP[r][c]==='-') return (y%8===5||y%8===6) ? 'p' : null;
      if(!solidTile(c,r)) return null;
      let d=99;
      for(let j=-5;j<=5;j++) for(let i=-5;i<=5;i++)
        if(open(x+i+0.5, y+j+0.5)) d=Math.min(d, Math.hypot(i,j));
      return (d>=3.5 && d<4.5) ? 'b' : null;
    });
  })();
  /* every dot and energizer, as lists the Dot and Energizer objects read */
  const DOTS={ x:[], y:[] }, POWER={ x:[], y:[] };
  MAZE_MAP.forEach((row,r)=>[...row].forEach((ch,c)=>{
    const at=ch==='.'?DOTS:ch==='o'?POWER:null;
    if(at){ at.x.push(-13.5+c); at.y.push(14-r); }
  }));
  const DOT = art(8,8,(x,y)=>(x>=3&&x<=4&&y>=3&&y<=4)?'s':null);
  const ENERGIZER = [art(8,8,(x,y)=>{ const dx=x-3.5, dy=y-3.5; return dx*dx+dy*dy<=14?'s':null; }), Array(8).fill('........')];

  /* ========================================================== ASTEROIDS */
  const SHIP = pad(A(`
    ....#.... ....#.... ...#.#... ...#.#... ..#...#.. ..#...#.. .#.....#. .#.....#. #.#####.# ##.....##`),9,18);
  const THRUST = SHIP.map((r,y)=>y===14?'...#.#...':y===15?'...#.#...':y===16?'....#....':r);
  const SHIP_MASK = art(9,18,(x,y)=>(x>=2&&x<=6&&y>=6&&y<=12)?'#':null);
  /* a rock is a jagged ring of lines; it is touched anywhere inside it */
  function rock(d, seed){
    let s=seed; const rnd=()=>{ s=(s*16807)%2147483647; return s/2147483647; };
    const pts=[], n=10, R=(d-1)/2;
    for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, k=0.72+rnd()*0.28;
      pts.push([R+Math.cos(a)*R*k, R+Math.sin(a)*R*k]); }
    const inside=(x,y)=>{ let c=false;
      for(let i=0,j=n-1;i<n;j=i++){ const [xi,yi]=pts[i], [xj,yj]=pts[j];
        if((yi>y)!==(yj>y) && x<(xj-xi)*(y-yi)/(yj-yi)+xi) c=!c; } return c; };
    const ring=lines(d, d, pts, '#');
    return { art:ring, mask:art(d,d,(x,y)=>(ring[y][x]!=='.'||inside(x,y))?'#':null) };
  }
  const ROCKS={ 3:rock(32,7), 2:rock(16,11), 1:rock(8,5) };
  const DEBRIS = [3,6,9].map(k=>art(24,24,(x,y)=>{
    const dx=x-12, dy=y-12, d=Math.hypot(dx,dy), a=Math.atan2(dy,dx);
    return (Math.abs(d-k)<0.6 && Math.round(a*4/Math.PI*2)%2===0) ? '#' : null; }));

  /* ============================================================= GALAGA */
  const FIGHTER = A(`
    ......w...... ......w...... .....www..... .....www..... ..r..www..r.. ..r.wwwww.r..
    ..wwwwbwwww.. r.wwwbbbwww.r r.wwwwbwwww.r rwwwwwwwwwwwr www.wwwww.www ww..wrwrw..ww w....r.r....w`);
  const BEE = [A(`
    ..b.......b.. .bbb.....bbb. bbbb.yyy.bbbb .bbbyyyyybbb. ...ryyyyyr... ...yrrrrry...
    ...yyyyyyy... ....rrrrr.... .....yyy..... ......y......`), A(`
    bbb.......bbb bbbb.....bbbb .bbb.yyy.bbb. ..bbyyyyybb.. ...ryyyyyr... ...yrrrrry...
    ...yyyyyyy... ....rrrrr.... .....yyy..... ......y......`)];
  const MOTH = [A(`
    w...........w ww....r....ww www..rrr..www wwwbbrrrbbwww .wwwbrrrbwww. ..wwbrrrbww..
    ...b.rrr.b... ....rr.rr.... ...r.....r...`), A(`
    ............. w.....r.....w ww...rrr...ww wwwbbrrrbbwww wwwwbrrrbwwww .wwwbrrrbwww.
    ...b.rrr.b... ....rr.rr.... ...r.....r...`)];
  const BOSS = [A(`
    .....GGGGG..... ....GGGGGGG.... ...GGyGGGyGG... ...GGGGGGGGG... ....GG.G.GG.... ..b..GGGGG..b..
    .bbb.GG.GG.bbb. bbbbbGGGGGbbbbb bbbb..GGG..bbbb bb.....G.....bb`), A(`
    .....GGGGG..... ....GGGGGGG.... ...GGyGGGyGG... ...GGGGGGGGG... b...GG.G.GG...b bb...GGGGG...bb
    bbb..GG.GG..bbb bbbbbGGGGGbbbbb .bbb..GGG..bbb. ..b....G....b..`)];
  const GSHOT = A(`.w. .w. rwr rwr .w. .w. .r.`);
  const GBULLET = A(`.w. rwr rwr .w. .r.`);
  const GBOOM = [5,9,13].map(k=>art(15,15,(x,y)=>{
    const dx=x-7, dy=y-7, d=Math.hypot(dx,dy);
    if(d>k/2+0.5) return null;
    return (x+y)%3===0 ? 'y' : (d<k/4 ? 'w' : ((x*y)%2 ? 'r' : null)); }));

  /* ========================================================== CENTIPEDE */
  const C_BODY = [A(`
    p..gg..p .pggggp. .gggggg. gggggggg gggggggg .gggggg. .pggggp. p..gg..p`), A(`
    .p.gg.p. .pggggp. pggggggp gggggggg gggggggg pggggggp .pggggp. .p.gg.p.`)];
  const C_HEAD = C_BODY.map(f=>swap(f,{g:'P'}).map((r,y)=>y===2?r.replace(/^(.)PP(..)PP/,'$1Pr$2rP'):r));
  const SHROOM = A(`..RRRR.. .RnnnnR. RnnRnnnR RnnnnnnR RRRRRRRR ..bbbb.. ..bbbb.. ...bb...`);
  const shroom = hp => SHROOM.map((r,y)=>y>=[0,3,5,6,8][hp]?'........':r);     // shot away from the bottom up
  const WAND = A(`...p... ..ppp.. .pwpwp. .ppppp. ..ppp.. .ppppp. ppppppp p.....p`);
  const DART = Array(6).fill('w');
  const SPIDER = [A(`
    .m...........m. m.m...www...m.m .m.m.wwwww.m.m. ...mmwrwrwmm... ..m.mwwwwwm.m.. .m...mmmmm...m. m.............m ...............`), A(`
    ...m.......m... ..m.m.www.m.m.. .m.m.wwwww.m.m. m..mmwrwrwmm..m ..m.mwwwwwm.m.. ...m.mmmmm.m... ..m.........m.. ...............`)];
  const CBOOM2 = [art(8,8,(x,y)=>(x+y)%2===0&&Math.hypot(x-3.5,y-3.5)<3?'w':null),
                  art(8,8,(x,y)=>(x*y)%3===0&&Math.hypot(x-3.5,y-3.5)<4.5?'r':null)];

  /* ============================================================ costumes */
  const C = {
    'pong/paddle':   { name:'Paddle', art:PADDLE },
    'pong/ball':     { name:'Ball',   art:PBALL },

    'snake/head':    { name:'Head',   art:S_HEAD, pal:{ g:'#30e030' } },
    'snake/body':    { name:'Body',   art:S_BODY, pal:{ g:'#30e030', G:'#109010' } },
    'snake/apple':   { name:'Apple',  art:APPLE },

    'break/red':     { name:'Red brick',    art:BRICK, pal:{ x:'#d83c28' } },
    'break/orange':  { name:'Orange brick', art:BRICK, pal:{ x:'#d8822a' } },
    'break/green':   { name:'Green brick',  art:BRICK, pal:{ x:'#2aa84a' } },
    'break/yellow':  { name:'Yellow brick', art:BRICK, pal:{ x:'#d8c82a' } },
    'break/paddle':  { name:'Paddle', art:BAT, pal:{ x:'#3c78ff' } },
    'break/ball':    { name:'Ball',   art:BBALL },

    'inv/squid':     { name:'Squid',   frames:SQUID, anim:'step' },
    'inv/crab':      { name:'Crab',    frames:CRAB,  anim:'step' },
    'inv/octo':      { name:'Octopus', frames:OCTO,  anim:'step' },
    'inv/boom':      { name:'Boom',    art:ABOOM },
    'inv/cannon':    { name:'Cannon',  art:CANNON, pal:{ '#':'#20ff20' } },
    'inv/cannonBoom':{ name:'Cannon boom', frames:CBOOM, anim:'loop', fps:8, pal:{ '#':'#20ff20' } },
    'inv/ufo':       { name:'UFO',     art:UFO,   pal:{ '#':'#ff2020' } },
    'inv/ufoBoom':   { name:'UFO boom',art:UBOOM, pal:{ '#':'#ff2020' } },
    'inv/laser':     { name:'Laser',   art:LASER },
    'inv/bomb':      { name:'Bomb',    frames:BOMB, anim:'loop', fps:10 },
    'inv/shield':    { name:'Shield',  art:CHUNK, pal:{ '#':'#20ff20' } },
    'inv/shieldL':   { name:'Shield corner',  art:A(`..#### .##### ###### ######`), mask:CHUNK, pal:{ '#':'#20ff20' } },
    'inv/shieldR':   { name:'Shield corner ', art:A(`####.. #####. ###### ######`), mask:CHUNK, pal:{ '#':'#20ff20' } },

    'tetris/a':      { name:'Block A', art:T_HOLLOW, pal:{ x:'#0058f8', w:'#fcfcfc' } },
    'tetris/b':      { name:'Block B', art:T_SOLID,  pal:{ x:'#0058f8', w:'#fcfcfc' } },
    'tetris/c':      { name:'Block C', art:T_SOLID,  pal:{ x:'#3cbcfc', w:'#fcfcfc' } },

    'frog/frog':     { name:'Frog',  frames:FROG, anim:'hop', face:'u', faceMin:1, pal:{ g:'#3cd83c', y:'#e8e83c', r:'#d83cd8' } },
    'frog/splat':    { name:'Splat', art:SPLAT },
    'frog/car1':     { name:'Yellow car', art:flipH(CAR), pal:{ x:'#e8e83c', w:'#e83cd8' } },
    'frog/dozer':    { name:'Bulldozer',  art:DOZER, pal:{ g:'#3cd83c' } },
    'frog/car2':     { name:'Pink car',   art:flipH(CAR), pal:{ x:'#e83cd8', w:'#e8e83c' } },
    'frog/racer':    { name:'Race car',   art:RACER, pal:{ x:'#ffffff', w:'#e83c3c' } },
    'frog/truck':    { name:'Truck',      art:flipH(TRUCK) },
    'frog/logS':     { name:'Short log',  art:log(32) },
    'frog/logM':     { name:'Log',        art:log(48) },
    'frog/logL':     { name:'Long log',   art:log(64) },
    'frog/turtle3':  { name:'Three turtles', frames:TURTLE.map(t=>beside([flipH(t),flipH(t),flipH(t)])), anim:'loop', fps:3 },
    'frog/turtle2':  { name:'Two turtles',   frames:TURTLE.map(t=>beside([flipH(t),flipH(t)])), anim:'loop', fps:3 },
    'frog/bay':      { name:'Bay',  art:BAY,  pal:{ '#':'#000047' } },
    'frog/safe':     { name:'Safe frog', art:SAFE, pal:{ '#':'#000047', g:'#3cd83c', y:'#e8e83c', r:'#d83cd8' } },

    'pac/maze':      { name:'Maze', art:MAZE_ART, mask:MAZE_MASK, pal:{ b:'#2121ff', p:'#ffb8ff' } },
    'pac/pacman':    { name:'Pac-Man', frames:[pac(50),pac(25),pac(0),pac(25)], anim:'walk', fps:16,
                       face:'r', hit:{ w:1, h:1 }, below:2.5, pal:{ '#':'#ffff00' } },
    'pac/blinky':    { name:'Blinky', views:ghostViews(), anim:'loop', fps:6, hit:{ w:1, h:1 }, below:3, pal:{ '#':'#ff0000' } },
    'pac/pinky':     { name:'Pinky',  views:ghostViews(), anim:'loop', fps:6, hit:{ w:1, h:1 }, below:3, pal:{ '#':'#ffb8ff' } },
    'pac/inky':      { name:'Inky',   views:ghostViews(), anim:'loop', fps:6, hit:{ w:1, h:1 }, below:3, pal:{ '#':'#00ffff' } },
    'pac/clyde':     { name:'Clyde',  views:ghostViews(), anim:'loop', fps:6, hit:{ w:1, h:1 }, below:3, pal:{ '#':'#ffb852' } },
    'pac/scared':    { name:'Scared', frames:[scaredGhost(0,'x','f'),scaredGhost(1,'x','f')], anim:'loop', fps:6,
                       hit:{ w:1, h:1 }, below:3, pal:{ x:'#2121ff', f:'#ffb8ae' } },
    'pac/flash':     { name:'Flashing', frames:[scaredGhost(0,'x','f'),scaredGhost(1,'X','F'),scaredGhost(0,'x','f'),scaredGhost(1,'X','F')],
                       anim:'loop', fps:6, hit:{ w:1, h:1 }, below:3, pal:{ x:'#2121ff', f:'#ffb8ae', X:'#dedeff', F:'#ff0000' } },
    'pac/dot':       { name:'Dot', art:DOT },
    'pac/energizer': { name:'Energizer', frames:ENERGIZER, anim:'loop', fps:5, mask:ENERGIZER[0] },

    'ast/ship':      { name:'Ship',   art:SHIP, mask:SHIP_MASK, below:9 },
    'ast/thrust':    { name:'Ship (thrust)', frames:[THRUST,SHIP], anim:'loop', fps:20, mask:SHIP_MASK, below:9 },
    'ast/boom':      { name:'Ship boom', frames:DEBRIS, anim:'loop', fps:6, below:12, spin:false, mask:Array(24).fill('.'.repeat(24)) },
    'ast/rock3':     { name:'Big rock',    art:ROCKS[3].art, mask:ROCKS[3].mask, below:16, spin:false },
    'ast/rock2':     { name:'Medium rock', art:ROCKS[2].art, mask:ROCKS[2].mask, below:8, spin:false },
    'ast/rock1':     { name:'Small rock',  art:ROCKS[1].art, mask:ROCKS[1].mask, below:4, spin:false },
    'ast/shot':      { name:'Shot', art:['##','##'], below:1, spin:false },

    'gal/fighter':   { name:'Fighter', art:FIGHTER, pal:{ b:'#2121ff' } },
    'gal/fboom':     { name:'Fighter boom', frames:GBOOM, anim:'loop', fps:8, mask:Array(15).fill('.'.repeat(15)) },
    'gal/bee':       { name:'Bee',       frames:BEE,  anim:'loop', fps:3, pal:{ b:'#2860ff', y:'#ffd800', r:'#ff2020' } },
    'gal/moth':      { name:'Butterfly', frames:MOTH, anim:'loop', fps:3, pal:{ w:'#ffffff', b:'#2860ff', r:'#ff2020' } },
    'gal/boss':      { name:'Boss',      frames:BOSS, anim:'loop', fps:3, pal:{ G:'#20c060', y:'#ffd800', b:'#2860ff' } },
    'gal/boss2':     { name:'Boss (hit)',frames:BOSS, anim:'loop', fps:3, pal:{ G:'#9040ff', y:'#ffd800', b:'#ff40c0' } },
    'gal/boom':      { name:'Boom', frames:GBOOM, anim:'loop', fps:10 },
    'gal/shot':      { name:'Shot', art:GSHOT },
    'gal/bullet':    { name:'Bullet', art:GBULLET },

    'cen/head':      { name:'Head', frames:C_HEAD, anim:'walk', fps:8, pal:{ P:'#ff40e0', r:'#ff2020', p:'#ff40e0' } },
    'cen/body':      { name:'Body', frames:C_BODY, anim:'walk', fps:8, pal:{ g:'#20e020', p:'#ff40e0' } },
    'cen/shroom4':   { name:'Mushroom', art:shroom(4), pal:{ R:'#ff2020', n:'#ff9020', b:'#2860ff' } },
    'cen/shroom3':   { name:'Mushroom (hit)',  art:shroom(3), mask:shroom(4), pal:{ R:'#ff2020', n:'#ff9020', b:'#2860ff' } },
    'cen/shroom2':   { name:'Mushroom (half)', art:shroom(2), mask:shroom(4), pal:{ R:'#ff2020', n:'#ff9020', b:'#2860ff' } },
    'cen/shroom1':   { name:'Mushroom (bit)',  art:shroom(1), mask:shroom(4), pal:{ R:'#ff2020', n:'#ff9020', b:'#2860ff' } },
    'cen/wand':      { name:'Shooter', art:WAND, pal:{ p:'#ff40e0' } },
    'cen/dart':      { name:'Dart', art:DART },
    'cen/spider':    { name:'Spider', frames:SPIDER, anim:'loop', fps:8, pal:{ m:'#b040ff' } },
    'cen/boom':      { name:'Boom', frames:CBOOM2, anim:'loop', fps:10 }
  };
  for(let s=0;s<7;s++) C['tetris/p'+(s+1)] = { name:'Next '+'TOIJLSZ'[s], art:piece(s),
    pal:{ x:'#0058f8', z:'#3cbcfc', w:'#fcfcfc' } };

  /* every costume, made whole: its frames, its four views, its size */
  Object.keys(C).forEach(cid=>{
    const c=C[cid];
    const frames=c.frames || [c.art];
    let views=c.views;
    if(!views && c.face==='r') views={ r:frames, l:frames.map(flipH), u:frames.map(turnL), d:frames.map(turnR) };
    if(!views && c.face==='u') views={ u:frames, d:frames.map(flipV), l:frames.map(turnL), r:frames.map(turnR) };
    if(!views) views={ r:frames, l:frames, u:frames, d:frames };
    c.views=views;
    c.base=views[c.face||'r'] || views.r;
    c.w=c.base[0][0].length; c.h=c.base[0].length;
    c.px=c.px||PX;
    c.n=c.base.length;
  });

  /* ============================================================ shelves */
  const SHELF_NAMES={ pong:'Pong', snake:'Snake', break:'Breakout', inv:'Invaders', tetris:'Tetris',
    frog:'Frogger', pac:'Pac-Man', ast:'Asteroids', gal:'Galaga', cen:'Centipede' };
  const SHELVES=Object.keys(SHELF_NAMES).map(id=>({ id, name:SHELF_NAMES[id], dir:null, thumbs:null,
    items:Object.keys(C).filter(k=>k.split('/')[0]===id).map(k=>({ file:k.split('/')[1], name:C[k].name })) }));
  const SHAPES=[];
  const id = (shelf,f) => shelf+'/'+f;
  const isModel = cid => !!C[String(cid)];
  function find(cid){
    const [sh,f]=String(cid).split('/');
    const s=SHELVES.find(x=>x.id===sh); return s ? s.items.find(x=>x.file===f)||null : null;
  }
  const nameOf = cid => C[cid] ? C[cid].name : String(cid||'');
  const thumbOf = () => null;
  const clips = () => [];
  const all = () => Object.keys(C);

  /* ============================================================ drawing */
  function colour(c, ch){
    if(c.pal && c.pal[ch]) return c.pal[ch];
    if(ch==='#') return c.ink || INK;
    return PAL[ch] || INK;
  }
  /* paint a costume onto an ordinary 2D canvas, one art pixel = `s` canvas pixels */
  function paint(ctx, cid, x, y, o){
    const c=C[cid]; if(!c) return;
    o=o||{}; const s=o.scale||1;
    const rows=(c.views[o.dir||c.face||'r']||c.base)[o.frame||0] || c.base[0];
    rows.forEach((r,j)=>{ for(let i=0;i<r.length;i++){ const ch=r[i]; if(ch==='.') continue;
      ctx.fillStyle=colour(c,ch); ctx.fillRect(x+i*s, y+j*s, s, s); } });
  }
  const texs={};
  function texture(cid, dir, f){
    const key=cid+'|'+dir+'|'+f;
    if(texs[key]) return texs[key];
    const c=C[cid], rows=(c.views[dir]||c.base)[f] || c.base[0];
    const cv=document.createElement('canvas'); cv.width=rows[0].length; cv.height=rows.length;
    paint(cv.getContext('2d'), cid, 0, 0, { dir, frame:f });
    const tex=new THREE.CanvasTexture(cv);
    tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.NearestFilter;
    tex.generateMipmaps=false;
    if(THREE.SRGBColorSpace) tex.colorSpace=THREE.SRGBColorSpace;
    return (texs[key]=tex);
  }
  const geos={};
  function geometry(cid){
    if(geos[cid]) return geos[cid];
    const c=C[cid];
    const g=new THREE.PlaneGeometry(c.w*c.px, c.h*c.px);
    g.translate(0, (c.h/2 - (c.below||0))*c.px, 0);
    return (geos[cid]=g);
  }
  function make(cid){
    const c=C[cid];
    const mat=new THREE.MeshBasicMaterial({ map:texture(cid, c.face||'r', 0), transparent:true, alphaTest:0.5 });
    const plane=new THREE.Mesh(geometry(cid), mat);
    plane.rotation.x=-Math.PI/2;                  // lying flat, top of the picture up the screen
    plane.position.y=0.02*(c.layer||1);
    const o=new THREE.Group();
    o.add(plane);
    o.userData.sprite={ cid, plane, dir:c.face||'r', frame:0, t:0, hop:0, lx:null, lz:null };
    return o;
  }
  /* A THENABLE, NOT A PROMISE: the costume is on in the same frame */
  function load(cid){
    const done={ then(ok,bad){ try{ ok && ok(make(String(cid))); }catch(e){ if(bad) bad(e); }
                               return done; },
                 catch(){ return done; } };
    return done;
  }
  /* ANIMATION: once a frame, every sprite picks its picture — which way it
     faces (the way it last moved) and which frame (legs, wings, mouth) */
  function tick(actors, dt){
    actors.forEach(a=>{
      if(!a.mesh) return;
      const o=a.mesh.children.find(k=>k.userData && k.userData.sprite);
      if(!o) return;
      const sp=o.userData.sprite, c=C[sp.cid]; if(!c) return;
      const dx=sp.lx===null?0:a.x-sp.lx, dz=sp.lz===null?0:a.z-sp.lz;
      sp.lx=a.x; sp.lz=a.z;
      const moved=Math.abs(dx)+Math.abs(dz)>1e-6;
      if(moved && Math.abs(dx)+Math.abs(dz) >= (c.faceMin||0))
        sp.dir = Math.abs(dx)>Math.abs(dz) ? (dx>0?'r':'l') : (dz<0?'u':'d');
      if(c.anim==='loop'){ sp.t+=dt; sp.frame=Math.floor(sp.t*(c.fps||4))%c.n; }
      else if(c.anim==='walk'){ if(moved){ sp.t+=dt; sp.frame=Math.floor(sp.t*(c.fps||8))%c.n; } }
      else if(c.anim==='step'){ if(moved) sp.frame=(sp.frame+1)%c.n; }
      else if(c.anim==='hop'){ if(moved && Math.abs(dx)+Math.abs(dz)>=0.5) sp.hop=0.12;
        sp.hop=Math.max(0,sp.hop-dt); sp.frame=sp.hop>0?1:0; }
      const tex=texture(sp.cid, sp.dir, sp.frame);
      if(sp.plane.material.map!==tex){ sp.plane.material.map=tex; sp.plane.material.needsUpdate=true; }
      if(c.spin===false || c.face) o.rotation.y = a.dir*Math.PI/180;        // stays upright
    });
  }

  /* ========================================================== touching */
  function rect(a){
    if(!a || !C[a.shape]) return null;
    const c=C[a.shape], px=c.px*Math.max(0.1, a.size||1);
    if(c.hit) return { x0:a.x-c.hit.w/2, y0:-a.z, x1:a.x+c.hit.w/2, y1:-a.z+c.hit.h, box:true, px:c.hit.w/4 };
    const mask=c.maskBits || (c.maskBits=bits(c.mask || c.base[0]));
    const x0=a.x - c.w*px/2, y0=(-a.z) - (c.below||0)*px;
    return { x0, y0, x1:x0+c.w*px, y1:y0+c.h*px, px, w:c.w, h:c.h, mask };
  }
  function bits(rows){
    const w=rows[0].length, h=rows.length, m=new Uint8Array(w*h);
    rows.forEach((r,j)=>{ for(let i=0;i<w;i++) if(r[i]!=='.') m[j*w+i]=1; });
    return m;
  }
  function solid(r, x, y){
    if(r.box) return x>r.x0 && x<r.x1 && y>r.y0 && y<r.y1;
    const i=Math.floor((x-r.x0)/r.px), j=Math.floor((r.y1-y)/r.px);
    if(i<0||j<0||i>=r.w||j>=r.h) return false;
    return r.mask[j*r.w+i]>0;
  }
  function touching(a, b){
    const A_=rect(a), B_=rect(b);
    if(!A_ || !B_) return null;
    if(a.visible===false || b.visible===false) return false;   // a hidden thing touches nothing
    const x0=Math.max(A_.x0,B_.x0), x1=Math.min(A_.x1,B_.x1);
    const y0=Math.max(A_.y0,B_.y0), y1=Math.min(A_.y1,B_.y1);
    if(x0>=x1-1e-9 || y0>=y1-1e-9) return false;
    if(A_.box && B_.box) return true;
    const step=Math.min(A_.px,B_.px)/2;
    for(let y=y0+step/2; y<y1; y+=step)
      for(let x=x0+step/2; x<x1; x+=step)
        if(solid(A_,x,y) && solid(B_,x,y)) return true;
    return false;
  }
  function hit(a, x, y, loose){
    const r=rect(a); if(!r) return false;
    if(x<r.x0||x>r.x1||y<r.y0||y>r.y1) return false;
    return loose ? true : solid(r,x,y);
  }

  return { SHELVES, SHAPES, isModel, load, clips, nameOf, thumbOf, all, id, find, paint, tick,
           touching, rect, hit, make, PX, INK, PAPER, SCREEN, C,
           DATA:{ DOTS, POWER, T_OX, T_OY } };
})();
