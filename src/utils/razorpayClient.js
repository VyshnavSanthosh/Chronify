import Razorpay from "razorpay";
import { razorpay_secret, razorpay_key } from "../config/index.js";
const razorpayClient = new Razorpay({
    key_id: razorpay_key,
    key_secret: razorpay_secret
});

export default razorpayClient;
