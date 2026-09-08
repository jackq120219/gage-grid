'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('gg-preference-clarity-v49',`
    #ggpRadar{max-width:460px;width:100%;margin-inline:auto;display:block}
    .ggp-grid-ring{fill:none!important;stroke:#c6ced8!important;stroke-opacity:.55!important}
    .ggp-axis-line{stroke:#b8c2cf!important;stroke-opacity:.7!important}
    .ggp-axis-label{fill:#566476!important;font-size:9px!important;font-weight:800!important;letter-spacing:.08em}
    .ggp-preference-poly{fill:rgba(47,91,234,.09)!important;stroke:#2f5bea!important;stroke-width:2.5!important}
    .ggp-capability-poly{fill:rgba(255,95,55,.07)!important;stroke:#ff5f37!important;stroke-width:2!important}
    .ggp-handle{fill:#fff!important;stroke:#2f5bea!important;stroke-width:3!important;cursor:grab;filter:drop-shadow(0 2px 4px rgba(20,32,48,.16))}
    .ggp-handle:active{cursor:grabbing}
    .ggp-rec-card{background:#fbfcfe!important;border-color:#cfd6df!important;box-shadow:none!important;padding:16px!important}
    .ggp-rec-card h3{margin-block:6px 8px!important}
    .ggp-rec-card p{line-height:1.5!important;color:#657182!important}
    .ggp-rec-score{font-size:28px!important;line-height:1!important;color:#20304a!important}
    [class*="ggp-preset"],[class*="ggp-what"] button,[class*="ggp-view"] button{min-height:38px!important}
    [class*="ggp-control"] input[type="range"]{accent-color:#2f5bea;cursor:pointer}
    [class*="ggp-control"] output{font-variant-numeric:tabular-nums;font-weight:900}
    @media(max-width:760px){#ggpRadar{max-width:360px}.ggp-rec-card{padding:14px!important}.ggp-axis-label{font-size:8px!important}}
    @media(prefers-reduced-motion:reduce){.ggp-handle,.ggp-rec-card{transition:none!important}}
  `);
  function label(){
    const radar=document.getElementById('ggpRadar');if(!radar)return;
    radar.setAttribute('role','img');radar.setAttribute('aria-label','Decision preference map comparing project priorities with site capability. Drag the points or use the controls to change the ranking.');
    radar.querySelectorAll('.ggp-handle').forEach(h=>{h.setAttribute('tabindex','0');h.setAttribute('role','slider');h.setAttribute('aria-valuemin','0');h.setAttribute('aria-valuemax','100')});
  }
  const boot=()=>{label();new MutationObserver(()=>setTimeout(label,25)).observe(document.body,{subtree:true,childList:true})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
