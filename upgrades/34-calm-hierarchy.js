'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  const KEY='gage-grid-view-density';
  const secondaryIds=['ggxDiligence','ggxStress','ggxConfidence','ggxLedger','ggxTop3','ggOsFailureEnvelope','ggOsVerificationSpine'];
  let moving=false;
  function ensureDrawer(){
    const gate=document.getElementById('decision-gate');if(!gate)return null;
    let drawer=gate.querySelector('#ggCalmDeep');
    if(!drawer){
      drawer=document.createElement('details');drawer.id='ggCalmDeep';drawer.className='gg-calm-deep';
      drawer.innerHTML='<summary><div><span>DEEP ANALYSIS</span><b>Stress, evidence, assumptions & diligence</b></div><i>OPEN</i></summary><div id="ggCalmDeepBody" class="gg-calm-deep-body"></div>';
      gate.appendChild(drawer);
    }
    return drawer;
  }
  function organize(){
    if(moving)return;const gate=document.getElementById('decision-gate');if(!gate)return;moving=true;
    const drawer=ensureDrawer(),body=drawer?.querySelector('#ggCalmDeepBody');
    secondaryIds.forEach(id=>{const node=gate.querySelector(`#${id}`);if(node&&body&&node.parentElement!==body)body.appendChild(node)});
    const count=secondaryIds.filter(id=>document.getElementById(id)).length;
    const summary=drawer?.querySelector('summary b');if(summary)summary.textContent=count?`${count} supporting modules — hidden until needed`:'Stress, evidence, assumptions & diligence';
    moving=false;
  }
  function installToggle(){
    const board=document.getElementById('ggOsSwitchboard');if(!board||document.getElementById('ggCalmDensity'))return;
    const actions=board.querySelector('.gg-os-switch-actions');if(!actions)return;
    const button=document.createElement('button');button.type='button';button.id='ggCalmDensity';button.textContent='FULL DETAIL';actions.appendChild(button);
    let saved='calm';try{saved=localStorage.getItem(KEY)||'calm'}catch(_e){}
    const apply=mode=>{const full=mode==='full';document.body.classList.toggle('gg-density-full',full);document.body.classList.toggle('gg-density-calm',!full);button.textContent=full?'ESSENTIAL VIEW':'FULL DETAIL';try{localStorage.setItem(KEY,mode)}catch(_e){}};
    apply(saved);button.addEventListener('click',()=>apply(document.body.classList.contains('gg-density-full')?'calm':'full'));
  }
  function install(){document.body.classList.add('gg-density-calm');installToggle();const gate=document.getElementById('decision-gate');if(gate){const obs=new MutationObserver(()=>setTimeout(organize,0));obs.observe(gate,{childList:true,subtree:false})}setTimeout(organize,250)}
  G.injectStyle('gg-calm-hierarchy-style',`
    .gg-survey .ggx-mission-strip{display:none!important}.gg-survey .mini-metrics{max-height:58px;overflow:hidden}.gg-survey .mini-metrics div{padding:13px 18px!important}.gg-survey .mini-metrics b{font-size:17px!important}.gg-survey .mini-metrics span{font-size:7px!important}
    .gg-survey .head{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(280px,440px)!important;gap:40px!important}.gg-survey .head h2{font-size:clamp(32px,3.8vw,54px)!important}.gg-survey .workbench{grid-template-columns:minmax(340px,390px) 1fr!important}.gg-survey .inputs{padding:22px!important}.gg-survey .results{padding:22px!important}.gg-survey .field{margin-bottom:12px!important}.gg-survey .field input,.gg-survey .field select{padding:10px!important}.gg-survey .analyse{height:46px!important}.gg-survey .ggx-brief{padding:14px!important}.gg-survey .ggx-brief textarea{min-height:82px!important}.gg-survey .ggx-gate-head{padding:24px!important}.gg-survey .ggx-gate-head h2{font-size:clamp(28px,3.5vw,48px)!important}.gg-survey .ggx-gate-grid article{padding:14px!important}.gg-survey .ggx-system-bars{padding:16px 18px!important}.gg-survey .ggx-system-bars-head h3{font-size:18px!important}.gg-survey .ggx-system-row{padding:7px 0!important}
    .gg-calm-deep{border-top:1px solid #ccd5d9;background:#f7f9fa}.gg-calm-deep>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 20px;cursor:pointer}.gg-calm-deep>summary::-webkit-details-marker{display:none}.gg-calm-deep>summary div{display:grid;gap:4px}.gg-calm-deep>summary span{color:var(--sv-orange)!important;font:800 7px var(--sv-mono);letter-spacing:.13em}.gg-calm-deep>summary b{color:#4b5961;font:700 9px var(--sv-mono)}.gg-calm-deep>summary i{font:800 7px var(--sv-mono);font-style:normal;color:var(--sv-blue)}.gg-calm-deep[open]>summary{border-bottom:1px solid #ccd5d9}.gg-calm-deep[open]>summary i{font-size:0}.gg-calm-deep[open]>summary i:after{content:'CLOSE';font:800 7px var(--sv-mono)}.gg-calm-deep-body>*{margin:0!important}.gg-calm-deep-body>*+*{border-top:1px solid #d6dde1!important}
    .gg-density-calm .gg-calm-deep{margin-top:0}.gg-density-calm #ggOsFailureEnvelope,.gg-density-calm #ggxTop3,.gg-density-calm #ggxLedger,.gg-density-calm #ggxConfidence,.gg-density-calm #ggxStress,.gg-density-calm #ggxDiligence,.gg-density-calm #ggOsVerificationSpine{display:block}.gg-density-calm .gg-os-deck{margin-top:38px!important}.gg-density-calm .gg-os-deck-head>div b{font-size:8px!important;font-weight:600!important}.gg-density-calm .gg-os-deck-head nav{gap:4px!important}.gg-density-calm .gg-os-deck-head button{padding:8px 10px!important}.gg-density-calm .gg-os-switchboard{position:relative!important;top:auto!important}.gg-density-calm .gg-os-switch-cells>div:nth-child(4){display:none!important}.gg-density-calm .gg-os-switch-cells{grid-template-columns:repeat(4,1fr)!important}
    .gg-density-full #ggCalmDeep{open:true}.gg-density-full .gg-calm-deep>summary{background:#eef2f4}.gg-density-full .gg-calm-deep-body{display:block!important}.gg-density-full .mini-metrics{max-height:none}.gg-density-full .gg-os-switch-cells>div:nth-child(4){display:grid!important}.gg-density-full .gg-os-switch-cells{grid-template-columns:repeat(5,1fr)!important}
    @media(max-width:950px){.gg-survey .head{grid-template-columns:1fr!important;gap:14px!important}.gg-survey .workbench{grid-template-columns:1fr!important}.gg-survey .inputs{border-right:0!important;border-bottom:1px solid #b9c3c9!important}.gg-density-calm .gg-os-switch-cells{grid-template-columns:repeat(2,1fr)!important}}
  `);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  G.afterAnalysis(()=>setTimeout(organize,220));
})();