'use strict';
const nodes={
  'GG-IL-101':{name:'Joliet South',lat:41.525,lng:-88.081,gauge:'05537980'},
  'GG-IL-102':{name:'Elwood Logistics Belt',lat:41.404,lng:-88.111,gauge:'05527500'},
  'GG-IL-103':{name:'Rockford East',lat:42.271,lng:-88.947,gauge:'05437645'},
  'GG-IL-104':{name:'Decatur Industrial Core',lat:39.840,lng:-88.954,gauge:'05573540'},
  'GG-IL-105':{name:'Aurora West',lat:41.760,lng:-88.380,gauge:'05551540'},
  'GG-IL-106':{name:'Kankakee North',lat:41.120,lng:-87.860,gauge:'05527500'},
  'GG-IN-201':{name:'Burns Harbor West',lat:41.620,lng:-87.130,gauge:'04094000'},
  'GG-IN-202':{name:'Gary South',lat:41.550,lng:-87.350,gauge:'05536195'},
  'GG-IN-203':{name:'South Bend Tech Belt',lat:41.680,lng:-86.250,gauge:'04101225'},
  'GG-IN-204':{name:'Fort Wayne North',lat:41.080,lng:-85.140,gauge:'04182900'},
  'GG-IN-205':{name:'Lafayette East',lat:40.420,lng:-86.820,gauge:'03335500'},
  'GG-IN-206':{name:'Evansville North',lat:38.000,lng:-87.550,gauge:'03322011'}
};
const rad=x=>x*Math.PI/180;
const miles=(a,b,c,d)=>{const R=3958.8,dp=rad(c-a),dl=rad(d-b),q=Math.sin(dp/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(dl/2)**2;return 2*R*Math.asin(Math.sqrt(q))};
const ageMinutes=value=>{const t=new Date(value).getTime();return Number.isFinite(t)?Math.max(0,Math.round((Date.now()-t)/60000)):null};
const freshness=mins=>mins==null?'unknown':mins<=180?'current':mins<=1440?'aging':'stale';
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=900, stale-while-revalidate=3600');
  const id=String(req.query?.site||'').trim(),node=nodes[id];
  if(!node)return res.status(400).json({ok:false,error:'Unknown pilot site'});
  const url=`https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${encodeURIComponent(node.gauge)}&parameterCd=00060&siteStatus=all`;
  try{
    const r=await fetch(url,{headers:{'User-Agent':'GageGrid/1.1 (public-evidence prototype)','Accept':'application/json'},signal:AbortSignal.timeout(6500)});
    if(!r.ok)throw new Error(`USGS ${r.status}`);
    const data=await r.json(),series=data?.value?.timeSeries||[];
    const candidates=series.map(s=>{const geo=s?.sourceInfo?.geoLocation?.geogLocation||{},lat=Number(geo.latitude),lng=Number(geo.longitude),values=s?.values?.[0]?.value||[],latest=[...values].reverse().find(v=>Number.isFinite(Number(v?.value))),value=Number(latest?.value);if(!Number.isFinite(lat)||!Number.isFinite(lng)||!Number.isFinite(value))return null;const observationAgeMinutes=ageMinutes(latest?.dateTime);const qualifiers=latest?.qualifiers||[];return{station:s?.sourceInfo?.siteName||s?.sourceInfo?.siteCode?.[0]?.value||'USGS gauge',siteCode:s?.sourceInfo?.siteCode?.[0]?.value||node.gauge,lat,lng,flowCfs:value,observedAt:latest?.dateTime||null,observationAgeMinutes,freshnessStatus:freshness(observationAgeMinutes),qualifiers,provisional:qualifiers.includes('P'),distanceMiles:miles(node.lat,node.lng,lat,lng)}}).filter(Boolean).sort((a,b)=>a.distanceMiles-b.distanceMiles);
    const nearest=candidates[0]||null;
    return res.status(200).json({ok:!!nearest,dataStatus:nearest?'live-public':'unavailable',site:{id,name:node.name,lat:node.lat,lng:node.lng,coordinateBasis:'pilot node / city-area approximation, not parcel geocode'},source:{authority:'U.S. Geological Survey',dataset:'NWIS instantaneous values',parameter:'Discharge, parameter 00060',url:'https://waterdata.usgs.gov/nwis',monitoringLocation:node.gauge,selectionBasis:'preselected nearby continuous monitoring location; proximity is context, not service territory'},upstreamStatus:r.status,gaugesFound:candidates.length,nearest:nearest?{...nearest,distanceMiles:Number(nearest.distanceMiles.toFixed(1))}:null,error:nearest?null:'Selected USGS monitoring location did not return a current numeric discharge observation.',retrievedAt:new Date().toISOString(),interpretation:'Observed surface-water hydrology is public context only. It does not establish municipal water capacity, allocation, pressure, treatment headroom or serviceability.'});
  }catch(error){return res.status(200).json({ok:false,dataStatus:'unavailable',site:{id,name:node.name},source:{authority:'U.S. Geological Survey',dataset:'NWIS instantaneous values',monitoringLocation:node.gauge},error:'Live USGS water context is temporarily unavailable.',detail:String(error?.message||error),retrievedAt:new Date().toISOString()})}
};
