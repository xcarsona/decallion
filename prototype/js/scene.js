/* Decallion scene: the animated climb drawn on canvas, particle effects and sound. Knows nothing about questions or scoring. */
(function(){
const $=id=>document.getElementById(id);
let target=0,pend=null,onTick=()=>{};
// ---------- animated climb ----------
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv=$('sky'),g=cv.getContext('2d'),ui=$('ui'),u=ui.getContext('2d'),PX=3;
let W=0,H=0,DPR=1,alt=0,tPrev=0,shake=0,flash=0,rain=0,carX=0,carY=0;
const parts=[];
const COL={1:'#9db0cf',2:'#c7abff',3:'#74a9ff',4:'#e3a071',5:'#f2c14e',6:'#7fe3f2','-1':'#ff8676'};
const PPU=3, TROPHY=748;
const SKY=[[0,[18,48,110],[58,104,184]],[150,[12,36,92],[38,80,158]],[300,[9,26,70],[24,58,128]],[450,[5,14,44],[14,36,92]],[600,[2,7,24],[9,22,62]],[760,[2,6,20],[12,28,74]]];
const sr=Engine.rng(20261111);
const stars=Array.from({length:110},()=>({x:sr(),y:sr(),r:.5+sr()*1.3,ph:sr()*6.28}));
const clouds=Array.from({length:16},()=>({x:sr(),w:170+sr()*400,f:.55+sr()*.8,s:.45+sr()*.7,v:(sr()-.5)*.012}));
function strip(n,minW,maxW,minH,maxH){const a=[];let x=-40;for(let i=0;i<n;i++){const w=minW+sr()*(maxW-minW);a.push({x,w,h:minH+sr()*(maxH-minH),seed:Math.floor(sr()*1e6)});x+=w+2+sr()*8;}return a;}
const far=strip(40,26,60,60,220), near=strip(30,40,84,40,160);
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=$('screen').clientWidth;H=$('screen').clientHeight;cv.width=Math.ceil(W/PX);cv.height=Math.ceil(H/PX);ui.width=Math.round(W*DPR);ui.height=Math.round(H*DPR);}
function lerp(a,b,t){return a+(b-a)*t;}
function skyAt(a){let i=0;while(i<SKY.length-2&&a>SKY[i+1][0])i++;const A=SKY[i],B=SKY[i+1],t=Math.max(0,Math.min(1,(a-A[0])/(B[0]-A[0])));
  const c=k=>'rgb('+[0,1,2].map(j=>Math.round(lerp(A[k][j],B[k][j],t))).join(',')+')';return[c(1),c(2)];}
function burst(x,y,n,color,power){if(RM)return;for(let i=0;i<n;i++){const an=Math.random()*6.283,sp=(40+Math.random()*200)*power;
  parts.push({x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp-80*power,life:.7+Math.random()*.9,c:color,s:3+Math.random()*4,r:Math.random()*6.28,vr:(Math.random()-.5)*10});}}
function fxScore(tier){
  const n={1:10,2:16,3:24,4:34,5:48,6:90,'-1':8}[tier];
  if(tier<0){shake=1;burst(carX,carY,n,COL[-1],.4);tone(140,.3,0,'sawtooth',.05);return;}
  burst(carX,carY,n,COL[tier],tier===6?1.5:1);
  if(tier===6){flash=1;rain=1.6;burst(carX,carY,40,'#ffffff',1.2);}
  const notes=[523,659,784,988,1175,1568];for(let i=0;i<tier;i++)tone(notes[i],.18,i*.08);
}
function fxFinale(score){if(score>=600){rain=6;[784,988,1175,1568,1976].forEach((f,i)=>tone(f,.3,i*.12));}else if(score>=300){burst(carX,carY,50,COL[5],1.2);}}
function building(b,base,fill,win){
  g.fillStyle=fill;g.fillRect(b.x,base-b.h,b.w,b.h+4);if(!win)return;
  const r=Engine.rng(b.seed);g.fillStyle=win;
  for(let y=base-b.h+8;y<base-8;y+=12)for(let x=b.x+6;x<b.x+b.w-8;x+=10){if(r()<.42)g.fillRect(x,y,4,6);}
}
function frame(t){
  const dt=Math.min(.05,(t-tPrev)/1000||0);tPrev=t;
  alt+=(target-alt)*(RM?1:1-Math.exp(-dt*2.4));if(Math.abs(target-alt)<.3)alt=target;
  if(pend&&Math.abs(target-alt)<1&&t-pend.at>pend.wait){const cb=pend.cb;pend=null;cb();}
  onTick(Math.round(alt));
  const cx=Math.max(56,W*.15),cy=H*.47,Y=w=>cy+52+(alt-w)*PPU;
  g.setTransform(1/PX,0,0,1/PX,0,0);
  const sk=skyAt(alt),gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,sk[0]);gr.addColorStop(1,sk[1]);g.fillStyle=gr;g.fillRect(0,0,W,H);
  // stars
  const sa=Math.max(0,Math.min(1,(alt-220)/260));
  if(sa>0){g.fillStyle='#fff';for(const s of stars){g.globalAlpha=sa*(.45+.55*Math.sin(t/700+s.ph));const y=((s.y*H+alt*.12)%H+H)%H;g.beginPath();g.arc(s.x*W,y,s.r,0,6.283);g.fill();}g.globalAlpha=1;}
  // arena spotlights
  const la=Math.max(0,Math.min(1,(alt-430)/140));
  if(la>0){for(const [ox,ph] of [[0,0],[W,2.1],[W*.5,4.2]]){const ang=Math.PI/2+Math.sin(t/2300+ph)*.5,len=H*1.4,sp=.11;
    const lg=g.createLinearGradient(ox,0,ox+Math.cos(ang)*len,Math.sin(ang)*len);lg.addColorStop(0,'rgba(127,227,242,'+(.22*la)+')');lg.addColorStop(1,'rgba(127,227,242,0)');
    g.fillStyle=lg;g.beginPath();g.moveTo(ox,-10);g.lineTo(ox+Math.cos(ang-sp)*len,Math.sin(ang-sp)*len);g.lineTo(ox+Math.cos(ang+sp)*len,Math.sin(ang+sp)*len);g.closePath();g.fill();}}
  // clouds
  g.fillStyle='#fff';
  for(const c of clouds){c.x+=c.v*dt;if(c.x>1.25)c.x=-.25;if(c.x<-.25)c.x=1.25;const y=cy+(alt-c.w)*PPU*c.f;if(y<-80||y>H+80)continue;
    const x=c.x*W,k=c.s;g.globalAlpha=.16;g.beginPath();for(const [dx,dy,r] of [[0,0,30],[36,6,24],[-34,8,22],[14,-14,22],[66,12,15],[-62,14,13]]){g.moveTo(x+dx*k+r*k,y+dy*k);g.arc(x+dx*k,y+dy*k,r*k,0,6.283);}g.fill();}
  g.globalAlpha=1;
  // skyline and ground
  const baseFar=cy+52+alt*PPU*.6, base=Y(0);
  if(baseFar-240<H){for(const b of far)if(b.x<W)building(b,baseFar,'#0b2152',null);g.fillStyle='#0b2152';g.fillRect(0,baseFar,W,H);}
  if(base-180<H){for(const b of near)if(b.x<W)building(b,base,'#061533','rgba(242,193,78,.55)');g.fillStyle='#061533';g.fillRect(0,base,W,H);}
  // altitude ruler on the right edge (drawn sharp on the overlay canvas): a tick every 100 ft, a label every 500 ft, and a YOU marker
  u.setTransform(DPR,0,0,DPR,0,0);u.clearRect(0,0,W,H);u.font='17px VT323,monospace';u.textBaseline='middle';u.textAlign='right';u.lineWidth=2;
  const lo=Math.max(0,Math.floor((alt-(H-cy)/PPU)/10)*10),hi=alt+cy/PPU+10,yy=cy+52;
  for(let w=lo;w<=hi;w+=10){const y=Math.round(Y(w)),major=w%50===0;u.strokeStyle='rgba(143,165,201,.7)';u.beginPath();u.moveTo(W,y);u.lineTo(W-(major?20:9),y);u.stroke();
    if(major&&y>78&&Math.abs(y-yy)>11){u.fillStyle='rgba(143,165,201,.95)';u.fillText(w===0?'GROUND':Engine.ft(w)+' ft',W-25,y);}}
  u.strokeStyle='#f2c14e';u.beginPath();u.moveTo(W,yy);u.lineTo(W-26,yy);u.stroke();u.fillStyle='#f2c14e';u.fillText('YOU',W-31,yy);
  // glass trophy waiting above 7,000 ft
  const ty=Y(TROPHY);
  if(ty>-80&&ty<H+80){const pu=.75+.25*Math.sin(t/500),rg=g.createRadialGradient(cx,ty,4,cx,ty,90);rg.addColorStop(0,'rgba(127,227,242,'+(.45*pu)+')');rg.addColorStop(1,'rgba(127,227,242,0)');
    g.fillStyle=rg;g.fillRect(cx-90,ty-90,180,180);
    const P=[[0,-30],[17,-12],[11,22],[-11,22],[-17,-12]];g.beginPath();P.forEach(([x,y],i)=>i?g.lineTo(cx+x,ty+y):g.moveTo(cx+x,ty+y));g.closePath();
    g.fillStyle='rgba(190,244,252,.35)';g.fill();g.strokeStyle='#d8fbff';g.lineWidth=1.5;g.stroke();
    g.beginPath();g.moveTo(cx,ty-30);g.lineTo(cx,ty+22);g.moveTo(cx-17,ty-12);g.lineTo(cx+17,ty-12);g.moveTo(cx-17,ty-12);g.lineTo(cx,ty+22);g.lineTo(cx+17,ty-12);g.strokeStyle='rgba(216,251,255,.6)';g.stroke();
    g.fillStyle='#f2c14e';g.fillRect(cx-16,ty+22,32,6);g.fillRect(cx-22,ty+28,44,5);}
  // elevator car
  const bob=RM?0:Math.sin(t/600)*3,sx=shake>0?(Math.random()-.5)*shake*12:0;shake=Math.max(0,shake-dt*2.5);
  const X=cx+sx,Yc=cy+bob;carX=W/2;carY=H*.3;
  g.strokeStyle='rgba(238,243,251,.28)';g.lineWidth=2;g.beginPath();g.moveTo(X,Yc-50);g.lineTo(cx,-10);g.stroke();
  const rising=target-alt;
  if(rising>2&&!RM){g.strokeStyle='rgba(127,227,242,.55)';g.lineWidth=2;for(let i=0;i<7;i++){const lx=X-30+i*10,l=14+Math.random()*Math.min(70,rising*2);g.beginPath();g.moveTo(lx,Yc+54);g.lineTo(lx,Yc+54+l);g.stroke();}}
  g.save();g.translate(X,Yc);g.scale(1.5,1.5);g.translate(-X,-Yc);g.beginPath();if(g.roundRect)g.roundRect(X-23,Yc-30,46,62,9);else g.rect(X-23,Yc-30,46,62);
  g.fillStyle='rgba(127,227,242,.16)';g.fill();g.strokeStyle='#7fe3f2';g.lineWidth=2;g.stroke();
  g.fillStyle='#7fe3f2';g.fillRect(X-27,Yc-34,54,5);g.fillRect(X-27,Yc+30,54,5);
  g.fillStyle='#eef3fb';g.beginPath();g.arc(X,Yc-9,6.5,0,6.283);g.fill();
  g.beginPath();g.moveTo(X-12,Yc+28);g.lineTo(X-10,Yc+4);g.quadraticCurveTo(X,Yc-3,X+10,Yc+4);g.lineTo(X+12,Yc+28);g.closePath();g.fillStyle='#1b3f8f';g.fill();g.strokeStyle='#eef3fb';g.lineWidth=1;g.stroke();
  g.fillStyle='#eef3fb';g.beginPath();g.moveTo(X-4,Yc+1);g.lineTo(X+4,Yc+1);g.lineTo(X,Yc+12);g.closePath();g.fill();
  g.fillStyle='#f2c14e';g.beginPath();g.moveTo(X-1.6,Yc+2);g.lineTo(X+1.6,Yc+2);g.lineTo(X+2.2,Yc+12);g.lineTo(X,Yc+15);g.lineTo(X-2.2,Yc+12);g.closePath();g.fill();
  g.restore();
  // confetti
  if(rain>0&&!RM){rain-=dt;const cs=[COL[6],COL[5],'#ffffff',COL[3]];for(let i=0;i<3;i++)parts.push({x:Math.random()*W,y:-10,vx:(Math.random()-.5)*60,vy:60+Math.random()*120,life:3.5,c:cs[i%4],s:4+Math.random()*4,r:Math.random()*6.28,vr:(Math.random()-.5)*8});}
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life-=dt;if(p.life<=0||p.y>H+20){parts.splice(i,1);continue;}
    p.vy+=260*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.globalAlpha=Math.min(1,p.life*2);g.fillStyle=p.c;g.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);g.restore();}
  g.globalAlpha=1;
  if(flash>0){g.fillStyle='rgba(200,246,255,'+(flash*.35)+')';g.fillRect(0,0,W,H);flash=Math.max(0,flash-dt*2);}
  requestAnimationFrame(frame);
}
// ---------- sound ----------
let AC=null,sndOn=true;
try{sndOn=localStorage.getItem('decallion-snd')!=='off';}catch(e){}
function wake(){if(!sndOn)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();}catch(e){}}
function tone(f,d,delay,type,vol){if(!sndOn||!AC)return;try{const o=AC.createOscillator(),v=AC.createGain(),t0=AC.currentTime+(delay||0);
  o.type=type||'triangle';o.frequency.value=f;v.gain.setValueAtTime(vol||.08,t0);v.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(v);v.connect(AC.destination);o.start(t0);o.stop(t0+d+.02);}catch(e){}}



window.Scene={
  start(){resize();addEventListener('resize',resize);requestAnimationFrame(frame);},
  /* Move the elevator to a score. If cb is given it fires once the car has arrived and at least `wait` ms have passed. */
  climbTo(v,wait,cb){target=v;pend=cb?{at:performance.now(),wait:wait||0,cb}:null;},
  reset(){target=0;pend=null;rain=0;},
  onTick(fn){onTick=fn;},
  fxScore,fxFinale,tone,wake,
  soundOn:()=>sndOn,
  toggleSound(){sndOn=!sndOn;try{localStorage.setItem('decallion-snd',sndOn?'on':'off');}catch(e){}wake();return sndOn;}
};
})();
