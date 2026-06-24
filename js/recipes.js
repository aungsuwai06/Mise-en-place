'use strict';

const BASE = 'https://www.themealdb.com/api/json/v1/1';

/* ── Category Japanese names ── */
const CATEGORY_JA = {
  Beef:          '牛肉',
  Chicken:       '鶏肉',
  Dessert:       'デザート',
  Lamb:          '羊肉',
  Pasta:         'パスタ',
  Pork:          '豚肉',
  Seafood:       '海鮮',
  Side:          'サイドディッシュ',
  Starter:       '前菜',
  Vegan:         'ヴィーガン',
  Vegetarian:    'ベジタリアン',
  Breakfast:     '朝食',
  Goat:          '山羊肉',
  Miscellaneous: 'その他',
};

/* ── Country Japanese names ── */
const COUNTRY_JA = {
  Afghan:'アフガニスタン', Albanian:'アルバニア', Algerian:'アルジェリア',
  American:'アメリカ', Argentine:'アルゼンチン', Armenian:'アルメニア',
  Australian:'オーストラリア', Austrian:'オーストリア', Bangladeshi:'バングラデシュ',
  British:'イギリス', Cambodian:'カンボジア', Canadian:'カナダ',
  Chinese:'中国', Croatian:'クロアチア', Dutch:'オランダ',
  Egyptian:'エジプト', Filipino:'フィリピン', French:'フランス',
  Greek:'ギリシャ', Indian:'インド', Irish:'アイルランド',
  Italian:'イタリア', Jamaican:'ジャマイカ', Japanese:'日本',
  Kenyan:'ケニア', Laotian:'ラオス', Malaysian:'マレーシア',
  Mexican:'メキシコ', Moroccan:'モロッコ', Norwegian:'ノルウェー',
  Polish:'ポーランド', Portuguese:'ポルトガル', Russian:'ロシア',
  Slovak:'スロバキア', Spanish:'スペイン', Syrian:'シリア',
  Thai:'タイ', Tunisian:'チュニジア', Turkish:'トルコ',
  Ukrainian:'ウクライナ', Venezuelan:'ベネズエラ', Vietnamese:'ベトナム',
  Uruguayan:'ウルグアイ',
};

/* ── Flag emoji (no external image — works everywhere) ── */
const FLAGS = {
  Afghan:'🇦🇫', Albanian:'🇦🇱', Algerian:'🇩🇿', American:'🇺🇸',
  Argentine:'🇦🇷', Armenian:'🇦🇲', Australian:'🇦🇺', Austrian:'🇦🇹',
  Bangladeshi:'🇧🇩', British:'🇬🇧', Cambodian:'🇰🇭', Canadian:'🇨🇦',
  Chinese:'🇨🇳', Croatian:'🇭🇷', Dutch:'🇳🇱', Egyptian:'🇪🇬',
  Filipino:'🇵🇭', French:'🇫🇷', Greek:'🇬🇷', Indian:'🇮🇳',
  Irish:'🇮🇪', Italian:'🇮🇹', Jamaican:'🇯🇲', Japanese:'🇯🇵',
  Kenyan:'🇰🇪', Laotian:'🇱🇦', Malaysian:'🇲🇾', Mexican:'🇲🇽',
  Moroccan:'🇲🇦', Norwegian:'🇳🇴', Polish:'🇵🇱', Portuguese:'🇵🇹',
  Russian:'🇷🇺', Slovak:'🇸🇰', Spanish:'🇪🇸', Syrian:'🇸🇾',
  Thai:'🇹🇭', Tunisian:'🇹🇳', Turkish:'🇹🇷', Ukrainian:'🇺🇦',
  Venezuelan:'🇻🇪', Vietnamese:'🇻🇳', Uruguayan:'🇺🇾',
};

/* ─────────────────────────────────────────────
   API helper
───────────────────────────────────────────── */
async function api(path) {
  const r = await fetch(BASE + path);
  if (!r.ok) throw new Error('API ' + r.status + ' — ' + path);
  return r.json();
}

/* ─────────────────────────────────────────────
   Card + skeleton templates
───────────────────────────────────────────── */
function cardHTML(meal) {
  return `
    <div class="meal-card" data-id="${meal.idMeal}"
         tabindex="0" role="button"
         aria-label="${meal.strMeal} のレシピを見る">
      <img src="${meal.strMealThumb}/medium"
           alt="${meal.strMeal}"
           loading="eager"
           onerror="this.src='${meal.strMealThumb}'">
      <div class="card-body">
        <div class="tag">${CATEGORY_JA[meal.strCategory] || meal.strCategory || ''}</div>
        <h3>${meal.strMeal}</h3>
        ${meal.strArea
          ? `<div class="area-tag">${COUNTRY_JA[meal.strArea] || meal.strArea}</div>`
          : ''}
      </div>
    </div>`;
}

function skeletonCards(n = 4) {
  return Array.from({ length: n }, () => `
    <div class="skel-card">
      <div class="skeleton skel-img"></div>
      <div class="skel-body">
        <div class="skeleton skel-line" style="width:40%"></div>
        <div class="skeleton skel-line" style="width:80%"></div>
        <div class="skeleton skel-line" style="width:55%"></div>
      </div>
    </div>`).join('');
}

/* ─────────────────────────────────────────────
   Grid render
───────────────────────────────────────────── */
function renderGrid(meals, label) {
  const grid  = document.getElementById('mealGrid');
  const title = document.getElementById('spotlightTitle');

  /* always keep the correct CSS class */
  grid.className = 'meal-grid';

  if (label) title.textContent = label;

  if (!meals || !meals.length) {
    grid.innerHTML = `
      <div class="state-msg" style="grid-column:1/-1">
        <h3>レシピが見つかりませんでした</h3>
        <p>別のキーワードやカテゴリーでお試しください。</p>
      </div>`;
    return;
  }

  grid.innerHTML = meals.map(cardHTML).join('');
  bindCardClicks();
}

function bindCardClicks() {
  document.querySelectorAll('.meal-card').forEach(card => {
    card.addEventListener('click',   () => openMeal(card.dataset.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openMeal(card.dataset.id);
    });
  });
}

/* ─────────────────────────────────────────────
   Navigation
───────────────────────────────────────────── */
function openMeal(id) {
  window.open(`recipe.php?id=${encodeURIComponent(id)}`, '_blank');
}

function toggleImage() {
  const hero = document.getElementById('heroSection');
  if (hero) hero.classList.toggle('expanded');
}

/* ─────────────────────────────────────────────
   Categories — icons load eagerly, no lazy
───────────────────────────────────────────── */
async function loadCategories() {
  try {
    const data = await api('/categories.php');

    /* put Miscellaneous last */
    const cats = (data.categories || []).sort((a, b) => {
      if (a.strCategory === 'Miscellaneous') return  1;
      if (b.strCategory === 'Miscellaneous') return -1;
      return 0;
    });

    const container = document.getElementById('categories');
    container.innerHTML =
      `<button class="cat-pill active" data-cat="">全て</button>` +
      cats.map(c => `
        <button class="cat-pill" data-cat="${c.strCategory}">
          <img
            src="${c.strCategoryThumb}"
            alt="${CATEGORY_JA[c.strCategory] || c.strCategory}"
            width="22" height="22"
            loading="eager"
            onerror="this.style.display='none'">
          ${CATEGORY_JA[c.strCategory] || c.strCategory}
        </button>`
      ).join('');

    container.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        if (!cat) { loadDefaultMeals(); } else { filterByCategory(cat); }
      });
    });

  } catch (err) {
    console.error('loadCategories:', err);
    document.getElementById('categories').innerHTML =
      '<p style="color:var(--spice);font-size:.85rem">カテゴリーの読み込みに失敗しました。</p>';
  }
}

/* ─────────────────────────────────────────────
   Filter by category
───────────────────────────────────────────── */
async function filterByCategory(cat) {
  document.getElementById('mealGrid').innerHTML = skeletonCards(6);
  try {
    const all   = await fetchAllMeals();
    const meals = all.filter(m => m.strCategory === cat);
    renderGrid(meals, (CATEGORY_JA[cat] || cat) + ' のレシピ');
  } catch (err) {
    console.error('filterByCategory:', err);
    renderGrid([], cat);
  }
}

/* ─────────────────────────────────────────────
   Full meal cache (a–z scan)
───────────────────────────────────────────── */
async function fetchAllMeals() {
  if (window._allMealsCache) return window._allMealsCache;

  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const results = await Promise.all(
    letters.map(l =>
      api(`/search.php?f=${l}`)
        .then(d => d.meals || [])
        .catch(() => [])          /* one failed letter ≠ total failure */
    )
  );

  const all    = results.flat();
  const seen   = new Set();
  const deduped = all.filter(m => {
    if (seen.has(m.idMeal)) return false;
    seen.add(m.idMeal);
    return true;
  });

  window._allMealsCache = deduped;
  return deduped;
}

/* ─────────────────────────────────────────────
   Areas — emoji flags (no external image CDN)
───────────────────────────────────────────── */
async function loadAreas() {
  const grid = document.getElementById('areaGrid');
  grid.innerHTML = `
    <div style="grid-column:1/-1;color:var(--ink-muted);font-size:.85rem">
      料理データを読み込み中…
    </div>`;

  try {
    const data       = await api('/list.php?a=list');
    const masterList = data.meals || [];
    window._areaMap  = {};
    masterList.forEach(a => { window._areaMap[a.strArea] = a; });

    const all       = await fetchAllMeals();
    const areaCount = {};
    all.forEach(m => {
      const key = m.strArea || null;
      if (key) areaCount[key] = (areaCount[key] || 0) + 1;
    });

    const validAreas = masterList.filter(a => areaCount[a.strArea]);

    grid.innerHTML = validAreas.map(a => `
      <div class="area-card" data-area="${a.strArea}"
           tabindex="0" role="button"
           aria-label="${COUNTRY_JA[a.strArea] || a.strArea} 料理を見る">
        <div class="flag">${FLAGS[a.strArea] || '🌍'}</div>
        <div class="name">${COUNTRY_JA[a.strArea] || a.strArea}</div>
      </div>`).join('');

    document.querySelectorAll('.area-card').forEach(card => {
      card.addEventListener('click',   () => filterByArea(card.dataset.area));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter') filterByArea(card.dataset.area);
      });
    });

  } catch (err) {
    console.error('loadAreas:', err);
    grid.innerHTML =
      '<p style="color:var(--spice);font-size:.85rem">国データの読み込みに失敗しました。</p>';
  }
}

/* ─────────────────────────────────────────────
   Filter by area
───────────────────────────────────────────── */
async function filterByArea(area) {
  document.getElementById('mealGrid').innerHTML = skeletonCards(6);
  const head = document.getElementById('spotlightHead');
  if (head) window.scrollTo({ top: head.offsetTop - 80, behavior: 'smooth' });

  try {
    const all   = await fetchAllMeals();
    const meals = all.filter(m => m.strArea === area);
    renderGrid(meals, (COUNTRY_JA[area] || area) + ' 料理');
  } catch (err) {
    console.error('filterByArea:', err);
    renderGrid([], area);
  }
}

/* ─────────────────────────────────────────────
   Random meals
───────────────────────────────────────────── */
async function loadRandom() {
  document.getElementById('mealGrid').innerHTML = skeletonCards(4);
  try {
    const results = await Promise.all(
      Array.from({ length: 4 }, () => api('/random.php'))
    );
    const meals = results.map(r => r.meals?.[0]).filter(Boolean);
    renderGrid(meals, 'お任せで選びました！');
  } catch (err) {
    console.error('loadRandom:', err);
  }
}

document.getElementById('randomBtn')
  .addEventListener('click', loadRandom);

/* ─────────────────────────────────────────────
   Search  (was accidentally commented out — fixed)
───────────────────────────────────────────── */
async function doSearch(q) {
  q = q.trim();
  if (!q) return;

  document.getElementById('mealGrid').innerHTML = skeletonCards(6);
  try {
    const data = await api(`/search.php?s=${encodeURIComponent(q)}`);
    renderGrid(data.meals || [], `「${q}」の検索結果`);
    const head = document.getElementById('spotlightHead');
    if (head) window.scrollTo({ top: head.offsetTop - 80, behavior: 'smooth' });
  } catch (err) {
    console.error('doSearch:', err);
    renderGrid([], q);
  }
}

document.getElementById('searchBtn')
  .addEventListener('click', () =>
    doSearch(document.getElementById('searchInput').value)
  );

document.getElementById('searchInput')
  .addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch(e.target.value);
  });

/* ─────────────────────────────────────────────
   Date-seeded default meals
───────────────────────────────────────────── */
function getDateSeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

async function loadDefaultMeals() {
  document.getElementById('mealGrid').innerHTML = skeletonCards(8);
  try {
    const all    = await fetchAllMeals();
    const seed   = getDateSeed();
    const indices = new Set();
    let i = 0;
    while (indices.size < 8) {
      indices.add(Math.floor(seededRandom(seed + i) * all.length));
      i++;
    }
    const meals = [...indices].map(idx => all[idx]);
    renderGrid(meals, '本日のおすすめ');
  } catch (err) {
    console.error('loadDefaultMeals:', err);
  }
}

/* ─────────────────────────────────────────────
   Init
───────────────────────────────────────────── */
loadCategories();
loadDefaultMeals();
loadAreas();