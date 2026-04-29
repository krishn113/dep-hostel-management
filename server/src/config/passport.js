import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      
      // Ensure only IIT Ropar emails can log in
      if (!email.endsWith("@iitrpr.ac.in")) {
        return done(null, false, { message: "Invalid domain" });
      }

      const user = await User.findOne({ email });
      
      if (user) {
        return done(null, user); // User exists, proceed to callback
      } else {
        return done(null, false, { message: "User not registered in system." });
      }
    } catch (err) {
      return done(err, null);
    }
  }
));