'use strict';
const sites=require('../data/pilot-sites-v2.json');
const presets=require('../data/project-presets-v2.json');
const evidence=require('../data/evidence-contract-v1.json');
module.exports=async function handler(_req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).json({ok:true,capacityDataStatus:sites.capacity_data_status,sites,presets,evidence});
};
