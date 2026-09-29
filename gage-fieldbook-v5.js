'use strict';
(function(){
  var q=function(s,r){return (r||document).querySelector(s)};
  var qa=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var byId=function(id){return document.getElementById(id)};
  var WATCH_KEY='gagegrid-fieldbook-watch-v1';
  var rankWeight={go:3,conditional:2,hold:1};

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
  function notify(msg){try{if(typeof toast==='function'){toast(msg);return}}catch(e){}var t=document.createElement('div');t.className='ggx-mini-toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}
  function req(){try{return currentReq()}catch(e){return null}}
  function projectLabel(){var r=req();try{return projectPresets[r&&r.projectType]?projectPresets[r.projectType].label:'Custom industrial load'}catch(e){return'Custom industrial load'}}
  function sortedSites(){
    var r=req();if(!r)return[];
    try{return sites.map(function(s){return analyzeSite(s,r,false)}).sort(function(a,b){return (rankWeight[b.vclass]-rankWeight[a.vclass])||(b.low-a.low)||(b.score-a.score)||(b.worst.ratio-a.worst.ratio)})}catch(e){return[]}
  }
  function fingerprint(r){return[r.projectType,r.power,r.water,r.waste,r.gas,r.fiber,r.redundancy,r.timeline,r.risk,Math.round((r.growth||0)*100)].join('|')}

  function installHeroSheet(){
    var hero=q('.hero');if(!hero||q('.gg5-site-sheet',hero))return;
    var title=q('h1',hero),copy=q('.hero-copy>p',hero),stamp=q('.hero-stamp',hero);
    if(title)title.innerHTML='Survey the constraint.<br><em>Then spend on proof.</em>';
    if(copy)copy.textContent='Gage Grid screens an industrial project against power, water, wastewater, gas and fiber, then shows the first dependency that deserves real diligence money.';
    if(stamp)stamp.innerHTML='<b>FIELD RULE 01 / SITE ≠ SERVICEABILITY</b>A parcel can sit beside infrastructure and still fail the project. Gage separates proximity from usable, timely, evidenced service.';
    var sheet=document.createElement('aside');sheet.className='gg5-site-sheet';
    sheet.innerHTML='<div class="gg5-sheet-meta">SHEET GG-01 / MIDWEST PILOT</div>'+
      '<div class="gg5-diagram"><div class="gg5-plot"></div>'+
      '<div class="gg5-node power"></div><div class="gg5-node water"></div><div class="gg5-node waste"></div><div class="gg5-node gas"></div><div class="gg5-node fiber"></div>'+
      '<span class="gg5-label l1">POWER FEED</span><span class="gg5-label l2">WATER</span><span class="gg5-label l3">WASTEWATER</span><span class="gg5-label l4">GAS</span><span class="gg5-label l5">FIBER</span></div>'+
      '<div class="gg5-scale"><span>NOT TO SCALE / SERVICEABILITY DIAGRAM</span></div>'+
      '<div class="gg5-sheet-foot"><div><span>SYSTEMS</span><b>05 TRACKED</b></div><div><span>PILOT NODES</span><b>12 SITES</b></div><div><span>PRIMARY OUTPUT</span><b>FIRST BOTTLENECK</b></div></div>';
    hero.appendChild(sheet)
  }

  function installProjectRail(){
    if(byId('gg5ProjectRail'))return;
    var metrics=q('.mini-metrics');if(!metrics)return;
    var rail=document.createElement('section');rail.id='gg5ProjectRail';rail.className='gg5-project-rail shell';
    rail.innerHTML='<div class="gg5-rail-head" id="gg5RailHead"></div>'+
      '<div class="gg5-rail-body"><div class="gg5-toolbox"><span>FIELD KIT / PROJECT TYPE + SCREENING ACTIONS</span><div class="gg5-presets" id="gg5Presets"></div><div class="gg5-actions">'+
      '<button class="primary" id="gg5Run" type="button">SCREEN CURRENT SITE</button><button id="gg5Best" type="button">FIND BEST PILOT FIT</button><button id="gg5Top3" type="button">SHORTLIST TOP 3</button><button id="gg5Evidence" type="button">OPEN EVIDENCE</button>'+
      '</div></div><aside class="gg5-watch"><span>FIELD NOTES / WATCHED DECISIONS</span><div class="gg5-watch-list" id="gg5WatchList"></div></aside></div>';
    metrics.insertAdjacentElement('afterend',rail);
    var presets=[['data','Data center'],['manufacturing','Manufacturing'],['semiconductor','Semiconductor'],['battery','Battery'],['food','Food / beverage'],['cold','Cold storage'],['warehouse','Distribution'],['custom','Custom']];
    byId('gg5Presets').innerHTML=presets.map(function(x){return'<button type="button" data-gg5-preset="'+x[0]+'">'+x[1]+'</button>'}).join('');
    qa('[data-gg5-preset]').forEach(function(b){b.addEventListener('click',function(){
      var sel=byId('projectType');if(!sel)return;sel.value=b.getAttribute('data-gg5-preset');sel.dispatchEvent(new Event('change',{bubbles:true}));updateRail()
    })});
    byId('gg5Run').addEventListener('click',function(){byId('analyseBtn').click();setTimeout(function(){byId('screen').scrollIntoView({behavior:'smooth',block:'start'})},20)});
    byId('gg5Best').addEventListener('click',findBest);
    byId('gg5Top3').addEventListener('click',shortlistTop3);
    byId('gg5Evidence').addEventListener('click',function(){byId('registry').scrollIntoView({behavior:'smooth',block:'start'})});
    updateRail();renderWatch()
  }

  function updateRail(){
    var r=req(),host=byId('gg5RailHead');if(!r||!host)return;
    host.innerHTML='<div class="project"><span>PROJECT LOAD</span><strong>'+esc(projectLabel())+'</strong></div>'+
      '<div><span>PEAK POWER</span><strong>'+Number(r.power).toFixed(1)+' MW</strong></div>'+
      '<div><span>WATER</span><strong>'+Number(r.water).toFixed(2)+' MGD</strong></div>'+
      '<div><span>ONLINE TARGET</span><strong>'+r.timeline+' MONTHS</strong></div>'+
      '<div><span>RISK POSTURE</span><strong>'+esc(String(r.risk).toUpperCase())+'</strong></div>';
    qa('[data-gg5-preset]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-gg5-preset')===r.projectType)})
  }

  function findBest(){
    var list=sortedSites();if(!list.length)return;var best=list[0],site=byId('siteSelect');site.value=best.s.id;site.dispatchEvent(new Event('change',{bubbles:true}));
    try{runAnalysis()}catch(e){byId('analyseBtn').click()}try{rankAll()}catch(e){}
    setTimeout(function(){updateDecision();byId('screen').scrollIntoView({behavior:'smooth',block:'start'})},30);
    notify(best.s.name+' leads the current pilot screen.')
  }

  function shortlistTop3(){
    var list=sortedSites();if(!list.length)return;
    try{
      compareIds=list.slice(0,3).map(function(x){return x.s.id});
      localStorage.setItem('gagegrid-compare',JSON.stringify(compareIds));
      renderComparison();renderRanking();renderPortfolio();
      byId('compare').scrollIntoView({behavior:'smooth',block:'start'});
      notify('Top three pilot sites added to the shortlist.')
    }catch(e){notify('Run the project screen first.')}
  }

  function installDecisionLedger(){
    if(byId('gg5Decision'))return;
    var work=q('#screen .workbench');if(!work)return;
    var ledger=document.createElement('section');ledger.id='gg5Decision';ledger.className='gg5-decision-ledger';
    ledger.innerHTML='<div class="gg5-decision-grid" id="gg5DecisionGrid"></div><div class="gg5-decision-tools"><span>FIELD DECISION / KEEP THE NEXT DILIGENCE ACTION ATTACHED TO THE SITE</span><button type="button" id="gg5Copy">COPY FIELD NOTE</button><button type="button" id="gg5Watch">WATCH DECISION</button><button type="button" id="gg5OpenRank">OPEN RANKING</button></div>';
    work.insertAdjacentElement('beforebegin',ledger);
    byId('gg5Copy').addEventListener('click',copyDecision);
    byId('gg5Watch').addEventListener('click',watchDecision);
    byId('gg5OpenRank').addEventListener('click',function(){try{rankAll()}catch(e){}byId('rank').scrollIntoView({behavior:'smooth',block:'start'})})
  }

  function updateDecision(){
    var host=byId('gg5Decision'),grid=byId('gg5DecisionGrid'),a=null;if(!host||!grid)return;try{a=lastAnalysis}catch(e){}
    if(!a){host.classList.remove('visible');return}
    var stress=null;try{stress=analyzeSite(a.s,a.req,true)}catch(e){}
    var buffer=a.req.timeline-a.s.lead;
    var vclass=a.vclass==='go'?'go':a.vclass==='hold'?'hold':'';
    grid.innerHTML='<div class="verdict '+vclass+'"><span>FIELD CALL / '+esc(a.s.id)+'</span><strong>'+esc(a.verdict)+'</strong><small>'+esc(a.s.name)+' · '+esc(projectLabel())+'</small></div>'+
      '<div><span>DEFENSIBLE RANGE</span><strong>'+a.low+'–'+a.high+'</strong><small>modeled '+a.score+'/100</small></div>'+
      '<div><span>FIRST CONSTRAINT</span><strong>'+esc(a.worst.name)+'</strong><small>'+Math.round(a.worst.ratio*100)+'% risk-adjusted coverage</small></div>'+
      '<div><span>TIME BUFFER</span><strong>'+(buffer>=0?buffer+' mo':Math.abs(buffer)+' mo late')+'</strong><small>'+a.s.lead+' mo lead / '+a.req.timeline+' mo target</small></div>'+
      '<div><span>STRESS TEST</span><strong>'+(stress?esc(stress.verdict):'—')+'</strong><small>'+(stress?stress.low+'–'+stress.high:'not available')+'</small></div>';
    host.classList.add('visible')
  }

  function decisionText(){
    var a=null;try{a=lastAnalysis}catch(e){}if(!a)return'';var next='';try{next=nextStep(a.worst,a.s)}catch(e){}
    return['GAGE GRID / FIELD NOTE',a.s.name+' — '+a.s.county+', '+a.s.state,projectLabel(),'','Decision: '+a.verdict,'Range: '+a.low+'–'+a.high,'First constraint: '+a.worst.name+' ('+Math.round(a.worst.ratio*100)+'% coverage)','Modeled lead: '+a.s.lead+' months / target '+a.req.timeline+' months','Evidence: '+a.s.evidence+' ('+a.s.confidence+'% confidence)','','Next diligence: '+next,'','Scenario: '+location.href,'Pilot capacity is simulated; verify with the relevant utility before committing capital.'].join('\n')
  }

  function copyDecision(){
    var text=decisionText();if(!text){notify('Run a site screen first.');return}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){notify('Field note copied.')}).catch(function(){fallbackCopy(text)})}else fallbackCopy(text)
  }
  function fallbackCopy(text){var a=document.createElement('textarea');a.value=text;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();notify('Field note copied.')}

  function readWatch(){try{var x=JSON.parse(localStorage.getItem(WATCH_KEY)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
  function writeWatch(x){localStorage.setItem(WATCH_KEY,JSON.stringify(x.slice(0,10)))}
  function watchDecision(){
    var a=null;try{a=lastAnalysis}catch(e){}if(!a){notify('Run a site screen first.');return}
    var item={id:a.s.id+'-'+Date.now(),siteId:a.s.id,siteName:a.s.name,projectType:a.req.projectType,req:a.req,fingerprint:fingerprint(a.req),low:a.low,high:a.high,bottleneck:a.worst.name,siteUpdated:a.s.updated,siteChange:a.s.change};
    var list=readWatch().filter(function(w){return !(w.siteId===item.siteId&&w.fingerprint===item.fingerprint)});
    writeWatch([item].concat(list));renderWatch();notify('Decision saved to Field Notes.')
  }
  function renderWatch(){
    var host=byId('gg5WatchList');if(!host)return;var list=readWatch();
    if(!list.length){host.innerHTML='<div class="gg5-watch-empty">Watch a screened project/site decision here. If the pilot site record changes later, Gage marks the field note as changed.</div>';return}
    host.innerHTML=list.slice(0,4).map(function(w){var site=null;try{site=sites.find(function(s){return s.id===w.siteId})}catch(e){}var changed=Boolean(site&&(site.updated!==w.siteUpdated||site.change!==w.siteChange));return'<button type="button" class="gg5-watch-item '+(changed?'changed':'')+'" data-gg5-watch="'+esc(w.id)+'"><div><strong>'+esc(w.siteName)+'</strong><span>'+esc(projectPresets[w.projectType]?projectPresets[w.projectType].label:w.projectType)+' · '+w.low+'–'+w.high+' · '+esc(w.bottleneck)+'</span></div><em>'+(changed?'UPDATED':'SAVED')+'</em></button>'}).join('');
    qa('[data-gg5-watch]').forEach(function(b){b.addEventListener('click',function(){reopenWatch(b.getAttribute('data-gg5-watch'))})})
  }
  function reopenWatch(id){
    var w=readWatch().find(function(x){return x.id===id});if(!w)return;var r=w.req||{};
    var values={projectType:w.projectType,siteSelect:w.siteId,powerReq:r.power,waterReq:r.water,wasteReq:r.waste,gasReq:r.gas,fiberReq:r.fiber,powerRedundancy:r.redundancy,timeline:r.timeline,risk:r.risk,growth:Math.round((r.growth||0)*100),capitalExposure:r.capital||0};
    Object.keys(values).forEach(function(k){var el=byId(k);if(el&&values[k]!=null)el.value=String(values[k])});
    try{runAnalysis()}catch(e){byId('analyseBtn').click()}updateRail();setTimeout(function(){updateDecision();byId('screen').scrollIntoView({behavior:'smooth',block:'start'})},30)
  }

  function installMobileTabs(){
    if(q('.gg5-mobile-tabs'))return;
    var nav=document.createElement('nav');nav.className='gg5-mobile-tabs';nav.setAttribute('aria-label','Quick navigation');
    nav.innerHTML='<button type="button" data-gg5-jump="screen">SCREEN</button><button type="button" data-gg5-jump="rank">RANK</button><button type="button" data-gg5-jump="compare">SHORTLIST</button><button type="button" data-gg5-jump="registry">EVIDENCE</button>';
    document.body.appendChild(nav);
    qa('[data-gg5-jump]',nav).forEach(function(b){b.addEventListener('click',function(){byId(b.getAttribute('data-gg5-jump')).scrollIntoView({behavior:'smooth',block:'start'})})})
  }

  function tuneNav(){
    var nav=q('.top nav');if(!nav)return;var labels=['Screen','Rank','Shortlist','Evidence','Changes','Method'];
    qa('a',nav).forEach(function(a,i){if(labels[i])a.textContent=labels[i]})
  }

  function listeners(){
    ['projectType','siteSelect','powerReq','waterReq','wasteReq','gasReq','fiberReq','timeline','powerRedundancy','risk','growth','capitalExposure'].forEach(function(id){var el=byId(id);if(!el)return;el.addEventListener('input',updateRail);el.addEventListener('change',function(){setTimeout(updateRail,0)})});
    if(byId('analyseBtn'))byId('analyseBtn').addEventListener('click',function(){setTimeout(function(){updateDecision();renderWatch()},35)});
    if(byId('loadDemoBtn'))byId('loadDemoBtn').addEventListener('click',function(){setTimeout(function(){updateRail();updateDecision()},80)});
    var result=byId('resultState');if(result)new MutationObserver(function(){setTimeout(updateDecision,0)}).observe(result,{childList:true,subtree:true})
  }

  function boot(){
    document.body.classList.add('gg-fieldbook');
    tuneNav();installHeroSheet();installProjectRail();installDecisionLedger();installMobileTabs();listeners();updateRail();updateDecision();renderWatch()
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,0)},{once:true});else setTimeout(boot,0)
})();