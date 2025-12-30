<?php
$host = "localhost";
$dbname = "taskmanager";
$user = "root"; // oma db user
$pass = ""; // oma db password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Tietokantayhteys epäonnistui: " . $e->getMessage());
}
?>

