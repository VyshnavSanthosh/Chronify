const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const{ jwt_google_client_id, google_client_secret, google_callback_url } = require("../config/index")

passport.use(
    new GoogleStrategy(
        {
            clientID: jwt_google_client_id,
            clientSecret: google_client_secret,
            callbackURL: google_callback_url,
            scope: ["profile", "email"]
        },
        // This callback is handled in our service layer (not here)
        // We just pass the profile data forward
        function (accessToken, refreshToken, profile, done) {
            return done(null, profile);
        }
    )
);

// Serialize user for session (required by passport)
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;