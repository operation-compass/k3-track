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

const d=new Date();
const md=`${d.getMonth()+1}/${d.getDate()}`;
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
  clear?.addEventListener('click',()=>{input.value='';draw();input.focus();});
}

function initSectionNav(){
  const links=[...document.querySelectorAll('.bottom-nav a[href^="#"]')];
  const pairs=links.map(a=>({a,section:document.querySelector(a.getAttribute('href'))})).filter(x=>x.section);
  if(!pairs.length||!('IntersectionObserver' in window)) return;
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return;
    links.forEach(a=>a.classList.remove('is-active'));
    const target=links.find(a=>a.getAttribute('href')==='#'+visible.target.id);
    target?.classList.add('is-active');
  },{rootMargin:'-25% 0px -60% 0px',threshold:[0,.1,.25,.5]});
  pairs.forEach(x=>observer.observe(x.section));
}

function renderFeatured(data={},todayKey=''){
  const resultEl=document.getElementById('featuredResult');
  const nextEl=document.getElementById('featuredNext');
  const r=(data.results||[])[0];
  const n=(data.schedule||[]).filter(x=>x.date>todayKey).sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0];

  if(resultEl && r){
    resultEl.innerHTML=`<a class="featured-link" href="./result.html?id=${encodeURIComponent(r.id||'')}"><div class="featured-thumb"><span>RESULT</span><strong>${esc(r.score||'結果確認')}</strong></div><div class="featured-body"><small>PICK UP</small><h2>${esc(r.store)}</h2><p>${esc(r.date||'')} / ${esc(r.note||'確認済み結果')}</p><b>結果詳細を見る →</b></div></a>`;
  }
  if(nextEl && n){
    nextEl.innerHTML=`<div class="featured-link"><div class="featured-thumb featured-thumb--next"><span>NEXT</span><strong>${esc(n.label||String(n.date||'確認中').replace(/^\d{4}\//,''))}</strong></div><div class="featured-body"><small>NEXT SCHEDULE</small><h2>${esc(n.store||'次回予定')}</h2><p>${esc(n.event||'K3関連企画')}</p><b>${esc(n.note||'')}</b></div></div>`;
  }
}

function renderVisualShowcase(items=[],assetData={}){
  const el=document.getElementById('visualShowcaseGrid');
  if(!el) return;
  const picks=['双翼乱舞取材','クロウ・スコープ取材','お前の席ねぇから','超団結 / 7店舗共闘','非公式K3来店'];
  const rows=picks.map((name,i)=>{
    const coverage=(items||[]).find(x=>x.name===name);
    const desc=coverage?.description||'確認済みの開催履歴・結果を表示';
    const asset=(assetData.items||[]).find(x=>x.key===name && x.type!=='character' && x.image);
    const fallback=`<div class="visual-teaser__art"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(name)}</strong></div>`;
    const art=asset
      ? `<div class="visual-teaser__image"><img src="${esc(asset.image)}" alt="${esc(asset.label||name)}" width="1122" height="1402" loading="${i<2?'eager':'lazy'}" decoding="async" onerror="this.parentElement.outerHTML=decodeURIComponent('${encodeURIComponent(fallback)}')"></div>`
      : fallback;
    return `<a class="visual-teaser visual-teaser--${i+1}" href="./coverage.html?name=${encodeURIComponent(name)}">${art}<div class="visual-teaser__body"><small>K3 COVERAGE</small><h3>${esc(name)}</h3><span class="coverage-status ${coverage?.status==='実績あり'?'':'is-pending'}">${coverage?.status==='実績あり'?'実績あり':'確認済み実績なし'}</span><p>${esc(desc)}</p><b>企画詳細を見る →</b></div></a>`;
  });
  el.innerHTML=rows.join('');
}

function renderToday(items=[]){
  const el=document.getElementById('todayCard');
  if(!el) return;
  if(!items.length){
    el.innerHTML='<div class="today-card__date">TODAY</div><div class="today-card__content"><h3>本日の公開予定はありません</h3><p>確認済みの予定がある場合のみ表示します。</p></div><span class="status">NO DATA</span>';
    return;
  }
  const x=items[0];
  el.innerHTML=`<div class="today-card__date">TODAY</div><div class="today-card__content"><h3>${esc(x.store)}</h3><p>${esc(x.event||'K3関連企画')}</p>${x.note?`<small class="today-source-note">${esc(x.note)}</small>`:''}${x.sourceUrl?`<a class="source-link" href="${esc(x.sourceUrl)}" target="_blank" rel="noopener">出典を見る →</a>`:''}</div><span class="status">${esc(x.status||'確認済')}</span>`;
}

function renderSchedule(items=[],todayKey=''){
  items=(items||[]).filter(x=>x.date>todayKey).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const el=document.getElementById('scheduleList');
  if(!el) return;
  if(!items.length){
    el.innerHTML='<article class="event-card"><div class="event-card__meta"><span class="chip">DATA</span><time>--/--</time></div><h3>次回公開予定はありません</h3><p class="event-name">確認済みの予定がある場合のみ表示します</p><p class="event-note">未確認情報は掲載しません</p></article>';
    return;
  }
  el.innerHTML=items.slice(0,6).map(x=>`<article class="event-card"><div class="event-card__meta"><span class="chip chip--accent">${esc(x.label||'K3')}</span><time>${esc(x.date||'--/--')}</time></div><h3>${esc(x.store)}</h3><p class="event-name">${esc(x.event||'K3関連企画')}</p><p class="event-note">${esc(x.note||'確認済み情報')}</p>${x.sourceUrl?`<a class="source-link" href="${esc(x.sourceUrl)}" target="_blank" rel="noopener">出典を見る →</a>`:''}</article>`).join('');
}

function renderResult(items=[]){
  const el=document.getElementById('resultList');
  if(!el) return;
  if(!items.length){
    el.innerHTML='<div class="result-card"><h3>公開できる結果はありません</h3></div>';
    return;
  }
  el.innerHTML=items.slice(0,4).map(x=>{
    const metricItems=[
      ['平均差枚',x.avg_diff],
      ['勝率',x.win_rate],
      ['対象台数',x.units]
    ].filter(([,v])=>v && v!=='—' && v!=='-');
    const metrics=metricItems.length
      ? `<div class="metrics metrics--${metricItems.length}">${metricItems.map(([k,v])=>`<div><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join('')}</div>`
      : '';
    return `<a class="result-card result-card--link" href="./result.html?id=${encodeURIComponent(x.id||x.result_id||'')}"><div class="result-card__top"><div><span class="chip chip--light">RESULT ${esc(x.date||'')}</span><h3>${esc(x.store||'直近結果')}</h3></div><div class="score">${esc(x.score||'—')}</div></div>${metrics}<p class="result-card__note">${esc(x.note||'')}</p><span class="result-detail-cta">詳細を見る →</span></a>`;
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
  el.innerHTML=items.map(x=>`<article class="archive-item"><time>${esc(x.date||'--/--')}</time><div><h3>${esc(x.store||'')}</h3><p>${esc(x.event||'')}</p></div></article>`).join('');
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
    const asset=(assetData.items||[]).find(a=>a.key===x.name && a.type!=='character' && a.image);
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

Promise.all([
  fetch('./data.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('data fetch failed'))),
  fetch('./assets.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({items:[]}))
]).then(([data,assetData])=>{
    cachedCoverageAssets=assetData;
    renderStats(data.stats||{});
    const now=new Date();
    const todayKey=`${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;
    const todayItems=[...(data.today||[]),...(data.schedule||[])].filter((x,i,arr)=>x.date===todayKey && arr.findIndex(y=>y.date===x.date&&y.store===x.store&&y.event===x.event)===i);
    const detailedResults=Object.values(resultData||{})
      .filter(x=>x.publish==='公開'||!x.publish)
      .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    if(detailedResults.length) data.results=detailedResults;
    renderFeatured(data,todayKey);
    renderToday(todayItems);
    renderSchedule(data.schedule,todayKey);
    renderResult(data.results);
    renderArchive(data.archive||[]);
    renderStores(data.stores||[]);
    initStoreFilters(data.stores||[]);
    renderCoverage(data.coverage||[],assetData);
    renderVisualShowcase(data.coverage||[],assetData);
    initCoverageFilter(data.coverage||[]);
    initGlobalSearch(data.stores||[],data.coverage||[]);
    initSectionNav();
    const updated=document.getElementById('lastUpdated');
    if(updated&&data.updated_at){
      const t=new Date(data.updated_at);
      updated.textContent='更新 '+(t.getMonth()+1)+'/'+t.getDate()+' '+String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0');
    }
  })
  .catch(()=>{});
