require("dotenv").config();
const mailer = require("../src/utils/mailer");

mailer.sendMail({
    from: process.env.MAIL_USER,
    to: "vyshnavcyclist@gmail.com",
    subject: "SMTP Test",
    text: "If you received this mail, SMTP is working correctly!"
})
.then(() => console.log("Mail sent successfully"))
.catch(err => console.error("Error:", err));
