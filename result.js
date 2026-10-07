const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const id=new URLSearchParams(location.search).get('id')||'';
Promise.all([fetch('./result-data.json',{cache:'no-store'}).then(r=>r.json()),fetch('./assets.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({items:[]}))]).then(([all,assets])=>{
  const d=all[id];
  if(!d){
    document.getElementById('resultTitle').textContent='結果が見つかりません';
    document.getElementById('resultFacts').innerHTML='';
    return;
  }
  document.title=d.store+'｜'+d.date+'｜K3 TRACK';
  const canonical=document.querySelector('link[rel="canonical"]');
  if(canonical) canonical.href=location.origin+location.pathname+'?id='+encodeURIComponent(id);
  document.getElementById('resultTitle').textContent=d.store;
  document.getElementById('resultSub').textContent=(d.date||'')+'・'+(d.event||'K3関連企画');
  const visual=document.getElementById('resultVisual');
  const asset=(assets.items||[]).find(x=>x.key===d.event && x.image) || (assets.items||[]).find(x=>x.key==='RESULT' && x.image);
  if(visual){
    visual.innerHTML=asset?`<img src="${esc(asset.image)}" alt="${esc(asset.label||d.event||'K3結果') }">`:`<div class="detail-visual__fallback"><small>RESULT REPORT</small><strong>${esc(d.event||'K3 RESULT')}</strong><span>確認済み結果データ</span></div>`;
    visual.setAttribute('aria-hidden','false');
  }
  const factRows=[
    ['開催日',d.date],
    ['企画',d.event],
    ['総差枚',d.total],
    ['平均差枚',d.avg],
    ['勝率',d.winRate],
    ['対象台数',d.units]
  ].filter(([,v])=>v && v!=='—' && v!=='-');
  document.getElementById('resultFacts').innerHTML=factRows.map(([k,v])=>`<div><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join('');
  document.getElementById('summaryBox').innerHTML=`<h3>結果サマリー</h3><p>${esc(d.detail||d.note||'確認済み結果')}</p>${d.note&&d.detail?`<small class="detail-note">${esc(d.note)}</small>`:''}`;
  const detail=(d.detail||'').split('/').map(s=>s.trim()).filter(Boolean);
  const machines=(d.machines||'').split('/').map(s=>s.trim()).filter(Boolean);
  const items=detail.length?detail:machines;
  document.getElementById('machineList').innerHTML=items.length?items.map(x=>`<article class="machine-card"><strong>${esc(x)}</strong></article>`).join(''):'<div class="empty-detail">確認済みの機種別詳細はありません。</div>';
  const trust=document.getElementById('resultTrust');
  if(trust){
    trust.innerHTML=`<span>確認日 ${esc(d.checked||'—')}</span><span>${esc(d.publish||'確認済み')}</span>`;
  }
  const related=document.getElementById('relatedLinks');
  if(related){
    related.innerHTML=`<a href="./store.html?name=${encodeURIComponent(d.store)}">同じ店舗の履歴 →</a><a href="./coverage.html?name=${encodeURIComponent(d.event)}">同じ企画の履歴 →</a>`;
  }
  document.getElementById('sourceBox').innerHTML=`<p>データ元：${esc(d.source||'—')}</p><p>確認日：${esc(d.checked||'—')}</p>${d.url?`<a href="${esc(d.url)}" target="_blank" rel="noopener">出典を確認する →</a>`:''}`;
}).catch(()=>{
  document.getElementById('resultTitle').textContent='読み込みエラー';
});