'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('ggx-winner-style',`
    .ggx-winner{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#42483e;border-bottom:1px solid #454b40}.ggx-winner>div{background:#12150f;padding:20px}.ggx-winner h3{margin:6px 0 10px;font:600 22px/1.05 Georgia,serif}.ggx-winner p{margin:0;color:#a4aa9f;font-size:10px;line-height:1.65}.ggx-winner .edge{color:#caff42}.ggx-winner ul{margin:10px 0 0;padding-left:18px;color:#e9e7df;font-size:10px;line-height:1.6}@media(max-width:760px){.ggx-winner{grid-template-columns:1fr}}
  `);
  function reasons(a,b){
    const out=[];
    if(!b)return ['It is the strongest current pilot match.'];
    if(a.low>b.low)out.push(`${a.low-b.low} points stronger on the conservative end of the score range.`);
    if(a.s.lead<b.s.lead)out.push(`${b.s.lead-a.s.lead} months faster modeled service timing.`);
    if(a.worst.ratio>b.worst.ratio)out.push(`More room on the weakest dependency (${a.worst.ratio.toFixed(2)}× vs ${b.worst.ratio.toFixed(2)}×).`);
    if(a.s.confidence>b.s.confidence)out.push(`Stronger underlying site evidence confidence (${a.s.confidence}% vs ${b.s.confidence}%).`);
    if(a.vclass!==b.vclass)out.push(`A stronger decision class: ${a.verdict} vs ${b.verdict}.`);
    return out.slice(0,3).length?out.slice(0,3):['The result is close; ranking is being decided by the combined capacity, timing and evidence model.'];
  }
  const render=()=>{
    const gate=document.getElementById('decision-gate'),req=G.current(),ranking=G.rank(req);if(!gate||ranking.length<1)return;
    gate.querySelector('#ggxWinnerWhy')?.remove();
    const winner=ranking[0],runner=ranking[1];
    const current=G.analysis();
    const box=document.createElement('section');box.id='ggxWinnerWhy';box.className='ggx-winner';
    box.innerHTML=`<div><span>WHY #1 WINS</span><h3>${G.esc(winner.s.name)} <span class="edge">leads the pilot.</span></h3><ul>${reasons(winner,runner).map(x=>`<li>${G.esc(x)}</li>`).join('')}</ul></div><div><span>YOUR CURRENT SITE</span><h3>${G.esc(current?.s?.name||winner.s.name)}</h3><p>${current?.s?.id===winner.s.id?'You are already screening the current leader. The next decision is whether the weakest dependency can be proven.':`The current site trails ${G.esc(winner.s.name)}. Gage Grid is separating site preference from project fit so you can decide whether switching is worth the diligence reset.`}</p></div>`;
    const switcher=gate.querySelector('.ggx-switch');switcher?.insertAdjacentElement('afterend',box);
  };
  G.afterAnalysis(render);if(G.analysis())setTimeout(render,90);
})();