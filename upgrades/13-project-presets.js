'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('ggx-presets-style',`
    .ggx-presets{margin:10px 0 0}.ggx-presets>span{display:block;margin-bottom:7px;font:800 8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;color:#7f8678}.ggx-preset-row{display:flex;gap:6px;flex-wrap:wrap}.ggx-preset-row button{border:1px solid #41473d;background:#141711;color:#c7ccbf;padding:7px 9px;font:800 8px ui-monospace,SFMono-Regular,Menlo,monospace;cursor:pointer}.ggx-preset-row button:hover{border-color:#caff42;color:#caff42}
  `);
  function install(){
    const brief=document.querySelector('.ggx-brief');if(!brief||document.getElementById('ggxPresets'))return;
    const wrap=document.createElement('div');wrap.id='ggxPresets';wrap.className='ggx-presets';
    const presets=[
      ['DATA CENTER','45 MW data center in Illinois, online within 24 months, diverse power feeds and carrier-dense fiber required.'],
      ['MANUFACTURING','18 MW advanced manufacturing plant in Indiana, 0.75 MGD water, 0.58 MGD wastewater, online within 24 months.'],
      ['SEMICONDUCTOR','62 MW semiconductor fab in Illinois, 2.2 MGD water, 1.55 MGD wastewater, diverse feeds, online within 36 months.'],
      ['FOOD','Food processing plant in Indiana, 7 MW power, 1.4 MGD water, 1.15 MGD wastewater, online within 24 months.'],
      ['WAREHOUSE','3.5 MW distribution warehouse in Illinois, standard utilities, online within 12 months.']
    ];
    wrap.innerHTML=`<span>QUICK PROJECT STARTS</span><div class="ggx-preset-row">${presets.map((p,i)=>`<button type="button" data-i="${i}">${p[0]}</button>`).join('')}</div>`;
    const status=document.getElementById('ggxBriefStatus');status?.insertAdjacentElement('afterend',wrap);
    wrap.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button)return;const preset=presets[Number(button.dataset.i)];if(!preset)return;
      const input=document.getElementById('ggxBrief');input.value=preset[1];input.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('ggxAuto')?.click();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();