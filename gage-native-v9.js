'use strict';
(function(){
  var byId=function(id){return document.getElementById(id)};
  var q=function(s,r){return (r||document).querySelector(s)};
  var qa=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var SYSTEMS=[
    {name:'Power',key:'power',unit:'MW',verify:'Firm deliverable MW by the target date, service voltage, feed/substation path, upgrade scope and schedule owner.'},
    {name:'Water',key:'water',unit:'MGD',verify:'Firm daily and peak-day service, pressure/flow basis, storage and extension work to the parcel.'},
    {name:'Wastewater',key:'waste',unit:'MGD',verify:'Permitted hydraulic and treatment headroom, pretreatment limits and collection-system constraints.'},
    {name:'Gas',key:'gas',unit:'MMBtu/h',verify:'Firm hourly capacity, delivery pressure, regulator/main extension and reinforcement schedule.'},
    {name:'Fiber',key:'fiber',unit:'routes',verify:'Physically diverse routes, carrier ownership, entrance paths, meet points and construction timing.'}
  ];
  var selectedSystem='Power';
  var envelopeSiteId='';
  var multiplier=1;
  var mode='base';
  var lastEnvelope=null;

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }
  function current(){
    try{return currentReq()}catch(e){return null}
  }
  function currentSite(){
    try{
      var id=envelopeSiteId||(byId('siteSelect')&&byId('siteSelect').value);
      return sites.find(function(s){return s.id===id})||sites[0]||null;
    }catch(e){return null}
  }
  function projectName(req){
    try{return projectPresets[req.projectType]&&projectPresets[req.projectType].label||'Custom industrial load'}catch(e){return'Industrial project'}
  }
  function stressReq(){
    var base=current();if(!base)return null;
    var r=Object.assign({},base);
    ['power','water','waste','gas'].forEach(function(k){r[k]=(Number(base[k])||0)*multiplier});
    if(mode==='fast')r.timeline=Math.max(12,(Number(base.timeline)||24)-12);
    if(mode==='strict')r.risk='conservative';
    if(mode==='reserve')r.growth=(Number(base.growth)||0)+.15;
    return r;
  }
  function rowFor(a,name){
    return a&&a.rows?a.rows.find(function(r){return r.name===name}):null;
  }
  function fmt(v,name){
    var n=Number(v)||0;
    if(name==='Power')return n.toFixed(n<10?1:0)+' MW';
    if(name==='Water'||name==='Wastewater')return n.toFixed(2)+' MGD';
    if(name==='Gas')return Math.round(n).toLocaleString()+' MMBtu/h';
    if(name==='Fiber')return Math.round(n)+' routes';
    return String(n);
  }
  function tone(ratio){
    if(!Number.isFinite(ratio))return'';
    if(ratio<1)return'bad';
    if(ratio<1.2)return'warn';
    return'good';
  }
  function status(ratio){
    if(!Number.isFinite(ratio))return'UNSCREENED';
    if(ratio<1)return'SHORTFALL';
    if(ratio<1.2)return'TIGHT';
    return'PASS';
  }
  function heroSheet(){
    var hero=q('.hero');if(!hero||q('.gg9-hero-sheet',hero))return;
    var h1=q('h1',hero),copy=q('.hero-copy>p',hero),stamp=q('.hero-stamp',hero);
    if(h1)h1.innerHTML='Know what the project needs.<br><em>See what the site can prove.</em>';
    if(copy)copy.textContent='Gage Grid screens industrial projects against the infrastructure that can quietly kill them—power, water, wastewater, gas and fiber—then turns the weak link into an ordered diligence question.';
    if(stamp)stamp.innerHTML='<b>GAGE RULE / SERVICEABILITY BEFORE CONFIDENCE</b>Nearby infrastructure is not enough. Capacity, timing, evidence and redundancy have to survive the same project assumptions before the site deserves more diligence.';
    var sheet=document.createElement('aside');
    sheet.className='gg9-hero-sheet';
    sheet.innerHTML='<div class="gg9-hero-sheet-head"><span>SERVICE ENVELOPE / CURRENT PILOT</span><b id="gg9HeroSite">—</b></div><div id="gg9HeroRows" class="gg9-hero-rows"></div><div class="gg9-hero-foot"><div><span>PROJECT</span><b id="gg9HeroProject">—</b></div><div><span>FIRST CONSTRAINT</span><b id="gg9HeroWeak">—</b></div><div><span>DECISION</span><b id="gg9HeroVerdict">—</b></div></div>';
    hero.appendChild(sheet);
    renderHero();
  }
  function renderHero(){
    var req=current(),site=null;
    try{site=sites.find(function(s){return s.id===byId('siteSelect').value})||sites[0]}catch(e){}
    if(!req||!site||!byId('gg9HeroRows'))return;
    var a=analyzeSite(site,req,false);
    byId('gg9HeroSite').textContent=site.name;
    byId('gg9HeroProject').textContent=projectName(req);
    byId('gg9HeroWeak').textContent=a.worst.name;
    byId('gg9HeroVerdict').textContent=a.verdict;
    byId('gg9HeroRows').innerHTML=SYSTEMS.map(function(sys){
      var row=rowFor(a,sys.name),ratio=row?Number(row.ratio):0,pct=Math.max(4,Math.min(100,ratio*48));
      var cls=tone(ratio);
      return '<div class="gg9-hero-row"><span>'+sys.name.toUpperCase()+'</span><div class="gg9-hero-track"><i class="'+cls+'" style="--w:'+pct+'%"></i></div><b>'+Math.round(ratio*100)+'%</b></div>';
    }).join('');
  }

  function installEnvelope(){
    if(byId('gg9Envelope'))return;
    var metrics=q('.mini-metrics');if(!metrics)return;
    var section=document.createElement('section');
    section.id='gg9Envelope';
    section.className='gg9-envelope shell';
    section.innerHTML=
      '<div class="gg9-envelope-head"><div><div class="kicker">SERVICE ENVELOPE / INTERACTIVE</div><h2>Push the project. See which system gives way first.</h2><p>Drag one control and the five infrastructure systems recalculate together. Click a system to inspect the exact need, usable pilot capacity and next verification question. No hidden hover behavior.</p></div><div class="gg9-envelope-state"><span>CURRENT CASE</span><strong id="gg9EnvelopeVerdict">—</strong></div></div>'+
      '<div class="gg9-envelope-body">'+
        '<aside class="gg9-envelope-controls">'+
          '<label>PILOT SITE<select id="gg9EnvelopeSite"></select></label>'+
          '<div class="gg9-load-head"><span>CORE PROJECT LOAD</span><strong id="gg9LoadPct">100%</strong></div>'+
          '<input id="gg9LoadSlider" class="gg9-slider" type="range" min="65" max="220" step="1" value="100" aria-label="Core project load multiplier">'+
          '<div class="gg9-scale"><span>65%</span><span>100%</span><span>140%</span><span>180%</span><span>220%</span></div>'+
          '<div class="gg9-mode-set">'+
            '<button type="button" data-gg9-mode="base" aria-pressed="true">BASE</button>'+
            '<button type="button" data-gg9-mode="fast">FASTER ONLINE</button>'+
            '<button type="button" data-gg9-mode="strict">STRICT EVIDENCE</button>'+
            '<button type="button" data-gg9-mode="reserve">+15% RESERVE</button>'+
          '</div>'+
          '<div class="gg9-control-buttons"><button type="button" class="primary" id="gg9Break">FIND BREAKPOINT</button><button type="button" id="gg9Best">BEST PILOT FIT</button></div>'+
        '</aside>'+
        '<div class="gg9-envelope-main">'+
          '<div id="gg9Blades" class="gg9-blades"></div>'+
          '<div id="gg9EnvelopeDetail" class="gg9-envelope-detail"></div>'+
          '<div class="gg9-envelope-actions"><button type="button" class="primary" id="gg9UseCase">USE THIS CASE IN LIVE SCREEN</button><button type="button" id="gg9Evidence">OPEN EVIDENCE</button><button type="button" id="gg9Copy">COPY CASE SUMMARY</button></div>'+
        '</div>'+
      '</div>';
    (byId('gg10Workflow')||metrics).insertAdjacentElement('afterend',section);

    var select=byId('gg9EnvelopeSite');
    try{
      select.innerHTML=sites.map(function(s){return '<option value="'+s.id+'">'+esc(s.name)+' · '+s.state+'</option>'}).join('');
      envelopeSiteId=byId('siteSelect').value||sites[0].id;
      select.value=envelopeSiteId;
    }catch(e){}

    select.addEventListener('change',function(){envelopeSiteId=select.value;renderEnvelope()});
    byId('gg9LoadSlider').addEventListener('input',function(){multiplier=(Number(this.value)||100)/100;renderEnvelope()});
    qa('[data-gg9-mode]',section).forEach(function(btn){
      btn.addEventListener('click',function(){
        mode=btn.getAttribute('data-gg9-mode')||'base';
        qa('[data-gg9-mode]',section).forEach(function(x){x.setAttribute('aria-pressed',String(x===btn))});
        renderEnvelope();
      });
    });
    byId('gg9Break').addEventListener('click',findBreakpoint);
    byId('gg9Best').addEventListener('click',bestFit);
    byId('gg9UseCase').addEventListener('click',applyEnvelope);
    byId('gg9Evidence').addEventListener('click',function(){byId('registry')?.scrollIntoView({behavior:'smooth',block:'start'})});
    byId('gg9Copy').addEventListener('click',copyEnvelope);
    renderEnvelope();
  }

  function renderEnvelope(){
    var req=stressReq(),site=currentSite();if(!req||!site||!byId('gg9Blades'))return;
    var a=analyzeSite(site,req,false);
    lastEnvelope={req:req,site:site,a:a};
    byId('gg9LoadPct').textContent=Math.round(multiplier*100)+'%';
    byId('gg9LoadSlider').value=String(Math.round(multiplier*100));
    byId('gg9EnvelopeVerdict').textContent=a.verdict+' · '+a.low+'–'+a.high;
    byId('gg9Blades').innerHTML=SYSTEMS.map(function(sys){
      var row=rowFor(a,sys.name),ratio=row?Number(row.ratio):0,cls=tone(ratio);
      var fill=Math.max(8,Math.min(100,ratio*48));
      return '<button type="button" class="gg9-blade '+cls+(selectedSystem===sys.name?' active':'')+'" data-gg9-system="'+sys.name+'">'+
        '<div class="gg9-blade-top"><span>'+sys.name.toUpperCase()+'</span><strong>'+esc(row?fmt(row.need,sys.name):'—')+'</strong></div>'+
        '<div class="gg9-blade-gauge"><i class="gg9-blade-fill" style="--fill:'+fill+'%"></i><i class="gg9-need-line"></i></div>'+
        '<div class="gg9-blade-meta"><span>USABLE</span><b>'+esc(row?fmt(row.usable,sys.name):'—')+'</b><span>'+status(ratio)+' · '+Math.round(ratio*100)+'%</span></div>'+
        '</button>';
    }).join('');
    qa('[data-gg9-system]',byId('gg9Blades')).forEach(function(btn){
      btn.addEventListener('click',function(){
        selectedSystem=btn.getAttribute('data-gg9-system');
        renderEnvelope();
      });
    });
    renderEnvelopeDetail();
    renderBreakInfographic();
  }

  function renderEnvelopeDetail(){
    if(!lastEnvelope)return;
    var sys=SYSTEMS.find(function(s){return s.name===selectedSystem})||SYSTEMS[0];
    var row=rowFor(lastEnvelope.a,sys.name),ratio=row?Number(row.ratio):0;
    var room=Math.round((ratio-1)*100);
    byId('gg9EnvelopeDetail').innerHTML=
      '<div><span>'+sys.name.toUpperCase()+' / NEXT VERIFICATION</span><strong>'+esc(sys.verify)+'</strong><p>'+esc(lastEnvelope.site.evidence)+' pilot evidence · '+lastEnvelope.site.confidence+'% confidence · '+lastEnvelope.site.lead+' month modeled lead.</p></div>'+
      '<div><span>CURRENT COVERAGE</span><strong>'+Math.round(ratio*100)+'%</strong><p>'+(room>=0?room+'% modeled risk-adjusted buffer above the entered need.':Math.abs(room)+'% modeled shortfall against the entered need.')+'</p></div>'+
      '<div><span>DECISION EFFECT</span><strong>'+esc(status(ratio))+'</strong><p>Overall site call: '+esc(lastEnvelope.a.verdict)+' · defensible range '+lastEnvelope.a.low+'–'+lastEnvelope.a.high+'.</p></div>';
  }

  function breakAt(site,base){
    function stateAt(m){
      var r=Object.assign({},base);
      ['power','water','waste','gas'].forEach(function(k){r[k]=(Number(base[k])||0)*m});
      if(mode==='fast')r.timeline=Math.max(12,(Number(base.timeline)||24)-12);
      if(mode==='strict')r.risk='conservative';
      if(mode==='reserve')r.growth=(Number(base.growth)||0)+.15;
      return analyzeSite(site,r,false).vclass;
    }
    var low=.65,high=2.2;
    if(stateAt(low)==='hold')return low;
    if(stateAt(high)!=='hold')return high;
    for(var i=0;i<12;i++){
      var mid=(low+high)/2;
      if(stateAt(mid)==='hold')high=mid;else low=mid;
    }
    return low;
  }
  function findBreakpoint(){
    var base=current(),site=currentSite();if(!base||!site)return;
    multiplier=breakAt(site,base);
    renderEnvelope();
    byId('gg9LoadSlider').focus();
    try{toast(multiplier>=2.19?'No modeled hold before 2.2× core load.':'Breakpoint found at about '+multiplier.toFixed(2)+'× core load.')}catch(e){}
  }
  function bestFit(){
    var req=stressReq();if(!req)return;
    try{
      var order={go:3,conditional:2,hold:1};
      var ranked=sites.map(function(s){return analyzeSite(s,req,false)}).sort(function(a,b){
        return (order[b.vclass]-order[a.vclass])||(b.low-a.low)||(b.score-a.score);
      });
      if(ranked[0]){
        envelopeSiteId=ranked[0].s.id;
        byId('gg9EnvelopeSite').value=envelopeSiteId;
        renderEnvelope();
        toast(ranked[0].s.name+' leads this case.');
      }
    }catch(e){}
  }
  function applyEnvelope(){
    if(!lastEnvelope)return;
    var r=lastEnvelope.req;
    var values={
      siteSelect:lastEnvelope.site.id,
      powerReq:r.power,waterReq:r.water,wasteReq:r.waste,gasReq:r.gas,
      fiberReq:r.fiber,powerRedundancy:r.redundancy,timeline:r.timeline,risk:r.risk,
      growth:Math.round((r.growth||0)*100)
    };
    Object.keys(values).forEach(function(id){
      var el=byId(id);if(!el)return;
      el.value=String(values[id]);
      el.dispatchEvent(new Event('change',{bubbles:true}));
    });
    byId('screen')?.scrollIntoView({behavior:'smooth',block:'start'});
    window.setTimeout(function(){byId('analyseBtn')?.click()},220);
  }
  async function copyEnvelope(){
    if(!lastEnvelope)return;
    var a=lastEnvelope.a,site=lastEnvelope.site;
    var sys=SYSTEMS.find(function(s){return s.name===selectedSystem})||SYSTEMS[0];
    var row=rowFor(a,sys.name);
    var text=[
      'GAGE GRID / SERVICE ENVELOPE',
      'Site: '+site.name+' · '+site.county+', '+site.state,
      'Project: '+projectName(lastEnvelope.req),
      'Load multiplier: '+Math.round(multiplier*100)+'%',
      'Decision: '+a.verdict+' · '+a.low+'–'+a.high,
      'First constraint: '+a.worst.name+' · '+Math.round(a.worst.ratio*100)+'% coverage',
      '',
      'Focused system: '+sys.name,
      'Need: '+fmt(row.need,sys.name),
      'Risk-adjusted usable: '+fmt(row.usable,sys.name),
      'Coverage: '+Math.round(row.ratio*100)+'%',
      'Verify next: '+sys.verify,
      '',
      'Pilot capacity is simulated. Utility verification is still required.'
    ].join('\n');
    try{await navigator.clipboard.writeText(text);toast('Case summary copied.')}catch(e){toast('Copy unavailable.')}
  }


  var workflowStage=0;
  var breakSystem='Power';
  var breakTouched=false;
  var evidenceStage=0;

  function iconSvg(kind){
    var icons={
      load:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 36V15h30v21M14 15V9h20v6M16 24h16M16 30h10"/></svg>',
      match:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 12h11v11H8zM29 25h11v11H29zM19 17h10M24 17v8M13 29h10M23 29l6 2"/></svg>',
      discount:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 34h32M11 29l8-9 7 5 11-13M33 12h4v4M12 10v8M9 14h6"/></svg>',
      weak:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 36V18M19 36V11M28 36V23M37 36V15M7 36h34"/><path d="M25 20l3 3 3-3"/></svg>',
      order:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 11h27M12 24h22M12 37h17M7 11h1M7 24h1M7 37h1"/></svg>',
      signal:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M11 34a18 18 0 0 1 26-20M16 29a11 11 0 0 1 16-12M22 24a4 4 0 0 1 6-4"/><circle cx="25" cy="28" r="3"/></svg>',
      model:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 35h30M12 31V18M21 31V11M30 31V22M39 31V15"/></svg>',
      confirm:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 9h28v30H10zM16 17h16M16 24h12M16 31h9"/><path d="M29 30l3 3 7-8"/></svg>',
      proof:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 7l14 6v10c0 9-6 15-14 19-8-4-14-10-14-19V13z"/><path d="M17 24l5 5 10-11"/></svg>'
    };
    return icons[kind]||icons.load;
  }

  function explanatoryAnalysis(){
    var req=current(),site=null;
    try{site=sites.find(function(x){return x.id===byId('siteSelect').value})||sites[0]}catch(e){}
    if(!req||!site)return null;
    try{return {req:req,site:site,a:analyzeSite(site,req,false)}}catch(e){return null}
  }

  function installWorkflowInfographic(){
    if(byId('gg10Workflow'))return;
    var metrics=q('.mini-metrics');if(!metrics)return;
    var section=document.createElement('section');
    section.id='gg10Workflow';
    section.className='gg10-infographic';
    section.innerHTML=
      '<div class="gg10-info-head"><div><div class="kicker">HOW GAGE SCREENS A SITE</div><h2>Five moves from project load to diligence order.</h2><p>Use this as the map for the rest of the page. Click any stage to see what Gage is doing, then open the section that performs that job.</p></div><div class="gg10-info-badge"><span>READING TIME</span><strong>About 30 seconds</strong></div></div>'+
      '<div class="gg10-workflow-body"><div id="gg10WorkflowTrack" class="gg10-workflow-track"></div><aside class="gg10-workflow-output"><span id="gg10WorkflowLabel">STAGE 01</span><h3 id="gg10WorkflowTitle">Define the project load.</h3><p id="gg10WorkflowCopy">Start with the infrastructure the project actually requires.</p><div id="gg10WorkflowOutput" class="gg10-output-list"></div><button type="button" id="gg10WorkflowAction" class="gg10-workflow-action">OPEN THIS STAGE →</button></aside></div>';
    metrics.insertAdjacentElement('afterend',section);

    var stages=[
      {title:'Define project load',copy:'Enter peak power, water, wastewater, gas, fiber, redundancy, timing and growth.',icon:'load',target:'screen'},
      {title:'Match infrastructure',copy:'Compare one project against the selected pilot node across all five systems.',icon:'match',target:'gg9Envelope'},
      {title:'Discount uncertainty',copy:'Timing, evidence quality and risk posture reduce what Gage treats as usable.',icon:'discount',target:'method'},
      {title:'Find the weak link',copy:'The lowest risk-adjusted coverage becomes the first diligence priority.',icon:'weak',target:'gg10Breaks'},
      {title:'Order the diligence',copy:'Turn the weak link into the next verification question and evidence request.',icon:'order',target:'decision-gate'}
    ];
    byId('gg10WorkflowTrack').innerHTML=stages.map(function(stage,index){
      return '<button type="button" class="gg10-step '+(index===0?'active':'')+'" data-gg10-step="'+index+'">'+
        '<span class="gg10-step-num">0'+(index+1)+'</span><span class="gg10-step-icon">'+iconSvg(stage.icon)+'</span><strong class="gg10-step-title">'+stage.title+'</strong><span class="gg10-step-copy">'+stage.copy+'</span></button>';
    }).join('');
    qa('[data-gg10-step]',section).forEach(function(btn){
      btn.addEventListener('click',function(){
        workflowStage=Number(btn.getAttribute('data-gg10-step'))||0;
        renderWorkflowInfographic();
      });
    });
    byId('gg10WorkflowAction').addEventListener('click',function(){
      var target=stages[workflowStage]&&stages[workflowStage].target;
      var el=byId(target);
      if(!el&&target==='decision-gate')el=q('.ggx-gate');
      el?.scrollIntoView({behavior:'smooth',block:'start'});
    });
    section._ggStages=stages;
    renderWorkflowInfographic();
  }

  function renderWorkflowInfographic(){
    var section=byId('gg10Workflow');if(!section)return;
    var stages=section._ggStages||[];
    qa('[data-gg10-step]',section).forEach(function(btn,index){btn.classList.toggle('active',index===workflowStage)});
    var stage=stages[workflowStage]||stages[0];
    byId('gg10WorkflowLabel').textContent='STAGE 0'+(workflowStage+1);
    byId('gg10WorkflowTitle').textContent=stage?stage.title+'.':'How Gage works.';
    byId('gg10WorkflowCopy').textContent=stage?stage.copy:'';
    var x=explanatoryAnalysis();
    if(!x){byId('gg10WorkflowOutput').innerHTML='';return}
    var sys=SYSTEMS.find(function(item){return item.name===x.a.worst.name})||SYSTEMS[0];
    byId('gg10WorkflowOutput').innerHTML=
      '<div><b>01</b><span>'+esc(projectName(x.req))+'</span></div>'+
      '<div><b>02</b><span>'+esc(x.a.verdict)+' · range '+x.a.low+'–'+x.a.high+'</span></div>'+
      '<div><b>03</b><span>Weak link: '+esc(x.a.worst.name)+' · '+Math.round(x.a.worst.ratio*100)+'%</span></div>'+
      '<div><b>04</b><span>'+esc(sys.verify)+'</span></div>';
  }

  function installBreakInfographic(){
    if(byId('gg10Breaks'))return;
    var screen=byId('screen');if(!screen)return;
    var section=document.createElement('section');
    section.id='gg10Breaks';
    section.className='gg10-infographic';
    section.innerHTML=
      '<div class="gg10-info-head"><div><div class="kicker">WHAT BREAKS FIRST?</div><h2>One weak dependency changes the order of everything.</h2><p>This is the current case translated into one picture. The black line is project need. The column is risk-adjusted usable capacity. Click a system to inspect it.</p></div><div class="gg10-info-badge"><span>LIVE CASE</span><strong id="gg10BreakCase">—</strong></div></div>'+
      '<div class="gg10-break-body"><div id="gg10BreakGauges" class="gg10-break-gauges"></div><aside class="gg10-break-aside"><span id="gg10BreakLabel">VERIFY FIRST</span><h3 id="gg10BreakTitle">—</h3><p id="gg10BreakCopy">—</p><div id="gg10BreakStats" class="gg10-break-stats"></div><button type="button" id="gg10BreakAction" class="gg10-break-action">FOCUS IN SERVICE ENVELOPE →</button></aside></div>';
    screen.insertAdjacentElement('afterend',section);
    byId('gg10BreakAction').addEventListener('click',function(){
      selectedSystem=breakSystem;
      renderEnvelope();
      byId('gg9Envelope')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
    renderBreakInfographic();
  }

  function breakContext(){
    if(lastEnvelope&&lastEnvelope.a&&lastEnvelope.site)return lastEnvelope;
    return explanatoryAnalysis();
  }

  function renderBreakInfographic(){
    var section=byId('gg10Breaks');if(!section)return;
    var x=breakContext();if(!x)return;
    var rows=SYSTEMS.map(function(sys){
      var row=rowFor(x.a,sys.name);
      return {sys:sys,row:row,ratio:row?Number(row.ratio):0};
    });
    var weakest=rows.slice().sort(function(a,b){return a.ratio-b.ratio})[0];
    if(!breakTouched&&weakest)breakSystem=weakest.sys.name;
    var chosen=rows.find(function(item){return item.sys.name===breakSystem})||weakest||rows[0];
    byId('gg10BreakCase').textContent=x.site.name+' · '+Math.round(multiplier*100)+'% load';

    byId('gg10BreakGauges').innerHTML=rows.map(function(item){
      var height=Math.max(8,Math.min(100,item.ratio*48));
      var cls=tone(item.ratio);
      var isWeak=weakest&&item.sys.name===weakest.sys.name;
      return '<button type="button" class="gg10-break-card '+cls+(isWeak?' weakest':'')+(item.sys.name===breakSystem?' active':'')+'" data-gg10-break="'+item.sys.name+'">'+
        '<span class="gg10-break-label">'+item.sys.name.toUpperCase()+'</span><strong class="gg10-break-need">'+esc(item.row?fmt(item.row.need,item.sys.name):'—')+'</strong>'+
        '<div class="gg10-column-wrap"><i class="gg10-column-fill" style="--h:'+height+'%"></i><i class="gg10-column-need"></i></div>'+
        '<div class="gg10-break-meta"><span>RISK-ADJUSTED USABLE</span><strong>'+esc(item.row?fmt(item.row.usable,item.sys.name):'—')+'</strong><span>'+status(item.ratio)+' · '+Math.round(item.ratio*100)+'%</span></div>'+
        '</button>';
    }).join('');
    qa('[data-gg10-break]',section).forEach(function(btn){
      btn.addEventListener('click',function(){
        breakTouched=true;
        breakSystem=btn.getAttribute('data-gg10-break');
        renderBreakInfographic();
      });
    });
    var ratio=chosen.ratio,room=Math.round((ratio-1)*100);
    byId('gg10BreakLabel').textContent=weakest&&chosen.sys.name===weakest.sys.name?'VERIFY FIRST':'SYSTEM FOCUS';
    byId('gg10BreakTitle').textContent=chosen.sys.name;
    byId('gg10BreakCopy').textContent=chosen.sys.verify;
    byId('gg10BreakStats').innerHTML=
      '<div><span>NEED</span><strong>'+esc(chosen.row?fmt(chosen.row.need,chosen.sys.name):'—')+'</strong></div>'+
      '<div><span>USABLE</span><strong>'+esc(chosen.row?fmt(chosen.row.usable,chosen.sys.name):'—')+'</strong></div>'+
      '<div><span>COVERAGE</span><strong>'+Math.round(ratio*100)+'%</strong></div>'+
      '<div><span>BUFFER / GAP</span><strong>'+(room>=0?'+'+room+'%':room+'%')+'</strong></div>';
  }

  function installEvidenceInfographic(){
    if(byId('gg10Evidence'))return;
    var registry=byId('registry');if(!registry)return;
    var section=document.createElement('section');
    section.id='gg10Evidence';
    section.className='gg10-infographic';
    section.innerHTML=
      '<div class="gg10-info-head"><div><div class="kicker">FROM SIGNAL TO PROOF</div><h2>Gage separates what is known from what still needs a signature.</h2><p>The pilot deliberately keeps public context, modeled capacity and utility confirmation in different buckets. Click a rung to see what it means and where to inspect it.</p></div><div class="gg10-info-badge"><span>PROOF STANDARD</span><strong>Unknown stays unknown</strong></div></div>'+
      '<div class="gg10-evidence-body"><div id="gg10Ladder" class="gg10-ladder"></div><aside class="gg10-evidence-aside"><span id="gg10EvidenceLabel">STAGE 01</span><h3 id="gg10EvidenceTitle">Public signal.</h3><p id="gg10EvidenceCopy">—</p><div id="gg10EvidenceFacts" class="gg10-evidence-facts"></div><button type="button" id="gg10EvidenceLink" class="gg10-evidence-link">OPEN RELATED SECTION →</button></aside></div>';
    registry.insertAdjacentElement('beforebegin',section);

    var steps=[
      {title:'Public signal',icon:'signal',state:'CONTEXT ONLY',copy:'Public records and observed context can show what exists nearby or what changed. They do not prove parcel serviceability.',target:'registry'},
      {title:'Modeled capacity',icon:'model',state:'SIMULATED PILOT',copy:'Gage converts the pilot records, confidence, timing and project assumptions into a consistent screening model.',target:'screen'},
      {title:'Utility confirmation',icon:'confirm',state:'REQUIRED',copy:'Firm service, delivery timing, pressure, voltage, treatment headroom and upgrade scope require written confirmation from the responsible provider.',target:'decision-gate'},
      {title:'Decision-ready proof',icon:'proof',state:'NOT CLAIMED',copy:'A site becomes decision-ready only when the critical assumptions are closed with evidence. The pilot does not pretend that step has happened.',target:'method'}
    ];
    byId('gg10Ladder').innerHTML=steps.map(function(step,index){
      return '<button type="button" class="gg10-ladder-step '+(index===0?'active':'')+'" data-gg10-evidence="'+index+'">'+
        '<span class="gg10-ladder-num">0'+(index+1)+'</span><span class="gg10-ladder-icon">'+iconSvg(step.icon)+'</span><h3>'+step.title+'</h3><p>'+step.copy+'</p><span class="gg10-ladder-state">'+step.state+'</span></button>';
    }).join('');
    qa('[data-gg10-evidence]',section).forEach(function(btn){
      btn.addEventListener('click',function(){
        evidenceStage=Number(btn.getAttribute('data-gg10-evidence'))||0;
        renderEvidenceInfographic();
      });
    });
    byId('gg10EvidenceLink').addEventListener('click',function(){
      var step=steps[evidenceStage]||steps[0];
      var target=byId(step.target);
      if(!target&&step.target==='decision-gate')target=q('.ggx-gate');
      target?.scrollIntoView({behavior:'smooth',block:'start'});
    });
    section._ggEvidenceSteps=steps;
    renderEvidenceInfographic();
  }

  function evidenceOwner(system){
    return {Power:'Electric utility',Water:'Water authority',Wastewater:'POTW / municipality',Gas:'Gas utility',Fiber:'Carrier / site network'}[system]||'Relevant provider';
  }

  function renderEvidenceInfographic(){
    var section=byId('gg10Evidence');if(!section)return;
    var steps=section._ggEvidenceSteps||[];
    qa('[data-gg10-evidence]',section).forEach(function(btn,index){btn.classList.toggle('active',index===evidenceStage)});
    var step=steps[evidenceStage]||steps[0];
    byId('gg10EvidenceLabel').textContent='STAGE 0'+(evidenceStage+1)+' / '+step.state;
    byId('gg10EvidenceTitle').textContent=step.title+'.';
    byId('gg10EvidenceCopy').textContent=step.copy;
    var x=explanatoryAnalysis();if(!x)return;
    byId('gg10EvidenceFacts').innerHTML=
      '<div><span>CURRENT SITE EVIDENCE</span><strong>'+esc(x.site.evidence)+' · '+x.site.confidence+'% confidence</strong></div>'+
      '<div><span>MODELED TIMING</span><strong>'+x.site.lead+' mo lead vs '+x.req.timeline+' mo target</strong></div>'+
      '<div><span>GAP TO CLOSE FIRST</span><strong>'+esc(x.a.worst.name)+' · '+Math.round(x.a.worst.ratio*100)+'% coverage</strong></div>'+
      '<div><span>NEXT CALL</span><strong>'+esc(evidenceOwner(x.a.worst.name))+'</strong></div>';
  }

  function renderInfographics(){
    renderWorkflowInfographic();
    renderBreakInfographic();
    renderEvidenceInfographic();
  }

  function bindCoreSync(){
    ['projectType','siteSelect','powerReq','waterReq','wasteReq','gasReq','fiberReq','powerRedundancy','timeline','risk','growth'].forEach(function(id){
      var el=byId(id);if(!el)return;
      el.addEventListener('change',function(){
        if(id==='siteSelect'&&byId('gg9EnvelopeSite')){
          envelopeSiteId=el.value;
          byId('gg9EnvelopeSite').value=envelopeSiteId;
        }
        renderHero();
        renderEnvelope();
        renderWorkflowInfographic();
        renderBreakInfographic();
        renderEvidenceInfographic();
      });
    });
    byId('analyseBtn')?.addEventListener('click',function(){
      window.setTimeout(function(){renderHero();renderEnvelope();renderInfographics()},20);
    });
    byId('loadDemoBtn')?.addEventListener('click',function(){
      window.setTimeout(function(){
        envelopeSiteId=byId('siteSelect').value;
        if(byId('gg9EnvelopeSite'))byId('gg9EnvelopeSite').value=envelopeSiteId;
        multiplier=1;mode='base';renderHero();renderEnvelope();renderInfographics();
      },50);
    });
  }

  function draftPersistence(){
    var ids=['projectType','siteSelect','powerReq','waterReq','wasteReq','gasReq','fiberReq','timeline','powerRedundancy','risk','growth','capitalExposure'];
    try{
      var saved=JSON.parse(localStorage.getItem('gage-grid-clean-draft-v1')||'null');
      if(saved&&saved.values&&Date.now()-saved.savedAt<1000*60*60*24*14){
        ids.forEach(function(id){
          var el=byId(id);if(el&&saved.values[id]!=null&&saved.values[id]!=='')el.value=saved.values[id];
        });
      }
    }catch(e){}
    function save(){
      var values={};
      ids.forEach(function(id){var el=byId(id);values[id]=el?el.value:''});
      try{localStorage.setItem('gage-grid-clean-draft-v1',JSON.stringify({savedAt:Date.now(),values:values}))}catch(e){}
    }
    ids.forEach(function(id){var el=byId(id);if(el){el.addEventListener('change',save);el.addEventListener('input',save)}});
  }

  function boot(){
    document.body.classList.add('gg-clean-runtime');
    heroSheet();
    installWorkflowInfographic();
    installEnvelope();
    installBreakInfographic();
    installEvidenceInfographic();
    bindCoreSync();
    draftPersistence();
    renderHero();
    renderEnvelope();
    renderInfographics();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();