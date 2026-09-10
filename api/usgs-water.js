'use strict';
const nodes={
  'GG-IL-101':{name:'Joliet South',lat:41.525,lng:-88.081},
  'GG-IL-102':{name:'Elwood Logistics Belt',lat:41.404,lng:-88.111},
  'GG-IL-103':{name:'Rockford East',lat:42.271,lng:-88.947},
  'GG-IL-104':{name:'Decatur Industrial Core',lat:39.840,lng:-88.954},
  'GG-IL-105':{name:'Aurora West',lat:41.760,lng:-88.380},
  'GG-IL-106':{name:'Kankakee North',lat:41.120,lng:-87.860},
  'GG-IN-201':{name:'Burns Harbor West',lat:41.620,lng:-87.130},
  'GG-IN-202':{name:'Gary South',lat:41.550,lng:-87.350},
  'GG-IN-203':{name:'South Bend Tech Belt',lat:41.680,lng:-86.250},
  'GG-IN-204':{name:'Fort Wayne North',lat:41.080,lng:-85.140},
  'GG-IN-205':{name:'Lafayette East',lat:40.420,lng:-86.820},
  'GG-IN-206':{name:'Evansville North',lat:38.000,lng:-87.550}
};
const rad=x=>x*Math.PI/180;
const miles=(a,b,c,d)=>{const R=3958.8,dp=rad(c-a),dl=rad(d-b),q=Math.sin(dp/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(dl/2)**2;return 2*R*Math.asin(Math.sqrt(q))};
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=900, stale-while-revalidate=3600');
  const id=String(req.query?.site||'').trim(),node=nodes[id];
  if(!node)return res.status(400).json({ok:false,error:'Unknown pilot site'});
  const span=.35,bbox=[node.lng-span,node.lat-span,node.lng+span,node.lat+span].map(v=>v.toFixed(4)).join(',');
  const url=`https://waterservices.usgs.gov/nwis/iv/?format=json&bBox=${encodeURIComponent(bbox)}&parameterCd=00060&siteStatus=active`;
  try{
    const r=await fetch(url,{headers:{'User-Agent':'GageGrid/1.0 (public-evidence prototype)','Accept':'application/json'},signal:AbortSignal.timeout(8000)});
    if(!r.ok)throw new Error(`USGS ${r.status}`);
    const data=await r.json(),series=data?.value?.timeSeries||[];
    const candidates=series.map(s=>{const geo=s?.sourceInfo?.geoLocation?.geogLocation||{},lat=Number(geo.latitude),lng=Number(geo.longitude),latest=s?.values?.[0]?.value?.at?.(-1),value=Number(latest?.value);if(!Number.isFinite(lat)||!Number.isFinite(lng)||!Number.isFinite(value))return null;return{station:s?.sourceInfo?.siteName||s?.sourceInfo?.siteCode?.[0]?.value||'USGS gauge',siteCode:s?.sourceInfo?.siteCode?.[0]?.value||'',lat,lng,flowCfs:value,observedAt:latest?.dateTime||null,qualifiers:latest?.qualifiers||[],distanceMiles:miles(node.lat,node.lng,lat,lng)}}).filter(Boolean).sort((a,b)=>a.distanceMiles-b.distanceMiles);
    const nearest=candidates[0]||null;
    return res.status(200).json({ok:true,site:{id,name:node.name,lat:node.lat,lng:node.lng,coordinateBasis:'pilot node / city-area approximation, not parcel geocode'},source:{authority:'U.S. Geological Survey',dataset:'NWIS instantaneous values',parameter:'Discharge, parameter 00060',url:'https://waterdata.usgs.gov/nwis'},gaugesFound:candidates.length,nearest:nearest?{...nearest,distanceMiles:Number(nearest.distanceMiles.toFixed(1))}:null,retrievedAt:new Date().toISOString(),interpretation:'Observed surface-water hydrology is public context only. It does not establish municipal water capacity, allocation, pressure, treatment headroom or serviceability.'});
  }catch(error){return res.status(200).json({ok:false,site:{id,name:node.name},source:{authority:'U.S. Geological Survey',dataset:'NWIS instantaneous values'},error:'Live USGS water context is temporarily unavailable.',detail:String(error?.message||error),retrievedAt:new Date().toISOString()})}
};
