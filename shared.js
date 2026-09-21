(() => {
 const key='elderly-participation-v1';
 window.localDay=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 window.readSaved=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key));return value??fallback;}catch{return fallback;}};
 window.recordParticipation=entry=>{try{const entries=readSaved(key,[]);if(entries.some(x=>x.id===entry.id))return true;entries.push({...entry,time:new Date().toISOString(),day:localDay()});localStorage.setItem(key,JSON.stringify(entries));return true;}catch{return false;}};
 window.participationFor=day=>readSaved(key,[]).filter(x=>x.day===day);
 const child=/\/(brain|motion|life|chat)\/[^/]*$/.test(location.pathname);
 const embedded=window.parent!==window&&new URLSearchParams(location.search).get('embedded')==='1';
 if(embedded){
  document.documentElement.classList.add('embedded');
  if(!child)document.documentElement.classList.add('embedded-results');
  const css=document.createElement('link');css.rel='stylesheet';css.href=(child?'../':'')+'embedded.css';document.head.append(css);
  document.addEventListener('click',e=>{
   const a=e.target.closest('a');if(!a||a.hasAttribute('download'))return;
   const url=new URL(a.href,location.href);if(url.origin!==location.origin)return;
   const module=url.pathname.match(/\/(brain|motion|life|chat)\/index\.html$/);
   const rootPage=!module&&/\/(index|results|app)\.html$/.test(url.pathname);
   let section=module?.[1];
   if(rootPage)section=['home','brain','motion','life','chat','results'].includes(url.hash.slice(1))?url.hash.slice(1):url.pathname.endsWith('/results.html')?'results':'home';
   if(!section)return;e.preventDefault();e.stopPropagation();parent.postMessage({type:'portal:navigate',section},location.origin==='null'?'*':location.origin);
  },true);
 }
 if(child){
  if(!embedded){const bar=document.createElement('nav');bar.className='hubbar';bar.setAttribute('aria-label','整合網站導覽');bar.innerHTML='<a href="../index.html">⌂ 回首頁</a><a href="../app.html#results">我的成果 →</a>';document.body.prepend(bar);}
  const home=document.getElementById('home');if(home){home.textContent='‹ 活動選單';home.setAttribute('aria-label','回到這個階段的活動選單');}
 }
})();
