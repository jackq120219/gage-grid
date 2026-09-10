'use strict';
const pilot=require('../data/pilot-sites-v2.json');
const number=v=>{const raw=String(v??'').trim();if(!raw)return null;const cleaned=raw.replace(/[^0-9.-]/g,'');if(!cleaned||cleaned==='-'||cleaned==='.'||cleaned==='-.')return null;const n=Number(cleaned);return Number.isFinite(n)?n:null};
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=1800, stale-while-revalidate=7200');
  const id=String(req.query?.site||'').trim(),site=(pilot.sites||[]).find(s=>s.id===id);
  if(!site)return res.status(400).json({ok:false,error:'Unknown pilot site'});
  const radius=Math.min(20,Math.max(1,Number(req.query?.radius)||10));
  const qs=new URLSearchParams({output:'JSON',p_lat:String(site.lat),p_long:String(site.lng),p_radius:String(radius),responseset:'12',tablelist:'Y',summarylist:'Y'});
  const url=`https://echodata.epa.gov/echo/echo_rest_services.get_facilities?${qs}`;
  try{
    const upstream=await fetch(url,{headers:{Accept:'application/json','User-Agent':'GageGrid/1.0 public-evidence'},signal:AbortSignal.timeout(7000)});
    if(!upstream.ok)throw new Error(`EPA ECHO ${upstream.status}`);
    const data=await upstream.json(),r=data?.Results||data||{};
    const raw=Array.isArray(r.Facilities)?r.Facilities:Array.isArray(r.Facility)?r.Facility:Array.isArray(r.TableOutput)?r.TableOutput:[];
    const facilities=raw.slice(0,12).map(f=>({registryId:f.RegistryID||f.RegistryId||f.FacRegistryID||null,name:f.FacName||f.FacilityName||f.FacNameClean||null,city:f.FacCity||null,state:f.FacState||null,latitude:number(f.FacLat),longitude:number(f.FacLong)}));
    const message=String(r.Message||'').trim();
    const success=/success|working/i.test(message)||r.QueryRows!=null;
    return res.status(200).json({ok:success,dataStatus:success?'live-public':'unavailable',site:{id:site.id,name:site.name,lat:site.lat,lng:site.lng,coordinateBasis:pilot.coordinate_basis},radiusMiles:radius,summary:{regulatedFacilities:number(r.QueryRows)??facilities.length,currentNoncompliance:number(r.CVRows),recentNoncompliance:number(r.V3Rows),significantViolations:number(r.SVRows),violationsLast4Q:number(r.VioLast4QRows),totalPenalties:r.TotalPenalties||null},facilities,source:{authority:'U.S. Environmental Protection Agency',dataset:'ECHO All Media Programs Facility Search',url:'https://echo.epa.gov/',queryMessage:message||null},retrievedAt:new Date().toISOString(),interpretation:'Nearby regulated-facility and compliance records are environmental diligence context. They do not establish wastewater treatment headroom, collection capacity, discharge permission or parcel serviceability.'});
  }catch(error){return res.status(200).json({ok:false,dataStatus:'unavailable',site:{id:site.id,name:site.name},radiusMiles:radius,error:'EPA ECHO context is temporarily unavailable.',detail:String(error?.message||error),source:{authority:'U.S. Environmental Protection Agency',dataset:'ECHO'},retrievedAt:new Date().toISOString()})}
};
