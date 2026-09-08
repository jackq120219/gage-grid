'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('ggx-stress-style',`
    .ggx-stress{padding:20px;border-bottom:1px solid #454b40;background:#0f120e}.ggx-stress-head{display:flex;justify-content:space-between;gap:20px;align-items:end}.ggx-stress h3{margin:6px 0 0;font:600 22px/1 Georgia,serif}.ggx-stress-output{text-align:right}.ggx-stress-output b{display:block;font:800 22px ui-monospace,SFMono-Regular,Menlo,monospace;color:#caff42}.ggx-stress-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:16px}.ggx-stress label{display:flex;justify-content:space-between;gap:12px;font:800 9px ui-monospace,SFMono-Regular,Menlo,monospace}.ggx-stress input[type=range]{width:100%;accent-color:#caff42;margin-top:8px}.ggx-stress small{display:block;margin-top:5px;color:#858c7f;font-size:9px}@media(max-width:700px){.ggx-stress-grid{grid-template-columns:1fr}.ggx-stress-head{align-items:start;flex-direction:column}.ggx-stress-output{text-align:left}}
  `);
  const render=(a,req)=>{
    const gate=document.getElementById('decision-gate');if(!gate||!a||!req)return;
    gate.querySelector('#ggxStress')?.remove();
    const box=document.createElement('section');box.id='ggxStress';box.className='ggx-stress';
    box.innerHTML=`<div class="ggx-stress-head"><div><span>LIVE STRESS TEST</span><h3>How much bad news can this site absorb?</h3></div><div class="ggx-stress-output"><small>STRESSED RESULT</small><b id="ggxStressVerdict">${G.esc(a.verdict)}</b><span id="ggxStressRange">${a.low}–${a.high}</span></div></div><div class="ggx-stress-grid"><div><label>EXTRA LOAD <b id="ggxLoadStressLabel">+0%</b></label><input id="ggxLoadStress" type="range" min="0" max="50" step="5" value="0"><small>Adds to the project growth assumption across utility loads.</small></div><div><label>DEADLINE COMPRESSION <b id="ggxTimeStressLabel">0 mo</b></label><input id="ggxTimeStress" type="range" min="0" max="18" step="3" value="0"><small>Tests the site against a tighter required online window.</small></div></div>`;
    const flip=gate.querySelector('#ggxFlip');(flip||gate.querySelector('.ggx-switch'))?.insertAdjacentElement('afterend',box);
    const update=()=>{
      const load=Number(box.querySelector('#ggxLoadStress')?.value||0),cut=Number(box.querySelector('#ggxTimeStress')?.value||0);
      box.querySelector('#ggxLoadStressLabel').textContent=`+${load}%`;box.querySelector('#ggxTimeStressLabel').textContent=`${cut} mo`;
      const stressed={...req,growth:req.growth+load/100,timeline:Math.max(6,req.timeline-cut)};
      let result;try{result=analyzeSite(a.s,stressed,false)}catch(_e){return}
      box.querySelector('#ggxStressVerdict').textContent=result.verdict;box.querySelector('#ggxStressRange').textContent=`${result.low}–${result.high} · weakest ${result.worst.name}`;
      box.dataset.state=result.vclass;
    };
    box.querySelectorAll('input').forEach(input=>input.addEventListener('input',update));update();
  };
  G.afterAnalysis(render);const a=G.analysis(),r=G.current();if(a&&r)setTimeout(()=>render(a,r),150);
})();