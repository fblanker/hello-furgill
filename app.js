const STORAGE_KEY='fit10-data-v1';
const todayISO=()=>new Date().toISOString().slice(0,10);
const defaultData={settings:{name:'',startDate:todayISO(),heightCm:'',stepsGoal:8000,waterGoal:2,targetWeight:''},daily:{},progress:[],theme:'light'};
let state=load();
let selectedDate=todayISO();

const trainingPlan=[
  ['8× 2 min lopen / 1 min wandelen','6× 3 min / 1 min wandelen','35 min rustig run/walk'],
  ['6× 4 min / 1 min wandelen','5× 5 min / 1 min wandelen','40 min rustig'],
  ['4× 7 min / 1 min wandelen','3× 10 min / 1 min wandelen','45 min rustig'],
  ['2× 15 min / 2 min wandelen','25 min onafgebroken','50 min rustig'],
  ['Interval: 6× 2 min stevig / 2 min rustig','30 min easy','5 km rustig'],
  ['Interval: 6× 2,5 min stevig / 2 min rustig','35 min easy','5,5 km rustig'],
  ['Interval: 5× 3 min stevig / 2 min rustig','30 min easy + 4×1 min vlot','6 km rustig'],
  ['Interval: 6× 3 min stevig / 90 sec rustig','40 min easy','6,5 km rustig'],
  ['Interval: 5× 4 min stevig / 2 min rustig','30 min easy + 5×1 min vlot','7 km rustig'],
  ['Interval: 4× 5 min stevig / 2 min rustig','35 min easy','7,5 km rustig'],
  ['Interval: 5× 2 min vlot + 4×30 sec snel','35 min easy','8 km rustig'],
  ['Tempoblok: 3× 6 min stevig / 3 min easy','35 min easy','8,5 km rustig'],
  ['Interval: 4× 4 min op stevig tempo','30 min licht','9 km rustig'],
  ['20–30 min easy + 4 korte versnellingen','20–25 min heel rustig','10 km onafgebroken 🎯']
];

const meals={
  ontbijt:[
    {name:'Kwarkbowl',desc:'400 g magere kwark, banaan, bessen, 30 g havermout',kcal:520},
    {name:'Havermout + fruit',desc:'60 g havermout, melk, banaan, kaneel, 150 g skyr',kcal:500},
    {name:'Eieren & brood',desc:'3 eieren, 3 volkoren boterhammen, tomaat/komkommer',kcal:540},
    {name:'Skyr crunch',desc:'400 g skyr, appel, 30 g granola, kaneel',kcal:480}
  ],
  lunch:[
    {name:'Loaded kipwraps',desc:'2 wraps, kip, veel sla/groente, salsa, yoghurtsaus',kcal:650},
    {name:'Broodlunch',desc:'4 volkoren boterhammen, kipfilet/eieren, rauwkost, fruit',kcal:620},
    {name:'Rijst-kip bowl',desc:'150–200 g gekookte rijst, kip en 300 g groenten',kcal:680},
    {name:'Chili bowl',desc:'Mager gehakt, kidneybonen, tomaat, paprika en mais',kcal:700}
  ],
  avondeten:[
    {name:'Chicken potato bowl',desc:'350 g aardappelen, kip, broccoli/paprika, yoghurtsaus',kcal:720},
    {name:'Volume pasta bolognese',desc:'Pasta, mager gehakt en veel courgette/champignons/wortel',kcal:760},
    {name:'Maaltijdsoep',desc:'Kip, linzen/bonen, aardappel en veel groenten',kcal:650},
    {name:'Rijstwok',desc:'Kip, rijst, 350 g wokgroenten, soja/chili',kcal:740}
  ]
};
const snacks=['Fruit','Magere kwark','Skyr','Gekookte eieren','Popcorn zonder veel olie','Rauwkost + yoghurtdip'];

function load(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    return {...defaultData,...saved,settings:{...defaultData.settings,...(saved.settings||{})},daily:saved.daily||{},progress:saved.progress||[]};
  }catch{return structuredClone(defaultData)}
}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderAll()}
function day(){const d=selectedDate;state.daily[d]??={meals:{ontbijt:0,lunch:0,avondeten:0},snacks:[],workoutDone:false,steps:'',water:'',note:''};return state.daily[d]}
function weekIndex(date=selectedDate){const s=new Date(state.settings.startDate+'T00:00:00');const n=new Date(date+'T00:00:00');const diff=Math.floor((n-s)/86400000);return Math.min(13,Math.max(0,Math.floor(diff/7)))}
function dayOfWeek(date=selectedDate){return new Date(date+'T12:00:00').getDay()}
function workoutForToday(){const w=trainingPlan[weekIndex()];const dow=dayOfWeek(); if([2,3].includes(dow))return {label:'Training 1 • interval',text:w[0]}; if([4,5].includes(dow))return {label:'Training 2 • easy',text:w[1]}; if([0,6].includes(dow))return {label:'Lange duurloop',text:w[2]}; return {label:'Herstel / wandelen',text:'Geen looptraining gepland. Wandel rustig en herstel.'}}
function selectedMeal(type){return meals[type][day().meals[type]??0]}
function dateObj(iso){return new Date(`${iso}T12:00:00`)}
function daysBetween(a,b){return (dateObj(b)-dateObj(a))/86400000}
function formatDate(iso){return new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short',year:'numeric'}).format(dateObj(iso))}
function addDays(iso,days){const d=dateObj(iso);d.setDate(d.getDate()+Math.round(days));return d.toISOString().slice(0,10)}
function bmiFor(weight){const h=+state.settings.heightCm/100;return Number.isFinite(+weight)&&h>0?+(+weight/(h*h)).toFixed(1):null}
function weightPoints(){return state.progress.filter(x=>Number.isFinite(+x.weight)&&x.weight!=null).map(x=>({date:x.date,value:+x.weight})).sort((a,b)=>a.date.localeCompare(b.date))}
function stepsPoints(){return Object.entries(state.daily).filter(([,d])=>Number.isFinite(+d.steps)&&+d.steps>0).map(([date,d])=>({date,value:+d.steps})).sort((a,b)=>a.date.localeCompare(b.date))}
function uniqueDailyPoints(points){const map=new Map();points.forEach(p=>map.set(p.date,p));return [...map.values()].sort((a,b)=>a.date.localeCompare(b.date))}
function linearRegression(points){
  const p=uniqueDailyPoints(points);
  if(p.length<2)return null;
  const first=p[0].date;
  const xs=p.map(x=>daysBetween(first,x.date));
  const ys=p.map(x=>x.value);
  const n=p.length,sx=xs.reduce((a,b)=>a+b,0),sy=ys.reduce((a,b)=>a+b,0),sxy=xs.reduce((a,x,i)=>a+x*ys[i],0),sxx=xs.reduce((a,x)=>a+x*x,0);
  const den=n*sxx-sx*sx;if(!den)return null;
  const slope=(n*sxy-sx*sy)/den,intercept=(sy-slope*sx)/n;
  return {slope,intercept,first};
}
function goalProjection(points,target){
  const p=uniqueDailyPoints(points).slice(-10);
  if(!Number.isFinite(+target)||p.length<3)return {status:'insufficient'};
  const span=daysBetween(p[0].date,p[p.length-1].date);
  if(span<7)return {status:'insufficient'};
  const latest=p[p.length-1],targetNum=+target;
  const direction=Math.sign(targetNum-latest.value);
  if(direction===0||((direction<0)&&latest.value<=targetNum)||((direction>0)&&latest.value>=targetNum))return {status:'reached',date:latest.date,weeklyRate:0};
  const reg=linearRegression(p);if(!reg||!Number.isFinite(reg.slope)||Math.abs(reg.slope)<0.005)return {status:'flat'};
  if(Math.sign(reg.slope)!==direction)return {status:'wrong_direction',weeklyRate:reg.slope*7};
  const remainingDays=(targetNum-latest.value)/reg.slope;
  if(!Number.isFinite(remainingDays)||remainingDays<=0||remainingDays>1095)return {status:'unreliable',weeklyRate:reg.slope*7};
  return {status:'forecast',date:addDays(latest.date,remainingDays),days:remainingDays,weeklyRate:reg.slope*7,target:targetNum};
}

function init(){
 document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>showView(b.dataset.view));
 document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>showView(b.dataset.jump));
 document.getElementById('themeBtn').onclick=()=>{state.theme=state.theme==='dark'?'light':'dark';save()};
 document.getElementById('prevDay').onclick=()=>changeDay(-1);
 document.getElementById('nextDay').onclick=()=>changeDay(1);
 document.getElementById('workoutDone').onchange=e=>{day().workoutDone=e.target.checked;save()};
 ['stepsInput','waterInput','dailyNote'].forEach(id=>document.getElementById(id).addEventListener('input',e=>{const map={stepsInput:'steps',waterInput:'water',dailyNote:'note'};day()[map[id]]=e.target.value;localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderTodaySummary();if(id==='stepsInput')renderProgressCharts()}));
 document.getElementById('weekSelect').onchange=e=>renderTraining(+e.target.value);
 document.getElementById('randomizeMeals').onclick=()=>{['ontbijt','lunch','avondeten'].forEach(t=>day().meals[t]=Math.floor(Math.random()*meals[t].length));save()};
 document.getElementById('saveProgress').onclick=saveProgress;
 document.getElementById('saveSettings').onclick=saveSettings;
 document.getElementById('exportBtn').onclick=exportData;
 document.getElementById('importInput').onchange=importData;
 document.getElementById('resetBtn').onclick=()=>{if(confirm('Weet je zeker dat je alle Fit10-gegevens wilt wissen?')){localStorage.removeItem(STORAGE_KEY);state=structuredClone(defaultData);save()}};
 renderAll();
}
function changeDay(delta){const d=dateObj(selectedDate);d.setDate(d.getDate()+delta);selectedDate=d.toISOString().slice(0,10);renderAll()}
function showView(id){document.querySelectorAll('.view,.tab').forEach(el=>el.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelector(`.tab[data-view="${id}"]`).classList.add('active');if(id==='progress')renderProgress();window.scrollTo({top:0,behavior:'smooth'})}
function renderAll(){document.documentElement.classList.toggle('dark',state.theme==='dark');renderToday();renderMealPicker();renderProgress();renderSettings();populateWeekSelect();renderTraining(weekIndex())}
function renderToday(){const d=day();const w=workoutForToday();const name=state.settings.name?`, ${state.settings.name}`:'';document.getElementById('greeting').textContent=`Jouw plan voor vandaag${name}`;document.getElementById('weekPill').textContent=`Week ${weekIndex()+1}`;document.getElementById('todayTitle').textContent=new Intl.DateTimeFormat('nl-NL',{weekday:'long',day:'numeric',month:'long'}).format(dateObj(selectedDate));document.getElementById('todaySubtitle').textContent='Eén dag tegelijk: trainen, goed eten en herstellen.';document.getElementById('todayWorkout').innerHTML=`<span class="eyebrow">${w.label}</span><h3>${w.text}</h3>`;document.getElementById('workoutDone').checked=!!d.workoutDone;document.getElementById('stepsInput').value=d.steps??'';document.getElementById('waterInput').value=d.water??'';document.getElementById('dailyNote').value=d.note??'';document.getElementById('stepsGoalText').textContent=Number(state.settings.stepsGoal||8000).toLocaleString('nl-NL');document.getElementById('waterGoalText').textContent=`${state.settings.waterGoal||2} L`;renderTodaySummary()}
function renderTodaySummary(){const d=day();const parts=['ontbijt','lunch','avondeten'];document.getElementById('mealSummary').innerHTML=parts.map(t=>{const m=selectedMeal(t);return `<div class="meal-mini"><span>${t[0].toUpperCase()+t.slice(1)}</span><strong>${m.name}</strong><small>${m.kcal} kcal</small></div>`}).join('');const total=parts.reduce((sum,t)=>sum+selectedMeal(t).kcal,0);document.getElementById('mealTotal').textContent=`${total.toLocaleString('nl-NL')} kcal`;
 const stepsGoal=+state.settings.stepsGoal||8000, waterGoal=+state.settings.waterGoal||2;
 const steps=+d.steps||0, water=+d.water||0;
 let score=0;if(d.workoutDone)score+=40;if(steps>=stepsGoal)score+=20;if(water>=waterGoal)score+=20;if(parts.every(t=>d.meals[t]!==undefined))score+=20;
 document.getElementById('dayScore').textContent=`${score}%`;
 const ring=document.getElementById('scoreRing');if(ring)ring.style.setProperty('--progress',`${score*3.6}deg`);
 const workoutMetric=document.getElementById('workoutMetric');if(workoutMetric)workoutMetric.textContent=d.workoutDone?'Klaar ✓':'Gepland';
 const stepsMetric=document.getElementById('stepsMetric');if(stepsMetric)stepsMetric.textContent=`${steps.toLocaleString('nl-NL')} / ${stepsGoal.toLocaleString('nl-NL')}`;
 const waterMetric=document.getElementById('waterMetric');if(waterMetric)waterMetric.textContent=`${String(water).replace('.',',')} / ${String(waterGoal).replace('.',',')} L`;
 const calorieMetric=document.getElementById('calorieMetric');if(calorieMetric)calorieMetric.textContent=`${total.toLocaleString('nl-NL')} kcal`;
 const stepsBar=document.getElementById('stepsBar');if(stepsBar)stepsBar.style.width=`${Math.min(100,(steps/stepsGoal)*100)}%`;
 const waterBar=document.getElementById('waterBar');if(waterBar)waterBar.style.width=`${Math.min(100,(water/waterGoal)*100)}%`;
}
function populateWeekSelect(){const el=document.getElementById('weekSelect');if(el.options.length===14){el.value=weekIndex();return}el.innerHTML=trainingPlan.map((_,i)=>`<option value="${i}">Week ${i+1}</option>`).join('');el.value=weekIndex()}
function renderTraining(i){document.getElementById('weekSelect').value=i;const names=['Training 1','Training 2','Lange duurloop'];document.getElementById('weekTraining').innerHTML=trainingPlan[i].map((x,j)=>`<article class="card workout-card"><div class="workout-day">${names[j]}</div><div><h3>${x}</h3><p>${j===0?'Snelheid / loopkwaliteit':j===1?'Rustige duur / techniek':'Afstand opbouwen'}</p></div>${i===weekIndex()&&j===2?'<span class="done-badge">DEZE WEEK</span>':''}</article>`).join('')}
function renderMealPicker(){const root=document.getElementById('mealPicker');root.innerHTML=['ontbijt','lunch','avondeten'].map(type=>`<article class="card meal-section"><h3>${type[0].toUpperCase()+type.slice(1)}</h3>${meals[type].map((m,i)=>`<label class="meal-option"><input type="radio" name="${type}" value="${i}" ${day().meals[type]===i?'checked':''}><div><h4>${m.name}</h4><p>${m.desc}</p></div><div class="kcal">${m.kcal} kcal</div></label>`).join('')}</article>`).join('');root.querySelectorAll('input[type=radio]').forEach(r=>r.onchange=e=>{day().meals[e.target.name]=+e.target.value;save()});const chips=document.getElementById('snackChips');chips.innerHTML=snacks.map(s=>`<button class="chip ${day().snacks.includes(s)?'selected':''}" data-snack="${s}">${s}</button>`).join('');chips.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{const s=c.dataset.snack;const arr=day().snacks;arr.includes(s)?arr.splice(arr.indexOf(s),1):arr.push(s);save()})}
function saveProgress(){const w=parseFloat(document.getElementById('weightInput').value);const r=parseFloat(document.getElementById('longestRunInput').value);const t=parseFloat(document.getElementById('tenKTimeInput').value);if(!Number.isFinite(w)&&!Number.isFinite(r)&&!Number.isFinite(t))return alert('Vul minimaal één meting in.');state.progress.push({date:todayISO(),weight:Number.isFinite(w)?w:null,longestRun:Number.isFinite(r)?r:null,tenKTime:Number.isFinite(t)?t:null});['weightInput','longestRunInput','tenKTimeInput'].forEach(id=>document.getElementById(id).value='');save()}

function renderProgress(){
 const p=state.progress,weights=weightPoints(),latestWeight=weights[weights.length-1],firstWeight=weights[0],latest=p[p.length-1]||{};
 const delta=(latestWeight&&firstWeight)?(latestWeight.value-firstWeight.value).toFixed(1):'–';
 const latestBmi=latestWeight?bmiFor(latestWeight.value):null;
 const recentSteps=stepsPoints().slice(-7);const avgSteps=recentSteps.length?Math.round(recentSteps.reduce((s,x)=>s+x.value,0)/recentSteps.length):null;
 const projection=goalProjection(weights,+state.settings.targetWeight);
 const expected=projection.status==='forecast'?formatDate(projection.date):projection.status==='reached'?'Bereikt':'–';
 document.getElementById('progressStats').innerHTML=`
   <div class="stat"><span>Laatste gewicht</span><strong>${latestWeight?latestWeight.value+' kg':'–'}</strong></div>
   <div class="stat"><span>Laatste BMI</span><strong>${latestBmi??'–'}</strong></div>
   <div class="stat"><span>Gewichtsverandering</span><strong>${delta==='–'?'–':delta+' kg'}</strong></div>
   <div class="stat"><span>Gem. stappen (7 logs)</span><strong>${avgSteps!=null?avgSteps.toLocaleString('nl-NL'):'–'}</strong></div>
   <div class="stat"><span>Langste run</span><strong>${latest.longestRun??'–'}${latest.longestRun!=null?' km':''}</strong></div>
   <div class="stat"><span>Verwacht doel bereikt</span><strong class="stat-date">${expected}</strong></div>`;
 renderGoalForecast(weights,projection);
 renderProgressCharts(weights,projection);
 document.getElementById('progressHistory').innerHTML=p.length?[...p].reverse().map(x=>{const bmi=x.weight!=null?bmiFor(x.weight):null;return `<div class="history-row"><strong>${formatDate(x.date)}</strong><span>${x.weight??'–'}${x.weight!=null?' kg':''}</span><span>${bmi??'–'}</span><span>${x.longestRun??'–'}${x.longestRun!=null?' km':''}</span><span>${x.tenKTime??'–'}${x.tenKTime!=null?' min':''}</span></div>`}).join(''):'<p class="muted">Nog geen metingen opgeslagen.</p>';
}
function renderGoalForecast(weights,projection){
 const el=document.getElementById('goalForecast');if(!el)return;
 const target=+state.settings.targetWeight,latest=weights[weights.length-1],height=+state.settings.heightCm;
 if(!Number.isFinite(target)||target<=0){el.innerHTML=`<div class="forecast-icon">◎</div><div><span class="section-label">DOELPROGNOSE</span><h3>Stel eerst je doelgewicht in</h3><p>Ga naar Instellingen en vul je doelgewicht in. Daarna kan Fit10 je trend naar het doel berekenen.</p></div>`;return}
 if(!latest){el.innerHTML=`<div class="forecast-icon">↗</div><div><span class="section-label">DOELPROGNOSE</span><h3>Log je eerste gewichtsmeting</h3><p>Na meerdere metingen kan Fit10 je voortgang doortrekken naar een verwachte doeldatum.</p></div>`;return}
 const targetBmi=height>0?bmiFor(target):null;
 const targetText=targetBmi!=null?`${target} kg • BMI ${targetBmi}`:`${target} kg`;
 if(projection.status==='reached'){el.innerHTML=`<div class="forecast-icon forecast-good">✓</div><div><span class="section-label">DOELPROGNOSE</span><h3>Doel bereikt</h3><p>Je laatste meting is ${latest.value} kg en je ingestelde doel is ${targetText}.</p></div>`;return}
 if(projection.status==='forecast'){
   const weeks=Math.max(1,Math.round(projection.days/7));const rate=Math.abs(projection.weeklyRate).toFixed(2).replace('.',',');
   el.innerHTML=`<div class="forecast-icon">⌁</div><div class="forecast-copy"><span class="section-label">VERWACHT DOEL BEREIKT</span><h3>${formatDate(projection.date)}</h3><p>Op basis van je recente trend van ongeveer <strong>${rate} kg per week</strong> ligt ${targetText} naar schatting over <strong>${weeks} weken</strong> binnen bereik.</p><small>Dit is een lineaire schatting op basis van je eigen metingen, geen garantie. Nieuwe metingen passen de prognose automatisch aan.</small></div>`;return
 }
 const msg=projection.status==='insufficient'?'Log minimaal 3 gewichtsmetingen verspreid over minstens 7 dagen om een bruikbare prognose te maken.':projection.status==='wrong_direction'?'Je recente trend beweegt nog niet richting je ingestelde doelgewicht. Zodra dat verandert, verschijnt hier automatisch een verwachte doeldatum.':'De huidige trend is nog te vlak of te wisselend om een betrouwbare doeldatum te berekenen.';
 el.innerHTML=`<div class="forecast-icon">…</div><div><span class="section-label">DOELPROGNOSE</span><h3>Nog geen betrouwbare doeldatum</h3><p>${msg}</p></div>`;
}

function renderProgressCharts(weights=weightPoints(),projection=goalProjection(weightPoints(),+state.settings.targetWeight)){
 const steps=stepsPoints().slice(-60);const stepGoal=+state.settings.stepsGoal||8000;
 drawLineChart('stepsChart',steps,{unit:' stappen',decimals:0,goal:stepGoal,goalLabel:'Dagdoel'});
 document.getElementById('stepsChartBadge').textContent=`Doel ${stepGoal.toLocaleString('nl-NL')}`;
 const target=+state.settings.targetWeight;
 drawLineChart('weightChart',weights,{unit:' kg',decimals:1,goal:Number.isFinite(target)&&target>0?target:null,goalLabel:'Doelgewicht',projection:projection.status==='forecast'?{date:projection.date,value:target}:null});
 const latestWeight=weights[weights.length-1];document.getElementById('weightChartBadge').textContent=latestWeight?`${latestWeight.value.toFixed(1).replace('.',',')} kg`:'kg';
 const bmiPoints=weights.map(p=>({date:p.date,value:bmiFor(p.value)})).filter(p=>p.value!=null);const targetBmi=Number.isFinite(target)&&target>0?bmiFor(target):null;
 drawLineChart('bmiChart',bmiPoints,{unit:'',decimals:1,goal:targetBmi,goalLabel:'BMI bij doelgewicht',projection:projection.status==='forecast'&&targetBmi!=null?{date:projection.date,value:targetBmi}:null});
 const latestBmi=bmiPoints[bmiPoints.length-1];document.getElementById('bmiChartBadge').textContent=latestBmi?`BMI ${latestBmi.value.toFixed(1).replace('.',',')}`:'BMI';
}
function drawLineChart(id,rawPoints,opts={}){
 const el=document.getElementById(id);if(!el)return;
 const points=uniqueDailyPoints(rawPoints).filter(p=>Number.isFinite(p.value));
 if(!points.length){el.innerHTML=`<div class="chart-empty">Nog geen gegevens om te tonen.</div>`;return}
 const W=760,H=270,pad={l:54,r:24,t:25,b:42};
 const firstDate=points[0].date,lastDate=opts.projection?.date||points[points.length-1].date;
 const t0=dateObj(firstDate).getTime(),t1=Math.max(t0+86400000,dateObj(lastDate).getTime());
 const values=points.map(p=>p.value);if(Number.isFinite(opts.goal))values.push(+opts.goal);if(opts.projection)values.push(opts.projection.value);
 let min=Math.min(...values),max=Math.max(...values);let span=max-min;if(span===0)span=Math.max(1,Math.abs(max)*.1);min-=span*.15;max+=span*.15;
 if(opts.decimals===0)min=Math.max(0,min);
 const x=d=>pad.l+((dateObj(d).getTime()-t0)/(t1-t0))*(W-pad.l-pad.r);
 const y=v=>pad.t+(1-(v-min)/(max-min))*(H-pad.t-pad.b);
 const fmt=v=>opts.decimals===0?Math.round(v).toLocaleString('nl-NL'):(+v).toFixed(opts.decimals??1).replace('.',',');
 const line=points.map(p=>`${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
 let grid='';for(let i=0;i<4;i++){const val=max-(max-min)*(i/3),yy=y(val);grid+=`<line class="chart-gridline" x1="${pad.l}" y1="${yy}" x2="${W-pad.r}" y2="${yy}"/><text class="chart-axis-label" x="${pad.l-9}" y="${yy+4}" text-anchor="end">${fmt(val)}</text>`}
 let goal='';if(Number.isFinite(opts.goal)){const gy=y(+opts.goal);goal=`<line class="chart-goal" x1="${pad.l}" y1="${gy}" x2="${W-pad.r}" y2="${gy}"/><text class="chart-goal-label" x="${W-pad.r}" y="${gy-7}" text-anchor="end">${opts.goalLabel||'Doel'} ${fmt(opts.goal)}</text>`}
 let trend='';const reg=linearRegression(points);if(reg&&points.length>=2){const start=points[0],end=points[points.length-1],sx=daysBetween(reg.first,start.date),ex=daysBetween(reg.first,end.date);trend=`<line class="chart-trend" x1="${x(start.date)}" y1="${y(reg.intercept+reg.slope*sx)}" x2="${x(end.date)}" y2="${y(reg.intercept+reg.slope*ex)}"/>`}
 let projection='';if(opts.projection&&points.length){const last=points[points.length-1];projection=`<line class="chart-projection" x1="${x(last.date)}" y1="${y(last.value)}" x2="${x(opts.projection.date)}" y2="${y(opts.projection.value)}"/><circle class="chart-projection-dot" cx="${x(opts.projection.date)}" cy="${y(opts.projection.value)}" r="5"/>`}
 const dots=points.map(p=>`<circle class="chart-dot" cx="${x(p.date)}" cy="${y(p.value)}" r="4"><title>${formatDate(p.date)}: ${fmt(p.value)}${opts.unit||''}</title></circle>`).join('');
 const startLabel=new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short'}).format(dateObj(firstDate));const endLabel=new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short'}).format(dateObj(lastDate));
 el.innerHTML=`<svg class="trend-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${grid}${goal}<polyline class="chart-line" points="${line}"/>${trend}${projection}${dots}<text class="chart-x-label" x="${pad.l}" y="${H-12}">${startLabel}</text><text class="chart-x-label" x="${W-pad.r}" y="${H-12}" text-anchor="end">${endLabel}</text></svg><div class="chart-legend"><span><i class="legend-actual"></i>Metingen</span><span><i class="legend-trend"></i>Trend</span>${opts.projection?'<span><i class="legend-projection"></i>Prognose</span>':''}</div>`;
}

function renderSettings(){const s=state.settings;document.getElementById('nameSetting').value=s.name||'';document.getElementById('startDateSetting').value=s.startDate||todayISO();document.getElementById('heightSetting').value=s.heightCm||'';document.getElementById('stepsGoalSetting').value=s.stepsGoal||8000;document.getElementById('waterGoalSetting').value=s.waterGoal||2;document.getElementById('targetWeightSetting').value=s.targetWeight||''}
function saveSettings(){state.settings={...state.settings,name:document.getElementById('nameSetting').value.trim(),startDate:document.getElementById('startDateSetting').value||todayISO(),heightCm:+document.getElementById('heightSetting').value||'',stepsGoal:+document.getElementById('stepsGoalSetting').value||8000,waterGoal:+document.getElementById('waterGoalSetting').value||2,targetWeight:+document.getElementById('targetWeightSetting').value||''};save();alert('Instellingen opgeslagen.')}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`fit10-backup-${todayISO()}.json`;a.click();URL.revokeObjectURL(a.href)}
function importData(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const imported=JSON.parse(r.result);state={...defaultData,...imported,settings:{...defaultData.settings,...(imported.settings||{})}};save();alert('Back-up geïmporteerd.')}catch{alert('Dit bestand kon niet worden gelezen.')}};r.readAsText(f)}
init();
