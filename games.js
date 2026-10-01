/* =====================================================================
   ARCADE — ten classic arcade games, every rule of them in blocks.

   Each game is its own little machine: its real screen shape, its real
   sprites (costumes.js), a title screen, lives, and GAME OVER. The room
   (this file) only draws the scenery and the score, and shows the title
   and GAME OVER screens; it never moves anything. Everything that moves
   is in the blocks — click any character to read its code.

   A game ends when its code says `stop all`: the room sees the game stop
   on its own and shows GAME OVER. Pressing ■ STOP goes back to the title.
   ===================================================================== */
window.BUGS = window.ARCADE = (function(){
  const $ = s => document.querySelector(s);
  const T = (s,p) => (window.t ? t(s,p) : s);
  const LANG_KEY='arcade.lang';

  /* ================================================== writing code
     Tiny builders, so a game's code below reads like the blocks do. */
  const B=(op,args,body,body2)=>{ const b={ op, args:args||{} }; if(body) b.body=body; if(body2) b.body2=body2; return b; };
  const flag    = (...body)=>({ hat:B('event.flag'), body });
  const onKey   = (k,...body)=>({ hat:B('event.key',{ k }), body });
  const onClone = (...body)=>({ hat:B('event.clone'), body });
  const recv    = (m,...body)=>({ hat:B('event.recv',{ m }), body });
  const forever = (...b)=>B('ctrl.forever',{},b);
  const IF      = (c,...b)=>B('ctrl.if',{ c },b);
  const IFELSE  = (c,a,b)=>B('ctrl.ifelse',{ c },a,b);
  const REP     = (n,...b)=>B('ctrl.repeat',{ n },b);
  const UNTIL   = (c,...b)=>B('ctrl.repeatUntil',{ c },b);
  const waitUntil = c=>B('ctrl.waitUntil',{ c });
  const wait    = n=>B('ctrl.wait',{ n });
  const stopAll = ()=>B('ctrl.stop',{ w:'all' });
  const clone   = ()=>B('ctrl.clone'), del = ()=>B('ctrl.delclone');
  const send    = m=>B('event.send',{ m }), sendWait = m=>B('event.sendWait',{ m });
  const key     = k=>B('sense.key',{ k });
  const touch   = o=>B('sense.touch',{ o });
  const count   = o=>B('sense.count',{ o });
  const timer   = ()=>B('sense.timer');
  const pos     = a=>B('motion.pos',{ a });
  const of      = (a,o)=>B('sense.posOf',{ a, o });
  const dirR    = ()=>B('motion.dir');
  const lt=(a,b)=>B('op.lt',{ a, b }), gt=(a,b)=>B('op.gt',{ a, b }), eq=(a,b)=>B('op.eq',{ a, b });
  const and=(c,d)=>B('op.and',{ c, d }), or=(c,d)=>B('op.or',{ c, d }), not=c=>B('op.not',{ c });
  const add=(a,b)=>B('op.add',{ a, b }), sub=(a,b)=>B('op.sub',{ a, b });
  const mul=(a,b)=>B('op.mul',{ a, b }), div=(a,b)=>B('op.div',{ a, b }), mod=(a,b)=>B('op.mod',{ a, b });
  const rnd=(a,b)=>B('op.random',{ a, b });
  const abs=a=>B('op.math',{ f:'abs', a }), floor=a=>B('op.math',{ f:'floor', a });
  const sin=a=>B('op.math',{ f:'sin', a }), cos=a=>B('op.math',{ f:'cos', a });
  const join=(a,b)=>B('op.join',{ a, b });
  const chg   = (a,n)=>B('motion.changeBy',{ a, n });
  const setTo = (a,n)=>B('motion.setTo',{ a, n });
  const goto  = (x,y)=>B('motion.goto',{ x, y, z:1 });
  const glide = (t,x,y)=>B('motion.glide',{ t, x, y, z:1 });
  const move  = n=>B('motion.move',{ n });
  const turn  = n=>B('motion.turn',{ a:'z', n });
  const face  = n=>B('motion.face',{ n });
  const vset  = (v_,n)=>B('data.set',{ v:v_, n });
  const vchg  = (v_,n)=>B('data.change',{ v:v_, n });
  const v     = n=>B('data.get',{ v:n });
  const item  = (n,l)=>B('list.item',{ n, l });
  const length= l=>B('list.len',{ l });
  const become= s=>B('looks.shape',{ s });
  const hide  = ()=>B('looks.hide'), show = ()=>B('looks.show');
  const D = () => window.COSTUMES.DATA;

  /* the same few lines, in many games */
  const pad = (n,w) => String(Math.max(0,Math.floor(+n||0))).padStart(w,'0');

  /* ============================================================ GAMES
     view     the machine's screen, in squares (one square = 8 pixels)
     scene    the scenery under the characters (painted, not objects)
     cast     the objects; `local` are each one's own variables
     hud      the score along the top, drawn in the arcade's own pixels */
  const GAMES=[
  /* ============================================================ 1 PONG
     Atari, 1972. Hit the ball back; where it meets your paddle decides
     the angle; every hit is a little faster. First to 11 wins. */
  { id:'pong', icon:'🏓', name:'Pong', view:{ w:32, h:24 },
    scene(P){ for(let y=-12;y<12;y+=1) P.rect(-0.125,y+0.25,0.125,y+0.75,'#ffffff'); },
    cast:[
      { name:'Left',  shape:'pong/paddle', x:-14, y:-1.5 },
      { name:'Right', shape:'pong/paddle', x:14,  y:-1.5 },
      { name:'Ball',  shape:'pong/ball',   x:0,   y:-0.25 }
    ],
    vars:{ left:0, right:0, vx:-0.2, vy:0.1, speed:0.2 },
    keys:[['↑ ↓','move']],
    code(){
      const walls=[IF(gt(pos('y'),9), setTo('y',9)), IF(lt(pos('y'),-12), setTo('y',-12))];
      const angle=p=>vset('vy', mul(sub(sub(pos('y'), of('y',p)), 1.25), 0.1));
      const serve=(who,vx)=>[vchg(who,1), goto(0,-0.25), vset('speed',0.2), vset('vx',vx), vset('vy',rnd(-0.1,0.1)), wait(1)];
      return {
      Left:[ flag(goto(-14,-1.5), forever(
        IF(key('up'),   chg('y',0.35)),
        IF(key('down'), chg('y',-0.35)),
        ...walls )) ],
      /* the computer: it follows the ball, but not quite fast enough */
      Right:[ flag(goto(14,-1.5), forever(
        IF(gt(of('y','Ball'), add(pos('y'),2)), chg('y',0.12)),
        IF(lt(of('y','Ball'), add(pos('y'),1)), chg('y',-0.12)),
        ...walls )) ],
      Ball:[ flag(vset('left',0), vset('right',0), vset('speed',0.2), vset('vx',-0.2), vset('vy',0.1),
        goto(0,-0.25), wait(1), forever(
        chg('x',v('vx')), chg('y',v('vy')),
        IF(gt(pos('y'),11.5), setTo('y',11.5), vset('vy', sub(0,v('vy')))),
        IF(lt(pos('y'),-12),  setTo('y',-12),  vset('vy', sub(0,v('vy')))),
        IF(touch('Left'),  vchg('speed',0.01), vset('vx', v('speed')), angle('Left')),
        IF(touch('Right'), vchg('speed',0.01), vset('vx', sub(0,v('speed'))), angle('Right')),
        IF(gt(v('speed'),0.45), vset('speed',0.45)),                     // top speed
        IF(gt(pos('x'),16),  ...serve('left',0.2)),
        IF(lt(pos('x'),-16), ...serve('right',-0.2)),
        IF(eq(v('left'),11),  stopAll()),
        IF(eq(v('right'),11), stopAll()) )) ]
    }; },
    hud(H,val){
      H.text(String(val.left|0),  H.X(-6), 8, '#fff', { s:4, align:'center' });
      H.text(String(val.right|0), H.X(6),  8, '#fff', { s:4, align:'center' });
    },
    title(H){ H.text('PONG', H.cx, 52, '#fff', { s:6, align:'center' });
      H.text(T('YOU')+'  ←      → CPU', H.cx, 112, '#fff', { align:'center' }); },
    over(H,val){ H.text(+val.left>=11 ? T('YOU WIN!') : T('CPU WINS'), H.cx, 84, '#fff', { s:2, align:'center', box:true }); }
  },

  /* =========================================================== 2 SNAKE
     Eat the apple, grow one longer. Hit a wall or yourself: game over.
     The body is clones: every step the head leaves one behind, and each
     one lives `length` steps. */
  { id:'snake', icon:'🐍', name:'Snake', view:{ w:32, h:24 },
    scene(P){ const c='#30e030', e=0.25;
      P.rect(-15.5-e,-11-e,15.5+e,-11,c); P.rect(-15.5-e,10,15.5+e,10+e,c);
      P.rect(-15.5-e,-11,-15.5,10,c);     P.rect(15.5,-11,15.5+e,10,c); },
    cast:[
      { name:'Snake', shape:'snake/head',  x:0, y:0, local:{ age:0 } },
      { name:'Apple', shape:'snake/apple', x:6, y:0 }
    ],
    vars:{ score:0, length:3, dx:1, dy:0, ndx:1, ndy:0 },
    keys:[['↑ ↓ ← →','turn']],
    thumb(){ return [['snake/body',-1,0],['snake/body',-2,0],['snake/body',-3,0]]; },
    code(){
      const into=(a,d,lim,s)=>IF((s>0?gt:lt)(add(pos(a),v(d)),lim), stopAll());
      return {
      Snake:[
        flag(goto(0,0), become('snake/head'), vset('score',0), vset('length',3),
          vset('dx',1), vset('dy',0), vset('ndx',1), vset('ndy',0), wait(0.5), forever(
          wait(0.08),
          vset('age',0), clone(),                  // leave a body piece behind
          sendWait('step'),                        // every piece gets a step older
          vset('dx',v('ndx')), vset('dy',v('ndy')),
          into('x','dx',15,1), into('x','dx',-15,-1), into('y','dy',9,1), into('y','dy',-11,-1),
          chg('x',v('dx')), chg('y',v('dy')),
          IF(touch('Snake'), stopAll()),
          IF(touch('Apple'), vchg('score',10), vchg('length',1), send('food')) )),
        recv('step', vchg('age',1), IF(gt(v('age'),v('length')), del())),
        onClone(become('snake/body')),
        /* you can turn, but never straight back into yourself */
        onKey('up',    IF(eq(v('dy'),0), vset('ndx',0),  vset('ndy',1))),
        onKey('down',  IF(eq(v('dy'),0), vset('ndx',0),  vset('ndy',-1))),
        onKey('left',  IF(eq(v('dx'),0), vset('ndx',-1), vset('ndy',0))),
        onKey('right', IF(eq(v('dx'),0), vset('ndx',1),  vset('ndy',0))) ],
      Apple:[
        flag(goto(6,0)),
        recv('food', goto(rnd(-15,15), rnd(-11,9)),
          UNTIL(not(touch('Snake')), goto(rnd(-15,15), rnd(-11,9)))) ]
    }; },
    hud(H,val,hi){ H.text(T('SCORE')+' '+pad(val.score,4), 8, 4, '#fff');
      H.text(T('HI')+' '+pad(hi,4), H.w-8, 4, '#fff', { align:'right' }); },
    title(H){ H.text('SNAKE', H.cx, 44, '#30e030', { s:5, align:'center' });
      H.icon('snake/head', H.cx+28, 110); for(let i=1;i<6;i++) H.icon('snake/body', H.cx+28-i*8, 110);
      H.icon('snake/apple', H.cx-56, 110); }
  },

  /* ======================================================== 3 BREAKOUT
     Atari, 1976. Eight rows of bricks — red and orange are worth more.
     Where the ball meets the paddle decides where it goes. Three balls. */
  { id:'breakout', icon:'🧱', name:'Breakout', view:{ w:30, h:32 },
    scene(P){ const g='#8c8c8c'; P.rect(-15,-16,-14,13,g); P.rect(14,-16,15,13,g); P.rect(-15,12,15,13,g); },
    cast:[
      { name:'Paddle', shape:'break/paddle', x:0, y:-14 },
      { name:'Ball',   shape:'break/ball',   x:0, y:0 },
      { name:'Brick',  shape:'break/red',    x:-13, y:8.25, visible:false, local:{ points:0 } }
    ],
    vars:{ score:0, lives:3, vx:0.1, vy:-0.2 },
    keys:[['← →','move']],
    thumb(){ const out=[]; ['red','orange','green','yellow'].forEach((c,i)=>{ for(let r=0;r<2;r++) for(let k=0;k<14;k++)
      out.push(['break/'+c, -13+2*k, 8.25-0.75*(i*2+r)]); }); return out; },
    code(){
      const rows=(look,pts,y)=>[become(look), vset('points',pts), setTo('y',y),
        REP(2, setTo('x',-13), REP(14, clone(), chg('x',2)), chg('y',-0.75))];
      return {
      Paddle:[ flag(goto(0,-14), forever(
        IF(key('left'),  chg('x',-0.4)),
        IF(key('right'), chg('x',0.4)),
        IF(gt(pos('x'),13),  setTo('x',13)),
        IF(lt(pos('x'),-13), setTo('x',-13)) )) ],
      Ball:[ flag(vset('score',0), vset('lives',3), goto(0,0), vset('vx',0.1), vset('vy',-0.2), wait(1.5), forever(
        chg('x',v('vx')), chg('y',v('vy')),
        IF(gt(pos('x'),13.75),  setTo('x',13.75),  vset('vx', sub(0,abs(v('vx'))))),     // right wall
        IF(lt(pos('x'),-13.75), setTo('x',-13.75), vset('vx', abs(v('vx')))),            // left wall
        IF(gt(pos('y'),11.5),   setTo('y',11.5),   vset('vy', sub(0,abs(v('vy'))))),     // the roof
        IF(touch('Paddle'), vset('vy', abs(v('vy'))), vset('vx', mul(sub(pos('x'), of('x','Paddle')), 0.15)),
          IF(lt(abs(v('vx')),0.05), vset('vx',0.05))),                 // never straight up
        IF(lt(pos('y'),-16), vchg('lives',-1), IF(eq(v('lives'),0), stopAll()),
          goto(0,0), vset('vx', rnd(-0.12,0.12)), vset('vy',-0.2), wait(1)),
        IF(eq(v('score'),448), stopAll()) )) ],
      Brick:[
        flag(hide(), ...rows('break/red',7,8.25), ...rows('break/orange',5,6.75),
          ...rows('break/green',3,5.25), ...rows('break/yellow',1,3.75)),
        onClone(show(), forever(IF(touch('Ball'),
          IFELSE(lt(of('y','Ball'), pos('y')), [vset('vy', sub(0,abs(v('vy'))))], [vset('vy', abs(v('vy')))]),
          vchg('score', v('points')), del()))) ]
    }; },
    hud(H,val,hi){ H.text(pad(val.score,3), 16, 4, '#fff', { s:2 });
      H.text(T('BALL')+' '+Math.min(3,Math.max(1,4-(val.lives|0))), H.w-16, 4, '#fff', { s:2, align:'right' }); },
    title(H){ const cols=['#d83c28','#d8822a','#2aa84a','#d8c82a'];
      'BREAKOUT'.split('').forEach((ch,i)=>H.text(ch, H.cx-56+i*16, 56, cols[i%4], { s:2 })); },
    over(H,val){ if(+val.score>=448) H.text(T('YOU WIN!'), H.cx, 150, '#fff', { s:2, align:'center', box:true }); else return true; }
  },

  /* ================================================== 4 SPACE INVADERS
     Taito, 1978. 55 invaders march together, step by step, and drop a
     row each time one reaches the side. The fewer there are, the faster
     they go. Hide behind the shields; watch for the mystery ship. */
  { id:'invaders', icon:'👾', name:'Space Invaders', view:{ w:28, h:32 },
    scene(P){ P.rect(-14,-13.9,14,-13.75,'#20ff20'); },
    cast:[
      { name:'Cannon', shape:'inv/cannon', x:0,   y:-12 },
      { name:'Alien',  shape:'inv/squid',  x:-10, y:7, visible:false, local:{ points:0 } },
      { name:'Laser',  shape:'inv/laser',  x:0,   y:-11, visible:false },
      { name:'Bomb',   shape:'inv/bomb',   x:0,   y:0, visible:false, local:{ live:0 } },
      { name:'Shield', shape:'inv/shield', x:0,   y:-10, visible:false },
      { name:'Ufo',    shape:'inv/ufo',    x:-15, y:10.5, visible:false }
    ],
    vars:{ score:0, lives:3, aliens:0, speed:0.25, wall:0, bx:0, by:0, alive:1, b:1, k:1 },
    lists(){ return { BX:[-10.125,-4.125,1.875,7.875],
      SX:[0,1,2,3, 0,1,2,3, 0,1,2,3, 0,3], SY:[0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3],
      SL:['inv/shieldL','inv/shield','inv/shield','inv/shieldR'].concat(Array(10).fill('inv/shield')) }; },
    keys:[['← →','move'],['SPACE','shoot']],
    thumb(){ const out=[]; [['squid',7],['crab',5],['crab',3],['octo',1],['octo',-1]].forEach(([k,y])=>{
      for(let c=0;c<11;c++) out.push(['inv/'+k, -10+2*c, y]); });
      const L=this.lists(); L.BX.forEach(bx=>L.SX.forEach((sx,k)=>out.push([L.SL[k], bx+0.75*sx, -8.5-0.5*L.SY[k]])));
      return out; },
    code(){
      const row=(look,pts,y)=>[become(look), vset('points',pts), goto(-10,y), REP(11, clone(), chg('x',2))];

      return {
      Cannon:[
        flag(goto(0,-12), become('inv/cannon'), vset('score',0), vset('lives',3), vset('alive',1), forever(
          IF(key('left'),  chg('x',-0.15)),
          IF(key('right'), chg('x',0.15)),
          IF(gt(pos('x'),12),  setTo('x',12)),
          IF(lt(pos('x'),-12), setTo('x',-12)) )),
        recv('hit', IF(eq(v('alive'),1), vset('alive',0), vchg('lives',-1), become('inv/cannonBoom'), wait(1.5),
          IF(eq(v('lives'),0), stopAll()), become('inv/cannon'), goto(0,-12), vset('alive',1))) ],
      /* the hidden Alien is the fleet's drummer: every beat, everyone marches */
      Alien:[
        flag(hide(), sendWait('wave'), forever(
          wait(div(v('aliens'),60)),
          IFELSE(eq(v('wall'),1),
            [vset('wall',0), vset('speed', sub(0,v('speed'))), sendWait('down')],
            [sendWait('march')]),
          IF(eq(v('aliens'),0), wait(1), sendWait('wave')) )),
        recv('wave', vset('aliens',55), vset('speed',0.25), vset('wall',0),
          ...row('inv/squid',30,7), ...row('inv/crab',20,5), ...row('inv/crab',20,3),
          ...row('inv/octo',10,1), ...row('inv/octo',10,-1), vset('points',0)),
        recv('march', IF(gt(v('points'),0),
          chg('x',v('speed')),
          IF(gt(pos('x'),12.5),  vset('wall',1)),
          IF(lt(pos('x'),-12.5), vset('wall',1)),
          IF(eq(rnd(1,150),1), vset('bx',pos('x')), vset('by',pos('y')), send('fire')))),
        recv('down', IF(gt(v('points'),0), chg('y',-1), IF(lt(pos('y'),-9), stopAll()))),
        onClone(show(), forever(IF(touch('Laser'),
          vchg('score',v('points')), vchg('aliens',-1), vset('points',0),
          become('inv/boom'), wait(0.25), del()))) ],
      /* one shot at a time, like the real thing */
      Laser:[
        flag(hide(), forever(IF(and(key('space'), eq(v('alive'),1)),
          goto(of('x','Cannon'),-11), clone(), waitUntil(eq(count('Laser'),1))))),
        onClone(show(), UNTIL(gt(pos('y'),13),
          chg('y',0.5),
          IF(touch('Alien'),  wait(0.02), del()),
          IF(touch('Shield'), wait(0.02), del()),
          IF(touch('Ufo'),    wait(0.02), del())), del()) ],
      Bomb:[
        flag(hide(), vset('live',0)),
        recv('fire', IF(eq(v('live'),0), goto(v('bx'),v('by')), vset('live',1), clone(), vset('live',0))),
        onClone(show(), UNTIL(lt(pos('y'),-13.5),
          chg('y',-0.25),
          IF(touch('Cannon'), send('hit'), del()),
          IF(touch('Shield'), wait(0.02), del())), del()) ],
      /* four bunkers, each built from 14 pieces listed in SX, SY and SL */
      Shield:[
        flag(hide(), vset('b',1), REP(4, vset('k',1),
          REP(14, goto(add(item(v('b'),'BX'), mul(item(v('k'),'SX'),0.75)), sub(-8.5, mul(item(v('k'),'SY'),0.5))),
            become(item(v('k'),'SL')), clone(), vchg('k',1)),
          vchg('b',1))),
        onClone(show(), forever(
          IF(touch('Laser'), wait(0.02), del()),
          IF(touch('Bomb'),  wait(0.02), del()))) ],
      Ufo:[ flag(hide(), forever(
        wait(rnd(15,25)), become('inv/ufo'), goto(-15,10.5), show(),
        UNTIL(gt(pos('x'),15), chg('x',0.1),
          IF(touch('Laser'), vchg('score',100), become('inv/ufoBoom'), wait(0.6), hide(), setTo('x',16))),
        hide())) ]
    }; },
    hud(H,val,hi){
      H.text(T('SCORE')+'<1>', 8, 8, '#fff'); H.text(T('HI-SCORE'), 88, 8, '#fff');
      H.text(pad(val.score,4), 24, 24, '#fff'); H.text(pad(hi,4), 104, 24, '#fff');
      H.text(String(Math.max(0,val.lives|0)), 8, 241, '#fff');
      for(let i=0;i<(val.lives|0)-1;i++) H.icon('inv/cannon', 24+i*16, 242);
    },
    title(H){
      H.text('PLAY', H.cx, 56, '#fff', { align:'center' });
      H.text('SPACE INVADERS', H.cx, 80, '#fff', { align:'center' });
      H.text('*'+T('SCORE ADVANCE TABLE')+'*', H.cx, 112, '#fff', { align:'center' });
      [['inv/ufo','=? '+T('MYSTERY'),-4],['inv/squid','=30 '+T('POINTS'),0],['inv/crab','=20 '+T('POINTS'),0],['inv/octo','=10 '+T('POINTS'),0]]
        .forEach(([c,s],i)=>{ H.icon(c, 60-Math.floor(COSTUMES.C[c].w/2), 128+i*16); H.text(s, 76, 128+i*16, i?'#fff':'#ff2020'); });
    }
  },

  /* ========================================================== 5 TETRIS
     Nintendo, 1989. Seven pieces, each four blocks. The hidden Block is
     the brain: it makes a piece out of four clones, moves the piece by
     telling the clones where to stand, and takes the move back if any of
     them lands on the wall or another block. A full row disappears. */
  { id:'tetris', icon:'🟦', name:'Tetris', view:{ w:32, h:28 },
    scene(P){ const f='#747474';
      P.rect(-5.5,-11.5,-5,9.5,f); P.rect(5,-11.5,5.5,9.5,f); P.rect(-5.5,-11.5,5.5,-11,f); P.rect(-5.5,9,5.5,9.5,f);
      [[-5.5,10,5.5,12],[7,6.5,15.5,12],[7,0,12.5,5.75],[7,-6,12.5,-2]].forEach(([a,b,c,d])=>{
        P.rect(a,b,c,d,f); P.rect(a+0.25,b+0.25,c-0.25,d-0.25,'#000000'); }); },
    cast:[
      { name:'Block', shape:'tetris/a',  x:-20, y:20, visible:false, local:{ kind:0, ox:0, oy:0 } },
      { name:'Next',  shape:'tetris/p1', x:9.75, y:1.5 }
    ],
    vars:{ score:0, lines:0, level:0, shape:1, next:1, px:0.5, py:8, blocked:0, landed:0,
           tick:0, move:0, turn:0, held:0, k:1, t:0, r:0, n:0, cleared:0 },
    lists(){ const d=D(); return { OX:d.T_OX.slice(), OY:d.T_OY.slice(),
      LOOK:['tetris/a','tetris/a','tetris/a','tetris/b','tetris/c','tetris/b','tetris/c'],
      POINTS:[40,100,300,1200], SPEED:[48,43,38,33,28,23,18,13,8,6,5,5,5,4,4,4,3,3,3,2] }; },
    keys:[['← →','move'],['↑','turn'],['↓','drop']],
    thumb(){ return [['tetris/p1',0.5,7],['tetris/p3',-3,-11],['tetris/p2',2.5,-11],['tetris/p4',3.5,-9],['tetris/p6',-2,-10],['tetris/p5',9.75,1.5]]; },
    code(){
      const at=l=>item(add(mul(sub(v('shape'),1),4), v('k')), l);
      const TRY=[sendWait('place'), vset('blocked',0), sendWait('check')];
      const mine=(...b)=>IF(eq(v('kind'),1), ...b);
      return {
      Block:[
        flag(hide(), goto(-20,20), vset('kind',0), vset('score',0), vset('lines',0), vset('level',0),
          vset('next', rnd(1,7)), forever(
          /* a new piece: four clones, each told where it sits in the piece */
          vset('shape', v('next')), vset('next', rnd(1,7)),
          vset('px',0.5), vset('py',8), vset('move',0), vset('turn',0),
          vset('kind',1), vset('k',1), become(item(v('shape'),'LOOK')),
          REP(4, vset('ox', at('OX')), vset('oy', at('OY')), clone(), vchg('k',1)),
          vset('kind',0),
          ...TRY, IF(eq(v('blocked'),1), stopAll()),          // no room at the top
          /* it falls until it cannot */
          vset('landed',0), vset('tick',0),
          UNTIL(eq(v('landed'),1),
            IF(not(eq(v('move'),0)), vchg('px',v('move')), ...TRY,
              IF(eq(v('blocked'),1), vchg('px', sub(0,v('move'))), sendWait('place')), vset('move',0)),
            IF(eq(v('turn'),1), vset('turn',0), IF(not(eq(v('shape'),2)), sendWait('spin'), ...TRY,
              IF(eq(v('blocked'),1), sendWait('unspin'), sendWait('place')))),
            /* hold ← or → and the piece slides on its own, like the NES */
            IFELSE(or(key('left'), key('right')), [vchg('held',1)], [vset('held',0)]),
            IF(gt(v('held'),16), vset('held',10), IF(key('left'), vset('move',-1)), IF(key('right'), vset('move',1))),
            vchg('tick',1), IF(key('down'), vchg('tick',10)),
            IF(gt(v('tick'), item(add(v('level'),1),'SPEED')), vset('tick',0), vchg('py',-1), ...TRY,
              IF(eq(v('blocked'),1), vchg('py',1), sendWait('place'), vset('landed',1)))),
          sendWait('land'),
          /* any full rows? look at the five rows the piece could reach */
          vset('cleared',0), vset('r', add(v('py'),2)),
          REP(5, vset('n',0), sendWait('count'),
            IF(eq(v('n'),10), sendWait('clear'), vchg('cleared',1)),
            vchg('r',-1)),
          IF(gt(v('cleared'),0), vchg('score', mul(item(v('cleared'),'POINTS'), add(v('level'),1))),
            vchg('lines', v('cleared')), vset('level', floor(div(v('lines'),10)))) )),
        recv('place',  mine(goto(add(v('px'),v('ox')), add(v('py'),v('oy'))))),
        recv('check',  mine(IF(touch('Block'), vset('blocked',1)),
          IF(gt(pos('x'),4.5),  vset('blocked',1)), IF(lt(pos('x'),-4.5), vset('blocked',1)),
          IF(lt(pos('y'),-11),  vset('blocked',1)))),
        recv('spin',   mine(vset('t',v('ox')), vset('ox',v('oy')), vset('oy', sub(0,v('t'))))),
        recv('unspin', mine(vset('t',v('ox')), vset('ox', sub(0,v('oy'))), vset('oy', v('t')))),
        recv('land',   mine(vset('kind',2))),
        recv('count',  IF(eq(v('kind'),2), IF(eq(pos('y'),v('r')), vchg('n',1)))),
        recv('clear',  IF(eq(v('kind'),2), IF(eq(pos('y'),v('r')), del()), IF(gt(pos('y'),v('r')), chg('y',-1)))),
        onClone(show()),
        onKey('left',  vset('move',-1)),
        onKey('right', vset('move',1)),
        onKey('up',    vset('turn',1)) ],
      Next:[ flag(forever(become(join('tetris/p', v('next'))))) ]
    }; },
    hud(H,val,hi){
      H.text(T('LINES')+'-'+pad(val.lines,3), H.X(0), H.Y(11.5)+2, '#fff', { align:'center' });
      H.text(T('TOP'), H.X(7.75), H.Y(12)+4, '#fff'); H.text(pad(hi,6), H.X(7.75), H.Y(12)+13, '#fff');
      H.text(T('SCORE'), H.X(7.75), H.Y(12)+26, '#fff'); H.text(pad(val.score,6), H.X(7.75), H.Y(12)+35, '#fff');
      H.text(T('NEXT'), H.X(9.75), H.Y(5.75)+4, '#fff', { align:'center' });
      H.text(T('LEVEL'), H.X(9.75), H.Y(-2)+4, '#fff', { align:'center' });
      H.text(pad(val.level,2), H.X(9.75), H.Y(-2)+16, '#fff', { align:'center' });
    },
    title(H){ const cols=['#ff2020','#ff9020','#ffff20','#20e020','#00ffff','#b040ff'];
      'TETRIS'.split('').forEach((ch,i)=>H.text(ch, H.cx-72+i*24, 48, cols[i], { s:3 }));
      ['tetris/p1','tetris/p2','tetris/p3','tetris/p4'].forEach((c,i)=>H.icon(c, 40+i*48, 112)); }
  },

  /* ========================================================= 6 FROGGER
     Konami, 1981. Hop across five lanes of traffic, then ride the logs
     and turtles across the river — the water is deadly — into one of the
     five bays. Fill all five for a bonus. */
  { id:'frogger', icon:'🐸', name:'Frogger', view:{ w:28, h:32 },
    scene(P){
      P.rect(-14,0,14,10,'#000047');                         // the river
      P.rect(-14,-14,14,-12,'#4a1a8a'); P.rect(-14,-2,14,0,'#4a1a8a');   // the two pavements
      P.rect(-14,10,14,12,'#20b020');                        // the hedge…
      [-12,-6,0,6,12].forEach(x=>P.rect(x-1.1,10,x+1.1,12,'#000047'));   // …and its five bays
    },
    cast:[
      { name:'Frog', shape:'frog/frog', x:0, y:-14 },
      { name:'Car',  shape:'frog/car1', x:0, y:-11.75, visible:false, local:{ speed:0 } },
      { name:'Log',  shape:'frog/logS', x:0, y:2.25,   visible:false, local:{ speed:0 } },
      { name:'Home', shape:'frog/bay',  x:-12, y:10,   visible:false },
      { name:'Safe', shape:'frog/safe', x:0,   y:10,   visible:false, local:{ live:0 } }
    ],
    vars:{ score:0, lives:3, ride:0, dead:0, homes:0, sx:0 },
    keys:[['↑ ↓ ← →','hop']],
    thumb(){ const o=[]; const lane=(c,y,x0,n,gap)=>{ for(let i=0;i<n;i++) o.push([c,x0+i*gap,y]); };
      lane('frog/car1',-11.75,-12,3,12); lane('frog/dozer',-9.75,-8,3,12); lane('frog/car2',-7.75,-14,3,12);
      lane('frog/racer',-5.75,0,1,0); lane('frog/truck',-3.75,-10,2,18); lane('frog/turtle3',0.25,-14,4,9);
      lane('frog/logS',2.25,-12,3,12); lane('frog/logL',4.25,-10,2,18); lane('frog/turtle2',6.25,-13,4,9);
      lane('frog/logM',8.25,-14,3,12); [-12,-6,0,6,12].forEach(x=>o.push(['frog/bay',x,10])); return o; },
    code(){
      const lane=(look,y,speed,x0,n,gap)=>[become(look), setTo('y',y), vset('speed',speed), setTo('x',x0), REP(n, clone(), chg('x',gap))];
      const around=[IF(gt(pos('x'),18), chg('x',-36)), IF(lt(pos('x'),-18), chg('x',36))];
      const die=()=>[vset('dead',1), send('die')];
      const alive=(...c)=>c.length ? and(eq(v('dead'),0), c[0]) : eq(v('dead'),0);
      return {
      Frog:[
        flag(vset('score',0), vset('lives',3), vset('homes',0), vset('dead',0), vset('ride',0),
          goto(0,-14), become('frog/frog'), forever(IF(eq(v('dead'),0),
          IF(touch('Car'), ...die()),
          /* in the river you must be on a log or a turtle, and you ride it */
          IF(and(gt(pos('y'),-0.5), lt(pos('y'),9.5)),
            IFELSE(touch('Log'), [chg('x',v('ride'))], die())),
          IF(gt(pos('x'),13.5),  ...die()),
          IF(lt(pos('x'),-13.5), ...die()),
          IF(gt(pos('y'),9.5), IFELSE(touch('Home'), [vset('dead',1), send('home')], die())) ))),
        recv('die', vchg('lives',-1), become('frog/splat'), wait(1.5),
          IF(eq(v('lives'),0), stopAll()), goto(0,-14), become('frog/frog'), vset('dead',0)),
        recv('home', vchg('score',50), vchg('homes',1), wait(0.3),
          IF(eq(v('homes'),5), vset('homes',0), vchg('score',1000), send('round')),
          goto(0,-14), vset('dead',0)),
        onKey('up',    IF(alive(), chg('y',2), vchg('score',10))),
        onKey('down',  IF(alive(gt(pos('y'),-13)), chg('y',-2))),
        onKey('left',  IF(alive(gt(pos('x'),-12)), chg('x',-2))),
        onKey('right', IF(alive(lt(pos('x'),12)),  chg('x',2))) ],
      Car:[
        flag(hide(),
          ...lane('frog/car1', -11.75, -0.06, -12, 3, 12),
          ...lane('frog/dozer', -9.75,  0.05,  -8, 3, 12),
          ...lane('frog/car2',  -7.75, -0.08, -14, 3, 12),
          ...lane('frog/racer', -5.75,  0.2,    0, 1, 0),
          ...lane('frog/truck', -3.75, -0.07, -10, 2, 18)),
        onClone(show(), forever(chg('x',v('speed')), ...around)) ],
      Log:[
        flag(hide(),
          ...lane('frog/turtle3', 0.25, -0.06, -14, 4, 9),
          ...lane('frog/logS',    2.25,  0.05, -12, 3, 12),
          ...lane('frog/logL',    4.25,  0.12, -10, 2, 18),
          ...lane('frog/turtle2', 6.25, -0.08, -13, 4, 9),
          ...lane('frog/logM',    8.25,  0.07, -14, 3, 12)),
        onClone(show(), forever(chg('x',v('speed')), ...around, IF(touch('Frog'), vset('ride',v('speed'))))) ],
      /* an empty bay; once a frog is home it hides, so the next frog to
         jump in there hits the hedge */
      Home:[
        flag(hide(), goto(-12,10), REP(5, clone(), chg('x',6))),
        onClone(show(), forever(IF(touch('Frog'), vset('sx',pos('x')), send('filled'), hide()))),
        recv('round', show()) ],
      Safe:[
        flag(hide(), vset('live',0)),
        recv('filled', IF(eq(v('live'),0), goto(v('sx'),10), vset('live',1), clone(), vset('live',0))),
        onClone(show()),
        recv('round', del()) ]
    }; },
    hud(H,val,hi){ H.text('1-UP', 32, 2, '#fff'); H.text(T('HI-SCORE'), 96, 2, '#fff');
      H.text(pad(val.score,5), 24, 12, '#ff2020'); H.text(pad(hi,5), 104, 12, '#ff2020');
      for(let i=0;i<(val.lives|0)-1;i++) H.icon('frog/frog', 8+i*16, 241); },
    title(H){ H.text('FROGGER', H.cx, 60, '#20e020', { s:3, align:'center' });
      H.icon('frog/frog', H.cx-8, 120); H.icon('frog/car1', H.cx-48, 152); H.icon('frog/logM', H.cx+8, 152); }
  },

  /* ========================================================= 7 PAC-MAN
     Namco, 1980. Eat every dot. Ghosts chase you; an energizer turns them
     blue and you can eat them. Pac-Man keeps going until a wall stops
     him, and turns as soon as the way you pressed is open. */
  { id:'pacman', icon:'🟡', name:'Pac-Man', view:{ w:28, h:36 },
    cast:[
      { name:'Maze',      shape:'pac/maze',      x:0,  y:-16 },
      { name:'Dot',       shape:'pac/dot',       x:0,  y:0, visible:false },
      { name:'Energizer', shape:'pac/energizer', x:0,  y:0, visible:false },
      { name:'PacMan',    shape:'pac/pacman',    x:0,  y:-9 },
      { name:'Ghost',     shape:'pac/blinky',    x:0,  y:3, visible:false,
        local:{ look:'pac/blinky', smart:0, hx:0, hy:3, delay:0, out:0, scared:0, pace:8, tick:0, dx:-0.125, dy:0, wx:0, wy:0 } }
    ],
    vars:{ score:0, lives:3, playing:0, dots:0, wx:-0.125, wy:0, dx:0, dy:0, k:1 },
    lists(){ const d=D(); return { DOTX:d.DOTS.x.slice(), DOTY:d.DOTS.y.slice(), POWX:d.POWER.x.slice(), POWY:d.POWER.y.slice() }; },
    keys:[['↑ ↓ ← →','move']],
    thumb(){ const d=D(), o=[]; d.DOTS.x.forEach((x,i)=>o.push(['pac/dot',x,d.DOTS.y[i]]));
      d.POWER.x.forEach((x,i)=>o.push(['pac/energizer',x,d.POWER.y[i]]));
      o.push(['pac/blinky',0,3],['pac/pinky',0,0],['pac/inky',-2,0],['pac/clyde',2,0]); return o; },
    code(){
      const S=0.125;
      const random=()=>sub(mul(rnd(0,1),0.25),0.125);          // -0.125 or +0.125
      const tryWay=[chg('x',v('wx')), chg('y',v('wy')),
        IFELSE(touch('Maze'),
          [chg('x',sub(0,v('wx'))), chg('y',sub(0,v('wy'))),     // the way you want is a wall:
           chg('x',v('dx')), chg('y',v('dy')),                   // keep going the way you were…
           IF(touch('Maze'), chg('x',sub(0,v('dx'))), chg('y',sub(0,v('dy'))))],   // …unless that is a wall too
          [vset('dx',v('wx')), vset('dy',v('wy'))]),
        IF(lt(pos('x'),-14.5), setTo('x',14.5)),                 // the tunnel
        IF(gt(pos('x'),14.5),  setTo('x',-14.5))];
      const chase=(a)=>IF(and(eq(v('scared'),0), lt(rnd(1,10),v('smart'))),
        IFELSE(gt(of(a,'PacMan'),pos(a)), [vset('w'+a,S)], [vset('w'+a,-S)]));
      const ghostAt=(look,smart,x,y,delay)=>[become(look), vset('look',look), vset('smart',smart),
        vset('hx',x), vset('hy',y), vset('delay',delay), clone()];
      return {
      Maze:[],
      Dot:[
        recv('fill', vset('dots',0), vset('k',1),
          REP(length('DOTX'), goto(item(v('k'),'DOTX'), item(v('k'),'DOTY')), clone(), vchg('k',1))),
        onClone(show(), vchg('dots',1), forever(IF(touch('PacMan'), vchg('score',10), vchg('dots',-1), del()))) ],
      Energizer:[
        recv('fill', vset('k',1),
          REP(4, goto(item(v('k'),'POWX'), item(v('k'),'POWY')), clone(), vchg('k',1))),
        onClone(show(), vchg('dots',1), forever(IF(touch('PacMan'),
          vchg('score',50), vchg('dots',-1), send('scare'), del()))) ],
      PacMan:[
        flag(vset('score',0), vset('lives',3), vset('playing',0), sendWait('fill'), send('ready'), wait(2.5), vset('playing',1),
          forever(IF(eq(v('playing'),1), ...tryWay,
            IF(eq(v('dots'),0), vset('playing',0), wait(2), sendWait('fill'), send('ready'), wait(2.5), vset('playing',1))))),
        recv('ready', goto(0,-9), show(), vset('wx',-S), vset('wy',0), vset('dx',0), vset('dy',0)),
        recv('caught', wait(1), hide(), wait(1), vchg('lives',-1), IF(eq(v('lives'),0), stopAll()),
          send('ready'), wait(2.5), vset('playing',1)),
        onKey('left',  vset('wx',-S), vset('wy',0)),
        onKey('right', vset('wx',S),  vset('wy',0)),
        onKey('up',    vset('wx',0),  vset('wy',S)),
        onKey('down',  vset('wx',0),  vset('wy',-S)) ],
      Ghost:[
        flag(hide(), ...ghostAt('pac/blinky',9,0,3,0), ...ghostAt('pac/pinky',6,0,0,1),
          ...ghostAt('pac/inky',4,-2,0,4), ...ghostAt('pac/clyde',2,2,0,7), vset('smart',0)),
        recv('ready', IF(gt(v('smart'),0), vset('out',0), vset('scared',0), vset('pace',8),
          goto(v('hx'),v('hy')), become(v('look')), wait(v('delay')),
          glide(0.6,0,3), vset('dx',-S), vset('dy',0), vset('out',1))),
        recv('scare', IF(gt(v('smart'),0), vset('scared',1), vset('pace',2), become('pac/scared'), wait(5),
          IF(eq(v('scared'),1), become('pac/flash')), wait(2),
          IF(eq(v('scared'),1), vset('scared',0), vset('pace',8), become(v('look'))))),
        onClone(show(), forever(IF(and(eq(v('out'),1), eq(v('playing'),1)),
          vchg('tick',1),
          IF(gt(mod(v('tick'),v('pace')),0),          // ghosts are a little slower; scared ones much slower
            /* pick a way to turn at the next corner — towards Pac-Man, mostly */
            IFELSE(eq(v('dx'),0),
              [vset('wy',0), vset('wx',random()), chase('x')],
              [vset('wx',0), vset('wy',random()), chase('y')]),
            ...tryWay),
          IF(touch('PacMan'), IFELSE(eq(v('scared'),1),
            [vchg('score',200), goto(0,3), vset('scared',0), vset('pace',8), become(v('look'))],
            [vset('playing',0), send('caught')])) ))) ]
    }; },
    hud(H,val,hi){
      if(Math.floor(H.time*3)%2===0) H.text('1UP', 24, 0, '#fff');
      H.text(T('HIGH SCORE'), 72, 0, '#fff');
      H.text(pad(val.score,2), 56, 9, '#fff', { align:'right' });
      H.text(pad(hi,2), 136, 9, '#fff', { align:'right' });
      for(let i=0;i<(val.lives|0)-1;i++) H.icon('pac/pacman', 24+i*16, 274, { dir:'l', frame:1 });
    },
    title(H){
      H.text('PAC-MAN', H.cx, 32, '#ffff00', { s:3, align:'center' });
      H.text(T('CHARACTER / NICKNAME'), 48, 80, '#fff');
      [['pac/blinky','SHADOW','"BLINKY"','#ff0000'],['pac/pinky','SPEEDY','"PINKY"','#ffb8ff'],
       ['pac/inky','BASHFUL','"INKY"','#00ffff'],['pac/clyde','POKEY','"CLYDE"','#ffb852']].forEach(([c,a,b,col],i)=>{
        H.icon(c, 24, 96+i*24); H.text('-'+a, 48, 100+i*24, col); H.text(b, 128, 100+i*24, col); });
      H.icon('pac/dot', 76, 204); H.text('10 PTS', 92, 204, '#fff');
      H.icon('pac/energizer', 76, 220); H.text('50 PTS', 92, 220, '#fff');
    },
    over(H){ H.text('GAME  OVER', H.cx, H.Y(-2)+1, '#ff0000', { align:'center' }); }
  },

  /* ======================================================= 8 ASTEROIDS
     Atari, 1979. The ship turns and thrusts, and drifts — there is no
     brake. Everything that leaves one side comes back on the other. A big
     rock breaks into two medium ones, a medium into two small. */
  { id:'asteroids', icon:'🪨', name:'Asteroids', view:{ w:32, h:24 },
    cast:[
      { name:'Ship', shape:'ast/ship',  x:0,  y:0 },
      { name:'Shot', shape:'ast/shot',  x:0,  y:0, visible:false },
      { name:'Rock', shape:'ast/rock3', x:0,  y:12, visible:false, local:{ level:0 } }
    ],
    vars:{ score:0, lives:3, vx:0, vy:0, heading:0, wave:4 },
    lists(){ return { SPEED:[2.2,1.5,1], POINTS:[100,50,20] }; },
    keys:[['← →','turn'],['↑','thrust'],['SPACE','fire']],
    thumb(){ return [['ast/rock3',-10,5],['ast/rock3',9,-6],['ast/rock2',11,7],['ast/rock2',-12,-7],['ast/rock1',-4,-8],['ast/rock1',5,9],['ast/shot',0,3]]; },
    code(){
      const wrap=(X,Y)=>[IF(gt(pos('x'),X), setTo('x',-X)), IF(lt(pos('x'),-X), setTo('x',X)),
                         IF(gt(pos('y'),Y), setTo('y',-Y)), IF(lt(pos('y'),-Y), setTo('y',Y))];
      return {
      Ship:[ flag(vset('score',0), vset('lives',3), goto(0,0), face(0), vset('vx',0), vset('vy',0), become('ast/ship'), forever(
        IF(key('left'),  turn(-6)),
        IF(key('right'), turn(6)),
        IFELSE(key('up'),
          [vchg('vx', mul(sin(dirR()),0.012)), vchg('vy', mul(cos(dirR()),0.012)), become('ast/thrust')],
          [become('ast/ship')]),
        vset('vx', mul(v('vx'),0.99)), vset('vy', mul(v('vy'),0.99)),      // space dust slows you, slowly
        chg('x',v('vx')), chg('y',v('vy')),
        ...wrap(16.5,12.5),
        vset('heading', dirR()),
        IF(touch('Rock'), become('ast/boom'), wait(1.5), vchg('lives',-1), IF(eq(v('lives'),0), stopAll()),
          goto(0,0), face(0), vset('vx',0), vset('vy',0), become('ast/ship'), wait(1)) )) ],
      Shot:[
        flag(hide()),
        onKey('space', goto(of('x','Ship'), of('y','Ship')), face(v('heading')), clone()),
        onClone(show(), REP(36, move(6), ...wrap(16,12), IF(touch('Rock'), wait(0.02), del())), del()) ],
      Rock:[
        flag(hide(), vset('level',0), vset('wave',4), sendWait('wave'), forever(
          waitUntil(eq(count('Rock'),1)), wait(2), vchg('wave',2), sendWait('wave'))),
        recv('wave', IF(eq(v('level'),0), REP(v('wave'),
          goto(rnd(-16,16),12), face(rnd(0,359)), become('ast/rock3'), vset('level',3), clone(), vset('level',0)))),
        onClone(show(), forever(
          move(item(v('level'),'SPEED')),
          ...wrap(18,14),
          IF(touch('Shot'), vchg('score', item(v('level'),'POINTS')),
            IF(eq(v('level'),1), del()),
            vchg('level',-1), become(join('ast/rock', v('level'))), hide(), wait(0.05), show(),
            turn(rnd(20,60)), clone(), turn(rnd(-120,-40))) )) ]
    }; },
    hud(H,val,hi){ H.text(pad(val.score,2), 64, 6, '#fff', { s:2, align:'right' });
      H.text(pad(hi,2), H.cx, 6, '#fff', { align:'center' });
      for(let i=0;i<(val.lives|0);i++) H.icon('ast/ship', 26+i*10, 18); },
    title(H){ H.text('ASTEROIDS', H.cx, 56, '#fff', { s:3, align:'center' });
      H.icon('ast/rock3', 30, 100); H.icon('ast/rock2', 200, 110); H.icon('ast/ship', H.cx-4, 92); }
  },

  /* ========================================================== 9 GALAGA
     Namco, 1981. A formation of bees, butterflies and boss Galagas sways
     at the top; now and then one dives at you, firing. A boss takes two
     hits. Clear them all for the next stage. */
  { id:'galaga', icon:'🐝', name:'Galaga', view:{ w:28, h:36 }, stars:true,
    cast:[
      { name:'Fighter', shape:'gal/fighter', x:0, y:-15 },
      { name:'Enemy',   shape:'gal/bee',     x:0, y:5, visible:false, local:{ hx:0, hy:0, points:0, hp:0 } },
      { name:'Shot',    shape:'gal/shot',    x:0, y:-13.5, visible:false },
      { name:'Bullet',  shape:'gal/bullet',  x:0, y:0, visible:false, local:{ live:0 } }
    ],
    vars:{ score:0, lives:3, sway:0, bx:0, by:0 },
    keys:[['← →','move'],['SPACE','fire']],
    thumb(){ const o=[]; const r=(c,y,x0,n)=>{ for(let i=0;i<n;i++) o.push([c,x0+2*i,y]); };
      r('gal/boss',11,-3,4); r('gal/moth',9,-7,8); r('gal/moth',7,-7,8); r('gal/bee',5,-9,10); r('gal/bee',3,-9,10); return o; },
    code(){
      const row=(look,pts,hp,y,x0,n)=>[become(look), vset('points',pts), vset('hp',hp), vset('hy',y), vset('hx',x0),
        REP(n, clone(), vchg('hx',2))];
      const boom=[become('gal/fboom'), wait(1.5), vchg('lives',-1), IF(eq(v('lives'),0), stopAll()),
        goto(0,-15), become('gal/fighter'), wait(1)];
      return {
      Fighter:[ flag(vset('score',0), vset('lives',3), goto(0,-15), become('gal/fighter'), forever(
        IF(key('left'),  chg('x',-0.25)),
        IF(key('right'), chg('x',0.25)),
        IF(gt(pos('x'),12.5),  setTo('x',12.5)),
        IF(lt(pos('x'),-12.5), setTo('x',-12.5)),
        IF(touch('Enemy'),  ...boom),
        IF(touch('Bullet'), ...boom) )) ],
      /* the hidden Enemy sways the whole formation, and sends the next stage */
      Enemy:[
        flag(hide(), vset('hp',0), sendWait('stage'), forever(
          vset('sway', mul(sin(mul(timer(),60)),2)),
          IF(eq(count('Enemy'),1), wait(2), sendWait('stage')) )),
        recv('stage', ...row('gal/boss',150,2,11,-3,4), ...row('gal/moth',80,1,9,-7,8), ...row('gal/moth',80,1,7,-7,8),
          ...row('gal/bee',50,1,5,-9,10), ...row('gal/bee',50,1,3,-9,10), vset('hp',0)),
        onClone(show(), forever(
          goto(add(v('hx'),v('sway')), v('hy')),
          IF(eq(rnd(1,2500),1),                    // dive!
            glide(0.6, add(pos('x'),3), add(pos('y'),2)),
            glide(0.6, of('x','Fighter'), 0),
            vset('bx',pos('x')), vset('by',pos('y')), send('fire'),
            glide(0.9, of('x','Fighter'), -19),
            goto(v('hx'),19), glide(1, add(v('hx'),v('sway')), v('hy'))) )),
        onClone(forever(IF(touch('Shot'), vchg('hp',-1),
          IFELSE(eq(v('hp'),0),
            [vchg('score',v('points')), become('gal/boom'), wait(0.3), del()],
            [become('gal/boss2'), wait(0.1)])))) ],
      Shot:[
        flag(hide()),
        onKey('space', IF(lt(count('Shot'),3), goto(of('x','Fighter'),-13.5), clone())),     // two shots at most
        onClone(show(), UNTIL(gt(pos('y'),18), chg('y',0.8), IF(touch('Enemy'), wait(0.02), del())), del()) ],
      Bullet:[
        flag(hide(), vset('live',0)),
        recv('fire', IF(eq(v('live'),0), goto(v('bx'),v('by')), vset('live',1), clone(), vset('live',0))),
        onClone(show(), glide(1.2, of('x','Fighter'), -19), del()) ]
    }; },
    hud(H,val,hi){
      if(Math.floor(H.time*3)%2===0) H.text('1UP', 24, 0, '#ff2020');
      H.text(T('HIGH SCORE'), 72, 0, '#ff2020');
      H.text(pad(val.score,2), 56, 9, '#fff', { align:'right' });
      H.text(pad(hi,5), 128, 9, '#fff', { align:'right' });
      for(let i=0;i<(val.lives|0)-1;i++) H.icon('gal/fighter', 4+i*16, 274);
    },
    title(H){ H.text('GALAGA', H.cx, 48, '#2860ff', { s:4, align:'center' });
      H.text('GALAGA', H.cx-2, 46, '#ff2020', { s:4, align:'center' });
      [['gal/boss','150'],['gal/moth','80'],['gal/bee','50']].forEach(([c,p],i)=>{
        H.icon(c, 72, 120+i*24); H.text(p+' '+T('PTS'), 100, 124+i*24, '#fff'); });
      H.icon('gal/fighter', H.cx-6, 200); }
  },

  /* ======================================================= 10 CENTIPEDE
     Atari, 1980. The centipede winds down through the mushrooms: at a
     mushroom or a wall each segment drops a row and turns back. Shoot a
     segment and it becomes a mushroom — the part behind it turns there,
     so the centipede splits. Look out for the spider. */
  { id:'centipede', icon:'🐛', name:'Centipede', view:{ w:30, h:32 },
    cast:[
      { name:'Shooter',  shape:'cen/wand',    x:0.5, y:-15 },
      { name:'Dart',     shape:'cen/dart',    x:0.5, y:-14, visible:false },
      { name:'Segment',  shape:'cen/body',    x:0.5, y:14, visible:false, local:{ dx:0.25, dy:-1, head:0 } },
      { name:'Mushroom', shape:'cen/shroom4', x:0.5, y:0, visible:false, local:{ hp:4, live:0 } },
      { name:'Spider',   shape:'cen/spider',  x:-16, y:-13, visible:false }
    ],
    vars:{ score:0, lives:3, mx:0, my:0 },
    keys:[['↑ ↓ ← →','move'],['SPACE','fire']],
    thumb(){ let s=5; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; const o=[];
      for(let i=0;i<35;i++) o.push(['cen/shroom4', Math.floor(r()*30)-14.5, Math.floor(r()*23)-9]);
      o.push(['cen/head',0.5,14]); for(let i=1;i<12;i++) o.push(['cen/body',0.5-i,14]); return o; },
    code(){
      const boom=[become('cen/boom'), wait(1.5), vchg('lives',-1), IF(eq(v('lives'),0), stopAll()),
        goto(0.5,-15), become('cen/wand'), wait(1)];
      return {
      Shooter:[ flag(vset('score',0), vset('lives',3), goto(0.5,-15), become('cen/wand'), forever(
        IF(key('left'),  chg('x',-0.25)),
        IF(key('right'), chg('x',0.25)),
        IF(key('up'),    chg('y',0.25)),
        IF(key('down'),  chg('y',-0.25)),
        IF(gt(pos('x'),14.5),  setTo('x',14.5)),         // you stay in the bottom of the screen
        IF(lt(pos('x'),-14.5), setTo('x',-14.5)),
        IF(gt(pos('y'),-11),   setTo('y',-11)),
        IF(lt(pos('y'),-16),   setTo('y',-16)),
        IF(touch('Segment'), ...boom),
        IF(touch('Spider'),  ...boom) )) ],
      Dart:[
        flag(hide(), forever(IF(and(key('space'), eq(count('Dart'),1)),
          goto(of('x','Shooter'), add(of('y','Shooter'),1)), clone()))),
        onClone(show(), UNTIL(gt(pos('y'),15),
          chg('y',0.75),
          IF(touch('Mushroom'), wait(0.02), del()),
          IF(touch('Segment'),  wait(0.02), del()),
          IF(touch('Spider'),   wait(0.02), del())), del()) ],
      Segment:[
        flag(hide(), sendWait('centipede'), forever(
          waitUntil(eq(count('Segment'),1)), wait(1), sendWait('centipede'))),
        recv('centipede', goto(0.5,14), vset('dx',0.25), vset('dy',-1),
          vset('head',1), become('cen/head'), clone(),
          vset('head',0), become('cen/body'), REP(11, chg('x',-1), clone())),
        onClone(show(), forever(
          chg('x',v('dx')),
          /* a mushroom or a wall: drop a row and turn back */
          IF(or(touch('Mushroom'), gt(abs(pos('x')),14.5)),
            chg('x',sub(0,v('dx'))), chg('y',v('dy')), vset('dx',sub(0,v('dx')))),
          IF(lt(pos('y'),-16), setTo('y',-15), vset('dy',1)),          // the bottom: start back up
          IF(and(gt(pos('y'),-11), eq(v('dy'),1)), vset('dy',-1)),
          IF(touch('Dart'), vchg('score', add(10, mul(v('head'),90))), hide(), wait(0.05),
            vset('mx', add(floor(pos('x')),0.5)), vset('my', pos('y')), send('grow'), del()) )) ],
      Mushroom:[
        flag(hide(), vset('live',1),
          REP(45, goto(sub(rnd(-14,15),0.5), rnd(-9,13)), vset('hp',4), clone()), vset('live',0)),
        recv('grow', IF(eq(v('live'),0), goto(v('mx'),v('my')), vset('hp',4), vset('live',1), clone(), vset('live',0))),
        onClone(show(), become(join('cen/shroom',v('hp'))), forever(IF(touch('Dart'),
          vchg('hp',-1), IF(eq(v('hp'),0), vchg('score',1), del()),
          become(join('cen/shroom',v('hp'))), wait(0.06)))) ],
      Spider:[
        flag(hide(), forever(wait(rnd(4,9)), goto(-16,-13), show(),
          REP(10, glide(0.35, add(pos('x'),rnd(2,4)), rnd(-15,-10))), hide())),
        flag(forever(IF(touch('Dart'), vchg('score',600), hide(), wait(0.2)))) ]
    }; },
    hud(H,val,hi){ H.text(pad(val.score,2), 48, 0, '#ff40e0', { align:'right' });
      for(let i=0;i<(val.lives|0)-1;i++) H.icon('cen/wand', 56+i*10, 0);
      H.text(pad(hi,5), H.cx+20, 0, '#ff40e0', { align:'center' }); },
    title(H){ const cols=['#ff40e0','#20e020','#2860ff','#ff9020'];
      'CENTIPEDE'.split('').forEach((ch,i)=>H.text(ch, H.cx-72+i*16, 56, cols[i%4], { s:2 }));
      H.icon('cen/head', H.cx+36, 104); for(let i=1;i<9;i++) H.icon('cen/body', H.cx+36-i*8, 104);
      H.icon('cen/shroom4', 60, 150); H.icon('cen/shroom4', 172, 140); H.icon('cen/spider', H.cx-8, 170); }
  }
  ];

  /* ======================================================= the shelf */
  const SHELF={ locked:true, make:true, defaults:{
    'motion.changeBy': { a:'x', n:0.2 },
    'motion.goto':     { x:0, y:0, z:1 },
    'motion.glide':    { t:1, x:0, y:0, z:1 },
    'sense.touch':     { o:'edge' },
    'sense.key':       { k:'space' },
    'event.key':       { k:'space' },
    'ctrl.stop':       { w:'all' }
  } };

  /* ============================================================ words */
  Object.assign(window.ES = window.ES || {}, {
    'PRESS ENTER':'PULSA ENTER', 'GAME OVER':'FIN DEL JUEGO', 'GAME  OVER':'FIN DEL JUEGO',
    'SCORE':'PUNTOS', 'HI':'RECORD', 'HI-SCORE':'RECORD', 'HIGH SCORE':'RECORD', 'TOP':'RECORD',
    'LINES':'LINEAS', 'LEVEL':'NIVEL', 'NEXT':'SIGUE', 'BALL':'BOLA', 'PTS':'PTS', 'POINTS':'PUNTOS',
    'YOU WIN!':'¡GANASTE!', 'CPU WINS':'GANA LA CPU', 'YOU':'TU', 'MYSTERY':'MISTERIO',
    'SCORE ADVANCE TABLE':'TABLA DE PUNTOS', 'CHARACTER / NICKNAME':'PERSONAJE / APODO',
    'move':'mover', 'turn':'girar', 'shoot':'disparar', 'fire':'disparar', 'hop':'saltar', 'drop':'bajar',
    'thrust':'acelerar', 'All games':'Todos los juegos', 'Start this game over':'Empezar este juego de nuevo',
    'Put this game\'s code back the way it was?':'¿Regresar el código de este juego a como estaba?'
  });

  /* =================================================== bitmap font
     5×7 letters, drawn bold on an 8-pixel grid like the arcade's own */
  const GLYPH={
    A:'.###.#...##...#######...##...##...#', B:'####.#...##...#####.#...##...#####.', C:'.###.#...##....#....#....#...#.###.',
    D:'####.#...##...##...##...##...#####.', E:'######....#....####.#....#....#####', F:'######....#....####.#....#....#....',
    G:'.###.#...##....#.####...##...#.####', H:'#...##...##...#######...##...##...#', I:'.###...#....#....#....#....#...###.',
    J:'..###...#....#....#.#..#.#..#..##..', K:'#...##..#.#.#..##...#.#..#..#.#...#', L:'#....#....#....#....#....#....#####',
    M:'#...###.###.#.##.#.##...##...##...#', N:'#...###..##.#.##..###...##...##...#', O:'.###.#...##...##...##...##...#.###.',
    P:'####.#...##...#####.#....#....#....', Q:'.###.#...##...##...##.#.##..#..##.#', R:'####.#...##...#####.#.#..#..#.#...#',
    S:'.#####....#.....###.....#....#####.', T:'#####..#....#....#....#....#....#..', U:'#...##...##...##...##...##...#.###.',
    V:'#...##...##...##...##...#.#.#...#..', W:'#...##...##...##.#.##.#.##.#.#.#.#.', X:'#...##...#.#.#...#...#.#.#...##...#',
    Y:'#...##...#.#.#...#....#....#....#..', Z:'#####....#...#...#...#...#....#####',
    '0':'.###.#...##..###.#.###..##...#.###.', '1':'..#...##....#....#....#....#...###.', '2':'.###.#...#....#..##..#...#....#####',
    '3':'#####...#...#.....#.....##...#.###.', '4':'...#...##..#.#.#..#.#####...#....#.', '5':'######....####.....#....##...#.###.',
    '6':'..##..#...#....####.#...##...#.###.', '7':'#####....#...#...#...#....#....#...', '8':'.###.#...##...#.###.#...##...#.###.',
    '9':'.###.#...##...#.####....#...#..##..', '-':'...............#####...............', ':':'.......#....#.........#....#.......',
    '!':'..#....#....#....#....#.........#..', '?':'.###.#...#....#...#...#.........#..', '.':'................................#..',
    ',':'.........................#...#.....', "'":'..#....#...........................', '"':'.#.#..#.#..........................',
    '/':'....#...#....#...#...#....#...#....', '<':'...#...#...#...#.....#.....#.....#.', '>':'.#.....#.....#.....#...#...#...#...',
    '=':'..........#####.....#####..........', '*':'.....#.#.#.###.#####.###.#.#.#.....', '+':'.......#....#..#####..#....#.......',
    '(':'...#...#...#....#....#.....#.....#.', ')':'.#.....#.....#....#....#...#...#...', '©':'.###.#...##.#.##.#.##.#.##...#.###.',
    '↑':'..#...###.#.#.#..#....#....#....#..', '↓':'..#....#....#....#..#.#.#.###...#..',
    '←':'.......#...#...#####.#.....#.......', '→':'.......#.....#.#####...#...#.......', ' ':'.'.repeat(35)
  };
  function drawText(ctx, str, x, y, col, o){
    o=o||{}; const s=o.s||1, adv=8*s;
    str=String(str).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[¡¿]/g,'').toUpperCase();
    const w=str.length*adv-2*s;
    let x0=x; if(o.align==='center') x0=x-w/2; else if(o.align==='right') x0=x-w;
    x0=Math.round(x0);
    if(o.box){ ctx.fillStyle='#000'; ctx.fillRect(x0-4*s, y-3*s, w+8*s, 13*s); }
    ctx.fillStyle=col||'#fff';
    [...str].forEach((ch,k)=>{ const g=GLYPH[ch]; if(!g) return;
      for(let i=0;i<35;i++) if(g[i]==='#') ctx.fillRect(x0+k*adv+(i%5)*s, y+Math.floor(i/5)*s, 2*s, s); });
  }

  /* ================================================== the machinery */
  const actor = n => (window.VM ? VM.actorByName(n) : null);
  const AX = k => (window.BLOCKS ? BLOCKS.AXES.find(a=>a.v===k) : null);
  const wr = (a,k,val)=>{ const x=AX(k); if(a&&x) a[x.field]=x.sign*val; };

  let gi=0, on=false, state='title', userStop=false, clock=0;
  const kept={}, hi={};
  const game = () => GAMES[gi];
  let W={ x0:-16, x1:16, y0:-12, y1:12, w:32, h:24 };

  /* the scenery: flat coloured strips under the characters */
  function strip(x0,y0,x1,y1,col,lift){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(Math.max(0.001,x1-x0), Math.max(0.001,y1-y0)),
      new THREE.MeshBasicMaterial({ color:col }));
    m.rotation.x=-Math.PI/2;
    m.position.set((x0+x1)/2, lift==null ? -0.05 : lift, -(y0+y1)/2);
    G.roomGroup.add(m); return m;
  }
  let stars=[];
  function build(){
    if(G.roomGroup) G.scene.remove(G.roomGroup);
    G.roomGroup=new THREE.Group(); G.scene.add(G.roomGroup);
    G.solids=[]; G.hits=[]; G.ceiling=null; G.ground=()=>0;
    G.scene.background=new THREE.Color('#000000');
    G.scene.fog=null;
    const g=game();
    strip(W.x0,W.y0,W.x1,W.y1,'#000000',-0.06);
    if(g.scene) g.scene({ rect:(a,b,c,d,col)=>strip(a,b,c,d,col) });
    /* the machine's bezel: everything outside its screen is covered, so a
       car driving off one side is gone until it wraps round to the other */
    const big=400, bez='#0b0a1c';
    strip(W.x0-big,W.y0-big,W.x0,W.y1+big,bez,2); strip(W.x1,W.y0-big,W.x1+big,W.y1+big,bez,2);
    strip(W.x0,W.y1,W.x1,W.y1+big,bez,2);         strip(W.x0,W.y0-big,W.x1,W.y0,bez,2);
    stars=[];
    if(g.stars){ let s=9; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; };
      const cols=['#ff4040','#40ff40','#4080ff','#ffff40','#ffffff','#ff40ff'];
      for(let i=0;i<70;i++){ const x=W.x0+r()*W.w, y=W.y0+r()*W.h;
        const m=strip(x,y,x+0.125,y+0.125,cols[i%cols.length],-0.04);
        stars.push({ m, y, sp:2+r()*3, ph:r()*6 }); } }
  }

  function cast(){
    const g=game();
    VM.project.actors.slice().forEach(a=>VM.delActor(a));
    g.cast.forEach(c=>{
      const a=VM.addActor({ name:c.name, shape:c.shape, colour:'#ffffff', size:c.size||1 });
      a.dir=0; a.tilt=0; a.roll=0; a.visible=c.visible!==false;
      wr(a,'x',c.x); wr(a,'y',c.y); a.y=1;
      a.vars=JSON.parse(JSON.stringify(c.local||{}));
      VM.sync(a); VM.setHome(a);
    });
    VM.project.vars={ ...g.vars };
    VM.project.lists=g.lists ? g.lists() : {};
    VM.project.procs=VM.project.procs||[];
  }
  const handed = g => JSON.parse(JSON.stringify(g.code()));
  function given(code){
    const g=game(), all_=code || handed(g);
    g.cast.forEach(c=>{ const a=actor(c.name); if(a) a.scripts=JSON.parse(JSON.stringify(all_[c.name]||[])); });
  }
  function remember(){
    const g=game(), out={};
    g.cast.forEach(c=>{ const a=actor(c.name); out[c.name]=a ? a.scripts : []; });
    kept[g.id]=JSON.parse(JSON.stringify(out));
  }
  function load(i){
    if(VM.running) VM.stopAll();
    if(on) remember();
    gi=Math.max(0, Math.min(GAMES.length-1, i));
    const vw=game().view;
    W={ x0:-vw.w/2, x1:vw.w/2, y0:-vw.h/2, y1:vw.h/2, w:vw.w, h:vw.h };
    window.LEVELS=Object.assign(window.LEVELS||{}, { arcade:{ w:vw.w, d:vw.h } });
    build();
    VM.enter(G.roomGroup);
    cast();
    given(kept[game().id]);
    state='title';
    if(window.CODER){
      CODER.restrict(SHELF);
      CODER.setActor(actor(game().cast.find(c=>c.visible!==false).name));
    }
    hud(true); words();
    try{ history.replaceState(null,'','?g='+game().id); }catch(e){}
  }
  function original(){
    if(!confirm(T('Put this game\'s code back the way it was?'))) return;
    VM.stopAll();
    delete kept[game().id];
    load(gi);
  }

  /* ================================================== the screen
     One canvas laid over the game, the size of the real machine's screen
     in real pixels, scaled up crisp: the score, the lives, the title
     screen and GAME OVER are drawn on it in the arcade's own letters. */
  let hudKey='';
  function painter(ctx, w, h){
    return {
      w, h, cx:w/2, time:clock,
      X:x=>(x-W.x0)*8, Y:y=>(W.y1-y)*8,
      text:(s,x,y,col,o)=>drawText(ctx,s,x,y,col,o),
      icon:(cid,x,y,o)=>COSTUMES.paint(ctx,cid,Math.round(x),Math.round(y),o),
      rect:(x,y,w_,h_,col)=>{ ctx.fillStyle=col; ctx.fillRect(x,y,w_,h_); }
    };
  }
  function hud(force){
    const cv=$('#hud'); if(!cv || !window.VM) return;
    const g=game(), w=W.w*8, h=W.h*8;
    const vals=VM.project.vars||{};
    const coding=!!(window.CODER && CODER.open);
    const blink=Math.floor(clock*2)%2;
    const k=[gi,state,coding,blink,Math.floor(clock*3)%2,JSON.stringify(vals),hi[g.id]||0,window.LANG].join('|');
    if(!force && k===hudKey) return;
    hudKey=k;
    if(cv.width!==w || cv.height!==h){ cv.width=w; cv.height=h; }
    const ctx=cv.getContext('2d'); ctx.clearRect(0,0,w,h);
    const H=painter(ctx,w,h);
    if(state==='title' && !coding){
      ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);
      g.title(H);
      prompt(H, blink, h-44);
    } else {
      if(g.hud) g.hud(H, vals, hi[g.id]||0);
      if(state==='over' && !coding){
        const plain = g.over ? g.over(H, vals) : true;
        if(plain) drawText(ctx, T('GAME OVER'), w/2, Math.round(h*0.45), '#ff2020', { s:2, align:'center', box:true });
        prompt(H, blink, Math.round(h*0.45)+28);
      }
    }
    cv.classList.toggle('live', state!=='play' && !coding);
  }
  function prompt(H, blink, y){
    if(blink) H.text(T('PRESS ENTER'), H.cx, y, '#ffff20', { align:'center', box:true });
    const keys=game().keys.map(([k,w])=>k+' '+T(w)).join('  ');
    H.text(keys, H.cx, y+14, '#fff', { align:'center', box:true });
  }

  /* ==================================================== the camera
     Straight down and orthographic, the machine's screen fitted into the
     window — or, while the blocks are open, into the gap between them. */
  let cam=null, fit={ u:1, l:0, t:0 };
  function gap(){
    const Wd=innerWidth, H=innerHeight;
    if(window.CODER && CODER.open){
      const p=$('#cPal'), s=$('#cScript'), bar=$('#cBar');
      const l=p ? p.getBoundingClientRect().right+8 : 0;
      const r=s ? s.getBoundingClientRect().left-8 : Wd;
      const t=bar ? bar.getBoundingClientRect().bottom+8 : 0;
      if(r-l > 160) return { l, t, r, b:H-10 };
    }
    const top=$('#bsTop'), tb=top ? top.getBoundingClientRect().bottom+8 : 0;
    return { l:10, t:tb, r:Wd-10, b:H-10 };
  }
  function camera(){
    const Wd=innerWidth, H=Math.max(1,innerHeight);
    const R=gap();
    const rw=Math.max(1,R.r-R.l), rh=Math.max(1,R.b-R.t);
    let u=Math.max(W.w/rw, W.h/rh);                  // squares per screen pixel
    const px8=1/(u*8); if(px8>=1) u=1/(Math.floor(px8)*8);   // whole screen pixels per arcade pixel: crisp
    const xc=(W.x0+W.x1)/2, yc=(W.y0+W.y1)/2;
    const cx=(R.l+R.r)/2, cy=(R.t+R.b)/2;
    if(!cam) cam=new THREE.OrthographicCamera(-1,1,1,-1,0.1,400);
    cam.left=xc-cx*u; cam.right=cam.left+Wd*u;
    cam.top=yc+cy*u;  cam.bottom=cam.top-H*u;
    cam.position.set(0,120,0); cam.up.set(0,0,-1); cam.lookAt(0,0,0);
    cam.updateProjectionMatrix();
    G.camera=cam;
    const sx = x => (x-cam.left)/u, sy = y => (cam.top-y)/u;
    const cv=$('#hud');
    if(cv){ cv.style.left=sx(W.x0)+'px'; cv.style.top=sy(W.y1)+'px';
            cv.style.width=(W.w/u)+'px'; cv.style.height=(W.h/u)+'px'; }
    fit={ u, sx, sy };
  }
  function world(ev){
    const c=$('#view').getBoundingClientRect();
    const fx=(ev.clientX-c.left)/c.width, fy=(ev.clientY-c.top)/c.height;
    return { x:cam.left+fx*(cam.right-cam.left), y:cam.top-fy*(cam.top-cam.bottom) };
  }
  /* CLICK A CHARACTER AND READ ITS CODE */
  function pickAt(ev){
    if(!cam) return;
    const p=world(ev);
    const names=game().cast.map(c=>c.name);
    const cands=VM.project.actors.filter(a=>a.visible!==false)
      .sort((a,b)=>names.indexOf(b.name)-names.indexOf(a.name));
    let a=cands.find(o=>COSTUMES.hit(o,p.x,p.y)) || cands.find(o=>COSTUMES.hit(o,p.x,p.y,true));
    if(!a) return;
    if(a.isClone) a=actor(a.name);
    if(a && window.CODER){ CODER.setActor(a); CODER.show(); }
  }

  /* ==================================================== playing */
  function go(){
    const f=document.activeElement;
    if(f && f.tagName==='BUTTON') f.blur();
    state='play';
    VM.greenFlag();
  }
  const typing = el => !!(el && (el.tagName==='INPUT' || el.tagName==='TEXTAREA' ||
                                 el.tagName==='SELECT' || el.isContentEditable));
  function keys(e){
    if(typing(e.target)) return;
    if(e.code==='Enter' && !e.repeat && !VM.running){ e.preventDefault(); go(); }
  }
  function buttons(){
    const run=$('#dnRun');
    if(run){ const live=VM.running, label=live ? '■ '+T('STOP') : '▶ '+T('RUN');
      if(run.textContent!==label) run.textContent=label;
      run.classList.toggle('live', live); }
  }
  function words(){
    const tip=(s,h)=>{ const e=$(s); if(e) e.title=T(h); };
    const set=(s,h)=>{ const e=$(s); if(e) e.innerHTML=h; };
    set('#dnOpen', '▦ '+T('BLOCKS'));
    set('#dnLang', window.LANG==='es' ? 'EN' : 'ES');
    tip('#dnLang', window.LANG==='es' ? 'English' : 'Español');
    tip('#dnReset','Start this game over'); tip('#bsHome','All games');
    const nm=$('#gameName'); if(nm) nm.textContent=game().name;
    buttons(); hud(true);
    if(window.CODER && CODER.open) CODER.render();
  }
  function setLang(l){
    window.LANG = l==='es' ? 'es' : 'en';
    document.documentElement.lang=window.LANG;
    try{ localStorage.setItem(LANG_KEY, window.LANG); }catch(e){}
    words();
  }

  function start(){
    G.room='arcade';
    VM.useScratch();
    /* a STOP pressed by a person goes back to the title; a game that
       stops itself (`stop all`) is over */
    const stop=VM.stopAll;
    VM.stopAll=function(){ userStop=true; return stop.apply(this, arguments); };
    let l='en'; try{ l=localStorage.getItem(LANG_KEY)||'en'; }catch(e){}
    window.LANG = l==='es' ? 'es' : 'en';
    const want=(typeof location!=='undefined' && new URLSearchParams(location.search).get('g'))||'';
    load(Math.max(0, GAMES.findIndex(g=>g.id===want)));
    on=true;
    camera();
    $('#view').addEventListener('pointerdown', pickAt);
    $('#hud').addEventListener('pointerdown', e=>{ if(state!=='play' && !VM.running){ e.preventDefault(); go(); } });
    addEventListener('keydown', keys);
    $('#dnOpen').onclick=()=>{ if(window.CODER) CODER.toggle(); };
    $('#dnRun').onclick=()=>{ if(VM.running) VM.stopAll(); else go(); };
    $('#dnLang').onclick=()=>setLang(window.LANG==='es' ? 'en' : 'es');
    $('#dnReset').onclick=original;
    document.querySelectorAll('#bsTop .dn-btn').forEach(b=>b.addEventListener('click', ()=>b.blur()));
    setLang(window.LANG);
  }
  function step(dt){
    if(!on) return;
    VM.step(dt);
    VM.project.actors.forEach(a=>{ if(a.y!==1){ a.y=1; VM.sync(a); } });
  }
  function draw(dt){
    if(!on) return;
    clock+=dt;
    if(VM.running){ if(state!=='play') state='play'; userStop=false; }
    else if(state==='play'){ state = userStop ? 'title' : 'over'; userStop=false; }
    const g=game(), sc=+(VM.project.vars||{}).score;
    if(isFinite(sc) && sc>(hi[g.id]||0)) hi[g.id]=sc;
    COSTUMES.tick(VM.project.actors, dt);
    stars.forEach(s=>{ s.y-=s.sp*dt; if(s.y<W.y0) s.y+=W.h; s.m.position.z=-s.y;
      s.m.visible = Math.sin(clock*4+s.ph)>-0.6; });
    camera();
    if(window.CODER) CODER.tick(dt);
    const coding=!!(window.CODER && CODER.open);
    const box=$('#dino'); if(box) box.classList.toggle('coding', coding);
    buttons(); hud();
  }

  return { start, step, draw, load, GAMES, SHELF, handed, drawText,
           pick(i){ gi=i; },
           get gi(){ return gi; }, get state(){ return state; }, get active(){ return on; } };
})();
