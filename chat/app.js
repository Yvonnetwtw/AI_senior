const main=document.querySelector('#main');
const statusBox=document.querySelector('#status');
const topics={
 memory:{title:'以前的生活',caption:'聊聊以前的日子與回憶',opener:'以前的家裡，有哪一樣東西讓你印象最深？',example:'如果願意，可以再說說它的樣子，或是和它有關的回憶。'},
 food:{title:'喜歡的食物',caption:'一道菜，也是一段故事',opener:'你最喜歡吃哪一道菜？',example:'這道菜通常是誰做給你吃的？',},
 today:{title:'今天的活動',caption:'說說今天做了什麼',opener:'今天做了什麼，讓你覺得開心？',example:'你願意多說一點當時的情況嗎？'}
};
let hubChatRun='';
let view='home',topic='memory',messages=[],draft='',feedback='',recognition=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mic='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg>';
function tell(text){statusBox.textContent=text;}
function stop(){if(recognition){recognition.abort();recognition=null;}if('speechSynthesis' in window)speechSynthesis.cancel();}
function go(next){stop();view=next;tell('');render();window.scrollTo(0,0);main.querySelector('h1').focus();}
document.querySelector('#home').onclick=()=>go('home');
function start(key){hubChatRun='chat-'+Date.now()+'-'+Math.random();topic=key;messages=[{role:'example',text:topics[key].opener}];draft='';feedback='';go('chat');}
function render(){
 document.title=(view==='chat'?topics[topic].title:'聊聊天')+'｜日常';
 if(view==='home')main.innerHTML=`<div class="eyebrow">慢慢說，我們一起聊。</div><h1 tabindex="-1">今天想聊什麼？</h1><p class="lead">選一個話題，用說的或打字都可以。</p><div class="topics">${Object.entries(topics).map(([key,t])=>`<button class="topic" data-topic="${key}"><span class="art ${key}" aria-hidden="true"></span><span><strong>${t.title}</strong><small>${t.caption}</small></span><span class="arrow" aria-hidden="true">›</span></button>`).join('')}</div><p class="tip">一次聊一件事，想休息時，按「結束聊天」。</p>`;
 if(view==='chat')main.innerHTML=`<div class="chat-head"><div><div class="eyebrow">聊一聊</div><h1 tabindex="-1">${topics[topic].title}</h1></div><button class="secondary end" id="end">結束聊天</button></div><div class="thread" aria-label="對話內容">${messages.map((m,i)=>`<article class="message ${m.role==='user'?'user-message':''}"><span class="speaker">${m.role==='user'?'你說的':'AI 回覆示意'}</span><p>${esc(m.text)}</p>${m.role==='example'?`<button class="secondary listen" data-read="${i}">♫ 聽這一句</button>`:''}</article>`).join('')}</div><div class="composer"><button class="primary full mic" id="mic" aria-pressed="false">${mic}<span>點一下，開始說</span></button><p class="hint">說完再按一次停止；確認文字後送出。</p><label for="draft">我想說的話</label><textarea id="draft" placeholder="也可以直接在這裡打字…">${esc(draft)}</textarea><div class="row actions"><button class="secondary" id="clear">清除文字</button><button class="primary" id="send">送出這句</button></div><p class="demo-note">試用版只呈現你的文字。想看後續畫面，可按下方「看回覆示意」。</p><button class="secondary full" id="example">看回覆示意</button></div>`;
 if(view==='finish')main.innerHTML=`<div class="finish-icon" aria-hidden="true">✓</div><div class="eyebrow">今天先聊到這裡。</div><h1 tabindex="-1">謝謝你的分享</h1><p class="lead">今天聊的是「${topics[topic].title}」。</p><h2>這次聊天的感覺如何？</h2><div class="feedback">${[['☺','喜歡'],['◉','普通'],['☹','不喜歡']].map(([icon,label])=>`<button data-feedback="${label}" aria-pressed="${feedback===label}"><span aria-hidden="true">${icon}</span>${label}</button>`).join('')}</div><p class="hint">回饋僅供這次介面試用，尚未儲存。</p><button class="primary full" id="again">再聊一個話題</button><button class="secondary full" id="back">回活動選單</button>`;
 bind();
}
function bind(){
 const click=(id,fn)=>{const e=document.getElementById(id);if(e)e.onclick=fn;};
 main.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>start(b.dataset.topic));
 main.querySelectorAll('[data-read]').forEach(b=>b.onclick=()=>read(messages[Number(b.dataset.read)].text));
 main.querySelectorAll('[data-feedback]').forEach(b=>b.onclick=()=>{feedback=b.dataset.feedback;render();tell(`已選擇「${feedback}」。`);});
 const input=document.getElementById('draft');if(input)input.oninput=e=>draft=e.target.value;
 click('end',()=>{if(messages.some(m=>m.role==='user'))window.recordParticipation({id:hubChatRun,kind:'chat-demo',activity:'聊天介面試用',completed:true});go('finish');});click('back',()=>go('home'));click('again',()=>go('home'));
 click('clear',()=>{stop();draft='';render();document.getElementById('draft').focus();tell('文字已清除。');});
 click('send',()=>{if(!draft.trim()){tell('請先說話或輸入文字。');document.getElementById('draft').focus();return;}stop();messages.push({role:'user',text:draft.trim()});draft='';render();tell('已顯示你的文字。AI 尚未連接，現在不會產生回覆。');document.querySelector('.user-message:last-child')?.scrollIntoView({block:'center'});});
 click('example',()=>{stop();messages.push({role:'example',text:topics[topic].example});render();tell('這是固定回覆示意，並非根據你的文字產生。');document.querySelector('.thread article:last-child').scrollIntoView({block:'center'});});
 click('mic',listen);
}
function read(text){
 if(!('speechSynthesis' in window)){tell('這個瀏覽器無法播放語音，請閱讀畫面文字。');return;}
 stop();resetMic();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='zh-TW';utterance.rate=.85;
 utterance.onstart=()=>tell('正在播放。');utterance.onend=()=>tell('播放完畢。');utterance.onerror=()=>tell('語音無法播放，請閱讀畫面文字。');speechSynthesis.speak(utterance);
}
function resetMic(){const b=document.getElementById('mic');if(b){b.setAttribute('aria-pressed','false');b.querySelector('span').textContent='點一下，開始說';}}
function listen(){
 if(recognition){recognition.stop();resetMic();return;}
 if('speechSynthesis' in window)speechSynthesis.cancel();
 const R=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!R){tell('這個瀏覽器不支援語音輸入。請打字，或使用手機鍵盤的麥克風。');return;}
 const r=new R();recognition=r;r.lang='zh-TW';r.continuous=false;r.interimResults=false;let received=false;
 r.onstart=()=>{const b=document.getElementById('mic');if(b){b.setAttribute('aria-pressed','true');b.querySelector('span').textContent='正在聽，點一下停止';}tell('請慢慢說，文字出現後可以修改。');};
 r.onresult=e=>{if(view!=='chat'||recognition!==r)return;received=true;draft+=(draft?'，':'')+e.results[0][0].transcript;document.getElementById('draft').value=draft;tell('已轉成文字，請確認後按「送出這句」。');};
 r.onerror=e=>{if(recognition!==r)return;received=true;tell(e.error==='not-allowed'?'麥克風未開啟。請允許麥克風，或直接打字。':'語音暫時無法使用，請重試或打字。');};
 r.onend=()=>{if(recognition===r){recognition=null;resetMic();if(!received)tell('沒有收到語音，請再試一次或打字。');}};
 try{r.start();}catch{recognition=null;resetMic();tell('語音無法啟動，請直接打字。');}
}
window.addEventListener('pagehide',stop);
render();
