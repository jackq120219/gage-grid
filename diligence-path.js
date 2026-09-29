(()=>{
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    if(document.getElementById('ggDiligencePath')) return;
    const screen=document.getElementById('screen');
    if(!screen) return;

    const section=document.createElement('section');
    section.id='ggDiligencePath';
    section.className='section shell gg-diligence gg-diligence-v6';
    section.innerHTML=
      '<div class="head gg-diligence-head"><div><div class="kicker">DECISION RUNWAY / DILIGENCE ORDER</div><h2>Know which question deserves the next dollar.</h2></div><p>Gage turns the project requirements into an ordered verification plan. Start with the dependencies that can actually kill the schedule or invalidate the site, then work outward.</p></div>'+
      '<div class="gg-diligence-console">'+
        '<aside class="gg-diligence-summary">'+
          '<div class="ggdp-project-tag">CURRENT PROJECT</div><h3 id="ggdpProject">—</h3><p id="ggdpSite">—</p>'+
          '<div class="ggdp-summary-grid"><div class="ggdp-stat"><small>PRE-DEVELOPMENT CAPITAL</small><b id="ggdpCapital">—</b></div><div class="ggdp-stat"><small>TARGET ONLINE</small><b id="ggdpTimeline">—</b></div></div>'+
          '<div class="ggdp-rule"><b>OPERATING RULE</b><p>Close the first two dependencies before treating secondary strengths as meaningful. One unverified critical service can still invalidate an otherwise strong site.</p></div>'+
          '<button type="button" class="ggdp-copy" data-ggdp-copy>COPY DILIGENCE BRIEF</button>'+
        '</aside>'+
        '<div class="gg-diligence-main">'+
          '<div class="ggdp-topline"><div><span>VERIFICATION ORDER</span><strong>Highest-consequence unknowns first</strong></div><small>Priority comes from project demand, redundancy and timing — not simulated headroom.</small></div>'+
          '<div id="ggdpPath" class="ggdp-path"></div>'+
        '</div>'+
      '</div>';
    screen.insertAdjacentElement('afterend',section);

    const style=document.createElement('style');
    style.id='gg-diligence-style-v6';
    style.textContent=[
      '.gg-diligence-v6{padding-top:28px!important}.gg-diligence-v6 .gg-diligence-head h2{max-width:760px}.gg-diligence-v6 .gg-diligence-head p{max-width:520px;color:#59666f!important}',
      '.gg-diligence-v6 .gg-diligence-console{display:grid;grid-template-columns:330px minmax(0,1fr);border:2px solid #18212a;background:#fff;box-shadow:8px 8px 0 rgba(24,33,42,.08)}',
      '.gg-diligence-v6 .gg-diligence-summary{padding:20px;border-right:1px solid #18212a;background:linear-gradient(180deg,#edf3f8 0,#fff 46%)}',
      '.gg-diligence-v6 .ggdp-project-tag,.gg-diligence-v6 .ggdp-topline span,.gg-diligence-v6 .ggdp-stat small,.gg-diligence-v6 .ggdp-rule b,.gg-diligence-v6 .ggdp-card summary>span,.gg-diligence-v6 .ggdp-card-label{font:800 7px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.11em;color:#1d4f91}',
      '.gg-diligence-v6 .gg-diligence-summary h3{margin:10px 0 5px;color:#18212a;font:400 27px/1 Georgia,serif;letter-spacing:-.03em}.gg-diligence-v6 .gg-diligence-summary>p{margin:0 0 18px;color:#66737b;font-size:11px}',
      '.gg-diligence-v6 .ggdp-summary-grid{display:grid;grid-template-columns:1fr 1fr;border:1px solid #aab5bc;background:#fff}.gg-diligence-v6 .ggdp-stat{padding:12px}.gg-diligence-v6 .ggdp-stat+ .ggdp-stat{border-left:1px solid #c5cdd2}.gg-diligence-v6 .ggdp-stat small{display:block;color:#6e7a82}.gg-diligence-v6 .ggdp-stat b{display:block;margin-top:7px;color:#18212a;font:800 13px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace}',
      '.gg-diligence-v6 .ggdp-rule{margin:14px 0;padding:13px;border:1px solid #b8c2c8;border-left:5px solid #f06b2b;background:#f8faf9}.gg-diligence-v6 .ggdp-rule b{color:#f06b2b}.gg-diligence-v6 .ggdp-rule p{margin:7px 0 0;color:#59666f;font-size:10px;line-height:1.55}',
      '.gg-diligence-v6 .ggdp-copy{width:100%;min-height:39px;border:1px solid #18212a;background:#1d4f91;color:#fff;font:800 7px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.07em;cursor:pointer}.gg-diligence-v6 .ggdp-copy:hover{background:#153f78}',
      '.gg-diligence-v6 .gg-diligence-main{min-width:0;background:#f8faf9}.gg-diligence-v6 .ggdp-topline{display:flex;justify-content:space-between;gap:24px;align-items:end;padding:14px 16px;border-bottom:1px solid #18212a;background:#e8eef3}.gg-diligence-v6 .ggdp-topline>div strong{display:block;margin-top:4px;color:#27343d;font-size:11px}.gg-diligence-v6 .ggdp-topline small{max-width:430px;color:#68747c;font-size:8px;line-height:1.45;text-align:right}',
      '.gg-diligence-v6 .ggdp-path{display:grid;gap:8px;padding:12px;background:#eef1ed}.gg-diligence-v6 .ggdp-card{border:1px solid #9eabb3;background:#fff}.gg-diligence-v6 .ggdp-card[open]{border-color:#1d4f91;box-shadow:inset 4px 0 0 #1d4f91}.gg-diligence-v6 .ggdp-card[data-band="critical"]{box-shadow:inset 4px 0 0 #f06b2b}.gg-diligence-v6 .ggdp-card[data-band="critical"][open]{border-color:#f06b2b}',
      '.gg-diligence-v6 .ggdp-card summary{list-style:none;display:grid;grid-template-columns:50px minmax(150px,.8fr) minmax(180px,1.1fr) minmax(110px,.5fr);gap:12px;align-items:center;min-height:66px;padding:0 14px;cursor:pointer}.gg-diligence-v6 .ggdp-card summary::-webkit-details-marker{display:none}',
      '.gg-diligence-v6 .ggdp-rank{color:#1d4f91;font:400 27px/1 Georgia,serif}.gg-diligence-v6 .ggdp-card[data-band="critical"] .ggdp-rank{color:#f06b2b}.gg-diligence-v6 .ggdp-system b{display:block;margin-top:5px;color:#18212a;font-size:13px}.gg-diligence-v6 .ggdp-system span{color:#66737b}',
      '.gg-diligence-v6 .ggdp-why strong{display:block;color:#26343d;font-size:10px}.gg-diligence-v6 .ggdp-why small{display:block;margin-top:4px;color:#6d7980;font-size:8px;line-height:1.4}',
      '.gg-diligence-v6 .ggdp-priority{text-align:right}.gg-diligence-v6 .ggdp-priority b{display:block;color:#1d4f91;font:800 18px/1 ui-monospace,SFMono-Regular,Menlo,monospace}.gg-diligence-v6 .ggdp-card[data-band="critical"] .ggdp-priority b{color:#f06b2b}.gg-diligence-v6 .ggdp-priority small{display:block;margin-top:4px;color:#66737b;font:800 6px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.07em}',
      '.gg-diligence-v6 .ggdp-detail{display:grid;grid-template-columns:1.15fr 1fr .58fr;gap:1px;border-top:1px solid #c1cbd0;background:#c1cbd0}.gg-diligence-v6 .ggdp-detail>div{padding:13px 14px;background:#fff}.gg-diligence-v6 .ggdp-detail p{margin:6px 0 0;color:#58666f;font-size:9px;line-height:1.55}.gg-diligence-v6 .ggdp-detail .owner{background:#f5f7f8}.gg-diligence-v6 .ggdp-detail .owner b{display:block;margin-top:7px;color:#1d4f91;font-size:10px}',
      '.gg-diligence-v6 .ggdp-chevron{justify-self:end;color:#1d4f91;font:800 15px ui-monospace,SFMono-Regular,Menlo,monospace;transition:transform .16s}.gg-diligence-v6 .ggdp-card[open] .ggdp-chevron{transform:rotate(90deg)}',
      '@media(max-width:980px){.gg-diligence-v6 .gg-diligence-console{grid-template-columns:1fr}.gg-diligence-v6 .gg-diligence-summary{border-right:0;border-bottom:1px solid #18212a}.gg-diligence-v6 .ggdp-card summary{grid-template-columns:42px 1fr 120px}.gg-diligence-v6 .ggdp-why{grid-column:2}.gg-diligence-v6 .ggdp-priority{grid-column:3;grid-row:1/3}.gg-diligence-v6 .ggdp-detail{grid-template-columns:1fr 1fr}.gg-diligence-v6 .ggdp-detail .owner{grid-column:1/-1}}',
      '@media(max-width:650px){.gg-diligence-v6 .ggdp-topline{display:block}.gg-diligence-v6 .ggdp-topline small{display:block;margin-top:6px;text-align:left}.gg-diligence-v6 .ggdp-card summary{grid-template-columns:36px 1fr 84px;padding:0 10px}.gg-diligence-v6 .ggdp-why{display:none}.gg-diligence-v6 .ggdp-detail{grid-template-columns:1fr}.gg-diligence-v6 .ggdp-detail .owner{grid-column:auto}.gg-diligence-v6 .ggdp-summary-grid{grid-template-columns:1fr}.gg-diligence-v6 .ggdp-stat+ .ggdp-stat{border-left:0;border-top:1px solid #c5cdd2}}'
    ].join('');
    document.head.appendChild(style);

    const val=id=>document.getElementById(id)?.value??'';
    const number=id=>Math.max(0,Number(val(id))||0);
    const money=n=>Number(n||0).toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
    const projectNames={data:'Data center / compute',manufacturing:'Advanced manufacturing',semiconductor:'Semiconductor / high-spec fab',food:'Food / beverage processing',cold:'Cold storage',battery:'Battery / energy manufacturing',warehouse:'Distribution / warehouse',custom:'Custom industrial load'};

    const buildSystems=()=>{
      const timeline=number('timeline')||24;
      const fast=timeline<=12?12:timeline<=24?6:0;
      const redundancy=number('powerRedundancy');
      const fiber=number('fiberReq');
      const power=number('powerReq');
      const water=number('waterReq');
      const waste=number('wasteReq');
      const gas=number('gasReq');
      const project=val('projectType');
      const rows=[
        {name:'POWER',demand:power.toLocaleString()+' MW',score:(power>=50?96:power>=20?88:power>=5?76:58)+fast+(redundancy>=3?6:redundancy===2?3:0),why:'Power can dominate both project viability and schedule.',question:'What firm MW can be served by the target date, at what delivery voltage/substation, and which network upgrades sit on the project versus the utility?',evidence:'Utility service study or written utility confirmation · substation/feed path · upgrade scope · schedule owner',owner:'ELECTRIC UTILITY'},
        {name:'WATER',demand:water.toFixed(2)+' MGD',score:(water>=1?90:water>=.3?76:water>0?58:28)+fast+(project==='food'||project==='semiconductor'?8:0),why:'Peak-day service and pressure can matter more than average supply.',question:'What firm daily and peak-day service can be committed, and what storage, pressure or extension work is required to reach the parcel?',evidence:'Utility capacity letter · pressure/flow basis · extension scope · peak-day constraint',owner:'WATER AUTHORITY'},
        {name:'WASTEWATER',demand:waste.toFixed(2)+' MGD',score:(waste>=.8?90:waste>=.25?74:waste>0?56:27)+fast+(project==='food'||project==='semiconductor'?9:0),why:'Treatment and collection constraints can stop an otherwise strong utility site.',question:'What permitted hydraulic and treatment headroom exists for this discharge profile, and are pretreatment or industrial-user limits binding?',evidence:'POTW confirmation · permit headroom · pretreatment limits · sewer extension/pump constraint',owner:'POTW / MUNICIPALITY'},
        {name:'FIBER',demand:fiber>=3?'Carrier-dense / mission critical':fiber===2?'Dual-path preferred':'Standard service',score:(fiber>=3?82:fiber===2?66:44)+fast+(project==='data'?10:0),why:'Route diversity matters only if the physical paths are actually independent.',question:'Can the site obtain physically diverse routes and carriers, or are “multiple providers” sharing the same conduit, pole line or meet point?',evidence:'Carrier route map · diverse entrance confirmation · meet-point / splice plan · construction interval',owner:'CARRIER / SITE'},
        {name:'GAS',demand:gas.toLocaleString()+' MMBtu/h',score:(gas>=500?84:gas>=100?70:gas>0?54:26)+fast+(project==='manufacturing'||project==='food'?7:0),why:'Pressure and reinforcement scope can change both cost and delivery timing.',question:'What firm delivery pressure and hourly capacity are available, and is a main extension, regulator station or upstream reinforcement required?',evidence:'Utility engineering confirmation · pressure basis · main/regulator scope · reinforcement schedule',owner:'GAS UTILITY'}
      ];
      return rows.map(row=>Object.assign({},row,{score:Math.min(100,row.score)})).sort((a,b)=>b.score-a.score);
    };

    const render=()=>{
      const rows=buildSystems();
      const project=val('projectType');
      const site=document.getElementById('siteSelect')?.selectedOptions?.[0]?.textContent?.trim()||'Selected pilot site';
      const timeline=number('timeline')||24;
      const capital=number('capitalExposure');
      document.getElementById('ggdpProject').textContent=projectNames[project]||'Industrial project';
      document.getElementById('ggdpSite').textContent=site;
      document.getElementById('ggdpCapital').textContent=money(capital);
      document.getElementById('ggdpTimeline').textContent=timeline<=12?'≤ 12 months':timeline<=24?'12–24 months':timeline<=36?'24–36 months':'36+ months';
      const path=document.getElementById('ggdpPath');
      path.innerHTML=rows.map((row,index)=>{
        const band=row.score>=88?'critical':row.score>=72?'high':'medium';
        const label=row.score>=88?'VERIFY FIRST':row.score>=72?'VERIFY EARLY':'VERIFY NEXT';
        const open=index<2?' open':'';
        return '<details class="ggdp-card" data-band="'+band+'"'+open+'>'+
          '<summary><div class="ggdp-rank">0'+(index+1)+'</div><div class="ggdp-system"><span>'+row.name+'</span><b>'+row.demand+'</b></div><div class="ggdp-why"><strong>'+row.why+'</strong><small>Open for the exact verification question and evidence list.</small></div><div class="ggdp-priority"><b>'+row.score+'</b><small>'+label+'</small></div><i class="ggdp-chevron">›</i></summary>'+
          '<div class="ggdp-detail"><div><span class="ggdp-card-label">WHAT MUST BE CONFIRMED</span><p>'+row.question+'</p></div><div><span class="ggdp-card-label">EVIDENCE TO CLOSE</span><p>'+row.evidence+'</p></div><div class="owner"><span class="ggdp-card-label">PRIMARY OWNER</span><b>'+row.owner+'</b></div></div>'+
          '</details>';
      }).join('');
      const top=rows.slice(0,2).map(row=>row.name).join(' → ');
      section.dataset.brief='Gage Grid diligence path for '+(projectNames[project]||'industrial project')+' at '+site+'. Target: '+document.getElementById('ggdpTimeline').textContent+'. User-entered pre-development capital: '+money(capital)+'. Verification order: '+rows.map((row,i)=>(i+1)+'. '+row.name).join(', ')+'. First two dependencies: '+top+'. This order is based on project requirements, redundancy and timing; it is not a utility capacity determination.';
    };

    ['projectType','siteSelect','powerReq','waterReq','wasteReq','gasReq','fiberReq','timeline','powerRedundancy','capitalExposure'].forEach(id=>{
      const el=document.getElementById(id);el?.addEventListener('input',render);el?.addEventListener('change',render);
    });
    render();

    section.querySelector('[data-ggdp-copy]')?.addEventListener('click',async(event)=>{
      const button=event.currentTarget;
      try{await navigator.clipboard.writeText(section.dataset.brief||'');button.textContent='DILIGENCE BRIEF COPIED';setTimeout(()=>button.textContent='COPY DILIGENCE BRIEF',1300)}catch{button.textContent='COPY UNAVAILABLE'}
    });
  });
})();