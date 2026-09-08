'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('gg-score-clarity-v48',`
    .gg-score-instrument{isolation:isolate}
    .gg-score-number{color:#101722!important;font-size:clamp(42px,4.8vw,72px)!important;font-weight:900!important;line-height:.9!important;letter-spacing:-.055em!important;text-shadow:0 1px 0 rgba(255,255,255,.45)}
    .gg-score-label{color:#475466!important;font-weight:800!important;letter-spacing:.11em!important}
    .gg-score-instrument [class*="ring"],.gg-score-instrument [class*="circle"]{filter:saturate(.82) contrast(.94)}
    .gg-score-instrument:hover .gg-score-number{transform:scale(1.035);transform-origin:center;transition:transform .16s ease}
    @media(prefers-reduced-motion:reduce){.gg-score-instrument:hover .gg-score-number{transform:none;transition:none}}
  `);
  function enhance(){
    const labels=[...document.querySelectorAll('small,span,div,p')].filter(el=>el.children.length===0&&el.textContent?.trim().toUpperCase()==='FEASIBILITY');
    labels.forEach(label=>{
      label.classList.add('gg-score-label');
      let host=label.parentElement;
      for(let i=0;i<3&&host;i++,host=host.parentElement){
        const nums=[...host.querySelectorAll('strong,b,span,div')].filter(el=>/^\d{1,3}$/.test(el.textContent?.trim()||''));
        if(nums.length){
          host.classList.add('gg-score-instrument');
          nums[0].classList.add('gg-score-number');
          host.title='Feasibility summarizes risk-adjusted project fit. Open the decision details to see the range, bottleneck, confidence and what would change the answer.';
          break;
        }
      }
    });
  }
  const boot=()=>{enhance();G.afterAnalysis?.(()=>setTimeout(enhance,40));new MutationObserver(()=>setTimeout(enhance,30)).observe(document.body,{childList:true,subtree:true})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
