'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  const labels=['Power','Water','Wastewater','Gas','Fiber'];
  function setField(a){
    const field=document.getElementById('ggOsHeroField');if(!field||!a)return;
    const core=field.querySelector('.gg-os-site-core');if(core){core.innerHTML=`<small>${G.esc(a.s.state)} / ${G.esc(a.s.id)}</small><strong>${a.low}</strong><span>${G.esc(a.verdict)}</span>`;core.classList.toggle('warn',a.vclass==='conditional');core.classList.toggle('stop',a.vclass==='hold')}
    labels.forEach((name,index)=>{const row=a.rows.find(r=>r.name===name),label=field.querySelector(`.l${index+1}`);if(!label||!row)return;const ratio=Math.round(row.ratio*100);label.innerHTML=`${name.toUpperCase()} <b>${ratio}%</b>`;label.classList.toggle('weak',row===a.worst)});
    field.dataset.verdict=a.vclass;
  }
  function installRunway(){
    if(document.getElementById('ggOsRunway'))return;
    const rail=document.getElementById('ggOsRail');if(!rail)return;
    const bar=document.createElement('div');bar.id='ggOsRunway';bar.className='gg-os-runway';bar.innerHTML=`<div class="gg-os-runway-status"><span>DECISION RUNWAY</span><b id="ggOsRunwayLabel">Waiting for project brief</b></div><div class="gg-os-runway-track"><i></i><ol><li data-step="brief"><b>01</b><span>Define</span></li><li data-step="screen"><b>02</b><span>Screen</span></li><li data-step="compete"><b>03</b><span>Compete</span></li><li data-step="prove"><b>04</b><span>Prove</span></li></ol></div>`;document.body.appendChild(bar);
    const updateBrief=()=>{const has=(document.getElementById('ggxBrief')?.value||'').trim().length>10;bar.querySelector('[data-step="brief"]')?.classList.toggle('done',has);if(has)document.getElementById('ggOsRunwayLabel').textContent='Project definition in progress'};
    document.getElementById('ggxBrief')?.addEventListener('input',updateBrief);updateBrief();
  }
  function updateRunway(a){
    const bar=document.getElementById('ggOsRunway');if(!bar||!a)return;
    ['brief','screen'].forEach(step=>bar.querySelector(`[data-step="${step}"]`)?.classList.add('done'));
    const ranks=G.rank(a.req);if(ranks.length>1)bar.querySelector('[data-step="compete"]')?.classList.add('done');
    const prove=a.vclass==='go'||a.vclass==='conditional';bar.querySelector('[data-step="prove"]')?.classList.toggle('ready',prove);
    const label=document.getElementById('ggOsRunwayLabel');if(label)label.textContent=a.vclass==='hold'?'Stop condition found — resolve before diligence':a.vclass==='conditional'?'Site is conditional — prove the weak link':'Site cleared — verify before capital hardens';
    const fill=bar.querySelector('.gg-os-runway-track>i');if(fill)fill.style.width=a.vclass==='hold'?'52%':a.vclass==='conditional'?'76%':'96%';
  }
  function installScrollspy(){
    const links=G.qa('.gg-os-rail nav a');if(!links.length)return;
    const targets=[...links].map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
    const observer=new IntersectionObserver(entries=>{const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!active)return;links.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${active.target.id}`))},{rootMargin:'-22% 0px -58% 0px',threshold:[0,.1,.3,.6]});targets.forEach(target=>observer.observe(target));
  }
  G.injectStyle('gg-os-signal-field-style',`
    .gg-os-site-core{transition:border-color .25s,box-shadow .25s,background .25s}.gg-os-site-core.warn{border-color:var(--gg-yellow);box-shadow:0 0 0 18px rgba(255,215,104,.02),0 0 34px rgba(255,215,104,.08)}.gg-os-site-core.warn strong{color:var(--gg-yellow)}.gg-os-site-core.stop{border-color:var(--gg-red);box-shadow:0 0 0 18px rgba(255,92,82,.02),0 0 34px rgba(255,92,82,.1)}.gg-os-site-core.stop strong{color:var(--gg-red)}.gg-os-field-label{transition:color .2s,transform .2s}.gg-os-field-label b{margin-left:7px;color:var(--gg-cyan);font:800 8px var(--gg-mono)}.gg-os-field-label.weak{color:var(--gg-orange);transform:translateX(4px)}.gg-os-field-label.weak:before{border-color:var(--gg-orange);box-shadow:0 0 10px rgba(255,106,42,.35)}.gg-os-field-label.weak b{color:var(--gg-orange)}
    .gg-os-runway{position:fixed;left:110px;right:18px;bottom:16px;z-index:84;height:52px;border:1px solid #2a3c46;background:rgba(8,14,19,.92);backdrop-filter:blur(16px);display:grid;grid-template-columns:240px 1fr;gap:20px;align-items:center;padding:8px 14px;box-shadow:0 12px 40px rgba(0,0,0,.32);pointer-events:none}.gg-os-runway-status span{display:block;color:var(--gg-orange);font:800 7px var(--gg-mono);letter-spacing:.13em}.gg-os-runway-status b{display:block;margin-top:4px;color:#8da2ac;font:700 9px var(--gg-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gg-os-runway-track{position:relative;height:34px}.gg-os-runway-track:before,.gg-os-runway-track>i{content:"";position:absolute;left:0;right:0;top:16px;height:1px;background:#2b3d47}.gg-os-runway-track>i{right:auto;width:3%;background:linear-gradient(90deg,var(--gg-orange),var(--gg-cyan));box-shadow:0 0 12px rgba(115,223,242,.18);transition:width .45s ease}.gg-os-runway-track ol{position:relative;z-index:2;margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(4,1fr)}.gg-os-runway-track li{display:flex;align-items:center;gap:7px;color:#516975}.gg-os-runway-track li b{width:30px;height:30px;border:1px solid #334751;background:#0a1218;display:grid;place-items:center;font:800 7px var(--gg-mono);border-radius:50%}.gg-os-runway-track li span{font:800 7px var(--gg-mono);letter-spacing:.08em}.gg-os-runway-track li.done b{border-color:var(--gg-cyan);color:var(--gg-cyan);box-shadow:0 0 0 4px rgba(115,223,242,.03)}.gg-os-runway-track li.done span{color:#96aab3}.gg-os-runway-track li.ready b{border-color:var(--gg-orange);color:var(--gg-orange);animation:ggRunwayPing 2s ease-in-out infinite}@keyframes ggRunwayPing{50%{box-shadow:0 0 0 7px rgba(255,106,42,.05)}}body.gg-os{padding-bottom:76px}@media(max-width:1100px){.gg-os-runway{left:16px;right:16px;grid-template-columns:190px 1fr}.gg-os-runway-status b{font-size:8px}}@media(max-width:700px){.gg-os-runway{height:44px;bottom:8px;grid-template-columns:1fr;padding:6px 10px}.gg-os-runway-status{display:none}.gg-os-runway-track{height:30px}.gg-os-runway-track:before,.gg-os-runway-track>i{top:14px}.gg-os-runway-track li b{width:27px;height:27px}.gg-os-runway-track li span{display:none}body.gg-os{padding-bottom:58px}}@media(prefers-reduced-motion:reduce){.gg-os-runway-track li.ready b{animation:none}}
  `);
  function boot(){installRunway();installScrollspy()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  G.afterAnalysis((a)=>{setField(a);updateRunway(a)});
})();