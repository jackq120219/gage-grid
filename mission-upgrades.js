'use strict';
(()=>{
  const GGX=window.GGX=window.GGX||{};
  GGX.$=id=>document.getElementById(id);
  GGX.q=(selector,root=document)=>root.querySelector(selector);
  GGX.qa=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
  GGX.esc=value=>String(value??'').replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":"&#39;"}[char]));
  GGX.money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(value)||0);
  GGX.clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  GGX.current=()=>{try{return currentReq()}catch(_e){return null}};
  GGX.analysis=()=>{try{return lastAnalysis}catch(_e){return null}};
  GGX.rank=(req=GGX.current())=>{
    if(!req)return[];
    try{return sites.map(site=>analyzeSite(site,req,false)).sort((a,b)=>{
      const order={go:3,conditional:2,hold:1};
      return (order[b.vclass]-order[a.vclass])||(b.low-a.low)||(b.score-a.score)||(b.worst.ratio-a.worst.ratio);
    })}catch(_e){return[]}
  };
  GGX.afterAnalysis=callback=>{
    const run=()=>window.setTimeout(()=>callback(GGX.analysis(),GGX.current()),55);
    document.addEventListener('click',event=>{
      const target=event.target?.closest?.('#analyseBtn,#ggxBest,#loadDemoBtn,#ggxSwitch');
      if(target)run();
    });
    document.addEventListener('ggx:analysis',run);
  };
  GGX.injectStyle=(id,css)=>{
    if(document.getElementById(id))return;
    const style=document.createElement('style');style.id=id;style.textContent=css;document.head.appendChild(style);
  };
  GGX.toast=message=>{try{toast(message)}catch(_e){const node=document.createElement('div');node.className='ggx-mini-toast';node.textContent=message;document.body.appendChild(node);setTimeout(()=>node.remove(),2200)}};
  GGX.copy=async text=>{try{await navigator.clipboard.writeText(text);GGX.toast('Copied to clipboard');return true}catch(_e){return false}};

  function installMissionStrip(){
    if(document.getElementById('ggxMissionStrip'))return;
    const screen=document.getElementById('screen');if(!screen)return;
    const strip=document.createElement('div');strip.id='ggxMissionStrip';strip.className='ggx-mission-strip';
    strip.innerHTML='<div><span>01</span><b>DESCRIBE</b><small>One project, one load.</small></div><i>→</i><div><span>02</span><b>GATE</b><small>Find what breaks first.</small></div><i>→</i><div><span>03</span><b>PROVE</b><small>Spend diligence only where it matters.</small></div>';
    screen.insertBefore(strip,screen.firstChild.nextSibling);
  }

  function installInputCoverage(){
    const brief=document.querySelector('.ggx-brief');if(!brief||document.getElementById('ggxCoverage'))return;
    const coverage=document.createElement('div');coverage.id='ggxCoverage';coverage.className='ggx-coverage';
    coverage.innerHTML='<div><span>INPUT COVERAGE</span><b id="ggxCoverageLabel">Category baseline</b></div><div class="ggx-coverage-track"><i id="ggxCoverageFill"></i></div><small id="ggxCoverageNote">Add explicit power, timing, water, wastewater, gas, redundancy or capital details to reduce assumptions.</small>';
    brief.appendChild(coverage);
    const update=()=>{
      const text=(document.getElementById('ggxBrief')?.value||'').toLowerCase();
      const checks=[/\d+(?:\.\d+)?\s*(?:mw|gw)/,/(?:within|online|q[1-4]|20\d{2}|months?)/,/\d+(?:\.\d+)?\s*mgd/,/wastewater|sewer|discharge/,/mmbtu|natural gas/,/dual|diverse|redundan|single feed/,/\$\s*[\d,.]+/];
      const hits=checks.filter(rx=>rx.test(text)).length;
      const pct=Math.round(hits/checks.length*100);
      const fill=document.getElementById('ggxCoverageFill'),label=document.getElementById('ggxCoverageLabel');
      if(fill)fill.style.width=`${Math.max(8,pct)}%`;
      if(label)label.textContent=pct>=70?'High-detail brief':pct>=40?'Partially specified':'Category baseline';
    };
    document.getElementById('ggxBrief')?.addEventListener('input',update);update();
  }

  GGX.injectStyle('ggx-mission-base',`
    .ggx-mission-strip{margin:18px 0 28px;display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:14px;align-items:center;border:1px solid #383d33;background:#11130f;padding:13px 16px}.ggx-mission-strip>div{display:grid;grid-template-columns:auto 1fr;gap:2px 9px;align-items:center}.ggx-mission-strip span{grid-row:1/3;font:800 18px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;color:#caff42}.ggx-mission-strip b{font:800 10px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}.ggx-mission-strip small{color:#9da393;font-size:10px}.ggx-mission-strip i{color:#5f6758;font-style:normal}.ggx-coverage{margin-top:12px;border-top:1px solid #33382f;padding-top:10px}.ggx-coverage>div:first-child{display:flex;justify-content:space-between;gap:12px;align-items:center}.ggx-coverage span,.ggx-coverage b{font:800 8px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}.ggx-coverage b{color:#caff42}.ggx-coverage-track{height:5px;margin:8px 0;background:#2a2f26;overflow:hidden}.ggx-coverage-track i{display:block;height:100%;width:8%;background:#caff42;transition:width .22s ease}.ggx-coverage small{color:#858b7e;font-size:9px;line-height:1.45}.ggx-mini-toast{position:fixed;right:20px;bottom:20px;z-index:9999;background:#caff42;color:#12130f;padding:10px 14px;font:800 10px ui-monospace,SFMono-Regular,Menlo,monospace}@media(max-width:720px){.ggx-mission-strip{grid-template-columns:1fr}.ggx-mission-strip>i{display:none}}
  `);

  function boot(){installMissionStrip();installInputCoverage()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

  const featureFiles=[
    '01-system-bars.js','02-winner-explanation.js','03-flip-thresholds.js','04-diligence-questions.js','05-copy-memo.js','06-download-memo.js','07-share-scenario.js','08-restore-scenario.js','09-stress-controls.js','10-capital-exposure.js','11-confidence-breakdown.js','12-assumption-ledger.js','13-project-presets.js','14-top-three-tradeoffs.js','15-mobile-actions.js','16-input-validation.js','17-visual-polish.js','18-final-hardening.js','19-grid-os-shell.js','20-loadprint.js','21-signal-field.js','22-siting-field.js','23-verification-spine.js','24-command-palette.js','25-project-switchboard.js','26-progressive-disclosure.js','27-motion-choreography.js'
  ];
  let featureIndex=0;
  function loadNext(){
    if(featureIndex>=featureFiles.length)return;
    const script=document.createElement('script');script.src=`/upgrades/${featureFiles[featureIndex++]}`;script.defer=true;script.onload=loadNext;script.onerror=loadNext;document.head.appendChild(script);
  }
  loadNext();
})();