import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import googleSignup from "../controllers/auth.controller.js";
import dotenv from "dotenv";
import {User} from "../models/user.model.js";  // Import the User model

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLINT_SECRETE, // Fix typo in CLIENT_SECRET
      callbackURL: "http://localhost:6543/api/auth/google/callback", 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await googleSignup(profile, done);
        return done(null, user);
      } catch (error) {
        console.error("Error during Google login:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id); // Store the user id in the session
});

passport.deserializeUser(async function(id, done) {
    try {
      const user = await User.findById(id); // Using async/await here
      done(null, user); // Handle user if found
    } catch (err) {
      done(err, null); // Handle error
    }
  });
  

export default passport;
