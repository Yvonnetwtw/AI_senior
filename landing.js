const requested=location.hash.slice(1);
if(portalSections.some(s=>s.id===requested))location.replace('app.html#'+requested);
document.getElementById('entry-menu').innerHTML=portalSections.map(s=>`<a class="entry-link" href="app.html#${s.id}" style="--section:${s.color}">${portalIcon(s.id)}<span>${s.title}</span><span class="chevron" aria-hidden="true">›</span></a>`).join('');
document.getElementById('listen').innerHTML=portalIcon('sound')+'<span>聽說明</span>';
document.getElementById('listen').onclick=()=>{const status=document.getElementById('voice-status');if(!('speechSynthesis'in window)){status.textContent='這個瀏覽器無法播放，請閱讀畫面文字。';return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance('歡迎來到動腦動手互動站。選一個活動開始。進入後，可以用上方選單切換活動。按回首頁，就會回到這裡。聊天目前為介面試用。');u.lang='zh-TW';u.rate=.85;u.onerror=()=>status.textContent='語音暫時無法播放，請閱讀畫面文字。';speechSynthesis.speak(u);};
window.addEventListener('pagehide',()=>{if('speechSynthesis'in window)speechSynthesis.cancel();});
