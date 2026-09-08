'use strict';
(()=>{
  const byId=id=>document.getElementById(id);
  const q=(s,r=document)=>r.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[c]));
  const fmt=(v,name)=>{
    if(name==='Power')return `${Math.abs(v).toFixed(1)} MW`;
    if(name==='Water'||name==='Wastewater')return `${Math.abs(v).toFixed(2)} MGD`;
    if(name==='Gas')return `${Math.round(Math.abs(v))} MMBtu/h`;
    if(name==='Fiber')return `${Math.round(Math.abs(v))} routes`;
    if(name==='Power redundancy')return `level ${Math.round(Math.abs(v))}`;
    return String(v);
  };
  const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Math.max(0,Number(v)||0));
  let gateHost=null;

  function parseMoney(text){
    const m=String(text).match(/\$\s*([\d,.]+)\s*(m|mm|million|k|thousand)?/i);if(!m)return null;
    let n=Number(m[1].replace(/,/g,''));if(!Number.isFinite(n))return null;
    const u=(m[2]||'').toLowerCase();if(u==='m'||u==='mm'||u==='million')n*=1e6;if(u==='k'||u==='thousand')n*=1e3;return n;
  }
  function inferType(text){const t=text.toLowerCase();if(/data\s*center|compute|server|hyperscale|ai\s+campus/.test(t))return'data';if(/semiconductor|chip|wafer|\bfab\b/.test(t))return'semiconductor';if(/food|beverage|brew|dairy|processing/.test(t))return'food';if(/cold\s*storage|refrigerat|freezer/.test(t))return'cold';if(/battery|cell\s+plant|energy\s+manufactur/.test(t))return'battery';if(/warehouse|distribution|logistics/.test(t))return'warehouse';if(/manufactur|factory|plant|industrial/.test(t))return'manufacturing';return'custom'}
  function numberNear(text,rx){const m=String(text).match(rx);if(!m)return null;const n=Number(m[1]);return Number.isFinite(n)?n:null}
  function inferSite(text){const t=text.toLowerCase();try{return sites.find(s=>t.includes(s.name.toLowerCase())||t.includes(s.county.toLowerCase()))||null}catch(_e){return null}}

  function autoBuild(){
    const input=byId('ggxBrief'),status=byId('ggxBriefStatus');if(!input)return;
    const text=input.value.trim();if(!text){status.textContent='Describe the project in one sentence first.';input.focus();return}
    const type=inferType(text),typeEl=byId('projectType');typeEl.value=type;typeEl.dispatchEvent(new Event('change',{bubbles:true}));
    const power=numberNear(text,/(?:power|electric|load|peak)?\s*(\d+(?:\.\d+)?)\s*(?:mw|megawatts?)/i);
    const water=numberNear(text,/(?:water|water demand|process water)\D{0,12}(\d+(?:\.\d+)?)\s*mgd/i);
    const waste=numberNear(text,/(?:wastewater|sewer|discharge)\D{0,12}(\d+(?:\.\d+)?)\s*mgd/i);
    const gas=numberNear(text,/(?:gas|natural gas)\D{0,12}(\d+(?:\.\d+)?)\s*(?:mmbtu(?:\/h|\/hr)?|mmbtuh)/i);
    const months=numberNear(text,/(?:online|live|operational|needed|within|in)\D{0,12}(\d{1,2})\s*months?/i)??numberNear(text,/(\d{1,2})\s*month\s*(?:timeline|schedule|window)/i);
    if(power!=null)byId('powerReq').value=power;if(water!=null)byId('waterReq').value=water;if(waste!=null)byId('wasteReq').value=waste;if(gas!=null)byId('gasReq').value=gas;
    if(months!=null){const timeline=months<=12?12:months<=24?24:months<=36?36:60;byId('timeline').value=String(timeline)}
    if(/dual[- ]?feed|diverse feed|n\+1|mission critical|redundan/.test(text.toLowerCase())){byId('powerRedundancy').value='3';byId('fiberReq').value='3'}
    const cap=parseMoney(text);if(cap!=null&&/diligence|pre[- ]?development|at risk|capital/i.test(text))byId('capitalExposure').value=String(Math.round(cap));
    const site=inferSite(text);if(site)byId('siteSelect').value=site.id;
    const detected=[projectPresets[type]?.label||'Custom load',power!=null?`${power} MW`:null,water!=null?`${water} MGD water`:null,months!=null?`${months} mo target`:null,site?site.name:null].filter(Boolean);
    status.textContent=`Built automatically: ${detected.join(' · ')}. Explicit numbers override the category baseline.`;
    try{updateRankSummary()}catch(_e){}
  }

  function ranked(req){
    try{return sites.map(s=>analyzeSite(s,req,false)).sort((a,b)=>{
      const rank={go:3,conditional:2,hold:1};return (rank[b.vclass]-rank[a.vclass])||(b.low-a.low)||(b.score-a.score)||(b.worst.ratio-a.worst.ratio);
    })}catch(_e){return[]}
  }
  function findBest(){
    autoBuild();let req;try{req=currentReq()}catch(_e){return}
    const all=ranked(req);if(!all.length)return;const best=all[0];byId('siteSelect').value=best.s.id;byId('siteSelect').dispatchEvent(new Event('change',{bubbles:true}));byId('analyseBtn').click();byId('rankAllBtn')?.click();setTimeout(()=>{renderGate();q('#decision-gate')?.scrollIntoView({behavior:'smooth',block:'start'})},35)
  }

  function labelFor(a,stress){
    if(a.vclass==='hold')return['STOP BEFORE MORE SPEND','The selected site fails the current project screen. Switch sites or rescope the load before deeper diligence.','stop'];
    if(a.vclass==='conditional')return['VERIFY BEFORE COMMITTING','The site may work, but the decision still depends on one or more capacity, timing or evidence assumptions.','verify'];
    if(stress?.vclass==='hold')return['PROCEED, BUT PROTECT THE DOWNSIDE','Base case passes. A tighter timeline or higher load breaks the site, so verify the bottleneck before capital hardens.','verify'];
    return['PROCEED TO DILIGENCE','The risk-adjusted pilot screen clears the project. Spend the next diligence dollar proving the weakest dependency, not rechecking everything.','go'];
  }
  function renderGate(){
    let a,req;try{a=lastAnalysis;req=currentReq()}catch(_e){return}if(!a||!req)return;
    const all=ranked(req),best=all[0],stress=(()=>{try{return analyzeSite(a.s,req,true)}catch(_e){return null}})();
    const [call,why,tone]=labelFor(a,stress),same=best?.s.id===a.s.id,alt=same?all[1]:best,scoreDelta=alt?alt.low-a.low:0;
    const gap=a.worst.gap<0?fmt(a.worst.gap,a.worst.name):`${Math.round(Math.max(0,(a.worst.ratio-1)*100))}% risk-adjusted buffer`;
    const timelineDelta=a.s.lead-req.timeline;
    const topSteps=(()=>{try{return diligenceSteps(a).slice(0,3)}catch(_e){return[]}})();
    gateHost.innerHTML=`<div class="ggx-gate-head"><div><span>GAGE GRID / DECISION GATE</span><h2>${esc(call)}</h2><p>${esc(why)}</p></div><div class="ggx-gate-score ${tone}"><small>DEFENSIBLE RANGE</small><strong>${a.low}–${a.high}</strong><b>${esc(a.verdict)}</b></div></div>
      <div class="ggx-gate-grid">
        <article><span>WHAT BREAKS FIRST</span><strong>${esc(a.worst.name)}</strong><p>${a.worst.gap<0?`Short by ${esc(gap)} after risk discounting.`:`${esc(gap)} before this becomes a modeled capacity failure.`}</p></article>
        <article><span>CAPITAL TO PROTECT</span><strong>${money(a.atRisk)}</strong><p>Estimated share of entered pre-development capital exposed under the current verdict. This is a decision-control estimate, not a loss forecast.</p></article>
        <article><span>TIMING TEST</span><strong>${timelineDelta>0?`${timelineDelta} mo late`:timelineDelta===0?'No timing buffer':`${Math.abs(timelineDelta)} mo buffer`}</strong><p>Modeled site service lead time is ${a.s.lead} months against a ${req.timeline}-month project window.</p></article>
        <article><span>STRESS CASE</span><strong>${stress?esc(stress.verdict):'—'}</strong><p>${stress?`Higher load + tighter timing produces a ${stress.low}–${stress.high} range.`:'Stress case unavailable.'}</p></article>
      </div>
      <div class="ggx-switch"><div><span>BEST ALTERNATIVE IN THE PILOT</span><strong>${alt?esc(alt.s.name):'Current site already leads the pilot'}</strong><p>${alt?`${esc(alt.verdict)} · ${alt.low}–${alt.high} defensible range · bottleneck ${esc(alt.worst.name)}.${scoreDelta>0?` The alternative improves the conservative score by ${scoreDelta} points.`:''}`:'No other pilot node improves the current risk-adjusted decision.'}</p></div>${alt?`<button type="button" id="ggxSwitch">TEST ${esc(alt.s.name.toUpperCase())} →</button>`:''}</div>
      <div class="ggx-proof"><div><span>THE NEXT 3 THINGS TO PROVE</span><ol>${topSteps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div><div><span>WHAT CHANGES THE ANSWER</span><p>${esc((()=>{try{return fixPath(a)}catch(_e){return'Verify the weakest dependency and rerun the project.'}})())}</p></div></div>`;
    if(alt)byId('ggxSwitch')?.addEventListener('click',()=>{byId('siteSelect').value=alt.s.id;byId('analyseBtn').click();setTimeout(()=>q('#decision-gate')?.scrollIntoView({behavior:'smooth',block:'start'}),25)});
  }

  function install(){
    const inputs=q('.inputs');if(!inputs||byId('ggxBrief'))return;
    const h3=q('h3',inputs);const brief=document.createElement('div');brief.className='ggx-brief';brief.innerHTML=`<div class="ggx-brief-kicker">FAST START / ONE SENTENCE</div><label for="ggxBrief">Describe the project. Gage Grid will build the load.</label><textarea id="ggxBrief" rows="3" placeholder="Example: 55 MW data center in Will County, online within 18 months, dual feeds required."></textarea><div class="ggx-brief-actions"><button type="button" id="ggxAuto">AUTO-BUILD PROJECT</button><button type="button" id="ggxBest">FIND THE BEST PILOT SITE →</button></div><small id="ggxBriefStatus">Category baselines fill the background assumptions; numbers you type in the sentence override them.</small>`;h3?.insertAdjacentElement('afterend',brief);
    gateHost=document.createElement('section');gateHost.id='decision-gate';gateHost.className='ggx-gate hidden';const rank=byId('rank');rank?.parentNode?.insertBefore(gateHost,rank);
    byId('ggxAuto')?.addEventListener('click',autoBuild);byId('ggxBest')?.addEventListener('click',findBest);
    byId('ggxBrief')?.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')findBest()});
    byId('analyseBtn')?.addEventListener('click',()=>setTimeout(()=>{gateHost.classList.remove('hidden');renderGate()},20));
    byId('loadDemoBtn')?.addEventListener('click',()=>setTimeout(()=>{if(lastAnalysis){gateHost.classList.remove('hidden');renderGate()}},40));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
