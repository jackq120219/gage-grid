'use strict';
(()=>{
  function install(){
    let theme=document.querySelector('meta[name="theme-color"]');if(!theme){theme=document.createElement('meta');theme.name='theme-color';document.head.appendChild(theme)}theme.content='#e8ecef';
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="14" fill="#f6f8f9"/><path d="M16 24h64M16 48h64M16 72h64M24 16v64M48 16v64M72 16v64" stroke="#c8d2d8" stroke-width="2"/><rect x="24" y="24" width="48" height="48" fill="none" stroke="#2f55d9" stroke-width="5"/><path d="M48 28v40M28 48h40" stroke="#ff5a36" stroke-width="5"/><circle cx="48" cy="48" r="6" fill="#171d22"/></svg>`;
    const href=`data:image/svg+xml,${encodeURIComponent(svg)}`;let icon=document.querySelector('link[rel="icon"]');if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon)}icon.href=href;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();