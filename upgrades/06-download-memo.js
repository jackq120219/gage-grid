'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  const render=()=>{
    const actions=document.getElementById('ggxMemoActions');if(!actions||document.getElementById('ggxDownloadMemo'))return;
    const button=document.createElement('button');button.id='ggxDownloadMemo';button.type='button';button.textContent='DOWNLOAD MEMO .TXT';actions.appendChild(button);
    button.addEventListener('click',()=>{
      const text=typeof G.buildMemo==='function'?G.buildMemo():'';if(!text)return G.toast('Run a site screen first');
      const a=G.analysis(),slug=(a?.s?.name||'site').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const blob=new Blob([text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download=`gage-grid-${slug}-decision-memo.txt`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);G.toast('Decision memo downloaded');
    });
  };
  G.afterAnalysis(render);if(G.analysis())setTimeout(render,130);
})();