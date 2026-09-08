'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.buildScenarioUrl=()=>{
    const req=G.current();if(!req)return location.href;
    const q=new URLSearchParams();
    const pairs={pt:req.projectType,s:document.getElementById('siteSelect')?.value,pw:req.power,w:req.water,ww:req.waste,g:req.gas,f:req.fiber,rd:req.redundancy,t:req.timeline,r:req.risk,gr:Math.round(req.growth*100),cap:req.capital};
    Object.entries(pairs).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')q.set(k,String(v))});
    const brief=document.getElementById('ggxBrief')?.value.trim();if(brief)q.set('brief',brief);
    return `${location.origin}${location.pathname}?${q.toString()}#screen`;
  };
  const render=()=>{
    const actions=document.getElementById('ggxMemoActions');if(!actions||document.getElementById('ggxShareScenario'))return;
    const button=document.createElement('button');button.id='ggxShareScenario';button.type='button';button.textContent='COPY SHARE LINK';actions.appendChild(button);
    button.addEventListener('click',()=>G.copy(G.buildScenarioUrl()));
  };
  G.afterAnalysis(render);if(G.analysis())setTimeout(render,140);
})();