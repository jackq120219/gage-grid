'use strict';
(function(){
  var byId=function(id){return document.getElementById(id)};
  var q=function(sel,root){return (root||document).querySelector(sel)};
  var qa=function(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))};
  var liveTimer=null;
  var decisionMode='rank';

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  function analysis(){
    try{return lastAnalysis||null}catch(e){return null}
  }

  function requirements(){
    try{return currentReq()}catch(e){return null}
  }

  function openDeepFor(el){
    var deep=el&&el.closest?el.closest('#gg11DeepDive'):null;
    if(deep)deep.open=true;
  }

  function go(id){
    var el=byId(id);
    if(!el)return;
    openDeepFor(el);
    el.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function compactNav(){
    var nav=q('.top nav');
    if(!nav)return;
    nav.innerHTML=
      '<a href="#screen">Project</a>'+
      '<a href="#gg9Envelope">Stress</a>'+
      '<a href="#rank">Decision</a>'+
      '<a href="#registry">Data</a>'+
      '<a href="#access">Pilot</a>';
  }

  function installFlowRail(){
    var old=byId('gg10Workflow');
    if(old)old.classList.add('gg12-superseded');
    if(byId('gg12FlowRail'))return;
    var metrics=q('.mini-metrics');
    if(!metrics)return;
    var rail=document.createElement('nav');
    rail.id='gg12FlowRail';
    rail.className='gg12-flow-rail shell';
    rail.setAttribute('aria-label','Gage workflow shortcuts');
    rail.innerHTML=
      '<button type="button" data-gg12-go="screen"><span>01</span><b>PROJECT</b><em>Define the load</em></button>'+
      '<button type="button" data-gg12-go="gg9Envelope"><span>02</span><b>STRESS</b><em>Push the envelope</em></button>'+
      '<button type="button" data-gg12-go="rank"><span>03</span><b>DECIDE</b><em>Rank the options</em></button>'+
      '<button type="button" data-gg12-go="registry"><span>04</span><b>PROVE</b><em>Inspect evidence</em></button>'+
      '<button type="button" data-gg12-go="access"><span>05</span><b>HANDOFF</b><em>Take the case</em></button>';
    metrics.insertAdjacentElement('afterend',rail);
    qa('[data-gg12-go]',rail).forEach(function(btn){
      btn.addEventListener('click',function(){go(btn.getAttribute('data-gg12-go'))});
    });
  }

  function foldFastBrief(){
    var brief=q('.ggx-brief');
    if(!brief||brief.closest('.gg12-brief-drawer'))return;
    var details=document.createElement('details');
    details.className='gg12-brief-drawer';
    var summary=document.createElement('summary');
    summary.innerHTML='<span>FAST START</span><b>Paste one project sentence</b><em>OPEN</em>';
    details.appendChild(summary);
    brief.parentNode.insertBefore(details,brief);
    details.appendChild(brief);
    details.addEventListener('toggle',function(){
      var state=q('summary em',details);
      if(state)state.textContent=details.open?'CLOSE':'OPEN';
    });
  }

  function showDecisionTab(mode,scroll){
    var rank=byId('rank');
    var compare=byId('compare');
    var tabs=byId('gg12DecisionTabs');
    if(!rank||!compare||!tabs)return;
    decisionMode=mode==='compare'?'compare':'rank';
    rank.classList.toggle('gg12-hidden-panel',decisionMode!=='rank');
    compare.classList.toggle('gg12-hidden-panel',decisionMode!=='compare');
    qa('[data-gg12-tab]',tabs).forEach(function(btn){
      var active=btn.getAttribute('data-gg12-tab')===decisionMode;
      btn.setAttribute('aria-pressed',String(active));
    });
    if(scroll)go(decisionMode==='rank'?'rank':'compare');
  }

  function installDecisionTabs(){
    if(byId('gg12DecisionTabs'))return;
    var rank=byId('rank');
    var compare=byId('compare');
    if(!rank||!compare)return;
    var tabs=document.createElement('div');
    tabs.id='gg12DecisionTabs';
    tabs.className='gg12-decision-tabs shell';
    tabs.innerHTML=
      '<div><span>DECISION DESK</span><b>One project. Two views.</b></div>'+
      '<div class="gg12-tabset">'+
        '<button type="button" data-gg12-tab="rank" aria-pressed="true">RANK ALL</button>'+
        '<button type="button" data-gg12-tab="compare" aria-pressed="false">COMPARE SHORTLIST</button>'+
      '</div>';
    rank.parentNode.insertBefore(tabs,rank);
    qa('[data-gg12-tab]',tabs).forEach(function(btn){
      btn.addEventListener('click',function(){showDecisionTab(btn.getAttribute('data-gg12-tab'),false)});
    });
    showDecisionTab('rank',false);
    document.addEventListener('click',function(e){
      var target=e.target&&e.target.closest?e.target.closest('[data-compare],[data-cardcompare],#compareBtn'):null;
      if(!target)return;
      window.setTimeout(function(){showDecisionTab('compare',true)},80);
    });
  }

  function foldSection(section,kind,title,meta){
    if(!section||section.closest('.gg12-section-drawer'))return;
    var details=document.createElement('details');
    details.className='gg12-section-drawer gg12-'+kind+'-drawer shell';
    var summary=document.createElement('summary');
    summary.innerHTML='<div><span>'+esc(meta)+'</span><b>'+esc(title)+'</b></div><em>OPEN</em>';
    details.appendChild(summary);
    section.parentNode.insertBefore(details,section);
    details.appendChild(section);
    details.addEventListener('toggle',function(){
      var state=q('summary em',details);
      if(state)state.textContent=details.open?'CLOSE':'OPEN';
    });
  }

  function foldSecondarySections(){
    foldSection(byId('sites'),'sites','Pilot node snapshot','4 BROAD LEADERS · OPTIONAL');
    foldSection(q('.saved-section'),'saved','Local decision workspace','SAVED IN THIS BROWSER');
  }

  function trimRegistry(){
    var rows=qa('#rows tr');
    var toggle=byId('registryToggleBtn');
    var summary=byId('registrySummary');
    if(!rows.length||!toggle)return;
    var expanded=String(toggle.textContent||'').indexOf('SHOW PREVIEW')>=0;
    rows.forEach(function(row,index){
      row.style.display=(!expanded&&index>=4)?'none':'';
    });
    if(!expanded&&summary&&rows.length>4){
      var total=parseInt(String(byId('count')&&byId('count').textContent||rows.length),10);
      if(!Number.isFinite(total))total=rows.length;
      summary.textContent='Showing 4 of '+total+' matching records';
    }
  }

  function installRegistryObserver(){
    var rows=byId('rows');
    var toggle=byId('registryToggleBtn');
    if(rows){
      new MutationObserver(function(){trimRegistry()}).observe(rows,{childList:true});
    }
    if(toggle){
      new MutationObserver(function(){trimRegistry()}).observe(toggle,{childList:true,characterData:true,subtree:true});
    }
    trimRegistry();
  }

  function pulseMarkup(a){
    var ready=a.s.lead+'–'+(a.s.lead+6)+' mo';
    var tone=a.vclass==='go'?'go':a.vclass==='hold'?'hold':'conditional';
    return ''+
      '<div class="gg12-pulse-state '+tone+'">'+
        '<span>DECISION</span><strong>'+esc(a.verdict)+'</strong>'+
      '</div>'+
      '<div class="gg12-pulse-metric"><span>RANGE</span><b>'+a.low+'–'+a.high+'</b></div>'+
      '<div class="gg12-pulse-metric"><span>WEAK LINK</span><b>'+esc(a.worst.name)+'</b></div>'+
      '<div class="gg12-pulse-metric"><span>READY</span><b>'+ready+'</b></div>'+
      '<div class="gg12-pulse-actions">'+
        '<button type="button" data-gg12-pulse="stress">STRESS</button>'+
        '<button type="button" data-gg12-pulse="rank">RANK</button>'+
        '<button type="button" data-gg12-pulse="compare">COMPARE</button>'+
      '</div>';
  }

  function foldResultDiligence(){
    var host=byId('resultState');
    if(!host)return;
    var diligence=q('.diligence',host);
    if(diligence&&!diligence.closest('.gg12-inline-drawer')){
      var count=qa('li',diligence).length;
      var details=document.createElement('details');
      details.className='gg12-inline-drawer';
      var summary=document.createElement('summary');
      summary.innerHTML='<span>DILIGENCE ORDER</span><b>'+count+' next actions</b><em>OPEN</em>';
      diligence.parentNode.insertBefore(details,diligence);
      details.appendChild(summary);
      details.appendChild(diligence);
      details.addEventListener('toggle',function(){
        var state=q('summary em',details);
        if(state)state.textContent=details.open?'CLOSE':'OPEN';
      });
    }
  }

  function enhanceResult(){
    var host=byId('resultState');
    var results=q('.results');
    var a=analysis();
    if(!host||!results||!a||host.classList.contains('hidden'))return;
    results.classList.add('gg12-has-pulse');
    var pulse=byId('gg12DecisionPulse');
    if(!pulse){
      pulse=document.createElement('div');
      pulse.id='gg12DecisionPulse';
      pulse.className='gg12-decision-pulse';
      results.insertBefore(pulse,host);
    }
    pulse.innerHTML=pulseMarkup(a);
    qa('[data-gg12-pulse]',pulse).forEach(function(btn){
      btn.addEventListener('click',function(){
        var action=btn.getAttribute('data-gg12-pulse');
        if(action==='stress'){
          var select=byId('gg9EnvelopeSite');
          if(select){select.value=a.s.id;select.dispatchEvent(new Event('change',{bubbles:true}))}
          go('gg9Envelope');
        }else if(action==='rank'){
          try{rankAll()}catch(e){}
          showDecisionTab('rank',true);
        }else if(action==='compare'){
          try{addCompare(a.s.id)}catch(e){}
          showDecisionTab('compare',true);
        }
      });
    });
    foldResultDiligence();
  }

  function installResultObserver(){
    var host=byId('resultState');
    if(!host)return;
    new MutationObserver(function(){window.setTimeout(enhanceResult,0)}).observe(host,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    enhanceResult();
  }

  function installLiveRefresh(){
    var ids=['projectType','siteSelect','powerReq','waterReq','wasteReq','gasReq','fiberReq','powerRedundancy','timeline','risk','growth','capitalExposure'];
    ids.forEach(function(id){
      var el=byId(id);
      if(!el)return;
      var queue=function(){
        if(!analysis())return;
        document.body.classList.add('gg12-live-pending');
        window.clearTimeout(liveTimer);
        liveTimer=window.setTimeout(function(){
          try{runAnalysis()}catch(e){}
          document.body.classList.remove('gg12-live-pending');
        },320);
      };
      el.addEventListener('input',queue);
      el.addEventListener('change',queue);
    });
    var button=byId('analyseBtn');
    if(button)button.textContent='RUN / REFRESH FEASIBILITY →';
  }

  function currentProjectName(req){
    try{return projectPresets[req.projectType]&&projectPresets[req.projectType].label||'Custom industrial load'}catch(e){return'Industrial project'}
  }

  function pilotBrief(contact){
    var req=requirements();
    var a=analysis();
    var siteName='';
    try{
      var site=sites.find(function(x){return x.id===byId('siteSelect').value});
      siteName=site?site.name:'';
    }catch(e){}
    if(!req)return 'GAGE GRID / PILOT REQUEST\nContact: '+(contact||'Not provided');
    var lines=[
      'GAGE GRID / PILOT REQUEST',
      'Contact: '+(contact||'Not provided'),
      '',
      'Project: '+currentProjectName(req),
      'Pilot site: '+(a?a.s.name:siteName||'Not selected'),
      'Peak power: '+req.power+' MW',
      'Water / wastewater: '+req.water+' / '+req.waste+' MGD',
      'Gas: '+req.gas+' MMBtu/h',
      'Fiber level: '+req.fiber,
      'Power redundancy: '+req.redundancy,
      'Target online: '+req.timeline+' months',
      '24-month growth: '+Math.round((req.growth||0)*100)+'%',
      'Risk posture: '+req.risk
    ];
    if(a){
      lines=lines.concat([
        '',
        'Current pilot screen:',
        'Decision: '+a.verdict,
        'Feasibility range: '+a.low+'–'+a.high,
        'Primary bottleneck: '+a.worst.name,
        'Modeled coverage: '+Math.round(a.worst.ratio*100)+'%'
      ]);
    }
    lines=lines.concat([
      '',
      'Scenario: '+location.href,
      '',
      'Pilot capacity is simulated and requires utility verification.'
    ]);
    return lines.join('\n');
  }

  function copyText(text){
    if(navigator.clipboard&&navigator.clipboard.writeText){
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function(resolve,reject){
      try{
        var area=document.createElement('textarea');
        area.value=text;
        area.style.position='fixed';
        area.style.opacity='0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
        resolve();
      }catch(e){reject(e)}
    });
  }

  function installPilotHandoff(){
    var panel=byId('access');
    var form=byId('accessForm');
    if(!panel||!form)return;
    var kicker=q('.kicker',panel);
    var title=q('h2',panel);
    var copy=q('p',panel);
    var input=byId('email');
    var submit=q('button',form);
    if(kicker)kicker.textContent='PILOT HANDOFF';
    if(title)title.innerHTML='Take the case.<br>Keep the context.';
    if(copy)copy.textContent='Copy a compact handoff built from the project currently on screen. It keeps the load, decision and bottleneck together without pretending this prototype has a live CRM.';
    if(input)input.placeholder='your work email';
    if(submit)submit.textContent='COPY PILOT BRIEF';
    var msg=byId('msg');
    var mail=byId('gg12MailBtn');
    if(!mail){
      mail=document.createElement('button');
      mail.type='button';
      mail.id='gg12MailBtn';
      mail.className='gg12-mail-btn';
      mail.textContent='OPEN EMAIL DRAFT';
      form.insertAdjacentElement('afterend',mail);
    }

    form.addEventListener('submit',function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      var text=pilotBrief(input?input.value.trim():'');
      copyText(text).then(function(){
        if(msg)msg.textContent='Pilot brief copied. Paste it into an email, DM or deal note. ✓';
      }).catch(function(){
        if(msg)msg.textContent='Copy was blocked by the browser. Use “Open email draft” instead.';
      });
    },true);

    mail.addEventListener('click',function(){
      var text=pilotBrief(input?input.value.trim():'');
      var href='mailto:?subject='+encodeURIComponent('Gage Grid pilot request')+'&body='+encodeURIComponent(text);
      window.location.href=href;
    });
  }

  function updateDrawerCounts(){
    var saved=String(byId('savedCount')&&byId('savedCount').textContent||'0');
    var drawer=q('.gg12-saved-drawer summary span');
    if(drawer)drawer.textContent=saved+' SAVED DECISIONS · LOCAL';
  }

  function installSavedObserver(){
    var count=byId('savedCount');
    if(count){
      new MutationObserver(updateDrawerCounts).observe(count,{childList:true,characterData:true,subtree:true});
    }
    updateDrawerCounts();
  }

  function installKeyboardPolish(){
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'){
        var dialog=byId('recordDialog');
        if(dialog&&dialog.open)dialog.close();
      }
    });
  }

  function boot(){
    document.body.classList.add('gg12-runtime');
    compactNav();
    installFlowRail();
    foldFastBrief();
    installDecisionTabs();
    foldSecondarySections();
    installRegistryObserver();
    installResultObserver();
    installLiveRefresh();
    installPilotHandoff();
    installSavedObserver();
    installKeyboardPolish();
    window.setTimeout(function(){
      trimRegistry();
      enhanceResult();
    },60);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();