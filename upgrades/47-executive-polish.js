'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const $=id=>document.getElementById(id);
  const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

  function installDocumentFeel(){
    document.documentElement.classList.add('gg-polished');
    document.body.classList.add('gg-executive-polish');
  }

  function revealNewSurfaces(){
    const targets=qa('.ggp-guided,.ggp-preference,#rank,#compare,#registry,#changes,#method,.saved-section,.access-panel').filter(el=>!el.dataset.polishReveal);
    if(!targets.length)return;
    targets.forEach(el=>{el.dataset.polishReveal='1';el.classList.add('gg-polish-reveal')});
    if(reduce||!('IntersectionObserver' in window)){targets.forEach(el=>el.classList.add('in'));return}
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');io.unobserve(entry.target)}}),{threshold:.06,rootMargin:'0px 0px -5% 0px'});
    targets.forEach(el=>io.observe(el));
  }

  function animateNumber(node,end,duration=420){
    if(!node||reduce||!Number.isFinite(end))return;
    const start=Math.max(0,end-8),t0=performance.now();
    const tick=now=>{const p=Math.min(1,(now-t0)/duration),e=1-Math.pow(1-p,3);node.textContent=String(Math.round(start+(end-start)*e));if(p<1)requestAnimationFrame(tick)};
    requestAnimationFrame(tick);
  }

  function animateResult(){
    const result=$('resultState');if(!result||result.classList.contains('hidden'))return;
    const score=result.querySelector('.score-inner b');const end=Number(score?.textContent);animateNumber(score,end);
    if(reduce)return;
    const pieces=[result.querySelector('.result-top'),result.querySelector('.result-grid'),result.querySelector('.ggp-deep-nav'),result.querySelector('.insight-grid'),result.querySelector('.constraint-list'),result.querySelector('.actions-row')].filter(Boolean);
    pieces.forEach((el,i)=>{el.animate([{opacity:.25,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,delay:i*34,easing:'cubic-bezier(.2,.72,.2,1)',fill:'both'})});
  }

  function animatePreferenceUpdates(){
    const ids=['ggpRecGrid','ggpTopRank','ggpViewPanel','ggpWhyNow','ggpRankingChange'];
    ids.forEach(id=>{const node=$(id);if(!node||node.dataset.polishObserved)return;node.dataset.polishObserved='1';let queued=false;new MutationObserver(()=>{if(reduce||queued)return;queued=true;requestAnimationFrame(()=>{queued=false;const children=node.children.length?Array.from(node.children):[node];children.slice(0,8).forEach((el,i)=>el.animate([{opacity:.55,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:250,delay:i*18,easing:'cubic-bezier(.2,.72,.2,1)'}))})}).observe(node,{childList:true})});
  }

  function bindActionFeedback(){
    const setup=(id,busy)=>{const btn=$(id);if(!btn||btn.dataset.polishAction)return;btn.dataset.polishAction='1';btn.addEventListener('click',()=>{const original=btn.textContent;btn.classList.remove('gg-action-done');btn.classList.add('gg-action-busy');btn.textContent=busy;window.setTimeout(()=>{btn.classList.remove('gg-action-busy');btn.classList.add('gg-action-done');btn.textContent=original;window.setTimeout(()=>btn.classList.remove('gg-action-done'),700)},420)},{capture:true})};
    setup('analyseBtn','ANALYZING SITE…');setup('rankAllBtn','RANKING SITES…');setup('loadDemoBtn','LOADING DEMO…');
  }

  function bindResultObserver(){
    const result=$('resultState');if(!result||result.dataset.polishObserved)return;result.dataset.polishObserved='1';let timer;new MutationObserver(muts=>{if(!muts.some(m=>m.type==='childList'))return;clearTimeout(timer);timer=setTimeout(()=>{animateResult();animatePreferenceUpdates();enhanceScoreHint()},25)}).observe(result,{childList:true,subtree:true});
  }

  function enhanceScoreHint(){
    const ring=document.querySelector('#resultState .score-ring');if(!ring||ring.dataset.polishHint)return;ring.dataset.polishHint='1';const hint=document.createElement('span');hint.className='gg-score-hint';hint.textContent='CLICK FOR SCORE LOGIC';ring.insertAdjacentElement('afterend',hint);
  }

  function bindPointerPolish(){
    if(reduce)return;
    qa('.ggp-rec-card,.site-card,.rank-row,.ggx-gate-grid article').forEach(card=>{if(card.dataset.polishPointer)return;card.dataset.polishPointer='1';card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.setProperty('--gg-tilt-x',`${x*2}px`);card.style.setProperty('--gg-tilt-y',`${y*2}px`)});card.addEventListener('pointerleave',()=>{card.style.removeProperty('--gg-tilt-x');card.style.removeProperty('--gg-tilt-y')})});
  }

  function installSectionIndex(){
    if($('ggPolishSectionIndex'))return;const pref=$('ggpPreference');if(!pref)return;const index=document.createElement('div');index.id='ggPolishSectionIndex';index.className='gg-polish-index';index.innerHTML='<span>DECISION FLOW</span><a href="#screen">01 Screen</a><a href="#ggpPreference">02 Prioritize</a><a href="#rank">03 Rank</a><a href="#compare">04 Compare</a><a href="#registry">05 Verify</a>';pref.insertAdjacentElement('beforebegin',index);
  }

  function tunePreferenceAccessibility(){
    qa('.ggp-slider input').forEach(input=>{const label=input.closest('label')?.querySelector('span')?.textContent||'Preference';input.setAttribute('aria-label',`${label} priority`)});
    qa('[data-preset],[data-whatif],[data-view]').forEach(btn=>btn.setAttribute('aria-pressed',btn.classList.contains('active')?'true':'false'));
    document.addEventListener('click',e=>{const btn=e.target.closest?.('[data-preset],[data-whatif],[data-view]');if(!btn)return;requestAnimationFrame(()=>qa('[data-preset],[data-whatif],[data-view]').forEach(x=>x.setAttribute('aria-pressed',x.classList.contains('active')?'true':'false')))});
  }

  G.injectStyle('gg-executive-polish-css',`
    html.gg-polished{scroll-behavior:smooth;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
    .gg-survey{--gg-shadow-1:0 8px 28px rgba(28,43,53,.055);--gg-shadow-2:0 16px 46px rgba(28,43,53,.075);--gg-focus:0 0 0 3px rgba(47,85,217,.14)}
    .gg-survey main{isolation:isolate}.gg-survey .shell{max-width:1320px}.gg-survey .section{margin-bottom:76px!important}.gg-survey .head{margin-bottom:26px!important}.gg-survey .head h2{letter-spacing:-.035em!important;line-height:.96!important}.gg-survey .head p{font-size:13px!important;line-height:1.62!important;max-width:52ch}.gg-survey .kicker{letter-spacing:.14em!important}.gg-survey .hero h1{letter-spacing:-.058em!important;text-wrap:balance}.gg-survey .hero-copy>p{font-size:15px!important;line-height:1.72!important}.gg-survey .hero-actions{gap:10px!important}.gg-survey .hero-stamp{line-height:1.55!important}
    .gg-survey button,.gg-survey a,.gg-survey input,.gg-survey select,.gg-survey textarea{outline:none}.gg-survey button:focus-visible,.gg-survey a:focus-visible,.gg-survey input:focus-visible,.gg-survey select:focus-visible,.gg-survey textarea:focus-visible,.gg-survey [role=button]:focus-visible{box-shadow:var(--gg-focus)!important;outline:1px solid var(--sv-blue)!important;outline-offset:2px!important}.gg-survey button,.gg-survey .btn,.gg-survey .smallbtn{font-weight:800!important;letter-spacing:.055em!important}.gg-survey .btn,.gg-survey .smallbtn,.gg-survey .analyse,.ggp-project-chips button,.ggp-preset-row button,.ggp-scenarios button,.ggp-view-tabs button{border-radius:2px!important;transition:transform .16s cubic-bezier(.2,.72,.2,1),box-shadow .16s ease,background .16s ease,border-color .16s ease,color .16s ease!important}.gg-survey .btn:hover,.gg-survey .smallbtn:hover,.ggp-project-chips button:hover,.ggp-preset-row button:hover,.ggp-scenarios button:hover,.ggp-view-tabs button:hover{transform:translateY(-1px);box-shadow:0 5px 13px rgba(36,53,64,.08)}.gg-survey .btn:active,.gg-survey .smallbtn:active,.ggp-project-chips button:active,.ggp-preset-row button:active,.ggp-scenarios button:active,.ggp-view-tabs button:active{transform:translateY(0);box-shadow:none}.gg-survey .analyse{position:relative;overflow:hidden;box-shadow:0 7px 18px rgba(47,85,217,.14)!important}.gg-survey .analyse:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(47,85,217,.2)!important}.gg-survey .analyse:after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,transparent 20%,rgba(255,255,255,.22),transparent 80%);translate:-120% 0}.gg-survey .analyse.gg-action-busy:after{animation:ggPolishSweep .7s linear infinite}.gg-action-busy{cursor:progress!important}.gg-action-done{box-shadow:0 0 0 2px rgba(31,139,107,.13)!important}
    .gg-survey .field label{letter-spacing:.075em!important}.gg-survey .field input,.gg-survey .field select,.gg-survey .filters input,.gg-survey .filters select,.gg-survey .ggx-brief textarea{border-radius:2px!important;min-height:42px;transition:border-color .16s,box-shadow .16s,background .16s!important;box-shadow:inset 0 1px 0 rgba(23,29,34,.025)}.gg-survey .field input:hover,.gg-survey .field select:hover,.gg-survey .filters input:hover,.gg-survey .filters select:hover,.gg-survey .ggx-brief textarea:hover{border-color:#9eabb2!important}.gg-survey .field input:focus,.gg-survey .field select:focus,.gg-survey .filters input:focus,.gg-survey .filters select:focus,.gg-survey .ggx-brief textarea:focus{background:#fff!important;box-shadow:var(--gg-focus)!important}.gg-survey .unit-input span{font-weight:700!important;color:#718088!important}
    .gg-survey .workbench,.gg-survey .ggx-gate,.gg-survey .gg-os-deck,.ggp-engine,.ggp-scenarios,.ggp-view-panel,.ggp-explain-grid article,.ggp-rec-card,.ggp-top-rank,.ggp-active-project{border-radius:3px!important;box-shadow:var(--gg-shadow-1)!important}.gg-survey .workbench,.ggp-engine{box-shadow:var(--gg-shadow-2)!important}.gg-survey .inputs,.gg-survey .results{min-height:100%}.gg-survey .result-top{gap:22px!important}.gg-survey .result-grid>div{padding:14px!important}.gg-survey .result-grid small{letter-spacing:.08em!important}.gg-survey .constraint{transition:background .15s ease,border-color .15s ease}.gg-survey .constraint:hover{background:#f5f8fa!important}.gg-survey .bar i,.gg-survey .fitbar i{transition:width .5s cubic-bezier(.2,.72,.2,1)!important}
    .ggp-active-project{margin-bottom:-1px;overflow:hidden;background:rgba(238,242,244,.94)!important;backdrop-filter:blur(12px)}.ggp-active-project>div{padding:12px 14px!important}.ggp-active-project b{font-size:11px!important;line-height:1.2}.ggp-paths button{border-radius:3px!important;box-shadow:0 5px 16px rgba(31,46,56,.035);transition:transform .18s,box-shadow .18s,border-color .18s!important}.ggp-paths button:hover{transform:translateY(-2px)!important;box-shadow:0 12px 28px rgba(31,46,56,.08)!important}.ggp-project-chips{margin-top:14px!important}.ggp-project-chips button,.ggp-preset-row button,.ggp-scenarios button,.ggp-view-tabs button{padding:9px 12px!important;background:rgba(255,255,255,.9)!important}.ggp-preset-row{gap:6px!important;margin-bottom:12px!important}.ggp-preset-row button.active,.ggp-view-tabs button.active{box-shadow:inset 0 -2px var(--sv-blue)!important}.ggp-scenarios button.active{border-color:var(--sv-orange)!important;color:#9f3f28!important;background:#fff3ef!important;box-shadow:inset 3px 0 var(--sv-orange)!important}
    .ggp-radar-card,.ggp-controls{padding:20px!important}.ggp-radar-card svg{margin-top:8px!important}.ggp-preference-poly,.ggp-capability-poly{filter:drop-shadow(0 4px 9px rgba(47,85,217,.07))}.ggp-handle{transition:r .12s ease,stroke-width .12s ease;filter:drop-shadow(0 2px 3px rgba(47,85,217,.16))}.ggp-handle:hover{r:9;stroke-width:3.5}.ggp-slider{grid-template-columns:165px 1fr 34px!important;padding:11px 0!important}.ggp-slider input{appearance:none;height:4px;border-radius:99px;background:linear-gradient(90deg,#c8d2d8,#e3e8eb);cursor:pointer}.ggp-slider input::-webkit-slider-thumb{appearance:none;width:15px;height:15px;border-radius:50%;background:#fff;border:3px solid var(--sv-blue);box-shadow:0 2px 5px rgba(47,85,217,.2);transition:transform .12s,box-shadow .12s}.ggp-slider input::-webkit-slider-thumb:hover{transform:scale(1.13);box-shadow:0 2px 8px rgba(47,85,217,.3)}.ggp-slider input::-moz-range-thumb{width:11px;height:11px;border-radius:50%;background:#fff;border:3px solid var(--sv-blue);box-shadow:0 2px 5px rgba(47,85,217,.2)}.ggp-slider output{font-size:11px!important}.ggp-profile{border-radius:0 0 3px 3px!important;overflow:hidden;box-shadow:var(--gg-shadow-1)}
    .ggp-rec-grid{gap:12px!important}.ggp-rec-card{min-height:198px!important;padding:17px!important;overflow:hidden;transition:transform .18s cubic-bezier(.2,.72,.2,1),box-shadow .18s ease,border-color .18s ease!important;translate:var(--gg-tilt-x,0) var(--gg-tilt-y,0)}.ggp-rec-card:before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:#d7dee2}.ggp-rec-card:first-child{background:linear-gradient(135deg,#f8fbff,#fff)!important;border-color:#9fb2eb!important}.ggp-rec-card:first-child:before{background:var(--sv-blue)}.ggp-rec-card:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(31,46,56,.09)!important;border-color:#aebbc2!important}.ggp-rec-card h3{letter-spacing:-.025em;line-height:1.05}.ggp-rec-score{font-size:25px!important;letter-spacing:-.05em}.ggp-view-panel{padding:20px!important}.ggp-view-panel h3{letter-spacing:-.03em}.ggp-explain-grid{gap:12px!important}.ggp-explain-grid article{padding:18px!important}.ggp-explain-grid li,.ggp-explain-grid p{font-size:10.5px!important;line-height:1.6!important}.ggp-flip{border-radius:2px;box-shadow:0 4px 14px rgba(255,90,54,.05)}.ggp-top-rank{overflow:hidden}.ggp-top-rank>div{min-height:48px;transition:background .15s ease,transform .15s ease}.ggp-top-rank>div:hover{background:#f2f6f9!important}.ggp-top-rank>div:first-child{background:#f0f4ff!important;box-shadow:inset 3px 0 var(--sv-blue)}
    .gg-survey .rank-row,.gg-survey .site-card,.gg-survey .changegrid article,.gg-survey .saved-card{transition:transform .18s cubic-bezier(.2,.72,.2,1),box-shadow .18s ease,border-color .18s ease!important;translate:var(--gg-tilt-x,0) var(--gg-tilt-y,0)}.gg-survey .rank-row:hover,.gg-survey .site-card:hover,.gg-survey .changegrid article:hover,.gg-survey .saved-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(31,46,56,.075)!important;border-color:#aebbc2!important}.gg-survey .rank-row:first-child{background:linear-gradient(90deg,#f0f4ff,#f8fafb 32%)!important;box-shadow:inset 3px 0 var(--sv-blue),0 7px 20px rgba(47,85,217,.05)!important}.gg-survey .rank-num{color:var(--sv-orange)!important}.gg-survey .rank-score{letter-spacing:-.05em!important}
    .gg-survey .score-ring{transition:transform .18s ease,box-shadow .18s ease!important}.gg-survey .score-ring:hover{transform:scale(1.025);box-shadow:0 0 0 5px rgba(47,85,217,.055)!important}.gg-score-hint{margin-top:-4px;font:800 6px var(--sv-mono);letter-spacing:.08em;color:#87949b;text-align:center}.ggp-status{border-radius:2px!important}.ggp-score-dialog{border-radius:4px!important;box-shadow:0 30px 80px rgba(20,32,40,.22)}
    .gg-polish-index{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:-22px auto 30px;width:min(1320px,calc(100% - 64px));padding:8px 10px;border:1px solid #c4cdd2;background:rgba(248,250,251,.78);backdrop-filter:blur(10px);box-shadow:0 6px 18px rgba(31,46,56,.04)}.gg-polish-index>span{margin-right:5px;font:800 7px var(--sv-mono);letter-spacing:.12em;color:var(--sv-orange)}.gg-polish-index a{padding:6px 8px;text-decoration:none;font:800 7px var(--sv-mono);letter-spacing:.04em;color:#69767e;border-left:1px solid #d6dde1}.gg-polish-index a:hover{color:var(--sv-blue);background:#f0f4ff}
    .gg-polish-reveal{opacity:.001;transform:translateY(13px);transition:opacity .52s ease,transform .52s cubic-bezier(.2,.72,.2,1)}.gg-polish-reveal.in{opacity:1;transform:none}
    @keyframes ggPolishSweep{to{translate:120% 0}}
    @media(max-width:980px){.ggp-slider{grid-template-columns:145px 1fr 30px!important}.gg-polish-index{width:min(100% - 34px,1320px);overflow:auto;flex-wrap:nowrap}.gg-polish-index a,.gg-polish-index>span{white-space:nowrap}}
    @media(max-width:680px){.gg-survey .section{margin-bottom:58px!important}.ggp-radar-card,.ggp-controls{padding:16px!important}.ggp-slider{grid-template-columns:118px 1fr 28px!important}.ggp-rec-card{min-height:174px!important}.gg-polish-index{margin-top:-10px}.gg-survey .head h2{line-height:1!important}}
    @media(prefers-reduced-motion:reduce){html.gg-polished{scroll-behavior:auto}.gg-polish-reveal{opacity:1!important;transform:none!important;transition:none!important}.gg-survey *{scroll-behavior:auto!important;animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
  `);

  function boot(){installDocumentFeel();revealNewSurfaces();bindActionFeedback();bindResultObserver();animatePreferenceUpdates();enhanceScoreHint();bindPointerPolish();installSectionIndex();tunePreferenceAccessibility();setTimeout(()=>{revealNewSurfaces();bindPointerPolish()},700)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
