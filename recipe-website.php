<?php
session_start();

if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: login.php");
    exit;
}

require_once 'functions.php';
?>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mise en Place — World Recipes</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css">
</head>
<body>

<header>
  <?php include("header.php"); ?>
</header>

<div class="hero">
  <div class="index">
    <p class="hero-eyebrow">世界中のレシピ・３００以上</p>
    <h1>自信で <em>料理</em>、<br>誇りで <em>お食事</em></h1>
    <p>世界中の国々のレシピ。品名・カテゴリー・国で検索もお任せにもすることが出来ます。世界中の食文化を楽しみましょう。</p>
    <div class="search-wrap">
      <input type="text" id="searchInput" placeholder="Search a dish — e.g. Pasta, Curry, Tacos…">
      <button id="searchBtn">検索</button>
    </div>
  </div>
</div>

<main>

  <!-- Categories -->
  <div class="section-head">
    <h2>カテゴリーで検索</h2>
    <div class="line"></div>
  </div>
  <div class="categories" id="categories">
    <div class="skeleton" style="width:90px;height:34px;border-radius:100px;"></div>
    <div class="skeleton" style="width:110px;height:34px;border-radius:100px;"></div>
    <div class="skeleton" style="width:80px;height:34px;border-radius:100px;"></div>
    <div class="skeleton" style="width:100px;height:34px;border-radius:100px;"></div>
    <div class="skeleton" style="width:75px;height:34px;border-radius:100px;"></div>
  </div>

  <!-- Spotlight -->
  <div class="section-head" id="spotlightHead">
    <h2 id="spotlightTitle">本日のおすすめ</h2>
    <div class="line"></div>
    <button class="btn-random" id="randomBtn">✦ お任せにする</button>
  </div>

  <div class="meal-grid" id="mealGrid">
    <div class="skel-card"><div class="skeleton skel-img"></div><div class="skel-body"><div class="skeleton skel-line" style="width:40%"></div><div class="skeleton skel-line" style="width:80%"></div><div class="skeleton skel-line" style="width:55%"></div></div></div>
    <div class="skel-card"><div class="skeleton skel-img"></div><div class="skel-body"><div class="skeleton skel-line" style="width:40%"></div><div class="skeleton skel-line" style="width:80%"></div><div class="skeleton skel-line" style="width:55%"></div></div></div>
    <div class="skel-card"><div class="skeleton skel-img"></div><div class="skel-body"><div class="skeleton skel-line" style="width:40%"></div><div class="skeleton skel-line" style="width:80%"></div><div class="skeleton skel-line" style="width:55%"></div></div></div>
    <div class="skel-card"><div class="skeleton skel-img"></div><div class="skel-body"><div class="skeleton skel-line" style="width:40%"></div><div class="skeleton skel-line" style="width:80%"></div><div class="skeleton skel-line" style="width:55%"></div></div></div>
  </div>

  <!-- Cuisines by country -->
  <div class="section-head" style="margin-top:3rem;">
    <h2>国で検索</h2>
    <div class="line"></div>
  </div>
  <div class="area-grid" id="areaGrid">
    <div class="skeleton" style="height:78px;border-radius:10px;"></div>
    <div class="skeleton" style="height:78px;border-radius:10px;"></div>
    <div class="skeleton" style="height:78px;border-radius:10px;"></div>
    <div class="skeleton" style="height:78px;border-radius:10px;"></div>
    <div class="skeleton" style="height:78px;border-radius:10px;"></div>
  </div>

</main>

<footer>
  <?php include("footer.php"); ?>
</footer>

<!-- JS filename kept as recipies.js to match your existing file on server -->
<script src="js/recipes.js"></script>
</body>
</html>