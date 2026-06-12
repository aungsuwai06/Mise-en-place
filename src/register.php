<?php
/**
 * register.php
 * Handles new user registration (GET = show form, POST = process registration).
 *
 * Bugs fixed from original:
 *  - Stray triple-backtick (```) fences inside HTML removed
 *  - include("header copy.php") → include("header_guest.php")
 *  - CSS path unified to css/styles.css
 */

require_once 'db_connect.php';
require_once 'functions.php';

session_start();

// ── Redirect already-logged-in users ──────────────────────
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    header('Location: recipe-website.php');
    exit();
}

// ── Generate CSRF token on first GET ──────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    setToken();
}

// ── Form state ────────────────────────────────────────────
$datas = [
    'name'             => '',
    'password'         => '',
    'confirm_password' => '',
];
$errors = [];

// ── Handle POST ───────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    checkToken();   // CSRF guard

    // Sanitise inputs
    foreach (array_keys($datas) as $key) {
        $input = filter_input(INPUT_POST, $key, FILTER_DEFAULT);
        if ($input !== null) {
            $datas[$key] = trim($input);
        }
    }

    // Validation (register = true → also checks confirm_password)
    $errors = validation($datas, true);

    // Check for duplicate username (only if the name itself passed validation)
    if (empty($errors['name'])) {
        try {
            $stmt = $pdo->prepare('SELECT id FROM users WHERE name = :name LIMIT 1');
            $stmt->bindValue(':name', $datas['name'], PDO::PARAM_STR);
            $stmt->execute();

            if ($stmt->fetch()) {
                $errors['name'] = 'ユーザーネームが既に登録されています。';
            }
        } catch (PDOException $e) {
            error_log('Register duplicate-check error: ' . $e->getMessage());
            $errors['name'] = '登録処理中にエラーが発生しました。';
        }
    }

    // Insert new user if no errors
    if (empty($errors)) {
        try {
            $sql = '
                INSERT INTO users (name, password)
                VALUES (:name, :password)
            ';

            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':name',     $datas['name'],                           PDO::PARAM_STR);
            $stmt->bindValue(':password', password_hash($datas['password'], PASSWORD_DEFAULT), PDO::PARAM_STR);
            $stmt->execute();

            // Registration successful → redirect to login
            header('Location: login.php');
            exit();

        } catch (PDOException $e) {
            error_log('Registration insert error: ' . $e->getMessage());
            $errors['name'] = '登録処理中にエラーが発生しました。しばらく後でもう一度お試しください。';
        }
    }

    // Re-generate CSRF token after a failed POST
    setToken();
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>会員登録 — Mise en Place</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="css/styles.css">
    <style>
        body  { font: 14px 'DM Sans', sans-serif; background: var(--cream); }
        .auth-wrap {
            width: 420px;
            max-width: 100%;
            padding: 2.5rem 2rem;
            margin: 3rem auto;
            background: #fff;
            border: 1px solid var(--cream-dark);
            border-radius: var(--radius-lg);
        }
        .auth-wrap h2 {
            font-family: 'Playfair Display', serif;
            font-weight: 400;
            margin-bottom: 0.25rem;
        }
    </style>
</head>
<body>

<header>
    <?php include 'header_guest.php'; ?>
</header>

<main>
<div class="auth-wrap">

    <h2>会員登録</h2>
    <p class="text-muted mb-3">以下のフォームを入力してください。</p>

    <form action="<?php echo h($_SERVER['SCRIPT_NAME']); ?>" method="post" novalidate>

        <!-- CSRF token -->
        <input type="hidden" name="token" value="<?php echo h($_SESSION['token'] ?? ''); ?>">

        <!-- Username -->
        <div class="form-group">
            <label for="name">ユーザーネーム</label>
            <input
                type="text"
                id="name"
                name="name"
                class="form-control <?php echo !empty($errors['name']) ? 'is-invalid' : ''; ?>"
                value="<?php echo h($datas['name']); ?>"
                autocomplete="username"
                required>
            <div class="invalid-feedback"><?php echo h($errors['name'] ?? ''); ?></div>
        </div>

        <!-- Password -->
        <div class="form-group">
            <label for="password">パスワード <small class="text-muted">(8文字以上)</small></label>
            <input
                type="password"
                id="password"
                name="password"
                class="form-control <?php echo !empty($errors['password']) ? 'is-invalid' : ''; ?>"
                autocomplete="new-password"
                required>
            <div class="invalid-feedback"><?php echo h($errors['password'] ?? ''); ?></div>
        </div>

        <!-- Confirm password -->
        <div class="form-group">
            <label for="confirm_password">パスワード確認</label>
            <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                class="form-control <?php echo !empty($errors['confirm_password']) ? 'is-invalid' : ''; ?>"
                autocomplete="new-password"
                required>
            <div class="invalid-feedback"><?php echo h($errors['confirm_password'] ?? ''); ?></div>
        </div>

        <div class="form-group">
            <button type="submit" class="btn btn-primary btn-block">登録</button>
        </div>

        <p class="mb-0">
            アカウントをお持ちですか？
            <a href="login.php">こちらからログイン</a>
        </p>

    </form>
</div>
</main>

<footer>
    <?php include 'footer.php'; ?>
</footer>

</body>
</html>
