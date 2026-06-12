<?php
/**
 * db_connect.php
 * Creates a PDO connection to MySQL.
 * Include this file wherever DB access is needed.
 */

$host     = 'mysql';        // Docker service name (resolves inside the network)
$dbname   = 'user_login';
$user     = 'root';
$password = 'root';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4", // utf8mb4 for full Unicode
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,  // throw exceptions on errors
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,        // arrays by default
            PDO::ATTR_EMULATE_PREPARES   => false,                   // use real prepared statements
        ]
    );
} catch (PDOException $e) {
    // In production, log the real error and show a generic message to the user
    error_log('DB connection failed: ' . $e->getMessage());
    http_response_code(503);
    die('データベース接続エラーが発生しました。しばらく後でもう一度お試しください。');
}
