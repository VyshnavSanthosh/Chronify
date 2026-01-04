require("dotenv").config();
const mongoose = require("mongoose");
const UserAuthService = require("../src/service/user/userAuth");
const UserRepository = require("../src/repository/user");

async function testSignup() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const userRepository = new UserRepository();
    const userAuthService = new UserAuthService(userRepository);

    try {
        const user = await userAuthService.register({
            firstName: "Test",
            lastName: "User",
            email: "testuser@gmail.com",
            phone: "9999999999",
            password: "Test12345",
            referralCode: ""
        });

        console.log("✔ User created:", user);
    } catch (err) {
        console.error("❌ Signup failed:", err.message);
    }

    process.exit(0);
}

testSignup();
