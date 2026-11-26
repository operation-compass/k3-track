const menuBtn=document.getElementById('menuBtn');
const mobileNav=document.getElementById('mobileNav');

if(menuBtn){
  menuBtn.addEventListener('click',()=>{
    const open=mobileNav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded',open?'true':'false');
  });
}
document.querySelectorAll('#mobileNav a').forEach(link=>{
  link.addEventListener('click',()=>{
    mobileNav.classList.remove('is-open');
    menuBtn?.setAttribute('aria-expanded','false');
  });
});

const jstDay=(d=new Date())=>new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(d).replace(/\//g,'/');
const md=jstDay().slice(5).replace(/^0/,'').replace('/0','/');
const todayDate=document.getElementById('todayDate');
if(todayDate) todayDate.textContent=md;

let cachedStores=[];
let cachedCoverage=[];
let cachedCoverageAssets={items:[]};

const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function initGlobalSearch(stores=[],coverage=[]){
  const input=document.getElementById('globalSearch');
  const box=document.getElementById('globalSearchResults');
  const clear=document.getElementById('globalSearchClear');
  if(!input||!box) return;

  const draw=()=>{
    const q=input.value.trim().toLowerCase();
    if(!q){
      box.hidden=true;
      box.innerHTML='';
      clear?.classList.remove('is-visible');
      return;
    }
    clear?.classList.add('is-visible');

    const storeHits=stores.filter(x=>[x.name,x.area,x.type].join(' ').toLowerCase().includes(q)).slice(0,5);
    const coverageHits=coverage.filter(x=>[x.name,x.description].join(' ').toLowerCase().includes(q)).slice(0,5);

    const rows=[
      ...storeHits.map(x=>`<a href="./store.html?name=${encodeURIComponent(x.name)}"><span class="finder-result__type">STORE</span><div><strong>${esc(x.name)}</strong><small>${esc(x.area||'')}・${esc(x.count||0)}回</small></div><b>→</b></a>`),
      ...coverageHits.map(x=>`<a href="./coverage.html?name=${encodeURIComponent(x.name)}"><span class="finder-result__type">COVERAGE</span><div><strong>${esc(x.name)}</strong><small>${esc(x.description||'')}</small></div><b>→</b></a>`)
    ];

    box.innerHTML=rows.length?rows.join(''):'<p>該当する店舗・企画はありません。</p>';
    box.hidden=false;
  };

  input.addEventListener('input',draw);
  input.addEventListener('keydown',e=>{if(e.key==='Escape'){input.value='';draw();}if(e.key==='Enter'&&!box.hidden){const first=box.querySelector('a');if(first){e.preventDefault();first.focus();}}});
  draw();
  clear?.addEventListener('click',()=>{input.value='';draw();input.focus();});
}

function initSectionNav(){
  const links=[...document.querySelectorAll('.bottom-nav a[href^="#"]')];
  const pairs=links.map(a=>({a,section:document.querySelector(a.getAttribute('href')==='#top'?'.media-hero':a.getAttribute('href'))})).filter(x=>x.section);
  if(!pairs.length||!('IntersectionObserver' in window)) return;
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return;
    links.forEach(a=>a.classList.remove('is-active'));
    const target=pairs.find(p=>p.section===visible.target)?.a;
    target?.classList.add('is-active');
  },{rootMargin:'-25% 0px -60% 0px',threshold:[0,.1,.25,.5]});
  pairs.forEach(x=>observer.observe(x.section));
}

function renderFeatured(data={},todayKey=''){
  const resultEl=document.getElementById('featuredResult');
  const nextEl=document.getElementById('featuredNext');
  const r=(data.results||[])[0];
  const n=(data.schedule||[]).filter(x=>x.date>todayKey).sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0];
  const announcement=!n?(data.announcements||[]).filter(x=>x.date>=todayKey).sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0]:null;

  if(resultEl && r){
    resultEl.innerHTML=`<a class="featured-link" href="./result.html?id=${encodeURIComponent(r.id||'')}"><div class="featured-thumb"><span>RESULT</span><strong>${esc(r.provisional?'速報・最終結果未確認':r.score||'結果確認')}</strong></div><div class="featured-body"><small>PICK UP</small><h2>${esc(r.store)}</h2><p>${esc(r.date||'')} / ${esc(r.note||'確認済み結果')}</p><b>結果詳細を見る →</b></div></a>`;
  }
  if(nextEl && announcement){
    nextEl.innerHTML=`<a class="featured-link" href="#k3-monthly-announcements"><div class="featured-thumb featured-thumb--next"><span>ANNOUNCED</span><strong>${esc(String(announcement.date||'').slice(5))}</strong></div><div class="featured-body"><small>月間告知・開催未確認</small><h2>${esc(announcement.store)}</h2><p>${esc(announcement.event)}</p><b>告知内容を見る →</b></div></a>`;
  }
  if(nextEl && n){
    nextEl.innerHTML=`<div class="featured-link"><div class="featured-thumb featured-thumb--next"><span>NEXT</span><strong>${esc(n.label||String(n.date||'確認中').replace(/^\d{4}\//,''))}</strong></div><div class="featured-body"><small>NEXT SCHEDULE</small><h2>${esc(n.store||'次回予定')}</h2><p>${esc(n.event||'K3関連企画')}</p><b>${esc(n.note||'')}</b></div></div>`;
  }
}

function k3ApprovedPop(name,assetData=cachedCoverageAssets){
  return (assetData.items||[]).find(a=>a.key===name&&a.type==='pop'&&a.rights==='許可済'&&Array.isArray(a.scope)&&a.scope.includes('web')&&a.status==='WEB反映'&&/^\.\/assets\/[a-zA-Z0-9_.-]+\.(webp|png|jpe?g)$/i.test(a.image||''));
}
function renderVisualShowcase(items=[],assetData={}){
  const el=document.getElementById('visualShowcaseGrid');
  if(!el)return;
  const rows=items.filter(x=>x.status==='実績あり'&&k3ApprovedPop(x.name,assetData));
  el.innerHTML=rows.length?rows.map((x,i)=>{
    const a=k3ApprovedPop(x.name,assetData);
    return `<article class="k3-pop-card"><a class="k3-pop-art" data-pop-name="${esc(x.name)}" href="${esc(a.image)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(x.name)}のPOPを拡大"><img src="${esc(a.image)}" alt="${esc(x.name)}の企画共通POP" width="${Number(a.width)||1122}" height="${Number(a.height)||1402}" loading="${i===0?'eager':'lazy'}" decoding="async"></a><a class="k3-pop-name" href="./coverage.html?name=${encodeURIComponent(x.name)}"><span>${esc(x.name)}</span><b aria-hidden="true">›</b></a></article>`;
  }).join(''):'<p class="k3-gallery-note">公開可能な企画POPは準備中です。</p>';
}

function initPopViewer(){
  const gallery=document.getElementById('visualShowcaseGrid'),dialog=document.getElementById('k3PopDialog');
  if(!gallery||!dialog||typeof dialog.showModal!=='function')return;
  const image=document.getElementById('k3PopImage'),title=document.getElementById('k3PopTitle'),detail=document.getElementById('k3PopDetail'),close=document.getElementById('k3PopClose');
  if(!image||!title||!detail||!close)return;
  let trigger=null;
  gallery.addEventListener('click',e=>{
    const a=e.target.closest('a.k3-pop-art');
    if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    const name=a.dataset.popName,asset=k3ApprovedPop(name);
    if(!asset||dialog.open)return;
    e.preventDefault();trigger=a;
    title.textContent=name;image.src=asset.image;image.alt=name+'の企画共通POP';
    detail.href='./coverage.html?name='+encodeURIComponent(name);
    dialog.showModal();close.focus();
  });
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{image.removeAttribute('src');if(trigger)trigger.focus();});
}
function renderToday(items=[]){
  const el=document.getElementById('todayCard');
  if(!el) return;
  if(!items.length){
    el.classList.add('empty-state');
    el.innerHTML='<div class="today-card__date">TODAY</div><div class="today-card__content"><h3>本日の公開予定はありません</h3><p>確認済みの予定がある場合のみ表示します。</p></div><span class="status">NO DATA</span>';
    return;
  }
  el.classList.remove('empty-state');
  el.innerHTML=`<div class="today-card__date">TODAY</div><div class="today-list">${items.map(x=>`<article class="today-item"><div class="today-card__content"><div class="today-item__head"><h3>${esc(x.store)}</h3><span class="status">${esc(x.status||'確認済')}</span></div><p>${esc(x.event||'K3関連企画')}</p>${x.note?`<small class="today-source-note">${esc(x.note)}</small>`:''}${x.sourceUrl?`<a class="source-link" href="${esc(x.sourceUrl)}" target="_blank" rel="noopener">出典を見る →</a>`:''}</div></article>`).join('')}</div>`;
}

function renderSchedule(items=[],todayKey=''){
  items=(items||[]).filter((x,i,all)=>x.date>=todayKey&&all.findIndex(y=>y.date===x.date&&y.store===x.store&&y.event===x.event)===i).sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.store).localeCompare(String(b.store),'ja'));
  const el=document.getElementById('scheduleList');
  if(!el) return;
  if(!items.length){
    el.innerHTML='<article class="event-card"><div class="event-card__meta"><span class="chip">DATA</span><time>--/--</time></div><h3>本日以降の確認済み予定はありません</h3><p class="event-name">開催告知は確認済み予定と分けて掲載しています</p><p class="event-note">告知と開催確定を区別しています</p></article>';
    return;
  }
  const visible=[...items.filter(x=>x.date===todayKey),...items.filter(x=>x.date>todayKey).slice(0,8)];
  const grouped=new Map();
  visible.forEach(x=>{if(!grouped.has(x.date)) grouped.set(x.date,[]);grouped.get(x.date).push(x);});
  el.innerHTML=[...grouped.entries()].map(([date,rows],idx)=>`<section class="schedule-day ${idx===0?'schedule-day--next':''}"><div class="schedule-day__head"><div><small>${date===todayKey?'TODAY':idx===0?'NEXT':'UPCOMING'}</small><strong>${esc(rows[0].label||date.replace(/^\d{4}\//,''))}</strong></div><span>${rows.length}件</span></div><div class="schedule-day__list">${rows.map(x=>`<article class="event-card"><div class="event-card__meta"><span class="chip chip--accent">${esc(x.status||'確認済')}</span><time>${esc(x.date||'--/--')}</time></div><h3>${esc(x.store)}</h3><p class="event-name">${esc(x.event||'K3関連企画')}</p>${x.note?`<p class="event-note">${esc(x.note)}</p>`:''}${x.sourceUrl?`<a class="source-link" href="${esc(x.sourceUrl)}" target="_blank" rel="noopener">出典を見る →</a>`:''}</article>`).join('')}</div></section>`).join('');
}


function renderMonthlyAnnouncements(items=[],todayKey=''){
  const anchor=document.getElementById('scheduleList');
  if(!anchor) return;
  const existing=document.getElementById('k3-monthly-announcements');
  if(existing) existing.remove();
  const rows=(items||[]).slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.store).localeCompare(String(b.store),'ja'));
  if(!rows.length) return;
  const upcoming=rows.filter(x=>x.date>=todayKey);
  const past=rows.filter(x=>x.date<todayKey).reverse();
  const renderOne=x=>'<article class="event-card"><div class="event-card__meta"><span class="chip">告知・開催確認待ち</span><time>'+esc(x.date)+'</time></div>'+
    '<h3>'+esc(x.store)+'</h3><p class="event-name">'+esc(x.event)+'</p>'+
    '<p class="event-note">'+esc(x.note||'日程の事前告知。実施済みを意味しません。')+'</p>'+
    '<a class="source-link" href="'+esc(x.sourceUrl||'#')+'" target="_blank" rel="noopener noreferrer">情報元を見る →</a></article>';
  const wrapper=document.createElement('section');
  wrapper.id='k3-monthly-announcements';
  wrapper.style.cssText='margin-top:24px;padding:16px;border:1px solid rgba(180,149,84,.45);border-radius:14px';
  wrapper.innerHTML='<h3 style="margin:0 0 6px">K3関連告知（全'+rows.length+'件）</h3>'+
    '<p style="margin:0 0 14px;font-size:.9rem;opacity:.85">告知は「開催実績」や「取材の最終結果」と異なります。日程に出典相違があるものは照合中と明記しています。</p>'+
    '<h4 style="margin:12px 0 6px">本日以降の告知 '+upcoming.length+'件</h4>'+
    (upcoming.length?'<div class="schedule-day__list">'+upcoming.map(renderOne).join('')+'</div>':'<p>今後の公開済み告知はありません。</p>')+
    (past.length?'<details style="margin-top:16px"><summary style="cursor:pointer;padding:8px 0">過去の告知記録 '+past.length+'件（実施確認とは別）を表示</summary>'+
      '<div class="schedule-day__list" style="margin-top:8px">'+past.map(renderOne).join('')+'</div></details>':'');
  anchor.insertAdjacentElement('afterend',wrapper);
}

function renderAnnouncementToday(items=[],todayKey='',onlyIfNoConfirmed=true){
  if(!onlyIfNoConfirmed) return;
  const el=document.getElementById('todayCard');
  if(!el) return;
  const announcements=(items||[]).filter(x=>x.date===todayKey);
  if(!announcements.length) return;
  el.classList.remove('empty-state');
  el.innerHTML='<div class="today-card__date">TODAY / 告知・未確認</div><div class="today-list">'+announcements.map(x=>
    '<article class="today-item"><div class="today-card__content"><div class="today-item__head"><h3>'+esc(x.store)+'</h3><span class="status">告知あり</span></div>'+
    '<p>'+esc(x.event)+'</p><small class="today-source-note">開催実施・K3公式結果は未確認です。</small>'+
    '<a class="source-link" href="'+esc(x.sourceUrl||'#')+'" target="_blank" rel="noopener noreferrer">出典を見る →</a></div></article>').join('')+'</div>';
}

function renderFieldReports(reports=[]){
  const target=document.getElementById('fieldReportsList');
  if(!target) return;
  const rows=(reports||[]).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const count=document.getElementById('fieldReportsCount');
  if(count) count.textContent=rows.length+'レポート／'+rows.reduce((n,x)=>n+(x.machines||[]).length,0)+'台';
  if(!rows.length){target.textContent='現在公開できる現地レポートはありません。';return;}
  target.innerHTML=rows.map(x=>
    '<article style="padding:14px;border:1px solid rgba(255,255,255,.2);border-radius:10px;background:rgba(0,0,0,.12)">'+
    '<small style="display:block;opacity:.85">'+esc(x.date)+' ／ '+esc(x.kind||'現地レポート')+'</small>'+ 
    '<h4 style="margin:6px 0;font-size:1.02rem">'+esc(x.store)+'</h4>'+
    '<p style="font-size:.86rem;opacity:.8;margin:4px 0 10px">'+esc(x.event||'K3関連取材')+'</p>'+
    '<div style="display:grid;gap:6px">'+(x.machines||[]).map(y=>
      '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.12)">'+
      '<span style="font-size:.82rem">'+esc(y.number)+'番 '+esc(y.machine)+'</span>'+
      '<strong style="white-space:nowrap;font-size:.94rem">'+Number(y.reportedCount).toLocaleString('ja-JP')+'枚</strong></div>').join('')+'</div>'+
    '<p style="margin:10px 0 6px;font-size:.78rem;opacity:.87">'+esc(x.status||'最終結果未確認')+'</p>'+ '<p style="margin:8px 0 8px;font-size:.77rem;opacity:.8">'+esc(x.note||'投稿記載枚数。差枚と断定しません。')+'</p>'+ 
    (x.sourceUrl?'<a class="source-link" href="'+esc(x.sourceUrl)+'" target="_blank" rel="noopener noreferrer">発信元の転載資料を見る →</a>':'')+
    '</article>').join('');
}

function renderMachineResults(items=[]){
  const el=document.getElementById('machineResultsList');
  if(!el) return;
  const rows=(items||[]).filter(x=>x.publishClass==='参考公開可')
    .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(a.store||'').localeCompare(String(b.store||''),'ja'));
  const count=document.getElementById('machineResultsCount');
  if(count) count.textContent=rows.length+'台';
  if(!rows.length){el.textContent='公開できる営業後の台別参考結果はありません。';return;}
  el.innerHTML=rows.map(x=>'<article style="padding:15px;border:1px solid rgba(255,255,255,.18);border-radius:10px;background:rgba(0,0,0,.12)">'+
    '<small style="display:block;opacity:.85">'+esc(x.date)+' ／ 営業後の外部集計</small>'+
    '<h4 style="margin:6px 0;font-size:1.02rem">'+esc(x.store)+'</h4>'+
    '<p style="font-size:.86rem;opacity:.85;margin:3px 0">'+esc(x.number)+'番 '+esc(x.machine)+'</p>'+
    '<strong style="font-size:1.38rem;display:block;margin:7px 0">差枚 '+(x.diff>0?'+':'')+Number(x.diff).toLocaleString('ja-JP')+'枚</strong>'+
    '<p style="font-size:.82rem;opacity:.86;margin:4px 0">ゲーム数 '+Number(x.games).toLocaleString('ja-JP')+'G ／ 出典 '+esc(x.source||'外部データ')+'</p>'+
    '<p style="font-size:.78rem;opacity:.84;margin:8px 0">※K3取材の公式対象台ではありません。'+esc(x.note||'')+'</p>'+
    (x.sourceUrl?'<a class="source-link" href="'+esc(x.sourceUrl)+'" target="_blank" rel="noopener noreferrer">営業後の台別データを見る →</a>':'')+
    '</article>').join('');
}

function renderVenueResults(items=[]){
  const target=document.getElementById('venueResultsList');
  if(!target) return;
  const rows=(items||[]).filter(x=>x.publishClass==='参考公開可')
    .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(a.store||'').localeCompare(String(b.store||''),'ja'));
  const counter=document.getElementById('venueResultsCount');
  if(counter) counter.textContent=rows.length+'件（媒体別）';
  if(!rows.length){target.textContent='現在公開できる店舗参考結果はありません。';return;}
  const fmt=value=>value==null?'未掲載':(Number(value)>0?'+':'')+Number(value).toLocaleString('ja-JP')+'枚';
  target.innerHTML=rows.map(x=>'<article style="padding:15px;border:1px solid rgba(255,255,255,.18);border-radius:10px;background:rgba(0,0,0,.12)">'+
    '<small style="display:block;opacity:.85">'+esc(x.date)+'｜店舗全体・外部集計</small>'+
    '<h4 style="margin:6px 0;font-size:1.02rem">'+esc(x.store)+'</h4>'+
    '<p style="font-size:.8rem;opacity:.8;margin:3px 0 7px">'+esc(x.event||'同日関連告知')+'</p>'+
    '<strong style="font-size:1.35rem;display:block">'+esc(fmt(x.totalDiff))+'</strong>'+
    '<div style="font-size:.85rem;margin:5px 0">平均差枚 '+esc(fmt(x.avgDiff))+
      (x.winRate?' ／ 勝率 '+esc(x.winRate):'')+'</div>'+
    '<p style="font-size:.78rem;opacity:.8;margin:8px 0">※K3取材公式の結果ではありません。集計元：'+esc(x.source||'外部サイト')+'</p>'+
    (x.note?'<p style="font-size:.76rem;opacity:.76;margin:5px 0 8px">'+esc(x.note)+'</p>':'')+
    (x.sourceUrl?'<a href="'+esc(x.sourceUrl)+'" target="_blank" rel="noopener noreferrer" class="source-link">出典を見る →</a>':'')+
    '</article>').join('');
}

function renderResult(items=[]){
  const el=document.getElementById('resultList');
  if(!el) return;
  if(!items.length){
    el.innerHTML='<div class="result-card"><h3>公開できる結果はありません</h3></div>';
    return;
  }
  const selected=[];
  const groupCount=new Map();
  for(const x of items){
    const key=`${x.date||''}|${x.event||''}`;
    const n=groupCount.get(key)||0;
    if(n>=2) continue;
    selected.push(x);
    groupCount.set(key,n+1);
    if(selected.length>=6) break;
  }
  el.innerHTML=selected.map(x=>{
    const metricItems=[
      ['総差枚',x.total||x.total_diff],
      ['平均差枚',x.avg||x.avg_diff],
      ['勝率',x.winRate||x.win_rate],
      ['対象台数',x.units]
    ].filter(([,v])=>v && v!=='—' && v!=='-');
    const metrics=metricItems.length
      ? `<div class="metrics metrics--${Math.min(metricItems.length,4)}">${metricItems.slice(0,4).map(([k,v])=>`<div><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join('')}</div>`
      : `<div class="result-evidence">${x.provisional?'速報・最終数値未確認':'数値未掲載・内容確認済み'}</div>`;
    const score=x.provisional?'速報・最終結果未確認':x.score||x.total||x.avg||'結果確認';
    const date=String(x.date||'').replace(/^\d{4}\//,'');
    return `<a class="result-card result-card--link" href="./result.html?id=${encodeURIComponent(x.id||x.result_id||'')}"><div class="result-card__top"><div><span class="chip chip--light">RESULT ${esc(date)}</span><h3>${esc(x.store||'直近結果')}</h3><small class="result-event">${esc(x.event||'K3関連企画')}</small></div><div class="score">${esc(score)}</div></div>${metrics}<p class="result-card__note">${esc(x.note||x.detail||'確認済み結果')}</p><div class="result-card__foot"><span>${x.checked?`確認 ${esc(x.checked)}`:'出典確認済み'}</span><b>詳細を見る →</b></div></a>`;
  }).join('');
}

function renderStats(s={}){
  const el=document.getElementById('statsGrid');
  if(!el) return;
  el.innerHTML=`<div><strong>${esc(s.events||'--')}</strong><span>開催履歴</span></div><div><strong>${esc(s.results||'--')}</strong><span>結果データ</span></div><div><strong>${esc(s.stores||'--')}</strong><span>対象店舗</span></div><div><strong>${esc(s.period||'--')}</strong><span>収集期間</span></div>`;
}

function renderArchive(items=[]){
  const el=document.getElementById('archiveList');
  if(!el) return;
  el.innerHTML=items.map(x=>`<article class="archive-item"><time>${esc(x.date||'--/--')}</time><div><h3>${esc(x.store||'')}</h3><p>${esc(x.event||'')}</p>${x.status?`<small>${esc(x.status)}</small>`:''}</div></article>`).join('');
}

function renderStores(items=[]){
  const el=document.getElementById('storeList');
  if(!el) return;
  if(!items.length){
    el.innerHTML='<p class="event-note">該当する店舗がありません。</p>';
    return;
  }
  el.innerHTML=items
    .slice()
    .sort((a,b)=>(Number(b.count)||0)-(Number(a.count)||0))
    .map(x=>`<a class="store-row" href="./store.html?name=${encodeURIComponent(x.name)}"><div><h3>${esc(x.name)}</h3><p>${esc(x.area||'')}・${esc(x.type||'K3関連')}</p></div><div class="store-meta"><strong>${esc(x.count||0)}回</strong><small>最終 ${esc(x.last||'—')}</small><small>詳細を見る →</small></div></a>`)
    .join('');
}

function initStoreFilters(items=[]){
  cachedStores=items.slice();
  const search=document.getElementById('storeSearch');
  const area=document.getElementById('storeArea');
  if(!search||!area) return;
  [...new Set(items.map(x=>x.area).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ja')).forEach(v=>{
    const opt=document.createElement('option'); opt.value=v; opt.textContent=v; area.appendChild(opt);
  });
  const apply=()=>{
    const q=search.value.trim().toLowerCase();
    const av=area.value;
    const filtered=cachedStores.filter(x=>{
      const text=[x.name,x.area,x.type].join(' ').toLowerCase();
      return (!q||text.includes(q))&&(!av||x.area===av);
    });
    renderStores(filtered);
  };
  search.addEventListener('input',apply);
  area.addEventListener('change',apply);
}

function renderCoverage(items=[],assetData=cachedCoverageAssets){
  const el=document.getElementById('coverageList');
  if(!el) return;
  if(!items.length){el.innerHTML='<p class="event-note">該当する取材・企画がありません。</p>';return;}
  el.innerHTML=items.map(x=>{
    const asset=x.status==='実績あり'?k3ApprovedPop(x.name,assetData):null;
    const fallback=`<span class="coverage-index">${esc(x.id||'--')}</span>`;
    const thumb=asset?`<div class="coverage-thumb"><img src="${esc(asset.image)}" alt="${esc(asset.label||x.name)}" width="1122" height="1402" loading="lazy" decoding="async" onerror="this.parentElement.outerHTML=decodeURIComponent('${encodeURIComponent(fallback)}')"></div>`:fallback;
    return `<a class="coverage-entry" href="./coverage.html?name=${encodeURIComponent(x.name)}"><article class="coverage-card">${thumb}<div class="coverage-copy"><div class="coverage-title-row"><h3>${esc(x.name)}</h3><span class="coverage-status ${x.status==='実績あり'?'':'is-pending'}">${x.status==='実績あり'?'実績あり':'確認済み実績なし'}</span></div><p>${esc(x.description||'')}</p></div><b aria-hidden="true">→</b></article></a>`;
  }).join('');
}

function initCoverageFilter(items=[]){
  cachedCoverage=items.slice();
  const search=document.getElementById('coverageSearch');
  if(!search) return;
  search.addEventListener('input',()=>{
    const q=search.value.trim().toLowerCase();
    renderCoverage(cachedCoverage.filter(x=>[x.name,x.description].join(' ').toLowerCase().includes(q)));
  });
}

function renderCompactHome(todayItems,announcements,results,todayKey){
  if(!document.body.classList.contains('k3-compact'))return;
  const today=document.getElementById('todayCard');
  const confirmed=(todayItems||[]).map(x=>({...x,isAnnouncement:false}));
  const announced=(announcements||[]).filter(x=>x.date===todayKey&&!confirmed.some(y=>y.store===x.store&&y.event===x.event)).map(x=>({...x,isAnnouncement:true}));
  const rows=[...confirmed,...announced];
  if(today)today.innerHTML=rows.length?rows.slice(0,3).map(x=>`<a class="k3-today-row" href="./browse.html#schedule"><span class="k3-row-status ${x.isAnnouncement?'k3-unconfirmed':''}">${x.isAnnouncement?'告知・未確認':'取材予定'}</span><time>${esc(todayKey.slice(5))}</time><span class="k3-row-copy"><strong>${esc(x.event||'K3関連企画')}</strong><small>${esc(x.store)}</small></span><b aria-hidden="true">›</b></a>`).join('')+(rows.length>3?`<p class="k3-more-count">ほか ${rows.length-3} 件</p>`:''):'<p class="k3-empty-preview">本日の公開予定・告知はありません。</p>';
  const result=document.getElementById('featuredResult');
  const r=(results||[])[0];
  if(result)result.innerHTML=r?`<a class="k3-latest-link" href="./result.html?id=${encodeURIComponent(r.id||r.result_id||'')}"><div class="k3-result-art" aria-hidden="true"><span>RESULT ARCHIVE</span><svg viewBox="0 0 96 34" fill="none"><path d="M4 30h88M10 24V16h10v8M30 24V9h10v15M50 24V13h10v11M70 24V3h10v21" stroke="currentColor" stroke-width="2"/></svg></div><div class="k3-result-summary"><small>${esc(r.date||'')}｜${r.provisional?'速報・最終未確認':'掲載結果'}</small><strong>${esc(r.store||'取材結果')}</strong><span>${esc(r.event||'K3関連企画')}</span></div></a>`:'<p class="k3-empty-preview">公開できる結果はありません。</p>';
}

Promise.all([
  fetch('./data.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('data fetch failed'))),
  fetch('./assets.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({items:[]})),
  fetch('./result-data.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({})),
  document.getElementById('venueResultsList')?fetch('./venue-results.json',{cache:'no-store'}).then(r=>r.ok?r.json():({items:[]})).catch(()=>({items:[]})):Promise.resolve({items:[]}),
  document.getElementById('fieldReportsList')?fetch('./field-reports.json',{cache:'no-store'}).then(r=>r.ok?r.json():({reports:[]})).catch(()=>({reports:[]})):Promise.resolve({reports:[]}),
  document.getElementById('machineResultsList')?fetch('./machine-results.json',{cache:'no-store'}).then(r=>r.ok?r.json():({items:[]})).catch(()=>({items:[]})):Promise.resolve({items:[]})
]).then(([data,assetData,resultData,venueData,fieldData,machineData])=>{
    cachedCoverageAssets=assetData;
    renderStats(data.stats||{});
    const todayKey=jstDay();
    const todayItems=[...(data.today||[]),...(data.schedule||[])].filter((x,i,arr)=>x.date===todayKey && arr.findIndex(y=>y.date===x.date&&y.store===x.store&&y.event===x.event)===i);
    const detailedResults=Object.values(resultData||{})
      .filter(x=>x.publish==='公開'||!x.publish)
      .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    if(detailedResults.length) data.results=detailedResults;
    const freshness=document.getElementById('officialResultFreshness');
    if(freshness){
      const latest=detailedResults[0]?.date || (data.results||[]).map(x=>x.date||'').sort().at(-1) || null;
      const count=detailedResults.length || (data.results||[]).length;
      const label=latest?latest+' が最新の掲載日':'公開結果なし';
      freshness.textContent='掲載結果：'+count+'件｜'+label+'。速報と最終結果は区別し、開催告知・店舗全体の参考値は含みません。';
    }
    if(document.body.classList.contains('k3-compact')){renderCompactHome(todayItems,data.announcements||[],data.results||[],todayKey);}else{renderFeatured(data,todayKey);renderToday(todayItems);renderAnnouncementToday(data.announcements||[],todayKey,!todayItems.length);}
    renderSchedule([...(data.today||[]),...(data.schedule||[])],todayKey);
    renderMonthlyAnnouncements(data.announcements||[],todayKey);
    renderResult(data.results);
    renderVenueResults(venueData.items||[]);
    renderFieldReports(fieldData.reports||[]);
    renderMachineResults(machineData.items||[]);
    renderArchive(data.archive||[]);
    renderStores(data.stores||[]);
    initStoreFilters(data.stores||[]);
    renderCoverage(data.coverage||[],assetData);
    renderVisualShowcase(data.coverage||[],assetData);
    initPopViewer();
    initCoverageFilter(data.coverage||[]);
    initGlobalSearch(data.stores||[],data.coverage||[]);
    initSectionNav();
    const updated=document.getElementById('lastUpdated');
    if(updated&&data.updated_at){
      const t=new Date(data.updated_at);
      if(!Number.isNaN(t.getTime())) updated.textContent='更新 '+new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(t)+' JST';
      if(Date.now()-t.getTime()>48*60*60*1000){
        updated.classList.add('is-stale');
        updated.title='最終更新から48時間以上経過しています';
        updated.textContent+='（更新確認中）';
      }
    }
  })
  .catch(()=>{if(document.body.classList.contains('k3-compact')){for(const id of ['todayCard','featuredResult','visualShowcaseGrid']){const el=document.getElementById(id);if(el)el.textContent='情報を読み込めませんでした。再読み込みしてください。';}}});
