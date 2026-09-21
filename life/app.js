const KEY = 'daily-life-records-v1';
const main = document.querySelector('#main');
const notice = document.querySelector('#notice');
const meals = ['早餐','午餐','晚餐','點心'];
const foods = [['吐司','toast'],['雞蛋','egg'],['豆漿','soy'],['飯','rice'],['麵','noodle'],['青菜','veg']];
const localDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
let data = {water:[], food:[], walk:{}};
let storageReady = true;
try { const saved = JSON.parse(localStorage.getItem(KEY)); if(saved && Array.isArray(saved.water) && Array.isArray(saved.food) && saved.walk) data = saved; } catch { storageReady = false; }
let page = 'home', selectedDate = localDay(), meal = '早餐', draft = [], foodText = '', walkDraft = '', lastWaterId = null, recognition = null;
const esc = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const art = name => `<span class="art ${name}" aria-hidden="true"></span>`;
const dateLabel = day => new Date(day+'T12:00:00').toLocaleDateString('zh-TW',{month:'long',day:'numeric',weekday:'long'});
const timeLabel = time => new Date(time).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false});
const waterOn = day => data.water.filter(x=>x.day===day);
const waterTotal = day => waterOn(day).reduce((sum,x)=>sum+x.amount,0);
function announce(text){ notice.textContent=text; }
function save(){ try { localStorage.setItem(KEY,JSON.stringify(data));storageReady=true;return true; } catch { announce('無法保存紀錄。請確認瀏覽器允許儲存資料，再試一次。');return false; } }
function commit(change){const before=JSON.stringify(data);change();if(save())return true;data=JSON.parse(before);return false;}
function stopVoice(){if(recognition){recognition.abort();recognition=null;}}
function navigate(next){stopVoice();page=next;notice.textContent='';if(next==='walk')walkDraft=data.walk[localDay()]?.count ?? '';if(next==='records')selectedDate=localDay();render();window.scrollTo(0,0);main.querySelector('h1').focus();}
document.querySelector('#home').onclick=()=>navigate('home');
function title(text){return `<div class="date">${dateLabel(localDay())}</div><h1 tabindex="-1">${text}</h1>`;}
function render(){
 document.title = ({home:'我的生活紀錄',water:'喝水紀錄',food:'飲食紀錄',walk:'走一走',records:'今天的紀錄'}[page])+'｜日常';
 if(page==='home')main.innerHTML=`<div class="eyebrow">把今天，記下來。</div>${title('我的生活紀錄')}<p class="lead">想記哪一件事？</p><div class="home-grid">${[['water','water','記喝水','選容量，一按就記下'],['food','rice','記飲食','點圖片，或說說吃了什麼'],['walk','walk','走一走','記下今天走路幾次'],['records','calendar','看紀錄','看看今天，也看看前幾天']].map(([p,a,t,s])=>`<button class="nav-card" data-page="${p}">${art(a)}<span><strong>${t}</strong><small>${s}</small></span><span class="arrow" aria-hidden="true">›</span></button>`).join('')}</div>`;
 if(page==='water')main.innerHTML=`${title('喝水紀錄')}<div class="summary"><div><span class="label">今日已記錄</span><strong>${waterTotal(localDay())}<span>cc</span></strong></div>${art('water')}</div><h2>點一下，就記一筆。</h2><div class="amounts">${[[100,'小杯'],[200,'中杯'],[300,'大杯']].map(([n,t])=>`<button class="amount" data-water="${n}" aria-label="記錄${n}cc">${art('water')}<span><small>${t}</small><strong>${n} <span>cc</span></strong></span><span class="plus" aria-hidden="true">＋</span></button>`).join('')}</div><button class="secondary full" id="custom-toggle" aria-expanded="false">自訂容量</button><form id="custom-water" class="custom-water" hidden><label for="water-amount">這次喝了多少 cc？</label><input id="water-amount" type="number" inputmode="numeric" min="1" max="10000" step="1" required placeholder="例如：250"><button class="primary full" type="submit">記下這一筆</button></form>${lastWaterId&&data.water.some(x=>x.id===lastWaterId)?'<button class="quiet full" id="undo-water">撤銷剛才那筆</button>':''}<h2>今天的紀錄</h2>${waterOn(localDay()).length?`<ul class="record-list">${waterOn(localDay()).slice().reverse().map(x=>`<li><time>${timeLabel(x.time)}</time><strong>${x.amount} cc</strong></li>`).join('')}</ul>`:'<p class="empty">今天還沒有紀錄，喝水後再記一筆。</p>'}`;
 if(page==='food')main.innerHTML=`${title('飲食紀錄')}<div class="tabs" aria-label="選擇餐別">${meals.map(m=>`<button data-meal="${m}" aria-pressed="${m===meal}">${m}</button>`).join('')}</div><h2>點選吃過的食物</h2><div class="foods">${foods.map(([name,a])=>`<button class="food" data-food="${name}" aria-pressed="${draft.includes(name)}">${art(a)}${name}</button>`).join('')}</div><div class="custom-area"><h2>圖片沒有？自己補充</h2><label class="hint" for="food-text">食物與份量，也可以用說的</label><textarea id="food-text" placeholder="例如：蘿蔔糕兩片、無糖豆漿一杯">${esc(foodText)}</textarea><div class="button-row"><button class="secondary" id="voice-food">🎙 用說的</button><button class="primary" id="add-food">＋ 加入這餐</button></div></div><h2>這餐吃了什麼</h2>${draft.length?`<ul class="record-list">${draft.map((item,i)=>`<li><span>${esc(item)}</span><button class="quiet" data-remove="${i}" aria-label="移除${esc(item)}">移除</button></li>`).join('')}</ul>`:'<p class="empty">還沒加入食物。可以選圖，也可以自己填。</p>'}<button class="primary full" id="save-food">儲存這餐</button>`;
 if(page==='walk')main.innerHTML=`${title('走一走')}<div class="walk-hero">${art('walk')}<h2>今天走路幾次？</h2></div><form id="walk-form"><label for="walk-count" class="hint">填寫今天的總次數</label><div class="number-row"><input id="walk-count" type="number" inputmode="numeric" min="0" max="9999" step="1" required value="${esc(walkDraft)}" placeholder="請輸入次數"><span>次</span></div><button class="secondary full" type="button" id="voice-walk">🎙 用說的</button><p class="hint">例如：「今天走路兩次」。<br>確認數字後，再按儲存。</p><button class="primary full" type="submit">儲存紀錄</button></form><div class="cloud"><button class="secondary full" disabled>從外接紀錄讀取</button><p class="hint">資料連接完成後，就能讀入紀錄；現在可以直接填寫。</p></div>`;
 if(page==='records'){
 const w=waterOn(selectedDate), f=data.food.filter(x=>x.day===selectedDate), walking=data.walk[selectedDate];
 main.innerHTML=`<div class="eyebrow">一天一天，慢慢記。</div><h1 tabindex="-1">${selectedDate===localDay()?'今天的紀錄':'這一天的紀錄'}</h1><div class="date-nav"><button class="quiet" id="prev-day" aria-label="前一天">‹ 前一天</button><input type="date" id="record-date" aria-label="查看日期" max="${localDay()}" value="${selectedDate}"><button class="quiet" id="next-day" ${selectedDate>=localDay()?'disabled':''}>後一天 ›</button></div><section class="entry-card"><div class="entry-heading">${art('water')}<h2>喝水</h2></div>${w.length?`<strong class="total">${waterTotal(selectedDate)} cc</strong><p class="hint">共 ${w.length} 筆</p><details><summary>查看每筆紀錄</summary><ul class="record-list">${w.map(x=>`<li><time>${timeLabel(x.time)}</time><span>${x.amount} cc</span></li>`).join('')}</ul></details>`:'<p>尚未記錄</p>'}</section><section class="entry-card"><div class="entry-heading">${art('rice')}<h2>飲食</h2></div>${meals.map(m=>`<div class="meal-line"><strong>${m}</strong>${f.filter(x=>x.meal===m).length?f.filter(x=>x.meal===m).map(x=>`<p>${x.items.map(esc).join('、')}</p>`).join(''):'<small>尚未記錄</small>'}</div>`).join('')}</section><section class="entry-card"><div class="entry-heading">${art('walk')}<h2>走一走</h2></div>${walking?`<strong class="total">${walking.count} 次</strong><p class="hint">當天走路總次數</p>`:'<p>尚未記錄</p>'}${selectedDate===localDay()?'<button class="text-link" data-page="walk">填寫／修改次數</button>':''}</section><button class="secondary full" data-page="home">回活動選單</button>`;
 }
 bind();
}
function addWater(amount){if(!Number.isInteger(amount)||amount<1||amount>10000){announce('請填寫 1 到 10000 的整數容量。');return;}const id=Date.now()+'-'+Math.random().toString(36).slice(2);if(commit(()=>data.water.push({id,day:localDay(),time:new Date().toISOString(),amount}))){lastWaterId=id;render();announce(`已記錄 ${amount} cc，今天共 ${waterTotal(localDay())} cc。`);}}
function bind(){
 main.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>navigate(b.dataset.page));
 main.querySelectorAll('[data-water]').forEach(b=>b.onclick=()=>addWater(Number(b.dataset.water)));
 const on=(id,event,fn)=>{const e=document.getElementById(id);if(e)e.addEventListener(event,fn);};
 on('custom-toggle','click',e=>{const form=document.getElementById('custom-water');form.hidden=!form.hidden;e.currentTarget.setAttribute('aria-expanded',String(!form.hidden));if(!form.hidden)document.getElementById('water-amount').focus();});
 on('custom-water','submit',e=>{e.preventDefault();addWater(Number(document.getElementById('water-amount').value));});
 on('undo-water','click',()=>{if(commit(()=>data.water=data.water.filter(x=>x.id!==lastWaterId))){lastWaterId=null;render();announce('已撤銷剛才那筆。');}});
 main.querySelectorAll('[data-meal]').forEach(b=>b.onclick=()=>{meal=b.dataset.meal;render();});
 main.querySelectorAll('[data-food]').forEach(b=>b.onclick=()=>{const name=b.dataset.food;draft=draft.includes(name)?draft.filter(x=>x!==name):[...draft,name];render();});
 on('food-text','input',e=>foodText=e.target.value);
 on('add-food','click',()=>{if(!foodText.trim()){announce('請先輸入食物名稱，或按「用說的」。');return;}draft.push(foodText.trim());foodText='';render();announce('已加入這餐，確認後請按「儲存這餐」。');});
 main.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{draft.splice(Number(b.dataset.remove),1);render();});
 on('save-food','click',()=>{if(foodText.trim()){announce('文字還沒加入清單，請先按「加入這餐」。');document.getElementById('add-food').focus();return;}if(!draft.length){announce('請先加入這餐吃的食物。');return;}if(commit(()=>data.food.push({day:localDay(),time:new Date().toISOString(),meal,items:[...draft]}))){draft=[];foodText='';navigate('records');announce('這餐已儲存。');}});
 on('walk-count','input',e=>walkDraft=e.target.value);
 on('walk-form','submit',e=>{e.preventDefault();const count=Number(document.getElementById('walk-count').value);if(!Number.isInteger(count)||count<0||count>9999){announce('請填寫 0 到 9999 的整數次數。');return;}if(commit(()=>data.walk[localDay()]={count,time:new Date().toISOString()})){navigate('records');announce('今天的走路次數已儲存。');}});
 on('voice-food','click',()=>listen('food'));on('voice-walk','click',()=>listen('walk'));
 on('prev-day','click',()=>changeDay(-1));on('next-day','click',()=>changeDay(1));
 on('record-date','change',e=>{if(e.target.value&&e.target.value<=localDay()){selectedDate=e.target.value;render();}});
}
function changeDay(offset){const d=new Date(selectedDate+'T12:00:00');d.setDate(d.getDate()+offset);selectedDate=localDay(d);render();}
function parseCount(text){const normalized=text.replace(/[０-９]/g,c=>String(c.charCodeAt(0)-65296));const digit=normalized.match(/\d+/);if(digit)return Number(digit[0]);const match=normalized.match(/[零〇一二兩三四五六七八九十百千]+/);if(!match)return null;const map={零:0,〇:0,一:1,二:2,兩:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};let sum=0,n=0;for(const ch of match[0]){if(ch in map)n=map[ch];else{sum+=(n||1)*({十:10,百:100,千:1000}[ch]);n=0;}}return sum+n;}
function listen(target){
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Recognition){announce('這個瀏覽器不支援語音輸入。您可以直接打字，或使用手機鍵盤的麥克風。');return;}
 if(recognition){stopVoice();announce('語音輸入已停止。');return;}
 const active=new Recognition();recognition=active;active.lang='zh-TW';active.interimResults=false;let heard=false;
 active.onstart=()=>announce('正在聆聽，請說話。再按一次「用說的」可停止。');
 active.onresult=e=>{heard=true;const text=e.results[0][0].transcript;if(target==='food'){foodText=(foodText?foodText+'、':'')+text;document.getElementById('food-text').value=foodText;announce('已轉成文字，請確認後加入這餐。');}else{const count=parseCount(text);if(count===null||count>9999){announce('沒有聽清楚次數，請再說一次或直接填寫。');return;}walkDraft=count;document.getElementById('walk-count').value=count;announce(`聽到「${text}」，請確認 ${count} 次是否正確。`);}};
 active.onerror=e=>{heard=true;announce(e.error==='not-allowed'?'麥克風未開啟，請允許使用麥克風，或直接打字。':'語音暫時無法使用，請重試或直接打字。');};
 active.onend=()=>{if(recognition===active){recognition=null;if(!heard)announce('沒有收到語音，可以再試一次或直接打字。');}};
 try{active.start();}catch{recognition=null;announce('語音無法啟動，請直接打字，或改用手機鍵盤語音。');}
}
render();if(!storageReady)announce('無法讀取瀏覽器紀錄，請確認儲存權限。');
