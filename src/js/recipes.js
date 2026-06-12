/**
 * recipes.js  (was: recipies.js — typo fixed)
 * Client-side logic for Mise en Place.
 * Fetches data from TheMealDB public API and populates the page.
 */

'use strict';

const BASE = 'https://www.themealdb.com/api/json/v1/1';

/* ── Country flag emoji lookup ─────────────────────────── */
const FLAGS = {
  Afghan:'🇦🇫', Albanian:'🇦🇱', Algerian:'🇩🇿', American:'🇺🇸',
  Argentine:'🇦🇷', Armenian:'🇦🇲', Australian:'🇦🇺', Austrian:'🇦🇹',
  Bangladeshi:'🇧🇩', British:'🇬🇧', Cambodian:'🇰🇭', Canadian:'🇨🇦',
  Chinese:'🇨🇳', Croatian:'🇭🇷', Dutch:'🇳🇱', Egyptian:'🇪🇬',
  Filipino:'🇵🇭', French:'🇫🇷', Greek:'🇬🇷', Indian:'🇮🇳',
  Irish:'🇮🇪', Italian:'🇮🇹', Jamaican:'🇯🇲', Japanese:'🇯🇵',
  Kenyan:'🇰🇪', Malaysian:'🇲🇾', Mexican:'🇲🇽', Moroccan:'🇲🇦',
  Norwegian:'🇳🇴', Polish:'🇵🇱', Portuguese:'🇵🇹', Russian:'🇷🇺',
  Slovak:'🇸🇰', Spanish:'🇪🇸', Syrian:'🇸🇾', Thai:'🇹🇭',
  Tunisian:'🇹🇳', Turkish:'🇹🇷', Ukrainian:'🇺🇦', Uruguayan:'🇺🇾',
  Venezuelan:'🇻🇪', Vietnamese:'🇻🇳', Unknown:'🌍'
};

/* ── API helper ────────────────────────────────────────── */
/**
 * Fetches a JSON endpoint from TheMealDB.
 * @param  {string} path  e.g. '/categories.php'
 * @returns {Promise<object>}
 * @throws  {Error} if the network request fails
 */
async function api(path) {
  const response = await fetch(BASE + path);
  if (!response.ok) {
    throw new Error(`API error ${response.status} for ${path}`);
  }
  return response.json();
}

/* ── Template helpers ──────────────────────────────────── */
/**
 * Returns the HTML string for a meal card.
 * @param {object} meal  TheMealDB meal object
 */
function cardHTML(meal) {
  return `
    <div
      class="meal-card"
      data-id="${meal.idMeal}"
      tabindex="0"
      role="button"
      aria-label="${meal.strMeal} のレシピを見る">
      <img src="${meal.strMealThumb}/medium" alt="${meal.strMeal}" loading="lazy">
      <div class="card-body">
        <div class="tag">${meal.strCategory || ''}</div>
        <h3>${meal.strMeal}</h3>
        ${meal.strArea ? `<div class="area-tag">${meal.strArea}</div>` : ''}
      </div>
    </div>`;
}

/**
 * Returns n skeleton card HTML strings joined together.
 * @param {number} n
 */
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

/* ── Grid rendering ────────────────────────────────────── */
let currentLabel = '本日のおすすめ';

/**
 * Populates the #mealGrid element with meal cards.
 * @param {Array}  meals  Array of TheMealDB meal objects
 * @param {string} label  Section title to display
 */
function renderGrid(meals, label) {
  const grid  = document.getElementById('mealGrid');
  const title = document.getElementById('spotlightTitle');

  if (label) {
    currentLabel     = label;
    title.textContent = label;
  }

  if (!meals || meals.length === 0) {
    grid.innerHTML = `
      <div class="state-msg" style="grid-column:1/-1">
        <h3>レシピが見つかりませんでした</h3>
        <p>検索ワードやカテゴリーを変えてお試しください。</p>
      </div>`;
    return;
  }

  grid.innerHTML = meals.map(cardHTML).join('');
  bindCardClicks();
}

/** Attaches click / keyboard handlers to all .meal-card elements. */
function bindCardClicks() {
  document.querySelectorAll('.meal-card').forEach(card => {
    card.addEventListener('click', () => openMeal(card.dataset.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openMeal(card.dataset.id);
    });
  });
}

/* ── Meal detail page ──────────────────────────────────── */
/**
 * Opens the detail page for a meal in a new tab.
 * @param {string} id  TheMealDB meal ID
 */
function openMeal(id) {
  window.open(`recipe.php?id=${encodeURIComponent(id)}`, '_blank');
}

/** Toggles the hero image between clipped and full-height on recipe.php. */
function toggleImage() {
  const hero = document.getElementById('heroSection');
  if (hero) hero.classList.toggle('expanded');
}

/* ── Category pills ────────────────────────────────────── */
async function loadCategories() {
  try {
    const data = await api('/categories.php');
    const cats  = data.categories || [];
    const container = document.getElementById('categories');

    container.innerHTML =
      `<button class="cat-pill active" data-cat="">All</button>` +
      cats.map(c => `
        <button class="cat-pill" data-cat="${c.strCategory}">
          <img src="${c.strCategoryThumb}/small" alt="">
          ${c.strCategory}
        </button>`).join('');

    container.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.dataset.cat;
        cat ? filterByCategory(cat) : loadDefaultMeals();
      });
    });

  } catch (err) {
    console.error('loadCategories failed:', err);
    document.getElementById('categories').innerHTML =
      '<p style="color:var(--spice);font-size:0.85rem;">カテゴリーの読み込みに失敗しました。</p>';
  }
}

/* ── Filter by category ────────────────────────────────── */
async function filterByCategory(cat) {
  document.getElementById('mealGrid').innerHTML = skeletonCards(6);
  try {
    const all   = await fetchAllMeals();
    const meals = all.filter(m => m.strCategory === cat).slice(0, 12);
    renderGrid(meals, `${cat} recipes`);
  } catch (err) {
    console.error('filterByCategory failed:', err);
    renderGrid([], cat);
  }
}

/* ── Cuisine / area cards ──────────────────────────────── */
async function loadAreas() {
  const grid = document.getElementById('areaGrid');
  grid.innerHTML = '<div style="grid-column:1/-1;color:var(--ink-muted);font-size:0.85rem;">料理データを読み込み中…</div>';

  try {
    const data       = await api('/list.php?a=list');
    const masterList = data.meals || [];

    // Build a map keyed by area name for quick lookup
    window._areaMap = {};
    masterList.forEach(a => { window._areaMap[a.strArea] = a; });

    const all = await fetchAllMeals();

    // Count meals per area
    const areaCount = {};
    all.forEach(m => {
      const key = m.strArea || null;
      if (key) areaCount[key] = (areaCount[key] || 0) + 1;
    });

    // Only show areas that have at least one recipe in the full dataset
    const validAreas = masterList.filter(a => areaCount[a.strArea]);

    grid.innerHTML = validAreas.map(a => `
      <div
        class="area-card"
        data-area="${a.strArea}"
        tabindex="0"
        role="button"
        aria-label="${a.strArea} 料理を見る">
        <div class="flag">${FLAGS[a.strArea] || '🌍'}</div>
        <div class="name">${a.strArea}</div>
      </div>`).join('');

    document.querySelectorAll('.area-card').forEach(card => {
      card.addEventListener('click',   () => filterByArea(card.dataset.area));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter') filterByArea(card.dataset.area);
      });
    });

  } catch (err) {
    console.error('loadAreas failed:', err);
    grid.innerHTML = '<p style="color:var(--spice);font-size:0.85rem;">国データの読み込みに失敗しました。</p>';
  }
}

/* ── Full meal dataset (cached) ────────────────────────── */
/**
 * Fetches all meals by searching every letter a–z, deduplicates, and caches.
 * Note: /filter.php?a= is broken for area filtering on this API, so we scan
 * /search.php?f=[letter] and filter client-side instead.
 *
 * @returns {Promise<Array>} Full meal list
 */
async function fetchAllMeals() {
  if (window._allMealsCache) return window._allMealsCache;

  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const results = await Promise.all(
    letters.map(l =>
      api(`/search.php?f=${l}`)
        .then(d => d.meals || [])
        .catch(() => [])  // individual letter failures are non-fatal
    )
  );

  const all  = results.flat();
  const seen = new Set();
  const deduped = all.filter(m => {
    if (seen.has(m.idMeal)) return false;
    seen.add(m.idMeal);
    return true;
  });

  window._allMealsCache = deduped;
  return deduped;
}

/* ── Filter by area ────────────────────────────────────── */
async function filterByArea(area) {
  document.getElementById('mealGrid').innerHTML = skeletonCards(6);

  // Scroll to the spotlight section
  const spotHead = document.getElementById('spotlightHead');
  if (spotHead) window.scrollTo({ top: spotHead.offsetTop - 80, behavior: 'smooth' });

  try {
    const all   = await fetchAllMeals();
    const meals = all.filter(m => m.strArea === area).slice(0, 12);
    renderGrid(meals, `${area} cuisine`);
  } catch (err) {
    console.error('filterByArea failed:', err);
    renderGrid([], area);
  }
}

/* ── Random meals ──────────────────────────────────────── */
async function loadRandom() {
  document.getElementById('mealGrid').innerHTML = skeletonCards(4);
  try {
    const promises = Array.from({ length: 4 }, () => api('/random.php'));
    const results  = await Promise.all(promises);
    const meals    = results.map(r => r.meals[0]).filter(Boolean);
    renderGrid(meals, 'サプライズ');
  } catch (err) {
    console.error('loadRandom failed:', err);
    renderGrid([], 'サプライズ');
  }
}

/* ── Search ────────────────────────────────────────────── */
async function doSearch(q) {
  q = q.trim();
  if (!q) return;

  document.getElementById('mealGrid').innerHTML = skeletonCards(6);

  try {
    const data = await api(`/search.php?s=${encodeURIComponent(q)}`);
    renderGrid(data.meals || [], `"${q}" の検索結果`);
    const spotHead = document.getElementById('spotlightHead');
    if (spotHead) window.scrollTo({ top: spotHead.offsetTop - 80, behavior: 'smooth' });
  } catch (err) {
    console.error('doSearch failed:', err);
    renderGrid([], q);
  }
}

/* ── Default meal batch ────────────────────────────────── */
async function loadDefaultMeals() {
  document.getElementById('mealGrid').innerHTML = skeletonCards(8);
  try {
    const data  = await api('/search.php?f=b');
    const meals = (data.meals || []).slice(0, 8);
    renderGrid(meals, '本日のおすすめ');
  } catch (err) {
    console.error('loadDefaultMeals failed:', err);
    renderGrid([], '本日のおすすめ');
  }
}

/* ── Event listeners ───────────────────────────────────── */
document.getElementById('randomBtn')
  .addEventListener('click', loadRandom);

document.getElementById('searchBtn')
  .addEventListener('click', () => doSearch(document.getElementById('searchInput').value));

document.getElementById('searchInput')
  .addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch(e.target.value);
  });

/* ── Bootstrap page ────────────────────────────────────── */
loadCategories();
loadDefaultMeals();
loadAreas();
