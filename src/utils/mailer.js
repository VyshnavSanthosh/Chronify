import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import { mail_host, mail_port, mail_user, mail_pass } from "../config/index.js";
const transporter = nodemailer.createTransport({
    host: mail_host,
    port: parseInt(mail_port),
    secure: false, // true if port 465
    auth: {
        user: mail_user,
        pass: mail_pass
    }
});

export default transporter;
