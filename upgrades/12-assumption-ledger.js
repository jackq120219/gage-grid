'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('ggx-ledger-style',`
    .ggx-ledger{padding:20px;border-bottom:1px solid #454b40;background:#0e110d}.ggx-ledger details{border:1px solid #353a31;background:#131610}.ggx-ledger summary{cursor:pointer;padding:14px 16px;font:800 10px ui-monospace,SFMono-Regular,Menlo,monospace;color:#caff42}.ggx-ledger-table{display:grid;grid-template-columns:1.2fr .8fr .8fr}.ggx-ledger-table>div{padding:10px 14px;border-top:1px solid #30352d;font-size:10px}.ggx-ledger-table .head{font:800 8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.07em;color:#7e8678}.ggx-ledger-table .source{color:#aab1a3}.ggx-ledger-table .user{color:#caff42}@media(max-width:600px){.ggx-ledger-table{grid-template-columns:1fr 1fr}.ggx-ledger-table>div:nth-child(3n+3){display:none}}
  `);
  const explicit=(brief,rx)=>rx.test(brief)?'User-specified':'Category baseline';
  const render=(a,req)=>{
    const gate=document.getElementById('decision-gate');if(!gate||!a||!req)return;
    gate.querySelector('#ggxLedger')?.remove();
    const brief=(document.getElementById('ggxBrief')?.value||'').toLowerCase();
    const rows=[
      ['Peak power',`${req.power} MW`,explicit(brief,/\d+(?:\.\d+)?\s*(?:mw|gw)/)],
      ['Water',`${req.water} MGD`,explicit(brief,/water[^.]{0,25}\d|\d+(?:\.\d+)?\s*mgd\s*water/)],
      ['Wastewater',`${req.waste} MGD`,explicit(brief,/wastewater|sewer|discharge/)],
      ['Gas',`${req.gas} MMBtu/h`,explicit(brief,/mmbtu|natural gas/)],
      ['Fiber',`Level ${req.fiber}`,explicit(brief,/fiber|carrier|mission critical/)],
      ['Power redundancy',`Level ${req.redundancy}`,explicit(brief,/dual|diverse|redundan|single feed/)],
      ['Online window',`${req.timeline} months`,explicit(brief,/within|online|q[1-4]|20\d{2}|months?/)],
      ['24-month growth',`${Math.round(req.growth*100)}%`,explicit(brief,/%\s*(?:load\s*)?growth/)],
      ['Pre-development capital',G.money(req.capital),explicit(brief,/\$\s*[\d,.]+/)]
    ];
    const box=document.createElement('section');box.id='ggxLedger';box.className='ggx-ledger';
    box.innerHTML=`<details><summary>ASSUMPTION LEDGER — SEE EXACTLY WHAT THE MODEL USED</summary><div class="ggx-ledger-table"><div class="head">VARIABLE</div><div class="head">VALUE</div><div class="head">SOURCE</div>${rows.map(row=>`<div>${G.esc(row[0])}</div><div>${G.esc(row[1])}</div><div class="source ${row[2]==='User-specified'?'user':''}">${G.esc(row[2])}</div>`).join('')}</div></details>`;
    const confidence=gate.querySelector('#ggxConfidence');(confidence||gate.querySelector('#ggxCapital'))?.insertAdjacentElement('afterend',box);
  };
  G.afterAnalysis(render);const a=G.analysis(),r=G.current();if(a&&r)setTimeout(()=>render(a,r),180);
})();