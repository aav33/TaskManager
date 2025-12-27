<?php
session_start();
if (!isset($_SESSION['user_id'])) exit;

include 'db.php';
$user_id = $_SESSION['user_id'];

$stmt = $pdo->prepare("SELECT b.id, b.title, b.visibility, sc.code 
                       FROM boards b 
                       LEFT JOIN board_share_codes sc ON b.id = sc.board_id
                       WHERE b.owner_id = ?");
$stmt->execute([$user_id]);
$boards = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($boards);
?>
