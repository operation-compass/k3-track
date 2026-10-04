const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search);
const name=params.get('name')||'';
const fmtDate=v=>v?String(v).replaceAll('/','-'):'—';
Promise.all([
  fetch('./store-data.json',{cache:'no-store'}).then(r=>r.json()),
  fetch('./data.json',{cache:'no-store'}).then(r=>r.json())
]).then(([historyData,siteData])=>{
  const items=historyData[name]||[];
  const store=(siteData.stores||[]).find(x=>x.name===name);
  document.title=(name?name:'店舗別K3履歴')+'｜K3 TRACK β';
  document.getElementById('storeTitle').textContent=name||'店舗が見つかりません';
  document.getElementById('storeSub').textContent=store?((store.area||'')+'・'+(store.type||'K3関連')):'確認済みのK3関連履歴';
  const summary=document.getElementById('storeSummary');
  summary.innerHTML=`<div><small>確認回数</small><strong>${esc(store?.count??items.length)}回</strong></div><div><small>最終実施</small><strong>${esc(store?.last||items[0]?.date||'—')}</strong></div><div><small>エリア</small><strong>${esc(store?.area||items[0]?.area||'—')}</strong></div>`;
  const list=document.getElementById('historyList');
  if(!items.length){
    list.innerHTML='<div class="empty-detail">この店舗の確認済み履歴はまだありません。</div>';
    return;
  }
  list.innerHTML=items.map(x=>`<article class="history-card"><div class="history-card__top"><time>${esc(fmtDate(x.date))}</time><span class="chip">${esc(x.kind||'K3')}</span></div><h3>${esc(x.event||'K3関連企画')}</h3><p>${esc(x.memo||x.k3name||'確認済み情報')}</p>${x.url?`<a class="source-link" href="${esc(x.url)}" target="_blank" rel="noopener">出典を見る →</a>`:''}</article>`).join('');
}).catch(()=>{
  document.getElementById('storeTitle').textContent='読み込みエラー';
  document.getElementById('historyList').innerHTML='<div class="empty-detail">データを読み込めませんでした。</div>';
});