<?php
/**
 * header.php
 * Navigation bar shown to authenticated users.
 * Requires: $_SESSION['name'] to be set.
 */
?>
<div class="logo">
    <a href="recipe-website.php">Mise <span>en Place</span></a>
</div>
<div class="loggedSession">
    ようこそ、<?php echo h($_SESSION['name'] ?? 'Guest'); ?>
</div>
<div class="logOut">
    <a href="logout.php">ログアウトはこちら</a>
</div>
