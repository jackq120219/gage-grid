(()=>{
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    if(document.getElementById('ggDiligencePath')) return;
    const screen=document.getElementById('screen');
    if(!screen) return;

    const section=document.createElement('section');
    section.id='ggDiligencePath';
    section.className='section shell gg-diligence';
    section.innerHTML=`
      <div class="head gg-diligence-head"><div><div class="kicker">DILIGENCE SEQUENCER / CAPITAL BEFORE CERTAINTY</div><h2>Know what to verify first.</h2></div><p>Gage already tells you whether a project fits the pilot capacity model. This sequencer turns the project requirements into an ordered diligence path so the highest-consequence unknowns get answered before more capital is exposed.</p></div>
      <div class="gg-diligence-console">
        <aside class="gg-diligence-summary">
          <span>CURRENT PROJECT</span><h3 id="ggdpProject">—</h3><p id="ggdpSite">—</p>
          <div class="ggdp-stat"><small>PRE-DEVELOPMENT CAPITAL ENTERED</small><b id="ggdpCapital">—</b></div>
          <div class="ggdp-stat"><small>TARGET ONLINE WINDOW</small><b id="ggdpTimeline">—</b></div>
          <div class="ggdp-rule"><b>OPERATING RULE</b><p>Resolve the first two infrastructure dependencies before treating secondary strengths as meaningful. A strong site is still weak if one critical service cannot be delivered on time.</p></div>
          <button type="button" class="smallbtn" data-ggdp-copy>COPY DILIGENCE BRIEF</button>
        </aside>
        <div class="gg-diligence-main">
          <div class="ggdp-topline"><span>VERIFICATION ORDER</span><small>Based on current requirements, redundancy and timing — not simulated headroom.</small></div>
          <div id="ggdpPath" class="ggdp-path"></div>
        </div>
      </div>`;
    screen.insertAdjacentElement('afterend',section);

    const style=document.createElement('style');
    style.id='gg-diligence-style';
    style.textContent=`
      .gg-diligence{padding-top:18px}.gg-diligence-console{display:grid;grid-template-columns:330px minmax(0,1fr);border:1px solid #343a30;background:#11140f}.gg-diligence-summary{padding:20px;border-right:1px solid #343a30;background:#171a14}.gg-diligence-summary>span,.ggdp-topline span,.ggdp-card .system,.ggdp-stat small,.ggdp-rule b{font:800 9px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;color:#caff42}.gg-diligence-summary h3{margin:9px 0 5px;font-size:27px;line-height:1;color:#f2efe7}.gg-diligence-summary>p{margin:0 0 20px;color:#9ca494;font-size:12px}.ggdp-stat{padding:13px 0;border-top:1px solid #30352c}.ggdp-stat small{display:block;color:#7f8878}.ggdp-stat b{display:block;margin-top:6px;color:#f2efe7;font:700 20px/1 ui-monospace,SFMono-Regular,Menlo,monospace}.ggdp-rule{margin:14px 0 18px;padding:13px;border:1px solid #343a30;background:#10120e}.ggdp-rule p{margin:7px 0 0;color:#aab1a3;font-size:11px;line-height:1.55}.gg-diligence-main{min-width:0}.ggdp-topline{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:13px 16px;border-bottom:1px solid #343a30;background:#0d100c}.ggdp-topline small{color:#7f8878;font-size:9px}.ggdp-path{display:grid}.ggdp-card{display:grid;grid-template-columns:52px 145px minmax(0,1.15fr) minmax(0,.9fr) 120px;gap:14px;align-items:start;padding:16px;border-bottom:1px solid #2d3329}.ggdp-card:last-child{border-bottom:0}.ggdp-rank{font:700 28px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#caff42}.ggdp-card .system{color:#f2efe7}.ggdp-card .system b{display:block;margin-top:6px;font-size:15px;letter-spacing:0}.ggdp-card p{margin:0;color:#a5ad9f;font-size:11px;line-height:1.55}.ggdp-card .evidence{color:#858f80}.ggdp-card .urgency{text-align:right}.ggdp-card .urgency b{display:block;font:700 17px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#f2efe7}.ggdp-card .urgency small{display:block;margin-top:6px;color:#7f8878;font:700 8px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}.ggdp-card[data-band="critical"] .urgency b{color:#ffb08f}.ggdp-card[data-band="high"] .urgency b{color:#f2d38d}.ggdp-card[data-band="medium"] .urgency b{color:#caff42}@media(max-width:980px){.gg-diligence-console{grid-template-columns:1fr}.gg-diligence-summary{border-right:0;border-bottom:1px solid #343a30}.ggdp-card{grid-template-columns:42px 120px minmax(0,1fr)}.ggdp-card .evidence{grid-column:3}.ggdp-card .urgency{grid-column:2;text-align:left}}@media(max-width:650px){.ggdp-topline{display:block}.ggdp-topline small{display:block;margin-top:5px}.ggdp-card{grid-template-columns:38px 1fr}.ggdp-card>p,.ggdp-card .evidence{grid-column:2}.ggdp-card .urgency{grid-column:2}.gg-diligence-summary h3{font-size:23px}}
    `;
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
        {name:'POWER',demand:`${power.toLocaleString()} MW`,score:(power>=50?96:power>=20?88:power>=5?76:58)+fast+(redundancy>=3?6:redundancy===2?3:0),question:'What firm MW can be served by the target date, at what delivery voltage/substation, and which network upgrades sit on the project versus the utility?',evidence:'Utility service study or written utility confirmation · substation/feed path · upgrade scope · schedule owner',owner:'UTILITY'},
        {name:'WATER',demand:`${water.toFixed(2)} MGD`,score:(water>=1?90:water>=.3?76:water>0?58:28)+fast+(project==='food'||project==='semiconductor'?8:0),question:'What firm daily and peak-day service can be committed, and what storage, pressure or extension work is required to reach the parcel?',evidence:'Utility capacity letter · pressure/flow basis · extension scope · peak-day constraint',owner:'WATER UTILITY'},
        {name:'WASTEWATER',demand:`${waste.toFixed(2)} MGD`,score:(waste>=.8?90:waste>=.25?74:waste>0?56:27)+fast+(project==='food'||project==='semiconductor'?9:0),question:'What permitted hydraulic and treatment headroom exists for this discharge profile, and are pretreatment or industrial-user limits binding?',evidence:'POTW confirmation · permit headroom · pretreatment limits · sewer extension/pump constraint',owner:'POTW / MUNICIPALITY'},
        {name:'FIBER',demand:fiber>=3?'Carrier-dense / mission critical':fiber===2?'Dual-path preferred':'Standard service',score:(fiber>=3?82:fiber===2?66:44)+fast+(project==='data'?10:0),question:'Can the site obtain physically diverse routes and carriers, or are “multiple providers” sharing the same conduit, pole line or meet point?',evidence:'Carrier route map · diverse entrance confirmation · meet-point / splice plan · construction interval',owner:'CARRIER / SITE'},
        {name:'GAS',demand:`${gas.toLocaleString()} MMBtu/h`,score:(gas>=500?84:gas>=100?70:gas>0?54:26)+fast+(project==='manufacturing'||project==='food'?7:0),question:'What firm delivery pressure and hourly capacity are available, and is a main extension, regulator station or upstream reinforcement required?',evidence:'Utility engineering confirmation · pressure basis · main/regulator scope · reinforcement schedule',owner:'GAS UTILITY'}
      ];
      return rows.map(row=>({...row,score:Math.min(100,row.score)})).sort((a,b)=>b.score-a.score);
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
        return `<article class="ggdp-card" data-band="${band}"><div class="ggdp-rank">0${index+1}</div><div class="system">${row.name}<b>${row.demand}</b></div><p>${row.question}</p><p class="evidence">Evidence to close: ${row.evidence}</p><div class="urgency"><b>${row.score}</b><small>${label}<br>${row.owner}</small></div></article>`;
      }).join('');
      const top=rows.slice(0,2).map(row=>row.name).join(' → ');
      section.dataset.brief=`Gage Grid diligence path for ${projectNames[project]||'industrial project'} at ${site}. Target: ${document.getElementById('ggdpTimeline').textContent}. User-entered pre-development capital: ${money(capital)}. Verification order: ${rows.map((row,i)=>`${i+1}. ${row.name}`).join(', ')}. First two dependencies: ${top}. This order is based on project requirements, redundancy and timing; it is not a utility capacity determination.`;
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
