'use strict';
(function(){
  var q=function(s,r){return (r||document).querySelector(s)};
  var qa=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var byId=function(id){return document.getElementById(id)};

  function bodyClass(){
    document.body.classList.add('gg-v7');
  }

  function tuneModuleCopy(){
    var morph=byId('ggxProjectMorph');
    if(morph){
      var h=q('.head h2',morph),p=q('.head p',morph),k=q('.kicker',morph);
      if(k)k.textContent='PROJECT TUNER / SHORTLIST SHIFT';
      if(h)h.textContent='Change the load. Watch the shortlist move.';
      if(p)p.textContent='Adjust power, process intensity, water demand and schedule without touching the live form. Gage re-ranks the pilot continuously so you can see which sites survive the project you actually intend to build.';
      qa('.ggx-morph-row',morph).forEach(function(row){
        row.setAttribute('role','button');
        row.setAttribute('tabindex','0');
        row.title='Open this site in the live feasibility screen';
      });
    }

    var budget=byId('ggxDiligenceBudget');
    if(budget){
      var bh=q('.head h2',budget),bp=q('.head p',budget),bk=q('.kicker',budget);
      if(bk)bk.textContent='DILIGENCE ALLOCATION / NEXT-DOLLAR PLAN';
      if(bh)bh.textContent='Spend on the uncertainty most likely to change the decision.';
      if(bp)bp.textContent='Turn the entered diligence budget into a sequence of verification work. The model concentrates spend on the weakest, least-certain dependencies instead of dividing money evenly across every utility.';
      ensureBudgetFocus(budget);
    }
  }

  function openMorphSite(row){
    var name=q('.ggx-morph-site b',row);
    if(!name)return;
    var siteName=(name.textContent||'').trim();
    var site=null;
    try{site=sites.find(function(s){return s.name===siteName})||null}catch(e){}
    if(!site)return;
    var select=byId('siteSelect');
    if(select){
      select.value=site.id;
      select.dispatchEvent(new Event('change',{bubbles:true}));
    }
    byId('screen')?.scrollIntoView({behavior:'smooth',block:'start'});
    window.setTimeout(function(){byId('analyseBtn')?.click()},260);
    try{window.GGX&&window.GGX.toast&&window.GGX.toast(site.name+' loaded into live screen')}catch(e){}
  }

  function bindMorph(){
    var host=byId('ggxmRows');
    if(!host||host.dataset.ggv7Bound)return;
    host.dataset.ggv7Bound='1';
    host.addEventListener('click',function(e){
      var row=e.target.closest('.ggx-morph-row');
      if(row)openMorphSite(row);
    });
    host.addEventListener('keydown',function(e){
      if(e.key!=='Enter'&&e.key!==' ')return;
      var row=e.target.closest('.ggx-morph-row');
      if(!row)return;
      e.preventDefault();openMorphSite(row);
    });
    new MutationObserver(function(){
      qa('.ggx-morph-row',host).forEach(function(row){
        row.setAttribute('role','button');
        row.setAttribute('tabindex','0');
        row.title='Open this site in the live feasibility screen';
      });
    }).observe(host,{childList:true});
  }

  function ensureBudgetFocus(budget){
    if(byId('ggv7BudgetFocus'))return;
    var rows=byId('ggxbRows');
    if(!rows)return;
    var panel=document.createElement('div');
    panel.id='ggv7BudgetFocus';
    panel.className='ggv7-budget-focus';
    panel.innerHTML='<div><span>ALLOCATION FOCUS</span><strong>Select a system above</strong><p>Click an allocation row to see why it received budget and jump directly to the diligence sequence.</p></div><button type="button" data-ggv7-runway>OPEN DECISION RUNWAY →</button>';
    rows.insertAdjacentElement('afterend',panel);
    panel.querySelector('[data-ggv7-runway]')?.addEventListener('click',function(){
      (byId('ggDiligencePath')||byId('decision-gate'))?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }

  function focusBudgetRow(row){
    var panel=byId('ggv7BudgetFocus');if(!panel)return;
    qa('.ggxb-row').forEach(function(r){r.classList.toggle('ggv7-selected',r===row)});
    var system=(q('strong',row)?.textContent||'System').trim();
    var amount=(q('b',row)?.textContent||'—').trim();
    var detail=(q('small',row)?.textContent||'This allocation reflects current project risk and coverage.').trim();
    panel.querySelector('span').textContent=system.toUpperCase()+' / WHY THIS SPEND';
    panel.querySelector('strong').textContent=amount+' allocated';
    panel.querySelector('p').textContent=detail+' Use the decision runway to turn this allocation into specific evidence requests.';
  }

  function bindBudget(){
    var budget=byId('ggxDiligenceBudget');if(!budget||budget.dataset.ggv7Bound)return;
    budget.dataset.ggv7Bound='1';
    ensureBudgetFocus(budget);
    budget.addEventListener('click',function(e){
      var row=e.target.closest('.ggxb-row');
      if(row)focusBudgetRow(row);
    });
    var rows=byId('ggxbRows');
    if(rows){
      new MutationObserver(function(){
        ensureBudgetFocus(budget);
      }).observe(rows,{childList:true});
    }
  }

  function bindFrontierFocus(){
    var frontier=byId('ggxCapacityFrontier');if(!frontier||frontier.dataset.ggv7Bound)return;
    frontier.dataset.ggv7Bound='1';
    frontier.addEventListener('click',function(e){
      var rail=e.target.closest('.ggf7-rail');
      if(rail)frontier.classList.add('ggv7-focus');
      if(e.target.closest('[data-ggf7-scenario],[data-site]'))frontier.classList.remove('ggv7-focus');
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape')frontier.classList.remove('ggv7-focus');
    });
  }

  function installReveals(){
    if(!('IntersectionObserver' in window))return;
    var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced)return;
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },{rootMargin:'0px 0px -8% 0px',threshold:.07});
    qa('.section').forEach(function(section){
      if(section.closest('#screen')||section.id==='screen')return;
      if(section.dataset.ggv7Reveal)return;
      section.dataset.ggv7Reveal='1';
      section.classList.add('ggv7-reveal');
      observer.observe(section);
    });
    window.setTimeout(function(){
      qa('.section.ggv7-reveal').forEach(function(s){
        if(s.getBoundingClientRect().top<window.innerHeight*.9)s.classList.add('is-visible');
      });
    },350);
  }

  function keepLatestCssLast(){
    var link=q('link[href="/gage-fieldbook-v7.css"]');if(!link)return;
    window.setTimeout(function(){document.head.appendChild(link)},1200);
    window.setTimeout(function(){document.head.appendChild(link)},3600);
    window.setTimeout(function(){document.head.appendChild(link)},7200);
  }

  function refresh(){
    tuneModuleCopy();
    bindMorph();
    bindBudget();
    bindFrontierFocus();
  }

  function boot(){
    bodyClass();
    keepLatestCssLast();
    refresh();
    installReveals();

    var attempts=0;
    var timer=window.setInterval(function(){
      attempts++;
      refresh();
      if(attempts>34)window.clearInterval(timer);
    },220);

    var observer=new MutationObserver(function(){
      window.requestAnimationFrame(refresh);
    });
    observer.observe(document.body,{childList:true,subtree:true});
    window.setTimeout(function(){observer.disconnect()},8500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();