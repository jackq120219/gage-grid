'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('ggx-capital-style',`
    .ggx-capital{display:grid;grid-template-columns:1.1fr .9fr;gap:1px;background:#41473d;border-bottom:1px solid #454b40}.ggx-capital>div{background:#12150f;padding:20px}.ggx-capital h3{margin:6px 0 12px;font:600 22px/1 Georgia,serif}.ggx-capital-big{font:800 30px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#caff42}.ggx-capital p{margin:8px 0 0;color:#9ca397;font-size:10px;line-height:1.6}.ggx-capital-meter{height:12px;background:#2a2f27;margin-top:12px;position:relative}.ggx-capital-meter i{display:block;height:100%;background:#f1b74a}.ggx-capital-meter i.stop{background:#ff6b66}.ggx-capital-meter i.go{background:#caff42}@media(max-width:720px){.ggx-capital{grid-template-columns:1fr}}
  `);
  const render=(a,req)=>{
    const gate=document.getElementById('decision-gate');if(!gate||!a||!req)return;
    gate.querySelector('#ggxCapital')?.remove();
    const total=Math.max(0,Number(req.capital)||0),exposed=Math.min(total,Math.max(0,Number(a.atRisk)||0)),protectedCapital=Math.max(0,total-exposed),share=total?Math.round(exposed/total*100):0;
    const box=document.createElement('section');box.id='ggxCapital';box.className='ggx-capital';
    box.innerHTML=`<div><span>CAPITAL GATE</span><h3>What the screen is protecting before diligence hardens.</h3><div class="ggx-capital-big">${total?G.money(protectedCapital):'Add capital exposure'}</div><p>${total?`Of ${G.money(total)} entered pre-development capital, the current screen leaves roughly ${G.money(exposed)} in the model's exposed bucket. This is a decision-control estimate, not a predicted loss.`:'Enter pre-development capital in Advanced assumptions to turn the site verdict into a capital-control view.'}</p></div><div><span>EXPOSED SHARE</span><div class="ggx-capital-big">${total?`${share}%`:'—'}</div><div class="ggx-capital-meter"><i class="${a.vclass}" style="width:${share}%"></i></div><p>${a.vclass==='hold'?'The model says stop before adding more sunk diligence cost.':a.vclass==='conditional'?'Prove the weakest dependency before materially increasing spend.':'The site clears the current screen, but written utility evidence should still precede irreversible commitments.'}</p></div>`;
    const stress=gate.querySelector('#ggxStress');(stress||gate.querySelector('#ggxFlip'))?.insertAdjacentElement('afterend',box);
  };
  G.afterAnalysis(render);const a=G.analysis(),r=G.current();if(a&&r)setTimeout(()=>render(a,r),160);
})();