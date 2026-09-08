'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('ggx-flip-style',`
    .ggx-flip{padding:20px;border-bottom:1px solid #454b40;background:linear-gradient(90deg,rgba(202,255,66,.035),transparent 45%)}.ggx-flip h3{margin:6px 0 14px;font:600 22px/1 Georgia,serif}.ggx-flip-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.ggx-flip-card{border:1px solid #383e35;background:#131610;padding:14px}.ggx-flip-card b{display:block;margin:8px 0 5px;font-size:16px}.ggx-flip-card p{margin:0;color:#9ca296;font-size:10px;line-height:1.5}.ggx-flip-card strong{color:#caff42}@media(max-width:760px){.ggx-flip-grid{grid-template-columns:1fr}}
  `);
  const render=(a,req)=>{
    const gate=document.getElementById('decision-gate');if(!gate||!a||!req)return;
    gate.querySelector('#ggxFlip')?.remove();
    const ranking=G.rank(req),leader=ranking[0],runner=ranking[1];
    const capacityChange=a.worst.ratio<1?Math.ceil((1-a.worst.ratio)*100):Math.ceil((a.worst.ratio-1)*100);
    const timelineGap=Math.max(0,a.s.lead-req.timeline);
    const scoreGap=leader&&runner?leader.low-runner.low:0;
    const box=document.createElement('section');box.id='ggxFlip';box.className='ggx-flip';
    box.innerHTML=`<span>DECISION FLIP CONDITIONS</span><h3>What would materially change the ranking?</h3><div class="ggx-flip-grid">
      <div class="ggx-flip-card"><small>CAPACITY</small><b>${G.esc(a.worst.name)}</b><p>${a.worst.ratio<1?`Roughly <strong>${capacityChange}%</strong> more risk-adjusted usable capacity, or the same reduction in project demand, gets the weakest dependency to modeled coverage.`:`A loss of roughly <strong>${capacityChange}%</strong> of current buffer would push the weakest dependency toward the requirement line.`}</p></div>
      <div class="ggx-flip-card"><small>TIMING</small><b>${timelineGap?`${timelineGap} month gap`:'Inside window'}</b><p>${timelineGap?`Pulling the modeled utility lead time forward by <strong>${timelineGap} months</strong> would remove the current timing failure.`:`The site currently clears the selected timing window. A schedule compression of about <strong>${Math.max(1,req.timeline-a.s.lead)} months</strong> would erase that buffer.`}</p></div>
      <div class="ggx-flip-card"><small>RANKING</small><b>${leader&&runner?`${G.esc(leader.s.name)} vs ${G.esc(runner.s.name)}`:'Pilot leader'}</b><p>${leader&&runner?`Only <strong>${Math.abs(scoreGap)} conservative-score points</strong> separate #1 and #2. Any new utility evidence should trigger a rerank.`:'More site evidence is needed before a ranking flip can be estimated.'}</p></div>
    </div>`;
    const winner=gate.querySelector('#ggxWinnerWhy');(winner||gate.querySelector('.ggx-switch'))?.insertAdjacentElement('afterend',box);
  };
  G.afterAnalysis(render);const a=G.analysis(),r=G.current();if(a&&r)setTimeout(()=>render(a,r),100);
})();