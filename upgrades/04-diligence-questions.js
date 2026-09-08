'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('ggx-diligence-style',`
    .ggx-diligence{padding:20px;border-bottom:1px solid #454b40;background:#10130f}.ggx-diligence-head{display:flex;justify-content:space-between;gap:20px;align-items:center}.ggx-diligence h3{margin:6px 0 0;font:600 22px/1 Georgia,serif}.ggx-diligence button{border:1px solid #caff42;background:transparent;color:#caff42;padding:10px 12px;font:800 9px ui-monospace,SFMono-Regular,Menlo,monospace;cursor:pointer}.ggx-diligence-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}.ggx-diligence details{border:1px solid #363c33;background:#141711;padding:12px}.ggx-diligence summary{cursor:pointer;font:800 10px ui-monospace,SFMono-Regular,Menlo,monospace}.ggx-diligence details.priority{border-color:#caff42}.ggx-diligence ol{margin:10px 0 0;padding-left:18px;color:#b6bcb0;font-size:10px;line-height:1.65}@media(max-width:760px){.ggx-diligence-grid{grid-template-columns:1fr}.ggx-diligence-head{align-items:flex-start;flex-direction:column}}
  `);
  const banks={
    Power:['Can you confirm firm MW available at the exact parcel today?','What substation, feeder or transmission upgrades are required for this load?','What is the earliest credible energization date and what could move it?','Is the second feed electrically independent or does it share a common failure point?'],
    Water:['What firm MGD can be delivered at the parcel at required pressure?','Does the stated capacity include fire flow and peak-day conditions?','Are allocation, drought or storage constraints relevant to this project?'],
    Wastewater:['What firm collection-system capacity exists at the parcel, not only plant headroom?','Are there trunk, lift-station or interceptor constraints?','What industrial discharge or pretreatment limits apply?'],
    Gas:['What firm MMBtu/h and pressure are available at the parcel?','Is reinforcement required and who pays for it?','Would service be firm or interruptible under peak conditions?'],
    Fiber:['How many physically diverse carrier routes can be proven to the building entrance?','Do the routes share conduit, poles, bridges or common central-office dependencies?','What lateral construction and carrier delivery lead time should be assumed?'],
    'Power redundancy':['Can the required feed topology be delivered without a common substation or corridor?','What utility-side equipment remains a shared point of failure?','What outage and maintenance conditions would defeat the redundancy design?']
  };
  const render=(a)=>{
    const gate=document.getElementById('decision-gate');if(!gate||!a)return;
    gate.querySelector('#ggxDiligence')?.remove();
    const ordered=[a.worst.name,...Object.keys(banks).filter(x=>x!==a.worst.name)];
    const box=document.createElement('section');box.id='ggxDiligence';box.className='ggx-diligence';
    const all=[];
    box.innerHTML=`<div class="ggx-diligence-head"><div><span>DILIGENCE ORDER</span><h3>Ask the questions that can actually kill the deal.</h3></div><button type="button" id="ggxCopyQuestions">COPY ALL QUESTIONS</button></div><div class="ggx-diligence-grid">${ordered.map((name,index)=>{const qs=banks[name]||[];qs.forEach(q=>all.push(`${name}: ${q}`));return `<details class="${index===0?'priority':''}" ${index===0?'open':''}><summary>${index===0?'PRIORITY · ':''}${G.esc(name.toUpperCase())}</summary><ol>${qs.map(q=>`<li>${G.esc(q)}</li>`).join('')}</ol></details>`}).join('')}</div>`;
    const target=gate.querySelector('#ggxSystemBars')||gate.querySelector('.ggx-proof');target?.insertAdjacentElement('afterend',box);
    box.querySelector('#ggxCopyQuestions')?.addEventListener('click',()=>G.copy(all.join('\n')));
  };
  G.afterAnalysis(render);const a=G.analysis();if(a)setTimeout(()=>render(a),110);
})();