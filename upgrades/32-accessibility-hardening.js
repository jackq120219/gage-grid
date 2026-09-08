'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  function install(){
    const deckNav=document.querySelector('.gg-os-deck-head nav');if(deckNav){deckNav.setAttribute('role','tablist');deckNav.querySelectorAll('[data-pane]').forEach(btn=>{btn.setAttribute('role','tab');btn.setAttribute('aria-controls',btn.dataset.pane);btn.setAttribute('aria-selected',String(btn.classList.contains('active')));btn.addEventListener('click',()=>deckNav.querySelectorAll('[data-pane]').forEach(x=>x.setAttribute('aria-selected',String(x===btn))))})}
    document.querySelectorAll('.gg-os-pane').forEach(pane=>{pane.setAttribute('role','tabpanel');pane.setAttribute('tabindex','-1')});
    const railLinks=[...document.querySelectorAll('.gg-os-rail nav a')];const observer=new MutationObserver(()=>railLinks.forEach(link=>link.toggleAttribute('aria-current',link.classList.contains('active'))));railLinks.forEach(link=>observer.observe(link,{attributes:true,attributeFilter:['class']}));
    const field=document.getElementById('ggOsHeroField');if(field){field.setAttribute('aria-label','Animated infrastructure signal field showing project utility dependencies');field.setAttribute('role','img')}
    const runway=document.getElementById('ggOsRunway');if(runway)runway.setAttribute('aria-label','Decision progress');
  }
  G.injectStyle('gg-os-a11y-style',`
    .gg-os button,.gg-os a{ -webkit-tap-highlight-color:transparent}.gg-os-deck-head button,.gg-os-switch-actions button,.gg-os-rail nav a{min-height:38px}.gg-os-rail nav a[aria-current]{color:var(--gg-ink)}.gg-os [role="tabpanel"]:focus-visible{outline:1px solid var(--gg-cyan)!important;outline-offset:-1px!important}@media(max-width:700px){.gg-os-deck-head nav{display:flex!important;overflow-x:auto;scroll-snap-type:x mandatory;overscroll-behavior-inline:contain;padding-bottom:3px}.gg-os-deck-head nav button{flex:0 0 92px!important;min-height:42px;scroll-snap-align:start}.gg-os-rail nav{overflow-x:auto}.gg-os-rail nav a{min-width:46px;min-height:44px}.gg-os .analyse{min-height:56px}.gg-os .smallbtn{min-height:42px}.gg-os-palette-list button{min-height:46px}}@media(prefers-contrast:more){.gg-os{--gg-line:#48606d;--gg-muted:#a5b8c1}.gg-os .gg-os-rail,.gg-os .workbench,.gg-os .ggx-gate,.gg-os-deck{border-color:#5b7380!important}.gg-os .gg-os-site-node i,.gg-os .gg-os-loadprint-graphic .branch line{stroke-width:3!important}.gg-os button:focus-visible,.gg-os a:focus-visible{outline-width:3px!important}}
  `);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();