module.exports = class GoogleOauthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Handle Google OAuth login
     * @param {object} profile - Google profile data from Passport
     * @returns {object} User object
     */
    async handleGoogleLogin(profile) {
        // Extract data from Google profile
        const googleId = profile.id;
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const firstName = profile.name && profile.name.givenName ? profile.name.givenName : "User";
        const lastName = profile.name && profile.name.familyName ? profile.name.familyName : "";

        if (!email) {
            throw new Error("Email not provided by Google");
        }

        // Check if user already exists with this Google ID
        let user = await this.userRepository.findByGoogleId(googleId);

        if (user) {
            // User exists, return existing user
            return user;
        }

        // User doesn't exist with this Google ID
        // Check if email exists (user signed up with email/password before)
        const existingEmailUser = await this.userRepository.findByEmail(email);

        if (existingEmailUser) {
            // Link Google account to existing email account
            existingEmailUser.googleId = googleId;
            existingEmailUser.isVerified = true; // Google users are verified
            
            await existingEmailUser.save();
            return existingEmailUser;
        }

        // Create new user with Google data
        const referralCode = await this.generateReferralCode(firstName);

        const newUserData = {
            firstName: firstName,
            lastName: lastName,
            email: email.toLowerCase().trim(),
            googleId: googleId,
            authProvider: "google",
            isVerified: true, // Google users are pre-verified
            referralCode: referralCode
        };

        const newUser = await this.userRepository.createGoogleUser(newUserData);
        
        return newUser;
    }

    /**
     * Generate unique referral code (same logic as signup)

     */
    async generateReferralCode(name) {
        let code;
        let codeExists = true;
        
        while (codeExists) {
            const random = Math.floor(Math.random() * 9000) + 1000;
            code = `${name.slice(0, 4).toUpperCase()}${random}`;
            codeExists = await this.userRepository.findByReferralCode(code);
        }
        
        return code;
    }
}