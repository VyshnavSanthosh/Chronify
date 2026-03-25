export default class GoogleOauthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Handle Google OAuth login
     * @param {object} profile - Google profile data from Passport
     * @returns {object} User object
     */
    async handleGoogleLogin(profile) {


        // Extract data from Google profile with multiple fallback options
        const googleId = profile.id;

        // Try to get email from various locations in the profile
        let email = null;
        if (profile.emails && profile.emails[0]) {
            email = profile.emails[0].value;
        } else if (profile._json && profile._json.email) {
            email = profile._json.email;
        }

        // Extract name information with fallbacks
        let firstName = "User";
        let lastName = " ";

        if (profile.name) {
            firstName = profile.name.givenName || firstName;
            lastName = profile.name.familyName || lastName;
        } else if (profile.displayName) {
            const parts = profile.displayName.split(' ');
            firstName = parts[0];
            lastName = parts.length > 1 ? parts.slice(1).join(' ') : " ";
        } else if (profile._json) {
            firstName = profile._json.given_name || firstName;
            lastName = profile._json.family_name || lastName;
        }



        if (!email) {
            console.error("Critical: No email found in Google profile");
            throw new Error("Email not provided by Google. Please ensure your Google account has a verified email.");
        }

        // Check if user already exists with this Google ID
        let user = await this.userRepository.findByGoogleId(googleId);

        if (user) {


            // Restrict login to 'user' role only
            if (user.role && user.role !== 'customer') {
                throw new Error(`Access denied. ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}s must use their designated login portal.`);
            }

            return user;
        }

        // User doesn't exist with this Google ID
        // Check if email exists (user signed up with email/password before)
        const existingEmailUser = await this.userRepository.findByEmail(email.toLowerCase().trim());

        if (existingEmailUser) {

            // Link Google account to existing email account
            existingEmailUser.googleId = googleId;
            existingEmailUser.isVerified = true; // Google users are verified

            await existingEmailUser.save();
            return existingEmailUser;
        }

        // Create new user with Google data
        // Sanitize name for referral code (remove spaces and special characters)
        const sanitizedNameForCode = firstName.replace(/[^a-zA-Z]/g, '') || "USER";
        const referralCode = await this.generateReferralCode(sanitizedNameForCode);

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