const STORAGE_KEY='fit10-data-v1';
const todayISO=()=>new Date().toISOString().slice(0,10);
const defaultData={settings:{name:'',startDate:todayISO(),stepsGoal:8000,waterGoal:2,targetWeight:''},daily:{},progress:[],theme:'light'};
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

function load(){try{return {...defaultData,...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}}catch{return structuredClone(defaultData)}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderAll()}
function day(){const d=selectedDate;state.daily[d]??={meals:{ontbijt:0,lunch:0,avondeten:0},snacks:[],workoutDone:false,steps:'',water:'',note:''};return state.daily[d]}
function weekIndex(date=selectedDate){const s=new Date(state.settings.startDate+'T00:00:00');const n=new Date(date+'T00:00:00');const diff=Math.floor((n-s)/86400000);return Math.min(13,Math.max(0,Math.floor(diff/7)))}
function dayOfWeek(date=selectedDate){return new Date(date+'T12:00:00').getDay()}
function workoutForToday(){const w=trainingPlan[weekIndex()];const dow=dayOfWeek(); if([2,3].includes(dow))return {label:'Training 1 • interval',text:w[0]}; if([4,5].includes(dow))return {label:'Training 2 • easy',text:w[1]}; if([0,6].includes(dow))return {label:'Lange duurloop',text:w[2]}; return {label:'Herstel / wandelen',text:'Geen looptraining gepland. Wandel rustig en herstel.'}}
function selectedMeal(type){return meals[type][day().meals[type]??0]}

function init(){
 document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>showView(b.dataset.view));
 document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>showView(b.dataset.jump));
 document.getElementById('themeBtn').onclick=()=>{state.theme=state.theme==='dark'?'light':'dark';save()};
 document.getElementById('prevDay').onclick=()=>changeDay(-1);
 document.getElementById('nextDay').onclick=()=>changeDay(1);
 document.getElementById('workoutDone').onchange=e=>{day().workoutDone=e.target.checked;save()};
 ['stepsInput','waterInput','dailyNote'].forEach(id=>document.getElementById(id).addEventListener('input',e=>{const map={stepsInput:'steps',waterInput:'water',dailyNote:'note'};day()[map[id]]=e.target.value;localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderTodaySummary()}));
 document.getElementById('weekSelect').onchange=e=>renderTraining(+e.target.value);
 document.getElementById('randomizeMeals').onclick=()=>{['ontbijt','lunch','avondeten'].forEach(t=>day().meals[t]=Math.floor(Math.random()*meals[t].length));save()};
 document.getElementById('saveProgress').onclick=saveProgress;
 document.getElementById('saveSettings').onclick=saveSettings;
 document.getElementById('exportBtn').onclick=exportData;
 document.getElementById('importInput').onchange=importData;
 document.getElementById('resetBtn').onclick=()=>{if(confirm('Weet je zeker dat je alle Fit10-gegevens wilt wissen?')){localStorage.removeItem(STORAGE_KEY);state=structuredClone(defaultData);save()}};
 renderAll();
}
function changeDay(delta){const d=new Date(selectedDate+'T12:00:00');d.setDate(d.getDate()+delta);selectedDate=d.toISOString().slice(0,10);renderAll()}
function showView(id){document.querySelectorAll('.view,.tab').forEach(el=>el.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelector(`.tab[data-view="${id}"]`).classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}
function renderAll(){document.documentElement.classList.toggle('dark',state.theme==='dark');renderToday();renderMealPicker();renderProgress();renderSettings();populateWeekSelect();renderTraining(weekIndex())}
function renderToday(){const d=day();const w=workoutForToday();const name=state.settings.name?`, ${state.settings.name}`:'';document.getElementById('greeting').textContent=`Jouw plan voor vandaag${name}`;document.getElementById('weekPill').textContent=`Week ${weekIndex()+1}`;document.getElementById('todayTitle').textContent=new Intl.DateTimeFormat('nl-NL',{weekday:'long',day:'numeric',month:'long'}).format(new Date(selectedDate+'T12:00:00'));document.getElementById('todaySubtitle').textContent='Eén dag tegelijk: trainen, goed eten en herstellen.';document.getElementById('todayWorkout').innerHTML=`<span class="eyebrow">${w.label}</span><h3>${w.text}</h3>`;document.getElementById('workoutDone').checked=!!d.workoutDone;document.getElementById('stepsInput').value=d.steps??'';document.getElementById('waterInput').value=d.water??'';document.getElementById('dailyNote').value=d.note??'';document.getElementById('stepsGoalText').textContent=Number(state.settings.stepsGoal||8000).toLocaleString('nl-NL');document.getElementById('waterGoalText').textContent=`${state.settings.waterGoal||2} L`;renderTodaySummary()}
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
function saveProgress(){const w=parseFloat(document.getElementById('weightInput').value);const r=parseFloat(document.getElementById('longestRunInput').value);const t=parseFloat(document.getElementById('tenKTimeInput').value);if(!w&&!r&&!t)return alert('Vul minimaal één meting in.');state.progress.push({date:todayISO(),weight:Number.isFinite(w)?w:null,longestRun:Number.isFinite(r)?r:null,tenKTime:Number.isFinite(t)?t:null});['weightInput','longestRunInput','tenKTimeInput'].forEach(id=>document.getElementById(id).value='');save()}
function renderProgress(){const p=state.progress;const latest=p[p.length-1]||{};const first=p[0]||{};const delta=(latest.weight!=null&&first.weight!=null)?(latest.weight-first.weight).toFixed(1):'–';document.getElementById('progressStats').innerHTML=`<div class="stat"><span>Laatste gewicht</span><strong>${latest.weight??'–'}${latest.weight!=null?' kg':''}</strong></div><div class="stat"><span>Verandering</span><strong>${delta==='–'?'–':delta+' kg'}</strong></div><div class="stat"><span>Langste run</span><strong>${latest.longestRun??'–'}${latest.longestRun!=null?' km':''}</strong></div><div class="stat"><span>Laatste 10 km tijd</span><strong>${latest.tenKTime??'–'}${latest.tenKTime!=null?' min':''}</strong></div>`;document.getElementById('progressHistory').innerHTML=p.length? [...p].reverse().map(x=>`<div class="history-row"><strong>${new Intl.DateTimeFormat('nl-NL').format(new Date(x.date))}</strong><span>${x.weight??'–'}${x.weight!=null?' kg':''}</span><span>${x.longestRun??'–'}${x.longestRun!=null?' km':''}</span><span>${x.tenKTime??'–'}${x.tenKTime!=null?' min':''}</span></div>`).join(''):'<p class="muted">Nog geen metingen opgeslagen.</p>'}
function renderSettings(){const s=state.settings;document.getElementById('nameSetting').value=s.name||'';document.getElementById('startDateSetting').value=s.startDate||todayISO();document.getElementById('stepsGoalSetting').value=s.stepsGoal||8000;document.getElementById('waterGoalSetting').value=s.waterGoal||2;document.getElementById('targetWeightSetting').value=s.targetWeight||''}
function saveSettings(){state.settings={name:document.getElementById('nameSetting').value.trim(),startDate:document.getElementById('startDateSetting').value||todayISO(),stepsGoal:+document.getElementById('stepsGoalSetting').value||8000,waterGoal:+document.getElementById('waterGoalSetting').value||2,targetWeight:document.getElementById('targetWeightSetting').value||''};save();alert('Instellingen opgeslagen.')}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`fit10-backup-${todayISO()}.json`;a.click();URL.revokeObjectURL(a.href)}
function importData(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);save();alert('Back-up geïmporteerd.')}catch{alert('Dit bestand kon niet worden gelezen.')}};r.readAsText(f)}
init();
