<?php
$mail = $_POST['andrewMailBox'];
echo $mail;
$subject = "New feedback";
$text = $_POST['otherBox'];

$to = "isaaclimdc@gmail.com";
$message = "You received  a mail from" .$mail;
$message .= "Text of the message : " .$text;

if(mail($to, $subject,$message)){
echo "mail successful send";
}
else{
echo "there’s some errors to send the mail, verify your server options";
}
?>