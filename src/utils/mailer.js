const nodemailer = require("nodemailer");
require('dotenv').config();
const { mail_host, mail_port, mail_user, mail_pass } = require("../config/index")
const transporter = nodemailer.createTransport({
    host: mail_host,
    port: parseInt(mail_port),
    secure: false, // true if port 465
    auth: {
        user: mail_user,
        pass: mail_pass
    }
});

module.exports = transporter;
