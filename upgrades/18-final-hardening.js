'use strict';
(()=>{
  const G=window.GGX;if(!G)return;
  const STORAGE='gage-grid-project-brief-v1';
  function install(){
    const brief=document.getElementById('ggxBrief');if(!brief)return;
    if(!new URLSearchParams(location.search).has('brief')&&!brief.value){try{const saved=localStorage.getItem(STORAGE);if(saved){brief.value=saved;brief.dispatchEvent(new Event('input',{bubbles:true}))}}catch(_e){}}
    brief.addEventListener('input',()=>{try{localStorage.setItem(STORAGE,brief.value)}catch(_e){}});
    document.addEventListener('keydown',event=>{
      const tag=document.activeElement?.tagName?.toLowerCase(),typing=['input','textarea','select'].includes(tag);
      if(event.key==='/'&&!typing){event.preventDefault();brief.focus();brief.select()}
      if((event.metaKey||event.ctrlKey)&&event.key==='Enter'){event.preventDefault();document.getElementById('ggxBest')?.click()}
      if(event.key==='Escape'&&document.activeElement===brief)brief.blur();
    });
    const status=document.getElementById('ggxBriefStatus');if(status&&!document.getElementById('ggxShortcutHint')){const hint=document.createElement('small');hint.id='ggxShortcutHint';hint.className='ggx-shortcut-hint';hint.textContent='Shortcut: / focuses the project brief · ⌘/Ctrl + Enter finds the best site';status.insertAdjacentElement('afterend',hint)}
    const gate=document.getElementById('decision-gate');if(gate){gate.setAttribute('aria-live','polite');gate.setAttribute('aria-label','Gage Grid decision gate')}
    ['analyseBtn','ggxBest','ggxAuto'].forEach(id=>{const el=document.getElementById(id);if(el&&!el.getAttribute('aria-label'))el.setAttribute('aria-label',el.textContent.trim())});
  }
  G.injectStyle('ggx-final-hardening-style',`
    .ggx-shortcut-hint{display:block;margin-top:7px;color:#6f766a!important;font:700 8px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}.ggx-gate[aria-live]{scroll-margin-top:88px}.ggx-gate button[disabled],.analyse[disabled]{opacity:.55;cursor:wait}@media(max-width:700px){.ggx-shortcut-hint{display:none}}
  `);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();