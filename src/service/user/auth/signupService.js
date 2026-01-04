
const {hashString, compareString} = require('../../../utils/bcrypt');
module.exports = class UserAuthService {
    constructor(userRepository) {
        this.userRepository = userRepository //repo dependency injection
    }

    async register(userData){  // user data comes from controller
        const{
            firstName,
            lastName,
            email,
            phone,
            password,
            referralCode
        } = userData

        const normalizedEmail = email.toLowerCase().trim();
        // check user already exists
        const existingUser = await this.userRepository.findByEmail(normalizedEmail)

        if (existingUser && existingUser.isVerified) {
            throw new Error("Email already registered");
        }

        if (existingUser && !existingUser.isVerified) {
            await this.userRepository.deleteById(existingUser._id);
        }
        
        // hash password
        const hashedPassword = await hashString(password);

        // referral code 
        const generatedReferralCode = await this.generateReferralCode(firstName);

        let referredByUserId = null;

        if (referralCode) {
            const referUser = await this.userRepository.findByReferralCode(referralCode)

            if (!referUser) {
                throw new Error("Invalid referral code");
            }
            referredByUserId = referUser._id;
        }
        // create user object
        const newUserData = {
            firstName: firstName,
            lastName: lastName,
            email: normalizedEmail,
            phone: phone,
            passwordHash: hashedPassword,
            referralCode: generatedReferralCode,
            referredBy: referredByUserId
        }

        // save user
        try {
            const savedUser = await this.userRepository.createUser(newUserData);

            // sanitize
            let userObj = typeof savedUser.toObject === "function"? savedUser.toObject(): { ...savedUser }; 

            delete userObj.passwordHash;
            return userObj;

        } catch (err) {
            throw err; // let controller handle messaging
        }

    
    }

    
    async generateReferralCode(name){
        let code;
        let codeExits = true;
        while(codeExits){
            const random = Math.floor(Math.random() * 9000) + 1000;
            code = `${name.slice(0,4).toUpperCase()}${random}`

            codeExits = await this.userRepository.findByReferralCode(code)
        }
        return code;
    }
}