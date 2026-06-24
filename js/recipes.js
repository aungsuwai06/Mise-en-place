const BASE = 'https://www.themealdb.com/api/json/v1/1';

/* ── Japanese category name map ── */
const CAT_JA = {
  'Beef':         '牛肉',
  'Chicken':      '鶏肉',
  'Dessert':      'デザート',
  'Lamb':         '羊肉',
  'Miscellaneous':'その他',
  'Pasta':        'パスタ',
  'Pork':         '豚肉',
  'Seafood':      '海鮮',
  'Side':         'サイドディッシュ',
  'Starter':      '前菜',
  'Vegan':        'ヴィーガン',
  'Vegetarian':   'ベジタリアン',
  'Breakfast':    '朝食',
  'Goat':         '山羊肉',
};

/* ── Flags lookup ── */
const FLAGS = {
  Afghan:'🇦🇫', Albanian:'🇦🇱', Algerian:'🇩🇿', American:'🇺🇸', Andorran:'🇦🇩',
  Angolan:'🇦🇴', Argentine:'🇦🇷', Armenian:'🇦🇲', Aruban:'🇦🇼', Australian:'🇦🇺',
  Austrian:'🇦🇹', Azerbaijani:'🇦🇿', Bahamian:'🇧🇸', Bangladeshi:'🇧🇩', Barbadian:'🇧🇧',
  British:'🇬🇧', Cambodian:'🇰🇭', Canadian:'🇨🇦', Chinese:'🇨🇳', Croatian:'🇭🇷',
  Dutch:'🇳🇱', Egyptian:'🇪🇬', Filipino:'🇵🇭', French:'🇫🇷', Greek:'🇬🇷',
  Indian:'🇮🇳', Irish:'🇮🇪', Italian:'🇮🇹', Jamaican:'🇯🇲', Japanese:'🇯🇵',
  Kenyan:'🇰🇪', Laotian:'🇱🇦', Malaysian:'🇲🇾', Mexican:'🇲🇽', Moroccan:'🇲🇦',
  Norwegian:'🇳🇴', Polish:'🇵🇱', Portuguese:'🇵🇹', Russian:'🇷🇺', Slovak:'🇸🇰',
  Spanish:'🇪🇸', Syrian:'🇸🇾', Thai:'🇹🇭', Tunisian:'🇹🇳', Turkish:'🇹🇷',
  Ukrainian:'🇺🇦', Venezuelan:'🇻🇪', Vietnamese:'🇻🇳', Uruguayan:'🇺🇾', Unknown:'🌍'
};

/* ── API helper ── */
async function api(path) {
  const r = await fetch(BASE + path);
  if (!r.ok) throw new Error('API error ' + r.status);
  return r.json();
}

function buildIngredients(meal) {
  const out = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      out.push({ name: name.trim(), measure: (measure||'').trim() });
    }
  }
  return out;
}

/* ── Render helpers ── */
function cardHTML(meal) {
  return `
    <div class="meal-card" data-id="${meal.idMeal}" tabindex="0" role="button" aria-label="View recipe for ${meal.strMeal}">
      <img src="${meal.strMealThumb}/medium" alt="${meal.strMeal}" loading="lazy">
      <div class="card-body">
        <div class="tag">${meal.strCategory || ''}</div>
        <h3>${meal.strMeal}</h3>
        ${meal.strArea ? `<div class="area-tag">${meal.strArea}</div>` : ''}
      </div>
    </div>`;
}

function skeletonCards(n=4) {
  return Array.from({length:n}, ()=>`
    <div class="skel-card">
      <div class="skeleton skel-img"></div>
      <div class="skel-body">
        <div class="skeleton skel-line" style="width:40%"></div>
        <div class="skeleton skel-line" style="width:80%"></div>
        <div class="skeleton skel-line" style="width:55%"></div>
      </div>
    </div>`).join('');
}

/* ── Grid render ── */
let currentLabel = '本日のおすすめ';
function renderGrid(meals, label) {
  const grid = document.getElementById('mealGrid');
  const title = document.getElementById('spotlightTitle');
  if (label) { currentLabel = label; title.textContent = label; }
  if (!meals || !meals.length) {
    grid.innerHTML = `<div class="state-msg" style="grid-column:1/-1"><h3>No recipes found</h3><p>Try a different search term or category.</p></div>`;
    return;
  }
  grid.innerHTML = meals.map(cardHTML).join('');
  bindCardClicks();
}

function bindCardClicks() {
  document.querySelectorAll('.meal-card').forEach(card => {
    card.addEventListener('click', () => openMeal(card.dataset.id));
    card.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') openMeal(card.dataset.id); });
  });
}

/* ── Open recipe detail page ── */
function openMeal(id) {
  window.open(`recipe.php?id=${id}`, '_blank');
}

function toggleImage() {
  const hero = document.getElementById('heroSection');
  if (hero) hero.classList.toggle('expanded');
}

/* ── Load categories with icons + Japanese names ── */
async function loadCategories() {
  try {
    const data = await api('/categories.php');
    const cats = data.categories || [];
    const container = document.getElementById('categories');

    container.innerHTML =
      /* "全て" pill — no icon */
      `<button class="cat-pill active" data-cat="">全て</button>` +
      cats.map(c => `
        <button class="cat-pill" data-cat="${c.strCategory}">
          <img
            src="${c.strCategoryThumb}"
            alt="${c.strCategory}"
            width="20" height="20"
            style="border-radius:50%;object-fit:cover;flex-shrink:0;"
            onerror="this.style.display='none'">
          ${CAT_JA[c.strCategory] || c.strCategory}
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

  } catch(err) {
    console.error('loadCategories failed:', err);
  }
}

/* ── Filter by category ── */
async function filterByCategory(cat) {
  document.getElementById('mealGrid').innerHTML = skeletonCards(6);
  try {
    const all = await fetchAllMeals();
    const meals = all.filter(m => m.strCategory === cat);
    renderGrid(meals, (CAT_JA[cat] || cat) + ' のレシピ');
  } catch(err) { console.error(err); }
}

/* ── Fetch all meals (cached) ── */
async function fetchAllMeals() {
  if (window._allMealsCache) return window._allMealsCache;
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const results = await Promise.all(
    letters.map(l => api(`/search.php?f=${l}`).then(d => d.meals || []).catch(() => []))
  );
  const all = results.flat();
  const seen = new Set();
  const deduped = all.filter(m => {
    if (seen.has(m.idMeal)) return false;
    seen.add(m.idMeal);
    return true;
  });
  window._allMealsCache = deduped;
  return deduped;
}

/* ── Load areas ── */
async function loadAreas() {
  const grid = document.getElementById('areaGrid');
  grid.innerHTML = '<div style="grid-column:1/-1;color:var(--ink-muted);font-size:0.85rem;">料理データを読み込み中…</div>';
  try {
    const data = await api('/list.php?a=list');
    const masterList = data.meals || [];
    window._areaMap = {};
    masterList.forEach(a => { window._areaMap[a.strArea] = a; });

    const all = await fetchAllMeals();
    const areaCount = {};
    all.forEach(m => {
      const key = m.strArea || m.strCountry || null;
      if (key) areaCount[key] = (areaCount[key] || 0) + 1;
    });

    const validAreas = masterList.filter(a => areaCount[a.strArea] || areaCount[a.strCountry]);
    grid.innerHTML = validAreas.map(a => `
      <div class="area-card" data-area="${a.strArea}" tabindex="0" role="button">
        <div class="flag">${FLAGS[a.strArea] || '🌍'}</div>
        <div class="name">${a.strArea}</div>
      </div>`).join('');

    document.querySelectorAll('.area-card').forEach(card => {
      card.addEventListener('click', () => filterByArea(card.dataset.area));
      card.addEventListener('keydown', e => { if (e.key === 'Enter') filterByArea(card.dataset.area); });
    });
  } catch(err) {
    console.error('loadAreas failed:', err);
    grid.innerHTML = '<p style="color:var(--spice)">エリアの読み込みに失敗しました。</p>';
  }
}

/* ── Filter by area ── */
async function filterByArea(area) {
  document.getElementById('mealGrid').innerHTML = skeletonCards(6);
  window.scrollTo({top: document.getElementById('spotlightHead').offsetTop - 80, behavior:'smooth'});
  try {
    const all = await fetchAllMeals();
    const areaObj = window._areaMap && window._areaMap[area];
    const countryName = areaObj ? areaObj.strCountry : null;
    const meals = all.filter(m =>
      (m.strArea && m.strArea === area) ||
      (countryName && m.strCountry && m.strCountry === countryName)
    );
    renderGrid(meals, area + ' cuisine');
  } catch(err) { console.error(err); }
}

/* ── Random meals ── */
async function loadRandom() {
  document.getElementById('mealGrid').innerHTML = skeletonCards(4);
  try {
    const promises = Array.from({length:4}, () => api('/random.php'));
    const results = await Promise.all(promises);
    const meals = results.map(r => r.meals[0]).filter(Boolean);
    renderGrid(meals, 'お任せで選びました！');
  } catch(err) { console.error(err); }
}

document.getElementById('randomBtn').addEventListener('click', loadRandom);

/* ── Search ── */
async function doSearch(q) {
  if (!q.trim()) return;
  document.getElementById('mealGrid').innerHTML = skeletonCards(6);
  try {
    const data = await api(`/search.php?s=${encodeURIComponent(q.trim())}`);
    renderGrid(data.meals || [], `「${q.trim()}」の検索結果`);
    window.scrollTo({top: document.getElementById('spotlightHead').offsetTop - 80, behavior:'smooth'});
  } catch(err) { console.error(err); }
}

document.getElementById('searchBtn').addEventListener('click', () => doSearch(document.getElementById('searchInput').value));
document.getElementById('searchInput').addEventListener('keydown', e => { if(e.key==='Enter') doSearch(e.target.value); });

/* ── Date-seeded default meals ── */
function getDateSeed() {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

async function loadDefaultMeals() {
  document.getElementById('mealGrid').innerHTML = skeletonCards(8);
  try {
    const all = await fetchAllMeals();
    const seed = getDateSeed();
    const indices = new Set();
    let i = 0;
    while (indices.size < 8) {
      indices.add(Math.floor(seededRandom(seed + i) * all.length));
      i++;
    }
    const meals = [...indices].map(idx => all[idx]);
    renderGrid(meals, '本日のおすすめ');
  } catch(err) { console.error(err); }
}

/* ── Init ── */
loadCategories();
loadDefaultMeals();
loadAreas();