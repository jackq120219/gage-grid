import fs from 'node:fs';
const live=JSON.parse(fs.readFileSync('data/live-source-integrations-v1.json','utf8'));
const ui=fs.readFileSync('upgrades/50-public-evidence-layer.js','utf8');
let bad=0;const fail=m=>{console.error(`LIVE SOURCE: ${m}`);bad++};
for(const s of live.sources||[]){const file=s.endpoint.replace(/^\/api\//,'api/')+'.js';if(!fs.existsSync(file))fail(`${s.id} endpoint file missing: ${file}`)}
for(const endpoint of ['/api/usgs-water','/api/epa-echo'])if(!live.sources.some(s=>s.endpoint===endpoint&&s.status==='integrated'))fail(`registry missing ${endpoint}`);
if(!ui.includes('/api/epa-echo'))fail('public evidence UI is not connected to EPA ECHO');
if(!ui.includes('does not prove sewer or treatment capacity'))fail('EPA interpretation guardrail missing from UI');
if(bad)process.exit(1);console.log('LIVE SOURCE AUDIT OK: USGS + EPA ECHO integrations wired with serviceability guardrails');
