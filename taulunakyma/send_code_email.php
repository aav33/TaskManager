<?php
// Käytetään PHPMaileria, koska tavallinen mail() ei toimi paikallisesti
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// --- MUUTA NÄMÄ POLUT oikeiksi (missä PHPMailer-kansiosi sijaitsee) ---
require '../kirjautuminen/PHPMailer/PHPMailer.php';
require '../kirjautuminen/PHPMailer/SMTP.php';
require '../kirjautuminen/PHPMailer/Exception.php'; // Vain virheiden käsittelyyn

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['email']) && isset($data['code'])) {
    $mail = new PHPMailer(true);

    try {
        // --- PALVELIMEN ASETUKSET (Esimerkkinä Gmail) ---
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'eduko11taskmanager@gmail.com'; // Gmail-osoitteesi
        $mail->Password   = 'lboztsbphqpwfxjd';        // Gmailin sovellussalasana
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->CharSet    = 'UTF-8';

        // --- VASTAANOTTAJA ---
        $mail->setFrom('eduko11taskmanager@gmail.com', 'Task Manager');
        $mail->addAddress($data['email']);

        // --- SISÄLTÖ (HTML) ---
        $mail->isHTML(true);
        $mail->Subject = 'Sinut on kutsuttu Task Manager -tauluun!';
        
        $code = $data['code'];
        $mail->Body = "
        <div style='font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 8px;'>
            <h2 style='color: #6366f1;'>Task Manager</h2>
            <p>Hei! Kaverisi on jakanut kanssasi tehtävätaulun.</p>
            <p>Voit liittyä tauluun käyttämällä tätä koodia:</p>
            <div style='background: #f1f5f9; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; border: 1px dashed #6366f1;'>
                $code
            </div>
            <p style='font-size: 12px; color: #666; margin-top: 20px;'>Tämä on automaattinen viesti.</p>
        </div>";

        $mail->send();
        echo json_encode(['success' => true]);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => "Virhe: {$mail->ErrorInfo}"]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Tiedot puuttuvat']);
}