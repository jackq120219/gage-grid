'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  G.injectStyle('ggx-system-bars-style',`
    .ggx-system-bars{padding:20px;border-bottom:1px solid #454b40;background:#0d0f0c}.ggx-system-bars-head{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:14px}.ggx-system-bars-head h3{margin:4px 0 0;font:600 22px/1 Georgia,serif}.ggx-system-bars-head p{max-width:620px;margin:0;color:#8e9588;font-size:10px;line-height:1.5}.ggx-system-row{display:grid;grid-template-columns:120px minmax(140px,1fr) 92px 120px;gap:12px;align-items:center;padding:8px 0;border-top:1px solid #2d322b}.ggx-system-row:first-of-type{border-top:0}.ggx-system-name{font:800 9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em}.ggx-system-track{height:8px;background:#272c24;position:relative;overflow:hidden}.ggx-system-track i{display:block;height:100%;background:#caff42}.ggx-system-track i.warn{background:#f1b74a}.ggx-system-track i.fail{background:#ff6b66}.ggx-system-ratio{font:800 10px ui-monospace,SFMono-Regular,Menlo,monospace;text-align:right}.ggx-system-gap{font-size:10px;color:#aeb4a8;text-align:right}@media(max-width:720px){.ggx-system-bars-head{align-items:start;flex-direction:column}.ggx-system-row{grid-template-columns:90px 1fr 60px}.ggx-system-gap{grid-column:2/4;text-align:left}}
  `);
  const render=(a)=>{
    const gate=document.getElementById('decision-gate');if(!gate||!a?.rows?.length)return;
    gate.querySelector('#ggxSystemBars')?.remove();
    const box=document.createElement('section');box.id='ggxSystemBars';box.className='ggx-system-bars';
    const rows=a.rows.map(row=>{
      const ratio=Number(row.ratio)||0,pct=Math.min(100,Math.max(3,ratio/1.5*100));
      const cls=ratio<.8?'fail':ratio<1.15?'warn':'';
      const gap=row.gap>=0?`+${Math.round((ratio-1)*100)}% buffer`:`${Math.round((1-ratio)*100)}% short`;
      return `<div class="ggx-system-row"><div class="ggx-system-name">${G.esc(row.name)}</div><div class="ggx-system-track"><i class="${cls}" style="width:${pct.toFixed(1)}%"></i></div><div class="ggx-system-ratio">${ratio.toFixed(2)}×</div><div class="ggx-system-gap">${G.esc(gap)}</div></div>`;
    }).join('');
    box.innerHTML=`<div class="ggx-system-bars-head"><div><span>ALL DEPENDENCIES</span><h3>Where the project has room — and where it does not.</h3></div><p>1.00× is the modeled requirement after evidence discounting. Gage Grid keeps the weakest dependency visible so a strong utility cannot hide a fatal one.</p></div>${rows}`;
    const proof=gate.querySelector('.ggx-proof');gate.insertBefore(box,proof||null);
  };
  G.afterAnalysis(render);const a=G.analysis();if(a)setTimeout(()=>render(a),80);
})();