<?php
require_once '../Tauluvalikko/db.php';
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['name']) && isset($data['board_id'])) {
    $stmt = $pdo->prepare("INSERT INTO categories (board_id, name) VALUES (?, ?)");
    $success = $stmt->execute([$data['board_id'], $data['name']]);
    echo json_encode(['success' => $success, 'id' => $pdo->lastInsertId()]);
}
?>