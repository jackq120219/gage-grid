'use strict';
(()=>{
  const G=window.GGX;
  if(!G||document.getElementById('ggxCapacityFrontier'))return;

  let attempts=0;
  const LABELS={
    uniform:'ALL CORE LOADS',
    power:'POWER',
    water:'WATER',
    waste:'WASTEWATER',
    gas:'GAS',
    fiber:'FIBER'
  };
  const UNITS={power:'MW',water:'MGD',waste:'MGD',gas:'MMBtu/h',fiber:'routes'};
  const VERIFY={
    uniform:'Verify the first system that reaches its breakpoint. Uniform growth is only as strong as the tightest dependency.',
    power:'Ask for firm deliverable MW by the target date, service voltage, substation/feed path, upgrade scope and schedule owner.',
    water:'Confirm firm daily and peak-day service, pressure/flow basis, storage needs and any extension work to the parcel.',
    waste:'Confirm permitted hydraulic and treatment headroom, pretreatment limits and collection-system constraints for this discharge profile.',
    gas:'Confirm firm hourly capacity, delivery pressure, regulator/main extension scope and any upstream reinforcement schedule.',
    fiber:'Confirm physically diverse routes and carriers. Multiple providers sharing the same conduit or pole line do not create true route diversity.'
  };
  const EVIDENCE={
    uniform:'Written utility confirmations for the systems that govern the breakpoint.',
    power:'Utility service study · written capacity letter · feed/substation path · upgrade schedule.',
    water:'Capacity letter · pressure/flow basis · peak-day constraint · extension scope.',
    waste:'POTW confirmation · permit headroom · pretreatment limits · collection extension/pump constraints.',
    gas:'Utility engineering confirmation · pressure basis · regulator/main scope · reinforcement schedule.',
    fiber:'Carrier route maps · diverse entrance confirmation · meet-point / splice plans · construction interval.'
  };

  const boot=()=>{
    const anchor=document.getElementById('ggxProjectMorph')||document.getElementById('rank');
    const base=G.current?.();
    if(!anchor||!base){if(attempts++<45)setTimeout(boot,120);return}

    const initial=G.rank(base).slice(0,4);
    if(!initial.length)return;

    let selectedId=initial[0].s.id;
    let selectedKey='power';
    let scenario='base';

    const section=document.createElement('section');
    section.id='ggxCapacityFrontier';
    section.className='section shell ggx-frontier ggx-frontier-v7';
    section.innerHTML=
      '<div class="head ggx-frontier-head">'+
        '<div><div class="kicker">CAPACITY FRONTIER / SYSTEM BREAKPOINTS</div><h2>Where does the project stop fitting?</h2></div>'+
        '<p>Move one requirement at a time and watch the serviceability frontier shift. Gage shows the modeled breakpoint, then turns that breakpoint into a diligence question instead of pretending it is a utility commitment.</p>'+
      '</div>'+
      '<div class="ggf7-shell">'+
        '<aside class="ggf7-sites">'+
          '<div class="ggf7-aside-head"><span>PILOT STACK</span><b id="ggf7SiteCount">04</b></div>'+
          '<div id="ggf7SiteButtons" class="ggf7-site-list"></div>'+
          '<div class="ggf7-site-note"><span>HOW TO READ THIS</span><p>1.00× is the current project. A 1.34× power breakpoint means roughly 34% more power demand before this pilot model crosses into a hold state, assuming the other entered requirements stay fixed.</p></div>'+
        '</aside>'+
        '<div class="ggf7-instrument">'+
          '<div class="ggf7-instrument-head">'+
            '<div><span>SELECTED SITE</span><strong id="ggf7Site">—</strong><small id="ggf7SiteMeta">—</small></div>'+
            '<div><span>TIGHTEST SYSTEM</span><strong id="ggf7Tight">—</strong><small id="ggf7TightMeta">—</small></div>'+
            '<div><span>UNIFORM LIMIT</span><strong id="ggf7Uniform">—</strong><small>all core loads together</small></div>'+
          '</div>'+
          '<div class="ggf7-scenarios" aria-label="Frontier stress controls">'+
            '<span>STRESS LENS</span>'+
            '<button type="button" data-ggf7-scenario="base" aria-pressed="true">BASE</button>'+
            '<button type="button" data-ggf7-scenario="growth">+10% GROWTH</button>'+
            '<button type="button" data-ggf7-scenario="schedule">FASTER ONLINE</button>'+
            '<button type="button" data-ggf7-scenario="evidence">STRICTER EVIDENCE</button>'+
          '</div>'+
          '<div class="ggf7-axis" aria-hidden="true"><span>1.0× CURRENT</span><span>1.5×</span><span>2.0×</span><span>2.5×</span><span>3.0×</span><span>3.5×+</span></div>'+
          '<div id="ggf7Rails" class="ggf7-rails" aria-live="polite"></div>'+
          '<div id="ggf7Drawer" class="ggf7-drawer"></div>'+
          '<div class="ggf7-actions">'+
            '<button type="button" class="primary" data-ggf7-use>USE SITE IN LIVE SCREEN</button>'+
            '<button type="button" data-ggf7-evidence>OPEN EVIDENCE</button>'+
            '<button type="button" data-ggf7-copy>COPY FRONTIER BRIEF</button>'+
          '</div>'+
        '</div>'+
      '</div>';

    anchor.insertAdjacentElement('afterend',section);

    G.injectStyle('ggx-capacity-frontier-style-v7',[
      '.ggx-frontier-v7{padding-top:30px}.ggf7-shell{display:grid;grid-template-columns:276px minmax(0,1fr);border:2px solid #1c2a34;background:#f8faf8;box-shadow:8px 8px 0 rgba(28,42,52,.08)}',
      '.ggf7-sites{padding:18px;border-right:1px solid #1c2a34;background:linear-gradient(180deg,#eaf0f5 0,#f7f9f7 48%,#f7f9f7 100%)}',
      '.ggf7-aside-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}.ggf7-aside-head span,.ggf7-scenarios>span,.ggf7-instrument-head span,.ggf7-site-note span,.ggf7-drawer span{font:800 7px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.11em;color:#1d4f91}.ggf7-aside-head b{color:#f0642d;font:800 9px ui-monospace,SFMono-Regular,Menlo,monospace}',
      '.ggf7-site-list{display:grid;gap:7px}.ggf7-site-list button{width:100%;display:grid;grid-template-columns:31px 1fr auto;gap:9px;align-items:center;min-height:64px;padding:9px;border:1px solid #aeb8be;background:#fff;color:#1c2a34;text-align:left;cursor:pointer;transition:transform .14s,border-color .14s,background .14s}.ggf7-site-list button:hover{border-color:#1d4f91;background:#f0f5fa;transform:translateX(2px)}.ggf7-site-list button[aria-pressed="true"]{border-color:#1d4f91;background:#e7f0f9;box-shadow:inset 4px 0 0 #1d4f91}',
      '.ggf7-site-rank{color:#f0642d;font:400 20px/1 Georgia,serif}.ggf7-site-copy b{display:block;color:#1e2e38;font-size:10px}.ggf7-site-copy span{display:block;margin-top:4px;color:#687780;font-size:8px}.ggf7-site-state{font:800 6px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em;color:#6a7880;text-align:right}.ggf7-site-state em{display:block;margin-top:4px;color:#1d4f91;font-style:normal}',
      '.ggf7-site-note{margin-top:13px;padding:12px;border:1px dashed #97a5ad;background:rgba(255,255,255,.65)}.ggf7-site-note span{color:#f0642d}.ggf7-site-note p{margin:6px 0 0;color:#5d6c75;font-size:8px;line-height:1.55}',
      '.ggf7-instrument{min-width:0;position:relative;background:linear-gradient(rgba(29,79,145,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(29,79,145,.03) 1px,transparent 1px),#fbfcfa;background-size:28px 28px,28px 28px,auto}',
      '.ggf7-instrument-head{display:grid;grid-template-columns:1.2fr 1fr .8fr;border-bottom:1px solid #1c2a34;background:#edf2f5}.ggf7-instrument-head>div{min-height:78px;padding:13px 15px;border-right:1px solid #b4bec4}.ggf7-instrument-head>div:last-child{border-right:0}.ggf7-instrument-head strong{display:block;margin-top:8px;color:#1f303a;font:600 16px/1.05 Arial,sans-serif}.ggf7-instrument-head small{display:block;margin-top:4px;color:#6b7880;font-size:8px}',
      '.ggf7-scenarios{display:flex;align-items:center;gap:6px;padding:10px 13px;border-bottom:1px solid #c1cbd0;background:#f9faf8}.ggf7-scenarios>span{margin-right:4px;color:#687780}.ggf7-scenarios button{min-height:31px;padding:0 9px;border:1px solid #aeb8be;background:#fff;color:#53636d;font:800 7px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em;cursor:pointer}.ggf7-scenarios button:hover{border-color:#1d4f91;color:#1d4f91}.ggf7-scenarios button[aria-pressed="true"]{border-color:#1d4f91;background:#1d4f91;color:#fff}',
      '.ggf7-axis{display:grid;grid-template-columns:repeat(6,1fr);padding:9px 22px 5px 160px;color:#7a878e;font:700 6px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em}.ggf7-axis span:not(:first-child){text-align:center}.ggf7-axis span:last-child{text-align:right}',
      '.ggf7-rails{padding:0 18px 8px}.ggf7-rail{display:grid;grid-template-columns:132px minmax(0,1fr) 94px;gap:10px;align-items:center;min-height:67px;padding:0 4px;border-bottom:1px solid #d3dade;cursor:pointer;transition:background .14s}.ggf7-rail:hover,.ggf7-rail.active{background:rgba(226,237,247,.68)}.ggf7-rail-label span{display:block;color:#61717a;font:800 7px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}.ggf7-rail-label b{display:block;margin-top:5px;color:#1f303a;font-size:10px}',
      '.ggf7-track{position:relative;height:28px}.ggf7-track:before{content:"";position:absolute;left:0;right:0;top:13px;height:2px;background:#9caab2}.ggf7-track:after{content:"";position:absolute;left:0;right:0;top:6px;height:16px;background:repeating-linear-gradient(90deg,#809099 0 1px,transparent 1px 20%);opacity:.35}.ggf7-current{position:absolute;left:0;top:3px;width:3px;height:22px;background:#1d4f91;z-index:4}.ggf7-current:after{content:"1.0×";position:absolute;left:5px;top:-1px;color:#1d4f91;font:800 6px ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}',
      '.ggf7-wire{position:absolute;left:0;top:11px;height:6px;border-top:3px solid #2f6db2;z-index:2;transition:width .28s cubic-bezier(.2,.75,.25,1)}.ggf7-wire:after{content:"";position:absolute;right:-4px;top:-6px;width:9px;height:9px;border:2px solid #1d4f91;background:#fff;border-radius:50%;box-shadow:0 0 0 4px rgba(29,79,145,.09)}.ggf7-wire.tight{border-color:#f0642d}.ggf7-wire.tight:after{border-color:#f0642d;box-shadow:0 0 0 4px rgba(240,100,45,.09)}.ggf7-wire.ok{border-color:#4b8467}.ggf7-wire.ok:after{border-color:#4b8467}',
      '.ggf7-pulse{position:absolute;left:0;top:9px;width:7px;height:7px;border-radius:50%;background:#f0642d;z-index:5;animation:ggf7Pulse 2.5s linear infinite;animation-delay:var(--delay,0s)}@keyframes ggf7Pulse{0%{transform:translateX(0);opacity:0}10%{opacity:1}88%{opacity:1}100%{transform:translateX(var(--travel,120px));opacity:0}}',
      '.ggf7-rail-meta{text-align:right}.ggf7-rail-meta strong{display:block;color:#1e2e38;font:700 17px/1 ui-monospace,SFMono-Regular,Menlo,monospace}.ggf7-rail-meta span{display:block;margin-top:5px;font:800 6px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.07em;color:#60717a}.ggf7-rail-meta span.tight{color:#c95026}.ggf7-rail-meta span.headroom{color:#3f7659}',
      '.ggf7-drawer{display:grid;grid-template-columns:1.05fr .75fr .8fr;gap:1px;margin:0 18px 14px;border:1px solid #9eabb2;background:#9eabb2}.ggf7-drawer>div{min-height:96px;padding:13px;background:#fff}.ggf7-drawer>div:first-child{background:#edf3f8}.ggf7-drawer strong{display:block;margin-top:8px;color:#1f303a;font-size:11px}.ggf7-drawer p{margin:6px 0 0;color:#5b6b74;font-size:8px;line-height:1.5}.ggf7-drawer .big{font:400 25px/1 Georgia,serif;color:#1d4f91}',
      '.ggf7-actions{display:flex;gap:7px;padding:12px 18px;border-top:1px solid #1c2a34;background:#eef2f3}.ggf7-actions button{min-height:37px;padding:0 11px;border:1px solid #1c2a34;background:#fff;color:#283741;font:800 7px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em;cursor:pointer}.ggf7-actions button:hover{background:#e7f0f9;color:#1d4f91}.ggf7-actions button.primary{background:#f0642d;color:#fff}.ggf7-actions button.primary:hover{background:#d85824;color:#fff}',
      '@media(max-width:930px){.ggf7-shell{grid-template-columns:1fr}.ggf7-sites{border-right:0;border-bottom:1px solid #1c2a34}.ggf7-site-list{grid-template-columns:1fr 1fr}.ggf7-axis{padding-left:148px}.ggf7-drawer{grid-template-columns:1fr 1fr}.ggf7-drawer>div:last-child{grid-column:1/-1}}',
      '@media(max-width:640px){.ggf7-site-list{grid-template-columns:1fr}.ggf7-instrument-head{grid-template-columns:1fr}.ggf7-instrument-head>div{min-height:60px;border-right:0;border-bottom:1px solid #b4bec4}.ggf7-scenarios{overflow-x:auto}.ggf7-scenarios>span{display:none}.ggf7-scenarios button{flex:0 0 auto}.ggf7-axis{display:none}.ggf7-rail{grid-template-columns:92px minmax(0,1fr) 68px}.ggf7-drawer{grid-template-columns:1fr}.ggf7-drawer>div:last-child{grid-column:auto}.ggf7-actions{display:grid;grid-template-columns:1fr}.ggf7-actions button{width:100%}}',
      '@media(prefers-reduced-motion:reduce){.ggf7-pulse{display:none}.ggf7-wire{transition:none}}'
    ].join(''));

    const currentBase=()=>G.current?.()||base;
    const scenarioReq=()=>{
      const req={...currentBase()};
      if(scenario==='growth')req.growth=(Number(req.growth)||0)+.10;
      if(scenario==='schedule')req.timeline=Math.max(12,(Number(req.timeline)||24)-12);
      if(scenario==='evidence')req.risk='conservative';
      return req;
    };
    const resultFor=(siteId,req)=>G.rank(req).find(row=>row.s.id===siteId);
    const scaleReq=(req,key,mult)=>{
      const next={...req};
      if(key==='uniform'){
        ['power','water','waste','gas'].forEach(k=>next[k]=Math.max(0,Number(req[k])||0)*mult);
      }else{
        next[key]=Math.max(0,Number(req[key])||0)*mult;
      }
      return next;
    };
    const frontier=(siteId,key)=>{
      const req=scenarioReq();
      const atBase=resultFor(siteId,req);
      if(!atBase)return 1;
      if(atBase.vclass==='hold')return .99;
      let low=1,high=3.5;
      const hi=resultFor(siteId,scaleReq(req,key,high));
      if(hi&&hi.vclass!=='hold')return 3.5;
      for(let i=0;i<11;i++){
        const mid=(low+high)/2,row=resultFor(siteId,scaleReq(req,key,mid));
        if(row&&row.vclass!=='hold')low=mid;else high=mid;
      }
      return low;
    };
    const scenarioName=()=>({base:'Base project',growth:'+10% growth stress',schedule:'Faster online window',evidence:'Conservative evidence lens'}[scenario]||'Base project');
    const reqValue=(req,key)=>{
      if(key==='uniform')return 'all entered core loads';
      const value=Number(req[key])||0;
      if(key==='water'||key==='waste')return value.toFixed(2)+' '+UNITS[key];
      if(key==='power')return value.toFixed(value<10?1:0)+' '+UNITS[key];
      if(key==='gas')return Math.round(value).toLocaleString()+' '+UNITS[key];
      return Math.round(value)+' '+UNITS[key];
    };
    const statusFor=value=>value<=1?'AT / OVER LIMIT':value<1.25?'TIGHT':value<1.75?'MODERATE':'HEADROOM';
    const toneFor=value=>value<1.25?'tight':value>=1.75?'headroom':'';
    let lastState=null;

    const renderDrawer=(state)=>{
      const item=state.values.find(v=>v.key===selectedKey)||state.tight;
      selectedKey=item.key;
      const room=Math.max(0,Math.round((item.value-1)*100));
      const req=state.req;
      const current=reqValue(req,item.key);
      const status=statusFor(item.value);
      const drawer=document.getElementById('ggf7Drawer');
      drawer.innerHTML=
        '<div><span>'+G.esc(LABELS[item.key])+' / VERIFY NEXT</span><strong>'+G.esc(VERIFY[item.key])+'</strong><p>Modeled breakpoint '+(item.value>=3.49?'3.5×+':item.value.toFixed(2)+'×')+' under the '+G.esc(scenarioName())+'.</p></div>'+
        '<div><span>CURRENT → BREAKPOINT</span><strong class="big">'+G.esc(current)+'</strong><p>Approx. '+room+'% modeled expansion room before this pilot screen crosses into a hold state.</p></div>'+
        '<div><span>EVIDENCE TO CLOSE</span><strong>'+G.esc(EVIDENCE[item.key])+'</strong><p>Status: '+G.esc(status)+'. Treat the frontier as a diligence trigger, not as service authorization.</p></div>';
    };

    const render=()=>{
      const req=scenarioReq();
      const ranking=G.rank(req).slice(0,4);
      const selected=ranking.find(r=>r.s.id===selectedId)||ranking[0];
      if(!selected)return;
      selectedId=selected.s.id;

      const keys=['uniform','power','water','waste','gas','fiber'];
      const values=keys.map(key=>({key,value:frontier(selectedId,key)}));
      const tight=[...values.filter(v=>v.key!=='uniform')].sort((a,b)=>a.value-b.value)[0];
      const uniform=values.find(v=>v.key==='uniform');

      document.getElementById('ggf7SiteCount').textContent=String(ranking.length).padStart(2,'0');
      document.getElementById('ggf7SiteButtons').innerHTML=ranking.map((row,index)=>{
        const weak=row.worst?.name||'Unknown';
        return '<button type="button" data-site="'+row.s.id+'" aria-pressed="'+(row.s.id===selectedId)+'">'+
          '<span class="ggf7-site-rank">0'+(index+1)+'</span>'+
          '<span class="ggf7-site-copy"><b>'+G.esc(row.s.name)+'</b><span>'+row.low+'–'+row.high+' · weakest '+G.esc(weak)+'</span></span>'+
          '<span class="ggf7-site-state">'+G.esc(row.s.evidence)+'<em>'+row.s.lead+' MO</em></span>'+
          '</button>';
      }).join('');

      document.getElementById('ggf7Site').textContent=selected.s.name;
      document.getElementById('ggf7SiteMeta').textContent=selected.s.county+' · '+selected.s.state+' · '+selected.s.evidence+' evidence · '+selected.s.lead+' mo modeled lead';
      document.getElementById('ggf7Tight').textContent=LABELS[tight.key]+' · '+(tight.value>=3.49?'3.5×+':tight.value.toFixed(2)+'×');
      document.getElementById('ggf7TightMeta').textContent=statusFor(tight.value)+' · '+Math.max(0,Math.round((tight.value-1)*100))+'% modeled room';
      document.getElementById('ggf7Uniform').textContent=uniform.value>=3.49?'3.5×+':uniform.value.toFixed(2)+'×';

      document.getElementById('ggf7Rails').innerHTML=values.map((item,index)=>{
        const pct=Math.max(0,Math.min(100,((item.value-1)/2.5)*100));
        const travel=Math.max(10,pct)+'%';
        const tone=toneFor(item.value);
        const status=statusFor(item.value);
        const reqText=reqValue(req,item.key);
        return '<article class="ggf7-rail '+(item.key===selectedKey?'active':'')+'" data-key="'+item.key+'" tabindex="0">'+
          '<div class="ggf7-rail-label"><span>'+LABELS[item.key]+'</span><b>'+G.esc(reqText)+'</b></div>'+
          '<div class="ggf7-track">'+
            '<i class="ggf7-current"></i>'+
            '<i class="ggf7-wire '+tone+'" style="width:'+pct+'%"></i>'+
            '<i class="ggf7-pulse" style="--travel:'+travel+';--delay:-'+(index*.36).toFixed(2)+'s"></i>'+
          '</div>'+
          '<div class="ggf7-rail-meta"><strong>'+(item.value>=3.49?'3.5×+':item.value.toFixed(2)+'×')+'</strong><span class="'+tone+'">'+status+'</span></div>'+
          '</article>';
      }).join('');

      lastState={req,ranking,selected,values,tight,uniform};
      renderDrawer(lastState);

      section.querySelectorAll('[data-site]').forEach(button=>button.addEventListener('click',()=>{selectedId=button.dataset.site;selectedKey='power';render()}));
      section.querySelectorAll('.ggf7-rail').forEach(rail=>{
        const activate=()=>{selectedKey=rail.dataset.key;section.querySelectorAll('.ggf7-rail').forEach(x=>x.classList.toggle('active',x===rail));renderDrawer(lastState)};
        rail.addEventListener('click',activate);
        rail.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate()}});
      });
    };

    section.querySelectorAll('[data-ggf7-scenario]').forEach(btn=>btn.addEventListener('click',()=>{
      scenario=btn.dataset.ggf7Scenario;
      section.querySelectorAll('[data-ggf7-scenario]').forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));
      render();
    }));

    ['projectType','powerReq','waterReq','wasteReq','gasReq','fiberReq','timeline','growth','risk','powerRedundancy'].forEach(id=>{
      const el=document.getElementById(id);
      el?.addEventListener('input',render);
      el?.addEventListener('change',render);
    });

    section.querySelector('[data-ggf7-use]')?.addEventListener('click',()=>{
      const select=document.getElementById('siteSelect');
      if(select){
        select.value=selectedId;
        select.dispatchEvent(new Event('change',{bubbles:true}));
      }
      document.getElementById('screen')?.scrollIntoView({behavior:'smooth',block:'start'});
      setTimeout(()=>document.getElementById('analyseBtn')?.click(),260);
      G.toast('Frontier site loaded into live screen');
    });

    section.querySelector('[data-ggf7-evidence]')?.addEventListener('click',()=>{
      document.getElementById('registry')?.scrollIntoView({behavior:'smooth',block:'start'});
    });

    section.querySelector('[data-ggf7-copy]')?.addEventListener('click',async e=>{
      if(!lastState)return;
      const chosen=lastState.values.find(v=>v.key===selectedKey)||lastState.tight;
      const room=Math.max(0,Math.round((chosen.value-1)*100));
      const lines=[
        'GAGE GRID / CAPACITY FRONTIER',
        'Site: '+lastState.selected.s.name+' · '+lastState.selected.s.county+', '+lastState.selected.s.state,
        'Scenario: '+scenarioName(),
        'Tightest system: '+LABELS[lastState.tight.key]+' · '+(lastState.tight.value>=3.49?'3.5×+':lastState.tight.value.toFixed(2)+'×'),
        'Uniform growth limit: '+(lastState.uniform.value>=3.49?'3.5×+':lastState.uniform.value.toFixed(2)+'×'),
        '',
        'Focused system: '+LABELS[chosen.key],
        'Current requirement: '+reqValue(lastState.req,chosen.key),
        'Modeled frontier: '+(chosen.value>=3.49?'3.5×+':chosen.value.toFixed(2)+'×')+' · approx. '+room+'% room',
        'Verify next: '+VERIFY[chosen.key],
        'Evidence to close: '+EVIDENCE[chosen.key],
        '',
        'Pilot capacity is simulated. Breakpoints are screening outputs, not utility commitments.'
      ].join('\n');
      const b=e.currentTarget;
      try{
        await navigator.clipboard.writeText(lines);
        b.textContent='FRONTIER BRIEF COPIED';
        setTimeout(()=>b.textContent='COPY FRONTIER BRIEF',1300);
      }catch{
        b.textContent='COPY UNAVAILABLE';
        setTimeout(()=>b.textContent='COPY FRONTIER BRIEF',1300);
      }
    });

    render();
  };

  boot();
})();