<?php
header("Content-Type: application/json");
session_start();

// Tarkista, onko käyttäjä kirjautunut
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Et ole kirjautunut sisään"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$title = trim($data['title'] ?? '');
$visibility = $data['visibility'] ?? 'private';
$owner_id = $_SESSION['user_id'];

if (!$title) {
    echo json_encode(["error" => "Anna taululle nimi"]);
    exit;
}

// Yhdistä tietokantaan
$conn = new mysqli("localhost", "root", "", "taskmanager");
if ($conn->connect_error) {
    echo json_encode(["error" => "Tietokantavirhe: " . $conn->connect_error]);
    exit;
}

// Lisää taulu tietokantaan
$stmt = $conn->prepare("INSERT INTO boards (owner_id, user_id, title, visibility, created_at) VALUES (?, ?, ?, ?, NOW())");
$stmt->bind_param("iiss", $owner_id, $owner_id, $title, $visibility);

if (!$stmt->execute()) {
    echo json_encode(["error" => "Taulun luonti epäonnistui: " . $stmt->error]);
    exit;
}

$board_id = $stmt->insert_id;
$code = null;

// Jos taulu on julkinen, luodaan jakokoodi
if ($visibility === 'public') {
    $code = substr(md5(uniqid()), 0, 6);
    $stmt2 = $conn->prepare("INSERT INTO board_share_codes (board_id, code, Expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))");
    $stmt2->bind_param("is", $board_id, $code);
    $stmt2->execute();
}

echo json_encode([
    "success" => true,
    "board_id" => $board_id,
    "code" => $code
]);
