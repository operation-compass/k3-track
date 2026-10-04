const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search);
const name=params.get('name')||'';
const dateShort=v=>v?String(v).replace(/^\d{4}\//,''):'—';
Promise.all([fetch('./coverage-data.json',{cache:'no-store'}).then(r=>r.json()),fetch('./assets.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({items:[]}))]).then(([all,assets])=>{
  const d=all[name];
  document.title=(name||'取材・企画別履歴')+'｜K3 TRACK β';
  document.getElementById('coverageTitle').textContent=name||'取材・企画が見つかりません';
  const visual=document.getElementById('coverageVisual');
  const asset=(assets.items||[]).find(x=>x.key===name && x.image);
  if(visual){
    visual.innerHTML=asset?`<img src="${esc(asset.image)}" alt="${esc(asset.label||name)}">`:`<div class="detail-visual__fallback"><small>K3 COVERAGE</small><strong>${esc(name||'K3')}</strong><span>公式素材反映準備済み</span></div>`;
    visual.setAttribute('aria-hidden','false');
  }
  if(!d){
    document.getElementById('coverageSub').textContent='この取材・企画の確認済みデータはありません。';
    document.getElementById('coverageSummary').innerHTML='';
    document.getElementById('coverageStores').innerHTML='<div class="empty-detail">データなし</div>';
    document.getElementById('coverageResults').innerHTML='<div class="empty-detail">データなし</div>';
    document.getElementById('coverageHistory').innerHTML='<div class="empty-detail">データなし</div>';
    return;
  }
  document.getElementById('coverageSub').textContent='確認済みの開催履歴を、店舗別・時系列で整理しています。';
  document.getElementById('coverageSummary').innerHTML=`<div><small>開催確認</small><strong>${esc(d.count)}件</strong></div><div><small>対象店舗</small><strong>${esc(d.storeList.length)}店</strong></div><div><small>確認期間</small><strong>${esc(dateShort(d.first))}〜${esc(dateShort(d.last))}</strong></div>`;
  document.getElementById('coverageStores').innerHTML=d.storeList.map(s=>`<a class="coverage-store" href="./store.html?name=${encodeURIComponent(s.name)}"><strong>${esc(s.name)}</strong><span>${esc(s.count)}回 →</span></a>`).join('');
  const results=d.results||[];
  document.getElementById('coverageResults').innerHTML=results.length?results.map(x=>`<article class="coverage-result-card"><span class="chip chip--light">${esc(dateShort(x.date))}</span><h3>${esc(x.store)}</h3><p>${esc(x.note||x.detail||'確認済み結果')}</p>${x.url?`<a class="source-link" href="${esc(x.url)}" target="_blank" rel="noopener">結果出典を見る →</a>`:''}</article>`).join(''):'<div class="empty-detail">結果データは順次追加中です。</div>';
  document.getElementById('coverageHistory').innerHTML=d.events.map(x=>`<article class="coverage-history-item"><div class="coverage-history-item__top"><time>${esc(dateShort(x.date))}</time><span class="chip">${esc(x.kind||'K3')}</span></div><h3>${esc(x.store)}</h3><p>${esc(x.memo||x.event||'確認済み情報')}</p>${x.url?`<a class="source-link" href="${esc(x.url)}" target="_blank" rel="noopener">出典を見る →</a>`:''}</article>`).join('');
}).catch(()=>{
  document.getElementById('coverageTitle').textContent='読み込みエラー';
  document.getElementById('coverageHistory').innerHTML='<div class="empty-detail">データを読み込めませんでした。</div>';
});