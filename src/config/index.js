import dotenv from "dotenv";
dotenv.config();

export const port = process.env.PORT;
export const mongoUri = process.env.MONGO_URI;
export const session_secret = process.env.SESSION_SECRET;
export const redis_host = process.env.REDIS_HOST;
export const redis_port = process.env.REDIS_PORT;
export const mail_user = process.env.MAIL_USER;
export const mail_pass = process.env.MAIL_PASS;
export const mail_host = process.env.MAIL_HOST;
export const mail_port = process.env.MAIL_PORT;
export const jwt_access_secret = process.env.JWT_ACCESS_SECRET;
export const jwt_refresh_secret = process.env.JWT_REFRESH_SECRET;
export const jwt_access_expiry = process.env.JWT_ACCESS_EXPIRY;
export const jwt_refresh_expiry = process.env.JWT_REFRESH_EXPIRY;
export const jwt_google_client_id = process.env.GOOGLE_CLIENT_ID;
export const google_client_secret = process.env.GOOGLE_CLIENT_SECRET;
export const google_callback_url = process.env.GOOGLE_CALLBACK_URL;
export const cloudinary_name = process.env.CLOUDINARY_NAME;
export const cloudinary_api_key = process.env.CLOUDINARY_API_KEY;
export const cloudinary_api_secret = process.env.CLOUDINARY_API_SECRET;
export const razorpay_key = process.env.RAZORPAY_KEY_ID
export const razorpay_secret = process.env.RAZORPAY_KEY_SECRET
