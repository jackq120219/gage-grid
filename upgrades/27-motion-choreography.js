'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  function installReveal(){
    const targets=G.qa('.gg-os .head,.gg-os .workbench,.gg-os .mini-metrics,.gg-os-deck,.gg-os .access-panel,.gg-os .saved-section');
    targets.forEach((el,index)=>{el.classList.add('gg-os-reveal');el.style.setProperty('--reveal-delay',`${Math.min(index*18,90)}ms`)});
    if(reduce){targets.forEach(el=>el.classList.add('in'));return}
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -6% 0px'});targets.forEach(el=>observer.observe(el));
  }
  function animateGate(){
    const gate=document.getElementById('decision-gate');if(!gate)return;
    const pieces=[...gate.children];pieces.forEach((el,index)=>{el.classList.remove('gg-os-gate-enter');void el.offsetWidth;el.style.setProperty('--gate-delay',`${index*55}ms`);el.classList.add('gg-os-gate-enter')});
  }
  function pointerField(){
    const field=document.getElementById('ggOsHeroField');if(!field||reduce)return;
    field.addEventListener('pointermove',event=>{const rect=field.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;field.style.setProperty('--px',`${x*10}px`);field.style.setProperty('--py',`${y*10}px`)});field.addEventListener('pointerleave',()=>{field.style.setProperty('--px','0px');field.style.setProperty('--py','0px')});
  }
  function countCore(a){if(!a)return;const core=document.querySelector('.gg-os-site-core strong');if(!core)return;const end=Number(a.low)||0;if(reduce){core.textContent=String(end);return}const start=Number(core.textContent)||0,duration=420,t0=performance.now();function tick(now){const p=Math.min(1,(now-t0)/duration),ease=1-Math.pow(1-p,3);core.textContent=String(Math.round(start+(end-start)*ease));if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)}
  G.injectStyle('gg-os-motion-style',`
    .gg-os-reveal{opacity:.01;transform:translateY(18px);clip-path:inset(0 0 12px 0);transition:opacity .55s ease var(--reveal-delay),transform .55s cubic-bezier(.2,.75,.2,1) var(--reveal-delay),clip-path .55s ease var(--reveal-delay)}.gg-os-reveal.in{opacity:1;transform:none;clip-path:inset(0)}.gg-os-gate-enter{animation:ggOsGateEnter .48s cubic-bezier(.2,.75,.2,1) both;animation-delay:var(--gate-delay)}@keyframes ggOsGateEnter{from{opacity:.2;transform:translateY(12px);clip-path:inset(0 0 18px 0)}to{opacity:1;transform:none;clip-path:inset(0)}}.gg-os-hero-field .gg-os-site-core{translate:var(--px,0) var(--py,0);transition:translate .35s cubic-bezier(.2,.75,.2,1)}.gg-os-hero-field .gg-os-field-lines{translate:calc(var(--px,0) * -.5) calc(var(--py,0) * -.5);transition:translate .45s cubic-bezier(.2,.75,.2,1)}.gg-os .smallbtn,.gg-os .btn,.gg-os .analyse,.gg-os-deck-head button,.gg-os-switch-actions button{transition:background .16s,border-color .16s,color .16s,transform .16s}.gg-os .smallbtn:active,.gg-os .btn:active,.gg-os .analyse:active,.gg-os-deck-head button:active,.gg-os-switch-actions button:active{transform:translateY(1px) scale(.99)}@media(prefers-reduced-motion:reduce){.gg-os-reveal{opacity:1!important;transform:none!important;clip-path:none!important;transition:none!important}.gg-os-gate-enter{animation:none!important}.gg-os-hero-field .gg-os-site-core,.gg-os-hero-field .gg-os-field-lines{translate:0!important;transition:none!important}}
  `);
  function boot(){installReveal();pointerField()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  G.afterAnalysis(a=>{animateGate();countCore(a)});
})();