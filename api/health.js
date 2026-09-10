'use strict';
const sites=require('../data/pilot-sites-v2.json');
const presets=require('../data/project-presets-v2.json');
const registry=require('../data/public-source-registry-v1.json');
const evidence=require('../data/evidence-contract-v1.json');
const live=require('../data/live-source-integrations-v1.json');
module.exports=async function handler(_req,res){
  res.setHeader('Cache-Control','no-store');
  const integrated=(live.sources||[]).filter(s=>s.status==='integrated');
  const checks={siteCount:sites.sites?.length===12,presetCount:Object.keys(presets.presets||{}).length===8,sourceSystems:new Set((registry.sources||[]).map(s=>s.system)).size>=5,evidenceStates:Object.keys(evidence.states||{}).length>=6,capacityExplicitlySimulated:sites.capacity_data_status==='simulated',liveIntegrations:integrated.length>=2,liveSourcesCannotProveServiceability:integrated.every(s=>s.can_prove_serviceability===false)};
  const ok=Object.values(checks).every(Boolean);
  return res.status(ok?200:503).json({ok,product:'Gage Grid',checks,versions:{sites:sites.version,presets:presets.version,sources:registry.version,evidence:evidence.version,liveIntegrations:live.version},reviewedAt:registry.reviewed_at,integratedSources:integrated.map(s=>({id:s.id,endpoint:s.endpoint,decisionUse:s.decision_use})),checkedAt:new Date().toISOString()});
};
