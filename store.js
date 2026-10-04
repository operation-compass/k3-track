const rankOf=v=>{const s=String(v||''); if(/^A[:：]?/.test(s)) return 'A'; if(/^B[:：]?/.test(s)) return 'B'; if(/^C[:：]?/.test(s)) return 'C'; return '';};
const trustBadge=v=>{const r=rankOf(v); return r?`<span class="trust-badge trust-${r.toLowerCase()}">${r}</span>`:'';};
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search);
const name=params.get('name')||'';
const fmtDate=v=>v?String(v).replaceAll('/','-'):'—';
Promise.all([
  fetch('./store-data.json',{cache:'no-store'}).then(r=>r.json()),
  fetch('./data.json',{cache:'no-store'}).then(r=>r.json()),
  fetch('./store-visuals.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({stores:{}}))
]).then(([historyData,siteData,visualData])=>{
  const items=historyData[name]||[];
  const store=(siteData.stores||[]).find(x=>x.name===name);
  document.title=(name?name:'店舗別K3履歴')+'｜K3 TRACK';
  document.getElementById('storeTitle').textContent=name||'店舗が見つかりません';
  document.getElementById('storeSub').textContent=store?((store.area||'')+'・'+(store.type||'K3関連')):'確認済みのK3関連履歴';
  const visual=document.getElementById('storeVisual');
  const vd=(visualData.stores||{})[name]||{};
  if(visual){
    visual.innerHTML=vd.image
      ? `<img src="${esc(vd.image)}" alt="${esc(name)} 店舗ビジュアル">`
      : `<div class="store-visual__fallback"><small>STORE VISUAL</small><strong>${esc(name||'K3 STORE')}</strong><span>店舗パース連携準備済み</span></div>`;
  }
  const summary=document.getElementById('storeSummary');
  summary.innerHTML=`<div><small>確認回数</small><strong>${esc(store?.count??items.length)}回</strong></div><div><small>最終実施</small><strong>${esc(store?.last||items[0]?.date||'—')}</strong></div><div><small>エリア</small><strong>${esc(store?.area||items[0]?.area||'—')}</strong></div>`;
  const officialLinks=document.getElementById('storeOfficialLinks');
  if(officialLinks && store){
    const links=[
      store.pworld?{label:'P-WORLD',url:store.pworld}:null,
      store.x?{label:'公式X',url:store.x}:null,
      store.official?{label:'店舗公式',url:store.official}:null
    ].filter(Boolean);
    officialLinks.innerHTML=links.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)} <b>↗</b></a>`).join('');
    officialLinks.hidden=!links.length;
  }
  const list=document.getElementById('historyList');
  if(!items.length){
    list.innerHTML='<div class="empty-detail">この店舗の確認済み履歴はまだありません。</div>';
    return;
  }
  list.innerHTML=items.map(x=>`<article class="history-card"><div class="history-card__top"><time>${esc(fmtDate(x.date))}</time><div class="history-badges">${trustBadge(x.confidence)}<span class="chip">${esc(x.kind||'K3')}</span></div></div><h3>${esc(x.event||'K3関連企画')}</h3><p>${esc(x.memo||x.k3name||'確認済み情報')}</p>${x.url?`<a class="source-link" href="${esc(x.url)}" target="_blank" rel="noopener">出典を見る →</a>`:''}</article>`).join('');
}).catch(()=>{
  document.getElementById('storeTitle').textContent='読み込みエラー';
  document.getElementById('historyList').innerHTML='<div class="empty-detail">データを読み込めませんでした。</div>';
});