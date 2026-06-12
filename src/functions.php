<?php
/**
 * functions.php
 * Shared utility functions used across the application.
 */

/**
 * Escape a value for safe HTML output.
 * Always call this before echoing user-supplied data.
 *
 * @param  string $str Raw string
 * @return string      HTML-safe string
 */
function h(string $str): string {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

/**
 * Generate a CSRF token and store it in the session.
 * Call on GET requests before rendering a form.
 */
function setToken(): void {
    $_SESSION['token'] = bin2hex(random_bytes(32));
}

/**
 * Verify the CSRF token submitted with a POST form.
 * Terminates the script with a 403 if the token is missing or wrong.
 */
function checkToken(): void {
    if (
        empty($_SESSION['token'])  ||
        empty($_POST['token'])     ||
        !hash_equals($_SESSION['token'], $_POST['token'])  // timing-safe comparison
    ) {
        http_response_code(403);
        exit('不正なリクエストです (Invalid CSRF token)');
    }
    // Rotate token after each use to prevent replay attacks
    unset($_SESSION['token']);
}

/**
 * Validate user registration / login data.
 *
 * @param  array $data     Associative array with keys: name, password, confirm_password
 * @param  bool  $register true = registration (validates confirm_password), false = login
 * @return array           Associative array of error messages keyed by field name
 */
function validation(array $data, bool $register = true): array {
    $errors = [];

    // ── Username ──────────────────────────────────────────
    if (empty($data['name'])) {
        $errors['name'] = 'ユーザー名を入力してください';
    } elseif (mb_strlen($data['name']) > 100) {
        $errors['name'] = 'ユーザー名は100文字以内で入力してください';
    }

    // ── Password ─────────────────────────────────────────
    if (empty($data['password'])) {
        $errors['password'] = 'パスワードを入力してください';
    } elseif ($register && mb_strlen($data['password']) < 8) {
        $errors['password'] = 'パスワードは8文字以上で入力してください';
    }

    // ── Confirm password (registration only) ─────────────
    if ($register) {
        if (empty($data['confirm_password'])) {
            $errors['confirm_password'] = '確認用パスワードを入力してください';
        } elseif (
            !empty($data['password']) &&
            $data['password'] !== $data['confirm_password']
        ) {
            $errors['confirm_password'] = 'パスワードが一致しません';
        }
    }

    return $errors;
}
