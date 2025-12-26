<?php
header("Content-Type: application/json");

require __DIR__ . "/PHPMailer/PHPMailer.php";
require __DIR__ . "/PHPMailer/SMTP.php";
require __DIR__ . "/PHPMailer/Exception.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// JSON ottaa tiedot
$data = json_decode(file_get_contents("php://input"));
$email = $data->email ?? "";

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["ok" => false, "message" => "Virheellinen sähköposti"]);
    exit;
}

// MySQL yhteys
$conn = new mysqli("localhost", "root", "", "taskmanager");
if ($conn->connect_error) {
    echo json_encode(["ok" => false, "message" => $conn->connect_error]);
    exit;
}

// Tarkista onko sähköposti jo käytössä
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
if($stmt->num_rows > 0){
    echo json_encode(["message" => "email_used"]); // Tässä Fince JS käsittelee
    exit;
}

// Luo random vahvistuskoodi
$code = rand(100000, 999999);

// Tallenna väliaikaisesti
$dir = __DIR__ . "/temp_codes";
if (!is_dir($dir)) mkdir($dir);
file_put_contents("$dir/$email.txt", $code);

// Lähetä sähköposti PHPMailerillä
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = "smtp.gmail.com";
    $mail->SMTPAuth = true;
    $mail->Username = "eduko11taskmanager@gmail.com";
    $mail->Password = "wkqdhcuugpttzzoq"; 
    $mail->SMTPSecure = "tls";
    $mail->Port = 587;

    $mail->setFrom("eduko11taskmanager@gmail.com", "Task Manager");
    $mail->addAddress($email);

    $mail->Subject = "Vahvistuskoodisi";
    $mail->Body    = "Vahvistuskoodisi: $code";

    $mail->send();

    echo json_encode(["ok" => true]);
} catch (Exception $e) {
    echo json_encode(["ok" => false, "message" => $e->getMessage()]);
}
