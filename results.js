const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let all=[];
const search=document.getElementById('resultSearch');
const eventSel=document.getElementById('resultEvent');
const monthSel=document.getElementById('resultMonth');
const list=document.getElementById('resultArchive');
const count=document.getElementById('resultCount');

function render(){
 const q=search.value.trim().toLowerCase(), ev=eventSel.value, mo=monthSel.value;
 const rows=all.filter(x=>{
   const txt=[x.store,x.event,x.machines,x.detail,x.note].join(' ').toLowerCase();
   return (!q||txt.includes(q))&&(!ev||x.event===ev)&&(!mo||(x.date||'').startsWith(mo));
 }).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 count.textContent=rows.length+'件';
 list.innerHTML=rows.length?rows.map(x=>`<a class="article-row" href="./result.html?id=${encodeURIComponent(x.id)}"><div><time>${esc(x.date||'—')}</time><span class="chip">${esc(x.event||'K3')}</span></div><h2>${esc(x.store)}</h2><p>${esc(x.note||x.detail||'確認済み結果')}</p><b>結果詳細を見る →</b></a>`).join(''):'<div class="empty-detail">該当する結果はありません。</div>';
}
fetch('./result-data.json',{cache:'no-store'}).then(r=>r.json()).then(data=>{
 all=Object.values(data).filter(x=>x.publish==='公開'||!x.publish);
 [...new Set(all.map(x=>x.event).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ja')).forEach(v=>eventSel.insertAdjacentHTML('beforeend',`<option value="${esc(v)}">${esc(v)}</option>`));
 [...new Set(all.map(x=>(x.date||'').slice(0,7)).filter(Boolean))].sort().reverse().forEach(v=>monthSel.insertAdjacentHTML('beforeend',`<option value="${esc(v)}">${esc(v)}</option>`));
 render();
 [search,eventSel,monthSel].forEach(el=>el.addEventListener(el.tagName==='INPUT'?'input':'change',render));
}).catch(()=>list.innerHTML='<div class="empty-detail">結果データを読み込めませんでした。</div>');