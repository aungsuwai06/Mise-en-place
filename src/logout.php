<?php
/**
 * logout.php
 * Destroys the user session and redirects to the login page.
 *
 * Bug fixed: original redirected to register.php after logout.
 * Correct behaviour is to send the user back to login.php.
 */

session_start();

// Wipe all session data
$_SESSION = [];

// Destroy the session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

session_destroy();

// Send user to login, not register
header('Location: login.php');
exit();
