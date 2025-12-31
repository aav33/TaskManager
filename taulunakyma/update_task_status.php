<?php
require_once '../Tauluvalikko/db.php';
$data = json_decode(file_get_contents('php://input'), true);
if (isset($data['task_id'])) {
    $stmt = $pdo->prepare("UPDATE tasks SET is_completed = ? WHERE id = ?");
    $success = $stmt->execute([$data['is_done'], $data['task_id']]);
    echo json_encode(['success' => $success]);
}
?>