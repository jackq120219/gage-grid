'use strict';
(()=>{
 const files=['40-readiness-path.js','41-evidence-provenance.js','42-shortlist-workspace.js','43-change-impact.js','44-decision-pack.js','45-project-memory.js'];let i=0;
 function next(){if(i>=files.length)return;const s=document.createElement('script');s.src=`/upgrades/${files[i++]}`;s.defer=true;s.onload=next;s.onerror=next;document.head.appendChild(s)}
 next();
})();