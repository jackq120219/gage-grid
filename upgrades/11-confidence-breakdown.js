'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('ggx-confidence-style',`
    .ggx-confidence{padding:20px;border-bottom:1px solid #454b40;background:#10120f}.ggx-confidence h3{margin:6px 0 14px;font:600 22px/1 Georgia,serif}.ggx-confidence-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.ggx-confidence-card{border:1px solid #363b32;background:#141711;padding:13px}.ggx-confidence-card b{display:block;margin:7px 0 4px;font-size:16px}.ggx-confidence-card small{color:#8d9488;font-size:9px;line-height:1.45}.ggx-confidence-card .good{color:#caff42}.ggx-confidence-card .warn{color:#f1b74a}.ggx-confidence-card .bad{color:#ff6b66}@media(max-width:760px){.ggx-confidence-grid{grid-template-columns:1fr 1fr}}@media(max-width:480px){.ggx-confidence-grid{grid-template-columns:1fr}}
  `);
  const render=(a,req)=>{
    const gate=document.getElementById('decision-gate');if(!gate||!a||!req)return;
    gate.querySelector('#ggxConfidence')?.remove();
    const evidenceScore={Verified:100,Reported:78,Modeled:52}[a.s.evidence]||50;
    const evidenceClass=evidenceScore>=90?'good':evidenceScore>=70?'warn':'bad';
    const rangeWidth=Math.max(0,a.high-a.low),rangeClass=rangeWidth<=10?'good':rangeWidth<=20?'warn':'bad';
    const leadBuffer=req.timeline-a.s.lead,leadClass=leadBuffer>=6?'good':leadBuffer>=0?'warn':'bad';
    const box=document.createElement('section');box.id='ggxConfidence';box.className='ggx-confidence';
    box.innerHTML=`<span>EVIDENCE / UNCERTAINTY</span><h3>How much of this answer is actually defensible?</h3><div class="ggx-confidence-grid">
      <div class="ggx-confidence-card"><small>SITE EVIDENCE</small><b class="${evidenceClass}">${G.esc(a.s.evidence)}</b><small>${a.s.evidence==='Verified'?'Highest pilot evidence tier.':a.s.evidence==='Reported'?'Useful but still needs written utility confirmation.':'Modeled evidence carries a material uncertainty discount.'}</small></div>
      <div class="ggx-confidence-card"><small>RECORD CONFIDENCE</small><b class="${a.s.confidence>=90?'good':a.s.confidence>=80?'warn':'bad'}">${a.s.confidence}%</b><small>Confidence attached to the current pilot site record.</small></div>
      <div class="ggx-confidence-card"><small>SCORE SPREAD</small><b class="${rangeClass}">${rangeWidth} pts</b><small>Narrower defensive ranges mean less sensitivity to evidence uncertainty.</small></div>
      <div class="ggx-confidence-card"><small>TIMING BUFFER</small><b class="${leadClass}">${leadBuffer>=0?`+${leadBuffer}`:leadBuffer} mo</b><small>${leadBuffer>=0?'Modeled service sits inside the required window.':'Modeled service lead time misses the required window.'}</small></div>
    </div>`;
    const capital=gate.querySelector('#ggxCapital');(capital||gate.querySelector('#ggxStress'))?.insertAdjacentElement('afterend',box);
  };
  G.afterAnalysis(render);const a=G.analysis(),r=G.current();if(a&&r)setTimeout(()=>render(a,r),170);
})();