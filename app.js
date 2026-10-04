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

const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderToday(items=[]){
  const el=document.getElementById('todayCard');
  if(!el) return;
  if(!items.length){
    el.innerHTML='<div class="today-card__date">TODAY</div><div class="today-card__content"><h3>本日の開催情報は確認中</h3><p>確認済みの公開可能データが入り次第表示します。</p></div><span class="status">確認中</span>';
    return;
  }
  const x=items[0];
  el.innerHTML=`<div class="today-card__date">TODAY</div><div class="today-card__content"><h3>${esc(x.store)}</h3><p>${esc(x.event||'K3関連企画')}</p></div><span class="status">${esc(x.status||'開催')}</span>`;
}

function renderSchedule(items=[]){
  const el=document.getElementById('scheduleList');
  if(!el) return;
  if(!items.length){
    el.innerHTML='<article class="event-card"><div class="event-card__meta"><span class="chip">DATA</span><time>--/--</time></div><h3>次回予定を確認中</h3><p class="event-name">公開可能な確認済みデータを準備しています</p><p class="event-note">K3 DATA MASTER連携準備中</p></article>';
    return;
  }
  el.innerHTML=items.slice(0,6).map(x=>`<article class="event-card"><div class="event-card__meta"><span class="chip chip--accent">${esc(x.label||'K3')}</span><time>${esc(x.date||'--/--')}</time></div><h3>${esc(x.store)}</h3><p class="event-name">${esc(x.event||'K3関連企画')}</p><p class="event-note">${esc(x.note||'確認済み情報')}</p></article>`).join('');
}

function renderResult(items=[]){
  const el=document.getElementById('resultList');
  if(!el) return;
  if(!items.length){
    el.innerHTML='<div class="result-card"><h3>結果データ準備中</h3></div>';
    return;
  }
  el.innerHTML=items.slice(0,4).map(x=>`<a class="result-card result-card--link" href="./result.html?id=${encodeURIComponent(x.id||x.result_id||'')}"><div class="result-card__top"><div><span class="chip chip--light">RESULT ${esc(x.date||'')}</span><h3>${esc(x.store||'直近結果')}</h3></div><div class="score">${esc(x.score||'—')}</div></div><div class="metrics"><div><small>平均差枚</small><strong>${esc(x.avg_diff||'—')}</strong></div><div><small>勝率</small><strong>${esc(x.win_rate||'—')}</strong></div><div><small>対象台数</small><strong>${esc(x.units||'—')}</strong></div></div><p class="result-card__note">${esc(x.note||'')}</p><span class="result-detail-cta">詳細を見る →</span></a>`).join('');
}

function renderStats(s={}){
  const el=document.getElementById('statsGrid');
  if(!el) return;
  el.innerHTML=`<div><strong>${esc(s.events||'--')}</strong><span>登録履歴</span></div><div><strong>${esc(s.stores||'--')}</strong><span>対象店舗</span></div><div><strong>${esc(s.types||'--')}</strong><span>企画種別</span></div><div><strong>${esc(s.period||'--')}</strong><span>収集期間</span></div>`;
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

function renderCoverage(items=[]){
  const el=document.getElementById('coverageList');
  if(!el) return;
  if(!items.length){
    el.innerHTML='<p class="event-note">該当する取材・企画がありません。</p>';
    return;
  }
  el.innerHTML=items.map(x=>`<a class="coverage-link" href="./coverage.html?name=${encodeURIComponent(x.name)}"><article><span>${esc(x.id||'--')}</span><div><h3>${esc(x.name)}</h3><p>${esc(x.description||'')}</p></div><b>→</b></article></a>`).join('');
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

fetch('./data.json',{cache:'no-store'})
  .then(r=>r.ok?r.json():Promise.reject(new Error('data fetch failed')))
  .then(data=>{
    renderStats(data.stats||{});
    renderToday(data.today);
    renderSchedule(data.schedule);
    renderResult(data.results);
    renderArchive(data.archive||[]);
    renderStores(data.stores||[]);
    initStoreFilters(data.stores||[]);
    renderCoverage(data.coverage||[]);
    initCoverageFilter(data.coverage||[]);
    const updated=document.getElementById('lastUpdated');
    if(updated&&data.updated_at){
      const t=new Date(data.updated_at);
      updated.textContent='更新 '+(t.getMonth()+1)+'/'+t.getDate()+' '+String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0');
    }
  })
  .catch(()=>{});
