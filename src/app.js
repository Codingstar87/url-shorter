import express from "express";
import cookieParser from "cookie-parser";
import passPort from "./utils/passport.js";
import session from "express-session";

const app = express();

app.use(cookieParser());
app.use(express.json());

// Set up session before initializing Passport
app.use(session({
  secret: 'Abhijit', 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if you're using HTTPS
}));

// Initialize Passport and restore session
app.use(passPort.initialize());
app.use(passPort.session());

import authRoutes from "./routes/auth.routes.js";
app.use("/api/auth", authRoutes);

import urlRoutes from "./routes/url.routes.js";
app.use("/api", urlRoutes);

import analyticsRoutes from "./routes/analytics.routes.js";
app.use("/api", analyticsRoutes);

export default app;
