'use strict';
(()=>{
  const files=['54-state-source-registry.js','55-verification-gap.js','56-source-freshness.js','57-requirement-delta.js','58-capital-gate.js','59-shortlist-reason.js','60-confidence-floor.js','61-provenance-export.js','62-mobile-quick-nav.js','63-sprint-accessibility.js','64-scenario-draft.js','65-registry-density.js','66-print-pack.js','67-shortlist-copy.js','68-registry-filter.js'];
  let i=0;
  function next(){if(i>=files.length)return;const file=files[i++];if(document.querySelector(`script[data-gg-sep9="${file}"]`)){next();return}const s=document.createElement('script');s.src=`/upgrades/${file}`;s.dataset.ggSep9=file;s.onload=next;s.onerror=next;document.body.appendChild(s)}
  next();
})();