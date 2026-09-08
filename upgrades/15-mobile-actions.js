'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('ggx-mobile-actions-style',`
    .ggx-mobile-actions{display:none}@media(max-width:760px){body{padding-bottom:68px}.ggx-mobile-actions{position:fixed;left:10px;right:10px;bottom:10px;z-index:1200;display:grid;grid-template-columns:1fr 1.2fr .8fr;gap:6px;padding:7px;background:rgba(16,18,14,.96);border:1px solid #4a5144;backdrop-filter:blur(12px);box-shadow:0 12px 40px rgba(0,0,0,.38)}.ggx-mobile-actions button{min-height:43px;border:1px solid #50584a;background:#181b15;color:#f2efe7;font:800 8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.03em}.ggx-mobile-actions button.primary{background:#caff42;border-color:#caff42;color:#12130f}}
  `);
  function install(){
    if(document.getElementById('ggxMobileActions'))return;
    const bar=document.createElement('div');bar.id='ggxMobileActions';bar.className='ggx-mobile-actions';bar.innerHTML='<button type="button" data-action="run">RUN SCREEN</button><button class="primary" type="button" data-action="best">FIND BEST SITE</button><button type="button" data-action="gate">RESULT</button>';document.body.appendChild(bar);
    bar.addEventListener('click',event=>{
      const action=event.target.closest('button')?.dataset.action;
      if(action==='run')document.getElementById('analyseBtn')?.click();
      if(action==='best')document.getElementById('ggxBest')?.click();
      if(action==='gate'){
        const gate=document.getElementById('decision-gate');
        (gate&&!gate.classList.contains('hidden')?gate:document.getElementById('screen'))?.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();