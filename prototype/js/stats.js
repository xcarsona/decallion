/* Decallion player statistics. Kept in this browser's storage; falls back to memory for the session if storage is unavailable. */
(function(root){
const KEY='decallion-stats-v1';
function blank(){return{games:0,prompts:0,pts:0,levels:{1:0,2:0,3:0,4:0,5:0,6:0,miss:0},cats:{},best:{daily:0,practice:0,endless:0},daily:{last:0,streak:0,bestStreak:0,score:0},recent:[]};}
let data=null,persistent=true;
function load(){if(data)return data;try{const raw=localStorage.getItem(KEY);data=raw?Object.assign(blank(),JSON.parse(raw)):blank();}catch(e){persistent=false;data=blank();}return data;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){persistent=false;}}
/* result: {mode, score, dayKey, prevDayKey, log:[{cat, level (1-6 or -1), pts}]}. Returns what changed, for the results screen. */
function record(result){
  const s=load(),out={newBest:false,previousBest:s.best[result.mode]||0,streak:s.daily.streak};
  s.games++;
  for(const l of result.log){s.prompts++;s.pts+=l.pts;s.levels[l.level<0?'miss':l.level]++;
    const c=s.cats[l.cat]||(s.cats[l.cat]={n:0,pts:0,glass:0});c.n++;c.pts+=l.pts;if(l.level===6)c.glass++;}
  if(result.score>(s.best[result.mode]||0)){s.best[result.mode]=result.score;out.newBest=true;}
  if(result.mode==='daily'){s.daily.streak=(s.daily.last===result.prevDayKey)?s.daily.streak+1:1;s.daily.last=result.dayKey;s.daily.score=result.score;
    s.daily.bestStreak=Math.max(s.daily.bestStreak,s.daily.streak);out.streak=s.daily.streak;}
  s.recent.unshift({day:result.dayKey,mode:result.mode,score:result.score,n:result.log.length});s.recent=s.recent.slice(0,8);
  save();return out;
}
function dailyDone(dayKey){return load().daily.last===dayKey;}
/* A streak only counts if the last daily was today or yesterday. */
function liveStreak(dayKey,prevDayKey){const d=load().daily;return(d.last===dayKey||d.last===prevDayKey)?d.streak:0;}
function reset(){data=blank();save();}
root.Stats={load,record,dailyDone,liveStreak,reset,isPersistent:()=>persistent};
})(typeof window!=='undefined'?window:globalThis);
