<?php
// 1. Estetään kaikkien ylimääräisten varoitusten tulostus, jotka rikkovat JSON-muodon
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once '../Tauluvalikko/db.php';
header('Content-Type: application/json');

// 2. Luetaan syöte
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Alustetaan vastausmuuttuja
$response = ['success' => false];

if (isset($data['category_id'])) {
    try {
        $pdo->beginTransaction();

        // Poistetaan tehtävät
        $stmt1 = $pdo->prepare("DELETE FROM tasks WHERE category_id = ?");
        $stmt1->execute([$data['category_id']]);

        // Poistetaan kategoria
        $stmt2 = $pdo->prepare("DELETE FROM categories WHERE id = ?");
        $stmt2->execute([$data['category_id']]);

        $pdo->commit();
        $response['success'] = true;
    } catch (Exception $e) {
        $pdo->rollBack();
        $response['error'] = $e->getMessage();
    }
} else {
    $response['error'] = 'Kategorian ID puuttuu syötteestä';
}

// 3. TÄRKEÄ: Tulostetaan aina vastaus JSON-muodossa, ettei JS saa tyhjää syötettä
echo json_encode($response);
exit;
?>