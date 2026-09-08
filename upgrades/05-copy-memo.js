'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.buildMemo=()=>{
    const a=G.analysis(),req=G.current(),rank=G.rank(req);if(!a||!req)return'';
    const leader=rank[0],runner=rank[1];
    const lines=[
      'GAGE GRID — PROJECT DECISION MEMO',
      `Site: ${a.s.name}, ${a.s.state}`,
      `Project: ${projectPresets?.[req.projectType]?.label||req.projectType}`,
      `Decision: ${a.verdict}`,
      `Defensible score range: ${a.low}–${a.high}`,
      `Weakest dependency: ${a.worst.name} (${a.worst.ratio.toFixed(2)}× modeled coverage)`,
      `Utility lead time: ${a.s.lead} months vs ${req.timeline}-month requirement`,
      `Evidence: ${a.s.evidence}; site confidence ${a.s.confidence}%`,
      `Capital exposure control estimate: ${G.money(a.atRisk)}`,
      leader?`Pilot leader: ${leader.s.name} (${leader.low}–${leader.high})`:'',
      runner?`Runner-up: ${runner.s.name} (${runner.low}–${runner.high})`:'',
      '',
      'NEXT ACTION',
      typeof nextStep==='function'?nextStep(a.worst,a.s):'Verify the weakest dependency in writing before further commitment.',
      '',
      'IMPORTANT',
      'This is a screening result using simulated pilot data, not a utility commitment or engineering determination.'
    ];
    return lines.filter((x,i)=>x!==''||lines[i-1]!=='').join('\n');
  };
  G.injectStyle('ggx-memo-copy-style',`.ggx-memo-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.ggx-memo-actions button{border:1px solid #697160;background:#161913;color:#f2efe7;padding:10px 12px;font:800 9px ui-monospace,SFMono-Regular,Menlo,monospace;cursor:pointer}.ggx-memo-actions button.primary{border-color:#caff42;color:#12130f;background:#caff42}`);
  const render=()=>{
    const gate=document.getElementById('decision-gate'),head=gate?.querySelector('.ggx-gate-head>div:first-child');if(!gate||!head)return;
    head.querySelector('#ggxMemoActions')?.remove();
    const actions=document.createElement('div');actions.id='ggxMemoActions';actions.className='ggx-memo-actions';actions.innerHTML='<button class="primary" type="button" id="ggxCopyMemo">COPY DECISION MEMO</button>';
    head.appendChild(actions);actions.querySelector('#ggxCopyMemo')?.addEventListener('click',()=>G.copy(G.buildMemo()));
  };
  G.afterAnalysis(render);if(G.analysis())setTimeout(render,120);
})();