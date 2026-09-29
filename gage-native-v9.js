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
    metrics.insertAdjacentElement('afterend',section);

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
      });
    });
    byId('analyseBtn')?.addEventListener('click',function(){
      window.setTimeout(function(){renderHero();renderEnvelope()},20);
    });
    byId('loadDemoBtn')?.addEventListener('click',function(){
      window.setTimeout(function(){
        envelopeSiteId=byId('siteSelect').value;
        if(byId('gg9EnvelopeSite'))byId('gg9EnvelopeSite').value=envelopeSiteId;
        multiplier=1;mode='base';renderHero();renderEnvelope();
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
    installEnvelope();
    bindCoreSync();
    draftPersistence();
    renderHero();
    renderEnvelope();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();