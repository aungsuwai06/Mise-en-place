<?php
/**
 * db_connect.php
 * Works in both environments:
 *   - Railway: reads MYSQL* env vars injected by the Railway MySQL plugin
 *   - Local Docker: falls back to hardcoded values
 */

$host     = getenv('MYSQLHOST')     ?: 'mysql';
$dbname   = getenv('MYSQLDATABASE') ?: 'user_login';
$user     = getenv('MYSQLUSER')     ?: 'root';
$password = getenv('MYSQLPASSWORD') ?: 'root';
$port     = getenv('MYSQLPORT')     ?: '3306';

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    error_log('DB connection failed: ' . $e->getMessage());
    http_response_code(503);
    die('データベース接続エラーが発生しました。しばらく後でもう一度お試しください。');
}
