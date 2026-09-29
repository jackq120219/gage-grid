'use strict';
(function(){
  var q=function(s,r){return (r||document).querySelector(s)};
  var qa=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var byId=function(id){return document.getElementById(id)};
  var LAB_ID='gg8LiveGrid';
  var selectedSystem='Power';
  var siteId='';
  var multiplier=1;
  var mode='base';
  var lastState=null;

  var SYSTEMS=[
    {name:'Power',key:'power',unit:'MW',x:400,y:105,verify:'Ask the electric utility for firm deliverable MW by the target date, service voltage, feed/substation path, upgrade scope and schedule owner.'},
    {name:'Water',key:'water',unit:'MGD',x:660,y:255,verify:'Confirm firm daily and peak-day service, pressure/flow basis, storage needs and any extension work required to reach the parcel.'},
    {name:'Wastewater',key:'waste',unit:'MGD',x:585,y:500,verify:'Confirm permitted hydraulic and treatment headroom, pretreatment limits and collection-system constraints for the project discharge profile.'},
    {name:'Gas',key:'gas',unit:'MMBtu/h',x:215,y:500,verify:'Confirm firm hourly capacity, delivery pressure, regulator/main extension scope and any upstream reinforcement schedule.'},
    {name:'Fiber',key:'fiber',unit:'routes',x:140,y:255,verify:'Confirm physically diverse routes and carriers. Multiple providers sharing the same conduit or pole line do not create real route diversity.'}
  ];

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }
  function fmt(v,name){
    var n=Number(v)||0;
    if(name==='Power')return n.toFixed(n<10?1:0)+' MW';
    if(name==='Water'||name==='Wastewater')return n.toFixed(2)+' MGD';
    if(name==='Gas')return Math.round(n).toLocaleString()+' MMBtu/h';
    if(name==='Fiber')return Math.round(n)+' routes';
    return String(n);
  }
  function baseReq(){
    try{return currentReq()}catch(e){return null}
  }
  function baseSite(){
    try{
      var sel=byId('siteSelect');
      return sites.find(function(s){return s.id===(siteId||sel&&sel.value)})||sites[0];
    }catch(e){return null}
  }
  function projectLabel(req){
    try{return projectPresets[req.projectType]&&projectPresets[req.projectType].label||'Custom industrial load'}catch(e){return'Industrial project'}
  }
  function scenarioReq(){
    var r=baseReq();if(!r)return null;
    var next=Object.assign({},r);
    var m=multiplier;
    ['power','water','waste','gas'].forEach(function(key){next[key]=(Number(r[key])||0)*m});
    if(mode==='fast')next.timeline=Math.max(12,(Number(next.timeline)||24)-12);
    if(mode==='strict')next.risk='conservative';
    if(mode==='growth')next.growth=(Number(next.growth)||0)+.15;
    return next;
  }
  function rowFor(a,name){
    return a&&a.rows?a.rows.find(function(r){return r.name===name}):null;
  }
  function tone(ratio){
    if(!Number.isFinite(ratio))return'neutral';
    if(ratio<1)return'bad';
    if(ratio<1.2)return'warn';
    return'good';
  }
  function status(ratio){
    if(!Number.isFinite(ratio))return'—';
    if(ratio<1)return'SHORTFALL';
    if(ratio<1.2)return'TIGHT';
    return'PASS';
  }
  function pathFor(x,y){
    var cx=400,cy=320;
    var midX=(cx+x)/2,midY=(cy+y)/2;
    var bendX=midX+(y<cy?18:-18);
    var bendY=midY+(x<cx?-10:10);
    return 'M '+cx+' '+cy+' Q '+bendX+' '+bendY+' '+x+' '+y;
  }
  function nodeMarkup(sys,row){
    var ratio=row?Number(row.ratio):NaN;
    var cls=tone(ratio);
    var usable=row?fmt(row.usable,sys.name):'—';
    var cov=Number.isFinite(ratio)?Math.round(ratio*100)+'%':'—';
    return '<g class="gg8-node '+cls+(selectedSystem===sys.name?' active':'')+'" data-gg8-system="'+sys.name+'" transform="translate('+(sys.x-68)+' '+(sys.y-35)+')">'+
      '<rect class="gg8-node-shell" width="136" height="70" rx="3"></rect>'+
      '<text class="gg8-node-label" x="12" y="18">'+sys.name.toUpperCase()+'</text>'+
      '<text class="gg8-node-value" x="12" y="38">'+esc(usable)+'</text>'+
      '<text class="gg8-node-status" x="12" y="56">'+status(ratio)+' · '+cov+'</text>'+
      '</g>';
  }
  function wireMarkup(sys,row,index){
    var ratio=row?Number(row.ratio):NaN;
    var cls=tone(ratio);
    var d=pathFor(sys.x,sys.y);
    return '<path class="gg8-wire-base" d="'+d+'"></path>'+
      '<path class="gg8-wire-signal '+cls+'" d="'+d+'"></path>'+
      '<circle class="gg8-flow-dot" r="4"><animateMotion dur="'+(2.5+index*.25)+'s" repeatCount="indefinite" path="'+d+'"></animateMotion></circle>';
  }
  function renderSvg(a,req,site){
    var svg=byId('gg8Svg');if(!svg)return;
    var wires=SYSTEMS.map(function(sys,index){return wireMarkup(sys,rowFor(a,sys.name),index)}).join('');
    var nodes=SYSTEMS.map(function(sys){return nodeMarkup(sys,rowFor(a,sys.name))}).join('');
    var verdict=a?a.verdict:'—';
    var score=a?a.score:'—';
    svg.innerHTML=
      '<g>'+wires+'</g>'+
      '<circle class="gg8-core-ring outer" cx="400" cy="320" r="88"></circle>'+
      '<circle class="gg8-core-ring" cx="400" cy="320" r="69"></circle>'+
      '<text class="gg8-core-title" text-anchor="middle" x="400" y="294">PROJECT LOAD</text>'+
      '<text class="gg8-core-value" text-anchor="middle" x="400" y="327">'+Math.round(multiplier*100)+'%</text>'+
      '<text class="gg8-core-sub" text-anchor="middle" x="400" y="350">'+esc(String(score))+' / '+esc(verdict)+'</text>'+
      nodes;
    qa('[data-gg8-system]',svg).forEach(function(node){
      node.addEventListener('click',function(){
        selectedSystem=node.getAttribute('data-gg8-system');
        render();
      });
    });
  }
  function stressName(){
    return {base:'Base assumptions',fast:'Faster online window',strict:'Conservative evidence',growth:'+15% growth reserve'}[mode]||'Base assumptions';
  }
  function renderDetail(a,site){
    var sys=SYSTEMS.find(function(s){return s.name===selectedSystem})||SYSTEMS[0];
    var row=rowFor(a,sys.name);
    var ratio=row?Number(row.ratio):NaN;
    var coverage=Number.isFinite(ratio)?Math.round(ratio*100)+'%':'—';
    byId('gg8Detail').innerHTML=
      '<div class="gg8-detail-top"><span>'+esc(sys.name.toUpperCase())+' / LIVE SYSTEM</span><b>'+esc(status(ratio))+'</b></div>'+
      '<h3>'+esc(site.name)+'</h3>'+
      '<p>'+esc(site.note||'Pilot infrastructure node.')+'</p>'+
      '<div class="gg8-detail-grid">'+
        '<div><span>PROJECT NEED</span><strong>'+esc(row?fmt(row.need,sys.name):'—')+'</strong></div>'+
        '<div><span>RISK-ADJUSTED USABLE</span><strong>'+esc(row?fmt(row.usable,sys.name):'—')+'</strong></div>'+
        '<div><span>COVERAGE</span><strong>'+coverage+'</strong></div>'+
        '<div><span>EVIDENCE</span><strong>'+esc(site.evidence)+' · '+site.confidence+'%</strong></div>'+
      '</div>'+
      '<div class="gg8-verify"><span>WHAT TO VERIFY NEXT</span><p>'+esc(sys.verify)+'</p></div>';
  }
  function breakMultiplier(site,r){
    var low=.6,high=2.4;
    var base=Object.assign({},r);
    function verdictAt(m){
      var x=Object.assign({},base);
      ['power','water','waste','gas'].forEach(function(k){x[k]=(Number(base[k])||0)*m});
      if(mode==='fast')x.timeline=Math.max(12,(Number(x.timeline)||24)-12);
      if(mode==='strict')x.risk='conservative';
      if(mode==='growth')x.growth=(Number(x.growth)||0)+.15;
      return analyzeSite(site,x,false).vclass;
    }
    if(verdictAt(low)==='hold')return low;
    if(verdictAt(high)!=='hold')return high;
    for(var i=0;i<13;i++){
      var mid=(low+high)/2;
      if(verdictAt(mid)==='hold')high=mid;else low=mid;
    }
    return low;
  }
  function render(){
    var req=scenarioReq(),site=baseSite();if(!req||!site)return;
    var a=analyzeSite(site,req,false);
    lastState={req:req,site:site,a:a};

    byId('gg8SiteName').textContent=site.name;
    byId('gg8SiteMeta').textContent=site.county+' · '+site.state+' · '+site.evidence+' evidence · '+site.lead+' mo modeled lead';
    byId('gg8LoadPct').textContent=Math.round(multiplier*100)+'%';
    byId('gg8Slider').value=String(Math.round(multiplier*100));
    byId('gg8Verdict').textContent=a.verdict;
    byId('gg8Score').textContent=a.low+'–'+a.high;
    byId('gg8Bottleneck').textContent=a.worst.name+' · '+Math.round(a.worst.ratio*100)+'%';
    byId('gg8ModeLabel').textContent=stressName();\n    byId('gg8ModeLabel2').textContent=stressName();\n    var lab=byId(LAB_ID);if(lab)lab.setAttribute('data-state',a.vclass);
    byId('gg8ProjectLabel').textContent=projectLabel(req);

    renderSvg(a,req,site);
    renderDetail(a,site);

    qa('[data-gg8-mode]').forEach(function(btn){
      btn.setAttribute('aria-pressed',String(btn.getAttribute('data-gg8-mode')===mode));
    });
  }
  function applyCase(){
    if(!lastState)return;
    var req=lastState.req;
    var values={
      siteSelect:lastState.site.id,
      powerReq:req.power,
      waterReq:req.water,
      wasteReq:req.waste,
      gasReq:req.gas,
      fiberReq:req.fiber,
      powerRedundancy:req.redundancy,
      timeline:req.timeline,
      risk:req.risk,
      growth:Math.round((req.growth||0)*100)
    };
    Object.keys(values).forEach(function(id){
      var el=byId(id);if(!el)return;
      el.value=String(values[id]);
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
    });
    byId('screen')?.scrollIntoView({behavior:'smooth',block:'start'});
    window.setTimeout(function(){byId('analyseBtn')?.click()},300);
  }
  function selectBest(){
    var req=scenarioReq();if(!req)return;
    try{
      var ranked=sites.map(function(s){return analyzeSite(s,req,false)}).sort(function(a,b){
        var w={go:3,conditional:2,hold:1};
        return (w[b.vclass]-w[a.vclass])||(b.low-a.low)||(b.score-a.score);
      });
      if(ranked[0])siteId=ranked[0].s.id;
      byId('gg8SiteSelect').value=siteId;
      render();
    }catch(e){}
  }
  function pushToBreak(){
    var base=baseReq(),site=baseSite();if(!base||!site)return;
    var limit=breakMultiplier(site,base);
    multiplier=Math.min(2.4,Math.max(.6,limit));
    var lab=byId(LAB_ID);
    lab.classList.remove('gg8-shock');
    void lab.offsetWidth;
    lab.classList.add('gg8-shock');
    render();
    var msg=limit>=2.39?'No modeled hold before 2.4× the current core load.':'Moved to the modeled hold frontier at about '+limit.toFixed(2)+'×.';
    try{window.GGX&&window.GGX.toast?window.GGX.toast(msg):null}catch(e){}
  }
  function reset(){
    multiplier=1;mode='base';selectedSystem='Power';
    try{siteId=byId('siteSelect')&&byId('siteSelect').value||sites[0].id}catch(e){}
    if(byId('gg8SiteSelect'))byId('gg8SiteSelect').value=siteId;
    render();
  }
  function build(){
    if(byId(LAB_ID))return;
    var metrics=q('.mini-metrics');if(!metrics)return;
    var section=document.createElement('section');
    section.id=LAB_ID;
    section.className='gg8-lab shell';
    section.innerHTML=
      '<div class="gg8-lab-head"><div><div class="gg8-lab-kicker">LIVE INFRASTRUCTURE LAB / PUSH THE PROJECT</div><h2>Touch the load. Watch the site react.</h2><p>This is a working model view, not decoration. Push the project harder, switch sites, change the evidence lens, or click a utility node. Every wire and status is driven by the same feasibility logic used in the live screen.</p></div><div class="gg8-live-chip"><i></i>INTERACTIVE MODEL</div></div>'+
      '<div class="gg8-lab-body">'+
        '<div class="gg8-network-panel">'+
          '<div class="gg8-network-toolbar"><div>'+
            '<button type="button" data-gg8-mode="base" aria-pressed="true">BASE</button>'+
            '<button type="button" data-gg8-mode="fast">FAST TRACK</button>'+
            '<button type="button" data-gg8-mode="strict">STRICT EVIDENCE</button>'+
            '<button type="button" data-gg8-mode="growth">+15% RESERVE</button>'+
          '</div><span class="gg8-site-id" id="gg8ModeLabel">Base assumptions</span></div>'+
          '<svg id="gg8Svg" class="gg8-svg" viewBox="0 0 800 640" role="img" aria-label="Interactive project utility network"></svg>'+
          '<div class="gg8-network-caption"><b>CLICK ANY UTILITY NODE</b>The wires show the current system state. Green has modeled room, amber is tight, orange is short. Animated signal flow is decorative; the status itself comes from the feasibility model.</div>'+
        '</div>'+
        '<aside class="gg8-control-panel">'+
          '<div class="gg8-control-head"><span>CURRENT CASE</span><strong id="gg8SiteName">—</strong><small id="gg8SiteMeta">—</small></div>'+
          '<div class="gg8-site-picker"><select id="gg8SiteSelect" aria-label="Pilot site"></select><button id="gg8BestSite" type="button">BEST FIT</button></div>'+
          '<div class="gg8-stress">'+
            '<div class="gg8-stress-top"><div><span>PUSH CORE PROJECT LOAD</span><small id="gg8ProjectLabel">—</small></div><strong id="gg8LoadPct">100%</strong></div>'+
            '<div class="gg8-slider-wrap"><input id="gg8Slider" class="gg8-slider" type="range" min="60" max="240" step="1" value="100"><div class="gg8-scale"><span>60%</span><span>100%</span><span>140%</span><span>180%</span><span>240%</span></div></div>'+
            '<div class="gg8-stress-actions"><button type="button" class="primary" id="gg8Break">PUSH TO BREAKPOINT</button><button type="button" id="gg8Reset">RESET CASE</button></div>'+
          '</div>'+
          '<div class="gg8-outcome"><div><span>DECISION</span><strong id="gg8Verdict">—</strong></div><div><span>DEFENSIBLE RANGE</span><strong id="gg8Score">—</strong></div><div><span>FIRST BOTTLENECK</span><strong id="gg8Bottleneck">—</strong></div><div><span>STRESS LENS</span><strong id="gg8ModeLabel2">LIVE</strong></div></div>'+
          '<div class="gg8-detail" id="gg8Detail"></div>'+
          '<div class="gg8-footer-actions"><button type="button" class="primary" id="gg8Apply">USE THIS CASE IN LIVE SCREEN</button><button type="button" id="gg8Evidence">OPEN EVIDENCE RECORDS</button></div>'+
        '</aside>'+
      '</div>';
    metrics.insertAdjacentElement('afterend',section);

    var select=byId('gg8SiteSelect');
    try{
      select.innerHTML=sites.map(function(s){return '<option value="'+s.id+'">'+esc(s.name)+' · '+s.state+'</option>'}).join('');
      siteId=byId('siteSelect')&&byId('siteSelect').value||sites[0].id;
      select.value=siteId;
    }catch(e){}

    qa('[data-gg8-mode]',section).forEach(function(btn){
      btn.addEventListener('click',function(){
        mode=btn.getAttribute('data-gg8-mode')||'base';
        render();
      });
    });
    select.addEventListener('change',function(){siteId=select.value;render()});
    byId('gg8BestSite').addEventListener('click',selectBest);
    byId('gg8Slider').addEventListener('input',function(){multiplier=(Number(this.value)||100)/100;render()});
    byId('gg8Break').addEventListener('click',pushToBreak);
    byId('gg8Reset').addEventListener('click',reset);
    byId('gg8Apply').addEventListener('click',applyCase);
    byId('gg8Evidence').addEventListener('click',function(){byId('registry')?.scrollIntoView({behavior:'smooth',block:'start'})});

    ['projectType','powerReq','waterReq','wasteReq','gasReq','fiberReq','powerRedundancy','timeline','risk','growth','siteSelect'].forEach(function(id){
      var el=byId(id);if(!el)return;
      el.addEventListener('change',function(){
        if(id==='siteSelect'){siteId=el.value;if(select)select.value=siteId}
        render();
      });
    });

    render();
  }
  function keepCssLast(){
    var link=q('link[href="/gage-live-grid-v8.css"]');if(!link)return;
    window.setTimeout(function(){document.head.appendChild(link)},1200);
    window.setTimeout(function(){document.head.appendChild(link)},4200);
    window.setTimeout(function(){document.head.appendChild(link)},7600);
  }
  function boot(){
    document.body.classList.add('gg-v8');
    keepCssLast();
    build();
    var tries=0;
    var timer=window.setInterval(function(){
      tries++;
      if(!byId(LAB_ID))build();
      if(byId(LAB_ID)){window.clearInterval(timer);render()}
      if(tries>35)window.clearInterval(timer);
    },180);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();