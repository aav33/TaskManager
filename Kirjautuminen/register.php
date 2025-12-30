<?php

session_start();

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"));
$email = $data->email ?? "";
$password = $data->password ?? "";
$code = $data->code ?? "";

if (!$email || !$password || !$code) {
    echo json_encode(["ok" => false, "message" => "Puuttuvat tiedot"]);
    exit;
}

// Koodi tarkistus
$codeFile = __DIR__ . "/temp_codes/$email.txt";
if (!file_exists($codeFile)) {
    echo json_encode(["ok" => false, "message" => "Koodi ei löytynyt"]);
    exit;
}

$correct = trim(file_get_contents($codeFile));
if ($code != $correct) {
    echo json_encode(["ok" => false, "message" => "Koodi virheellinen"]);
    exit;
}

unlink($codeFile);

// MySQL yhteys
$conn = new mysqli("localhost", "root", "", "taskmanager");
if ($conn->connect_error) {
    echo json_encode(["ok" => false, "message" => $conn->connect_error]);
    exit;
}

// Tarkista onko sähköposti jo käytössä (varmuuden vuoksi)
$stmtCheck = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmtCheck->bind_param("s", $email);
$stmtCheck->execute();
$stmtCheck->store_result();
if($stmtCheck->num_rows > 0){
    echo json_encode(["ok" => false, "message" => "email_used"]);
    exit;
}

// Lisää käyttäjä tietokantaan
$hashed = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
$stmt->bind_param("ss", $email, $hashed);

if ($stmt->execute()) {
    echo json_encode(["ok" => true]);
} else {
    echo json_encode(["ok" => false, "message" => "Rekisteröinti epäonnistui"]);
}
