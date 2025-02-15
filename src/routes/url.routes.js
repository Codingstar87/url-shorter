import express from "express"; 
import {shortenUrl , redirect_url} from "../controllers/url.controller.js";
import rateLimit from "express-rate-limit";
import protectRoute from "../middleware/protectRourte.js";


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: "Too many requests, please try again later.",
});


const router = express.Router();


router.post("/shorten", limiter, shortenUrl); 


router.get("/shorten/:alias",protectRoute, redirect_url)

// Export the router
export default router;

