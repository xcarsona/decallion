/* Decallion engine: pure game logic with no page access. Levels, answer matching, round building, data checks. */
(function(root){
const LEVELS={
  1:{name:'Roll Call',pts:10,emoji:'⬜',color:'#9db0cf',note:'Present. So was everyone else.'},
  2:{name:'Club Meeting',pts:25,emoji:'🟪',color:'#c7abff',note:'Solid. Half the chapter said it too.'},
  3:{name:'Districts',pts:45,emoji:'🟦',color:'#74a9ff',note:'Sharp. That one places.'},
  4:{name:'State',pts:65,emoji:'🟧',color:'#e3a071',note:'Rare. Judges look up for that.'},
  5:{name:'ICDC',pts:80,emoji:'🟨',color:'#f2c14e',note:'Elite. Few rooms ever hear it.'},
  6:{name:'DECA Glass',pts:100,emoji:'💎',color:'#7fe3f2',note:'One in a Decallion.'}};
const MISS_COLOR='#ff8676', SECONDS=25, ROUND_SIZE=7, STRIKES=3;
const DIFFS={1:'Easy',2:'Medium',3:'Hard'};

function norm(s){return String(s).toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9 ]/g,' ').replace(/\b(the|a|an)\b/g,' ').replace(/\s+/g,'');}
function lev(a,b){const m=a.length,n=b.length;if(Math.abs(m-n)>2)return 9;let p=[...Array(n+1).keys()];
  for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c;}return p[n];}
/* Returns the matching answer row or null. Exact and plural-insensitive matches win; otherwise one typo is forgiven in 5+ letter answers, two in 8+. */
function match(question,input){
  const x=norm(input);if(!x)return null;const xs=x.replace(/s$/,'');let best=null,bd=9;
  for(const row of question.a)for(const alias of [row[0],...row.slice(2)]){
    const y=norm(alias),ys=y.replace(/s$/,'');if(x===y||xs===ys)return row;
    const tol=y.length>=8?2:y.length>=5?1:0,d=lev(x,y);if(d<=tol&&d<bd){bd=d;best=row;}}
  return best;
}
function score(row){return row?LEVELS[row[1]].pts:0;}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function shuffle(arr,rand){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function dayKey(d){d=d||new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function prevDayKey(key){const d=new Date(Math.floor(key/10000),Math.floor(key/100)%100-1,key%100);d.setDate(d.getDate()-1);return dayKey(d);}
function pool(questions,opts){opts=opts||{};return questions.filter(q=>(!opts.cats||opts.cats.indexOf(q.cat)>=0)&&(!opts.diff||q.diff===opts.diff));}
/* Picks n prompts, preferring categories not yet used so a round is varied. */
function spread(list,n){const out=[],seen={};for(const q of list){if(out.length>=n)break;if(!seen[q.cat]){seen[q.cat]=1;out.push(q);}}
  for(const q of list){if(out.length>=n)break;if(out.indexOf(q)<0)out.push(q);}return out;}
function buildRound(questions,opts){
  opts=opts||{};
  if(opts.mode==='daily')return spread(shuffle(questions,rng(opts.seed||dayKey())),ROUND_SIZE);
  if(opts.mode==='endless')return shuffle(questions,Math.random);
  return spread(shuffle(pool(questions,opts),Math.random),ROUND_SIZE);
}
/* Data checks, run on load and in tests, so a bad edit to the bank is reported instead of silently breaking a prompt. */
function validate(questions,categories){
  const out=[],ids={};
  for(const q of questions){
    if(!q.id||ids[q.id])out.push('duplicate or missing id: '+q.id);ids[q.id]=1;
    if(categories&&categories.indexOf(q.cat)<0)out.push(q.id+': unknown category '+q.cat);
    if(!q.q||!q.why||!q.area||!DIFFS[q.diff])out.push(q.id+': missing q, why, area or diff');
    if(!q.a||q.a.length<4)out.push(q.id+': needs at least 4 answers');
    const seen={};let glass=false;
    for(const r of q.a||[]){if(!LEVELS[r[1]])out.push(q.id+': bad level on '+r[0]);if(r[1]===6)glass=true;
      for(const al of [r[0],...r.slice(2)]){const k=norm(al).replace(/s$/,'');if(seen[k]&&seen[k]!==r[0])out.push(q.id+': "'+al+'" matches both '+seen[k]+' and '+r[0]);seen[k]=r[0];}}
    if(!glass)out.push(q.id+': no DECA Glass answer');
  }
  return out;
}
const ft=p=>(p*10).toLocaleString('en-US');
root.Engine={LEVELS,MISS_COLOR,SECONDS,ROUND_SIZE,STRIKES,DIFFS,norm,match,score,rng,shuffle,dayKey,prevDayKey,pool,buildRound,validate,ft};
})(typeof window!=='undefined'?window:globalThis);
