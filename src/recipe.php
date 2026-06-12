<?php
/**
 * recipe.php
 * Displays full details for a single meal fetched from TheMealDB API.
 *
 * Bugs fixed from original:
 *  - $_GET['id'] used raw without validation — injected into URL (SSRF risk)
 *  - No check for API returning null (crashes if API is down or ID is invalid)
 *  - Auth guard redirected to register.php instead of login.php
 */

session_start();
require_once 'functions.php';

// Auth guard
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    header('Location: login.php');
    exit();
}

// ── Input validation ──────────────────────────────────────
// TheMealDB IDs are positive integers (5–6 digits)
$rawId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1, 'max_range' => 999999]
]);

if (!$rawId) {
    // Invalid or missing ID — redirect back to main page
    header('Location: recipe-website.php');
    exit();
}

// ── Fetch meal from API ───────────────────────────────────
$url  = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=' . $rawId;
$json = @file_get_contents($url);   // suppress warning; we handle failure below

if ($json === false) {
    $meal = null;
    $apiError = 'レシピデータの取得に失敗しました。';
} else {
    $data = json_decode($json, true);
    $meal = $data['meals'][0] ?? null;
    $apiError = $meal ? '' : '指定されたレシピが見つかりませんでした。';
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $meal ? h($meal['strMeal']) : 'Recipe'; ?> — Mise en Place</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

<header>
    <?php include 'header.php'; ?>
</header>

<main>

<?php if ($apiError): ?>
    <!-- ── Error state ──────────────────────────────── -->
    <div class="state-msg" style="padding:4rem 2rem; text-align:center;">
        <h3>エラー</h3>
        <p><?php echo h($apiError); ?></p>
        <a href="recipe-website.php" class="btn-random" style="display:inline-block;margin-top:1rem;">← トップに戻る</a>
    </div>

<?php else: ?>
    <!-- ── Hero image with expand toggle ───────────── -->
    <div class="modal-hero" id="heroSection">
        <img
            src="<?php echo h($meal['strMealThumb']); ?>"
            alt="<?php echo h($meal['strMeal']); ?>"
            id="heroImg">
        <div class="modal-hero-overlay"></div>
        <div class="modal-hero-text">
            <div class="tag">
                <?php echo h($meal['strCategory'] ?? ''); ?>
                <?php echo !empty($meal['strArea']) ? ' · ' . h($meal['strArea']) : ''; ?>
            </div>
            <h2><?php echo h($meal['strMeal']); ?></h2>
            <button id="expandBtn" onclick="toggleImage()">全体表示</button>
        </div>
    </div>

    <!-- ── Meal body ────────────────────────────────── -->
    <div class="modal-body">

        <!-- Meta chips (country, category, tags) -->
        <div class="modal-meta">
            <?php if (!empty($meal['strArea'])): ?>
                <span class="meta-chip">🌍 <?php echo h($meal['strArea']); ?></span>
            <?php endif; ?>
            <?php if (!empty($meal['strCategory'])): ?>
                <span class="meta-chip">🍴 <?php echo h($meal['strCategory']); ?></span>
            <?php endif; ?>
            <?php if (!empty($meal['strTags'])): ?>
                <?php foreach (explode(',', $meal['strTags']) as $tag): ?>
                    <?php $tag = trim($tag); if ($tag): ?>
                        <span class="meta-chip"><?php echo h($tag); ?></span>
                    <?php endif; ?>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <!-- Ingredients + Instructions columns -->
        <div class="modal-cols">

            <!-- Ingredients -->
            <div class="ingredients-list">
                <h4>Ingredients</h4>
                <?php for ($i = 1; $i <= 20; $i++): ?>
                    <?php
                        $ingName    = trim($meal['strIngredient' . $i] ?? '');
                        $ingMeasure = trim($meal['strMeasure'    . $i] ?? '');
                    ?>
                    <?php if ($ingName !== ''): ?>
                        <div class="ingredient-row">
                            <img
                                src="https://www.themealdb.com/images/ingredients/<?php echo rawurlencode($ingName); ?>.png/small"
                                alt=""
                                loading="lazy"
                                onerror="this.style.display='none'">
                            <span class="ingredient-name"><?php echo h($ingName); ?></span>
                            <span class="ingredient-measure"><?php echo h($ingMeasure); ?></span>
                        </div>
                    <?php endif; ?>
                <?php endfor; ?>
            </div>

            <!-- Instructions -->
            <div class="instructions">
                <h4>Instructions</h4>
                <p><?php echo h($meal['strInstructions'] ?? 'No instructions available.'); ?></p>
                <?php if (!empty($meal['strYoutube'])): ?>
                    <a class="yt-link"
                       href="<?php echo h($meal['strYoutube']); ?>"
                       target="_blank"
                       rel="noopener noreferrer">
                        ▶ Watch on YouTube
                    </a>
                <?php endif; ?>
            </div>

        </div><!-- /.modal-cols -->
    </div><!-- /.modal-body -->
<?php endif; ?>

</main>

<footer>
    <?php include 'footer.php'; ?>
</footer>

<script src="js/recipes.js"></script>
</body>
</html>
