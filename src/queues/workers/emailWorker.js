const { Worker } = require("bullmq");
const redis = require("../../utils/redis");
const mailer = require("../../utils/mailer");
const {mail_user} = require("../../config/index.js")
console.log("Worker started and listening...");

new Worker(
    "emailQueue",
    async (job) => {
        console.log("Job received:", job.data);

        const { email, otp } = job.data;

        try {
            // Different subject based on job name
            let subject = "Your OTP Code";
            let text = `Your OTP is: ${otp}`;

            if (job.name === "forgot-password-otp") {
                subject = "Password Reset OTP";
                text = `Your password reset OTP is: ${otp}\n\nThis OTP will expire in 5 minutes.\n\nIf you didn't request this, please ignore this email.`;
            } else if (job.name === "otp") {
                subject = "Email Verification OTP";
                text = `Your email verification OTP is: ${otp}\n\nThis OTP will expire in 2 minutes.`;
            }

            await mailer.sendMail({
                from: mail_user,
                to: email,
                subject: subject,
                text: text
            });

            console.log(`📩 OTP sent to ${email}`);
        } catch (err) {
            console.error("❌ Failed sending OTP email:", err && err.message ? err.message : err);
        }
    },
    {
        connection: redis
    }
);