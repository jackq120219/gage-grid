'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('ggx-validation-style',`
    .ggx-invalid{border-color:#ff6b66!important;box-shadow:0 0 0 2px rgba(255,107,102,.08)!important}.ggx-validation-note{display:none;margin:10px 0 0;padding:10px 12px;border:1px solid #6a3936;background:#1a1210;color:#ffb0ab;font-size:10px;line-height:1.5}.ggx-validation-note.show{display:block}
  `);
  function install(){
    const run=document.getElementById('analyseBtn');if(!run||document.getElementById('ggxValidationNote'))return;
    const note=document.createElement('div');note.id='ggxValidationNote';note.className='ggx-validation-note';run.insertAdjacentElement('afterend',note);
    const ids=['powerReq','waterReq','wasteReq','gasReq','growth','capitalExposure'];
    ids.forEach(id=>document.getElementById(id)?.addEventListener('input',event=>event.currentTarget.classList.remove('ggx-invalid')));
    run.addEventListener('click',event=>{
      const problems=[];const power=Number(document.getElementById('powerReq')?.value),timeline=Number(document.getElementById('timeline')?.value),site=document.getElementById('siteSelect')?.value;
      if(!Number.isFinite(power)||power<=0){problems.push('Peak power must be greater than 0 MW.');document.getElementById('powerReq')?.classList.add('ggx-invalid')}
      if(!Number.isFinite(timeline)||timeline<=0)problems.push('Choose a valid required online window.');
      if(!site)problems.push('Choose a pilot site before running the screen.');
      ['waterReq','wasteReq','gasReq','growth','capitalExposure'].forEach(id=>{const el=document.getElementById(id),value=Number(el?.value);if(!Number.isFinite(value)||value<0){problems.push(`${id.replace(/Req$/,'').replace(/([A-Z])/g,' $1')} cannot be negative.`);el?.classList.add('ggx-invalid')}});
      if(problems.length){event.stopImmediatePropagation();note.innerHTML=`<b>FIX BEFORE SCREENING</b><br>${problems.map(G.esc).join('<br>')}`;note.classList.add('show');note.scrollIntoView({behavior:'smooth',block:'center'});G.toast('Fix project inputs before screening')}
      else note.classList.remove('show');
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();