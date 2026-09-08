'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('ggx-top3-style',`
    .ggx-top3{padding:20px;border-bottom:1px solid #454b40;background:#11140f}.ggx-top3 h3{margin:6px 0 14px;font:600 22px/1 Georgia,serif}.ggx-top3-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ggx-top3-card{border:1px solid #373d34;background:#151812;padding:14px}.ggx-top3-card:first-child{border-color:#caff42}.ggx-top3-card .rank{font:800 9px ui-monospace,SFMono-Regular,Menlo,monospace;color:#caff42}.ggx-top3-card h4{margin:8px 0 10px;font:600 18px/1 Georgia,serif}.ggx-top3-card dl{margin:0}.ggx-top3-card dl div{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-top:1px solid #2f342c;font-size:9px}.ggx-top3-card dt{color:#858c7f}.ggx-top3-card dd{margin:0;text-align:right}.ggx-top3-card button{width:100%;margin-top:10px;border:1px solid #555d4f;background:#12140f;color:#e8e6df;padding:8px;font:800 8px ui-monospace,SFMono-Regular,Menlo,monospace;cursor:pointer}.ggx-top3-card button:hover{border-color:#caff42;color:#caff42}@media(max-width:760px){.ggx-top3-grid{grid-template-columns:1fr}}
  `);
  const render=()=>{
    const gate=document.getElementById('decision-gate'),req=G.current(),rank=G.rank(req).slice(0,3);if(!gate||rank.length<2)return;
    gate.querySelector('#ggxTop3')?.remove();
    const box=document.createElement('section');box.id='ggxTop3';box.className='ggx-top3';
    box.innerHTML=`<span>SHORTLIST / TOP THREE</span><h3>See the tradeoff before you fall in love with a site.</h3><div class="ggx-top3-grid">${rank.map((a,i)=>`<article class="ggx-top3-card"><div class="rank">#${i+1}</div><h4>${G.esc(a.s.name)}</h4><dl><div><dt>Decision</dt><dd>${G.esc(a.verdict)}</dd></div><div><dt>Defensible range</dt><dd>${a.low}–${a.high}</dd></div><div><dt>Weakest dependency</dt><dd>${G.esc(a.worst.name)}</dd></div><div><dt>Weakest coverage</dt><dd>${a.worst.ratio.toFixed(2)}×</dd></div><div><dt>Service lead</dt><dd>${a.s.lead} mo</dd></div><div><dt>Evidence</dt><dd>${G.esc(a.s.evidence)} · ${a.s.confidence}%</dd></div></dl><button type="button" data-site="${G.esc(a.s.id)}">SCREEN THIS SITE</button></article>`).join('')}</div>`;
    const ledger=gate.querySelector('#ggxLedger');(ledger||gate.querySelector('#ggxConfidence'))?.insertAdjacentElement('afterend',box);
    box.addEventListener('click',event=>{const button=event.target.closest('[data-site]');if(!button)return;const select=document.getElementById('siteSelect');if(select){select.value=button.dataset.site;document.getElementById('analyseBtn')?.click();setTimeout(()=>document.getElementById('decision-gate')?.scrollIntoView({behavior:'smooth',block:'start'}),70)}});
  };
  G.afterAnalysis(render);if(G.analysis())setTimeout(render,190);
})();