const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let all=[];
const search=document.getElementById('eventSearch'), areaSel=document.getElementById('eventArea'), monthSel=document.getElementById('eventMonth'), list=document.getElementById('eventArchive'), count=document.getElementById('eventCount');
const now=new Date();
const todayKey=`${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;

function render(){
 const q=search.value.trim().toLowerCase(), ar=areaSel.value, mo=monthSel.value;
 const rows=all.filter(x=>{const txt=[x.store,x.event,x.kind,x.memo,x.note,x.status].join(' ').toLowerCase();return(!q||txt.includes(q))&&(!ar||x.area===ar)&&(!mo||(x.date||'').startsWith(mo));})
   .sort((a,b)=>{
     const af=(a.date||'')>=todayKey, bf=(b.date||'')>=todayKey;
     if(af!==bf) return af?-1:1;
     return af?(a.date||'').localeCompare(b.date||''):(b.date||'').localeCompare(a.date||'');
   });
 const upcoming=rows.filter(x=>(x.date||'')>=todayKey).length;
 count.textContent=`${rows.length}件${upcoming?`（今後 ${upcoming}件）`:''}`;
 list.innerHTML=rows.length?rows.map(x=>{
   const future=(x.date||'')>=todayKey;
   const href=future&&x.sourceUrl?x.sourceUrl:`./store.html?name=${encodeURIComponent(x.store)}`;
   const external=future&&x.sourceUrl?' target="_blank" rel="noopener"':'';
   return `<a class="article-row ${future?'article-row--upcoming':''}" href="${esc(href)}"${external}><div><time>${esc(x.date||'—')}</time><span class="chip ${future?'chip--accent':''}">${esc(future?(x.status||'予定'):(x.kind||'K3'))}</span></div><h2>${esc(x.store)}</h2><p><strong>${esc(x.event||'K3関連企画')}</strong><br>${esc(x.note||x.memo||'')}</p><b>${future&&x.sourceUrl?'出典を見る':'店舗履歴を見る'} →</b></a>`;
 }).join(''):'<div class="empty-detail">該当する予定・開催履歴はありません。</div>';
}

Promise.all([
 fetch('./store-data.json',{cache:'no-store'}).then(r=>r.json()),
 fetch('./data.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({schedule:[]}))
]).then(([history,home])=>{
 const past=Object.values(history).flat().filter(x=>x.publish==='公開'||!x.publish);
 const future=(home.schedule||[]).map(x=>({...x,kind:'予定',memo:x.note||'',area:x.area||''}));
 const merged=[...future,...past];
 all=merged.filter((x,i,arr)=>arr.findIndex(y=>y.date===x.date&&y.store===x.store&&y.event===x.event)===i);
 [...new Set(all.map(x=>x.area).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ja')).forEach(v=>areaSel.insertAdjacentHTML('beforeend',`<option value="${esc(v)}">${esc(v)}</option>`));
 [...new Set(all.map(x=>(x.date||'').slice(0,7)).filter(Boolean))].sort().reverse().forEach(v=>monthSel.insertAdjacentHTML('beforeend',`<option value="${esc(v)}">${esc(v)}</option>`));
 render();
 [search,areaSel,monthSel].forEach(el=>el.addEventListener(el.tagName==='INPUT'?'input':'change',render));
}).catch(()=>list.innerHTML='<div class="empty-detail">予定・開催履歴を読み込めませんでした。</div>');