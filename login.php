<?php
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"));
$email = $data->email ?? "";
$password = $data->password ?? "";

$conn = new mysqli("localhost", "root", "nakkikastike123", "taskmanager");

$stmt = $conn->prepare("SELECT password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows == 0) {
    echo json_encode(["ok" => false, "message" => "Käyttäjää ei löydy"]);
    exit;
}

$row = $res->fetch_assoc();

if (password_verify($password, $row["password"])) {
    echo json_encode(["ok" => true]);
} else {
    echo json_encode(["ok" => false, "message" => "Salasana on väärin"]);
}
?>