<?php
/**
 * login.php
 * Handles user authentication (GET = show form, POST = process login).
 *
 * Bugs fixed from original:
 *  - Stray triple-backtick (```) fences inside HTML removed
 *  - include("header copy.php") → include("header_guest.php") (space in filename broke PHP include)
 *  - CSS path unified to css/styles.css
 *  - Logout redirects to login.php, not register.php
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
    'name'     => '',
    'password' => '',
];
$errors    = [];
$login_err = '';

// ── Handle POST ───────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    checkToken();   // CSRF guard — exits if token invalid

    // Sanitise inputs
    foreach (array_keys($datas) as $key) {
        $input = filter_input(INPUT_POST, $key, FILTER_DEFAULT);
        if ($input !== null) {
            $datas[$key] = trim($input);
        }
    }

    // Basic validation (register = false → skips confirm_password)
    $errors = validation($datas, false);

    if (empty($errors)) {
        try {
            $sql = '
                SELECT id, name, password
                FROM   users
                WHERE  name = :name
                LIMIT  1
            ';

            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':name', $datas['name'], PDO::PARAM_STR);
            $stmt->execute();

            $row = $stmt->fetch();

            if ($row && password_verify($datas['password'], $row['password'])) {

                // Regenerate session ID to prevent session-fixation attacks
                session_regenerate_id(true);

                $_SESSION['loggedin'] = true;
                $_SESSION['id']       = $row['id'];
                $_SESSION['name']     = $row['name'];

                header('Location: recipe-website.php');
                exit();

            } else {
                $login_err = 'ユーザーネームまたはパスワードが正しくありません。';
            }

        } catch (PDOException $e) {
            error_log('Login error: ' . $e->getMessage());
            $login_err = 'ログイン処理中にエラーが発生しました。しばらく後でもう一度お試しください。';
        }
    }

    // Re-generate CSRF token for next form submission
    setToken();
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ログイン — Mise en Place</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="css/styles.css">
    <style>
        /* Auth-page specific overrides */
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

    <h2>ログイン</h2>
    <p class="text-muted mb-3">ログイン情報を入力してください。</p>

    <?php if (!empty($login_err)): ?>
        <div class="alert alert-danger"><?php echo h($login_err); ?></div>
    <?php endif; ?>

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
            <label for="password">パスワード</label>
            <input
                type="password"
                id="password"
                name="password"
                class="form-control <?php echo !empty($errors['password']) ? 'is-invalid' : ''; ?>"
                autocomplete="current-password"
                required>
            <div class="invalid-feedback"><?php echo h($errors['password'] ?? ''); ?></div>
        </div>

        <div class="form-group">
            <button type="submit" class="btn btn-primary btn-block">ログイン</button>
        </div>

        <p class="mb-0">
            アカウントをお持ちではありませんか？
            <a href="register.php">こちらから会員登録</a>
        </p>

    </form>
</div>
</main>

<footer>
    <?php include 'footer.php'; ?>
</footer>

</body>
</html>
