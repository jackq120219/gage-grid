'use strict';
(function(){
  var $id=function(id){return document.getElementById(id)};
  var q=function(sel,root){return (root||document).querySelector(sel)};
  var qa=function(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))};
  var mode='pilot';
  var customLast=null;
  var customTimer=null;
  var baseRunAnalysis=typeof runAnalysis==='function'?runAnalysis:null;

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  function clampLocal(v,min,max){return Math.max(min,Math.min(max,v))}

  function track(name,data){
    try{
      if(typeof window.va==='function')window.va('event',{name:name,data:data||{}});
    }catch(e){}
  }

  function setHero(){
    var copy=q('.hero-copy>p');
    if(copy)copy.textContent='Bring the project load and what you know about the site. Gage Grid turns fragmented infrastructure facts into a bottleneck map, evidence gaps and a diligence order across power, water, wastewater, gas and fiber.';
    var stamp=q('.hero-stamp');
    if(stamp)stamp.innerHTML='<b>UNKNOWN STAYS UNKNOWN</b>Nearby infrastructure is not the same as serviceability. Gage discounts evidence quality, keeps missing facts visible and shows what must be verified next.';
    var primary=q('.hero-actions .btn:not(.ghost)');
    if(primary){
      primary.textContent='Screen your site';
      primary.addEventListener('click',function(){setMode('custom');track('hero_custom_site_click')});
    }
    var demo=$id('loadDemoBtn');
    if(demo){
      demo.textContent='Run pilot demo';
      demo.addEventListener('click',function(){
        window.setTimeout(function(){setMode('pilot')},0);
        track('pilot_demo_run');
      });
    }
    var ribbon=q('.ribbon');
    if(ribbon)ribbon.textContent='DECISION-SCREENING PILOT · USER-SUPPLIED SITE DATA SUPPORTED · UTILITY VERIFICATION REQUIRED';
  }

  function setMetrics(){
    var cells=qa('.mini-metrics>div');
    if(cells[1])cells[1].innerHTML='<b>12</b><span>PILOT SITE NODES</span>';
    if(cells[2])cells[2].innerHTML='<b>1</b><span>YOUR-SITE WORKSPACE</span>';
  }

  function modeMarkup(){
    return '<div id="gg13ModeBar" class="gg13-modebar">'+
      '<div><span>SCREENING MODE</span><b>Use the demo or bring a real site.</b></div>'+
      '<div class="gg13-mode-tabs">'+
        '<button type="button" data-gg13-mode="pilot" aria-pressed="true">PILOT NODES</button>'+
        '<button type="button" data-gg13-mode="custom" aria-pressed="false">YOUR SITE</button>'+
      '</div>'+
    '</div>';
  }

  function customMarkup(){
    return '<div id="gg13CustomPanel" class="gg13-custom-panel" hidden>'+
      '<div class="gg13-custom-head">'+
        '<div><span>USER-SUPPLIED SITE</span><b>Enter only what you actually know.</b></div>'+
        '<button type="button" id="gg13ResetSite">RESET</button>'+
      '</div>'+
      '<div class="gg13-site-grid">'+
        '<label class="wide"><span>SITE / PARCEL NAME</span><input id="gg13SiteName" placeholder="e.g. Project Atlas — Parcel 4"></label>'+
        '<label><span>MARKET / LOCATION</span><input id="gg13Market" placeholder="City, county or state"></label>'+
        '<label><span>EVIDENCE QUALITY</span><select id="gg13Evidence"><option value="Verified">Verified / written</option><option value="Reported" selected>Reported / credible</option><option value="Modeled">Modeled / inferred</option></select></label>'+
      '</div>'+
      '<div class="gg13-cap-grid">'+
        '<label><span>POWER HEADROOM</span><div><input id="gg13Power" type="number" min="0" step="0.1" placeholder="unknown"><em>MW</em></div></label>'+
        '<label><span>WATER HEADROOM</span><div><input id="gg13Water" type="number" min="0" step="0.01" placeholder="unknown"><em>MGD</em></div></label>'+
        '<label><span>WASTEWATER</span><div><input id="gg13Waste" type="number" min="0" step="0.01" placeholder="unknown"><em>MGD</em></div></label>'+
        '<label><span>GAS HEADROOM</span><div><input id="gg13Gas" type="number" min="0" step="1" placeholder="unknown"><em>MMBtu/h</em></div></label>'+
        '<label><span>FIBER PATHS</span><select id="gg13Fiber"><option value="">Unknown</option><option value="1">1 / standard</option><option value="2">2 / dual path</option><option value="3">3 / carrier dense</option></select></label>'+
        '<label><span>POWER REDUNDANCY</span><select id="gg13Redundancy"><option value="">Unknown</option><option value="1">1 / single path</option><option value="2">2 / second feed</option><option value="3">3 / diverse feeds</option></select></label>'+
      '</div>'+
      '<div class="gg13-proof-grid">'+
        '<label><span>INDICATIVE SERVICE LEAD</span><div><input id="gg13Lead" type="number" min="1" step="1" placeholder="unknown"><em>mo</em></div></label>'+
        '<label><span>CONFIDENCE</span><div><input id="gg13Confidence" type="number" min="40" max="100" step="1" value="75"><em>%</em></div></label>'+
        '<div class="gg13-local-note"><b>LOCAL DRAFT</b><span>Prototype inputs stay in this browser until you export or email a handoff.</span></div>'+
      '</div>'+
    '</div>';
  }

  function installMode(){
    var inputs=q('.inputs');
    var h3=q('h3',inputs);
    var site=$id('siteSelect');
    if(!inputs||!h3||!site||$id('gg13ModeBar'))return;
    h3.insertAdjacentHTML('afterend',modeMarkup());
    var siteField=site.closest('.field');
    if(siteField)siteField.classList.add('gg13-pilot-site-field');
    if(siteField)siteField.insertAdjacentHTML('afterend',customMarkup());
    qa('[data-gg13-mode]').forEach(function(btn){
      btn.addEventListener('click',function(){setMode(btn.getAttribute('data-gg13-mode'))});
    });
    var reset=$id('gg13ResetSite');
    if(reset)reset.addEventListener('click',resetCustom);
    var ids=['gg13SiteName','gg13Market','gg13Evidence','gg13Power','gg13Water','gg13Waste','gg13Gas','gg13Fiber','gg13Redundancy','gg13Lead','gg13Confidence'];
    ids.forEach(function(id){
      var el=$id(id);
      if(!el)return;
      el.addEventListener('input',persistCustomDraft);
      el.addEventListener('change',function(){
        persistCustomDraft();
        if(mode==='custom'&&customLast){
          window.clearTimeout(customTimer);
          customTimer=window.setTimeout(runCustomSite,280);
        }
      });
    });
    restoreCustomDraft();
    setMode('pilot');
  }

  function setMode(next){
    mode=next==='custom'?'custom':'pilot';
    qa('[data-gg13-mode]').forEach(function(btn){
      btn.setAttribute('aria-pressed',String(btn.getAttribute('data-gg13-mode')===mode));
    });
    var pilot=q('.gg13-pilot-site-field');
    var custom=$id('gg13CustomPanel');
    if(pilot)pilot.hidden=mode==='custom';
    if(custom)custom.hidden=mode!=='custom';
    var button=$id('analyseBtn');
    if(button)button.textContent=mode==='custom'?'SCREEN YOUR SITE →':'RUN / REFRESH FEASIBILITY →';
    document.body.classList.toggle('gg13-custom-mode',mode==='custom');
    if(mode==='pilot')document.body.classList.remove('gg13-custom-result');
    track('screening_mode_change',{mode:mode});
  }

  function readOptional(id){
    var el=$id(id);
    if(!el)return null;
    var value=String(el.value||'').trim();
    if(value==='')return null;
    var n=Number(value);
    return Number.isFinite(n)?n:null;
  }

  function customSite(){
    var ev=$id('gg13Evidence').value||'Reported';
    var conf=clampLocal(Number($id('gg13Confidence').value)||75,40,100);
    return {
      id:'GG-CUSTOM',
      name:String($id('gg13SiteName').value||'Your site').trim()||'Your site',
      market:String($id('gg13Market').value||'').trim(),
      evidence:ev,
      confidence:conf,
      lead:readOptional('gg13Lead'),
      power:readOptional('gg13Power'),
      water:readOptional('gg13Water'),
      waste:readOptional('gg13Waste'),
      gas:readOptional('gg13Gas'),
      fiber:readOptional('gg13Fiber'),
      redundancy:readOptional('gg13Redundancy')
    };
  }

  function stressRisk(risk){
    if(risk==='exploratory')return'balanced';
    return'conservative';
  }

  function analyzeCustom(site,req,stress){
    var needs=effectiveNeeds(req,!!stress);
    var risk=stress?stressRisk(req.risk):req.risk;
    var ef=evidenceFactor(site.evidence,risk);
    var defs=[
      ['Power','power',needs.power,'MW'],
      ['Water','water',needs.water,'MGD'],
      ['Wastewater','waste',needs.waste,'MGD'],
      ['Gas','gas',needs.gas,'MMBtu/h'],
      ['Fiber','fiber',needs.fiber,'routes'],
      ['Power redundancy','redundancy',needs.redundancy,'level']
    ];
    var rows=defs.map(function(def){
      var name=def[0],key=def[1],need=def[2],unit=def[3],raw=site[key];
      var known=raw!==null&&Number.isFinite(raw);
      var usable=known?raw*ef:null;
      var ratio=known?(need===0?3:usable/need):null;
      var gap=known?usable-need:null;
      return {name:name,key:key,need:need,unit:unit,raw:raw,usable:usable,ratio:ratio,gap:gap,known:known};
    });
    var required=rows.filter(function(r){return r.need>0});
    var known=required.filter(function(r){return r.known});
    var completion=required.length?known.length/required.length:1;
    var worst=known.length?known.slice().sort(function(a,b){return a.ratio-b.ratio})[0]:{
      name:'Evidence coverage',key:'evidence',need:1,unit:'',raw:0,usable:0,ratio:0,gap:-1,known:false
    };
    var coverage=known.length?Math.min.apply(null,known.map(function(r){return Math.min(1.15,r.ratio)})):0;
    var timingKnown=site.lead!==null&&site.lead>0;
    var timingRatio=timingKnown?needs.timeline/site.lead:null;
    var timingComponent=timingKnown?Math.min(1,timingRatio):.35;
    var rawScore=(Math.min(1,coverage)*.52+timingComponent*.15+ef*.12+(site.confidence/100)*.08+completion*.13)*100;
    var score=clampLocal(Math.round(rawScore),4,99);
    if(completion<.5)score=Math.min(score,64);
    var baseUncertainty=evidenceUncertainty(site.evidence,site.confidence);
    var uncertainty=clampLocal(baseUncertainty+(1-completion)*.22+(timingKnown?0:.05),.06,.45);
    var low=clampLocal(Math.round(score*(1-uncertainty)),1,99);
    var high=clampLocal(Math.round(score+(100-score)*(uncertainty*.7)),1,99);
    var verdict='GO TO DILIGENCE',vclass='go';
    if(completion<.5){
      verdict='EVIDENCE GAP';vclass='conditional';
    }else if(worst.ratio<.8||(timingKnown&&timingRatio<.68)){
      verdict='HOLD / RESCOPE';vclass='hold';
    }else if(completion<1||!timingKnown||worst.ratio<1.15||site.evidence!=='Verified'||low<70){
      verdict='CONDITIONAL / VERIFY';vclass='conditional';
    }
    var bufferPct=worst.ratio===null?0:Math.round((worst.ratio-1)*100);
    var atRisk=verdict==='HOLD / RESCOPE'?req.capital:verdict==='GO TO DILIGENCE'?req.capital*.15:req.capital*.45;
    return {
      s:{
        id:site.id,name:site.name,county:site.market||'User-supplied site',state:'',
        evidence:site.evidence,confidence:site.confidence,redundancy:site.redundancy||0,
        lead:site.lead||req.timeline,power:site.power||0,water:site.water||0,waste:site.waste||0,
        gas:site.gas||0,fiber:site.fiber||0,note:'User-supplied site inputs. Utility verification required.'
      },
      sourceSite:site,req:req,stress:!!stress,rows:rows,worst:worst,score:score,low:low,high:high,
      verdict:verdict,vclass:vclass,timingRatio:timingRatio,needs:needs,bufferPct:bufferPct,atRisk:atRisk,
      completion:completion,timingKnown:timingKnown,unknown:required.filter(function(r){return !r.known})
    };
  }

  function statusFor(row){
    if(!row.known)return {label:'UNKNOWN',cls:'unknown',pct:0};
    var pct=Math.round(row.ratio*100);
    if(row.ratio<1)return {label:'SHORTFALL',cls:'bad',pct:pct};
    if(row.ratio<1.25)return {label:'TIGHT',cls:'warn',pct:pct};
    return {label:'PASS',cls:'good',pct:pct};
  }

  function firstMove(a){
    if(a.unknown.length){
      return 'Resolve '+a.unknown.slice(0,2).map(function(r){return r.name}).join(' + ')+' at the parcel before treating the screen as decision-grade.';
    }
    if(a.worst.ratio<1){
      var extra=Math.abs(a.worst.gap);
      return a.worst.name+' needs about '+format(extra,a.worst.name)+' of additional risk-adjusted usable capacity, or the project load must fall.';
    }
    if(!a.timingKnown)return 'Confirm a credible service lead time against the project online date.';
    return 'Move '+a.worst.name+' from screening evidence to written utility confirmation at the exact parcel.';
  }

  function diligenceFor(a){
    var out=[];
    a.unknown.forEach(function(r){out.push('Resolve '+r.name+' serviceability at the exact parcel; it is currently unknown.')});
    if(a.worst&&a.worst.name!=='Evidence coverage'){
      try{out=out.concat(diligenceSteps(a))}catch(e){}
    }
    out.push('Confirm the parcel sits inside the intended utility service territories.');
    out.push('Re-run the screen when written utility evidence changes.');
    return out.filter(function(v,i,arr){return arr.indexOf(v)===i}).slice(0,5);
  }

  function systemStrip(a){
    return '<div class="gg13-system-strip">'+a.rows.map(function(r){
      var st=statusFor(r);
      var value=r.known?(Math.round(r.ratio*100)+'%'):'—';
      return '<div class="'+st.cls+'"><span>'+esc(r.name)+'</span><b>'+value+'</b><em>'+st.label+'</em></div>';
    }).join('')+'</div>';
  }

  function evidenceRail(a){
    var known=a.rows.filter(function(r){return r.known}).length;
    return '<div class="gg13-evidence-rail">'+
      '<div><span>EVIDENCE COVERAGE</span><b>'+known+' / '+a.rows.length+' systems known</b></div>'+
      '<div class="gg13-segments">'+a.rows.map(function(r){return '<i class="'+(r.known?'known':'')+'" title="'+esc(r.name)+'"></i>'}).join('')+'</div>'+
      '<em>'+Math.round(a.completion*100)+'% complete</em>'+
    '</div>';
  }

  function renderCustom(a,stress){
    var result=$id('resultState');
    var empty=$id('emptyState');
    if(!result||!empty)return;
    var capRisk=a.verdict==='HOLD / RESCOPE'?'HIGH':a.verdict==='GO TO DILIGENCE'?'LOW':'MEDIUM';
    var ready=a.timingKnown?(a.sourceSite.lead+'–'+(a.sourceSite.lead+6)+' mo'):'UNKNOWN';
    var stressFlip=stress.verdict!==a.verdict||stress.score<a.score-12;
    var diligence=diligenceFor(a).map(function(x){return '<li>'+esc(x)+'</li>'}).join('');
    result.innerHTML=
      '<div class="gg13-custom-banner"><span>YOUR SITE / PROVISIONAL SCREEN</span><b>'+esc(a.s.name)+'</b><em>'+esc(a.sourceSite.market||'location not entered')+'</em></div>'+
      evidenceRail(a)+
      '<div class="result-grid">'+
        '<div><small>PROVISIONAL SCORE</small><b>'+a.score+' <span class="gg13-range">('+a.low+'–'+a.high+')</span></b></div>'+
        '<div><small>PRIMARY CONSTRAINT</small><b>'+esc(a.worst.name)+'</b></div>'+
        '<div><small>CAPITAL-AT-RISK SIGNAL</small><b>'+capRisk+'</b></div>'+
        '<div><small>SERVICE LEAD</small><b>'+ready+'</b></div>'+
      '</div>'+
      systemStrip(a)+
      '<div class="insight-grid">'+
        '<article class="insight-card"><h4>First diligence move</h4><p>'+esc(firstMove(a))+'</p></article>'+
        '<article class="insight-card"><h4>Evidence gap</h4><p><strong>'+a.unknown.length+' unknown system'+(a.unknown.length===1?'':'s')+'</strong><br>'+(a.unknown.length?esc(a.unknown.map(function(r){return r.name}).join(', ')):'All required systems have an entered screening value.')+'</p></article>'+
        '<article class="insight-card"><h4>Stress case</h4><p><strong>'+stress.score+'/100 · '+esc(stress.verdict)+'</strong><br>Tests faster delivery, higher growth and stricter evidence treatment. '+(stressFlip?'The decision materially deteriorates under stress.':'The decision remains directionally stable under stress.')+'</p></article>'+
        '<article class="insight-card"><h4>Proof standard</h4><p><strong>'+esc(a.sourceSite.evidence)+' · '+a.sourceSite.confidence+'%</strong><br>This is a screening judgment from user-supplied inputs, not a utility commitment or engineering determination.</p></article>'+
      '</div>'+
      '<div class="diligence"><div class="kicker">ORDERED DILIGENCE PATH</div><ol>'+diligence+'</ol></div>'+
      '<div class="actions-row">'+
        '<button class="smallbtn" id="gg13CopyCase" type="button">COPY CASE</button>'+
        '<button class="smallbtn" id="gg13ExportCase" type="button">EXPORT BRIEF</button>'+
        '<button class="smallbtn" id="gg13PrintCase" type="button">PRINT / PDF</button>'+
        '<button class="smallbtn" id="gg13PilotHandoff" type="button">PILOT HANDOFF</button>'+
      '</div>';
    empty.classList.add('hidden');
    result.classList.remove('hidden');
    document.body.classList.add('gg13-custom-result');
    window.setTimeout(function(){patchPulse(a)},20);
    bindCustomActions(a,stress);
  }

  function caseText(a,stress){
    var req=a.req;
    var lines=[
      'GAGE GRID — USER-SUPPLIED SITE SCREEN',
      'Generated: '+new Date().toLocaleString(),
      'Screening output only — utility verification required',
      '',
      'PROJECT',
      (projectPresets[req.projectType]&&projectPresets[req.projectType].label)||req.projectType,
      'Peak power: '+req.power+' MW',
      'Water / wastewater: '+req.water+' / '+req.waste+' MGD',
      'Gas: '+req.gas+' MMBtu/h',
      'Fiber requirement: level '+req.fiber,
      'Target online: '+req.timeline+' months',
      'Growth assumption: '+Math.round(req.growth*100)+'%',
      '',
      'SITE',
      a.s.name+(a.sourceSite.market?' — '+a.sourceSite.market:''),
      'Evidence quality: '+a.sourceSite.evidence+' ('+a.sourceSite.confidence+'% confidence)',
      'Known systems: '+a.rows.filter(function(r){return r.known}).length+'/'+a.rows.length,
      'Indicative service lead: '+(a.timingKnown?a.sourceSite.lead+' months':'unknown'),
      '',
      'DECISION',
      'Provisional score: '+a.score+'/100',
      'Uncertainty range: '+a.low+'–'+a.high,
      'Verdict: '+a.verdict,
      'Primary constraint: '+a.worst.name,
      'Stress case: '+stress.score+'/100 — '+stress.verdict,
      '',
      'SYSTEM COVERAGE'
    ];
    a.rows.forEach(function(r){
      lines.push(r.name+': '+(r.known?(Math.round(r.ratio*100)+'% risk-adjusted coverage | usable '+format(r.usable,r.name)+' | need '+format(r.need,r.name)):'UNKNOWN'));
    });
    lines=lines.concat(['','DILIGENCE ORDER']);
    diligenceFor(a).forEach(function(x,i){lines.push((i+1)+'. '+x)});
    lines=lines.concat(['','FIRST MOVE',firstMove(a)]);
    return lines.join('\n');
  }

  function copyText(text){
    if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text);
    return new Promise(function(resolve,reject){
      try{
        var area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';
        document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();resolve();
      }catch(e){reject(e)}
    });
  }

  function bindCustomActions(a,stress){
    var copy=$id('gg13CopyCase'),exp=$id('gg13ExportCase'),print=$id('gg13PrintCase'),hand=$id('gg13PilotHandoff');
    if(copy)copy.onclick=function(){
      copyText(caseText(a,stress)).then(function(){toast('Case copied.')});
      track('custom_case_copy',{verdict:a.verdict,completion:Math.round(a.completion*100)});
    };
    if(exp)exp.onclick=function(){
      downloadText('gage-grid-your-site-brief.txt',caseText(a,stress));
      track('custom_case_export',{verdict:a.verdict,completion:Math.round(a.completion*100)});
    };
    if(print)print.onclick=function(){window.print();track('custom_case_print')};
    if(hand)hand.onclick=function(){
      var access=$id('access');if(access)access.scrollIntoView({behavior:'smooth',block:'center'});
      var email=$id('email');if(email)window.setTimeout(function(){email.focus()},450);
      track('pilot_handoff_open',{source:'custom_site'});
    };
  }

  function patchPulse(a){
    var pulse=$id('gg12DecisionPulse');
    if(!pulse||mode!=='custom')return;
    var state=q('.gg12-pulse-state span',pulse);
    if(state)state.textContent=a.completion<1?'PROVISIONAL DECISION':'DECISION';
    var actions=q('.gg12-pulse-actions',pulse);
    if(actions){
      actions.innerHTML=
        '<button type="button" data-gg13-pulse="copy">COPY</button>'+
        '<button type="button" data-gg13-pulse="export">EXPORT</button>'+
        '<button type="button" data-gg13-pulse="handoff">HANDOFF</button>';
      qa('[data-gg13-pulse]',actions).forEach(function(btn){
        btn.onclick=function(){
          var action=btn.getAttribute('data-gg13-pulse');
          if(action==='copy'&&$id('gg13CopyCase'))$id('gg13CopyCase').click();
          if(action==='export'&&$id('gg13ExportCase'))$id('gg13ExportCase').click();
          if(action==='handoff'&&$id('gg13PilotHandoff'))$id('gg13PilotHandoff').click();
        };
      });
    }
  }

  function runCustomSite(){
    if(mode!=='custom')return;
    var site=customSite();
    var req=currentReq();
    var a=analyzeCustom(site,req,false);
    var stress=analyzeCustom(site,req,true);
    customLast={analysis:a,stress:stress};
    try{lastAnalysis=a}catch(e){}
    renderCustom(a,stress);
    persistCustomDraft();
    track('custom_site_screen',{
      evidence:site.evidence,
      completion:Math.round(a.completion*100),
      verdict:a.verdict,
      project:req.projectType
    });
  }

  function interceptAnalyse(){
    var button=$id('analyseBtn');
    if(!button)return;
    button.addEventListener('click',function(e){
      if(mode!=='custom')return;
      e.preventDefault();
      e.stopImmediatePropagation();
      runCustomSite();
    },true);
    if(baseRunAnalysis){
      try{
        runAnalysis=function(){
          if(mode==='custom')return runCustomSite();
          return baseRunAnalysis();
        };
      }catch(e){}
    }
  }

  function resetCustom(){
    ['gg13SiteName','gg13Market','gg13Power','gg13Water','gg13Waste','gg13Gas','gg13Lead'].forEach(function(id){var el=$id(id);if(el)el.value=''});
    if($id('gg13Evidence'))$id('gg13Evidence').value='Reported';
    if($id('gg13Confidence'))$id('gg13Confidence').value='75';
    if($id('gg13Fiber'))$id('gg13Fiber').value='';
    if($id('gg13Redundancy'))$id('gg13Redundancy').value='';
    customLast=null;
    try{localStorage.removeItem('gagegrid-custom-site-draft')}catch(e){}
    var result=$id('resultState'),empty=$id('emptyState'),pulse=$id('gg12DecisionPulse');
    if(result){result.innerHTML='';result.classList.add('hidden')}
    if(empty)empty.classList.remove('hidden');
    if(pulse)pulse.remove();
    document.body.classList.remove('gg13-custom-result');
    track('custom_site_reset');
  }

  function persistCustomDraft(){
    var draft={};
    ['gg13SiteName','gg13Market','gg13Evidence','gg13Power','gg13Water','gg13Waste','gg13Gas','gg13Fiber','gg13Redundancy','gg13Lead','gg13Confidence'].forEach(function(id){
      var el=$id(id);if(el)draft[id]=el.value;
    });
    draft.savedAt=Date.now();
    try{localStorage.setItem('gagegrid-custom-site-draft',JSON.stringify(draft))}catch(e){}
  }

  function restoreCustomDraft(){
    try{
      var draft=JSON.parse(localStorage.getItem('gagegrid-custom-site-draft')||'null');
      if(!draft||!draft.savedAt||Date.now()-draft.savedAt>1000*60*60*24*30)return;
      Object.keys(draft).forEach(function(id){
        if(id==='savedAt')return;
        var el=$id(id);if(el&&draft[id]!=null)el.value=draft[id];
      });
    }catch(e){}
  }

  function addTrustStrip(){
    var panel=$id('access');
    if(!panel||q('.gg13-trust',panel))return;
    var strip=document.createElement('div');
    strip.className='gg13-trust';
    strip.innerHTML='<span>NO ACCOUNT REQUIRED</span><span>LOCAL PROTOTYPE DRAFT</span><span>EXPORTABLE CASE BRIEF</span><span>UTILITY VERIFICATION REQUIRED</span>';
    panel.appendChild(strip);
    var form=$id('accessForm');
    if(form){
      form.addEventListener('submit',function(){
        track('pilot_brief_copy',{source:mode==='custom'?'custom_site':'pilot_node'});
      },true);
    }
    var mail=$id('gg12MailBtn');
    if(mail)mail.addEventListener('click',function(){track('pilot_email_draft',{source:mode==='custom'?'custom_site':'pilot_node'})});
  }

  function addAnalyticsHooks(){
    var rank=$id('rankAllBtn');
    if(rank)rank.addEventListener('click',function(){track('pilot_rank_run',{project:$id('projectType')?$id('projectType').value:'unknown'})});
    var exportRank=$id('exportRankBtn');
    if(exportRank)exportRank.addEventListener('click',function(){track('ranking_export')});
    var registry=$id('registryToggleBtn');
    if(registry)registry.addEventListener('click',function(){track('registry_expand')});
  }

  function boot(){
    document.body.classList.add('gg13-runtime');
    setHero();
    setMetrics();
    installMode();
    interceptAnalyse();
    addTrustStrip();
    addAnalyticsHooks();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();