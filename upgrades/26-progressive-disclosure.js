'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  function install(){
    const deck=document.getElementById('ggOsDeck');if(!deck)return;
    deck.classList.add('gg-os-deck-pending');
    const head=deck.querySelector('.gg-os-deck-head');if(head&&!document.getElementById('ggOsDeckState')){const state=document.createElement('button');state.id='ggOsDeckState';state.type='button';state.className='gg-os-deck-state';state.innerHTML='<span>SECONDARY WORKSPACE</span><b>Run a project screen first</b><i>+</i>';head.insertAdjacentElement('afterend',state);state.addEventListener('click',()=>deck.classList.toggle('gg-os-deck-forced'))}
    const empty=document.getElementById('emptyState');if(empty&&!document.getElementById('ggOsEmptyGuide')){empty.innerHTML=`<div id="ggOsEmptyGuide" class="gg-os-empty-guide"><div class="gg-os-empty-glyph"><i></i><i></i><i></i><span>?</span></div><span>NO DECISION YET</span><h3>One project. One site. One gate.</h3><p>Describe the project in plain language or edit the utility load directly. The screen will identify the weakest dependency, compare alternatives and tell you what to prove next.</p><ol><li><b>01</b><span>Define the load</span></li><li><b>02</b><span>Run the site gate</span></li><li><b>03</b><span>Prove only the weak link</span></li></ol></div>`}
  }
  function ready(a){
    const deck=document.getElementById('ggOsDeck');if(!deck||!a)return;
    deck.classList.remove('gg-os-deck-pending');deck.classList.add('gg-os-deck-ready');
    const state=document.getElementById('ggOsDeckState');if(state)state.innerHTML=`<span>SECONDARY WORKSPACE</span><b>${G.esc(a.s.name)} · ${G.esc(a.verdict)}</b><i>↘</i>`;
    if(!deck.classList.contains('gg-os-deck-forced')){
      const ids=['rank','compare','sites','registry','changes','method'];ids.forEach((id,index)=>document.getElementById(id)?.classList.toggle('gg-os-pane-hidden',index!==0));
      deck.querySelectorAll('[data-pane]').forEach(btn=>btn.classList.toggle('active',btn.dataset.pane==='rank'));
    }
  }
  G.injectStyle('gg-os-progressive-style',`
    .gg-os-deck-state{display:none;width:100%;border:0;border-bottom:1px solid var(--gg-line);background:#0b141b;color:#7c929c;padding:13px 16px;text-align:left;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;cursor:pointer}.gg-os-deck-state span{font:800 7px var(--gg-mono);letter-spacing:.11em;color:var(--gg-orange)}.gg-os-deck-state b{font:700 9px var(--gg-mono)}.gg-os-deck-state i{font:500 16px var(--gg-mono);font-style:normal;color:var(--gg-cyan)}.gg-os-deck-pending:not(.gg-os-deck-forced) .gg-os-deck-state{display:grid}.gg-os-deck-pending:not(.gg-os-deck-forced) .gg-os-pane{display:none!important}.gg-os-deck-pending:not(.gg-os-deck-forced) .gg-os-deck-head nav{opacity:.35;pointer-events:none}.gg-os-deck-ready .gg-os-deck-state{display:grid}.gg-os-deck-ready .gg-os-deck-state i{transform:rotate(45deg)}
    .gg-os-empty-guide{width:min(620px,100%);margin:auto;text-align:left}.gg-os-empty-guide>span{display:block;color:var(--gg-orange);font:800 8px var(--gg-mono);letter-spacing:.14em;margin-top:22px}.gg-os-empty-guide h3{font:900 clamp(26px,4vw,42px)/.98 Arial Black,Arial,sans-serif!important;text-transform:uppercase;margin:8px 0 12px!important;color:var(--gg-ink)}.gg-os-empty-guide p{max-width:560px;color:#718792;font-size:11px;line-height:1.65}.gg-os-empty-guide ol{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin:22px 0 0;padding:0;list-style:none;background:#263842;border:1px solid #263842}.gg-os-empty-guide li{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center;background:#0d171e;padding:12px}.gg-os-empty-guide li b{margin:0!important;color:var(--gg-cyan)!important;font:800 9px var(--gg-mono)!important}.gg-os-empty-guide li span{font:700 8px var(--gg-mono);color:#8196a0}.gg-os-empty-glyph{position:relative;width:92px;height:92px}.gg-os-empty-glyph i{position:absolute;left:46px;top:46px;width:72px;height:1px;background:linear-gradient(90deg,var(--gg-cyan),transparent);transform-origin:left}.gg-os-empty-glyph i:nth-child(1){transform:rotate(0)}.gg-os-empty-glyph i:nth-child(2){transform:rotate(120deg)}.gg-os-empty-glyph i:nth-child(3){transform:rotate(240deg)}.gg-os-empty-glyph span{position:absolute;left:26px;top:26px;width:40px;height:40px;display:grid;place-items:center;border:1px solid var(--gg-orange);transform:rotate(45deg);color:var(--gg-orange);font:900 16px var(--gg-mono)}@media(max-width:700px){.gg-os-empty-guide ol{grid-template-columns:1fr}.gg-os-deck-state{grid-template-columns:1fr auto}.gg-os-deck-state span{display:none}}
  `);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  G.afterAnalysis(ready);
})();