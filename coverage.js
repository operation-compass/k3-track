const rankOf=v=>{const s=String(v||''); if(/^A[:：]?/.test(s)) return 'A'; if(/^B[:：]?/.test(s)) return 'B'; if(/^C[:：]?/.test(s)) return 'C'; return '';};
const trustBadge=v=>{const r=rankOf(v); return r?`<span class="trust-badge trust-${r.toLowerCase()}">${r}</span>`:'';};
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search);
const name=params.get('name')||'';
const dateShort=v=>v?String(v).replace(/^\d{4}\//,''):'—';
Promise.all([
  fetch('./coverage-data.json',{cache:'no-store'}).then(r=>r.json()),
  fetch('./assets.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({items:[]})),
  fetch('./result-data.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({}))
]).then(([all,assets,resultData])=>{
  const d=all[name];
  document.title=(name||'取材・企画別履歴')+'｜K3 TRACK';
  const canonical=document.querySelector('link[rel="canonical"]');
  if(canonical && name) canonical.href=location.origin+location.pathname+'?name='+encodeURIComponent(name);
  document.getElementById('coverageTitle').textContent=name||'取材・企画が見つかりません';
  const visual=document.getElementById('coverageVisual');
  const asset=(assets.items||[]).find(x=>x.key===name && x.type!=='character' && x.image);
  if(visual){
    visual.innerHTML=asset?`<img src="${esc(asset.image)}" alt="${esc(asset.label||name)}" width="1122" height="1402" decoding="async" onerror="this.hidden=true">`:`<div class="detail-visual__fallback"><small>K3 COVERAGE</small><strong>${esc(name||'K3')}</strong><span>確認済み企画情報</span></div>`;
    visual.setAttribute('aria-hidden','false');
  }
  const badge=document.createElement('span');
  badge.className='coverage-status'+(Number(d?.count)>0?'':' is-pending');
  badge.textContent=Number(d?.count)>0?'実績あり':'確認済みデータなし';
  visual?.insertAdjacentElement('beforebegin',badge);
  const character=document.getElementById('coverageCharacter');
  const charAsset=(assets.items||[]).find(x=>x.key===name && x.type==='character' && x.image);
  if(character){
    character.innerHTML=charAsset?`<img src="${esc(charAsset.image)}" alt="${esc(charAsset.label||name)}">`:'';
  }
  if(!d){
    document.getElementById('coverageSub').textContent='公開できる確認済み履歴はありません。';
    document.getElementById('coverageSummary').innerHTML='';
    document.getElementById('coverageStores').innerHTML='<div class="empty-detail">確認済みデータなし</div>';
    document.getElementById('coverageResults').innerHTML='<div class="empty-detail">確認済みデータなし</div>';
    document.getElementById('coverageHistory').innerHTML='<div class="empty-detail">確認済みデータなし</div>';
    return;
  }
  document.getElementById('coverageSub').textContent='確認済みの開催履歴を、店舗別・時系列で整理しています。';
  document.getElementById('coverageSummary').innerHTML=`<div><small>開催確認</small><strong>${esc(d.count)}件</strong></div><div><small>対象店舗</small><strong>${esc(d.storeList.length)}店</strong></div><div><small>確認期間</small><strong>${esc(dateShort(d.first))}〜${esc(dateShort(d.last))}</strong></div>`;
  const performance=document.getElementById('coveragePerformance');
  if(performance){
    const parseSigned=v=>{const m=String(v||'').replaceAll(',','').match(/[-+]?\d+(?:\.\d+)?/);return m?Number(m[0]):null;};
    const rws=Object.values(resultData||{}).filter(x=>x.event===name && (x.publish==='公開'||!x.publish)).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    const numeric=rws.map(x=>({...x,avgNum:parseSigned(x.avg),totalNum:parseSigned(x.total)})).filter(x=>x.avgNum!==null||x.totalNum!==null);
    const avgRows=numeric.filter(x=>x.avgNum!==null);
    const plusRows=numeric.filter(x=>(x.avgNum!==null?x.avgNum:x.totalNum)>0);
    const avgValue=avgRows.length?Math.round(avgRows.reduce((a,x)=>a+x.avgNum,0)/avgRows.length):null;
    const stores=[...new Set(rws.map(x=>x.store).filter(Boolean))];
    performance.innerHTML=`<div class="performance-panel__head"><div><small>RESULT PROFILE</small><strong>企画実績サマリー</strong></div><span>${rws.length}件</span></div><div class="performance-grid"><div><small>結果確認</small><strong>${rws.length}回</strong></div><div><small>数値あり</small><strong>${numeric.length}回</strong></div><div><small>プラス確認</small><strong>${numeric.length?`${plusRows.length}/${numeric.length}回`:'—'}</strong></div><div><small>平均差枚平均</small><strong>${avgValue===null?'—':(avgValue>=0?'+':'')+avgValue.toLocaleString()+'枚'}</strong></div></div><p class="performance-note">店舗全体の差枚が確認できた回のみ集計。TOP台・機種別結果だけの回は平均値に含めていません。対象店舗：${stores.length}店。</p></div>`;
  }

  document.getElementById('coverageStores').innerHTML=d.storeList.map(s=>`<a class="coverage-store" href="./store.html?name=${encodeURIComponent(s.name)}"><strong>${esc(s.name)}</strong><span>${esc(s.count)}回 →</span></a>`).join('');
  const results=d.results||[];
  document.getElementById('coverageResults').innerHTML=results.length?results.map(x=>`<article class="coverage-result-card"><span class="chip chip--light">${esc(dateShort(x.date))}</span><h3>${esc(x.store)}</h3><p>${esc(x.note||x.detail||'確認済み結果')}</p>${x.url?`<a class="source-link" href="${esc(x.url)}" target="_blank" rel="noopener">結果出典を見る →</a>`:''}</article>`).join(''):'<div class="empty-detail">公開できる確認済み結果はありません。</div>';
  document.getElementById('coverageHistory').innerHTML=d.events.map(x=>`<article class="coverage-history-item"><div class="coverage-history-item__top"><time>${esc(dateShort(x.date))}</time><div class="history-badges">${trustBadge(x.confidence)}<span class="chip">${esc(x.kind||'K3')}</span></div></div><h3>${esc(x.store)}</h3><p>${esc(x.memo||x.event||'確認済み情報')}</p>${x.url?`<a class="source-link" href="${esc(x.url)}" target="_blank" rel="noopener">出典を見る →</a>`:''}</article>`).join('');
}).catch(()=>{
  document.getElementById('coverageTitle').textContent='読み込みエラー';
  document.getElementById('coverageHistory').innerHTML='<div class="empty-detail">データを読み込めませんでした。</div>';
});
