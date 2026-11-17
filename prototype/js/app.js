/* Decallion app: screens and game flow. Uses Engine (rules), Stats (persistence), Scene (animation) and the question bank. */
(function(){
const E=Engine,S=Scene,L=E.LEVELS,BANK=DECALLION_QUESTIONS,CATS=DECALLION_CATEGORIES;
const $=id=>document.getElementById(id);
const ICONS={
1:['....####....','..########..','..#......#..','..#.####.#..','..#......#..','..#.####.#..','..#......#..','..#.####.#..','..#......#..','..#......#..','..########..','............'],
2:['............','.##########.','.#........#.','.#.######.#.','.#........#.','.#.####...#.','.#........#.','.##########.','...##.......','...#........','............','............'],
3:['..##....##..','..##....##..','...##..##...','....####....','...######...','..########..','..###oo###..','..###oo###..','..########..','...######...','....####....','............'],
4:['.#..........','.#######....','.#########..','.###########','.#########..','.#######....','.#..........','.#..........','.#..........','.#..........','.#..........','###.........'],
5:['.....##.....','.....##.....','....####....','############','.##########.','..########..','...######...','..########..','..###..###..','.###....###.','.##......##.','............'],
6:['....####....','...#oooo#...','..#oo##oo#..','.#oo#..#oo#.','.#o#....#o#.','..#o#..#o#..','...#o##o#...','....#oo#....','.....##.....','...######...','..########..','............'],
'-1':['............','.##......##.','..##....##..','...##..##...','....####....','.....##.....','....####....','...##..##...','..##....##..','.##......##.','............','............']};
const MODE_NAME={daily:'Daily climb',practice:'Practice',endless:'Endless'};

const setup={cats:CATS.slice(),diff:0,timer:true};          // practice options
const g={mode:'daily',round:[],idx:0,score:0,log:[],strikes:0,answered:true,timed:true,counts:true,deadline:0,raf:0,lastSec:0};

function view(v){['vHome','vSetup','vPlay','vReveal','vEnd'].forEach(k=>$(k).hidden=k!==v);}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
function focus(id){try{$(id).focus({preventScroll:true});}catch(e){}}

// ----- HUD -----
function pips(){
  const box=$('pips');box.innerHTML='';
  if(!g.round.length)return;
  if(g.mode==='endless'){for(let i=0;i<E.STRIKES;i++){const p=el('i');if(i<E.STRIKES-g.strikes)p.className='now';box.appendChild(p);}return;}
  for(let i=0;i<g.round.length;i++){const p=el('i');if(i<g.log.length)p.className='done';else if(i===g.idx)p.className='now';box.appendChild(p);}
}
function countText(){
  if(!g.round.length)return'READY';
  if(g.mode==='endless')return'PROMPT '+(g.idx+1)+' · '+(E.STRIKES-g.strikes)+' MISSES LEFT';
  return'PROMPT '+(g.idx+1)+' OF '+g.round.length;
}

// ----- home and setup -----
function home(){
  cancelAnimationFrame(g.raf);g.answered=true;g.round=[];g.log=[];g.idx=0;S.reset();pips();$('count').textContent='READY';
  const done=Stats.dailyDone(E.dayKey());
  $('mDailyNote').textContent=done?('Logged today: '+E.ft(Stats.load().daily.score)+' ft. Replays do not count'):'7 prompts, the same for everyone today';
  view('vHome');
}
function chip(label,pressed,on){const b=el('button',null,label);b.type='button';b.setAttribute('aria-pressed',String(pressed));b.onclick=on;return b;}
function paintSetup(){
  const cc=$('catChips');cc.innerHTML='';
  CATS.forEach(c=>cc.appendChild(chip(c,setup.cats.indexOf(c)>=0,()=>{const i=setup.cats.indexOf(c);if(i>=0)setup.cats.splice(i,1);else setup.cats.push(c);paintSetup();})));
  const dc=$('diffChips');dc.innerHTML='';
  [[0,'Any'],[1,'Easy'],[2,'Medium'],[3,'Hard']].forEach(([v,n])=>dc.appendChild(chip(n,setup.diff===v,()=>{setup.diff=v;paintSetup();})));
  const tc=$('timerChips');tc.innerHTML='';
  [[true,'25 seconds'],[false,'Off']].forEach(([v,n])=>tc.appendChild(chip(n,setup.timer===v,()=>{setup.timer=v;paintSetup();})));
  const n=E.pool(BANK,setup).length,take=Math.min(n,E.ROUND_SIZE);
  $('avail').textContent=n?(n+' prompts match · round of '+take):'No prompts match';
  $('setupGo').disabled=!n;$('setupGo').style.opacity=n?1:.4;
}

// ----- a round -----
function start(mode){
  S.wake();g.mode=mode;
  g.round=E.buildRound(BANK,mode==='practice'?{mode,cats:setup.cats,diff:setup.diff}:{mode});
  if(!g.round.length){home();return;}
  g.timed=mode==='practice'?setup.timer:true;
  g.counts=mode!=='daily'||!Stats.dailyDone(E.dayKey());
  g.idx=0;g.score=0;g.log=[];g.strikes=0;S.reset();
  $('open').hidden=true;$('sealed').hidden=false;
  ask();
}
function ask(){
  const Q=g.round[g.idx];g.answered=false;g.lastSec=0;
  $('cat').textContent=Q.cat+' · '+E.DIFFS[Q.diff];$('count').textContent=countText();$('q').textContent=Q.q;pips();
  $('answer').value='';const c=$('clock');c.classList.remove('low');c.style.setProperty('--t',1);c.textContent=g.timed?E.SECONDS:'∞';
  view('vPlay');focus('answer');
  cancelAnimationFrame(g.raf);
  if(g.timed){g.deadline=performance.now()+E.SECONDS*1000;g.raf=requestAnimationFrame(tick);}
}
function tick(now){
  const left=Math.max(0,g.deadline-now),sec=Math.ceil(left/1000),c=$('clock');
  c.style.setProperty('--t',left/(E.SECONDS*1000));c.textContent=sec;c.classList.toggle('low',left<6000);
  if(left<5000&&sec>0&&sec!==g.lastSec){g.lastSec=sec;S.tone(880,.05,0,'square',.03);}
  if(left<=0){settle($('answer').value,true);return;}
  g.raf=requestAnimationFrame(tick);
}
function settle(text,timedOut){
  if(g.answered)return;g.answered=true;cancelAnimationFrame(g.raf);
  const Q=g.round[g.idx],row=E.match(Q,text),typed=String(text).trim(),level=row?row[1]:-1,pts=E.score(row);
  g.score+=pts;if(!row)g.strikes++;
  g.log.push({Q,row,typed,pts,level,timedOut,cat:Q.cat});pips();
  $('answer').blur();view('');
  S.climbTo(g.score,row?500:700,reveal);                 // climb first, then show the level
}
function drawIcon(level){const c=$('icon').getContext('2d'),col=level<0?E.MISS_COLOR:L[level].color;c.clearRect(0,0,12,12);
  ICONS[level].forEach((r,y)=>{for(let x=0;x<12;x++){if(r[x]==='#'){c.fillStyle=col;c.fillRect(x,y,1,1);}else if(r[x]==='o'){c.fillStyle='#fff';c.fillRect(x,y,1,1);}}});}
function roundOver(){return g.idx+1>=g.round.length||(g.mode==='endless'&&g.strikes>=E.STRIKES);}
function reveal(){
  const l=g.log[g.log.length-1],hit=l.level>0;
  $('reveal').className='reveal '+(hit?'c'+l.level:'cx');drawIcon(l.level);
  $('bTier').textContent=hit?L[l.level].name:(l.timedOut&&!l.typed?'Out of time':'No credit');
  $('bAns').textContent=hit?('“'+l.row[0]+'”'):(l.typed?('“'+l.typed+'”'):'');
  $('bPts').innerHTML='<b>+'+l.pts+' PTS</b> · climb '+E.ft(l.pts)+' ft';
  $('bNote').textContent=hit?L[l.level].note:(g.mode==='endless'?('Miss '+g.strikes+' of '+E.STRIKES+'.'):(l.typed?'Not on the board.':'The clock ran out.'));
  $('next').textContent=roundOver()?'See results':'Ascend ▲';
  view('vReveal');S.fxScore(l.level);focus('next');
}
function next(){if(roundOver())finish();else{g.idx++;ask();}}

// ----- results -----
function finish(){
  const n=g.log.length,max=n*100,glass=g.log.filter(l=>l.level===6).length;
  let change=null;
  if(g.counts)change=Stats.record({mode:g.mode,score:g.score,dayKey:E.dayKey(),prevDayKey:E.prevDayKey(E.dayKey()),log:g.log.map(l=>({cat:l.cat,level:l.level,pts:l.pts}))});
  $('count').textContent='FINAL';
  $('endLbl').textContent=MODE_NAME[g.mode]+' · final altitude';
  $('newBest').hidden=!(change&&change.newBest&&change.previousBest>0);
  $('endTitle').textContent=(g.mode!=='endless'&&g.score>=max&&n===E.ROUND_SIZE)?'7,000 ft. You took the glass.':'You topped out at '+E.ft(g.score)+' ft.';
  $('endLine').textContent=g.score+(g.mode==='endless'?' points across '+n+' prompts':' of '+max+' points')+', with '+(glass?glass+' DECA Glass answer'+(glass>1?'s':''):'no DECA Glass answers')+'.';
  const tally=$('endTally');tally.innerHTML='';
  [6,5,4,3,2,1].forEach(k=>{const c=g.log.filter(l=>l.level===k).length;if(c){const s=el('span','c'+k,c+' × '+L[k].name);tally.appendChild(s);}});
  const miss=g.log.filter(l=>l.level<0).length;if(miss)tally.appendChild(el('span','cx',miss+' × No credit'));
  $('endNote').textContent=!g.counts?'Today\'s daily was already logged, so this replay was not added to your stats.'
    :g.mode==='daily'?('Daily streak: '+change.streak+' day'+(change.streak===1?'':'s')+'. Answer boards are open in the round review below.')
    :(change.previousBest&&!change.newBest?('Your best in this mode is '+E.ft(change.previousBest)+' ft. '):'')+'Answer boards are open in the round review below.';
  view('vEnd');focus('again');
  const d=new Date();
  $('share').value='Decallion '+MODE_NAME[g.mode].toLowerCase()+(g.mode==='daily'?' '+d.toLocaleDateString(undefined,{month:'short',day:'numeric'}):'')+'\n'+
    g.log.map(l=>l.level>0?L[l.level].emoji:'⬛').join('')+'\n'+E.ft(g.score)+' ft · '+g.score+(g.mode==='endless'?' pts':' / '+max);
  const rv=$('review');rv.innerHTML='';
  g.log.forEach(l=>{
    const box=el('div','rev');
    box.appendChild(el('div','q',l.Q.q));
    box.appendChild(el('div','you '+(l.level>0?'c'+l.level:'cx'),l.level>0?('You: '+l.row[0]+' · '+L[l.level].name+' +'+l.pts):('You: '+(l.typed||'no answer')+' · No credit')));
    const ul=el('ul','bank');
    l.Q.a.slice().sort((a,b)=>b[1]-a[1]).forEach(r=>{const li=el('li','c'+r[1]+(r===l.row?' mine':''),r[0]+' · '+L[r[1]].pts);li.title=L[r[1]].name;ul.appendChild(li);});
    box.appendChild(ul);box.appendChild(el('div','why',l.Q.why));
    box.appendChild(el('div','tag',l.Q.cat+' · '+l.Q.area+' · '+E.DIFFS[l.Q.diff]+' · '+l.Q.id));
    rv.appendChild(box);});
  $('sealed').hidden=true;$('open').hidden=false;$('copy').textContent='Copy result';
  paintStats();S.fxFinale(g.mode==='endless'?Math.min(g.score,650):g.score);
}

// ----- stats panel -----
function paintStats(){
  const s=Stats.load(),figs=$('figs');figs.innerHTML='';
  const fig=(v,label)=>{const d=el('div');d.appendChild(el('b',null,v));d.appendChild(el('span',null,label));figs.appendChild(d);};
  fig(Stats.liveStreak(E.dayKey(),E.prevDayKey(E.dayKey())),'Daily streak');
  fig(s.daily.bestStreak,'Best streak');
  fig(E.ft(s.best.daily),'Best daily ft');
  fig(E.ft(s.best.practice),'Best practice ft');
  fig(E.ft(s.best.endless),'Best endless ft');
  fig(s.games,'Rounds played');
  fig(s.prompts?Math.round(s.pts/s.prompts):0,'Avg pts / prompt');
  fig(s.levels[6],'Glass answers');
  const dist=$('dist'),leg=$('legend');dist.innerHTML='';leg.innerHTML='';
  [1,2,3,4,5,6,'miss'].forEach(k=>{const c=s.levels[k]||0,cls=k==='miss'?'cx':'c'+k,name=k==='miss'?'No credit':L[k].name;
    if(c&&s.prompts){const i=el('i',cls);i.style.width=(c/s.prompts*100)+'%';i.title=name+': '+c;dist.appendChild(i);}
    leg.appendChild(el('span',cls,name+' '+c));});
  const rows=$('catRows');rows.innerHTML='';
  const played=CATS.filter(c=>s.cats[c]);
  if(!played.length){const tr=el('tr');const td=el('td','mute','No rounds played yet.');td.colSpan=4;tr.appendChild(td);rows.appendChild(tr);}
  played.sort((a,b)=>s.cats[b].pts/s.cats[b].n-s.cats[a].pts/s.cats[a].n).forEach(c=>{const d=s.cats[c],tr=el('tr');
    tr.appendChild(el('td',null,c));tr.appendChild(el('td','num',d.n));tr.appendChild(el('td','num',Math.round(d.pts/d.n)));tr.appendChild(el('td','num',d.glass||0));rows.appendChild(tr);});
  $('statsNote').textContent=Stats.isPersistent()?'Stats are saved in this browser only.':'This browser is blocking storage, so stats last only until you close the page.';
}

// ----- wiring -----
[1,2,3,4,5,6].forEach(k=>{const li=el('li','c'+k);li.appendChild(el('b',null,L[k].name));li.firstChild.style.fontWeight='400';li.appendChild(el('span',null,'+'+L[k].pts+' pts'));$('tierList').appendChild(li);});
$('bankNote').textContent=BANK.length+' prompts across '+CATS.length+' categories.';
const problems=E.validate(BANK,CATS);if(problems.length)console.warn('Question bank problems:',problems);
S.onTick(shown=>{$('alt').textContent=E.ft(shown)+' ft';$('pts').textContent=shown;});
function paintSnd(){$('snd').textContent=S.soundOn()?'Sound on':'Sound off';$('snd').setAttribute('aria-pressed',String(S.soundOn()));}
$('snd').onclick=()=>{S.toggleSound();paintSnd();};
$('homeBtn').onclick=home;$('endHome').onclick=home;$('setupBack').onclick=home;
$('mDaily').onclick=()=>start('daily');
$('mEndless').onclick=()=>start('endless');
$('mPractice').onclick=()=>{paintSetup();view('vSetup');};
$('catAll').onclick=()=>{setup.cats=CATS.slice();paintSetup();};
$('catNone').onclick=()=>{setup.cats=[];paintSetup();};
$('setupGo').onclick=()=>{if(E.pool(BANK,setup).length)start('practice');};
$('again').onclick=()=>start(g.mode);
$('next').onclick=next;
$('form').addEventListener('submit',e=>{e.preventDefault();const v=$('answer').value;if(v.trim())settle(v,false);});
$('copy').onclick=()=>{const t=$('share').value;
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>{$('copy').textContent='Copied';})
  .catch(()=>{$('share').focus();$('share').select();$('copy').textContent='Select and copy the text above';});};
let armed=0;
$('resetStats').onclick=()=>{const b=$('resetStats');if(Date.now()-armed<4000){Stats.reset();paintStats();home();b.textContent='Reset stats';armed=0;}
  else{armed=Date.now();b.textContent='Click again to erase';setTimeout(()=>{if(armed&&Date.now()-armed>=3900){b.textContent='Reset stats';armed=0;}},4000);}};
paintSnd();paintStats();S.start();home();
window.__decallion={g,setup};   // exposed for tests
})();
