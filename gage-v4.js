'use strict';
(function(){
  var q=function(s,r){return (r||document).querySelector(s)};
  var qa=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var byId=function(id){return document.getElementById(id)};
  var WATCH_KEY='gagegrid-watches-v1';
  var rankWeight={go:3,conditional:2,hold:1};
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
  function req(){try{return currentReq()}catch(e){return null}}
  function projectName(){var r=req();try{return projectPresets[r&&r.projectType]?projectPresets[r.projectType].label:'Custom industrial load'}catch(e){return'Custom industrial load'}}
  function fmt(v,d){var n=Number(v);return Number.isFinite(n)?n.toFixed(d==null?1:d):'—'}
  function notify(msg){try{if(typeof toast==='function'){toast(msg);return}}catch(e){}var t=document.createElement('div');t.className='ggx-mini-toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}
  function ranked(){
    var r=req();if(!r)return[];
    try{return sites.map(function(s){return analyzeSite(s,r,false)}).sort(function(a,b){return (rankWeight[b.vclass]-rankWeight[a.vclass])||(b.low-a.low)||(b.score-a.score)||(b.worst.ratio-a.worst.ratio)})}catch(e){return[]}
  }
  function fingerprint(r){return[r.projectType,r.power,r.water,r.waste,r.gas,r.fiber,r.redundancy,r.timeline,r.risk,Math.round((r.growth||0)*100)].join('|')}
  function inputQuality(){
    var r=req();if(!r)return'Waiting';
    try{
      var p=projectPresets[r.projectType];if(!p)return'Custom load';
      var changes=[Math.abs(r.power-p.power)>.01,Math.abs(r.water-p.water)>.001,Math.abs(r.waste-p.waste)>.001,Math.abs(r.gas-p.gas)>.1,r.fiber!==p.fiber,r.redundancy!==p.redundancy].filter(Boolean).length;
      return changes>=4?'Highly specified':changes>=1?'Partially specified':'Category baseline';
    }catch(e){return'Project defined'}
  }
  function installHero(){
    var hero=q('.hero');if(!hero||q('.gg4-hero-console',hero))return;
    var title=q('h1',hero),copy=q('.hero-copy>p',hero),stamp=q('.hero-stamp',hero),primary=q('.hero-actions .btn',hero);
    if(title)title.innerHTML='Find the constraint.<br><em>Before it finds the project.</em>';
    if(copy)copy.textContent='Gage Grid turns an industrial project load into a serviceability decision: what fits, what breaks first, how much uncertainty remains, and which diligence dollar should be spent next.';
    if(stamp)stamp.innerHTML='<b>CAPACITY IS NOT SERVICEABILITY</b>Raw infrastructure nearby is not enough. Gage discounts capacity for evidence quality, timing, redundancy and uncertainty before it calls a site ready.';
    if(primary)primary.textContent='Open feasibility desk →';
    var c=document.createElement('aside');c.className='gg4-hero-console';
    c.innerHTML='<div class="gg4-console-head"><span>OPERATING PILOT / DECISION STACK</span><b>V4</b></div>'+
      '<div class="gg4-console-grid">'+
      '<div class="gg4-console-stat"><span>PILOT NODES</span><strong>12</strong><small>Illinois + Indiana screening portfolio</small></div>'+
      '<div class="gg4-console-stat"><span>SYSTEM RECORDS</span><strong>60</strong><small>Power, water, wastewater, gas + fiber</small></div>'+
      '<div class="gg4-console-stat"><span>LIVE CONTEXT</span><strong id="gg4LiveCount">2</strong><small>USGS + EPA public-evidence integrations</small></div>'+
      '<div class="gg4-console-stat"><span>DECISION OUTPUT</span><strong>1st</strong><small>Bottleneck + next diligence action</small></div></div>'+
      '<div class="gg4-console-flow"><span>HOW A PROJECT MOVES THROUGH GAGE</span><ol>'+
      '<li><b>01</b><span>Define the industrial load</span><em>PROJECT</em></li>'+
      '<li><b>02</b><span>Screen serviceability</span><em>FIT</em></li>'+
      '<li><b>03</b><span>Shortlist alternatives</span><em>RANK</em></li>'+
      '<li><b>04</b><span>Order the diligence</span><em>VERIFY</em></li></ol></div>'+
      '<div class="gg4-console-health" id="gg4Health"><span><i></i>Checking source health…</span><strong>SIMULATED CAPACITY</strong></div>';
    hero.appendChild(c)
  }
  function loadHealth(){
    var el=byId('gg4Health');if(!el)return;
    fetch('/api/health',{headers:{Accept:'application/json'}}).then(function(r){return r.json()}).then(function(data){
      var count=Array.isArray(data.integratedSources)?data.integratedSources.length:0;
      if(byId('gg4LiveCount'))byId('gg4LiveCount').textContent=String(count||2);
      if(data.ok)el.classList.add('is-ok');
      el.innerHTML='<span><i></i>'+(data.ok?'Evidence services responding':'Evidence service check incomplete')+'</span><strong>'+(count||2)+' LIVE / CAPACITY SIMULATED</strong>';
    }).catch(function(){el.innerHTML='<span><i></i>Public evidence check unavailable</span><strong>CAPACITY SIMULATED</strong>'})
  }
  function installCommand(){
    if(byId('gg4Command'))return;var metrics=q('.mini-metrics');if(!metrics)return;
    var deck=document.createElement('section');deck.id='gg4Command';deck.className='gg4-command shell';deck.setAttribute('aria-label','Gage Grid project command deck');
    deck.innerHTML='<div class="gg4-command-top">'+
      '<div class="gg4-stage is-ready is-active" data-gg4-stage="define"><b>01</b><div><span>Define</span><small>Project load</small></div></div>'+
      '<div class="gg4-stage" data-gg4-stage="screen"><b>02</b><div><span>Screen</span><small>Site fit</small></div></div>'+
      '<div class="gg4-stage" data-gg4-stage="shortlist"><b>03</b><div><span>Shortlist</span><small>Best alternatives</small></div></div>'+
      '<div class="gg4-stage" data-gg4-stage="verify"><b>04</b><div><span>Verify</span><small>Diligence order</small></div></div></div>'+
      '<div class="gg4-command-body"><div class="gg4-command-main">'+
      '<div class="gg4-command-kicker">PROJECT COMMAND / START WITH THE LOAD</div>'+
      '<div class="gg4-presets" id="gg4Presets"></div><div class="gg4-passport" id="gg4Passport"></div>'+
      '<div class="gg4-command-actions"><button class="primary" id="gg4Run" type="button">RUN CURRENT SITE →</button><button id="gg4Best" type="button">FIND BEST PILOT FIT</button><button id="gg4Top3" type="button">SHORTLIST TOP 3</button><button id="gg4JumpEvidence" type="button">OPEN EVIDENCE</button></div></div>'+
      '<aside class="gg4-watch-panel"><div class="gg4-watch-head"><span>DECISION WATCH / THIS BROWSER</span><b id="gg4WatchCount">0</b></div><div class="gg4-watch-list" id="gg4WatchList"></div></aside></div>';
    metrics.insertAdjacentElement('afterend',deck);
    var opts=[['data','Data center'],['manufacturing','Manufacturing'],['semiconductor','Semiconductor'],['battery','Battery'],['food','Food / beverage'],['cold','Cold storage'],['warehouse','Distribution'],['custom','Custom']];
    byId('gg4Presets').innerHTML=opts.map(function(x){return'<button type="button" class="gg4-preset" data-gg4-preset="'+x[0]+'">'+x[1]+'</button>'}).join('');
    qa('[data-gg4-preset]').forEach(function(b){b.addEventListener('click',function(){
      var s=byId('projectType');if(!s)return;s.value=b.getAttribute('data-gg4-preset');s.dispatchEvent(new Event('change',{bubbles:true}));updateCommand();byId('screen').scrollIntoView({behavior:'smooth',block:'start'})
    })});
    byId('gg4Run').addEventListener('click',function(){byId('analyseBtn').click();setTimeout(function(){byId('screen').scrollIntoView({behavior:'smooth',block:'start'})},30)});
    byId('gg4Best').addEventListener('click',findBest);
    byId('gg4Top3').addEventListener('click',shortlistTop3);
    byId('gg4JumpEvidence').addEventListener('click',function(){byId('registry').scrollIntoView({behavior:'smooth',block:'start'})});
    renderWatches();updateCommand()
  }
  function updateCommand(){
    var host=byId('gg4Passport'),r=req();if(!host||!r)return;
    host.innerHTML='<div><span>PROJECT</span><strong>'+esc(projectName())+'</strong></div>'+
      '<div><span>POWER</span><strong>'+fmt(r.power,1)+' MW</strong></div>'+
      '<div><span>WATER</span><strong>'+fmt(r.water,2)+' MGD</strong></div>'+
      '<div><span>WASTEWATER</span><strong>'+fmt(r.waste,2)+' MGD</strong></div>'+
      '<div><span>GAS</span><strong>'+Math.round(r.gas)+' MMBtu/h</strong></div>'+
      '<div><span>INPUT QUALITY</span><strong>'+esc(inputQuality())+'</strong></div>';
    qa('[data-gg4-preset]').forEach(function(b){b.classList.toggle('is-active',b.getAttribute('data-gg4-preset')===r.projectType)});
    updateStages()
  }
  function updateStages(){
    var analysed=false,shortlist=0,watches=readWatches();try{analysed=Boolean(lastAnalysis)}catch(e){}try{shortlist=compareIds.length}catch(e){}
    var st={define:true,screen:analysed,shortlist:shortlist>0,verify:analysed&&(watches.length>0||Boolean(q('#decision-gate:not(.hidden)')))};
    qa('[data-gg4-stage]').forEach(function(el,index){
      var key=el.getAttribute('data-gg4-stage');el.classList.toggle('is-ready',Boolean(st[key]));
      el.classList.toggle('is-active',(index===0&&!analysed)||(index===1&&analysed&&!shortlist)||(index===2&&shortlist&&!st.verify)||(index===3&&st.verify))
    })
  }
  function findBest(){
    var list=ranked();if(!list.length)return;var best=list[0],s=byId('siteSelect');s.value=best.s.id;s.dispatchEvent(new Event('change',{bubbles:true}));
    try{runAnalysis()}catch(e){byId('analyseBtn').click()}try{rankAll()}catch(e){}
    setTimeout(function(){updateDecision();byId('screen').scrollIntoView({behavior:'smooth',block:'start'})},40);
    notify(best.s.name+' leads the current pilot screen.')
  }
  function shortlistTop3(){
    var list=ranked();if(!list.length)return;var ids=list.slice(0,3).map(function(a){return a.s.id});
    try{compareIds=ids;localStorage.setItem('gagegrid-compare',JSON.stringify(ids));renderComparison();renderRanking();renderPortfolio();updateStages();byId('compare').scrollIntoView({behavior:'smooth',block:'start'});notify('Top three pilot sites added to the shortlist.')}catch(e){notify('Run the project ranking first.')}
  }
  function installDecision(){
    if(byId('gg4Decision'))return;var work=q('#screen .workbench');if(!work)return;
    var s=document.createElement('section');s.id='gg4Decision';s.className='gg4-decision';
    s.innerHTML='<div class="gg4-decision-main" id="gg4DecisionMain"></div><div class="gg4-decision-tools"><span>DECISION TOOLS / SCREEN FIRST, THEN VERIFY THE WEAK LINK</span><button type="button" id="gg4Copy">COPY DECISION</button><button type="button" id="gg4Watch">WATCH DECISION</button><button type="button" id="gg4Diligence">OPEN DILIGENCE</button></div>';
    work.insertAdjacentElement('beforebegin',s);
    byId('gg4Copy').addEventListener('click',copyDecision);byId('gg4Watch').addEventListener('click',watchDecision);
    byId('gg4Diligence').addEventListener('click',function(){var gate=byId('decision-gate');(gate&&!gate.classList.contains('hidden')?gate:byId('rank')).scrollIntoView({behavior:'smooth',block:'start'})})
  }
  function updateDecision(){
    var host=byId('gg4Decision'),main=byId('gg4DecisionMain'),a=null;if(!host||!main)return;try{a=lastAnalysis}catch(e){}
    if(!a){host.classList.remove('is-visible');updateStages();return}
    var stress=null;try{stress=analyzeSite(a.s,a.req,true)}catch(e){}var buffer=a.req.timeline-a.s.lead;var cls=a.vclass==='hold'?'is-hold':a.vclass==='conditional'?'is-conditional':'';
    main.innerHTML='<div class="gg4-decision-cell verdict '+cls+'"><span>CURRENT DECISION / '+esc(a.s.id)+'</span><strong>'+esc(a.verdict)+'</strong><small>'+esc(a.s.name)+' · '+esc(projectName())+'</small></div>'+
      '<div class="gg4-decision-cell"><span>DEFENSIBLE RANGE</span><strong>'+a.low+'–'+a.high+'</strong><small>Modeled score '+a.score+'/100</small></div>'+
      '<div class="gg4-decision-cell"><span>FIRST BOTTLENECK</span><strong>'+esc(a.worst.name)+'</strong><small>'+Math.round(a.worst.ratio*100)+'% risk-adjusted coverage</small></div>'+
      '<div class="gg4-decision-cell"><span>DELIVERY BUFFER</span><strong>'+(buffer>=0?buffer+' mo':Math.abs(buffer)+' mo late')+'</strong><small>'+a.s.lead+' mo modeled lead vs '+a.req.timeline+' mo target</small></div>'+
      '<div class="gg4-decision-cell"><span>STRESS CASE</span><strong>'+(stress?esc(stress.verdict):'—')+'</strong><small>'+(stress?stress.low+'–'+stress.high+' range':'Unavailable')+'</small></div>';
    host.classList.add('is-visible');updateStages()
  }
  function decisionText(){
    var a=null;try{a=lastAnalysis}catch(e){}if(!a)return'';var step='';try{step=nextStep(a.worst,a.s)}catch(e){}
    return['GAGE GRID — DECISION SNAPSHOT',a.s.name+', '+a.s.county+', '+a.s.state,projectName(),'','Decision: '+a.verdict,'Defensible range: '+a.low+'–'+a.high,'Modeled score: '+a.score+'/100','First bottleneck: '+a.worst.name+' ('+Math.round(a.worst.ratio*100)+'% risk-adjusted coverage)','Modeled service lead: '+a.s.lead+' months / target '+a.req.timeline+' months','Evidence: '+a.s.evidence+' ('+a.s.confidence+'% confidence)','','Next diligence: '+step,'','Scenario: '+location.href,'Pilot capacity is simulated. Screening output only; not a utility commitment or engineering determination.'].join('\n')
  }
  function copyDecision(){
    var text=decisionText();if(!text){notify('Run a site screen first.');return}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){notify('Decision snapshot copied.')}).catch(function(){fallbackCopy(text)})}else fallbackCopy(text)
  }
  function fallbackCopy(text){var a=document.createElement('textarea');a.value=text;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();notify('Decision snapshot copied.')}
  function readWatches(){try{var x=JSON.parse(localStorage.getItem(WATCH_KEY)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
  function writeWatches(x){localStorage.setItem(WATCH_KEY,JSON.stringify(x.slice(0,12)))}
  function watchDecision(){
    var a=null;try{a=lastAnalysis}catch(e){}if(!a){byId('analyseBtn').click();setTimeout(watchDecision,80);return}
    var entry={id:a.s.id+'-'+Date.now(),siteId:a.s.id,siteName:a.s.name,projectType:a.req.projectType,req:a.req,fingerprint:fingerprint(a.req),verdict:a.verdict,low:a.low,high:a.high,bottleneck:a.worst.name,siteUpdated:a.s.updated,siteChange:a.s.change,watchedAt:new Date().toISOString()};
    var list=readWatches().filter(function(w){return !(w.siteId===entry.siteId&&w.fingerprint===entry.fingerprint)});writeWatches([entry].concat(list));renderWatches();updateStages();notify('Decision added to Watch.')
  }
  function renderWatches(){
    var host=byId('gg4WatchList'),count=byId('gg4WatchCount');if(!host||!count)return;var list=readWatches();count.textContent=String(list.length).padStart(2,'0');
    if(!list.length){host.innerHTML='<div class="gg4-watch-empty">Watch a screened decision to keep the project assumptions and site baseline together. Gage will flag when the pilot record changes.</div>';return}
    host.innerHTML=list.slice(0,4).map(function(w){var s=null;try{s=sites.find(function(x){return x.id===w.siteId})}catch(e){}var changed=Boolean(s&&(s.updated!==w.siteUpdated||s.change!==w.siteChange));return'<button class="gg4-watch-item '+(changed?'is-changed':'')+'" type="button" data-gg4-watch="'+esc(w.id)+'"><div><strong>'+esc(w.siteName)+'</strong><span>'+esc(projectPresets[w.projectType]?projectPresets[w.projectType].label:w.projectType)+' · '+w.low+'–'+w.high+' · '+esc(w.bottleneck)+'</span></div><em>'+(changed?'CHANGED':'NO CHANGE')+'</em></button>'}).join('');
    qa('[data-gg4-watch]').forEach(function(b){b.addEventListener('click',function(){reopenWatch(b.getAttribute('data-gg4-watch'))})})
  }
  function reopenWatch(id){
    var w=readWatches().find(function(x){return x.id===id});if(!w)return;var r=w.req||{};var vals={projectType:w.projectType,siteSelect:w.siteId,powerReq:r.power,waterReq:r.water,wasteReq:r.waste,gasReq:r.gas,fiberReq:r.fiber,powerRedundancy:r.redundancy,timeline:r.timeline,risk:r.risk,growth:Math.round((r.growth||0)*100),capitalExposure:r.capital||0};
    Object.keys(vals).forEach(function(k){var el=byId(k);if(el&&vals[k]!=null)el.value=String(vals[k])});try{runAnalysis()}catch(e){byId('analyseBtn').click()}updateCommand();setTimeout(function(){updateDecision();byId('screen').scrollIntoView({behavior:'smooth',block:'start'})},40)
  }
  function installMobile(){
    if(q('.gg4-mobile-dock'))return;var d=document.createElement('nav');d.className='gg4-mobile-dock';d.setAttribute('aria-label','Quick actions');d.innerHTML='<button type="button" data-jump="screen">SCREEN</button><button type="button" data-jump="rank">RANK</button><button type="button" data-jump="compare">SHORTLIST</button><button type="button" data-jump="registry">EVIDENCE</button>';document.body.appendChild(d);qa('[data-jump]',d).forEach(function(b){b.addEventListener('click',function(){byId(b.getAttribute('data-jump')).scrollIntoView({behavior:'smooth',block:'start'})})})
  }
  function tuneNav(){var nav=q('.top nav');if(!nav)return;var names=['Screen','Rank','Shortlist','Evidence','Changes','Method'];qa('a',nav).forEach(function(a,i){if(names[i])a.textContent=names[i]})}
  function listeners(){
    ['projectType','siteSelect','powerReq','waterReq','wasteReq','gasReq','fiberReq','timeline','powerRedundancy','risk','growth','capitalExposure'].forEach(function(id){var el=byId(id);if(!el)return;el.addEventListener('input',updateCommand);el.addEventListener('change',function(){setTimeout(updateCommand,0)})});
    byId('analyseBtn').addEventListener('click',function(){setTimeout(function(){updateDecision();renderWatches()},40)});
    if(byId('loadDemoBtn'))byId('loadDemoBtn').addEventListener('click',function(){setTimeout(function(){updateCommand();updateDecision();renderWatches()},80)});
    var result=byId('resultState');if(result)new MutationObserver(function(){setTimeout(updateDecision,0)}).observe(result,{childList:true,subtree:true});
    window.addEventListener('storage',function(e){if(e.key===WATCH_KEY)renderWatches()})
  }
  function boot(){
    document.body.classList.add('gg-v4');tuneNav();installHero();installCommand();installDecision();installMobile();listeners();updateCommand();updateDecision();renderWatches();loadHealth()
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,0)},{once:true});else setTimeout(boot,0)
})();