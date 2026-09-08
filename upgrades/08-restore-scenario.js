'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  function restore(){
    const p=new URLSearchParams(location.search);if(!p.size)return;
    const map={pt:'projectType',s:'siteSelect',pw:'powerReq',w:'waterReq',ww:'wasteReq',g:'gasReq',f:'fiberReq',rd:'powerRedundancy',t:'timeline',r:'risk',gr:'growth',cap:'capitalExposure'};
    Object.entries(map).forEach(([key,id])=>{const el=document.getElementById(id);if(el&&p.has(key))el.value=p.get(key)});
    if(p.has('brief')){const brief=document.getElementById('ggxBrief');if(brief){brief.value=p.get('brief')||'';brief.dispatchEvent(new Event('input',{bubbles:true}))}}
    const type=document.getElementById('projectType');if(type&&p.has('pt'))type.dispatchEvent(new Event('change',{bubbles:true}));
    window.setTimeout(()=>{
      const site=document.getElementById('siteSelect');if(site&&p.has('s'))site.value=p.get('s');
      try{updateRankSummary()}catch(_e){}
      if(p.has('s')&&document.getElementById('analyseBtn')){document.getElementById('analyseBtn').click();G.toast('Shared scenario restored')}
    },120);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore,{once:true});else restore();
})();