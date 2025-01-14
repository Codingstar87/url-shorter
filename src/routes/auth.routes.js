import { Router } from "express";
import passport from "../utils/passport.js";
import generateToken from "../utils/utils.js";

const routes = Router();

routes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

routes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/auth/failed" }),
  async (req, res) => {
    try {
      const user = req.user;
      // console.log(user);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication failed",
        });
      }

      // Debugging: log the user object to ensure it's populated
    //   console.log("Authenticated user:", user);

    const token = generateToken(user._id,res)
    // console.log("Token" ,token);

      res
        .setHeader("authorization", user.email) 
        .status(200)
        .json({
          success: true,
          message: "Successfully logged in with Google",
          user: {
            email: user.email,
            name: user.userName, 
          },
          token
        });
        
        

      // Debugging: Check headers
      console.log("Response Headers:", res.getHeaders());
    } catch (error) {
      console.error("Error during Google login callback:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
);

routes.get("/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Failed to login with Google",
  });
});

routes.get("/success", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Successfully logged in with Google",
  });
});

export default routes;
