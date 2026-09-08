'use strict';
(()=>{
 const files=['40-readiness-path.js','41-evidence-provenance.js','42-shortlist-workspace.js','43-change-impact.js','44-decision-pack.js','45-project-memory.js','46-company-platform-map.js','40-preference-engine.js','47-executive-polish.js','48-diligence-tracker.js','49-screening-queue.js','50-public-evidence-layer.js'];let i=0;
 function next(){if(i>=files.length)return;const src=`/upgrades/${files[i++]}`;if(document.querySelector(`script[src="${src}"]`))return next();const s=document.createElement('script');s.src=src;s.defer=true;s.onload=next;s.onerror=next;document.head.appendChild(s)}
 next();
})();