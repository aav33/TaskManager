<?php
header("Content-Type: application/json");
session_start();

$data = json_decode(file_get_contents("php://input"));
$email = $data->email ?? "";
$password = $data->password ?? "";

$conn = new mysqli("localhost", "root", "", "taskmanager");

$stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows == 0) {
    echo json_encode(["ok" => false, "message" => "Käyttäjää ei löydy"]);
    exit;
}

$row = $res->fetch_assoc();

if (password_verify($password, $row["password"])) {
    // TÄRKEÄ: tallenna käyttäjä sessioniin
    $_SESSION['user_id'] = $row["id"];
    $_SESSION['user_email'] = $email;

    echo json_encode(["ok" => true]);
} else {
    echo json_encode(["ok" => false, "message" => "Salasana on väärin"]);
}
