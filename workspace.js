const frame=document.getElementById('activity-frame'),loading=document.getElementById('loading');let current='';
document.getElementById('workspace-menu').innerHTML=portalSections.map(s=>`<a href="#${s.id}" data-section="${s.id}" style="--section:${s.color}" aria-controls="activity-frame">${portalIcon(s.id)}<span>${s.title}</span></a>`).join('');
function showSection(force=false){const wanted=location.hash.slice(1),section=portalSections.find(s=>s.id===wanted)||portalSections[0];if(wanted!==section.id)history.replaceState(null,'','#'+section.id);if(current===section.id&&force!==true)return;current=section.id;loading.hidden=false;document.title=section.title+'｜日常・長者互動科技';document.querySelectorAll('[data-section]').forEach(a=>{if(a.dataset.section===section.id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});try{frame.contentWindow.dispatchEvent(new Event('pagehide'));}catch{}frame.title=section.title;frame.src=section.url;}
frame.onload=()=>{loading.hidden=true;try{frame.contentWindow.scrollTo(0,0);}catch{}};
window.addEventListener('hashchange',showSection);
document.querySelectorAll('[data-section]').forEach(a=>a.addEventListener('click',()=>{if(a.dataset.section===current)showSection(true);}));
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();document.getElementById('workspace-content').focus();});
window.addEventListener('message',e=>{if(e.source!==frame.contentWindow||e.origin!==location.origin||e.data?.type!=='portal:navigate')return;const id=e.data.section;if(id==='home')location.href='index.html';else if(portalSections.some(s=>s.id===id)){if(location.hash==='#'+id){try{frame.contentWindow.scrollTo(0,0);}catch{}}else location.hash=id;}});
window.addEventListener('pagehide',()=>{try{frame.contentWindow.dispatchEvent(new Event('pagehide'));}catch{}});
showSection();
