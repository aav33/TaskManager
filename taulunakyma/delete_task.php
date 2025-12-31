<?php
// Estetään PHP-virheiden tulostuminen JSON-datan sekaan
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');

try {
    require_once '../tauluvalikko/db.php';

    // Luetaan JavaScriptin lähettämä JSON
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['task_id'])) {
        throw new Exception('Tehtävän ID puuttuu');
    }

    $taskId = $data['task_id'];

    // Suoritetaan poisto
    $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
    $success = $stmt->execute([$taskId]);

    if ($success) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Poisto epäonnistui tietokannassa']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
exit;