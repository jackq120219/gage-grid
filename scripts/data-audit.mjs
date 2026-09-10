import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sites=read('data/pilot-sites-v2.json'),presets=read('data/project-presets-v2.json'),registry=read('data/public-source-registry-v1.json'),evidence=read('data/evidence-contract-v1.json');
let bad=0;const fail=m=>{console.error(`DATA: ${m}`);bad++};
if(sites.capacity_data_status!=='simulated')fail('pilot capacity status must remain simulated');
if(sites.sites?.length!==12)fail('expected 12 pilot sites');
if(new Set((sites.sites||[]).map(s=>s.id)).size!==12)fail('pilot site ids must be unique');
for(const s of sites.sites||[]){if(!['IL','IN'].includes(s.state))fail(`bad state ${s.id}`);if(!/^\d{8}$/.test(s.usgs_gauge||''))fail(`bad USGS gauge ${s.id}`);if(!Number.isFinite(s.lat)||!Number.isFinite(s.lng))fail(`bad coordinates ${s.id}`)}
if(Object.keys(presets.presets||{}).length!==8)fail('expected 8 project presets');
for(const [id,p] of Object.entries(presets.presets||{}))for(const key of ['power','water','wastewater','gas','fiber','redundancy'])if(!Number.isFinite(p[key]))fail(`preset ${id} missing ${key}`);
if((registry.sources||[]).length<5)fail('source registry missing systems');
for(const s of registry.sources||[]){if(!/^https:\/\//.test(s.url||''))fail(`source ${s.system} is not https`);if(!Number.isFinite(s.freshness_target_days))fail(`source ${s.system} missing freshness target`)}
if(Object.keys(registry.utility_candidates||{}).length!==12)fail('utility candidate coverage must match 12 sites');
if(!evidence.states?.['utility-commitment']?.can_prove_serviceability)fail('utility commitment must be the only positive serviceability state');
for(const [k,v] of Object.entries(evidence.states||{}))if(k!=='utility-commitment'&&v.can_prove_serviceability)fail(`${k} cannot prove serviceability`);
if(bad)process.exit(1);console.log(`DATA AUDIT OK: ${sites.sites.length} sites, ${Object.keys(presets.presets).length} presets, ${registry.sources.length} public systems`);
