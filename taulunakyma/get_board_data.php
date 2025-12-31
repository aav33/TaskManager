<?php
error_reporting(0);
ini_set('display_errors', 0);
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

    if ($board) {
        // --- AUTOMAATTINEN KOODIN LUONTI JOS PUUTTUU ---
        if (empty($board['code'])) {
            $newCode = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
            $updateStmt = $pdo->prepare("UPDATE boards SET code = ? WHERE id = ?");
            $updateStmt->execute([$newCode, $board_id]);
            $board['code'] = $newCode;
        }
    }

    // 2. Hae kategoriat
    $stmtCat = $pdo->prepare("SELECT * FROM categories WHERE board_id = ?");
    $stmtCat->execute([$board_id]);
    $categories = $stmtCat->fetchAll(PDO::FETCH_ASSOC);

    // 3. Hae tehtävät
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