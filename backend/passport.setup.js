const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./src/models/User.model.js"); // <-- This path is now correct

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback", // Must match Google Console
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, log them in
          return done(null, user);
        } else {
          // User doesn't exist, create a new one
          const newUser = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            fullName: profile.displayName,
            // Use email prefix as username, adding random chars for uniqueness
            username: `${profile.emails[0].value.split("@")[0]}_${Math.random().toString(36).substring(2, 6)}`,
            // Create a placeholder password (it won't be used for Google login)
            password: `google_oauth_password_${profile.id}`,
          });
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);