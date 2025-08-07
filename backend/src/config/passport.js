const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/userModel");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

require("dotenv").config();
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } =
  process.env;

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (user_id, done) => {
  try {
    const user = await User.findOne({
      where: { user_id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.info(`START: Attempting to log in a user with Google`);
        const existingUser = await User.findOne({
          where: {
            email: profile.emails[0].value,
          },
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        const names = profile.displayName.split(" ");
        const first_name = names[0];
        const last_name = names.length > 1 ? names[names.length - 1] : "";

        const timestamp = new Date().toISOString();

        //Create new User with google data
        const user_id = uuidv4();
        const newUser = await User.create({
          user_id,
          first_name,
          last_name,
          business_name: "", // Will need to be set later
          email: profile.emails[0].value,
          email_verified: true, // Google has verified this email
          phone_number: "", // Will need to be set later
          password_hash: "", // No password for social login
          google_id: profile.id,
          profile_photo:
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null,
          created_at: timestamp,
          updated_at: timestamp,
          account_type: "google", // Set account type to google
        });
        logger.info(`END: Successfully logged in user with Google`);
        done(null, newUser);
      } catch (error) {
        logger.error(
          `END: Error logging in user with Google: ${error.message}\nStack trace: ${error.stack}`
        );
        done(error, null);
      }
    }
  )
);

module.exports = passport;