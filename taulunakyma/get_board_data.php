<?php
require_once '../Tauluvalikko/db.php';
header('Content-Type: application/json');

$board_id = $_GET['id'] ?? null;

if (!$board_id) {
    echo json_encode(['success' => false, 'error' => 'Board ID puuttuu']);
    exit;
}

try {
    // 1. Hae taulun tiedot
    $stmtBoard = $pdo->prepare("SELECT * FROM boards WHERE id = ?");
    $stmtBoard->execute([$board_id]);
    $board = $stmtBoard->fetch(PDO::FETCH_ASSOC);

    // 2. Hae kategoriat
    $stmtCat = $pdo->prepare("SELECT * FROM categories WHERE board_id = ?");
    $stmtCat->execute([$board_id]);
    $categories = $stmtCat->fetchAll(PDO::FETCH_ASSOC);

    // 3. Hae tehtävät kategorioiden kautta (Tämä korjaa aiemman virheen)
    $stmtTasks = $pdo->prepare("
        SELECT t.* FROM tasks t
        JOIN categories c ON t.category_id = c.id
        WHERE c.board_id = ?
    ");
    $stmtTasks->execute([$board_id]);
    $tasks = $stmtTasks->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'board' => $board,
        'categories' => $categories,
        'tasks' => $tasks
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>