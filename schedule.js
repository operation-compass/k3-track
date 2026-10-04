const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let all=[];
const search=document.getElementById('eventSearch'), areaSel=document.getElementById('eventArea'), monthSel=document.getElementById('eventMonth'), list=document.getElementById('eventArchive'), count=document.getElementById('eventCount');
function render(){
 const q=search.value.trim().toLowerCase(), ar=areaSel.value, mo=monthSel.value;
 const rows=all.filter(x=>{const txt=[x.store,x.event,x.kind,x.memo].join(' ').toLowerCase();return(!q||txt.includes(q))&&(!ar||x.area===ar)&&(!mo||(x.date||'').startsWith(mo));}).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 count.textContent=rows.length+'件';
 list.innerHTML=rows.length?rows.map(x=>`<a class="article-row" href="./store.html?name=${encodeURIComponent(x.store)}"><div><time>${esc(x.date||'—')}</time><span class="chip">${esc(x.kind||'K3')}</span></div><h2>${esc(x.store)}</h2><p><strong>${esc(x.event||'K3関連企画')}</strong><br>${esc(x.memo||'')}</p><b>店舗履歴を見る →</b></a>`).join(''):'<div class="empty-detail">該当する開催履歴はありません。</div>';
}
fetch('./store-data.json',{cache:'no-store'}).then(r=>r.json()).then(data=>{
 all=Object.values(data).flat().filter(x=>x.publish==='公開'||!x.publish);
 [...new Set(all.map(x=>x.area).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ja')).forEach(v=>areaSel.insertAdjacentHTML('beforeend',`<option value="${esc(v)}">${esc(v)}</option>`));
 [...new Set(all.map(x=>(x.date||'').slice(0,7)).filter(Boolean))].sort().reverse().forEach(v=>monthSel.insertAdjacentHTML('beforeend',`<option value="${esc(v)}">${esc(v)}</option>`));
 render();
 [search,areaSel,monthSel].forEach(el=>el.addEventListener(el.tagName==='INPUT'?'input':'change',render));
}).catch(()=>list.innerHTML='<div class="empty-detail">開催履歴を読み込めませんでした。</div>');