'use strict';
(function(){
  var byId=function(id){return document.getElementById(id)};
  var q=function(s,r){return (r||document).querySelector(s)};
  var qa=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})};

  function keepFinalCssLast(){
    var link=q('link[href="/gage-fieldbook-v6.css"]');
    if(!link)return;
    var moving=false;
    var head=document.head;
    var observer=new MutationObserver(function(records){
      if(moving)return;
      var added=records.some(function(r){return Array.prototype.some.call(r.addedNodes,function(n){return n!==link&&(n.tagName==='STYLE'||n.tagName==='LINK')})});
      if(!added)return;
      moving=true;head.appendChild(link);moving=false;
    });
    observer.observe(head,{childList:true});
    window.setTimeout(function(){observer.disconnect();head.appendChild(link)},6500);
  }

  function tuneHero(){
    var hero=q('.hero');if(!hero)return;
    var h1=q('h1',hero),copy=q('.hero-copy>p',hero),stamp=q('.hero-stamp',hero),actions=q('.hero-actions',hero);
    if(h1)h1.innerHTML='Start with what you know.<br><em>Know what to verify first.</em>';
    if(copy)copy.textContent='Gage Grid turns an industrial project load into a practical serviceability screen: where the site fits, where it breaks, how much uncertainty remains, and which utility question deserves the next dollar of diligence.';
    if(stamp)stamp.innerHTML='<b>FIELD RULE 01 / PROXIMITY IS NOT SERVICEABILITY</b>A line on a map is only context. Gage keeps modeled capacity, public evidence and the site-specific written utility confirmation separate.';
    if(actions){
      var first=actions.children[0];if(first)first.textContent='Screen a project';
      var demo=byId('loadDemoBtn');if(demo)demo.textContent='Load worked example';
      var records=byId('gg6RecordsLink');
      if(!records){
        records=document.createElement('a');records.id='gg6RecordsLink';records.className='btn ghost';records.href='#registry';records.textContent='Open evidence records';
        actions.appendChild(records);
      }
    }
  }

  function previewAnalysis(){
    try{
      var site=sites.find(function(s){return s.id==='GG-IL-101'});
      if(!site)return null;
      var req={power:45,water:.28,waste:.18,gas:10,fiber:3,redundancy:3,growth:.20,timeline:24,risk:'balanced',capital:500000,projectType:'data'};
      return analyzeSite(site,req,false);
    }catch(e){return null}
  }

  function workedCandidate(){
    var sections=qa('section');
    for(var i=0;i<sections.length;i++){
      var txt=(sections[i].textContent||'').replace(/\s+/g,' ').trim();
      if(/WORKED DECISION/i.test(txt)&&/trust the score/i.test(txt))return sections[i];
    }
    return null;
  }

  function buildWorked(){
    var section=workedCandidate();
    if(!section||section.dataset.gg6Worked==='1')return false;
    section.dataset.gg6Worked='1';
    section.className='gg6-worked';
    section.id='gg6WorkedScreen';
    var a=previewAnalysis();
    var decision=a?a.verdict:'Run example';
    var range=a?(a.low+'–'+a.high):'—';
    var weak=a&&a.worst?a.worst.name:'—';
    section.innerHTML=
      '<div class="gg6-worked-head"><div><div class="gg6-worked-kicker">WORKED SCREEN / ONE CLICK</div><h2>See what breaks first before you trust the score.</h2><p>Run a realistic 45 MW compute project against Joliet South. The model, the public context and the utility proof boundary stay visibly separate.</p></div><button type="button" class="gg6-worked-run" id="gg6RunWorked">RUN WORKED SCREEN →</button></div>'+
      '<div class="gg6-worked-grid">'+
        '<article class="gg6-worked-card project"><span>PROJECT</span><strong>45 MW compute</strong><p>0.28 MGD water · 0.18 MGD wastewater · carrier-dense fiber · 24-month target · 20% growth.</p></article>'+
        '<article class="gg6-worked-card decision"><span>MODEL SCREEN</span><strong>'+esc(decision)+'</strong><p>Defensible range '+esc(range)+' · first modeled constraint: '+esc(weak)+'. This remains a screening result, not a utility commitment.</p></article>'+
        '<article class="gg6-worked-card context" id="gg6EpaCard"><span>EPA ECHO / LIVE CONTEXT</span><strong>Connecting…</strong><p>Environmental context loads independently from the capacity model.</p></article>'+
        '<article class="gg6-worked-card context" id="gg6UsgsCard"><span>USGS WATER / LIVE CONTEXT</span><strong>Connecting…</strong><p>Hydrology context is public evidence, not municipal serviceability.</p></article>'+
      '</div>'+
      '<div class="gg6-worked-foot"><b>THE POINT</b><span>Gage separates modeled capacity, live public context and the site-specific utility confirmation still required before capital is committed.</span></div>';
    byId('gg6RunWorked')?.addEventListener('click',runWorked);
    loadWorkedEvidence();
    return true;
  }

  function runWorked(){
    var project=byId('projectType');if(project){project.value='data';project.dispatchEvent(new Event('change',{bubbles:true}))}
    window.setTimeout(function(){
      var values={siteSelect:'GG-IL-101',powerReq:'45',waterReq:'.28',wasteReq:'.18',gasReq:'10',fiberReq:'3',powerRedundancy:'3',timeline:'24',risk:'balanced',growth:'20',capitalExposure:'500000'};
      Object.keys(values).forEach(function(id){var el=byId(id);if(el){el.value=values[id];el.dispatchEvent(new Event('change',{bubbles:true}))}});
      byId('analyseBtn')?.click();
      window.setTimeout(function(){byId('screen')?.scrollIntoView({behavior:'smooth',block:'start'})},70);
    },35);
  }

  function loadWorkedEvidence(){
    var epa=byId('gg6EpaCard'),usgs=byId('gg6UsgsCard');
    if(epa){
      fetch('/api/epa-echo?site=GG-IL-101',{headers:{Accept:'application/json'}}).then(function(r){return r.json()}).then(function(data){
        if(!data||!data.ok)throw new Error('epa');
        var s=data.summary||{};
        epa.innerHTML='<span>EPA ECHO / LIVE CONTEXT</span><strong>'+Number(s.regulatedFacilities||0).toLocaleString()+' nearby records</strong><p>'+Number(s.currentNoncompliance||0).toLocaleString()+' current noncompliance · '+Number(s.recentNoncompliance||0).toLocaleString()+' recent-history signals. Context only; this does not prove wastewater capacity.</p>';
      }).catch(function(){epa.innerHTML='<span>EPA ECHO / LIVE CONTEXT</span><strong>Public feed unavailable</strong><p>The worked screen still runs; environmental context does not change modeled capacity.</p>'});
    }
    if(usgs){
      fetch('/api/usgs-water?site=GG-IL-101',{headers:{Accept:'application/json'}}).then(function(r){return r.json()}).then(function(data){
        if(!data||!data.ok)throw new Error('usgs');
        var n=data.nearest||data.observation||null;
        var flow=n&&Number(n.flowCfs);
        var distance=n&&n.distanceMiles;
        usgs.innerHTML='<span>USGS WATER / LIVE CONTEXT</span><strong>'+(Number.isFinite(flow)?flow.toLocaleString()+' cfs observed':'Current hydrology returned')+'</strong><p>'+(distance!=null?distance+' mi from pilot node · ':'')+'Observed federal hydrology context. It does not prove municipal allocation, pressure or parcel service.</p>';
      }).catch(function(){usgs.innerHTML='<span>USGS WATER / LIVE CONTEXT</span><strong>Public feed unavailable</strong><p>The worked screen still runs; hydrology context does not change modeled capacity.</p>'});
    }
  }

  function tuneGuided(){
    var guided=byId('ggpGuided');if(!guided)return;
    var h=q('.head h2',guided),p=q('.head p',guided);
    if(h)h.textContent='Start with the decision you actually have.';
    if(p)p.textContent='Bring a site you already care about, or let one project load make every pilot node compete on the same terms.';
    var paths=qa('.ggp-paths button',guided);
    if(paths[0]){
      var b0=q('b',paths[0]),s0=q('small',paths[0]);if(b0)b0.textContent='I already have a site';if(s0)s0.textContent='Test the parcel against the project load and expose the first constraint.';
    }
    if(paths[1]){
      var b1=q('b',paths[1]),s1=q('small',paths[1]);if(b1)b1.textContent='I need the project to choose';if(s1)s1.textContent='Rank the pilot around the load first, then spend diligence on the leader.';
    }
  }

  function tuneDecisionGate(){
    var gate=byId('decision-gate');if(!gate)return;
    var head=q('.ggx-gate-head h2',gate);
    var intro=q('.ggx-gate-head p',gate);
    if(head&&/VERIFY BEFORE COMMITTING|PROCEED|STOP/.test(head.textContent||'')){}
    if(intro)intro.style.maxWidth='760px';
  }

  function boot(){
    document.body.classList.add('gg-v6');
    keepFinalCssLast();
    tuneHero();
    tuneGuided();
    buildWorked();
    tuneDecisionGate();

    var attempts=0;
    var timer=window.setInterval(function(){
      attempts++;
      tuneHero();tuneGuided();buildWorked();tuneDecisionGate();
      if(attempts>24)window.clearInterval(timer);
    },250);

    var bodyObserver=new MutationObserver(function(){
      window.requestAnimationFrame(function(){buildWorked();tuneGuided()});
    });
    bodyObserver.observe(document.body,{childList:true,subtree:true});
    window.setTimeout(function(){bodyObserver.disconnect()},7000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();