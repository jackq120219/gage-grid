'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  const SYSTEMS=[
    {name:'Power',key:'power',unit:'MW',verify:'Firm deliverable MW, service voltage, substation/feed path, upgrade scope and schedule owner.'},
    {name:'Water',key:'water',unit:'MGD',verify:'Firm daily and peak-day service, pressure/flow basis, storage and extension work.'},
    {name:'Wastewater',key:'waste',unit:'MGD',verify:'Permitted hydraulic/treatment headroom, pretreatment limits and collection-system constraints.'},
    {name:'Gas',key:'gas',unit:'MMBtu/h',verify:'Firm hourly capacity, delivery pressure, regulator/main extension and reinforcement schedule.'},
    {name:'Fiber',key:'fiber',unit:'routes',verify:'Physically diverse routes, carriers, entrance paths, meet points and construction interval.'}
  ];
  const fmt=(n,key)=>{
    const v=Number(n)||0;
    if(key==='power')return v.toFixed(v<10?1:0);
    if(key==='water'||key==='waste')return v.toFixed(2);
    if(key==='gas')return Math.round(v).toLocaleString();
    if(key==='fiber')return String(Math.round(v));
    return String(v);
  };
  const rowFor=(a,name)=>a&&a.rows?a.rows.find(r=>r.name===name):null;
  function currentSite(){
    try{const select=document.getElementById('siteSelect');return sites.find(s=>s.id===select?.value)||null}catch(_e){return null}
  }
  function stateFor(ratio){
    if(!Number.isFinite(ratio))return['UNSCREENED','neutral'];
    if(ratio<1)return['CONSTRAINT','bad'];
    if(ratio<1.15)return['THIN MARGIN','warn'];
    return['PASS','good'];
  }
  function boardMarkup(a){
    const r=G.current(),site=a&&a.s?a.s:currentSite();
    const title=site?site.name:'Select a pilot site';
    const sub=a?(a.verdict+' · '+a.low+'–'+a.high+' defensible range'):'Run the screen to calculate risk-adjusted coverage.';
    const rows=SYSTEMS.map(sys=>{
      const reqVal=r&&r[sys.key]!=null?r[sys.key]:0;
      const capVal=site&&site[sys.key]!=null?site[sys.key]:null;
      const analysisRow=a?rowFor(a,sys.name):null;
      const ratio=analysisRow?Number(analysisRow.ratio):NaN;
      const state=stateFor(ratio),status=state[0],tone=state[1];
      const coverage=Number.isFinite(ratio)?Math.max(0,Math.round(ratio*100)):null;
      const evidence=site?(site.evidence+' · '+site.confidence+'%'):'No site selected';
      return '<button type="button" class="gg-overlay-row '+tone+'" data-gg-overlay="'+sys.name+'">'+
        '<div class="gg-overlay-system"><span>'+sys.name.toUpperCase()+'</span><strong>'+fmt(reqVal,sys.key)+' '+sys.unit+'</strong></div>'+
        '<div><span>PILOT CAPACITY</span><strong>'+(capVal==null?'—':fmt(capVal,sys.key)+' '+sys.unit)+'</strong></div>'+
        '<div><span>COVERAGE</span><strong>'+(coverage==null?'—':coverage+'%')+'</strong></div>'+
        '<div><span>EVIDENCE</span><strong>'+evidence+'</strong></div>'+
        '<div><span>LEAD</span><strong>'+(site?site.lead+' mo':'—')+'</strong></div>'+
        '<div class="gg-overlay-status"><b>'+status+'</b><i>›</i></div></button>';
    }).join('');
    return '<div class="gg-overlay-head"><div><span>PROJECT OVERLAY / SITE SERVICEABILITY</span><h3>'+G.esc(title)+'</h3><p>'+G.esc(sub)+'</p></div><small>'+(site?G.esc(site.id):'PILOT NODE')+'</small></div>'+
      '<div class="gg-overlay-cols"><span>SYSTEM / REQUIRED</span><span>PILOT CAPACITY</span><span>COVERAGE</span><span>EVIDENCE</span><span>LEAD</span><span>STATUS</span></div>'+
      '<div class="gg-overlay-rows">'+rows+'</div>'+
      '<div id="ggOverlayDetail" class="gg-overlay-detail"><span>SELECT A SYSTEM</span><p>Open a row to see the exact question that should be verified before the project relies on that utility.</p></div>'+
      '<div class="gg-overlay-foot"><span><i class="sim"></i>SIMULATED CAPACITY</span><span><i class="context"></i>PUBLIC CONTEXT SEPARATE</span><b>UTILITY WRITING STILL REQUIRED</b></div>';
  }
  function bindRows(host){
    host.querySelectorAll('[data-gg-overlay]').forEach(btn=>btn.addEventListener('click',()=>{
      const name=btn.dataset.ggOverlay,sys=SYSTEMS.find(x=>x.name===name),a=G.analysis(),row=a?rowFor(a,name):null,detail=document.getElementById('ggOverlayDetail');
      if(!detail||!sys)return;
      const coverage=row?(Math.round(row.ratio*100)+'% risk-adjusted coverage'):'Run the screen to calculate coverage.';
      detail.innerHTML='<span>'+G.esc(name.toUpperCase())+' / WHAT TO VERIFY NEXT</span><p>'+G.esc(sys.verify)+'</p><b>'+G.esc(coverage)+'</b>';
      host.querySelectorAll('[data-gg-overlay]').forEach(x=>x.classList.toggle('active',x===btn));
    }));
  }
  function render(a){
    const field=document.getElementById('ggOsHeroField');if(!field)return;
    field.querySelector('#ggSurveyPlot')?.remove();
    let host=document.getElementById('ggProjectOverlay');
    if(!host){host=document.createElement('section');host.id='ggProjectOverlay';host.className='gg-project-overlay';field.appendChild(host)}
    host.innerHTML=boardMarkup(a||G.analysis());
    bindRows(host);
    field.classList.add('gg-overlay-field');
  }
  function install(){
    render(G.analysis());
    ['powerReq','waterReq','wasteReq','gasReq','fiberReq','projectType','siteSelect'].forEach(id=>{
      const el=document.getElementById(id);if(!el||el.dataset.ggOverlayBound)return;el.dataset.ggOverlayBound='1';
      el.addEventListener('input',()=>render(G.analysis()));
      el.addEventListener('change',()=>setTimeout(()=>render(G.analysis()),20));
    });
  }
  G.injectStyle('gg-project-overlay-style',[
    '.gg-survey .gg-os-field-lines,.gg-survey .gg-os-field-label,.gg-survey .gg-os-site-core,.gg-survey .gg-os-scan{display:none!important}',
    '.gg-survey .gg-os-hero-field.gg-overlay-field{background:linear-gradient(rgba(47,85,217,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(47,85,217,.045) 1px,transparent 1px),#f8fafb!important;background-size:28px 28px,28px 28px,auto!important;border:1px solid #9daab2!important;overflow:hidden!important}',
    '.gg-project-overlay{position:absolute;inset:36px 18px 18px;display:flex;flex-direction:column;border:1px solid #83919a;background:rgba(250,251,249,.97);box-shadow:6px 6px 0 rgba(27,48,64,.08);pointer-events:auto;color:#1b2730}',
    '.gg-overlay-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;padding:15px 16px 13px;border-bottom:1px solid #aeb8be;background:#edf2f5}',
    '.gg-overlay-head span,.gg-overlay-cols span,.gg-overlay-row span,.gg-overlay-detail span,.gg-overlay-foot{font:800 6.5px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.11em}',
    '.gg-overlay-head span{color:#1d4f91}.gg-overlay-head h3{margin:7px 0 2px;font:600 18px/1.05 Arial,sans-serif;letter-spacing:-.02em}.gg-overlay-head p{margin:0;color:#63717a;font-size:8px}.gg-overlay-head small{color:#6a767d;font:700 7px ui-monospace,SFMono-Regular,Menlo,monospace}',
    '.gg-overlay-cols{display:grid;grid-template-columns:1.12fr .9fr .7fr 1.25fr .58fr .72fr;padding:8px 10px;border-bottom:1px solid #c7d0d5;background:#f7f9fa}.gg-overlay-cols span{color:#75828a}',
    '.gg-overlay-rows{display:grid;flex:1}.gg-overlay-row{display:grid;grid-template-columns:1.12fr .9fr .7fr 1.25fr .58fr .72fr;align-items:center;min-height:57px;border:0;border-bottom:1px solid #d5dce0;background:#fff;padding:0 10px;color:#1b2730;text-align:left;cursor:pointer;transition:background .14s,border-color .14s}',
    '.gg-overlay-row:hover,.gg-overlay-row.active{background:#f0f5fa}.gg-overlay-row>div{min-width:0;padding:0 7px}.gg-overlay-row span{display:block;color:#7a878e}.gg-overlay-row strong{display:block;margin-top:5px;color:#243039;font-size:9px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.gg-overlay-system{border-left:3px solid #91a0a8}.gg-overlay-row.good .gg-overlay-system{border-left-color:#4d8769}.gg-overlay-row.warn .gg-overlay-system{border-left-color:#d09a2c}.gg-overlay-row.bad .gg-overlay-system{border-left-color:#e35f3a}',
    '.gg-overlay-status{display:flex!important;align-items:center;justify-content:space-between}.gg-overlay-status b{display:inline-flex;align-items:center;min-height:22px;padding:0 6px;border:1px solid #c0c9ce;background:#f5f7f8;color:#5f6c74;font:800 6px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.07em}.gg-overlay-row.good .gg-overlay-status b{border-color:#8eb39b;background:#edf6f0;color:#37684e}.gg-overlay-row.warn .gg-overlay-status b{border-color:#d9bd7a;background:#fff8e7;color:#8a681e}.gg-overlay-row.bad .gg-overlay-status b{border-color:#e2a090;background:#fff0ec;color:#9b402e}.gg-overlay-status i{color:#1d4f91;font-style:normal;font-size:15px}',
    '.gg-overlay-detail{min-height:60px;padding:10px 13px;border-top:1px solid #aeb8be;background:#eef3f7}.gg-overlay-detail span{color:#f05d2a}.gg-overlay-detail p{margin:5px 0 0;color:#53616a;font-size:8px;line-height:1.45}.gg-overlay-detail b{display:block;margin-top:4px;color:#1d4f91;font:800 7px ui-monospace,SFMono-Regular,Menlo,monospace}',
    '.gg-overlay-foot{display:flex;align-items:center;gap:14px;min-height:30px;padding:0 11px;border-top:1px solid #aeb8be;background:#fff;color:#6d7980}.gg-overlay-foot span{display:flex;align-items:center;gap:5px}.gg-overlay-foot i{width:7px;height:7px;border:1px solid #1f2a31}.gg-overlay-foot i.sim{background:#f06b2b}.gg-overlay-foot i.context{background:#7aa4d3}.gg-overlay-foot b{margin-left:auto;color:#1d4f91;font-weight:800}',
    '@media(max-width:1100px){.gg-project-overlay{inset:28px 12px 14px}.gg-overlay-cols,.gg-overlay-row{grid-template-columns:1.1fr .9fr .7fr .75fr}.gg-overlay-cols span:nth-child(4),.gg-overlay-cols span:nth-child(5),.gg-overlay-row>div:nth-child(4),.gg-overlay-row>div:nth-child(5){display:none}.gg-overlay-row{min-height:54px}}',
    '@media(max-width:620px){.gg-overlay-cols{display:none}.gg-overlay-row{grid-template-columns:1.1fr .8fr .65fr;min-height:66px}.gg-overlay-row>div:nth-child(2),.gg-overlay-row>div:nth-child(4),.gg-overlay-row>div:nth-child(5){display:none}.gg-overlay-detail{min-height:72px}.gg-overlay-foot{flex-wrap:wrap;height:auto;padding-block:8px}.gg-overlay-foot b{width:100%;margin-left:0}}'
  ].join(''));
  const boot=()=>{install();setTimeout(install,700)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  G.afterAnalysis(a=>setTimeout(()=>render(a),40));
})();