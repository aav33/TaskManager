<?php
require_once '../Tauluvalikko/db.php';
header('Content-Type: application/json');

// Vastaanotetaan JSON-data JavaScriptiltä
$data = json_decode(file_get_contents('php://input'), true);

// Tarkistetaan, että tarvittavat tiedot löytyvät (title ja category_id)
if (isset($data['task_text']) && isset($data['category_id'])) {
    $title = $data['task_text'];
    $category_id = $data['category_id'];

    try {
        // Käytetään sarakkeita: category_id, title, is_done (arvo 0 = tekemätön)
        $stmt = $pdo->prepare("INSERT INTO tasks (category_id, title, is_done) VALUES (?, ?, 0)");
        $stmt->execute([$category_id, $title]);
        
        // Palautetaan uuden tehtävän ID, jotta JS voi käyttää sitä esim. poistamiseen
        echo json_encode([
            'success' => true, 
            'id' => $pdo->lastInsertId()
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Puuttuvia tietoja: tarvitaan teksti ja kategorian ID']);
}
?>